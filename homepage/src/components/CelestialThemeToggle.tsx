import { useEffect, useRef, useState } from "react";
import { useTheme, type Theme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { MoonDisc } from "./MoonDisc";
import { SKY_TRANSITION_MS } from "./sky-transition";

export function CelestialThemeToggle() {
  const { theme, setMode } = useTheme();
  const { language } = useLanguage();
  const host = useRef<HTMLDivElement>(null);
  const sun = useRef<HTMLButtonElement>(null);
  const moon = useRef<HTMLButtonElement>(null);
  const previous = useRef<Theme>(theme);
  const focusAfterOrbit = useRef(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!host.current || !sun.current || !moon.current) return;
    const viewport = host.current;
    const incoming = theme === "light" ? sun.current : moon.current;
    const outgoing = theme === "light" ? moon.current : sun.current;
    const restoreFocus = focusAfterOrbit.current || document.activeElement === outgoing;
    focusAfterOrbit.current = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let cancelled = false;
    const position = () => {
      const w = viewport.clientWidth, h = viewport.clientHeight;
      const x = w - Math.min(94, Math.max(40, w * .065));
      const y = Math.min(150, Math.max(88, h * .15));
      // One east-to-west parabola. Its apex stays inside the viewport.
      const point = (px: number) => `translate(${px}px, ${y + h * .65 * ((px / w - .52) ** 2 - (x / w - .52) ** 2)}px)`;
      return { w, x, point };
    };
    const settle = () => {
      animations.forEach(animation => animation.cancel());
      const { point, x } = position();
      incoming.style.transform = point(x);
      incoming.style.opacity = "1";
      outgoing.style.opacity = "0";
      setMoving(false);
      if (restoreFocus) requestAnimationFrame(() => { if (!cancelled) incoming.focus({ preventScroll: true }); });
    };
    if (previous.current === theme || reduced.matches) {
      settle();
    } else {
      setMoving(true);
      const { w, x, point } = position();
      const path = (start: number, end: number): Keyframe[] => Array.from({ length: 41 }, (_, i) => ({
        transform: point(start + (end - start) * i / 40), opacity: 1, offset: i / 40,
      }));
      incoming.style.opacity = "0";
      outgoing.style.opacity = "1";
      animations = [
        outgoing.animate(path(x, -100), { duration: SKY_TRANSITION_MS, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" }),
        incoming.animate(path(w + 100, x), { duration: SKY_TRANSITION_MS * .55, delay: SKY_TRANSITION_MS * .45, easing: "cubic-bezier(.2,.65,.3,1)", fill: "both" }),
      ];
      void Promise.all(animations.map(animation => animation.finished)).then(() => {
        if (!cancelled) settle();
      }).catch(() => { /* A resize, system change or unmount can cancel the orbit. */ });
    }
    previous.current = theme;
    // Ignore the initial observation; starting an orbit must not immediately cancel it.
    let initial = true;
    const onResize = new ResizeObserver(() => { if (initial) initial = false; else settle(); });
    onResize.observe(viewport);
    reduced.addEventListener("change", settle);
    return () => {
      cancelled = true;
      animations.forEach(animation => animation.cancel());
      onResize.disconnect();
      reduced.removeEventListener("change", settle);
    };
  }, [theme]);

  const label = language === "zh"
    ? theme === "light" ? "切换到夜晚" : "切换到白天"
    : theme === "light" ? "Switch to night" : "Switch to day";
  return <div ref={host} className="mb-celestial" data-moving={moving}>
    {(["light", "dark"] as const).map(value => <button
      key={value}
      ref={value === "light" ? sun : moon}
      type="button"
      className={`mb-celestial-body ${value === "light" ? "mb-sun" : "mb-moon"}`}
      aria-label={label}
      aria-hidden={value !== theme}
      tabIndex={value === theme ? 0 : -1}
      disabled={value !== theme}
      aria-disabled={moving || value !== theme}
      onClick={event => {
        if (moving) return;
        focusAfterOrbit.current = document.activeElement === event.currentTarget;
        setMode(theme === "light" ? "dark" : "light");
      }}
    >{value === "light" ? <span aria-hidden="true" className="mb-sun-atmosphere">
      <span className="mb-sun-rays" /><span className="mb-celestial-disc" />
      <span className="mb-sun-flare mb-sun-flare-one" /><span className="mb-sun-flare mb-sun-flare-two" />
    </span> : <MoonDisc />}</button>)}
  </div>;
}
