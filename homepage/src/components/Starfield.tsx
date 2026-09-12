import { useEffect, useRef } from "react";
import { useTheme, type Theme } from "./ThemeProvider";
import { SKY_TRANSITION_MS } from "./sky-transition";

// A separate canvas keeps particle motion independent of expensive model rendering.
export function Starfield() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialTheme = useRef(theme);
  const changeTheme = useRef<((theme: Theme) => void) | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;
    const viewport = canvas.parentElement!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let seed = 1986;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const palette = ["174,199,219", "70,137,188", "104,175,209", "209,146,91"];
    const sprites = palette.map(rgb => {
      const sprite = document.createElement("canvas"); sprite.width = sprite.height = 32;
      const ctx = sprite.getContext("2d")!;
      const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      glow.addColorStop(0, `rgba(${rgb},1)`);
      glow.addColorStop(.16, `rgba(${rgb},.85)`);
      glow.addColorStop(.38, `rgba(${rgb},.24)`);
      glow.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = glow; ctx.fillRect(0, 0, 32, 32); return sprite;
    });
    const stars = Array.from({ length: 1150 }, () => {
      const depth = random(); const color = random();
      return { u: random(), v: random(), phase: random() * Math.PI * 2, phase2: random() * 6.28,
        speed: .055 + random() * .09, range: 8 + depth * 24,
        size: .9 + Math.pow(depth, 3) * 7,
        alpha: .3 + depth * .7, sprite: sprites[color < .42 ? 0 : color < .78 ? 1 : color < .91 ? 2 : 3],
        dx: 0, dy: 0, vx: 0, vy: 0 };
    });
    // Soft cloud sprites are painted once; each cloud drifts and springs away
    // from the pointer independently, without blurring the full frame.
    const cloudSprites = Array.from({ length: 4 }, () => {
      const sprite = document.createElement("canvas"); sprite.width = 512; sprite.height = 240;
      const ctx = sprite.getContext("2d")!;
      for (let i = 0; i < 24; i++) {
        const x = 95 + random() * 320, y = 105 + (random() - .5) * 65;
        const radius = 30 + random() * 65;
        const puff = ctx.createRadialGradient(x, y, 0, x, y, radius);
        puff.addColorStop(0, "rgba(255,255,255,.32)");
        puff.addColorStop(.45, "rgba(255,255,255,.23)");
        puff.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = puff; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      return sprite;
    });
    const clouds = Array.from({ length: 9 }, (_, i) => ({
      u: (i % 3 + random() * .7) / 3, v: .08 + Math.floor(i / 3) * .31 + random() * .12,
      size: 260 + random() * 220, speed: 3 + random() * 5, phase: random() * Math.PI * 2,
      sprite: cloudSprites[i % cloudSprites.length], dx: 0, dy: 0, vx: 0, vy: 0,
    })).filter((_, i) => i !== 2); // Remove the upper-right cloud beside the sun.
    type Palette = number[][];
    const day: Palette = [[99, 175, 231], [157, 210, 243], [215, 237, 249]];
    const night: Palette = [[3, 7, 10], [3, 7, 10], [3, 7, 10]];
    const ease = (t: number) => t * t * (3 - 2 * t);
    const mix = (a: Palette, b: Palette, t: number) => a.map((color, i) => color.map((value, j) => value + (b[i][j] - value) * t));
    let currentTheme = initialTheme.current;
    let colors = currentTheme === "light" ? day : night;
    let fromColors = colors, targetColors = colors;
    let daylight = currentTheme === "light" ? 1 : 0, fromDaylight = daylight, targetDaylight = daylight;
    let transitionStart: number | null = null;
    let width = 1, height = 1, frame = 0, last = 0, time = 0;
    let pointerX = -1000, pointerY = -1000;
    let visible = true;
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden || !visible) { last = 0; return; }
      if (last && now - last < 1000 / 30) { frame = requestAnimationFrame(draw); return; }
      const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 30;
      last = now;
      if (!reduced.matches) time += dt;
      context.globalAlpha = 1;
      if (transitionStart !== null) {
        const t = reduced.matches ? 1 : Math.min(1, (now - transitionStart) / SKY_TRANSITION_MS);
        colors = mix(fromColors, targetColors, ease(t));
        daylight = fromDaylight + (targetDaylight - fromDaylight) * ease(t);
        if (t === 1) transitionStart = null;
      }
      const sky = context.createLinearGradient(0, 0, 0, height);
      colors.forEach((color, i) => sky.addColorStop(i === 0 ? 0 : i === 1 ? .55 : 1, `rgb(${color.map(Math.round).join(",")})`));
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);
      if (daylight > .001) {
        context.globalAlpha = daylight;
        for (const cloud of clouds) {
          const size = cloud.size * Math.min(1, width / 700);
          const span = width + size * 2;
          const x = ((cloud.u * width + time * cloud.speed + size) % span) - size;
          const y = cloud.v * height + Math.sin(time * .12 + cloud.phase) * 12;
          if (!reduced.matches) {
            const px = x + cloud.dx - pointerX, py = y + cloud.dy - pointerY;
            const distance = Math.hypot(px, py);
            const force = Math.pow(Math.max(0, 1 - distance / (size * .5 + 130)), 2) * 280;
            cloud.vx += (px / Math.max(distance, 1) * force - cloud.dx * .7 - cloud.vx * 2) * dt;
            cloud.vy += (py / Math.max(distance, 1) * force - cloud.dy * .7 - cloud.vy * 2) * dt;
            cloud.dx += cloud.vx * dt; cloud.dy += cloud.vy * dt;
          } else { cloud.dx = cloud.dy = cloud.vx = cloud.vy = 0; }
          context.drawImage(cloud.sprite, x + cloud.dx - size / 2, y + cloud.dy - size * .235, size, size * .47);
        }
      }
      const count = daylight > .999 ? 0 : Math.min(stars.length, Math.round(width * height / 1100));
      for (let i = 0; i < count; i++) {
        const star = stars[i];
        const driftX = reduced.matches ? 0 : star.range * (.65 * Math.sin(time * star.speed + star.phase) + .35 * Math.sin(time * star.speed * 1.73 + star.phase2));
        const driftY = reduced.matches ? 0 : star.range * (.6 * Math.cos(time * star.speed * .81 + star.phase2) + .4 * Math.sin(time * star.speed * 1.31 + star.phase));
        const x = star.u * width + driftX, y = star.v * height + driftY;
        if (!reduced.matches) {
          const px = x + star.dx - pointerX, py = y + star.dy - pointerY;
          const distance = Math.hypot(px, py);
          const force = Math.pow(Math.max(0, 1 - distance / 185), 2) * 150;
          const divisor = Math.max(distance, 1);
          star.vx += (px / divisor * force - star.dx * 2.4 - star.vx * 3.8) * dt;
          star.vy += (py / divisor * force - star.dy * 2.4 - star.vy * 3.8) * dt;
          star.dx += star.vx * dt; star.dy += star.vy * dt;
          const offset = Math.hypot(star.dx, star.dy);
          if (offset > 60) { star.dx *= 60 / offset; star.dy *= 60 / offset; }
        } else { star.dx = star.dy = star.vx = star.vy = 0; }
        context.globalAlpha = (1 - daylight) * star.alpha * (reduced.matches ? 1 : .92 + .08 * Math.sin(time * .3 + star.phase));
        context.drawImage(star.sprite, x + star.dx - star.size / 2, y + star.dy - star.size / 2, star.size, star.size);
      }
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    };
    const resume = () => { cancelAnimationFrame(frame); last = 0; frame = requestAnimationFrame(draw); };
    changeTheme.current = next => {
      if (next === currentTheme) return;
      currentTheme = next;
      fromColors = colors; fromDaylight = daylight;
      targetColors = next === "light" ? day : night;
      targetDaylight = next === "light" ? 1 : 0;
      transitionStart = performance.now(); resume();
    };
    const resize = new ResizeObserver(() => {
      width = viewport.clientWidth; height = viewport.clientHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0); resume();
    });
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = viewport.getBoundingClientRect(); pointerX = event.clientX - rect.left; pointerY = event.clientY - rect.top;
    };
    const leave = () => { pointerX = pointerY = -1000; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    observer.observe(viewport); resize.observe(viewport);
    viewport.addEventListener("pointermove", move, { passive: true });
    viewport.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", resume); reduced.addEventListener("change", resume);
    return () => {
      changeTheme.current = null;
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      viewport.removeEventListener("pointermove", move); viewport.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", resume); reduced.removeEventListener("change", resume);
    };
  }, []);
  useEffect(() => { changeTheme.current?.(theme); }, [theme]);
  return <canvas ref={canvasRef} className="mb-starfield" aria-hidden="true"/>;
}
