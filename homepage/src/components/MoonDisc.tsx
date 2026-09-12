import { useEffect, useRef } from "react";
import { moonPhase } from "./moon-phase";
import { SKY_TRANSITION_MS } from "./sky-transition";

export function MoonDisc() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const shadow = useRef<HTMLCanvasElement>(null);
  const highlight = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const ctx = target.getContext("2d");
    const shadowTarget = shadow.current;
    const shadowCtx = shadowTarget?.getContext("2d");
    const highlightTarget = highlight.current;
    const highlightCtx = highlightTarget?.getContext("2d");
    if (!ctx || !shadowTarget || !shadowCtx || !highlightTarget || !highlightCtx) return;
    const size = 256;
    target.width = target.height = size;
    shadowTarget.width = shadowTarget.height = size;
    highlightTarget.width = highlightTarget.height = size;
    const image = new Image();
    let disposed = false;
    let texture: ImageData | null = null;
    const paint = () => {
      if (disposed || !texture) return;
      const { fraction, phase } = moonPhase(new Date());
      target.dataset.illumination = fraction.toFixed(4);
      target.dataset.phase = phase.toFixed(4);
      const lightZ = fraction * 2 - 1;
      const lightX = Math.sqrt(Math.max(0, 1 - lightZ * lightZ)) * (phase < .5 ? 1 : -1);
      const output = ctx.createImageData(size, size);
      const darkOutput = shadowCtx.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const nx = (x + .5 - size / 2) / (size / 2 - 1);
        const ny = (size / 2 - y - .5) / (size / 2 - 1);
        const radius = Math.hypot(nx, ny);
        if (radius >= 1) continue;
        const nz = Math.sqrt(1 - radius * radius);
        // NASA's map is centered on longitude zero: the Earth-facing hemisphere.
        const u = .5 + Math.atan2(nx, nz) / (2 * Math.PI);
        const v = .5 - Math.asin(ny) / Math.PI;
        const tx = Math.min(texture.width - 1, Math.floor(u * texture.width));
        const ty = Math.min(texture.height - 1, Math.floor(v * texture.height));
        const source = (ty * texture.width + tx) * 4;
        const at = (y * size + x) * 4;
        const incident = nx * lightX + nz * lightZ;
        // A little earthshine preserves the dark limb; softer lunar reflectance
        // keeps the maria legible instead of making the moon look like a ball.
        const brightness = .055 + .945 * Math.pow(Math.max(0, incident), .32);
        for (let channel = 0; channel < 3; channel++) output.data[at + channel] = Math.min(255, texture.data[source + channel] * brightness * 1.25);
        output.data[at + 3] = Math.min(1, (1 - radius) * size / 2) * 255;
        // Separate the unlit hemisphere so daylight can show through it.
        if (incident <= 0) {
          darkOutput.data.set(output.data.subarray(at, at + 4), at);
          output.data[at + 3] = 0;
        }
      }
      ctx.putImageData(output, 0, 0);
      shadowCtx.putImageData(darkOutput, 0, 0);
      // A faint white overlay softens the gray texture without hiding its detail.
      for (let at = 0; at < output.data.length; at += 4) {
        output.data[at] = output.data[at + 1] = output.data[at + 2] = 255;
      }
      highlightCtx.putImageData(output, 0, 0);
    };
    image.onload = () => {
      if (disposed) return;
      const source = document.createElement("canvas");
      source.width = image.naturalWidth; source.height = image.naturalHeight;
      const context = source.getContext("2d")!;
      context.drawImage(image, 0, 0);
      texture = context.getImageData(0, 0, source.width, source.height);
      paint();
    };
    image.src = "/assets/sky/moon-lroc.jpg";
    const visible = () => { if (!document.hidden) paint(); };
    const timer = window.setInterval(visible, 60 * 60 * 1000);
    document.addEventListener("visibilitychange", visible);
    return () => {
      disposed = true; image.onload = null;
      clearInterval(timer); document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return <span className="mb-celestial-disc mb-moon-disc" aria-hidden="true" style={{ transitionDuration: `${SKY_TRANSITION_MS}ms` }}>
    <canvas ref={shadow} className="mb-moon-shadow" style={{ transitionDuration: `${SKY_TRANSITION_MS * .5}ms` }} />
    <canvas ref={canvas} />
    <canvas ref={highlight} className="mb-moon-highlight" style={{ transitionDuration: `${SKY_TRANSITION_MS * .5}ms` }} />
  </span>;
}
