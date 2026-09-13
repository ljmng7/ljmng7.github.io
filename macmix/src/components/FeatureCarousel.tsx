import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import "./feature-carousel.css";
import { publicUrl } from "../lib/sitePaths";
import { useLanguage } from "./LanguageProvider";

export type FeatureSlide = {
  id: string;
  title: string;
  media: { src: string; alt: string };
};

const FEATURES = [
  { file: "1-mix.mp4", en: "Every app. Its own volume.", zh: "每个 App，独立音量。" },
  { file: "2-quickMute.mp4", en: "One click. Instant quiet.", zh: "一键静音，即刻安静。" },
  { file: "3-nowPlaying.mp4", en: "Your music. At your fingertips.", zh: "音乐播放，随手掌控。" },
  { file: "4-proControl.mp4", en: "Pro controls. Effortless.", zh: "Pro 级控制，易如反掌。" },
  { file: "5-scene.mp4", en: "Sound presets. For every scene.", zh: "不同场景，一键切换。" },
];
const SLIDE_MS = 5000;

// Derive title motion from the actual card position, including native gestures.
function syncTitles(viewport: HTMLDivElement, titles: HTMLDivElement | null, pair?: [number, number] | null) {
  if (!titles) return;
  const cards = [...viewport.querySelectorAll<HTMLElement>(".feature-carousel__slide")];
  const center = viewport.scrollLeft + viewport.clientWidth / 2;
  const stride = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : viewport.clientWidth;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  [...titles.children].forEach((node, i) => {
    const title = node as HTMLElement;
    if (pair && !pair.includes(i)) { title.style.opacity = "0"; return; }
    const offset = cards[i].offsetLeft + cards[i].offsetWidth / 2 - center;
    const span = pair ? Math.max(stride, Math.abs(cards[pair[1]].offsetLeft - cards[pair[0]].offsetLeft)) : stride;
    const distance = Math.abs(offset) < 1 ? 0 : offset / span;
    const proximity = Math.max(0, 1 - Math.abs(distance));
    title.style.opacity = String(reduced ? Number(Math.abs(distance) < 0.5) : proximity ** 3);
    title.style.transform = `translate3d(${reduced ? 0 : Math.max(-1, Math.min(1, distance)) * 48}px, 0, 0)`;
  });
}

