import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { IoArrowDown, IoLogoApple } from "react-icons/io5";
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
                    <span className="gradient-intro__zh-glyph">你的</span>
                    <span className="gradient-intro__mac-lockup">
                      <IoLogoApple
                        className="gradient-intro__apple"
                        aria-hidden="true"
                      />
                      <span>Mac</span>
                    </span>
                    <span className="gradient-intro__zh-glyph">音量</span>
                    <span className="gradient-intro__zh-punctuation">，</span>
                  </span>
                  <span className="gradient-intro__zh-line">
                    <span className="gradient-intro__zh-glyph">尽在</span>MacMix
                    <span className="gradient-intro__zh-punctuation">。</span>
                  </span>
                </>
              ) : (
                <>
                  <span>
                    <span className="gradient-intro__english-prefix">Your </span>
                    <span className="gradient-intro__mac-lockup">
                      <IoLogoApple
                        className="gradient-intro__apple"
                        aria-hidden="true"
                      />
                      <span>Mac&rsquo;s</span>
                    </span> sound.
                  </span>
                  <span>All in MacMix.</span>
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
