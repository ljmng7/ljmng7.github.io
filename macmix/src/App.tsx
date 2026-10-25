import {
  IoArrowBack,
  IoArrowForward,
  IoLogoApple,
} from "react-icons/io5";
import { FaGithub } from "react-icons/fa6";
import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { FeatureCarousel } from "./components/FeatureCarousel";
import { ConfettiButton } from "./components/ConfettiButton";
import { FooterLanguageToggle } from "./components/FooterLanguageToggle";
import { FooterThemeToggle } from "./components/FooterThemeToggle";
import { GradientIntro } from "./components/GradientIntro";
import { homeTitleForLanguage, useLanguage } from "./components/LanguageProvider";
import { useGitHubReleases } from "./hooks/useGitHubReleases";
import { formatDisplayVersion } from "./lib/githubReleases";
import {
  appRouteFromPathname,
  appRoutePath,
  publicUrl,
  type AppRoute,
} from "./lib/sitePaths";

const DOWNLOAD_BASE_URL = "https://download.jazminli.com/MacMix/";
const DOWNLOAD_VARIANTS = [
  {
    id: "universal",
    name: "Universal",
    file: "MacMix.dmg",
    detail: { en: "All Macs", zh: "适用于所有 Mac" },
  },
  {
    id: "apple-silicon",
    name: "Apple Silicon",
    file: "MacMix-Apple-Silicon.dmg",
    detail: { en: "M-series chips", zh: "M 系列芯片" },
  },
  {
    id: "intel",
    name: "Intel",
    file: "MacMix-Intel.dmg",
    detail: { en: "Intel processors", zh: "Intel 处理器" },
  },
] as const;
const DOWNLOAD_URL = DOWNLOAD_BASE_URL + DOWNLOAD_VARIANTS[0].file;
const DOWNLOAD_MENU_CLOSE_DELAY = 160;
const STUDIO_CHECKOUT_URL =
  "https://checkout.dodopayments.com/buy/pdt_0NmJ2vOqulR07tfZqwKtU?quantity=1";
const ChangelogPage = lazy(() => import("./components/ChangelogPage"));
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
    href: "https://www.threads.com/@jazminli57",
    icon: "threads.svg",
  },
  {
    label: "小红书",
    href: "https://www.xiaohongshu.com/user/profile/66a6d5f2000000001d020f1b",
    icon: "xiaohongshu-black.svg",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/jazminli57/",
    icon: "instagram-black.svg",
  },
  {
    label: "Email",
    href: "mailto:jasmine@jazminli.com",
    icon: "email-black.svg",
  },
] as const;

type SiteRoute = AppRoute;
type PagePhase = "idle" | "leaving" | "entering";

function usesSettledGradientHeader(route: SiteRoute) {
  return (
    route === "changelog" ||
    route === "privacy-policy" ||
    route === "terms-of-use"
  );
}

function getRouteFromPathname(): SiteRoute {
  return appRouteFromPathname(window.location.pathname);
}

