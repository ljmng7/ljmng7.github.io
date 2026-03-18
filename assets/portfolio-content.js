window.portfolioContent = {
  meta: {
    title: "Jazmín‘s Homepage",
    description: "A quiet personal homepage focused on identity and selected app work."
  },
  profile: {
    name: "Jazmín",
    displayName: "Jazmín",
    englishName: "Jiaming Li",
    role: "USTC Student, Apple Independent Developer",
    bio: "I care about technology, interface detail, and software that feels thoughtful, clear, and quietly alive.",
    email: "jazmin_li@icloud.com",
    github: "https://github.com/ljmng7",
    motto: "Think different."
  },
  topbar: {
    contacts: [
      { type: "github", label: "GitHub", href: "https://github.com/ljmng7" },
      { type: "xiaohongshu", label: "小红书", href: "https://www.xiaohongshu.com/user/profile/66a6d5f2000000001d020f1b" },
      { type: "douyin", label: "抖音", href: "https://v.douyin.com/aTWTd9BPAFI/" },
      { type: "wechat", label: "微信公众号", qrSrc: "./assets/微信公众号.JPG" },
      { type: "x", label: "X", href: "https://x.com/ming_li28643" },
      { type: "instagram", label: "Instagram", href: "https://www.instagram.com/lucid.jasmine/" },
      { type: "email", label: "Email", href: "mailto:jazmin_li@icloud.com" }
    ]
  },
  about: {
    eyebrow: "About",
    accentLine: "make tasteful apps.",
    codeTabs: [
      { id: "cpp", label: "C/C++" },
      { id: "swift", label: "Swift" },
      { id: "python", label: "Python" }
    ]
  },
  work: {
    eyebrow: "works",
    projects: [
      {
        name: "馋香鸡",
        websiteHref: "./YumChicken.html",
        websiteLabel: "访问官网",
        iconSrc: "./assets/YumChicken/YumChick-iOS-Default-1024x1024@1x.png",
        darkIconSrc: "./assets/YumChicken/YumChick-iOS-Dark-1024x1024@1x.png",
        iconAlt: "馋香鸡 app icon",
        summary: "专注做饭的极简工具",
        previewSrc: "./assets/YumChicken.png",
        darkPreviewSrc: "./assets/YumChicken_Dark.png",
        storeHref: "https://apps.apple.com/us/app/%E9%A6%8B%E9%A6%99%E9%B8%A1/id6759188913",
        storeBadgeSrc: "./assets/Download_on_App_Store/Download_on_the_App_Store_Badge_CNSC_RGB_blk_092917.svg",
        darkStoreBadgeSrc: "./assets/Download_on_App_Store/Download_on_the_App_Store_Badge_CNSC_RGB_wht_092917.svg",
        storeBadgeAlt: "Download on the App Store"
      },
      {
        name: "Musio",
        iconSrc: "./assets/Musio/Musio-iOS-Default-1024x1024@1x.png",
        darkIconSrc: "./assets/Musio/Musio-iOS-Dark-1024x1024@1x.png",
        iconAlt: "Musio app icon",
        summary: "臻藏你的音乐品味",
        previewSrc: "./assets/Musio.png",
        darkPreviewSrc: "./assets/Musio_Dark.png",
        availabilityText: "COMING SOON"
      }
    ]
  }
};
