import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "zh" | "en";

const messages = {
  zh: {
    metadata: {
      title: "Jazmín 的个人主页",
      description: "Jazmín 的个人主页、独立开发作品与 GitHub 项目。",
    },
    profile: {
      bio: "中科大本科在读，独立开发者",
      orbitText: "Jazmín • Think different. • 2007 •",
      orbitLabel: "Jazmín，Think different，2007",
      avatarAlt: "Jazmín 的头像",
      backToTop: "返回页面顶部",
      githubLabel: "在 GitHub 查看",
      githubAriaLabel: "在 GitHub 上查看 Jazmín 的主页",
    },
    projects: {
      sectionLabel: "精选应用",
      title: "作品",
      yumChickenName: "馋香鸡",
      yumChickenDescription: "专注做饭的极简工具",
      visitWebsite: "访问官网",
      downloadApk: "下载 APK",
      appStoreAriaLabel: "在 App Store 下载馋香鸡",
      appStoreAlt: "在 App Store 下载",
      macMixDescription: "轻量的 macOS 菜单栏音频混音器。",
      macMixDownloadAriaLabel: "下载 MacMix macOS 版",
      macMixDownloadAlt: "下载 macOS 版应用",
    },
    repositories: {
      sectionLabel: "公开 GitHub 仓库",
      title: "仓库",
      noDescription: "暂无简介。",
      archived: "已归档",
      fork: "复刻",
      stars: "星标",
      forks: "复刻",
      loading: "正在加载仓库",
      unavailable: "仓库暂时不可用。可前往",
      githubSuffix: "查看。",
    },
    contribution: {
      lastSixMonths: "最近六个月的 GitHub 贡献记录",
      rangePrefix: "GitHub 贡献记录：",
      rangeSeparator: "至",
      weekdays: ["周一", "周三", "周五"],
    },
    globe: {
      sectionLabel: "与 Jazmín 有联系的地点",
      markedLocations: "标记地点：永州、杭州和合肥。",
    },
    dock: {
      navigationLabel: "快捷链接",
      home: "主页",
      wechat: "微信",
      rednote: "小红书",
      tiktok: "抖音",
      wechatQr: "微信公众号二维码",
      colorMode: "颜色模式",
      lightMode: "浅色",
      darkMode: "深色",
      systemMode: "系统",
      language: "语言",
      chinese: "中文",
      english: "English",
    },
  },
  en: {
    metadata: {
      title: "Jazmín’s Homepage",
      description: "Jazmín’s personal homepage, independent apps, and GitHub projects.",
    },
    profile: {
      bio: "USTC Student, Independent developer",
      orbitText: "Jazmín • Think different. • 2007 •",
      orbitLabel: "Jazmín, Think different, 2007",
      avatarAlt: "Jazmín avatar",
      backToTop: "Back to top",
      githubLabel: "View me on",
      githubAriaLabel: "View Jazmín on GitHub",
    },
    projects: {
      sectionLabel: "Selected apps",
      title: "Works",
      yumChickenName: "Yum Chicken",
      yumChickenDescription: "A minimal tool focused on cooking.",
      visitWebsite: "Visit website",
      downloadApk: "Get APK",
      appStoreAriaLabel: "Download Yum Chicken on the App Store",
      appStoreAlt: "Download on the App Store",
      macMixDescription: "A lightweight macOS menu bar audio mixer.",
      macMixDownloadAriaLabel: "Download MacMix for macOS",
      macMixDownloadAlt: "Download app for macOS",
    },
    repositories: {
      sectionLabel: "Public GitHub repositories",
      title: "Repos",
      noDescription: "No description provided.",
      archived: "Archived",
      fork: "Fork",
      stars: "stars",
      forks: "forks",
      loading: "Loading repositories",
      unavailable: "Repositories are temporarily unavailable. View them on",
      githubSuffix: ".",
    },
    contribution: {
      lastSixMonths: "GitHub contribution activity for the last six months",
      rangePrefix: "GitHub contribution activity from",
      rangeSeparator: "to",
      weekdays: ["Mon", "Wed", "Fri"],
    },
    globe: {
      sectionLabel: "Places connected to Jazmín",
      markedLocations: "Marked locations: Yongzhou, Hangzhou, and Hefei.",
    },
    dock: {
      navigationLabel: "Quick links",
      home: "Home",
      wechat: "WeChat",
      rednote: "Rednote",
      tiktok: "TikTok",
      wechatQr: "WeChat official account QR code",
      colorMode: "Color mode",
      lightMode: "Light",
      darkMode: "Dark",
      systemMode: "System",
      language: "Language",
      chinese: "中文",
      english: "English",
    },
  },
} as const;

type Messages = (typeof messages)[Language];

interface LanguageContextValue {
  language: Language;
  messages: Messages;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const readDocumentLanguage = (): Language =>
  document.documentElement.dataset.language === "en" ? "en" : "zh";

const applyLanguageToDocument = (language: Language) => {
  const root = document.documentElement;
  const nextMessages = messages[language];
  root.lang = language === "zh" ? "zh-CN" : "en";
  root.dataset.language = language;
  document.title = nextMessages.metadata.title;
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.setAttribute("content", nextMessages.metadata.description);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readDocumentLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    applyLanguageToDocument(nextLanguage);
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem("language", nextLanguage);
    } catch {
      // Language switching still works when storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({ language, messages: messages[language], setLanguage }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}
