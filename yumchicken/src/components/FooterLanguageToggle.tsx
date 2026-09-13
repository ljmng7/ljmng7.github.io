import { useLanguage } from "./LanguageProvider";

export function FooterLanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const chinese = language === "zh";

  return (
    <button
      type="button"
      className="home-footer__language"
      onClick={() => setLanguage(chinese ? "en" : "zh")}
      aria-label={chinese ? "Switch to English" : "切换到中文"}
    >
      {chinese ? "EN" : "中文"}
    </button>
  );
}

