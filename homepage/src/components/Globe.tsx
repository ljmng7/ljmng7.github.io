import { useEffect, useMemo, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useTheme } from "./ThemeProvider";

const MOVEMENT_DAMPING = 1400;
const FULL_ROTATION = Math.PI * 2;

type GlobeLocation = readonly [number, number];

export const DEFAULT_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => undefined,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [],
};

interface GlobeProps {
  className?: string;
  config?: COBEOptions;
  overlayPoints?: ReadonlyArray<GlobeLocation>;
  supplementalOverlayPoints?: ReadonlyArray<GlobeLocation>;
}

export function Globe({
  className,
  config = DEFAULT_GLOBE_CONFIG,
  overlayPoints = [],
  supplementalOverlayPoints = [],
}: GlobeProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(config.phi ?? 0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const shouldReduceMotion = useReducedMotion();
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });
  const themedConfig = useMemo<COBEOptions>(
    () =>
      theme === "dark"
        ? {
            ...config,
            dark: 1,
            baseColor: [1, 1, 1],
            glowColor: [0.05, 0.07, 0.1],
            mapBrightness: 1.35,
          }
        : config,
    [config, theme],
  );

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value === null ? "grab" : "grabbing";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current === null) return;
    const delta = clientX - pointerInteracting.current;
    pointerInteractionMovement.current = delta;
    rotation.set(rotation.get() + delta / MOVEMENT_DAMPING);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const drawOverlay = (currentPhi: number) => {
      const width = widthRef.current;
      const context = overlayCanvas.getContext("2d");
      if (!context || width === 0) return;

      const pixelRatio = Math.min(themedConfig.devicePixelRatio, 2);
      const pixelSize = Math.max(1, Math.round(width * pixelRatio));
      if (overlayCanvas.width !== pixelSize || overlayCanvas.height !== pixelSize) {
        overlayCanvas.width = pixelSize;
        overlayCanvas.height = pixelSize;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, width);

      const centerLatitude = themedConfig.theta;
      const centerLongitude = (3 * Math.PI) / 2 - currentPhi;
      const centerLatitudeSine = Math.sin(centerLatitude);
      const centerLatitudeCosine = Math.cos(centerLatitude);
      const globeRadius = width * 0.4 * (themedConfig.scale ?? 1);
      const centerX = width / 2 + (themedConfig.offset?.[0] ?? 0);
      const centerY = width / 2 + (themedConfig.offset?.[1] ?? 0);
      const pointRadius = Math.max(0.85, width / 650);

      context.fillStyle = "#ff0f0f";

      const drawPoints = (points: ReadonlyArray<GlobeLocation>) => {
        for (const [latitudeDegrees, longitudeDegrees] of points) {
          const latitude = (latitudeDegrees * Math.PI) / 180;
          const longitude = (longitudeDegrees * Math.PI) / 180;
          const longitudeDelta = longitude - centerLongitude;
          const latitudeSine = Math.sin(latitude);
          const latitudeCosine = Math.cos(latitude);
          const longitudeCosine = Math.cos(longitudeDelta);
          const depth =
            centerLatitudeSine * latitudeSine +
            centerLatitudeCosine * latitudeCosine * longitudeCosine;

          if (depth <= 0) continue;

          const projectedX = latitudeCosine * Math.sin(longitudeDelta);
          const projectedY =
            centerLatitudeCosine * latitudeSine -
            centerLatitudeSine * latitudeCosine * longitudeCosine;
          const edgeOpacity = Math.min(1, depth / 0.08);

          context.globalAlpha = 0.92 * edgeOpacity;
          context.beginPath();
          context.arc(
            centerX + projectedX * globeRadius,
            centerY - projectedY * globeRadius,
            pointRadius,
            0,
            FULL_ROTATION,
          );
          context.fill();
        }
      };

      drawPoints(overlayPoints);
      drawPoints(supplementalOverlayPoints);

      context.globalAlpha = 1;
    };

    const updateSize = () => {
      widthRef.current = canvas.offsetWidth;
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    const globe = createGlobe(canvas, {
      ...themedConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (pointerInteracting.current === null && !shouldReduceMotion) {
          phiRef.current += 0.005;
        }
        const currentPhi = phiRef.current + smoothRotation.get();
        state.phi = currentPhi;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
        drawOverlay(currentPhi);
      },
    });

    const revealFrame = window.requestAnimationFrame(() => {
      canvas.style.opacity = "1";
      overlayCanvas.style.opacity = "1";
    });

    return () => {
      window.cancelAnimationFrame(revealFrame);
      globe.destroy();
      window.removeEventListener("resize", updateSize);
    };
  }, [overlayPoints, shouldReduceMotion, smoothRotation, supplementalOverlayPoints, themedConfig]);

  return (
    <div className={["magic-globe", className].filter(Boolean).join(" ")}>
      <canvas
        className="magic-globe-canvas"
        ref={canvasRef}
        onPointerDown={(event) => updatePointerInteraction(event.clientX)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerCancel={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(event) => updateMovement(event.clientX)}
        onTouchMove={(event) => {
          if (event.touches[0]) updateMovement(event.touches[0].clientX);
        }}
      />
      <canvas className="magic-globe-overlay" ref={overlayCanvasRef} aria-hidden="true" />
    </div>
  );
}
