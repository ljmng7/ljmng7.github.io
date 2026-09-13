import { useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { appRoutePath } from "../lib/sitePaths";

type LegalDocument = "privacy" | "support";

interface LegalPageProps {
  document: LegalDocument;
  onReady?: () => void;
}

const LAST_UPDATED_ZH = "2026 年 2 月 22 日";
const LAST_UPDATED_EN = "February 22, 2026";

function PrivacyPolicyZh() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>最后更新：</strong>{" "}
        <time dateTime="2026-02-22">{LAST_UPDATED_ZH}</time>
      </p>

      <h2>1. 数据最小化</h2>
      <p>馋香鸡当前版本以本地处理为主，不做不必要的数据收集，不接入广告追踪，尽量减少隐私暴露面。</p>

      <h2>2. 我们收集什么</h2>
      <ul>
        <li>当前版本不要求注册账号，不收集手机号、邮箱等身份信息。</li>
        <li>不提供账号登录体系，也不做个人画像。</li>
      </ul>

      <h2>3. 数据如何处理</h2>
      <ul>
        <li>菜谱与图片内容来自 App 内置本地资源。</li>
        <li>收藏数据保存在设备本地。</li>
        <li>搜索词仅用于本机匹配，不上传到服务器。</li>
      </ul>

      <h2>4. 第三方与网络</h2>
      <ul>
        <li>当前版本未使用在线菜谱接口进行数据拉取。</li>
        <li>当前版本未集成广告 SDK、统计分析 SDK 或个性化追踪 SDK。</li>
        <li>当前版本未实现将使用数据传输到开发者服务器的逻辑。</li>
      </ul>

      <h2>5. 权限使用</h2>
      <p>核心功能（浏览、搜索、收藏、步骤查看）不依赖通讯录、定位、相机、麦克风、相册等敏感权限。</p>

      <h2>6. 数据控制与删除</h2>
      <p>收藏数据保存在本机。你可以通过取消收藏删除单条数据，也可以通过卸载 App 清除本地存储的全部相关数据。</p>

      <h2>7. 政策更新与联系</h2>
      <p>
        若后续引入新的数据处理方式（如账号系统、云同步或统计服务），本页面会同步更新并标注更新时间。如有疑问，可前往
        <a href={appRoutePath("support")}>支持页面</a>联系。
      </p>
    </>
  );
}

function PrivacyPolicyEn() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>Last updated:</strong>{" "}
        <time dateTime="2026-02-22">{LAST_UPDATED_EN}</time>
      </p>

      <h2>1. Data minimization</h2>
      <p>YumChicken processes its current features locally, avoids unnecessary data collection, and does not include advertising trackers.</p>

      <h2>2. Information we collect</h2>
      <ul>
        <li>The current version does not require an account or collect identity details such as a phone number or email address.</li>
        <li>YumChicken does not provide an account system or build personal profiles.</li>
      </ul>

      <h2>3. How data is handled</h2>
      <ul>
        <li>Recipe and image content comes from resources bundled with the app.</li>
        <li>Favorites are stored locally on your device.</li>
        <li>Search terms are matched on your device and are not uploaded to a server.</li>
      </ul>

      <h2>4. Third parties and network access</h2>
      <ul>
        <li>The current version does not retrieve recipes from an online recipe service.</li>
        <li>It does not integrate advertising, analytics, or personalized tracking SDKs.</li>
        <li>It does not send usage data to a developer-operated server.</li>
      </ul>

      <h2>5. Permissions</h2>
      <p>Core features, including browsing, search, favorites, and cooking steps, do not depend on sensitive permissions such as contacts, location, camera, microphone, or photo-library access.</p>

      <h2>6. Data control and deletion</h2>
      <p>Favorites are stored on your device. You can remove individual items by unfavoriting them, or remove all related local data by uninstalling the app.</p>

      <h2>7. Policy changes and contact</h2>
      <p>If a future version adds new data processing, such as accounts, cloud sync, or analytics, this page will be updated with a new revision date. Questions can be submitted through the <a href={appRoutePath("support")}>support page</a>.</p>
    </>
  );
}

function SupportZh() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>最后更新：</strong>{" "}
        <time dateTime="2026-02-22">{LAST_UPDATED_ZH}</time>
      </p>

      <h2>1. 常见说明</h2>
      <ul>
        <li>菜谱内容来自 App 内置本地资源。</li>
        <li>收藏数据保存在设备本地，不会上传到服务器。</li>
        <li>搜索与筛选逻辑在本机执行，响应更快、隐私风险更低。</li>
      </ul>

      <h2>2. 反馈建议</h2>
      <p>为便于快速定位问题，建议反馈时附带：</p>
      <ul>
        <li>设备型号与系统版本。</li>
        <li>可复现的操作步骤。</li>
        <li>预期结果与实际结果的差异。</li>
        <li>必要时附上截图或录屏。</li>
      </ul>
    </>
  );
}

function SupportEn() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>Last updated:</strong>{" "}
        <time dateTime="2026-02-22">{LAST_UPDATED_EN}</time>
      </p>

      <h2>1. Common information</h2>
      <ul>
        <li>Recipe content comes from resources bundled with the app.</li>
        <li>Favorites are stored locally on your device and are not uploaded to a server.</li>
        <li>Search and filtering run on your device for faster results and less privacy exposure.</li>
      </ul>

      <h2>2. Helpful details for feedback</h2>
      <p>To make an issue easier to diagnose, please include:</p>
      <ul>
        <li>Your device model and operating-system version.</li>
        <li>The steps needed to reproduce the issue.</li>
        <li>The expected result and what happened instead.</li>
        <li>A screenshot or screen recording when it helps explain the issue.</li>
      </ul>
    </>
  );
}

export function LegalPage({ document, onReady }: LegalPageProps) {
  const { language } = useLanguage();
  const isPrivacyPolicy = document === "privacy";

  useEffect(() => {
    onReady?.();
  }, [onReady]);
  const title = isPrivacyPolicy
    ? language === "zh" ? "隐私政策" : "Privacy Policy"
    : language === "zh" ? "支持" : "Support";

  return (
    <section className="legal-page" aria-labelledby="legal-page-title">
      <div className="legal-page__intro">
        <h1 id="legal-page-title">{title}</h1>
      </div>

      <div className="legal-document">
        {isPrivacyPolicy
          ? language === "zh" ? <PrivacyPolicyZh /> : <PrivacyPolicyEn />
          : language === "zh" ? <SupportZh /> : <SupportEn />}
      </div>
    </section>
  );
}

export default LegalPage;
