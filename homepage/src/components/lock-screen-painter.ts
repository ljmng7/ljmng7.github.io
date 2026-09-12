// Paints the MacBook display texture: a macOS-style lock screen (live clock, avatar,
// name, hint) that fades to a bare wallpaper once unlocked.
export const SCREEN_WIDTH = 1800;
export const SCREEN_HEIGHT = 1170;
// Layout is authored at SCREEN_WIDTH x SCREEN_HEIGHT; the texture is rendered at SCALE x
// that so text and edges stay crisp when the display fills the viewport.
const SCALE = 2;
const WALLPAPER = "/assets/desktop/wallpaper.jpg";
const DARK_WALLPAPER = "/assets/desktop/wallpaper_dark.jpg";
const AVATAR = "/assets/avatar.png";
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export interface ScreenPainter { readonly locked: boolean; unlock(): void; dispose(): void }

export function createScreenPainter(canvas: HTMLCanvasElement, onPaint: () => void, onError: () => void, onWallpaperColor: (r: number, g: number, b: number) => void): ScreenPainter {
  const W = SCREEN_WIDTH, H = SCREEN_HEIGHT;
  const hidpi = (target: HTMLCanvasElement) => {
    target.width = W * SCALE; target.height = H * SCALE;
    const c = target.getContext("2d")!;
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
    return c;
  };
  const ctx = hidpi(canvas);
  // Lock UI is rendered once per minute into its own layer so the unlock fade only recomposites.
  const layer = document.createElement("canvas"); const lctx = hidpi(layer);
  const mask = document.createElement("canvas"); const mctx = hidpi(mask);
  const shape = document.createElement("canvas"); const sctx = hidpi(shape);
  const avatarDisc = document.createElement("canvas");
  let glass: HTMLCanvasElement | null = null;
  let wallpaper = new Image();
  const avatar = new Image();
  let wallpaperRequest = 0;
  let wallpaperSource = "";
  let wallpaperReady = false, avatarReady = false;
  let locked = true, disposed = false, fade = 1, timer = 0, frame = 0;

  const zh = () => document.documentElement.lang.toLowerCase().startsWith("zh");
  const cover = (target: CanvasRenderingContext2D, image: HTMLImageElement) => {
    const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    target.drawImage(image, (W - w) / 2, (H - h) / 2, w, h);
  };
  // Frosted glass: heavily blurred, brightened wallpaper, later clipped to the clock glyphs.
  const getGlass = () => {
    if (glass) return glass;
    glass = document.createElement("canvas"); const g = hidpi(glass);
    const small = document.createElement("canvas"); small.width = 60; small.height = 39;
    const s = small.getContext("2d")!; s.drawImage(wallpaper, 0, 0, 60, 39);
    if ("filter" in g) g.filter = "blur(22px)";
    g.drawImage(small, -60, -60, W + 120, H + 120);
    if ("filter" in g) g.filter = "none";
    g.fillStyle = "rgba(255,255,255,.74)"; g.fillRect(0, 0, W, H);
    return glass;
  };
  // Glyph shape with rounded corners: a round-joined stroke fattens the outline evenly.
  const glyphs = (target: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, round: number) => {
    target.font = font; target.textAlign = "center"; target.textBaseline = "middle";
    target.lineJoin = "round"; target.lineCap = "round"; target.lineWidth = round * 2;
    target.strokeStyle = target.fillStyle;
    target.strokeText(text, x, y); target.fillText(text, x, y);
  };
  const glassText = (text: string, x: number, y: number, font: string) => {
    const round = 4;
    // Build the (stroke + fill) glyph silhouette first; destination-in with two separate
    // draws would intersect them and drop the rounded stroke.
    sctx.clearRect(0, 0, W, H); sctx.fillStyle = "#fff"; glyphs(sctx, text, x, y, font, round);
    mctx.globalCompositeOperation = "source-over";
    mctx.clearRect(0, 0, W, H); mctx.drawImage(getGlass(), 0, 0, W, H);
    mctx.globalCompositeOperation = "destination-in";
    mctx.drawImage(shape, 0, 0, W, H);
    lctx.save();
    lctx.shadowColor = "rgba(0,0,0,.28)"; lctx.shadowBlur = 42; lctx.shadowOffsetY = 12;
    lctx.drawImage(mask, 0, 0, W, H);
    lctx.restore();
    // Top-edge highlight: a solid copy peeking out above the glass.
    lctx.fillStyle = "rgba(255,255,255,.7)"; glyphs(lctx, text, x, y - 1.5, font, round);
    lctx.drawImage(mask, 0, 0, W, H);
  };
  // Antialiased circular avatar: the ring and photo are masked with a soft-edged disc
  // instead of clip(), which Chrome rasterises without antialiasing.
  const renderAvatar = (r: number) => {
    const size = r * 2 + 8;
    avatarDisc.width = avatarDisc.height = size * SCALE;
    const a = avatarDisc.getContext("2d")!;
    a.setTransform(SCALE, 0, 0, SCALE, 0, 0); a.imageSmoothingQuality = "high";
    a.fillStyle = "rgba(255,255,255,.92)"; a.fillRect(0, 0, size, size);
    if (avatarReady) a.drawImage(avatar, 4, 4, r * 2, r * 2);
    a.globalCompositeOperation = "destination-in";
    a.fillStyle = "#fff"; a.beginPath(); a.arc(size / 2, size / 2, r, 0, Math.PI * 2); a.fill();
    a.globalCompositeOperation = "source-over";
    return size;
  };
  const renderLayer = () => {
    const now = new Date();
    lctx.clearRect(0, 0, W, H);
    lctx.textAlign = "center"; lctx.textBaseline = "middle";
    lctx.shadowColor = "rgba(0,0,0,.4)"; lctx.shadowBlur = 14; lctx.shadowOffsetY = 2;
    lctx.fillStyle = "rgba(255,255,255,.9)"; lctx.font = `500 30px ${FONT}`;
    lctx.fillText(zh()
      ? now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })
      : now.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }), W / 2, 128);
    lctx.shadowColor = "transparent";
    const hh = String(now.getHours()).padStart(2, "0"), mm = String(now.getMinutes()).padStart(2, "0");
    glassText(`${hh}:${mm}`, W / 2, 232, `500 178px ${FONT}`);
    // Account avatar, name and hint.
    const cx = W / 2, cy = 992, r = 38;
    const size = renderAvatar(r);
    lctx.save();
    lctx.shadowColor = "rgba(0,0,0,.35)"; lctx.shadowBlur = 18; lctx.shadowOffsetY = 4;
    lctx.drawImage(avatarDisc, cx - size / 2, cy - size / 2, size, size);
    lctx.restore();
    lctx.shadowColor = "rgba(0,0,0,.4)"; lctx.shadowBlur = 12; lctx.shadowOffsetY = 2;
    lctx.fillStyle = "#fff"; lctx.font = `600 24px ${FONT}`; lctx.fillText("Jazmín", cx, 1064);
    lctx.fillStyle = "rgba(255,255,255,.8)"; lctx.font = `400 17px ${FONT}`;
    lctx.fillText(zh() ? "点击屏幕继续" : "Click the screen to continue", cx, 1100);
    lctx.shadowColor = "transparent";
  };
  const compose = () => {
    if (disposed || !wallpaperReady) return;
    ctx.globalAlpha = 1; cover(ctx, wallpaper);
    if (fade > 0) { ctx.globalAlpha = fade; ctx.drawImage(layer, 0, 0, W, H); ctx.globalAlpha = 1; }
    onPaint();
  };
  const tick = () => {
    clearTimeout(timer);
    if (disposed || !wallpaperReady || !locked) return;
    renderLayer(); compose();
    const now = Date.now();
    timer = window.setTimeout(tick, 60000 - now % 60000 + 40);
  };
  const visibility = () => { if (!document.hidden) tick(); };
  const updateWallpaper = () => {
    const source = document.documentElement.classList.contains("dark") ? DARK_WALLPAPER : WALLPAPER;
    if (source === wallpaperSource) return;
    wallpaperSource = source;
    const request = ++wallpaperRequest;
    const next = new Image();
    next.onload = () => {
      if (disposed || request !== wallpaperRequest) return;
      wallpaper = next; wallpaperReady = true; glass = null;
      // Sample the same centered crop shown on screen, so reflected light follows
      // the wallpaper rather than a separate, hard-coded theme palette.
      const sample = document.createElement("canvas"); sample.width = 48; sample.height = 32;
      const sampleContext = sample.getContext("2d")!;
      sampleContext.scale(48 / W, 32 / H); cover(sampleContext, wallpaper);
      const pixels = sampleContext.getImageData(0, 0, 48, 32).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < pixels.length; i += 4) { r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; }
      const divisor = 48 * 32 * 255;
      onWallpaperColor(r / divisor, g / divisor, b / divisor);
      // Repaint even after unlocking, without resetting the unlock transition.
      if (locked) tick();
      else { if (fade > 0) renderLayer(); compose(); }
    };
    next.onerror = () => { if (!disposed && request === wallpaperRequest) { wallpaperSource = ""; onError(); } };
    next.src = source;
  };
  const themeObserver = new MutationObserver(records => {
    if (records.some(record => record.attributeName === "class")) updateWallpaper();
    if (records.some(record => record.attributeName === "lang")) {
      if (locked) tick();
      else if (fade > 0) { renderLayer(); compose(); }
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "lang"] });
  avatar.onload = () => { if (disposed) return; avatarReady = true; tick(); };
  updateWallpaper(); avatar.src = AVATAR;
  document.addEventListener("visibilitychange", visibility);
  return {
    get locked() { return locked; },
    unlock() {
      if (!locked || disposed) return;
      locked = false; clearTimeout(timer);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { fade = 0; compose(); return; }
      const start = performance.now();
      const step = (now: number) => {
        fade = Math.max(0, 1 - (now - start) / 450);
        compose();
        if (fade > 0 && !disposed) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    },
    dispose() {
      disposed = true; themeObserver.disconnect(); clearTimeout(timer); cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
      wallpaper.onload = wallpaper.onerror = avatar.onload = null; wallpaper.src = avatar.src = "";
    },
  };
}
