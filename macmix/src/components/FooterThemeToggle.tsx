import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "./ThemeProvider";

export function FooterThemeToggle() {
  const { theme, setMode } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="home-footer__theme"
      onClick={() => setMode(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={nextTheme === "dark" ? "Dark" : "Light"}
    >
      <IoSunnyOutline className="home-footer__theme-sun" aria-hidden="true" />
      <IoMoonOutline className="home-footer__theme-moon" aria-hidden="true" />
    </button>
  );
}
