import { Check, Home, Languages, Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AnimatedThemeToggler } from "./AnimatedThemeToggler";
import { Dock, DockIcon } from "./Dock";
import { useLanguage, type Language } from "./LanguageProvider";
import { useTheme, type Theme, type ThemeMode } from "./ThemeProvider";

const appItems = [
  {
    id: "home",
    href: "#home",
    icon: "home",
    label: "Home",
  },
  {
    id: "yumChicken",
    href: "/YumChicken.html",
    icon: "/assets/YumChicken/YumChick-iOS-Default-web-256.png",
    darkIcon: "/assets/YumChicken/YumChick-iOS-Dark-web-256.png",
    label: "馋香鸡",
  },
  {
    id: "macMix",
    href: "https://github.com/ljmng7/MacMix",
    icon: "/assets/MacMix/MacMix-macOS-Default-web-256.png",
    darkIcon: "/assets/MacMix/MacMix-macOS-Dark-web-256.png",
    label: "MacMix",
  },
] as const;

const socialItems = [
  {
    id: "github",
    href: "https://github.com/ljmng7",
    darkInvert: true,
    icon: "/assets/figma-social-icons/github-original.svg",
    label: "GitHub",
  },
  {
    id: "rednote",
    href: "https://www.xiaohongshu.com/user/profile/66a6d5f2000000001d020f1b",
    icon: "/assets/figma-social-icons/xiaohongshu-original.svg",
    label: "小红书",
  },
  {
    id: "tiktok",
    href: "https://v.douyin.com/aTWTd9BPAFI/",
    icon: "/assets/figma-social-icons/tiktok-original.svg",
    label: "抖音",
  },
  {
    id: "x",
    href: "https://x.com/ming_li28643",
    darkInvert: true,
    icon: "/assets/figma-social-icons/x-original.svg",
    label: "X",
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/lucid.jasmine/",
    icon: "/assets/figma-social-icons/instagram-original.svg",
    label: "Instagram",
  },
  {
    id: "email",
    href: "mailto:jazmin_li@icloud.com",
    icon: "/assets/figma-social-icons/email-original.svg",
    label: "Email",
  },
] as const;

