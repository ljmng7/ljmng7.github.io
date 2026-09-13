import {
  IoArrowForward,
} from "react-icons/io5";
import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { FeatureCarousel } from "./components/FeatureCarousel";
import { FooterLanguageToggle } from "./components/FooterLanguageToggle";
import { FooterThemeToggle } from "./components/FooterThemeToggle";
import { GradientIntro } from "./components/GradientIntro";
import { homeTitleForLanguage, useLanguage } from "./components/LanguageProvider";
import {
  appRouteFromPathname,
  publicUrl,
  type AppRoute,
} from "./lib/sitePaths";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/%E9%A6%8B%E9%A6%99%E9%B8%A1/id6759188913";
const APK_URL =
  "https://download.jazminli.com/YumChicken/YumChicken.apk";
const LegalPage = lazy(() => import("./components/LegalPage"));

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/ljmng7",
    icon: "github-black.svg",
  },
  {
    label: "X",
    href: "https://x.com/jazminli57",
    icon: "x-black.svg",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@lucid.jasmine",
    icon: "threads.svg",
  },
  {
    label: "小红书",
    href: "https://www.xiaohongshu.com/user/profile/66a6d5f2000000001d020f1b",
    icon: "xiaohongshu-black.svg",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lucid.jasmine/",
    icon: "instagram-black.svg",
  },
  {
    label: "Email",
    href: "mailto:jasmine@jazminli.com",
    icon: "email-black.svg",
  },
] as const;

type SiteRoute = AppRoute;
type PagePhase = "idle" | "entering";

function usesSettledGradientHeader(route: SiteRoute) {
  return (
    route === "privacy" ||
    route === "support"
  );
}

function isLegalRoute(route: SiteRoute): route is "privacy" | "support" {
  return route === "privacy" || route === "support";
}

function getRouteFromPathname(): SiteRoute {
  return appRouteFromPathname(window.location.pathname);
}

