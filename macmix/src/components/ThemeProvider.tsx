import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export type ThemeMode = Theme | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemeMode = (value: string | undefined): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

const readDocumentTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const readDocumentMode = (): ThemeMode => {
  const mode = document.documentElement.dataset.themeMode;
  return isThemeMode(mode) ? mode : "system";
};

const resolveTheme = (mode: ThemeMode, systemIsDark: boolean): Theme =>
  mode === "system" ? (systemIsDark ? "dark" : "light") : mode;

const applyThemeToDocument = (theme: Theme, mode: ThemeMode) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.dataset.themeMode = mode;
  root.style.colorScheme = theme;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readDocumentMode);
  const [theme, setThemeState] = useState<Theme>(readDocumentTheme);

  const setMode = useCallback((nextMode: ThemeMode) => {
    const nextTheme = resolveTheme(
      nextMode,
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
    applyThemeToDocument(nextTheme, nextMode);
    setModeState(nextMode);
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystemTheme = (event: MediaQueryListEvent) => {
      if (document.documentElement.dataset.themeMode !== "system") return;

      const nextTheme = event.matches ? "dark" : "light";
      applyThemeToDocument(nextTheme, "system");
      setThemeState(nextTheme);
      setModeState("system");
    };

    colorScheme.addEventListener("change", followSystemTheme);
    return () => colorScheme.removeEventListener("change", followSystemTheme);
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, theme }),
    [mode, setMode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}
