import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "zh" | "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const metadata = {
  zh: {
    description: "馋香鸡是一款简洁的本地菜谱与做饭助手。",
    homeTitle: "馋香鸡 - 专注做饭的极简工具",
  },
  en: {
    description: "YumChicken is a simple, local recipe and cooking companion.",
    homeTitle: "YumChicken - A Minimalist Cooking Tool",
  },
} as const;

const readDocumentLanguage = (): Language =>
  document.documentElement.dataset.language === "en" ? "en" : "zh";

const applyLanguageToDocument = (language: Language) => {
  const root = document.documentElement;
  root.lang = language === "zh" ? "zh-CN" : "en";
  root.dataset.language = language;
  document.title = metadata[language].homeTitle;
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.setAttribute("content", metadata[language].description);
};

export const homeTitleForLanguage = (language: Language) =>
  metadata[language].homeTitle;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readDocumentLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    applyLanguageToDocument(nextLanguage);
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem("language", nextLanguage);
    } catch {
      // Switching still works when browser storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }
  return context;
}