function Brand({
  onBrandClick,
}: {
  onBrandClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { language } = useLanguage();

  return (
    <div className="brand-lockup">
      <a
        className="brand"
        href="#top"
        aria-label="返回页面顶部"
        onClick={onBrandClick}
      >
        <span className="brand__icon-frame" aria-hidden="true">
          <img
            className="brand__icon"
            src={publicUrl("/assets/YumChick/YumChick-iOS-Default-256.png")}
            alt=""
          />
        </span>
        <span className="brand__name">
          {language === "en" ? "YumChicken" : "馋香鸡"}
        </span>
      </a>
    </div>
  );
}

function StoreButton({
  label,
  href,
  icon,
  compact = false,
  glass = false,
}: {
  label: string;
  href: string;
  icon: "android" | "appstore";
  compact?: boolean;
  glass?: boolean;
}) {
  return (
    <a
      className={[
        "download-button",
        compact && "download-button--compact",
        glass && "download-button--glass",
      ]
        .filter(Boolean)
        .join(" ")}
      data-store={icon}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="download-button__content">
        <img
          className="download-button__store-icon"
          src={publicUrl(`/assets/YumChick/${icon === "android" ? "android-mono" : "appstore"}.svg`)}
          alt=""
          aria-hidden="true"
        />
        <span className="download-button__label">{label}</span>
        <IoArrowForward className="download-button__arrow" aria-hidden="true" />
      </span>
    </a>
  );
}

function HomeFooter() {
  const { language } = useLanguage();

  return (
    <footer className="home-footer">
      <div className="home-footer__content">
        <div className="home-footer__downloads">
          <StoreButton label="App Store" href={APP_STORE_URL} icon="appstore" />
          <StoreButton label={language === "zh" ? "下载 APK" : "Get APK"} href={APK_URL} icon="android" />
        </div>

        <nav className="home-footer__socials" aria-label="Contact and social links">
          {SOCIAL_LINKS.map((social) => {
            const isExternal = social.href.startsWith("http");

            return (
              <a
                className="home-footer__social"
                href={social.href}
                key={social.label}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                title={social.label}
              >
                <img
                  src={publicUrl(`/assets/figma-social-icons/${social.icon}`)}
                  alt=""
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </nav>
      </div>

      <div className="home-footer__controls" aria-label="Appearance and language">
        <FooterThemeToggle />
        <FooterLanguageToggle />
      </div>
      <div className="home-footer__wordmark" aria-hidden="true">
        YumChicken
      </div>
      <a
        className="home-footer__credit"
        href="https://jazminli.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Jazmín's homepage"
        lang="en"
      >
        <span className="home-footer__credit-prefix">by </span>Jazmín
      </a>
    </footer>
  );
}

function HomePage() {
  const { language } = useLanguage();

  return (
    <>
      <GradientIntro
        actions={(
          <div className="hero__actions" data-language={language}>
            <div className="hero__download-wrap">
              <StoreButton label="App Store" href={APP_STORE_URL} icon="appstore" />
            </div>
            <StoreButton label={language === "zh" ? "下载 APK" : "Get APK"} href={APK_URL} icon="android" glass />
          </div>
        )}
      />
      <FeatureCarousel />
      <HomeFooter />
    </>
  );
}

export function App() {
  const headerRef = useRef<HTMLElement>(null);
  const enterFrameRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { language } = useLanguage();
  const [route, setRoute] = useState<SiteRoute>(getRouteFromPathname);
  const [pagePhase, setPagePhase] = useState<PagePhase>("idle");
  const [headerGradientVisible, setHeaderGradientVisible] = useState(
    () => usesSettledGradientHeader(getRouteFromPathname()),
  );
  const [readyLegalRoute, setReadyLegalRoute] = useState<"privacy" | "support" | null>(null);

  useEffect(() => {
    // Gradient headers are entirely CSS-driven, as on the personal homepage.
    if (route === "home" || usesSettledGradientHeader(route)) return;
    let frameId: number | null = null;

    const updateHeaderGlass = () => {
      frameId = null;
      const revealDistance = window.innerWidth <= 640 ? 60 : 80;
      const progress = Math.min(
        Math.max((window.scrollY - 4) / revealDistance, 0),
        1,
      );
      headerRef.current?.style.setProperty(
        "--header-scroll-progress",
        progress.toFixed(4),
      );
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateHeaderGlass);
      }
    };

    updateHeaderGlass();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [route]);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getRouteFromPathname();
      window.scrollTo(0, 0);
      if (isLegalRoute(nextRoute)) setReadyLegalRoute(null);
      setRoute(nextRoute);
      setHeaderGradientVisible(usesSettledGradientHeader(nextRoute));
      setPagePhase("entering");
      enterFrameRef.current = window.requestAnimationFrame(() => {
        setPagePhase("idle");
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    switch (route) {
      case "privacy":
        document.title = language === "zh"
          ? "馋香鸡 - 隐私政策"
          : "YumChicken - Privacy Policy";
        break;
      case "support":
        document.title = language === "zh"
          ? "馋香鸡 - 支持"
          : "YumChicken - Support";
        break;
      case "home":
        document.title = homeTitleForLanguage(language);
        break;
    }
  }, [language, route]);

  useEffect(() => {
    return () => {
      if (enterFrameRef.current !== null) {
        window.cancelAnimationFrame(enterFrameRef.current);
      }
    };
  }, []);

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const usesStaticPageContent = usesSettledGradientHeader(route);

  return (
    <div className={`site-shell${route === "home" || usesSettledGradientHeader(route) ? " site-shell--gradient" : ""}`} id="top">
        <header ref={headerRef} className={route === "home" ? "gradient-navigation" : usesSettledGradientHeader(route) ? "gradient-navigation gradient-navigation--settled" : "site-header"}>
        <div
          className={`gradient-navigation__transition${headerGradientVisible ? " gradient-navigation__transition--visible" : ""}`}
          aria-hidden="true"
        />
        <div className="site-header__inner">
          <div className="site-header__brand-reveal">
            <Brand
              onBrandClick={handleBrandClick}
            />
          </div>

          <nav className="site-nav" aria-label="Primary navigation">
            <div className="site-nav__item-reveal site-nav__item-reveal--download">
              <StoreButton label="App Store" href={APP_STORE_URL} icon="appstore" compact />
            </div>
            <div className="site-nav__item-reveal site-nav__item-reveal--download">
              <StoreButton label={language === "zh" ? "下载 APK" : "Get APK"} href={APK_URL} icon="android" compact />
            </div>
          </nav>
        </div>
        </header>

      <div className="site-page-surface">
      <main
        className={`page-content page-content--${pagePhase}${usesStaticPageContent ? " page-content--static" : ""}`}
        aria-busy={pagePhase !== "idle"}
      >
        {isLegalRoute(route) ? (
          <>
            <Suspense fallback={<div className="legal-module-loading" />}>
              <LegalPage
                document={route}
                onReady={() => setReadyLegalRoute(route)}
              />
            </Suspense>
            {readyLegalRoute === route ? <HomeFooter /> : null}
          </>
        ) : (
          <HomePage />
        )}
      </main>
      </div>
    </div>
  );
}
