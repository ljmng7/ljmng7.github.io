import { Moon, Sun } from "lucide-react";
import { useCallback, useRef, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { Theme } from "./ThemeProvider";

interface AnimatedThemeTogglerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "onClick"> {
  children?: ReactNode;
  duration?: number;
  nextTheme: Theme;
  onThemeChange: () => void;
  theme: Theme;
}

export function AnimatedThemeToggler({
  children,
  className,
  duration = 400,
  nextTheme,
  onThemeChange,
  theme,
  ...props
}: AnimatedThemeTogglerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  const changeTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button || isTransitioningRef.current) return;

    const applyTheme = () => {
      const root = document.documentElement;
      root.classList.toggle("dark", nextTheme === "dark");
      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme;
      flushSync(onThemeChange);
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (theme === nextTheme || !document.startViewTransition || reduceMotion) {
      applyTheme();
      return;
    }

    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${radius}px at ${x}px ${y}px)`,
    ];
    const root = document.documentElement;
    root.dataset.magicuiThemeVt = "active";
    root.style.setProperty("--magicui-theme-toggle-vt-duration", `${duration}ms`);
    root.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0]);
    isTransitioningRef.current = true;

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty("--magicui-theme-toggle-vt-duration");
      root.style.removeProperty("--magicui-theme-vt-clip-from");
    };
    const transition = document.startViewTransition(applyTheme);
    transition.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath },
          {
            duration,
            easing: "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          },
        ),
      )
      .catch(cleanup);
    transition.finished.finally(cleanup).catch(cleanup);
  }, [duration, nextTheme, onThemeChange, theme]);

  return (
    <button
      {...props}
      className={className}
      onClick={changeTheme}
      ref={buttonRef}
      type="button"
    >
      {children ?? (nextTheme === "dark" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />)}
    </button>
  );
}
