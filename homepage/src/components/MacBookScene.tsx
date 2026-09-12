import { useEffect, useRef } from "react";
import { CelestialThemeToggle } from "./CelestialThemeToggle";
import { Starfield } from "./Starfield";
import { createMacBookRenderer } from "./macbook-renderer";
import "./macbook-scene.css";
import { useLanguage } from "./LanguageProvider";

export function MacBookScene({ onReady, onError }: { onReady?: () => void; onError?: () => void }) {
  const { language } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || !canvasHost.current) return;
    return createMacBookRenderer(canvasHost.current, root.current, {
      onReady: () => onReady?.(),
      onActive: () => {},
      onError: () => onError?.(),
    });
  }, [onReady, onError]);
  return <main ref={root} className="mb-experience" aria-label={language === "zh" ? "滚动打开 MacBook，进入桌面" : "Scroll to open the MacBook and enter the desktop"}>
    <div className="mb-viewport">
      <Starfield />
      <CelestialThemeToggle />
      <div ref={canvasHost} className="mb-webgl" aria-label={language === "zh" ? "MacBook Pro M5 三维模型" : "MacBook Pro M5 3D model"}/>
    </div>
  </main>;
}
