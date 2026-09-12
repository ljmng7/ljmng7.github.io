import { useLayoutEffect, useRef } from "react";
import { PhotographyGallery } from "./PhotographyGallery";
import { HelloIntro } from "./HelloIntro";
import { useLanguage } from "./LanguageProvider";
import { profile } from "../data/profile";
import "./paper-homepage.css";

function WorkLink({ href, children }: { href: string; children: string }) {
  return <a className="page-work-link" href={href} target="_blank" rel="noopener noreferrer">
    <span>{children.split("").map((part, index) => <span key={index}>{index > 0 && <span className="page-work-apple"></span>}{part}</span>)}</span>
    <span className="page-work-link-arrow" aria-hidden="true">
      {["outgoing", "incoming"].map((copy) => <svg key={copy} className={`page-work-link-arrow--${copy}`} viewBox="0 0 24 24" fill="none">
        <path d="M6.5 17.5 17.5 6.5M8.5 6.5h9v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>)}
    </span>
  </a>;
}

export function PaperHomepage() {
  const { language, messages } = useLanguage();
  const pageRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const measure = () => {
      if (page.closest("[inert]")) return;
      const hero = page.querySelector<HTMLElement>(".page-gradient-hero")!;
      const navigation = document.querySelector<HTMLElement>(".page-navigation");
      const start = Math.max(0, hero.offsetHeight - (navigation?.offsetHeight ?? 68));
      // Use absolute document distances, not the changing scrollable range:
      // Safari expands that range while its browser toolbar retracts.
      const end = Math.max(start + 1, page.offsetHeight);
      page.style.setProperty("--hero-pin-start", `${start}px`);
      page.style.setProperty("--hero-pin-end", `${end}px`);
      page.style.setProperty("--hero-pin-travel", `${Math.max(0, end - start)}px`);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(page);
    resize.observe(page.querySelector(".page-gradient-hero")!);
    const navigation = document.querySelector(".page-navigation");
    if (navigation) resize.observe(navigation);
    measure();
    return () => resize.disconnect();
  }, []);
  return <main className="paper-homepage" id="home" ref={pageRef}>
    <div className="page-gradient-hero">
      <div className="page-gradient-visual">
        <div className="page-gradient-colors" aria-hidden="true" />
        <HelloIntro />
      </div>
    </div>
    <section className="page-work" aria-label={messages.projects.sectionLabel}>
      <div id="work" className="page-work-anchor" aria-hidden="true" />
      <div className="page-work-grid">
        <article className="page-work-project page-work-project--macmix">
          <a className="page-work-media page-work-media--macmix" href="https://macmix.jazminli.com/" target="_blank" rel="noopener noreferrer" aria-label={`MacMix · ${messages.projects.visitWebsite}`} />
          <h2 className="page-work-title" lang="en">MacMix</h2>
          <p className="page-work-description">{messages.projects.macMixDescription}</p>
          <div className="page-work-links">
            <WorkLink href="https://macmix.jazminli.com/">{messages.projects.workWebsite}</WorkLink>
            <WorkLink href="https://download.jazminli.com/MacMix/MacMix.dmg">{messages.projects.workDownloadMac}</WorkLink>
            <WorkLink href="https://github.com/ljmng7/MacMix">GitHub</WorkLink>
          </div>
        </article>
        <article className="page-work-project page-work-project--yumchicken">
          <a className="page-work-media page-work-media--yumchicken" href="https://yumchicken.jazminli.com/" target="_blank" rel="noopener noreferrer" aria-label={`${messages.projects.yumChickenName} · ${messages.projects.visitWebsite}`} />
          <h2 className="page-work-title">{messages.projects.yumChickenName}</h2>
          <p className="page-work-description">{messages.projects.yumChickenDescription}</p>
          <div className="page-work-links">
            <WorkLink href="https://yumchicken.jazminli.com/">{messages.projects.workWebsite}</WorkLink>
            <WorkLink href="https://apps.apple.com/us/app/%E9%A6%8B%E9%A6%99%E9%B8%A1/id6759188913">App Store</WorkLink>
            <WorkLink href="https://github.com/ljmng7/YumChicken-Android-Release/releases/download/v1.2.4/YumChick-v1.2.4.apk">{messages.projects.workDownloadApk}</WorkLink>
          </div>
        </article>
        <div className="page-work-more">
          <p className="page-work-description">{messages.projects.morePrompt}</p>
          <WorkLink href="https://github.com/ljmng7">{messages.projects.moreLink}</WorkLink>
        </div>
      </div>
    </section>
    <PhotographyGallery />
    <section id="contact" className="page-contact" lang={language === "zh" ? "zh-CN" : "en"} aria-labelledby="contact-title">
      <h2 id="contact-title" className="page-contact-title">{messages.contact.title}</h2>
      <div className="page-contact-intro">
        <div className="page-contact-profile">
          <img className="page-contact-avatar" src={profile.avatarUrl} alt="Jazmín" width="72" height="72" />
          <h3 className="page-work-title">{messages.contact.name}</h3>
          <p className="page-contact-subtitle">{messages.contact.role}</p>
        </div>
        <p>{messages.contact.interests}</p>
        <p>{messages.contact.hobbies}</p>
      </div>
      <div className="page-contact-links">
        <WorkLink href="https://github.com/ljmng7">GitHub</WorkLink>
        <WorkLink href="https://x.com/jazminli57">Twitter / 𝕏</WorkLink>
        <WorkLink href="https://www.threads.com/@lucid.jasmine">Threads</WorkLink>
        <WorkLink href="https://www.xiaohongshu.com/user/profile/66a6d5f2000000001d020f1b">{messages.contact.rednote}</WorkLink>
        <WorkLink href="https://www.instagram.com/lucid.jasmine/">Instagram</WorkLink>
        <WorkLink href="mailto:jasmine@jazminli.com">{messages.contact.email}</WorkLink>
      </div>
    </section>
  </main>;
}
