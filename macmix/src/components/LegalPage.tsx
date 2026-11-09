import { useLanguage } from "./LanguageProvider";

type LegalDocument = "privacy-policy" | "terms-of-use";

type LegalPageProps = {
  document: LegalDocument;
};

const LAST_UPDATED = "November 9, 2026";
const LAST_UPDATED_ZH = "2026 年 11 月 9 日";
const LAST_UPDATED_ISO = "2026-11-09";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>Last updated:</strong>{" "}
        <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED}</time>
      </p>

      <p>
        MacMix is a native macOS audio utility. This Privacy Policy explains what
        information MacMix processes, where that processing happens, and when
        information is shared with service providers. It applies to the official MacMix
        app, MacMix Studio licensing, and the MacMix website.
      </p>

      <h2>1. Audio and device data stay on your Mac</h2>
      <p>
        MacMix reads information exposed by macOS to show and control audio devices,
        system volume, microphone input gain, per-app audio sessions, equalizer and
        output routing, Bluetooth audio accessory status and battery levels, listening
        modes, Spatial Audio state, nearby AirPlay receivers, and—when you enable the
        feature—Now Playing information.
      </p>
      <p>
        Per-app mixing, equalization, and routing use macOS audio process taps for local,
        real-time processing. MacMix does not record, save, transmit, or upload the audio
        content it processes. Audio samples are used only in memory to produce the
        adjusted output on your Mac.
      </p>

      <h2>2. Permissions</h2>
      <ul>
        <li>
          <strong>System Audio Recording:</strong> required only for per-app audio
          features. MacMix uses it to process app audio locally and not to create a
          recording.
        </li>
        <li>
          <strong>Bluetooth:</strong> used to read battery and status information for
          connected audio accessories, and to recognize nearby compatible headphones from
          the Bluetooth advertisements they broadcast, while a MacMix audio panel is
          visible. This information is used only on your Mac.
        </li>
        <li>
          <strong>Local Network:</strong> used to discover AirPlay receivers, such as
          HomePod, on your network through Bonjour (<code>_airplay._tcp</code>) so you can
          choose them as an output. Discovery runs only while a MacMix audio panel is
          visible, and the results are not uploaded.
        </li>
        <li>
          <strong>Accessibility:</strong> used only if you let MacMix take over the
          system volume keys or use volume-key shortcuts. MacMix observes keyboard events
          to recognize those keys and shortcuts; it does not record, store, or transmit
          what you type.
        </li>
        <li>
          <strong>Now Playing:</strong> when enabled, MacMix reads and controls the
          current media session through macOS on your Mac. This information is not
          uploaded.
        </li>
      </ul>
      <p>
        You can manage these permissions at any time in macOS System Settings. Features
        that depend on a permission are unavailable if it is denied or revoked; the rest
        of MacMix keeps working.
      </p>

      <h2>3. Information stored locally</h2>
      <p>
        MacMix stores settings on your Mac, including interface preferences, panel
        visibility, per-app volume, mute, equalizer, and routing choices, audio scenes,
        keyboard shortcuts, app exclusions, device-related volume preferences, update
        preferences, and permission-status hints. These settings can include app bundle
        identifiers and locally visible device identifiers or names needed to restore
        your choices. They are not uploaded by MacMix.
      </p>
      <p>
        MacMix also keeps a local diagnostic log in{" "}
        <code>~/Library/Application Support/MacMix/Log</code> to help troubleshoot
        problems. It records app events and technical state, such as audio configuration
        and MacMix resource usage, not audio content or keystrokes. Device names and
        identifiers in the log are replaced with values derived from a random key that
        changes on every launch. Logs are kept for up to 7 days and are limited to about
        20 MB, and you can open or delete them from MacMix. The log is never sent
        automatically.
      </p>
      <p>
        If you activate MacMix Studio, the license key, license instance identifier, and
        validation timestamps are stored in the macOS Keychain on that Mac only; they are
        not synchronized through iCloud Keychain. Deactivating Studio removes those local
        license credentials. Other preferences remain until you reset them or remove the
        related app data; uninstalling the app alone may not remove Keychain items.
      </p>

      <h2>4. Feedback and support</h2>
      <p>
        When you choose to send feedback from MacMix, it prepares a draft email to{" "}
        <a href="mailto:jasmine@jazminli.com">jasmine@jazminli.com</a> in your email app.
        The draft includes the MacMix version and build, macOS version, Mac model,
        processor architecture, memory size, and app language. You decide whether to
        attach a diagnostic recording, recent logs, or the names, bundle identifiers, or
        manufacturer and model of affected apps and audio devices. Nothing is sent until
        you send the email yourself, and you can review or remove any of it first.
      </p>
      <p>
        Information you send by email is used only to investigate and respond to your
        request and to improve MacMix, and is handled by your email provider and ours
        under their own policies.
      </p>

      <h2>5. MacMix Studio purchases and licensing</h2>
      <p>
        The MacMix app and website open a checkout page hosted by Dodo Payments, which
        acts as the merchant of record. Dodo Payments collects and processes the
        information needed to complete the transaction, such as your name, email address,
        billing details, payment details, tax information, fraud-prevention signals, and
        purchase records. MacMix does not receive or store your full card or
        payment-account details. Review the{" "}
        <ExternalLink href="https://dodopayments.com/privacy-policy">
          Dodo Payments Privacy Policy
        </ExternalLink>{" "}
        for its independent processing practices.
      </p>
      <p>
        MacMix uses a Cloudflare Worker to receive signed entitlement events from Dodo
        Payments. It stores limited license-delivery records in a private Neon
        PostgreSQL database,
        including Dodo customer, payment, entitlement, grant, and webhook identifiers;
        delivery or revocation status and reason; timestamps; and relevant error
        information. It intentionally does not store the issued license key or the
        complete webhook payload.
      </p>
      <p>
        When you activate Studio, MacMix sends the license key and your Mac&apos;s computer
        name, as set in macOS System Settings, to Dodo Payments; the computer name may
        include your name if you have set it that way. When MacMix validates or
        deactivates Studio, it sends the license key and the license instance identifier
        returned at activation. This is necessary to enforce the device limit, confirm
        entitlement status, and release an activation when you deactivate a Mac. MacMix
        validates an active license about once every 7 days and keeps Studio available
        for up to 14 days without a successful check while offline.
      </p>

      <h2>6. Updates, website hosting, and technical logs</h2>
      <p>
        MacMix uses Sparkle to check the official update feed hosted on GitHub and to
        download updates from GitHub Releases. When you first use MacMix, you choose
        whether it checks for updates automatically. You can also choose to include an
        anonymous system profile with update checks—such as macOS version, Mac model,
        processor type, memory size, preferred language, and MacMix version. It is off
        unless you turn it on. Beta updates are offered only to MacMix Studio users who
        opt in. These requests necessarily disclose ordinary connection data, such as
        your IP address and user agent, to GitHub. MacMix does not add advertising or
        behavioral analytics to update checks.
      </p>
      <p>
        The MacMix website and installer downloads (<code>download.jazminli.com</code>)
        are served through Cloudflare. The website does not use cookies, advertising
        trackers, or analytics; it stores only your language preference in your
        browser&apos;s local storage. Cloudflare processes connection data, such as IP
        addresses, to deliver and secure the site under the{" "}
        <ExternalLink href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare Privacy Policy
        </ExternalLink>
        . Cloudflare, Neon, Dodo Payments, and GitHub may also retain security and
        operational logs under their own policies.
      </p>

      <h2>7. How information is used and shared</h2>
      <p>
        Information handled outside your Mac is used only to provide checkout, deliver
        and administer licenses, prevent fraud and abuse, comply with tax and legal
        obligations, maintain service security, distribute updates, and respond to
        support requests. MacMix does not sell personal information and does not share it
        for cross-context behavioral advertising.
      </p>
      <p>
        Service providers may process information in countries other than your own. They
        act under their own terms and privacy policies, and may disclose information when
        required by law or necessary to protect their services and users.
      </p>

      <h2>8. Retention and security</h2>
      <p>
        Local preferences remain on your Mac until you change or remove them, and local
        diagnostic logs are removed after about 7 days. Studio transaction and
        entitlement records are retained only as reasonably necessary to deliver and
        verify licenses, handle support, prevent abuse, maintain accounting records, and
        meet legal obligations. Support emails are kept as long as needed to resolve your
        request. Payment providers may retain transaction records for longer periods
        required by financial, tax, fraud-prevention, and compliance rules.
      </p>
      <p>
        Reasonable technical and organizational safeguards are used, including HTTPS,
        signed webhooks and updates, private service credentials, limited database
        records, and the macOS Keychain. No storage or transmission method can be
        guaranteed to be completely secure.
      </p>

      <h2>9. Your choices and rights</h2>
      <p>
        You can revoke macOS permissions, change or delete local preferences and
        diagnostic logs, turn off automatic update checks or system profile sharing,
        deactivate a Studio license on a Mac, and contact us about access, correction,
        deletion, or other rights available under applicable privacy law. Requests
        concerning payment information controlled directly by Dodo Payments should also
        be submitted through Dodo Payments&apos; privacy or support channels. Some records
        may be retained where required by law or needed to establish, exercise, or defend
        legal claims.
      </p>

      <h2>10. Children</h2>
      <p>
        MacMix is a general-purpose utility and is not directed to children. We do not
        knowingly collect personal information from children through MacMix. If you
        believe a child has provided personal information, please contact us.
      </p>

      <h2>11. Changes and contact</h2>
      <p>
        This policy may be updated when MacMix features, service providers, or legal
        requirements change. The date at the top of this page will identify the latest
        version. Questions or privacy requests can be sent to{" "}
        <a href="mailto:jasmine@jazminli.com">jasmine@jazminli.com</a>.
      </p>
    </>
  );
}

