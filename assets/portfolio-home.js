(function () {
  const data = window.portfolioContent;
  const root = document.getElementById("app");

  if (!data || !root) {
    return;
  }

  const isPlaceholderValue = (value) =>
    typeof value === "string" && /^\[[A-Z0-9_]+\]$/.test(value.trim());

  const isLikelyUrl = (value) =>
    typeof value === "string" && /^(https?:\/\/|mailto:|#|\.\/|\/)/.test(value);

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const safeHref = (value) => (isLikelyUrl(value) && !isPlaceholderValue(value) ? value : "#");
  const linkAttrs = (value) =>
    safeHref(value) === "#"
      ? ""
      : ' target="_blank" rel="noopener noreferrer"';
  const renderThemeImage = ({ lightSrc, darkSrc, alt = "", className = "" }) => {
    if (!lightSrc && !darkSrc) {
      return "";
    }

    const resolvedLightSrc = lightSrc || darkSrc;
    const resolvedDarkSrc = darkSrc || lightSrc;
    const classAttr = className ? ` class="${escapeHtml(className)}"` : "";

    if (!resolvedLightSrc) {
      return "";
    }

    if (!darkSrc) {
      return `<img${classAttr} src="${escapeHtml(resolvedLightSrc)}" alt="${escapeHtml(alt)}">`;
    }

    return `
      <picture>
        <source srcset="${escapeHtml(resolvedDarkSrc)}" media="(prefers-color-scheme: dark)">
        <img${classAttr} src="${escapeHtml(resolvedLightSrc)}" alt="${escapeHtml(alt)}">
      </picture>
    `;
  };

  let qrPanelIndex = 0;

  const renderContactIcon = (type, options = {}) => {
    const defaultState = options.defaultState === "original" ? "original" : "black";
    const neutralOriginalTypes = new Set(["github", "x"]);
    const stackClassName = [
      "contact-icon-stack",
      neutralOriginalTypes.has(type) ? "is-neutral-original" : "",
      defaultState === "original" ? "is-static" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const figmaIcons = {
      github: {
        black: "./assets/figma-social-icons/github-black.svg",
        original: "./assets/figma-social-icons/github-original.svg"
      },
      xiaohongshu: {
        black: "./assets/figma-social-icons/xiaohongshu-black.svg",
        original: "./assets/figma-social-icons/xiaohongshu-original.svg"
      },
      wechat: {
        black: "./assets/figma-social-icons/wechat-black.svg",
        original: "./assets/figma-social-icons/wechat-original.svg"
      },
      douyin: {
        black: "./assets/figma-social-icons/tiktok-black.svg",
        original: "./assets/figma-social-icons/tiktok-original.svg"
      },
      x: {
        black: "./assets/figma-social-icons/x-black.svg",
        original: "./assets/figma-social-icons/x-original.svg"
      },
      instagram: {
        black: "./assets/figma-social-icons/instagram-black.svg",
        original: "./assets/figma-social-icons/instagram-original.svg"
      },
      email: {
        black: "./assets/figma-social-icons/email-black.svg",
        original: "./assets/figma-social-icons/email-original.svg"
      }
    };

    if (figmaIcons[type]) {
      if (defaultState === "original") {
        return `
          <span class="${stackClassName}" aria-hidden="true">
            <img class="contact-icon-img is-static" src="${figmaIcons[type].original}" alt="">
          </span>
        `;
      }

      return `
        <span class="${stackClassName}" aria-hidden="true">
          <img class="contact-icon-img is-default" src="${figmaIcons[type].black}" alt="">
          <img class="contact-icon-img is-hover" src="${figmaIcons[type].original}" alt="">
        </span>
      `;
    }

    const icons = {
      github: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.4a8.6 8.6 0 0 0-2.72 16.76c.43.08.58-.18.58-.41v-1.45c-2.37.52-2.87-1-2.87-1s-.39-.96-.96-1.22c-.78-.53.06-.52.06-.52.87.06 1.32.89 1.32.89.76 1.31 2 1 2.49.78.08-.56.3-.95.55-1.17-1.9-.22-3.9-.95-3.9-4.24 0-.94.33-1.7.88-2.3-.09-.21-.38-1.08.08-2.25 0 0 .72-.23 2.36.88a8.1 8.1 0 0 1 4.3 0c1.63-1.11 2.35-.88 2.35-.88.46 1.17.17 2.04.09 2.25.55.6.88 1.36.88 2.3 0 3.3-2.01 4.01-3.92 4.23.31.27.58.79.58 1.6v2.37c0 .23.15.49.58.4A8.6 8.6 0 0 0 12 3.4Z"/>
        </svg>
      `,
      xiaohongshu: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="4.5"></rect>
          <path d="M7.5 9.2h9M7.5 12h9M7.5 14.8h6.2"></path>
        </svg>
      `,
      douyin: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.4 4.4c.7 1.4 1.8 2.5 3.3 3.1v2.55a7.1 7.1 0 0 1-3.3-1.2v5.32a4.58 4.58 0 1 1-4.58-4.58c.24 0 .48.02.72.06v2.58a2.2 2.2 0 1 0 1.48 2.08V4.4h2.38Z"></path>
        </svg>
      `,
      x: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.2 4.7h3.27l3.2 4.55 3.86-4.55h3.2l-5.45 6.34 5.72 8.24H15.7l-3.49-5.03-4.28 5.03H4.7l5.92-6.89L5.2 4.7Z"></path>
        </svg>
      `,
      instagram: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.2"></rect>
          <circle cx="12" cy="12" r="3.65"></circle>
          <circle cx="17.25" cy="6.75" r="1"></circle>
        </svg>
      `,
      email: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 7.2h15a1.3 1.3 0 0 1 1.3 1.3v7a1.3 1.3 0 0 1-1.3 1.3h-15a1.3 1.3 0 0 1-1.3-1.3v-7a1.3 1.3 0 0 1 1.3-1.3Z"></path>
          <path d="m4.1 8 7.23 5.35a1.15 1.15 0 0 0 1.35 0L19.9 8"></path>
        </svg>
      `
    };

    return icons[type] || "";
  };

  const deriveInitials = (value) => {
    if (typeof value !== "string" || !value.trim() || isPlaceholderValue(value)) {
      return "PF";
    }

    const parts = value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const createCodeSnippets = () => {
    const name = `${data.profile.displayName} (${data.profile.englishName})`;
    const post = data.profile.role;
    const email = data.profile.email;
    const motto = data.profile.motto;

    return {
      cpp: [
        `<span class="hl-keyword">struct</span> <span class="hl-type">Profile</span> <span class="hl-punct">{</span>`,
        `  <span class="hl-type">std</span><span class="hl-punct">::</span><span class="hl-type">string</span> <span class="hl-property">name</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(name)}"</span><span class="hl-punct">;</span>`,
        `  <span class="hl-type">std</span><span class="hl-punct">::</span><span class="hl-type">string</span> <span class="hl-property">post</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(post)}"</span><span class="hl-punct">;</span>`,
        `  <span class="hl-type">std</span><span class="hl-punct">::</span><span class="hl-type">string</span> <span class="hl-property">email</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(email)}"</span><span class="hl-punct">;</span>`,
        `  <span class="hl-type">std</span><span class="hl-punct">::</span><span class="hl-type">string</span> <span class="hl-property">motto</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(motto)}"</span><span class="hl-punct">;</span>`,
        `<span class="hl-punct">};</span>`
      ].join("\n"),
      swift: [
        `<span class="hl-keyword">struct</span> <span class="hl-type">Profile</span> <span class="hl-punct">{</span>`,
        `    <span class="hl-keyword">let</span> <span class="hl-property">name</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(name)}"</span>`,
        `    <span class="hl-keyword">let</span> <span class="hl-property">post</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(post)}"</span>`,
        `    <span class="hl-keyword">let</span> <span class="hl-property">email</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(email)}"</span>`,
        `    <span class="hl-keyword">let</span> <span class="hl-property">motto</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(motto)}"</span>`,
        `<span class="hl-punct">}</span>`
      ].join("\n"),
      python: [
        `<span class="hl-keyword">@dataclass</span>`,
        `<span class="hl-keyword">class</span> <span class="hl-type">Profile</span><span class="hl-punct">:</span>`,
        `    <span class="hl-property">name</span><span class="hl-punct">:</span> <span class="hl-type">str</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(name)}"</span>`,
        `    <span class="hl-property">post</span><span class="hl-punct">:</span> <span class="hl-type">str</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(post)}"</span>`,
        `    <span class="hl-property">email</span><span class="hl-punct">:</span> <span class="hl-type">str</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(email)}"</span>`,
        `    <span class="hl-property">motto</span><span class="hl-punct">:</span> <span class="hl-type">str</span> <span class="hl-operator">=</span> <span class="hl-string">"${escapeHtml(motto)}"</span>`
      ].join("\n")
    };
  };

  const renderContacts = (options = {}) =>
    data.topbar.contacts
      .map((item) => {
        const layout = options.layout === "menu" ? "menu" : "compact";
        const icon = renderContactIcon(item.type, {
          defaultState: layout === "menu" ? "original" : "black"
        });
        const qrId = `contact-qr-panel-${++qrPanelIndex}`;
        const commonClasses = [
          "contact-link",
          "contact-icon-button",
          layout === "menu" ? "menu-contact-link" : ""
        ]
          .filter(Boolean)
          .join(" ");
        const content = `
          ${icon}
          ${layout === "menu" ? `<span class="menu-contact-label">${escapeHtml(item.label)}</span>` : ""}
        `;

        if (item.type === "wechat" && item.qrSrc) {
          return `
            <div class="contact-popover${layout === "menu" ? " is-menu" : ""}">
              <button
                class="${commonClasses}"
                type="button"
                data-qr-toggle
                aria-label="${escapeHtml(item.label)}"
                aria-expanded="false"
                aria-controls="${qrId}"
              >
                ${content}
              </button>
              <div class="contact-qr-panel${layout === "menu" ? " is-menu" : ""}" id="${qrId}" hidden>
                <img class="contact-qr-image" src="${escapeHtml(item.qrSrc)}" alt="${escapeHtml(item.label)}二维码">
              </div>
            </div>
          `;
        }

        return `
          <a
            class="${commonClasses}"
            href="${escapeHtml(safeHref(item.href))}"${linkAttrs(item.href)}
            aria-label="${escapeHtml(item.label)}"
            title="${escapeHtml(item.label)}"
          >
            ${content}
          </a>
        `;
      })
      .join("");

  const renderCodeTabs = () =>
    data.about.codeTabs
      .map(
        (tab, index) => `
          <button
            class="code-tab${index === 1 ? " is-active" : ""}"
            type="button"
            data-code-tab="${escapeHtml(tab.id)}"
            aria-pressed="${index === 1 ? "true" : "false"}"
          >
            ${escapeHtml(tab.label)}
          </button>
        `
      )
      .join("");

  const renderProjects = () =>
    data.work.projects
      .map((project) => {
        const icon = project.iconSrc
          ? `<div class="app-icon">${renderThemeImage({
              lightSrc: project.iconSrc,
              darkSrc: project.darkIconSrc,
              alt: project.iconAlt || project.name,
              className: "app-icon-image"
            })}</div>`
          : `<div class="app-icon-fallback" aria-hidden="true">${escapeHtml(project.iconText || "AP")}</div>`;

        const summary = project.summary
          ? `<p class="app-summary">${escapeHtml(project.summary)}</p>`
          : "";

        const preview = project.previewSrc
          ? `
              <div class="app-preview-shell" aria-hidden="true">
                ${renderThemeImage({
                  lightSrc: project.previewSrc,
                  darkSrc: project.darkPreviewSrc,
                  alt: "",
                  className: "app-preview-image"
                })}
              </div>
            `
          : "";

        const websiteAction = project.websiteHref && project.websiteLabel
          ? `
              <a class="app-website-link" href="${escapeHtml(safeHref(project.websiteHref))}"${linkAttrs(
                project.websiteHref
              )}>
                ${escapeHtml(project.websiteLabel)}
              </a>
            `
          : "";

        const primaryAction = project.storeBadgeSrc && project.storeHref
          ? `
              <a class="app-store-link" href="${escapeHtml(safeHref(project.storeHref))}"${linkAttrs(
                project.storeHref
              )}>
                ${renderThemeImage({
                  lightSrc: project.storeBadgeSrc,
                  darkSrc: project.darkStoreBadgeSrc,
                  alt: project.storeBadgeAlt || "App Store",
                  className: "app-store-badge"
                })}
              </a>
            `
          : project.availabilityText
            ? `<div class="app-availability">${escapeHtml(project.availabilityText)}</div>`
            : "";

        const action = websiteAction || primaryAction
          ? `
              <div class="app-actions">
                ${websiteAction}
                ${primaryAction}
              </div>
            `
          : "";

        return `
          <article class="app-card surface reveal-on-scroll" data-pointer-surface>
            <div class="app-card-layout">
              <div class="app-card-copy">
                <div class="app-card-topline">
                  ${icon}
                  <div class="app-card-heading">
                    <div class="app-name">${escapeHtml(project.name)}</div>
                    ${summary}
                  </div>
                </div>
                <div class="app-card-action">
                  ${action}
                </div>
              </div>
              ${preview}
            </div>
          </article>
        `;
      })
      .join("");

  root.innerHTML = `
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-right">
          <div class="contact-links topbar-contact-links" aria-label="Contact links">
            ${renderContacts({ layout: "compact" })}
          </div>
          <div class="mobile-menu">
            <button
              class="mobile-menu-toggle"
              type="button"
              aria-label="打开联系方式菜单"
              aria-expanded="false"
              aria-controls="mobile-contact-menu"
              data-mobile-menu-toggle
            >
              <span class="mobile-menu-bar"></span>
              <span class="mobile-menu-bar"></span>
              <span class="mobile-menu-bar"></span>
            </button>
            <div class="mobile-menu-panel" id="mobile-contact-menu" data-mobile-menu-panel hidden>
              <div class="contact-links mobile-contact-links" aria-label="Mobile contact links">
                ${renderContacts({ layout: "menu" })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="main">
      <section class="about">
        <div class="container about-stack">
          <div class="hero-copy reveal-on-scroll">
            <h1 class="hero-title" aria-label="${escapeHtml(
              data.about.accentLine
            )}">
              <span class="hero-accent">${escapeHtml(data.about.accentLine)}</span>
            </h1>
            <div class="hero-meta">
              <img class="hero-avatar" src="./assets/avatar.png" alt="${escapeHtml(data.profile.displayName || data.profile.name)} avatar">
              <div class="hero-meta-copy">
                <div class="hero-meta-name">${escapeHtml(data.profile.displayName || data.profile.name)}</div>
                <div class="hero-meta-role">${escapeHtml(data.profile.role)}</div>
              </div>
            </div>
          </div>

          <aside class="code-panel surface reveal-on-scroll" data-pointer-surface>
            <div class="code-toolbar">
              <div class="code-lights" aria-hidden="true">
                <span class="code-light red"></span>
                <span class="code-light yellow"></span>
                <span class="code-light green"></span>
              </div>
              <div class="code-tabs" role="tablist" aria-label="Profile languages">
                ${renderCodeTabs()}
              </div>
            </div>
            <div class="code-body">
              <pre class="code-block"><code data-code-block></code></pre>
            </div>
          </aside>
        </div>
      </section>

      <section class="work">
        <div class="container">
          <div class="work-head reveal-on-scroll">
            <div class="work-label">${escapeHtml(data.work.eyebrow)}</div>
          </div>
          <div class="work-grid">
            ${renderProjects()}
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="footer-inner">
        <div class="footer-divider" aria-hidden="true"></div>
        <div class="footer-meta">
          <div class="footer-copy">Copyright © 2026 Jazmín. 保留所有权利。</div>
          <div class="footer-right">
            <div class="contact-links footer-contact-links" aria-label="Footer contact links">
              ${renderContacts({ layout: "compact" })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  if (typeof data.meta?.title === "string") {
    document.title = data.meta.title;
  }

  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag && typeof data.meta?.description === "string") {
    descriptionTag.setAttribute("content", data.meta.description);
  }

  const revealEls = Array.from(document.querySelectorAll(".reveal-on-scroll"));
  const pointerSurfaces = Array.from(document.querySelectorAll("[data-pointer-surface]"));
  const qrToggles = Array.from(document.querySelectorAll("[data-qr-toggle]"));
  const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
  const mobileMenuPanel = document.querySelector("[data-mobile-menu-panel]");
  const codeTabs = Array.from(document.querySelectorAll("[data-code-tab]"));
  const codeBlock = document.querySelector("[data-code-block]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const codeSnippets = createCodeSnippets();

  const setCodeLanguage = (language) => {
    if (!codeBlock || !codeSnippets[language]) {
      return;
    }

    codeBlock.innerHTML = codeSnippets[language];
    codeTabs.forEach((tab) => {
      const active = tab.getAttribute("data-code-tab") === language;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  if (codeTabs.length > 0) {
    codeTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const language = tab.getAttribute("data-code-tab");
        if (language) {
          setCodeLanguage(language);
        }
      });
    });
    setCodeLanguage("cpp");
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  if (!reduceMotion) {
    pointerSurfaces.forEach((surface) => {
      surface.addEventListener("pointermove", (event) => {
        const rect = surface.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        surface.style.setProperty("--pointer-x", `${x}%`);
        surface.style.setProperty("--pointer-y", `${y}%`);
      });

      surface.addEventListener("pointerleave", () => {
        surface.style.setProperty("--pointer-x", "50%");
        surface.style.setProperty("--pointer-y", "50%");
      });
    });
  }

  const qrPairs = qrToggles
    .map((toggle) => {
      const panelId = toggle.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const popover = toggle.closest(".contact-popover");

      if (!panel || !popover) {
        return null;
      }

      return { toggle, panel, popover };
    })
    .filter(Boolean);

  const closeAllQrPanels = () => {
    qrPairs.forEach(({ toggle, panel, popover }) => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      popover.classList.remove("is-open");
    });
  };

  if (qrPairs.length > 0) {
    qrPairs.forEach(({ toggle, panel, popover }) => {
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const shouldOpen = panel.hidden;
        closeAllQrPanels();
        panel.hidden = !shouldOpen;
        toggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
        popover.classList.toggle("is-open", shouldOpen);
      });
    });
  }

  const setMobileMenuOpen = (open) => {
    if (!mobileMenuToggle || !mobileMenuPanel) {
      return;
    }

    mobileMenuPanel.hidden = !open;
    mobileMenuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  if (mobileMenuToggle && mobileMenuPanel) {
    mobileMenuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setMobileMenuOpen(mobileMenuPanel.hidden);
    });

    mobileMenuPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  let lastScrollY = window.scrollY || window.pageYOffset || 0;

  window.addEventListener(
    "scroll",
    () => {
      const nextScrollY = window.scrollY || window.pageYOffset || 0;

      if (Math.abs(nextScrollY - lastScrollY) > 4) {
        closeAllQrPanels();
        setMobileMenuOpen(false);
        lastScrollY = nextScrollY;
      }
    },
    { passive: true }
  );

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (!event.target.closest(".contact-popover")) {
      closeAllQrPanels();
    }

    if (mobileMenuToggle && mobileMenuPanel && !event.target.closest(".mobile-menu")) {
      setMobileMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllQrPanels();
      setMobileMenuOpen(false);
    }
  });
})();
