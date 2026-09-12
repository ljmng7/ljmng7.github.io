import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type MouseEvent } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { PaperHomepage } from "./components/PaperHomepage";
import { PageNavigation } from "./components/PageNavigation";
import { useLanguage } from "./components/LanguageProvider";
import "./page-transitions.css";

type Page = "home" | "play";
type Destination = { page: Page; anchor: "work" | "contact" | null };
const pageAt = (path: string): Page => /^\/play(?:\.html)?\/?$/.test(path) ? "play" : "home";
const destinationAt = (url: Location | URL): Destination => ({
  page: pageAt(url.pathname),
  anchor: pageAt(url.pathname) === "home"
    ? url.hash === "#work" ? "work" : url.hash === "#contact" ? "contact" : null
    : null,
});
const loadPlay = () => import("./components/PlayPage");

type PlayProps = { onReady?: () => void; onError?: () => void };
function PageSurface({ active, page, scrollTop, children }: { active: boolean; page: Page; scrollTop: number; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div className="site-page" data-page={page} inert={!active} aria-hidden={!active || undefined}
    style={{ zIndex: active ? 1 : 0,
      pointerEvents: active ? "auto" : "none" }}
    initial={false}
    animate={{ x: active || reduced ? 0 : page === "play" ? "22vw" : "-22vw", opacity: active ? 1 : 0,
      visibility: "visible", transitionEnd: { visibility: active ? "visible" : "hidden" } }}
    transition={{ duration: reduced ? 0 : .85, ease: [.65, 0, .2, 1] }}>
    <div className="site-page-scroll" style={{ marginTop: active ? undefined : -scrollTop }}>{children}</div>
  </motion.div>;
}

export function App() {
  const { language, messages } = useLanguage();
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(() => pageAt(window.location.pathname));
  const [Play, setPlay] = useState<ComponentType<PlayProps> | null>(null);
  const [playReady, setPlayReady] = useState(false);
  const directPlayEntry = useRef(pageAt(window.location.pathname) === "play");
  const [navigationHidden, setNavigationHidden] = useState(false);
  const markReady = useCallback(() => {
    directPlayEntry.current = false;
    setPlayReady(true);
  }, []);
  const markError = useCallback(() => setLoadError(true), []);
  // Keep Home visible only for an in-app transition. A direct Play entry
  // mounts its surface already active, so initial={false} skips the slide.
  const activePage = page === "play" && !playReady && !directPlayEntry.current ? "home" : page;
  const request = useRef(0);
  const pendingDestination = useRef<Destination | null>(destinationAt(window.location));
  const scrollAnimation = useRef<{ stop: () => void } | null>(null);
  const scrollPositions = useRef<Record<Page, number>>({ home: 0, play: 0 });

  useLayoutEffect(() => {
    document.title = page === "play" ? messages.metadata.playTitle : messages.metadata.title;
    if (pageAt(location.pathname) === "play" && location.pathname !== "/play") {
      history.replaceState(history.state, "", "/play" + location.search + location.hash);
    }
  }, [page, messages]);

  useEffect(() => {
    let previousTop = window.scrollY;
    const handleScroll = () => {
      const top = window.scrollY;
      const delta = top - previousTop;
      if (top <= 8 || delta < -3) setNavigationHidden(false);
      else if (delta > 3) setNavigationHidden(true);
      previousTop = top;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activePage]);

  const scrollToDestination = useCallback((destination: Destination, animated: boolean, preservePosition = false) => {
    scrollAnimation.current?.stop();
    const scroller = document.scrollingElement;
    if (!scroller) return;
    const anchor = destination.anchor ? document.getElementById(destination.anchor) : null;
    const nav = document.querySelector(".page-navigation");
    const target = anchor
      ? anchor.getBoundingClientRect().top + window.scrollY
        - (nav?.getBoundingClientRect().height ?? 0)
      : preservePosition ? scrollPositions.current[destination.page] : 0;
    const top = Math.max(0, Math.min(target, scroller.scrollHeight - scroller.clientHeight));
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top, behavior: "instant" });
      return;
    }
    scrollAnimation.current = animate(scroller.scrollTop, top, {
      duration: .95,
      ease: [.65, 0, .2, 1],
      onUpdate: value => window.scrollTo({ top: value, behavior: "instant" }),
    });
  }, []);

  // Set an explicit section target before the slide; ordinary page switches retain their scroll.
  useLayoutEffect(() => {
    const destination = pendingDestination.current;
    if (!destination || destination.page !== activePage) return;
    pendingDestination.current = null;
    scrollToDestination(destination, false, true);
  }, [activePage, scrollToDestination]);

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const stop = () => scrollAnimation.current?.stop();
    const stopOnKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) stop();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stopOnKey);
    return () => {
      stop();
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stopOnKey);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (pageAt(window.location.pathname) === "play") {
      void loadPlay().then(module => { if (active) setPlay(() => module.default); })
        .catch(() => { if (active) setLoadError(true); });
    }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const back = async () => {
      scrollPositions.current[activePage] = window.scrollY;
      const id = ++request.current;
      const destination = destinationAt(window.location);
      const next = destination.page;
      scrollAnimation.current?.stop();
      if (next === "play" && !Play) {
        try {
          const module = await loadPlay();
          if (id !== request.current) return;
          setPlay(() => module.default);
        } catch {
          if (id === request.current) setLoadError(true);
          return;
        }
      }
      setLoadError(false);
      if (next === activePage) {
        pendingDestination.current = null;
        scrollToDestination(destination, false);
      } else pendingDestination.current = destination;
      setPage(next);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [Play, activePage, scrollToDestination]);

  const navigate = async (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.search || (url.hash && !["#work", "#contact"].includes(url.hash))
      || !["/", "/play", "/play/", "/play.html"].includes(url.pathname)) return;
    event.preventDefault();
    scrollPositions.current[activePage] = window.scrollY;
    const id = ++request.current;
    const destination = destinationAt(url);
    const next = destination.page;
    scrollAnimation.current?.stop();
    setLoadError(false);
    // Keep the current page visible while the Play bundle is being prepared.
    if (next === "play" && !Play) {
      try {
        const module = await loadPlay();
        if (id !== request.current) return;
        setPlay(() => module.default);
      } catch {
        if (id === request.current) setLoadError(true);
        return;
      }
    }
    if (url.pathname !== location.pathname || url.hash !== location.hash) {
      history.pushState(null, "", url.pathname + url.hash);
    }
    if (next === activePage) {
      pendingDestination.current = null;
      scrollToDestination(destination, true);
    } else pendingDestination.current = destination;
    setPage(next);
  };

  return <div className="site-pages" onClick={navigate}
    onPointerOver={event => {
      if ((event.target as Element).closest('a[href="/play"]')) void loadPlay().catch(() => undefined);
    }}>
    <PageNavigation play={activePage === "play"} hidden={navigationHidden} />
    <PageSurface active={activePage === "home"} page="home" scrollTop={scrollPositions.current.home}><PaperHomepage /></PageSurface>
    {Play && <PageSurface active={activePage === "play"} page="play" scrollTop={scrollPositions.current.play}>
      <Play onReady={markReady} onError={markError} />
    </PageSurface>}
    {loadError && <div className="site-page-error" role="alert">
      {language === "zh" ? "Play 暂时无法加载，请稍后重试。" : "Play could not load. Please try again."}
      <button onClick={() => {
        setLoadError(false);
        void loadPlay().then(module => {
          setPlay(() => module.default);
          if (page !== "play") history.pushState(null, "", "/play");
          setPage("play");
        }).catch(() => setLoadError(true));
      }}>{language === "zh" ? "重试" : "Retry"}</button>
    </div>}
  </div>;
}
