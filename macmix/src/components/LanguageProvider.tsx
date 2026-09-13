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
    description: "MacMix：轻松掌控你的 Mac 音量。",
    homeTitle: "MacMix — 你的Mac音量，尽在MacMix",
  },
  en: {
    description: "Mac's sound. All in MacMix.",
    homeTitle: "MacMix — Mac's sound. All in MacMix.",
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