function TermsOfUse() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>Last updated:</strong>{" "}
        <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED}</time>
      </p>

      <p>
        These Terms of Use govern your use of the official MacMix application, MacMix
        Studio licenses, website, downloads, and related services. By downloading,
        installing, purchasing, or using the official MacMix app, you agree to these
        terms. If you do not agree, do not use the official MacMix app or purchase MacMix
        Studio. Your rights to the MacMix source code are governed by its open-source
        license, as described in section 2.
      </p>

      <h2>1. MacMix and MacMix Studio</h2>
      <p>
        MacMix provides native macOS controls for system volume, audio input and output
        devices, per-app audio mixing, and related audio features. The official MacMix app
        is free to download and use; a valid MacMix Studio license unlocks additional
        Studio features in the official app and access to the Beta update channel. Free
        and Studio users download the same app.
      </p>
      <p>
        Feature availability can depend on your Mac, macOS version, connected hardware,
        app behavior, granted permissions, and interfaces made available by Apple or
        other device vendors. A feature shown in MacMix may be unavailable when the
        required system or hardware support is absent.
      </p>

      <h2>2. Open-source software</h2>
      <p>
        The MacMix source code, including the source code of MacMix Studio features, is
        published in the public MacMix repository under the{" "}
        <ExternalLink href="https://github.com/ljmng7/MacMix/blob/main/LICENSE">
          GNU General Public License, version 3 (GPL-3.0)
        </ExternalLink>
        . That license governs the code in that repository, and nothing in these terms
        limits the rights it grants you. The official MacMix app additionally includes
        licensing, purchase, and update components that are not part of the public
        repository and are not covered by that license. MacMix names, app icons,
        screenshots, artwork, and other brand assets are not granted under the GPL-3.0
        unless expressly stated otherwise.
      </p>

      <h2>3. Studio license</h2>
      <p>
        MacMix Studio is currently offered as a one-time purchase of a license key that
        can be activated in the official MacMix app on up to three Macs that you own or
        control. A purchase grants a limited, non-exclusive, non-transferable right to
        use that key to unlock Studio features and the Beta update channel in the official
        app, and to use the related licensing services. It does not transfer ownership of
        MacMix, its non-public licensing, purchase, or update components, or its brand
        assets, and it does not affect your rights under the GPL-3.0.
      </p>
      <p>
        You are responsible for keeping your license key confidential. You may not sell,
        publish, share, sublicense, or use a key to exceed the applicable activation
        limit. You may deactivate one Mac and activate another through MacMix, subject to
        the license service being available and the entitlement remaining valid.
      </p>
      <p>
        MacMix checks an active license periodically. If a check cannot reach the license
        service, Studio remains available for a limited offline grace period (currently
        14 days). If a license is refunded, revoked, or invalid, or the grace period ends
        without a successful check, the official app returns to its free features without
        deleting your settings.
      </p>
      <p>
        “One-time purchase” means there is no recurring subscription charge for the
        purchased Studio license. It does not promise that every future product, paid
        add-on, major edition, third-party service, or feature will be included forever.
        Studio features may be added, changed, or discontinued as the product evolves,
        subject to applicable law and any specific promise made at the time of purchase.
      </p>

      <h2>4. Payment, taxes, delivery, and refunds</h2>
      <p>
        Dodo Payments is the merchant of record and authorized reseller for MacMix Studio.
        Dodo Payments processes payment, applicable taxes, invoices, fraud checks,
        disputes, and refunds. Your transaction is also governed by the{" "}
        <ExternalLink href="https://dodopayments.com/archive/buyer-terms">
          Dodo Payments Buyer Terms
        </ExternalLink>
        . Prices, currency conversion, purchasing-power adjustments, and taxes shown at
        checkout may vary by location and payment method.
      </p>
      <p>
        After successful payment, Dodo Payments delivers the license key to the email
        address supplied at checkout. You are responsible for providing an accurate email
        address and retaining access to the key. If delivery fails or the key does not
        activate, contact us with the order details so the issue can be investigated.
      </p>
      <p>
        Refund requests are handled by Dodo Payments in accordance with its Buyer Terms,
        platform rules, and applicable consumer law. A refund, chargeback, reversal,
        fraudulent transaction, or revoked entitlement may cause the corresponding Studio
        license to be disabled.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You must not:</p>
      <ul>
        <li>use MacMix or its services in violation of applicable law;</li>
        <li>share, resell, publish, or fraudulently obtain Studio license keys;</li>
        <li>
          circumvent the licensing, activation limits, security, or access controls of the
          official MacMix app or its licensing services;
        </li>
        <li>
          interfere with the checkout, licensing, update, website, or entitlement
          infrastructure, including through automated abuse or excessive requests; or
        </li>
        <li>
          misuse MacMix to access or process audio or information without the permissions
          and authority required by law.
        </li>
      </ul>
      <p>
        Nothing in this section restricts what you may do with the source code under the
        GPL-3.0, including building, modifying, and distributing your own versions in
        accordance with that license, or any other rights that cannot lawfully be
        restricted.
      </p>

      <h2>6. Updates and service changes</h2>
      <p>
        Official MacMix updates are delivered through Sparkle and are free for all users.
        Studio users can also opt in to the Beta channel, which provides pre-release
        versions that may be incomplete or less stable; you can leave the Beta channel at
        any time. Updates can add, modify, or remove features; address compatibility or
        security issues; or change minimum system requirements. Licensing, checkout,
        update, and website services may occasionally be unavailable for maintenance,
        security, network, or third-party reasons.
      </p>

      <h2>7. Your responsibilities</h2>
      <p>
        You are responsible for deciding whether MacMix is suitable for your setup,
        maintaining appropriate backups, reviewing volume levels before playback, and
        using audio, Bluetooth, local network, accessibility, and other system permissions
        responsibly. Audio routing and volume changes can affect connected equipment,
        recordings, calls, streams, and hearing safety; verify important configurations
        before relying on them.
      </p>

      <h2>8. Third-party services and content</h2>
      <p>
        MacMix depends on macOS frameworks and may link to or interoperate with services
        provided by Apple, Dodo Payments, Cloudflare, Neon, GitHub, Sparkle, and hardware
        or app vendors. Their products and services are governed by their own terms and
        policies. MacMix is not responsible for third-party availability, changes, or
        content.
      </p>

      <h2>9. Disclaimer of warranties</h2>
      <p>
        To the maximum extent permitted by law, MacMix and its related services are
        provided “as is” and “as available,” without warranties of any kind, express or
        implied, including warranties of merchantability, fitness for a particular
        purpose, non-infringement, uninterrupted availability, or error-free operation.
        Beta versions are provided for testing and may contain more defects than official
        releases. Nothing in these terms excludes warranties or consumer rights that
        cannot be excluded under applicable law.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the MacMix developer will not be liable
        for indirect, incidental, special, consequential, or punitive damages, or for lost
        data, revenue, profits, business, or use arising from MacMix or related services.
        Where liability cannot be excluded, total liability relating to a paid Studio
        license will not exceed the amount you paid for that license. These limits do not
        apply where prohibited by law.
      </p>

      <h2>11. Suspension and termination</h2>
      <p>
        Studio access may be suspended or revoked if the entitlement is refunded,
        reversed, fraudulent, used beyond its activation limit, or materially violates
        these terms. You may stop using MacMix at any time and may deactivate Studio from
        the app. Provisions that by their nature should survive termination—including
        intellectual property, disclaimers, limitations of liability, and payment
        obligations—will continue to apply.
      </p>

      <h2>12. Changes, severability, and contact</h2>
      <p>
        These terms may be updated to reflect product, service, or legal changes. Material
        changes will apply prospectively where required by law. If any provision is found
        unenforceable, the remaining provisions remain in effect. Failure to enforce a
        provision is not a waiver of it.
      </p>
      <p>
        Questions about MacMix or these terms can be sent to{" "}
        <a href="mailto:jasmine@jazminli.com">jasmine@jazminli.com</a>.
      </p>
    </>
  );
}

