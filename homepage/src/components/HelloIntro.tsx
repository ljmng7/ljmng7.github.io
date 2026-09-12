import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { helloLetterings, type HelloLettering } from "../data/hello-letterings";
import { useLanguage } from "./LanguageProvider";
import { HELLO_DRAW_MS, helloFrameAt } from "./hello-timeline";
import "./hello-intro.css";

function InteractiveName() {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const letters = Array.from(root.querySelectorAll<HTMLElement>(".hello-name-letter"));
    const current = letters.map(() => 10);
    const targets = letters.map(() => 10);
    let positions: { x: number; y: number }[] = [];
    let radius = 1;
    let request = 0;
    let previous = 0;
    let inside = false;
    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 16.67;
      previous = now;
      const blend = reducedMotion ? 1 : 1 - Math.exp(-elapsed / (inside ? 85 : 140));
      let moving = false;
      letters.forEach((letter, index) => {
        const delta = targets[index] - current[index];
        current[index] = Math.abs(delta) < .05 ? targets[index] : current[index] + delta * blend;
        if (Math.abs(targets[index] - current[index]) >= .05) moving = true;
        else current[index] = targets[index];
        letter.style.fontVariationSettings = `"EXPO" ${current[index].toFixed(2)}`;
      });
      request = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) previous = 0;
    };
    const schedule = () => {
      if (!request) request = requestAnimationFrame(tick);
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // Cache geometry once, before animation. Pointer moves never force layout.
      positions = letters.map(letter => {
        const box = letter.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
      radius = root.getBoundingClientRect().height * 1.4;
      inside = true;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!inside) enter(event);
      positions.forEach((position, index) => {
        const distance = Math.hypot(event.clientX - position.x, event.clientY - position.y);
        const proximity = Math.max(0, 1 - distance / radius);
        const influence = proximity * proximity * (3 - 2 * proximity);
        targets[index] = 10 - 85 * influence;
      });
      schedule();
    };
    const reset = () => {
      inside = false;
      targets.fill(10);
      schedule();
    };
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", reset);
    root.addEventListener("pointercancel", reset);
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    window.addEventListener("scroll", reset, true);
    return () => {
      cancelAnimationFrame(request);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", reset);
      root.removeEventListener("pointercancel", reset);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
      window.removeEventListener("scroll", reset, true);
    };
  }, [reducedMotion]);
  return <span ref={ref} className="hello-interactive-name" aria-label="Jazmín">
    {Array.from("Jazmín").map((letter, index) =>
      <span key={index} className="hello-name-letter" aria-hidden="true">{letter}</span>)}
  </span>;
}

function Lettering({ artwork }: { artwork: HelloLettering }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Own this subtree for the artwork's lifetime. React must not reapply the
    // raw export on playback updates and discard the initialized SVG attributes.
    // Only checked-in, reviewed Figma SVGs are accepted, never remote/user HTML.
    root.innerHTML = artwork.svg;
    const svg = root.querySelector("svg");
    const paths = Array.from(root.querySelectorAll("path"));
    svg?.setAttribute("preserveAspectRatio", "xMaxYMid meet");
    // IDs are only export labels, with no URL references in these source files.
    root.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    const lengths = paths.map(path => path.getTotalLength());
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let delay = 0;
    paths.forEach((path, index) => {
      const duration = HELLO_DRAW_MS * lengths[index] / total;
      path.setAttribute("pathLength", "1");
      path.style.setProperty("--stroke-delay", `${delay}ms`);
      path.style.setProperty("--stroke-duration", `${duration}ms`);
      path.classList.add("hello-stroke-guide");
      delay += duration;
    });
    return () => { root.replaceChildren(); };
  }, [artwork]);
  return <div ref={ref} className="hello-artwork" data-flip-y={artwork.flipY}
    style={{ width: `min(100%, calc(var(--hello-height) * ${artwork.viewBox[2] / artwork.viewBox[3]}))` }} />;
}