function Brand({
  version,
  onBrandClick,
  onVersionClick,
}: {
  version: string;
  onBrandClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onVersionClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { language } = useLanguage();
  const chinese = language === "zh";

  return (
    <div className="brand-lockup">
      <a
        className="brand"
        href="#top"
        aria-label={chinese ? "返回页面顶部" : "Back to top"}
        onClick={onBrandClick}
      >
        <span className="brand__icon-frame" aria-hidden="true">
          <img
            className="brand__icon"
            src={publicUrl("/assets/MacMix/MacMix-macOS-Default-web-256.png")}
            alt=""
          />
        </span>
        <span className="brand__name">MacMix</span>
      </a>
      <a
        className="brand__version"
        href={appRoutePath("changelog")}
        aria-label={chinese ? `打开 ${version} 更新日志` : `Open changelog for ${version}`}
        onClick={onVersionClick}
      >
        {version}
      </a>
    </div>
  );
}

function ChangelogRouteLink({
  isBack,
  isTransitioning,
  onClick,
}: {
  isBack: boolean;
  isTransitioning: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { language } = useLanguage();
  const chinese = language === "zh";
  const label = isBack
    ? chinese ? "返回主页" : "Back home"
    : chinese ? "更新日志" : "Changelog";

  return (
    <a
      className={[
        "header-link",
        "header-link--changelog",
        chinese && "header-link--zh",
        isBack && "header-link--back",
        isTransitioning && "header-link--transitioning",
      ]
        .filter(Boolean)
        .join(" ")}
      href={appRoutePath(isBack ? "home" : "changelog")}
      onClick={onClick}
      aria-label={label}
      aria-disabled={isTransitioning || undefined}
    >
      <span
        className="header-link__face header-link__face--changelog"
        aria-hidden={isBack}
      >
        <img
          className="header-link__icon header-link__icon--changelog"
          src={publicUrl("/assets/MacMix/svgs/text.square.and.bookmark.fill.svg")}
          alt=""
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
      <span
        className="header-link__face header-link__face--back"
        aria-hidden={!isBack}
      >
        <IoArrowBack
          className="header-link__icon header-link__back-arrow header-link__back-arrow--left"
          aria-hidden="true"
        />
        <span className="header-link__back-label">{label}</span>
        <IoArrowBack
          className="header-link__icon header-link__back-arrow header-link__back-arrow--right"
          aria-hidden="true"
        />
      </span>
    </a>
  );
}

function DownloadButton({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const chinese = language === "zh";
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [successfulVariants, setSuccessfulVariants] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeMenu = () => {
    cancelClose();
    setIsOpen(false);
    setIsPinned(false);
  };

  useEffect(() => cancelClose, []);

  // A click or tap pins the menu open; dismiss it from anywhere else.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const canHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handlePointerEnter = () => {
    if (!canHover()) {
      return;
    }
    cancelClose();
    setIsOpen(true);
  };

  const handlePointerLeave = () => {
    if (!canHover() || isPinned) {
      return;
    }
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsOpen(false);
    }, DOWNLOAD_MENU_CLOSE_DELAY);
  };

  const handleTriggerClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    cancelClose();
    if (isOpen && isPinned) {
      closeMenu();
      return;
    }
    setIsOpen(true);
    setIsPinned(true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!menuRef.current?.contains(event.relatedTarget as Node | null)) {
      closeMenu();
    }
  };

  const handleVariantClick = (variantId: string) => {
    if (successfulVariants.has(variantId)) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() =>
        setSuccessfulVariants((current) => new Set(current).add(variantId)),
      );
    });
  };

  return (
    <div
      ref={menuRef}
      className={[
        "download-menu",
        compact && "download-menu--compact",
        isOpen && "download-menu--open",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
    >
      <a
        ref={triggerRef}
        className={["download-button", compact && "download-button--compact"]
          .filter(Boolean)
          .join(" ")}
        data-language={language}
        href={DOWNLOAD_URL}
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleTriggerClick}
      >
        <span className="download-button__content">
          <IoLogoApple className="download-button__apple" aria-hidden="true" />
          <span className="download-button__label">
            {chinese ? "下载 Mac 版本" : "Download for Mac"}
          </span>
          <IoArrowForward className="download-button__arrow" aria-hidden="true" />
        </span>
      </a>

      <div
        className="download-menu__panel"
        role="menu"
        aria-label={chinese ? "选择下载版本" : "Choose a download"}
      >
        <div className="download-menu__list">
          {DOWNLOAD_VARIANTS.map((variant) => {
            const isSuccessful = successfulVariants.has(variant.id);

            return (
              <ConfettiButton
                key={variant.id}
                className={[
                  "download-menu__item",
                  isSuccessful && "download-menu__item--successful",
                ]
                  .filter(Boolean)
                  .join(" ")}
                href={DOWNLOAD_BASE_URL + variant.file}
                download={variant.file}
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                confettiDisabled={isSuccessful}
                effect={compact ? "fireworks" : "burst"}
                onClick={() => handleVariantClick(variant.id)}
                options={{
                  particleCount: 50,
                  spread: 45,
                  startVelocity: 45,
                  decay: 0.9,
                  gravity: 1,
                  ticks: 200,
                  scalar: 0.9,
                  zIndex: 100,
                  disableForReducedMotion: true,
                  colors: ["#6c9bea", "#c9dcff", "#f4c65d", "#f2766b", "#f5f2ec"],
                }}
              >
                <span className="download-menu__item-text" aria-hidden={isSuccessful}>
                  <span className="download-menu__item-name">{variant.name}</span>
                  <span className="download-menu__item-detail">
                    {chinese ? variant.detail.zh : variant.detail.en}
                  </span>
                </span>
                {isSuccessful ? (
                  <span className="download-menu__item-success" role="status" aria-live="polite">
                    Successfully!
                  </span>
                ) : null}
              </ConfettiButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer__content">
        <DownloadButton />

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
        MacMix
      </div>
      <a
        className="home-footer__credit"
        href="https://jazminli.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Jazmín's homepage"
        lang="en"
      >
        <span className="home-footer__credit-wordmark" aria-hidden="true" />
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
              <DownloadButton />
            </div>
            <a
              className="studio-button"
              href={STUDIO_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="studio-button__content">
                <span className="studio-button__icon-slot" aria-hidden="true">
                  <span
                    className="studio-button__icon"
                    style={{
                      "--studio-icon-url": `url("${publicUrl("/assets/MacMix/svgs/checkmark.seal.fill.svg")}")`,
                    } as CSSProperties}
                  />
                </span>
                <span className="studio-button__label">
                  <span>{language === "zh" ? "升级" : "Upgrade"}</span>
                  <span className="studio-button__studio">Studio</span>
                </span>
              </span>
            </a>
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
  const transitionTimerRef = useRef<number | null>(null);
  const enterFrameRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { language } = useLanguage();
  const [route, setRoute] = useState<SiteRoute>(getRouteFromPathname);
  const [pagePhase, setPagePhase] = useState<PagePhase>("idle");
  const [transitionTarget, setTransitionTarget] = useState<SiteRoute | null>(null);
  const [headerGradientVisible, setHeaderGradientVisible] = useState(
    () => usesSettledGradientHeader(getRouteFromPathname()),
  );
  const [isChangelogContentReady, setIsChangelogContentReady] = useState(false);
  const { releases, isLoading, error, retry } = useGitHubReleases();
  const latestVersion = releases[0]
    ? formatDisplayVersion(releases[0].tag_name)
    : "v…";

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
      case "changelog":
        document.title = language === "zh"
          ? "MacMix - 更新日志"
          : "MacMix - Changelog";
        break;
      case "privacy-policy":
        document.title = language === "zh"
          ? "MacMix - 隐私政策"
          : "MacMix - Privacy Policy";
        break;
      case "terms-of-use":
        document.title = language === "zh"
          ? "MacMix - 使用条款"
          : "MacMix - Terms of Use";
        break;
      case "home":
        document.title = homeTitleForLanguage(language);
        break;
    }
  }, [language, route]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (enterFrameRef.current !== null) {
        window.cancelAnimationFrame(enterFrameRef.current);
      }
    };
  }, []);

  const navigateTo = (nextRoute: SiteRoute) => {
    if (nextRoute === route || pagePhase === "leaving") {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      return;
    }

    setTransitionTarget(nextRoute);
    if (usesSettledGradientHeader(nextRoute)) setHeaderGradientVisible(true);
    setPagePhase("leaving");

    transitionTimerRef.current = window.setTimeout(
      () => {
        const nextPath = appRoutePath(nextRoute);
        window.history.pushState(null, "", nextPath);
        window.scrollTo(0, 0);
        setRoute(nextRoute);
        setHeaderGradientVisible(usesSettledGradientHeader(nextRoute));
        setTransitionTarget(null);
        setPagePhase("entering");

        enterFrameRef.current = window.requestAnimationFrame(() => {
          setPagePhase("idle");
        });
      },
      prefersReducedMotion ? 0 : 560,
    );
  };

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const handleVersionClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateTo("changelog");
  };

  const handleChangelogRouteClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateTo(route === "home" ? "changelog" : "home");
  };

  const showBackControl = transitionTarget
    ? transitionTarget !== "home"
    : route !== "home";
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
              version={latestVersion}
              onBrandClick={handleBrandClick}
              onVersionClick={handleVersionClick}
            />
          </div>

          <nav className="site-nav" aria-label="Primary navigation">
            <div className="site-nav__item-reveal site-nav__item-reveal--route">
              <ChangelogRouteLink
                isBack={showBackControl}
                isTransitioning={pagePhase === "leaving"}
                onClick={handleChangelogRouteClick}
              />
            </div>
            <div className="site-nav__item-reveal site-nav__item-reveal--download">
              <DownloadButton compact />
            </div>
          </nav>
        </div>
        </header>

      <div className="site-page-surface">
      <main
        className={`page-content page-content--${pagePhase}${usesStaticPageContent ? " page-content--static" : ""}`}
        aria-busy={pagePhase !== "idle"}
      >
        {route === "changelog" ? (
          <>
            <Suspense fallback={<div className="changelog-module-loading" />}>
              <ChangelogPage
                releases={releases}
                isLoading={isLoading}
                error={error}
                onRetry={retry}
                onReady={() => setIsChangelogContentReady(true)}
              />
            </Suspense>
            {isChangelogContentReady ? <HomeFooter /> : null}
          </>
        ) : route === "privacy-policy" || route === "terms-of-use" ? (
          <>
            <Suspense fallback={<div className="changelog-module-loading" />}>
              <LegalPage document={route} />
            </Suspense>
            <HomeFooter />
          </>
        ) : (
          <HomePage />
        )}
      </main>
      </div>
    </div>
  );
}
