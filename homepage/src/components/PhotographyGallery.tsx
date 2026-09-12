import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import photoData from "../data/photo.json";
import { useLanguage } from "./LanguageProvider";
import "./photography-gallery.css";

type Photo = Omit<(typeof photoData)[number], "location"> & {
  location: { latitude: number; longitude: number; name?: string } | null;
};
const photos: Photo[] = photoData;

const AUTO_SPEED = 22;
const MAX_SPEED = 700;
const RESUME_DELAY = 5000;
const ropeY = (x: number) => 52 + Math.sin(x * Math.PI * 4) * 30;

export function PhotographyGallery() {
  const { language } = useLanguage();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(3);
  const zh = language === "zh";
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [selected, setSelected] = useState<Photo | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previewOpen = useRef(false);
  const suppressClick = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const animateClose = useRef<(() => void) | null>(null);
  const closePreview = () => animateClose.current?.();

  useLayoutEffect(() => {
    if (!selected || !dialog.current) return;
    const modal = dialog.current;
    const source = returnFocus.current?.querySelector("img");
    const image = modal.querySelector<HTMLElement>(".photo-lightbox-photo")!;
    const shadow = modal.querySelector<HTMLElement>(".photo-lightbox-shadow")!;
    const shade = modal.querySelector<HTMLElement>(".photo-lightbox-shade")!;
    const details = Array.from(modal.querySelectorAll<HTMLElement>("figcaption, .photo-lightbox-close"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollRoot = document.documentElement;
    const previousOverflow = scrollRoot.style.overflow;
    const previousVisibility = source?.style.visibility ?? "";
    let closing = false, disposed = false;
    const animations: Animation[] = [];
    const animate = (element: HTMLElement, frames: Keyframe[], duration: number) => {
      const animation = element.animate(frames, { duration: reduced ? 0 : duration, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" });
      animations.push(animation);
      return animation;
    };
    const sourceTransform = () => {
      if (!source) return "none";
      const from = source.getBoundingClientRect();
      const to = image.getBoundingClientRect();
      const tilt = getComputedStyle(source.closest(".photo-print")!).getPropertyValue("--tilt").trim() || "0deg";
      return `translate(${from.x + from.width / 2 - to.x - to.width / 2}px, ${from.y + from.height / 2 - to.y - to.height / 2}px) rotate(${tilt}) scale(${source.offsetWidth / to.width}, ${source.offsetHeight / to.height})`;
    };
    scrollRoot.style.overflow = "hidden";
    modal.showModal();
    modal.focus({ preventScroll: true });
    const from = sourceTransform();
    if (source) source.style.visibility = "hidden";
    animate(image, [{ transform: reduced ? "none" : from }, { transform: "none" }], 520);
    animate(shadow, [{ opacity: 0 }, { opacity: 1 }], 520);
    animate(shade, [{ opacity: 0 }, { opacity: 1 }], 520);
    details.forEach(element => animate(element, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], 520));
    animateClose.current = () => {
      if (closing) return;
      closing = true;
      // Snapshot an interrupted entrance before cancelling it, so early dismissal stays continuous.
      const transform = getComputedStyle(image).transform;
      const shadowOpacity = getComputedStyle(shadow).opacity;
      const shadeOpacity = getComputedStyle(shade).opacity;
      const detailStates = details.map(element => ({ opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform }));
      animations.forEach(animation => animation.cancel());
      const to = sourceTransform();
      const retreat = animate(image, [{ transform }, { transform: reduced ? "none" : to }], 420);
      animate(shadow, [{ opacity: shadowOpacity }, { opacity: 0 }], 300);
      animate(shade, [{ opacity: shadeOpacity }, { opacity: 0 }], 420);
      details.forEach((element, index) => animate(element, [detailStates[index], { opacity: 0, transform: "translateY(8px)" }], 220));
      void retreat.finished.then(() => {
        if (disposed) return;
        previewOpen.current = false;
        setSelected(null);
      }).catch(() => {});
    };
    return () => {
      disposed = true;
      animateClose.current = null;
      animations.forEach(animation => animation.cancel());
      if (source) source.style.visibility = previousVisibility;
      modal.close();
      scrollRoot.style.overflow = previousOverflow;
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [selected]);
  const location = selected?.location;
  const coordinates = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
    && Math.abs(location.latitude) <= 90 && Math.abs(location.longitude) <= 180
    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : null;
  const appleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const mapHref = coordinates ? (appleDevice
    ? `https://maps.apple.com/?ll=${encodeURIComponent(coordinates)}&q=${encodeURIComponent(selected!.title[language])}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`) : undefined;

  useEffect(() => {
    const surface = viewport.current;
    const belt = track.current;
    if (!surface || !belt || !photos.length) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1, offset = 0, pending = 0, last = 0, lastInput = -Infinity;
    let pointer: number | null = null, pointerX = 0, startX = 0, startY = 0, visible = false, frame = 0;
    let axis: "horizontal" | "vertical" | null = null;
    let wheelAxis: "horizontal" | "vertical" | null = null, wheelX = 0, wheelY = 0, wheelTime = -Infinity;
    const measure = () => {
      width = (belt.firstElementChild as HTMLElement).getBoundingClientRect().width;
      setCopies(Math.max(3, Math.ceil(surface.clientWidth / width) + 2));
    };
    const resize = new ResizeObserver(measure);
    resize.observe(surface);
    measure();
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(surface);
    const input = (delta: number) => {
      lastInput = performance.now();
      // Bound the queue as well as the frame speed, so a fling cannot leave a long tail.
      if (pending * delta < 0) pending = 0;
      pending = Math.max(-140, Math.min(140, pending + delta));
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      suppressClick.current = false;
      pointer = event.pointerId;
      startX = pointerX = event.clientX;
      startY = event.clientY;
      axis = null;
    };
    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId || axis === "vertical") return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
        suppressClick.current = true;
        if (Math.abs(dy) > Math.abs(dx) * 1.4) { axis = "vertical"; return; }
        if (Math.abs(dx) < Math.abs(dy) * 1.4) return;
        axis = "horizontal";
        surface.setPointerCapture(event.pointerId);
        pending = 0;
        surface.dataset.dragging = "true";
      }
      input(pointerX - event.clientX);
      pointerX = event.clientX;
    };
    const up = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      if (axis === "horizontal") lastInput = performance.now();
      axis = null;
      delete surface.dataset.dragging;
      if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    };
    const wheel = (event: WheelEvent) => {
      const now = performance.now();
      if (now - wheelTime > 180) { wheelAxis = null; wheelX = 0; wheelY = 0; }
      wheelTime = now;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? surface.clientWidth : 1;
      const dx = (event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX) * scale;
      const dy = event.shiftKey ? 0 : event.deltaY * scale;
      if (!wheelAxis) {
        wheelX += dx; wheelY += dy;
        if (Math.max(Math.abs(wheelX), Math.abs(wheelY)) < 6) return;
        if (Math.abs(wheelY) > Math.abs(wheelX) * 1.4) wheelAxis = "vertical";
        else if (Math.abs(wheelX) > Math.abs(wheelY) * 1.4) wheelAxis = "horizontal";
        else return;
        if (wheelAxis === "horizontal") { event.preventDefault(); input(wheelX); }
        return;
      }
      if (wheelAxis === "vertical") return;
      event.preventDefault();
      if (Math.abs(dx) > .5) input(dx);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      input(event.key === "ArrowRight" ? 130 : -130);
    };
    const tick = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 0.04);
      last = now;
      if (previewOpen.current) {
        pending = 0;
        lastInput = now;
      }
      if (!previewOpen.current && visible && !document.hidden && !surface.closest("[inert]")) {
        // Exponential follow-through eases toward the hand, then settles after release.
        const eased = pending * (reduced.matches ? 1 : -Math.expm1(-dt / 0.09));
        let step = Math.max(-MAX_SPEED * dt, Math.min(MAX_SPEED * dt, eased));
        pending -= step;
        if (Math.abs(pending) < .05) pending = 0;
        if (axis !== "horizontal" && pending === 0 && now - lastInput >= RESUME_DELAY && !reduced.matches) {
          const resume = Math.min(1, (now - lastInput - RESUME_DELAY) / 650);
          step += AUTO_SPEED * (resume * resume * (3 - 2 * resume)) * dt;
        }
        offset = ((offset + step) % width + width) % width;
        belt.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    surface.addEventListener("pointerdown", down);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", up);
    surface.addEventListener("pointercancel", up);
    surface.addEventListener("lostpointercapture", up);
    surface.addEventListener("wheel", wheel, { passive: false });
    surface.addEventListener("keydown", key);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect(); observer.disconnect();
      surface.removeEventListener("pointerdown", down);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up);
      surface.removeEventListener("pointercancel", up);
      surface.removeEventListener("lostpointercapture", up);
      surface.removeEventListener("wheel", wheel);
      surface.removeEventListener("keydown", key);
    };
  }, []);

  if (!photos.length) return null;
  const path = Array.from({ length: 121 }, (_, i) => `${i ? "L" : "M"}${i / 120 * 1000},${ropeY(i / 120)}`).join(" ");
  return <section data-keyboard={keyboardFocus} onPointerDownCapture={() => setKeyboardFocus(false)} onKeyDownCapture={(event) => { if (event.key === "Tab") setKeyboardFocus(true); }} className="page-photography" id="photography" lang={zh ? "zh-CN" : "en"} aria-labelledby="photography-title">
    <div className="photo-heading">
      <h2 id="photography-title" className="page-contact-title">{zh ? "光影之间" : "Through my lens"}</h2>
    </div>
    <div className="photo-viewport" ref={viewport} tabIndex={0} role="region" aria-label={zh ? "摄影作品，使用左右方向键浏览" : "Photography, use arrow keys to browse"}>
      <div className="photo-track" ref={track}>
        {Array.from({ length: copies }, (_, copy) => <div className="photo-cycle" key={copy} aria-hidden={copy > 0 ? true : undefined}>
          <svg className="photo-rope" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><path d={path} /></svg>
          {photos.map((photo, index) => <figure className={`photo-print ${photo.width > photo.height ? "photo-print--landscape" : "photo-print--portrait"}`} key={photo.filename} style={{ "--hang-y": `${ropeY((index + .5) / photos.length) + 10}px`, "--tilt": `${[-4, 3, -2, 5, -3, 2, -5, 3][index % 8]}deg` } as CSSProperties}>
            <div className="photo-paper">
              <span className="photo-clip" aria-hidden="true" />
              <button className="photo-open" type="button" tabIndex={copy > 0 ? -1 : 0} aria-label={zh ? `查看大图：${photo.title[language]}` : `View photo: ${photo.title[language]}`} onClick={(event) => {
                if (event.detail !== 0 && suppressClick.current) return;
                returnFocus.current = event.currentTarget;
                previewOpen.current = true;
                setSelected(photo);
              }}>
                <img src={`/photos/${photo.filename}`} width={photo.width} height={photo.height} alt={photo.title[language]} draggable={false} loading="lazy" decoding="async" />
              </button>
              <figcaption><span>{photo.title[language]}</span><span className="photo-number">{String(index + 1).padStart(2, "0")}</span></figcaption>
            </div>
          </figure>)}
        </div>)}
      </div>
    </div>
    <dialog className="photo-lightbox" tabIndex={-1} ref={dialog} aria-labelledby="photo-lightbox-title" onCancel={(event) => { event.preventDefault(); closePreview(); }} onClick={(event) => { if (event.target === event.currentTarget) closePreview(); }}>
      {selected && <>
        <div className="photo-lightbox-shade" aria-hidden="true" onClick={closePreview} />
        <button className="photo-lightbox-close" type="button" onClick={closePreview} aria-label={zh ? "关闭大图" : "Close photo"}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <figure className="photo-lightbox-content">
          <div className="photo-lightbox-photo">
            <div className="photo-lightbox-shadow" aria-hidden="true" />
            <img className="photo-lightbox-image" src={`/photos/${selected.filename}`} width={selected.width} height={selected.height} alt={selected.title[language]} />
          </div>
          <figcaption>
            <h3 id="photo-lightbox-title">{selected.title[language]}</h3>
            {coordinates ? <a href={mapHref} target="_blank" rel="noopener noreferrer" aria-label={`${zh ? "在地图中查看" : "Open in Maps"}: ${coordinates}`}>{coordinates} ↗</a>
              : null}
          </figcaption>
        </figure>
      </>}
    </dialog>
  </section>;
}