function UpdatedZh() {
  return (
    <>
      <p className="legal-document__updated">
        <strong>最后更新：</strong>
        <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_ZH}</time>
      </p>
      <p>
        本文为中文译本，供参考。中文与英文版本如有不一致，以英文版本为准。
      </p>
    </>
  );
}

function PrivacyPolicyZh() {
  return (
    <>
      <UpdatedZh />

      <p>
        MacMix 是一款原生 macOS 音频工具。本隐私政策说明 MacMix
        会处理哪些信息、这些处理在哪里进行，以及在什么情况下会与服务提供方共享信息。本政策适用于官方
        MacMix App、MacMix Studio 授权以及 MacMix 网站。
      </p>

      <h2>1. 音频与设备数据只留在你的 Mac 上</h2>
      <p>
        MacMix 读取 macOS
        提供的信息，用于显示和控制音频设备、系统音量、麦克风输入增益、各 App
        的音频会话、均衡器与输出路由、蓝牙音频配件的状态与电量、聆听模式、空间音频状态、附近的
        AirPlay 接收器，以及在你开启相应功能时的“正在播放”信息。
      </p>
      <p>
        分 App 混音、均衡和路由使用 macOS
        音频进程捕获在本机进行实时处理。MacMix
        不会录制、保存、传输或上传它所处理的音频内容。音频样本只在内存中用于在你的 Mac
        上生成调整后的输出。
      </p>

      <h2>2. 系统权限</h2>
      <ul>
        <li>
          <strong>系统录音：</strong>仅分 App 音频功能需要。MacMix
          用它在本机处理 App 音频，而不是制作录音。
        </li>
        <li>
          <strong>蓝牙：</strong>在 MacMix
          音频面板可见时，用于读取已连接音频配件的电量和状态，并根据附近兼容耳机广播的蓝牙信号识别这些耳机。这些信息只在你的
          Mac 上使用。
        </li>
        <li>
          <strong>本地网络：</strong>通过 Bonjour（<code>_airplay._tcp</code>）发现你网络中的 AirPlay
          接收器（例如 HomePod），以便将其选为输出设备。只在 MacMix
          音频面板可见时进行发现，结果不会上传。
        </li>
        <li>
          <strong>辅助功能：</strong>仅在你允许 MacMix
          接管系统音量键或使用音量键快捷键时需要。MacMix
          会观察键盘事件以识别这些按键和快捷键，但不会记录、保存或传输你输入的内容。
        </li>
        <li>
          <strong>正在播放：</strong>开启后，MacMix 通过 macOS 在你的 Mac
          上读取和控制当前媒体会话。这些信息不会上传。
        </li>
      </ul>
      <p>
        你可以随时在 macOS
        系统设置中管理这些权限。拒绝或撤销某项权限后，依赖它的功能将不可用，MacMix
        的其他部分仍可正常使用。
      </p>

      <h2>3. 存储在本机的信息</h2>
      <p>
        MacMix 会在你的 Mac 上保存设置，包括界面偏好、面板显示、各 App
        的音量、静音、均衡器和路由选择、音频场景、键盘快捷键、App
        排除列表、与设备相关的音量偏好、更新偏好以及权限状态提示。这些设置可能包含恢复你的选择所需的
        App Bundle ID 以及本机可见的设备标识符或名称。MacMix 不会上传这些设置。
      </p>
      <p>
        MacMix 还会在 <code>~/Library/Application Support/MacMix/Log</code>{" "}
        中保留本地诊断日志，用于排查问题。日志记录 App 事件和技术状态（例如音频配置和 MacMix
        的资源占用），不包含音频内容或按键内容。日志中的设备名称和标识符会被替换为由每次启动随机生成的密钥推导出的值。日志最多保留
        7 天，总量上限约 20 MB，你可以在 MacMix 中打开或清除。日志从不会被自动发送。
      </p>
      <p>
        如果你激活了 MacMix Studio，许可证密钥、许可证实例标识符和验证时间戳只保存在这台 Mac
        的 macOS 钥匙串中，不会通过 iCloud 钥匙串同步。停用 Studio
        会删除这些本地授权凭据。其他偏好设置会一直保留，直到你重置它们或删除相关 App
        数据；仅卸载 App 可能不会删除钥匙串项目。
      </p>

      <h2>4. 反馈与支持</h2>
      <p>
        当你选择从 MacMix 发送反馈时，它会在你的邮件 App 中准备一封发往{" "}
        <a href="mailto:jasmine@jazminli.com">jasmine@jazminli.com</a>{" "}
        的邮件草稿。草稿包含 MacMix 版本与构建号、macOS 版本、Mac
        型号、处理器架构、内存大小和 App
        语言。是否附上诊断录制、近期日志，或受影响 App 与音频设备的名称、Bundle ID
        或厂商与型号，由你决定。在你亲自发送邮件之前不会发送任何内容，你也可以先查看或删除其中任何部分。
      </p>
      <p>
        你通过邮件发送的信息只用于调查和回复你的请求以及改进
        MacMix，并由你的邮件服务商和我们的邮件服务商按各自的政策处理。
      </p>

      <h2>5. MacMix Studio 购买与授权</h2>
      <p>
        MacMix App 和网站会打开由 Dodo Payments 托管的结账页面，Dodo Payments
        作为记录商家（merchant of record）。Dodo Payments
        收集并处理完成交易所需的信息，例如你的姓名、电子邮件地址、账单信息、支付信息、税务信息、防欺诈信号和购买记录。MacMix
        不会接收或保存你完整的银行卡或支付账户信息。Dodo Payments 的独立处理方式请参阅{" "}
        <ExternalLink href="https://dodopayments.com/privacy-policy">
          Dodo Payments 隐私政策
        </ExternalLink>
        。
      </p>
      <p>
        MacMix 使用 Cloudflare Worker 接收 Dodo Payments
        发出的已签名授权事件。它会在私有的 Neon PostgreSQL
        数据库中保存有限的许可证交付记录，包括 Dodo
        的客户、支付、授权、发放和 Webhook
        标识符，交付或撤销状态及原因，时间戳，以及相关错误信息。它有意不保存所签发的许可证密钥或完整的
        Webhook 内容。
      </p>
      <p>
        激活 Studio 时，MacMix 会将许可证密钥和你在 macOS 系统设置中设定的电脑名称发送给
        Dodo Payments；如果你的电脑名称包含你的名字，它也会被一并发送。验证或停用 Studio
        时，MacMix
        会发送许可证密钥和激活时返回的许可证实例标识符。这些信息是执行设备数量限制、确认授权状态以及在停用某台
        Mac 时释放激活名额所必需的。MacMix 大约每 7
        天验证一次有效许可证，离线时最多在 14 天内无需成功验证即可继续使用 Studio。
      </p>

      <h2>6. 更新、网站托管与技术日志</h2>
      <p>
        MacMix 使用 Sparkle 检查托管在 GitHub 上的官方更新源，并从 GitHub Releases
        下载更新。首次使用 MacMix
        时，你可以选择是否自动检查更新，也可以选择在检查更新时附带匿名系统概况，例如 macOS
        版本、Mac 型号、处理器类型、内存大小、首选语言和 MacMix
        版本。除非你主动开启，该选项默认关闭。Beta 更新只提供给选择加入的 MacMix Studio
        用户。这些请求必然会向 GitHub 暴露一般的连接数据，例如你的 IP 地址和 User
        Agent。MacMix 不会在更新检查中加入广告或行为分析。
      </p>
      <p>
        MacMix 网站和安装包下载（<code>download.jazminli.com</code>）通过 Cloudflare
        提供。网站不使用 Cookie、广告追踪或统计分析，只会在浏览器的本地存储中保存你的语言偏好。Cloudflare
        会处理 IP 地址等连接数据以提供和保护网站，相关处理受{" "}
        <ExternalLink href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare 隐私政策
        </ExternalLink>
        约束。Cloudflare、Neon、Dodo Payments 和 GitHub
        也可能按各自的政策保留安全和运维日志。
      </p>

      <h2>7. 信息的使用与共享</h2>
      <p>
        在你的 Mac
        之外处理的信息只用于提供结账、交付和管理许可证、防止欺诈和滥用、履行税务和法律义务、维护服务安全、分发更新以及回复支持请求。MacMix
        不出售个人信息，也不会为跨情境行为广告共享个人信息。
      </p>
      <p>
        服务提供方可能在你所在国家或地区以外处理信息。它们依据各自的条款和隐私政策行事，并可能在法律要求或为保护其服务和用户所必需时披露信息。
      </p>

      <h2>8. 保留期限与安全</h2>
      <p>
        本地偏好设置会一直保留在你的 Mac 上，直到你更改或删除；本地诊断日志约 7
        天后删除。Studio
        交易和授权记录只在交付和验证许可证、处理支持请求、防止滥用、保存会计记录和履行法律义务所合理必需的期间内保留。支持邮件保留至解决你的请求所需的时间。支付服务商可能根据金融、税务、防欺诈和合规要求更长时间地保留交易记录。
      </p>
      <p>
        我们采取了合理的技术和组织保护措施，包括 HTTPS、已签名的 Webhook
        与更新、私有服务凭据、有限的数据库记录以及 macOS
        钥匙串。任何存储或传输方式都无法保证绝对安全。
      </p>

      <h2>9. 你的选择与权利</h2>
      <p>
        你可以撤销 macOS
        权限，更改或删除本地偏好设置和诊断日志，关闭自动检查更新或系统概况共享，在某台 Mac
        上停用 Studio
        许可证，并就访问、更正、删除或适用隐私法律赋予你的其他权利联系我们。涉及由 Dodo
        Payments 直接控制的支付信息的请求，也应通过 Dodo Payments
        的隐私或支持渠道提交。在法律要求或为确立、行使或抗辩法律主张所需时，部分记录可能会被保留。
      </p>

      <h2>10. 儿童</h2>
      <p>
        MacMix 是一款通用工具，并非面向儿童。我们不会在知情的情况下通过 MacMix
        收集儿童的个人信息。如果你认为有儿童提供了个人信息，请联系我们。
      </p>

      <h2>11. 变更与联系方式</h2>
      <p>
        当 MacMix
        的功能、服务提供方或法律要求发生变化时，本政策可能会更新。本页顶部的日期表示最新版本。有关问题或隐私请求可发送至{" "}
        <a href="mailto:jasmine@jazminli.com">jasmine@jazminli.com</a>。
      </p>
    </>
  );
}

