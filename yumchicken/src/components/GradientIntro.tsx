import {
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { IoArrowDown } from "react-icons/io5";
import { useLanguage } from "./LanguageProvider";
import "./gradient-intro.css";

export function GradientIntro({ actions }: { actions: ReactNode }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const page = hero?.parentElement;
    const navigation = document.querySelector<HTMLElement>(".gradient-navigation");
    if (!hero || !page || !navigation) return;

    const measure = () => {
      const start = Math.max(0, hero.offsetHeight - navigation.offsetHeight);
      // Absolute distances keep the pin stable as Safari retracts its toolbar.
      const end = Math.max(start + 1, page.offsetHeight);
      page.style.setProperty("--hero-pin-start", `${start}px`);
      page.style.setProperty("--hero-pin-end", `${end}px`);
      page.style.setProperty("--hero-pin-travel", `${end - start}px`);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(page);
    resize.observe(hero);
    resize.observe(navigation);
    measure();
    return () => resize.disconnect();
  }, []);

  return (
    <div className="gradient-intro" ref={heroRef}>
      <div className="gradient-intro__visual">
        <div className="gradient-intro__colors" aria-hidden="true" />
        <div className="gradient-intro__content">
          <div className="gradient-intro__headline">
            <h1
              className="gradient-intro__heading"
              id="hero-title"
              lang={language === "zh" ? "zh-CN" : "en"}
            >
              {language === "zh" ? (
                <>
                  <span className="gradient-intro__zh-line">
                    随心烹饪
                    <span className="gradient-intro__zh-punctuation">，</span>
                  </span>
                  <span className="gradient-intro__zh-line">
                    今天就做一顿
                    <span className="gradient-intro__zh-punctuation">。</span>
                  </span>
                </>
              ) : (
                <>
                  <span>Cook your way.</span>
                  <span className="gradient-intro__en-desktop-line">Make a meal today.</span>
                  <span className="gradient-intro__en-mobile-line">Start today.</span>
                </>
              )}
            </h1>
          </div>
          <div className="gradient-intro__actions">{actions}</div>
        </div>
        <div
          className="gradient-intro__scroll-hint"
          lang={language === "zh" ? "zh-CN" : "en"}
        >
          <IoArrowDown className="gradient-intro__scroll-arrow" aria-hidden="true" />
          <span className="gradient-intro__scroll-label">
            {language === "zh" ? "下滑探索更多" : "Scroll to explore more"}
          </span>
        </div>
      </div>
    </div>
  );
}
