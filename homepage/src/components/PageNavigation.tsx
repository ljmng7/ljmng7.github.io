import { profile } from "../data/profile";
import { useLanguage } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function PageNavigation({ play = false, hidden = false }: { play?: boolean; hidden?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const { theme, setMode } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const chinese = language === "zh";
  const page = chinese ? "个人主页" : "Personal page";
  return <nav className="page-navigation" data-play={play || undefined} data-hidden={hidden || undefined} aria-label={page}>
    <a className="page-identity" href="/" lang="en" aria-label={`${profile.name} — ${page}`}>{profile.name}</a>
    <div className="page-navigation-links" lang={chinese ? "zh-CN" : "en"}>
      <a className="page-navigation-item" href="/#work">{chinese ? "作品" : "WORK"}</a>
      <a className="page-navigation-item page-navigation-play" href="/play" aria-current={play ? "page" : undefined}>{chinese ? "乐园" : "PLAY"}</a>
      <a className="page-navigation-item" href="/#contact">{chinese ? "联系" : "CONTACT"}</a>
      <button className="page-navigation-language" onClick={() => setLanguage(chinese ? "en" : "zh")} aria-label={chinese ? "Switch to English" : "切换到中文"}>{chinese ? "EN" : "中文"}</button>
      <button type="button" className="page-navigation-theme" onClick={() => {
          if (play) {
            // Use the sky control's existing orbit and re-entry guard.
            document.querySelector<HTMLButtonElement>('.site-page[data-page="play"] .mb-celestial-body:not([disabled])')?.click();
          } else setMode(nextTheme);
        }}
        aria-label={chinese ? `切换到${nextTheme === "dark" ? "深色" : "浅色"}模式` : `Switch to ${nextTheme} mode`}
        title={chinese ? (nextTheme === "dark" ? "深色" : "浅色") : (nextTheme === "dark" ? "Dark" : "Light")}>
        <Sun className="page-theme-sun" aria-hidden="true" />
        <Moon className="page-theme-moon" aria-hidden="true" />
      </button>
    </div>
  </nav>;
}