export function HelloIntro() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const hasArtwork = helloLetterings.length > 0;
  const [frame, setFrame] = useState(() => helloFrameAt(0, Math.max(1, helloLetterings.length)));
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const copy = copyRef.current;
    const word = wordRef.current;
    if (!row || !copy || !word || !hasArtwork) return;
    const measure = () => {
      const height = copy.getBoundingClientRect().height;
      row.style.setProperty("--hello-height", `${height}px`);
      const slotWidth = word.getBoundingClientRect().width;
      const english = helloLetterings[0];
      const renderedWidth = Math.min(slotWidth, height * english.viewBox[2] / english.viewBox[3]);
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const offset = (copy.getBoundingClientRect().width + gap - slotWidth + renderedWidth) / 2;
      row.style.setProperty("--hello-center-offset", `${offset}px`);
      const rowGap = parseFloat(getComputedStyle(row).rowGap) || 0;
      row.style.setProperty("--hello-center-offset-y", `${(height + rowGap) / 2}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(copy);
    observer.observe(row);
    measure();
    return () => observer.disconnect();
  }, [hasArtwork, language]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !hasArtwork || reducedMotion) return;
    let disposed = false;
    let visible = false;
    let fontsReady = false;
    let elapsed = 0;
    let previousTime: number | null = null;
    let request = 0;
    let previousFrame = helloFrameAt(0, helloLetterings.length);
    setFrame(previousFrame);
    setStarted(false);
    const tick = (now: number) => {
      if (previousTime !== null) elapsed += now - previousTime;
      previousTime = now;
      const next = helloFrameAt(elapsed, helloLetterings.length);
      if (next.iteration !== previousFrame.iteration || next.phase !== previousFrame.phase) {
        previousFrame = next;
        setFrame(next);
      }
      request = requestAnimationFrame(tick);
    };
    const updatePlayback = () => {
      cancelAnimationFrame(request);
      previousTime = null;
      const active = fontsReady && visible && !document.hidden;
      setRunning(active);
      if (active) {
        setStarted(true);
        request = requestAnimationFrame(tick);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(rowRef.current ?? scene);
    document.addEventListener("visibilitychange", updatePlayback);
    void Promise.all([
      document.fonts.load('400 48px "Homepage GT Super Text"'),
      document.fonts.load('400 56px "Homepage Exposure"'),
      document.fonts.load('400 56px "Homepage Xiangcui"', "我是"),
      document.fonts.load('600 18px "Homepage Noto Serif SC"', "独立开发者、学生"),
    ]).catch(() => undefined).then(() => {
      if (disposed) return;
      fontsReady = true;
      updatePlayback();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(request);
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
    };
  }, [hasArtwork, reducedMotion]);

  const staticScene = !hasArtwork || reducedMotion;
  const showSubtitle = staticScene || (frame.introduced && frame.phase !== "moving");
  const artwork = helloLetterings[frame.index];
  return <div ref={sceneRef} className="hello-scene" lang={language === "zh" ? "zh-CN" : "en"}
    data-artwork={hasArtwork ? "ready" : "pending"} data-running={running} data-started={started || staticScene}
    data-introduced={staticScene || frame.introduced} data-subtitle={showSubtitle} data-static={staticScene}>
    <div ref={rowRef} className="hello-row">
      {artwork && <div ref={wordRef} className="hello-lettering-position" aria-hidden="true">
        <div key={frame.iteration} className="hello-lettering" data-fading={!staticScene && frame.phase === "fading"}>
          <Lettering artwork={artwork} />
        </div>
      </div>}
      <div ref={copyRef} className="hello-copy">
        <p className="hello-name"><span className="hello-name-prefix">{language === "zh" ? "我是" : "I'm"}</span>{" "}<InteractiveName /></p>
        <p className="hello-description">{language === "zh" ? "独立开发者、学生" : "Independent Developer, Student"}</p>
      </div>
    </div>
  </div>;
}
