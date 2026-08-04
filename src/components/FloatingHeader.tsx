import { useEffect, useRef, useState } from "react";
import { loadContributionPayload } from "../data/contributions";
import { profile } from "../data/profile";
import { useLanguage } from "./LanguageProvider";
import { NumberTicker } from "./NumberTicker";

type FloatingElementKey = "avatar" | "github" | "name";

interface ElementGeometry {
  sourceDocumentLeft: number;
  sourceDocumentTop: number;
  sourceHeight: number;
  sourceWidth: number;
  targetCenterX: number;
  targetCenterY: number;
  targetScale: number;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smoothstep = (value: number) => value * value * (3 - 2 * value);

export function FloatingHeader() {
  const { language, messages } = useLanguage();
  const headerRef = useRef<HTMLElement>(null);
  const avatarTargetRef = useRef<HTMLSpanElement>(null);
  const nameTargetRef = useRef<HTMLSpanElement>(null);
  const githubTargetRef = useRef<HTMLSpanElement>(null);
  const [commitCount, setCommitCount] = useState<number | null>(null);
  const [headerActive, setHeaderActive] = useState(false);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  useEffect(() => {
    let cancelled = false;
    void loadContributionPayload().then((payload) => {
      if (!cancelled && payload) setCommitCount(payload.totalContributions);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    const intro = document.querySelector<HTMLElement>(".profile-intro");
    const sourceElements: Record<FloatingElementKey, HTMLElement | null> = {
      avatar: document.querySelector<HTMLElement>('[data-floating-header-source="avatar"]'),
      github: document.querySelector<HTMLElement>('[data-floating-header-source="github"]'),
      name: document.querySelector<HTMLElement>('[data-floating-header-source="name"]'),
    };
    const targetElements: Record<FloatingElementKey, HTMLElement | null> = {
      avatar: avatarTargetRef.current,
      github: githubTargetRef.current,
      name: nameTargetRef.current,
    };

    if (
      !header ||
      !intro ||
      Object.values(sourceElements).some((element) => !element) ||
      Object.values(targetElements).some((element) => !element)
    ) {
      return;
    }

    const sources = sourceElements as Record<FloatingElementKey, HTMLElement>;
    const targets = targetElements as Record<FloatingElementKey, HTMLElement>;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let animationFrame = 0;
    let geometry: Record<FloatingElementKey, ElementGeometry> | null = null;
    let transitionStart = 0;
    let transitionDistance = 220;
    let isHeaderActive = false;

    const resetSourceStyles = (source: HTMLElement) => {
      source.style.removeProperty("height");
      source.style.removeProperty("left");
      source.style.removeProperty("margin");
      source.style.removeProperty("position");
      source.style.removeProperty("top");
      source.style.removeProperty("transform");
      source.style.removeProperty("transform-origin");
      source.style.removeProperty("transition");
      source.style.removeProperty("will-change");
      source.style.removeProperty("width");
      source.style.removeProperty("z-index");
    };

    const update = () => {
      animationFrame = 0;
      if (disposed || !geometry) return;

      const rawProgress = clamp01((window.scrollY - transitionStart) / transitionDistance);
      const progress = reduceMotion ? (rawProgress >= 1 ? 1 : 0) : smoothstep(rawProgress);

      header.style.setProperty("--floating-header-progress", progress.toFixed(4));
      const nextHeaderActive = progress >= 0.88;
      header.dataset.active = nextHeaderActive ? "true" : "false";
      header.setAttribute("aria-hidden", nextHeaderActive ? "false" : "true");
      header.inert = !nextHeaderActive;
      if (nextHeaderActive !== isHeaderActive) {
        isHeaderActive = nextHeaderActive;
        setHeaderActive(nextHeaderActive);
      }
      if (progress <= 0.0001) {
        delete document.documentElement.dataset.floatingProfile;
      } else {
        document.documentElement.dataset.floatingProfile =
          progress >= 0.72 ? "settled" : "moving";
      }

      (Object.keys(geometry) as FloatingElementKey[]).forEach((key) => {
        const elementGeometry = geometry?.[key];
        if (!elementGeometry) return;

        const sourceStartLeft = elementGeometry.sourceDocumentLeft - window.scrollX;
        const sourceStartTop = elementGeometry.sourceDocumentTop - transitionStart;
        const sourceStartCenterX = sourceStartLeft + elementGeometry.sourceWidth / 2;
        const sourceStartCenterY = sourceStartTop + elementGeometry.sourceHeight / 2;
        const translateX = (elementGeometry.targetCenterX - sourceStartCenterX) * progress;
        const translateY = (elementGeometry.targetCenterY - sourceStartCenterY) * progress;
        const scale = 1 + (elementGeometry.targetScale - 1) * progress;

        if (progress <= 0.0001) {
          resetSourceStyles(sources[key]);
          return;
        }

        sources[key].style.height = `${elementGeometry.sourceHeight.toFixed(2)}px`;
        sources[key].style.left = `${sourceStartLeft.toFixed(2)}px`;
        sources[key].style.margin = "0";
        sources[key].style.position = "fixed";
        sources[key].style.top = `${sourceStartTop.toFixed(2)}px`;
        sources[key].style.transform =
          `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) ` +
          `scale(${scale.toFixed(4)})`;
        sources[key].style.transformOrigin = "center";
        sources[key].style.transition = "none";
        sources[key].style.willChange = "transform";
        sources[key].style.width = `${elementGeometry.sourceWidth.toFixed(2)}px`;
        sources[key].style.zIndex = "91";
      });
    };

    const scheduleUpdate = () => {
      if (disposed || animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      if (disposed) return;
      (Object.keys(sources) as FloatingElementKey[]).forEach((key) => {
        resetSourceStyles(sources[key]);
      });

      const nextGeometry = {} as Record<FloatingElementKey, ElementGeometry>;
      (Object.keys(sources) as FloatingElementKey[]).forEach((key) => {
        const sourceBounds = sources[key].getBoundingClientRect();
        const targetBounds = targets[key].getBoundingClientRect();
        const targetScale = Math.min(
          targetBounds.width / Math.max(sourceBounds.width, 1),
          targetBounds.height / Math.max(sourceBounds.height, 1),
        );

        nextGeometry[key] = {
          sourceDocumentLeft: sourceBounds.left + window.scrollX,
          sourceDocumentTop: sourceBounds.top + window.scrollY,
          sourceHeight: sourceBounds.height,
          sourceWidth: sourceBounds.width,
          targetCenterX: targetBounds.left + targetBounds.width / 2,
          targetCenterY: targetBounds.top + targetBounds.height / 2,
          targetScale,
        };
      });

      const introBounds = intro.getBoundingClientRect();
      const introTop = introBounds.top + window.scrollY;
      transitionStart = introTop + Math.min(42, introBounds.height * 0.1);
      transitionDistance = Math.min(Math.max(introBounds.height * 0.58, 190), 320);
      geometry = nextGeometry;
      update();
    };

    const scheduleMeasure = () => {
      if (disposed) return;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measure);
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(intro);
    resizeObserver.observe(header);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    void document.fonts.ready.then(scheduleMeasure);
    measure();

    return () => {
      disposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleMeasure);
      delete document.documentElement.dataset.floatingProfile;
      (Object.keys(sources) as FloatingElementKey[]).forEach((key) => {
        resetSourceStyles(sources[key]);
      });
    };
  }, [language]);

  return (
    <header
      aria-hidden="true"
      className="floating-header"
      data-active="false"
      inert
      ref={headerRef}
    >
      <div className="floating-header-content">
        <div className="floating-header-identity">
          <button
            aria-label={messages.profile.backToTop}
            className="floating-header-home floating-header-home--avatar"
            onClick={scrollToTop}
            type="button"
          >
            <span
              aria-hidden="true"
              className="floating-header-avatar-target floating-header-target"
              ref={avatarTargetRef}
            />
          </button>
          <div className="floating-header-name-cluster">
            <button
              aria-label={messages.profile.backToTop}
              className="floating-header-home floating-header-home--name"
              onClick={scrollToTop}
              type="button"
            >
              <span
                aria-hidden="true"
                className="floating-header-name-target floating-header-target"
                ref={nameTargetRef}
              >
                {profile.name}
              </span>
            </button>
            <a
              aria-label={messages.profile.githubAriaLabel}
              className="floating-header-github"
              href={profile.githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span
                aria-hidden="true"
                className="floating-header-github-target floating-header-target"
                ref={githubTargetRef}
              />
            </a>
          </div>
        </div>
        <nav className="floating-header-navigation" aria-label={messages.dock.navigationLabel}>
          <a className="floating-header-nav-link" href="#works">
            {messages.projects.title}
          </a>
          <a className="floating-header-nav-link" href="#repos">
            {messages.repositories.title}
          </a>
          <span
            className={`floating-header-commit-count${commitCount === null ? " floating-header-commit-count--loading" : ""}`}
            aria-label={commitCount === null ? undefined : `${commitCount} commits`}
          >
            {headerActive && commitCount !== null ? (
              <NumberTicker value={commitCount} aria-hidden="true" />
            ) : (
              <span aria-hidden="true">0</span>
            )}{" "}
            commits
          </span>
        </nav>
      </div>
    </header>
  );
}
