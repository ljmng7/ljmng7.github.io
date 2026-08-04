import type { ComponentPropsWithoutRef } from "react";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { useLanguage } from "./LanguageProvider";
import { SparklesText } from "./SparklesText";
import { useTheme } from "./ThemeProvider";

interface ThemeImageProps {
  alt: string;
  className: string;
  darkSrc: string;
  lightSrc: string;
}

function ThemeImage({ alt, className, darkSrc, lightSrc }: ThemeImageProps) {
  const { theme } = useTheme();
  return <img className={className} src={theme === "dark" ? darkSrc : lightSrc} alt={alt} />;
}

function YumChickenIcon(props: ComponentPropsWithoutRef<"img">) {
  const { theme } = useTheme();
  return (
    <img
      {...props}
      alt=""
      src={
        theme === "dark"
          ? "/assets/YumChicken/YumChick-iOS-Dark-web-256.png"
          : "/assets/YumChicken/YumChick-iOS-Default-web-256.png"
      }
    />
  );
}

function MacMixIcon(props: ComponentPropsWithoutRef<"img">) {
  const { theme } = useTheme();
  return (
    <img
      {...props}
      alt=""
      src={
        theme === "dark"
          ? "/assets/MacMix/MacMix-macOS-Dark-web-256.png"
          : "/assets/MacMix/MacMix-macOS-Default-web-256.png"
      }
    />
  );
}

export function ProjectsPreview() {
  const { language, messages } = useLanguage();
  const projects = [
    {
      Icon: YumChickenIcon,
      actions: (
        <div className="bento-project-actions bento-project-actions--yumchicken">
          <a
            className="bento-project-button bento-project-button--website"
            href="/YumChicken.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.projects.visitWebsite}
          </a>
          <a
            className="bento-project-store-link"
            href="https://apps.apple.com/us/app/%E9%A6%8B%E9%A6%99%E9%B8%A1/id6759188913"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.projects.appStoreAriaLabel}
          >
            <ThemeImage
              className="bento-project-store-badge"
              lightSrc={`/assets/Download_on_App_Store/Download_on_the_App_Store_Badge_${language === "zh" ? "CNSC" : "US-UK"}_RGB_blk_092917.svg`}
              darkSrc={`/assets/Download_on_App_Store/Download_on_the_App_Store_Badge_${language === "zh" ? "CNSC" : "US-UK"}_RGB_wht_092917.svg`}
              alt={messages.projects.appStoreAlt}
            />
          </a>
          <a
            className="bento-project-button bento-project-button--download"
            href="https://github.com/ljmng7/YumChicken-Android-Release/releases/download/v1.2.4/YumChick-v1.2.4.apk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="bento-project-button-icon"
              src="/assets/Android_logo_2023.svg"
              alt=""
              aria-hidden="true"
            />
            <span>{messages.projects.downloadApk}</span>
          </a>
        </div>
      ),
      background: (
        <div className="bento-screenshot-frame bento-screenshot-frame--yumchicken">
          <ThemeImage
            className="bento-screenshot"
            lightSrc="/assets/YumChicken.png"
            darkSrc="/assets/YumChicken_Dark.png"
            alt=""
          />
        </div>
      ),
      className: "bento-card--narrow bento-card--yumchicken",
      description: messages.projects.yumChickenDescription,
      name: messages.projects.yumChickenName,
    },
    {
      Icon: MacMixIcon,
      actions: (
        <div className="bento-project-actions bento-project-actions--macmix">
          <a
            className="bento-project-button bento-project-button--download"
            href="https://github.com/ljmng7/MacMix"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="bento-project-button-icon"
              src="/assets/figma-social-icons/github-original.svg"
              alt=""
              aria-hidden="true"
            />
            <span>GitHub</span>
          </a>
          <a
            className="bento-project-store-link"
            href="https://github.com/ljmng7/MacMix/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.projects.macMixDownloadAriaLabel}
          >
            <ThemeImage
              className="bento-project-store-badge"
              lightSrc="/assets/MacMix/download.png"
              darkSrc="/assets/MacMix/download_Dark.png"
              alt={messages.projects.macMixDownloadAlt}
            />
          </a>
        </div>
      ),
      background: (
        <div className="bento-screenshot-frame bento-screenshot-frame--macmix">
          <img
            className="bento-screenshot"
            src={language === "zh" ? "/assets/MacMix/screenshot_cn.png" : "/assets/MacMix/screenshot.png"}
            alt=""
          />
        </div>
      ),
      className: "bento-card--wide bento-card--macmix",
      description: messages.projects.macMixDescription,
      name: "MacMix",
    },
  ] as const;

  return (
    <section id="works" className="projects-preview" aria-label={messages.projects.sectionLabel}>
      <div className="container">
        <h2 className="projects-preview-title">
          <SparklesText>{messages.projects.title}</SparklesText>
        </h2>
        <BentoGrid>
          {projects.map((project) => (
            <BentoCard key={project.name} {...project} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
