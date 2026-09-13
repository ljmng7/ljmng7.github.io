import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import photoData from "../data/photo.json";
import { useLanguage } from "./LanguageProvider";
import "./photography-gallery.css";

type Photo = Omit<(typeof photoData)[number], "location"> & {
  location: { latitude: number; longitude: number; name?: string } | null;
};
const photos: Photo[] = photoData;
const PHOTO_BASE = "/photos/display";

const ropeY = (x: number) => 52 + Math.sin(x * Math.PI * 4) * 30;
const AUTO_SCROLL_SPEED = 22;
const AUTO_SCROLL_RESUME_DELAY = 3000;
const SEAMLESS_BUFFER_CYCLES = 3;

export function PhotographyGallery() {
  const { language } = useLanguage();
  const zh = language === "zh";
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [selected, setSelected] = useState<Photo | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const cycle = useRef<HTMLDivElement>(null);
  const previewOpen = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const animateClose = useRef<(() => void) | null>(null);
  const closePreview = () => animateClose.current?.();
  previewOpen.current = Boolean(selected);

  useEffect(() => {
    const scroller = viewport.current;
    const firstCycle = cycle.current;
    if (!scroller || !firstCycle) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let cycleWidth = 0;
    let animationFrame = 0;
    let previousTime = 0;
    let automaticPosition = 0;
    let knownScrollLeft = 0;
    let hasCenteredCycle = false;
    let resumeFromNativePosition = false;
    // Start immediately on page load; only user-driven horizontal scrolling pauses the loop.
    let resumeAt = performance.now();

    const measure = () => {
      const nextWidth = firstCycle.getBoundingClientRect().width;
      if (!nextWidth) return;
      cycleWidth = nextWidth;
      if (!hasCenteredCycle) {
        scroller.scrollLeft = cycleWidth;
        hasCenteredCycle = true;
      }
      automaticPosition = scroller.scrollLeft;
      knownScrollLeft = scroller.scrollLeft;
    };
    const pauseAutoScroll = () => {
      resumeAt = performance.now() + AUTO_SCROLL_RESUME_DELAY;
      resumeFromNativePosition = true;
    };
    const writeAutomaticPosition = () => {
      // Safari repaints even when a fractional assignment resolves to the same native pixel.
      const nextScrollLeft = isSafari ? Math.round(automaticPosition) : automaticPosition;
      if (Math.abs(nextScrollLeft - knownScrollLeft) < .5) return;
      scroller.scrollLeft = nextScrollLeft;
      knownScrollLeft = scroller.scrollLeft;
    };
    const recenterWithinCycle = (position: number) => {
      if (!cycleWidth) return position;
      while (position < cycleWidth * .5) position += cycleWidth;
      while (position >= cycleWidth * 1.5) position -= cycleWidth;
      return position;
    };
    const handleNativeHorizontalScroll = () => {
      let nextScrollLeft = scroller.scrollLeft;
      // Native vertical page scrolling never changes this value, so it remains non-interrupting.
      if (Math.abs(nextScrollLeft - knownScrollLeft) < .5) return;
      const centeredScrollLeft = recenterWithinCycle(nextScrollLeft);
      if (centeredScrollLeft !== nextScrollLeft) {
        scroller.scrollLeft = centeredScrollLeft;
        nextScrollLeft = centeredScrollLeft;
      }
      knownScrollLeft = nextScrollLeft;
      automaticPosition = nextScrollLeft;
      pauseAutoScroll();
    };
    const resizeObserver = new ResizeObserver(measure);

    measure();
    resizeObserver.observe(scroller);
    resizeObserver.observe(firstCycle);
    scroller.addEventListener("scroll", handleNativeHorizontalScroll, { passive: true });
    document.addEventListener("visibilitychange", pauseAutoScroll);

    const wrapAtCycleBoundary = () => {
      automaticPosition = recenterWithinCycle(automaticPosition);
    };

    const tick = (now: number) => {
      const elapsed = previousTime ? Math.min(now - previousTime, 50) / 1000 : 0;
      previousTime = now;
      if (!previewOpen.current && !reducedMotion.matches && !document.hidden && cycleWidth && now >= resumeAt) {
        if (resumeFromNativePosition) {
          automaticPosition = scroller.scrollLeft;
          knownScrollLeft = automaticPosition;
          resumeFromNativePosition = false;
        }
        automaticPosition += AUTO_SCROLL_SPEED * elapsed;
        wrapAtCycleBoundary();
        writeAutomaticPosition();
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      scroller.removeEventListener("scroll", handleNativeHorizontalScroll);
      document.removeEventListener("visibilitychange", pauseAutoScroll);
    };
  }, []);

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

  if (!photos.length) return null;
  const path = Array.from({ length: 121 }, (_, i) => `${i ? "L" : "M"}${i / 120 * 1000},${ropeY(i / 120)}`).join(" ");
  return <section data-keyboard={keyboardFocus} onPointerDownCapture={() => setKeyboardFocus(false)} onKeyDownCapture={(event) => { if (event.key === "Tab") setKeyboardFocus(true); }} className="page-photography" id="photography" lang={zh ? "zh-CN" : "en"} aria-labelledby="photography-title">
    <div className="photo-heading">
      <h2 id="photography-title" className="page-contact-title">{zh ? "光影之间" : "Through my lens"}</h2>
    </div>
    <div className="photo-viewport" ref={viewport} tabIndex={0} role="region" aria-label={zh ? "摄影作品，横向滚动浏览" : "Photography, scroll horizontally to browse"}>
      <div className="photo-track">
        {Array.from({ length: SEAMLESS_BUFFER_CYCLES }, (_, copy) => <div className="photo-cycle" ref={copy === 0 ? cycle : undefined} key={copy} aria-hidden={copy > 0 || undefined}>
          <svg className="photo-rope" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><path d={path} /></svg>
          {photos.map((photo) => {
            const photoIndex = photos.indexOf(photo);
            return <figure className={`photo-print ${photo.width > photo.height ? "photo-print--landscape" : "photo-print--portrait"}`} key={`${copy}:${photo.filename}`} style={{ "--hang-y": `${ropeY((photoIndex + .5) / photos.length) + 10}px`, "--tilt": `${[-4, 3, -2, 5, -3, 2, -5, 3][photoIndex % 8]}deg` } as CSSProperties}>
            <div className="photo-paper">
              <span className="photo-clip" aria-hidden="true" />
              <button className="photo-open" type="button" tabIndex={copy ? -1 : undefined} aria-label={zh ? `查看大图：${photo.title[language]}` : `View photo: ${photo.title[language]}`} onClick={(event) => {
                returnFocus.current = event.currentTarget;
                setSelected(photo);
              }}>
                <img src={`${PHOTO_BASE}/${photo.filename}`} width={photo.width} height={photo.height} alt={photo.title[language]} draggable={false} loading="eager" decoding="async" />
              </button>
              <figcaption><span>{photo.title[language]}</span><span className="photo-number">{String(photoIndex + 1).padStart(2, "0")}</span></figcaption>
            </div>
          </figure>;
          })}
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
            <img className="photo-lightbox-image" src={`${PHOTO_BASE}/${selected.filename}`} width={selected.width} height={selected.height} alt={selected.title[language]} />
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