export function HomepageDock() {
  const { language, messages, setLanguage } = useLanguage();
  const { mode, setMode, theme } = useTheme();
  const dockShellRef = useRef<HTMLDivElement>(null);
  const dockOffsetY = useMotionValue(0);
  const smoothDockOffsetY = useSpring(dockOffsetY, {
    mass: 0.18,
    stiffness: 900,
    damping: 28,
  });
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 560px)").matches,
  );
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isWechatOpen, setIsWechatOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 560px)");
    const updateCompactMode = () => setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateCompactMode);
    return () => mediaQuery.removeEventListener("change", updateCompactMode);
  }, []);

  useEffect(() => {
    const dockShell = dockShellRef.current;
    const stopTarget = document.querySelector<HTMLElement>("[data-dock-stop]");
    if (!dockShell || !stopTarget) return;

    let animationFrame = 0;
    const stopGap = isCompact ? 14 : 20;

    const updateDockOffset = () => {
      animationFrame = 0;
      const dockHeight = dockShell.offsetHeight;
      const fixedBottom = Number.parseFloat(getComputedStyle(dockShell).bottom) || 0;
      const fixedDockTop = window.innerHeight - fixedBottom - dockHeight;
      const stoppedDockTop = stopTarget.getBoundingClientRect().top - stopGap - dockHeight;
      dockOffsetY.set(Math.min(0, stoppedDockTop - fixedDockTop));
    };

    const scheduleDockUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateDockOffset);
    };

    const resizeObserver = new ResizeObserver(scheduleDockUpdate);
    resizeObserver.observe(dockShell);
    resizeObserver.observe(stopTarget);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", scheduleDockUpdate, { passive: true });
    window.addEventListener("resize", scheduleDockUpdate);
    updateDockOffset();

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleDockUpdate);
      window.removeEventListener("resize", scheduleDockUpdate);
    };
  }, [dockOffsetY, isCompact]);

  useEffect(() => {
    if (!isLanguageMenuOpen && !isThemeMenuOpen && !isWechatOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!dockShellRef.current?.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
        setIsThemeMenuOpen(false);
        setIsWechatOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false);
        setIsThemeMenuOpen(false);
        setIsWechatOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isLanguageMenuOpen, isThemeMenuOpen, isWechatOpen]);

  const themeOptions = [
    { Icon: Sun, label: messages.dock.lightMode, mode: "light" },
    { Icon: Moon, label: messages.dock.darkMode, mode: "dark" },
    { Icon: Monitor, label: messages.dock.systemMode, mode: "system" },
  ] as const satisfies ReadonlyArray<{
    Icon: typeof Sun;
    label: string;
    mode: ThemeMode;
  }>;
  const languageOptions = [
    { code: "中", label: messages.dock.chinese, language: "zh" },
    { code: "EN", label: messages.dock.english, language: "en" },
  ] as const satisfies ReadonlyArray<{
    code: string;
    label: string;
    language: Language;
  }>;

  const resolveOptionTheme = (optionMode: ThemeMode): Theme =>
    optionMode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : optionMode;

  const ThemeModeIcon = mode === "system" ? Monitor : mode === "dark" ? Moon : Sun;

  const iconSize = isCompact ? 25 : 40;
  const iconMagnification = isCompact ? 37 : 60;
  const iconDistance = isCompact ? 80 : 140;

  return (
    <div className="homepage-dock-shell" ref={dockShellRef}>
      <motion.div className="homepage-dock-motion" style={{ y: smoothDockOffsetY }}>
        {isWechatOpen ? (
          <div
            className="homepage-dock-wechat-card"
            role="dialog"
            aria-label={messages.dock.wechatQr}
          >
            <img
              src="/assets/微信公众号.JPG"
              alt={`Jazmin.dev ${messages.dock.wechatQr}`}
            />
            <span>Jazmin.dev</span>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {isThemeMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label={messages.dock.colorMode}
              className="homepage-dock-theme-menu"
              exit={{ opacity: 0, scale: 0.97, y: 5 }}
              initial={{ opacity: 0, scale: 0.97, y: 5 }}
              role="menu"
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {themeOptions.map((option) => (
                <AnimatedThemeToggler
                  aria-checked={mode === option.mode}
                  aria-label={
                    language === "zh"
                      ? `切换到${option.label}模式`
                      : `Use ${option.label.toLowerCase()} mode`
                  }
                  className="homepage-dock-theme-option"
                  key={option.mode}
                  nextTheme={resolveOptionTheme(option.mode)}
                  onThemeChange={() => {
                    setMode(option.mode);
                    setIsThemeMenuOpen(false);
                  }}
                  role="menuitemradio"
                  theme={theme}
                >
                  <option.Icon aria-hidden="true" />
                  <span>{option.label}</span>
                  <Check aria-hidden="true" className="homepage-dock-theme-check" />
                </AnimatedThemeToggler>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {isLanguageMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label={messages.dock.language}
              className="homepage-dock-theme-menu homepage-dock-language-menu"
              exit={{ opacity: 0, scale: 0.97, y: 5 }}
              initial={{ opacity: 0, scale: 0.97, y: 5 }}
              role="menu"
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {languageOptions.map((option) => (
                <button
                  aria-checked={language === option.language}
                  aria-label={
                    option.language === "zh" ? "切换为中文" : "Switch to English"
                  }
                  className="homepage-dock-theme-option"
                  key={option.language}
                  onClick={() => {
                    setLanguage(option.language);
                    setIsLanguageMenuOpen(false);
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  <span aria-hidden="true" className="homepage-dock-language-code">
                    {option.code}
                  </span>
                  <span>{option.label}</span>
                  <Check aria-hidden="true" className="homepage-dock-theme-check" />
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <nav aria-label={messages.dock.navigationLabel}>
          <Dock
            direction="middle"
            iconDistance={iconDistance}
            iconMagnification={iconMagnification}
            iconSize={iconSize}
          >
          {appItems.map((item) => {
            const itemLabel =
              item.id === "home"
                ? messages.dock.home
                : item.id === "yumChicken"
                  ? messages.projects.yumChickenName
                  : item.label;
            return (
            <DockIcon key={item.label}>
              <a
                className="homepage-dock-item"
                data-tooltip={itemLabel}
                href={item.href}
                target={item.href.startsWith("http") || item.href.endsWith(".html") ? "_blank" : undefined}
                rel={item.href.startsWith("http") || item.href.endsWith(".html") ? "noopener noreferrer" : undefined}
                aria-label={itemLabel}
              >
                {item.icon === "home" ? (
                  <Home className="homepage-dock-home-icon" aria-hidden="true" />
                ) : (
                  <img
                    className="homepage-dock-app-icon"
                    src={theme === "dark" && "darkIcon" in item ? item.darkIcon : item.icon}
                    alt=""
                    aria-hidden="true"
                  />
                )}
              </a>
            </DockIcon>
            );
          })}

          <div className="homepage-dock-separator" aria-hidden="true" />

          {socialItems.slice(0, 3).map((item) => {
            const itemLabel =
              item.id === "rednote"
                ? messages.dock.rednote
                : item.id === "tiktok"
                  ? messages.dock.tiktok
                  : item.label;
            return (
            <DockIcon key={item.id}>
              <a
                className="homepage-dock-item"
                data-tooltip={itemLabel}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={itemLabel}
              >
                <img
                  className={[
                    "homepage-dock-social-icon",
                    "darkInvert" in item && item.darkInvert
                      ? "homepage-dock-social-icon--dark-invert"
                      : "",
                  ].filter(Boolean).join(" ")}
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                />
              </a>
            </DockIcon>
            );
          })}

          <DockIcon>
            <button
              className="homepage-dock-item"
              data-tooltip={messages.dock.wechat}
              type="button"
              aria-expanded={isWechatOpen}
              aria-label={messages.dock.wechat}
              onClick={() => {
                setIsLanguageMenuOpen(false);
                setIsThemeMenuOpen(false);
                setIsWechatOpen((open) => !open);
              }}
            >
              <img
                className="homepage-dock-social-icon"
                src="/assets/figma-social-icons/wechat-original.svg"
                alt=""
                aria-hidden="true"
              />
            </button>
          </DockIcon>

          {socialItems.slice(3).map((item) => (
            <DockIcon key={item.label}>
              <a
                className="homepage-dock-item"
                data-tooltip={item.label}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={item.label}
              >
                <img
                  className={[
                    "homepage-dock-social-icon",
                    "darkInvert" in item && item.darkInvert
                      ? "homepage-dock-social-icon--dark-invert"
                      : "",
                  ].filter(Boolean).join(" ")}
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                />
              </a>
            </DockIcon>
          ))}

          <div className="homepage-dock-separator" aria-hidden="true" />

          <DockIcon>
            <button
              aria-expanded={isThemeMenuOpen}
              aria-haspopup="menu"
              aria-label={messages.dock.colorMode}
              className="homepage-dock-item homepage-dock-theme-toggle"
              data-tooltip={messages.dock.colorMode}
              onClick={() => {
                setIsLanguageMenuOpen(false);
                setIsWechatOpen(false);
                setIsThemeMenuOpen((open) => !open);
              }}
              type="button"
            >
              <ThemeModeIcon aria-hidden="true" />
            </button>
          </DockIcon>

          <DockIcon>
            <button
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="menu"
              aria-label={messages.dock.language}
              className="homepage-dock-item homepage-dock-theme-toggle"
              data-tooltip={messages.dock.language}
              onClick={() => {
                setIsThemeMenuOpen(false);
                setIsWechatOpen(false);
                setIsLanguageMenuOpen((open) => !open);
              }}
              type="button"
            >
              <Languages aria-hidden="true" />
            </button>
          </DockIcon>
          </Dock>
        </nav>
      </motion.div>
    </div>
  );
}