function TermsOfUseZh() {
  return (
    <>
      <UpdatedZh />

      <p>
        本使用条款适用于你对官方 MacMix App、MacMix Studio
        许可证、网站、下载及相关服务的使用。下载、安装、购买或使用官方 MacMix App
        即表示你同意本条款。如果你不同意，请不要使用官方 MacMix App 或购买 MacMix
        Studio。你对 MacMix 源代码享有的权利由其开源许可证规定，详见第 2 条。
      </p>

      <h2>1. MacMix 与 MacMix Studio</h2>
      <p>
        MacMix 为系统音量、音频输入与输出设备、分 App 混音及相关音频功能提供原生 macOS
        控制。官方 MacMix App 可免费下载和使用；有效的 MacMix Studio 许可证可在官方 App
        中解锁额外的 Studio 功能和 Beta 更新通道。免费用户和 Studio 用户下载的是同一个 App。
      </p>
      <p>
        功能是否可用可能取决于你的 Mac、macOS 版本、所连接的硬件、App
        行为、已授予的权限，以及 Apple 或其他设备厂商提供的接口。当缺少所需的系统或硬件支持时，MacMix
        中显示的某项功能可能无法使用。
      </p>

      <h2>2. 开源软件</h2>
      <p>
        MacMix 源代码（包括 MacMix Studio 功能的源代码）以{" "}
        <ExternalLink href="https://github.com/ljmng7/MacMix/blob/main/LICENSE">
          GNU 通用公共许可证第 3 版（GPL-3.0）
        </ExternalLink>
        发布在公开的 MacMix
        仓库中。该许可证适用于该仓库中的代码，本条款的任何内容都不限制它赋予你的权利。官方
        MacMix App 还包含不属于公开仓库、也不受该许可证约束的授权、购买和更新组件。除非另有明确说明，MacMix
        名称、App 图标、截图、美术作品和其他品牌素材不在 GPL-3.0 授权范围内。
      </p>

      <h2>3. Studio 许可证</h2>
      <p>
        MacMix Studio 目前以一次性购买的方式提供一个许可证密钥，可在你拥有或控制的最多三台
        Mac 上的官方 MacMix App
        中激活。购买即获得一项有限的、非独占的、不可转让的权利：使用该密钥在官方 App
        中解锁 Studio 功能和 Beta 更新通道，并使用相关的授权服务。购买不会转移 MacMix、其非公开的授权、购买或更新组件以及品牌素材的所有权，也不影响你依据
        GPL-3.0 享有的权利。
      </p>
      <p>
        你有责任对许可证密钥保密。你不得出售、公开、分享、再许可许可证密钥，或使用密钥超出适用的激活数量限制。在授权服务可用且授权仍然有效的前提下，你可以通过
        MacMix 停用一台 Mac 并激活另一台。
      </p>
      <p>
        MacMix 会定期检查有效许可证。如果检查时无法连接授权服务，Studio
        会在有限的离线宽限期（目前为 14
        天）内继续可用。如果许可证被退款、撤销或无效，或宽限期结束时仍未成功验证，官方
        App 会回到免费功能，但不会删除你的设置。
      </p>
      <p>
        “一次性购买”指所购买的 Studio
        许可证没有周期性订阅费用。它并不承诺未来的所有产品、付费附加内容、主要版本、第三方服务或功能都会永久包含在内。在符合适用法律和购买时任何具体承诺的前提下，Studio
        功能可能会随着产品发展而增加、更改或停止提供。
      </p>

      <h2>4. 付款、税费、交付与退款</h2>
      <p>
        Dodo Payments 是 MacMix Studio 的记录商家和授权经销商，负责处理付款、适用税费、发票、防欺诈检查、争议和退款。你的交易同时受{" "}
        <ExternalLink href="https://dodopayments.com/archive/buyer-terms">
          Dodo Payments 买家条款
        </ExternalLink>
        约束。结账时显示的价格、货币换算、购买力调整和税费可能因地区和支付方式而异。
      </p>
      <p>
        付款成功后，Dodo Payments
        会将许可证密钥发送到结账时填写的电子邮件地址。你有责任提供准确的电子邮件地址并妥善保管密钥。如果密钥未能送达或无法激活，请提供订单信息联系我们，以便调查。
      </p>
      <p>
        退款申请由 Dodo Payments
        依据其买家条款、平台规则和适用的消费者保护法律处理。退款、拒付、撤销交易、欺诈交易或被撤销的授权可能导致相应的
        Studio 许可证被停用。
      </p>

      <h2>5. 可接受的使用</h2>
      <p>你不得：</p>
      <ul>
        <li>违反适用法律使用 MacMix 或其服务；</li>
        <li>分享、转售、公开或以欺诈方式获取 Studio 许可证密钥；</li>
        <li>规避官方 MacMix App 或其授权服务的授权、激活数量限制、安全或访问控制；</li>
        <li>
          干扰结账、授权、更新、网站或授权发放基础设施，包括通过自动化滥用或过量请求；或
        </li>
        <li>在没有法律所要求的权限和授权的情况下，滥用 MacMix 访问或处理音频或信息。</li>
      </ul>
      <p>
        本条不限制你依据 GPL-3.0
        对源代码所做的任何事情，包括按照该许可证构建、修改和分发你自己的版本，也不限制依法不能被限制的其他权利。
      </p>

      <h2>6. 更新与服务变更</h2>
      <p>
        官方 MacMix 更新通过 Sparkle 提供，对所有用户免费。Studio 用户还可以选择加入
        Beta 通道，获得可能尚未完成或不够稳定的预发布版本，并可随时退出 Beta
        通道。更新可能会增加、修改或移除功能，解决兼容性或安全问题，或更改最低系统要求。授权、结账、更新和网站服务可能会因维护、安全、网络或第三方原因偶尔不可用。
      </p>

      <h2>7. 你的责任</h2>
      <p>
        你有责任判断 MacMix
        是否适合你的设备与使用环境，做好适当的备份，在播放前检查音量，并负责任地使用音频、蓝牙、本地网络、辅助功能及其他系统权限。音频路由和音量变化可能影响所连接的设备、录音、通话、直播和听力安全；在依赖重要配置之前，请先确认其效果。
      </p>

      <h2>8. 第三方服务与内容</h2>
      <p>
        MacMix 依赖 macOS 框架，并可能链接或配合 Apple、Dodo Payments、Cloudflare、Neon、GitHub、Sparkle
        以及硬件或 App 厂商提供的服务。这些产品和服务受其各自的条款和政策约束。MacMix
        不对第三方的可用性、变更或内容负责。
      </p>

      <h2>9. 免责声明</h2>
      <p>
        在法律允许的最大范围内，MacMix
        及其相关服务按“现状”和“可用”的状态提供，不附带任何明示或默示的保证，包括但不限于适销性、特定用途适用性、不侵权、持续可用或无错误运行的保证。Beta
        版本仅供测试，可能比正式版本存在更多缺陷。本条款不排除依据适用法律不能排除的保证或消费者权利。
      </p>

      <h2>10. 责任限制</h2>
      <p>
        在法律允许的最大范围内，MacMix 开发者不对因 MacMix
        或相关服务引起的任何间接、附带、特殊、后果性或惩罚性损害，或数据、收入、利润、业务或使用的损失承担责任。在责任无法排除的情况下，与付费
        Studio 许可证相关的全部责任不超过你为该许可证支付的金额。在法律禁止的情况下，上述限制不适用。
      </p>

      <h2>11. 暂停与终止</h2>
      <p>
        如果授权被退款、撤销、属于欺诈、超出激活数量限制使用，或严重违反本条款，Studio
        访问权限可能会被暂停或撤销。你可以随时停止使用 MacMix，并可在 App 中停用
        Studio。依其性质应在终止后继续有效的条款（包括知识产权、免责声明、责任限制和付款义务）将继续适用。
      </p>

      <h2>12. 变更、可分割性与联系方式</h2>
      <p>
        本条款可能会为反映产品、服务或法律变化而更新。在法律要求时，重大变更仅对未来生效。如任何条款被认定为不可执行，其余条款仍然有效。未执行某项条款不构成对该条款的放弃。
      </p>
      <p>
        有关 MacMix 或本条款的问题可发送至{" "}
        <a href="mailto:jasmine@jazminli.com">jasmine@jazminli.com</a>。
      </p>
    </>
  );
}

export function LegalPage({ document }: LegalPageProps) {
  const { language } = useLanguage();
  const chinese = language === "zh";
  const isPrivacyPolicy = document === "privacy-policy";
  const title = isPrivacyPolicy
    ? chinese ? "隐私政策" : "Privacy Policy"
    : chinese ? "使用条款" : "Terms of Use";

  let body: React.ReactNode;
  if (isPrivacyPolicy) {
    body = chinese ? <PrivacyPolicyZh /> : <PrivacyPolicy />;
  } else {
    body = chinese ? <TermsOfUseZh /> : <TermsOfUse />;
  }

  return (
    <section
      className="changelog-page legal-page"
      aria-labelledby="legal-page-title"
      lang={chinese ? "zh-CN" : "en"}
    >
      <div className="changelog-intro">
        <h1 id="legal-page-title">{title}</h1>
      </div>

      <div className="legal-document release-entry__markdown">{body}</div>
    </section>
  );
}

export default LegalPage;