export function FeatureCarousel() {
  const { language } = useLanguage();
  const chinese = language === "zh";
  const slides: FeatureSlide[] = FEATURES.map(feature => ({
    id: feature.file,
    title: feature[language],
    media: { src: publicUrl(`/assets/MacMix/features/${feature.file}`), alt: feature[language] },
  }));
  const viewport = useRef<HTMLDivElement>(null);
  const titles = useRef<HTMLDivElement>(null);
  const titlePair = useRef<[number, number] | null>(null);
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
  const [paintedVideos, setPaintedVideos] = useState<ReadonlySet<number>>(() => new Set());

  const markVideoPainted = (videoIndex: number) => {
    // WebKit can dispatch `playing` just before its first frame is composited.
    // Keep the standalone image above the video for two frames so a loading
    // surface never replaces it with the platform's gray video placeholder.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setPaintedVideos(previous => previous.has(videoIndex)
        ? previous
        : new Set(previous).add(videoIndex));
    }));
  };

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

  useLayoutEffect(() => {
    if (viewport.current) syncTitles(viewport.current, titles.current, titlePair.current);
  });

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
      video.defaultMuted = true;
      // Silent decorative videos do not register a Media Session.
      void video.play().catch(() => { /* Keep the current frame if autoplay is unavailable. */ });
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
      titlePair.current = null;
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
    const cards = [...element.querySelectorAll<HTMLElement>(".feature-carousel__slide")];
    const previousIndex = cards.reduce((nearest, _card, i) =>
      Math.abs(targetOffset(i) - from) < Math.abs(targetOffset(nearest) - from) ? i : nearest, 0);
    titlePair.current = [previousIndex, index];
    programmatic.current = true;
    element.style.scrollSnapType = "none";
    const start = performance.now();
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100;
    const tick = (now: number) => {
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      const ease = 1 - Math.pow(1 - progress, 4);
      element.scrollLeft = from + (to - from) * ease;
      syncTitles(element, titles.current, titlePair.current);
      if (progress < 1) animation.current = requestAnimationFrame(tick);
      else {
        titlePair.current = null;
        syncTitles(element, titles.current);
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
      syncTitles(element, titles.current, titlePair.current);
      if (programmatic.current) return;
      setPaused(true);
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settle, 160);
    };
    const resize = new ResizeObserver(() => {
      if (programmatic.current) interruptScroll();
      element.scrollLeft = targetOffset(activeIndex.current);
      syncTitles(element, titles.current, titlePair.current);
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
    <section className="feature-carousel" aria-label={chinese ? "功能亮点" : "Features"} aria-roledescription="carousel"
      data-state={finished ? "finished" : paused ? "paused" : started ? "playing" : "idle"}>
      <div className="feature-carousel__titles" ref={titles}>
        {slides.map((slide, i) => <h2 key={slide.id} aria-hidden={i !== index}><span>
          {language === "en" ? slide.title.split(/(?<=[.,!?;:])\s+/).map((part, partIndex) =>
            <span className="feature-carousel__title-phrase" key={partIndex}>{partIndex > 0 && " "}{part}</span>
          ) : slide.title}
        </span></h2>)}
      </div>
      <div className="feature-carousel__viewport" ref={viewport}
        tabIndex={0} aria-label={chinese ? "滑动或使用方向键切换功能" : "Swipe or use arrow keys to change features"}
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
              <div className="feature-carousel__media">
                <img className={`feature-carousel__poster${paintedVideos.has(i) ? " feature-carousel__poster--hidden" : ""}`}
                  src={slide.media.src.replace(/\.mp4$/, ".jpg")} alt="" aria-hidden="true" decoding="async" fetchPriority={i === 0 ? "high" : "auto"} />
                <video ref={node => { videos.current[i] = node; }} src={slide.media.src}
                  poster={slide.media.src.replace(/\.mp4$/, ".jpg")}
                  aria-label={slide.media.alt} muted playsInline preload="auto"
                  controls={false} tabIndex={-1} x-webkit-airplay="deny"
                  disablePictureInPicture disableRemotePlayback controlsList="nodownload noremoteplayback nofullscreen"
                  onPlaying={() => markVideoPainted(i)} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="feature-carousel__controls">
        <div className="feature-carousel__pagination" aria-label={chinese ? "选择功能" : "Choose a feature"}>
          {slides.map((slide, i) => <button key={slide.id} type="button" onClick={() => selectManually(i)}
            className="feature-carousel__dot" aria-label={chinese ? `查看：${slide.title}` : `Show ${slide.title}`} aria-current={i === index ? "true" : undefined}>
            <span className="feature-carousel__dot-track">{i === index && <span key={`${index}-${visit}`} ref={fill}
              className="feature-carousel__fill" style={{ transform: `scaleX(${finished ? 1 : elapsed.current / SLIDE_MS})` }} />}</span>
          </button>)}
        </div>
        <button type="button" className="feature-carousel__toggle" onClick={toggle}
          aria-label={chinese ? (needsReplay ? "重新播放轮播" : paused ? "播放轮播" : "暂停轮播") : (needsReplay ? "Replay carousel" : paused ? "Play carousel" : "Pause carousel")}>
          <span className="feature-carousel__control-icon" data-replay={needsReplay || undefined} aria-hidden="true"
            style={{ "--control-icon": `url("${publicUrl(`/assets/MacMix/svgs/${icon}.svg`)}")` } as CSSProperties} />
        </button>
      </div>
    </section>
  );
}
