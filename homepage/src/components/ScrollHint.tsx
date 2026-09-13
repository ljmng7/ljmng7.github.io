import { ArrowDown } from "lucide-react";
import type { Ref } from "react";
import { useLanguage } from "./LanguageProvider";
import "./scroll-hint.css";

export function ScrollHint({ ref }: { ref: Ref<HTMLDivElement> }) {
  const { language, messages } = useLanguage();
  return (
    <div ref={ref} className="page-scroll-hint" lang={language === "zh" ? "zh-CN" : "en"}>
      <ArrowDown className="page-scroll-hint-arrow" aria-hidden="true" />
      <span className="page-scroll-hint-label">{messages.scrollHint}</span>
    </div>
  );
}
