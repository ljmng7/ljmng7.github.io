import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./feature-carousel.css";
import { publicUrl } from "../lib/sitePaths";

export type FeatureSlide = {
  id: string;
  title: string;
  media?: { type: "image" | "video"; src: string; alt: string; poster?: string };
};

const PLACEHOLDERS: FeatureSlide[] = Array.from({ length: 4 }, (_, i) => ({
  id: `feature-${i + 1}`,
  title: `Feature ${String(i + 1).padStart(2, "0")}`,
}));
const SLIDE_MS = 5000;

export function FeatureCarousel({ slides = PLACEHOLDERS }: { slides?: FeatureSlide[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const elapsed = useRef(0);
  const fill = useRef<HTMLSpanElement>(null);
  const animation = useRef(0);
  const programmatic = useRef(false);
  const nativeSelection = useRef(false);
  const activeIndex = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [visit, setVisit] = useState(0);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setStarted(true);
    }, { threshold: 0.35 });
    if (viewport.current) observer.observe(viewport.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  // A new slide/replay restarts its video. Carousel pause/resume never does.
  useEffect(() => {
    elapsed.current = 0;
    if (fill.current) fill.current.style.transform = "scaleX(0)";
    videos.current.forEach((video, i) => {
      if (!video) return;
      video.pause();
      if (i === index) video.currentTime = 0;
    });
  }, [index, visit]);

  useEffect(() => {
    const video = videos.current[index];
    if (!video) return;
    if (started && visible && pageVisible && !video.ended) {
      video.muted = true;
      void video.play().catch(() => { /* Keep the poster if autoplay is unavailable. */ });
    } else if (!visible || !pageVisible) video.pause();
    // Deliberately independent of paused/finished and the five-second clock.
  }, [index, visit, started, visible, pageVisible]);

  useEffect(() => {
    if (!started || !visible || !pageVisible || paused || finished || !slides.length) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current = Math.min(SLIDE_MS, elapsed.current + now - previous);
      previous = now;
      if (fill.current) fill.current.style.transform = `scaleX(${elapsed.current / SLIDE_MS})`;
      if (elapsed.current >= SLIDE_MS) {
        if (index === slides.length - 1) setFinished(true);
        else setIndex(index + 1);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, visit, started, visible, pageVisible, paused, finished, slides.length]);

  const select = (next: number) => {
    setIndex(Math.max(0, Math.min(slides.length - 1, next)));
    setVisit(v => v + 1);
    setFinished(false);
    setStarted(true);
  };
  const selectManually = (next: number) => {
    select(next);
    setPaused(true);
  };
  const toggle = () => {
    if (finished) { select(0); setPaused(false); }
    else setPaused(value => !value);
  };
  const targetOffset = (next: number) => {
    const element = viewport.current;
    const slide = element?.querySelectorAll<HTMLElement>(".feature-carousel__slide")[next];
    if (!element || !slide) return 0;
    return slide.offsetLeft - (element.clientWidth - slide.offsetWidth) / 2;
  };

  const interruptScroll = () => {
    const element = viewport.current;
    if (!element) return;
    if (programmatic.current) {
      cancelAnimationFrame(animation.current);
      programmatic.current = false;
      element.style.scrollSnapType = "";
    }
  };

  // Touch and trackpad motion belong to the browser, including momentum and snap.
  // Only automatic / dot navigation animates scrollLeft explicitly.
  useEffect(() => {
    activeIndex.current = index;
    const element = viewport.current;
    if (!element) return;
    if (nativeSelection.current) { nativeSelection.current = false; return; }
    cancelAnimationFrame(animation.current);
    clearTimeout(settleTimer.current);
    const from = element.scrollLeft;
    const to = targetOffset(index);
    if (Math.abs(from - to) < 1) return;
    programmatic.current = true;
    element.style.scrollSnapType = "none";
    const start = performance.now();
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100;
    const tick = (now: number) => {
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      const ease = 1 - Math.pow(1 - progress, 4);
      element.scrollLeft = from + (to - from) * ease;
      if (progress < 1) animation.current = requestAnimationFrame(tick);
      else {
        element.style.scrollSnapType = "";
        // Let the final scroll event pass before accepting native input updates.
        animation.current = requestAnimationFrame(() => { programmatic.current = false; });
      }
    };
    animation.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation.current);
  }, [index, visit]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const settle = () => {
      if (programmatic.current) return;
      const cards = [...element.querySelectorAll<HTMLElement>(".feature-carousel__slide")];
      const center = element.scrollLeft + element.clientWidth / 2;
      let closest = 0;
      cards.forEach((card, i) => {
        if (Math.abs(card.offsetLeft + card.offsetWidth / 2 - center) <
            Math.abs(cards[closest].offsetLeft + cards[closest].offsetWidth / 2 - center)) closest = i;
      });
      if (closest !== activeIndex.current) {
        nativeSelection.current = true;
        activeIndex.current = closest;
        selectManually(closest);
      }
    };
    const scroll = () => {
      if (programmatic.current) return;
      setPaused(true);
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settle, 160);
    };
    const resize = new ResizeObserver(() => {
      if (programmatic.current) interruptScroll();
      element.scrollLeft = targetOffset(activeIndex.current);
    });
    resize.observe(element);
    element.addEventListener("scroll", scroll, { passive: true });
    element.addEventListener("scrollend", settle);
    return () => {
      cancelAnimationFrame(animation.current);
      clearTimeout(settleTimer.current);
      resize.disconnect();
      element.removeEventListener("scroll", scroll);
      element.removeEventListener("scrollend", settle);
    };
  }, [slides.length]);

  const needsReplay = finished;
  const icon = needsReplay ? "arrow.clockwise" : paused ? "play.fill" : "pause.fill";
  if (!slides.length) return null;

  return (
    <section className="feature-carousel" aria-label="Features" aria-roledescription="carousel"
      data-state={finished ? "finished" : paused ? "paused" : started ? "playing" : "idle"}>
      <div className="feature-carousel__viewport" ref={viewport}
        tabIndex={0} aria-label="Swipe or use arrow keys to change features"
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            selectManually(index + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onPointerDown={interruptScroll}
        onWheel={event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) interruptScroll(); }}>
        <div className="feature-carousel__track">
          {slides.map((slide, i) => (
            <article key={slide.id} className="feature-carousel__slide" aria-hidden={i !== index}
              aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`}>
              <h2>{slide.title}</h2>
              <div className={`feature-carousel__media feature-carousel__media--${i % 4}`}>
                {slide.media?.type === "video" ? (
                  <video ref={node => { videos.current[i] = node; }} src={started && i === index ? slide.media.src : undefined}
                    poster={slide.media.poster} aria-label={slide.media.alt} muted playsInline preload="none"
                    disablePictureInPicture disableRemotePlayback controlsList="nodownload noremoteplayback nofullscreen" />
                ) : slide.media ? (
                  <img src={slide.media.src} alt={slide.media.alt} loading="lazy" draggable={false} />
                ) : <span className="feature-carousel__placeholder" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="feature-carousel__controls">
        <div className="feature-carousel__pagination" aria-label="Choose a feature">
          {slides.map((slide, i) => <button key={slide.id} type="button" onClick={() => selectManually(i)}
            className="feature-carousel__dot" aria-label={`Show ${slide.title}`} aria-current={i === index ? "true" : undefined}>
            <span className="feature-carousel__dot-track">{i === index && <span key={`${index}-${visit}`} ref={fill}
              className="feature-carousel__fill" style={{ transform: `scaleX(${finished ? 1 : elapsed.current / SLIDE_MS})` }} />}</span>
          </button>)}
        </div>
        <button type="button" className="feature-carousel__toggle" onClick={toggle}
          aria-label={needsReplay ? "Replay carousel" : paused ? "Play carousel" : "Pause carousel"}>
          <span className="feature-carousel__control-icon" data-replay={needsReplay || undefined} aria-hidden="true"
            style={{ "--control-icon": `url("${publicUrl(`/assets/MacMix/svgs/${icon}.svg`)}")` } as CSSProperties} />
        </button>
      </div>
    </section>
  );
}
