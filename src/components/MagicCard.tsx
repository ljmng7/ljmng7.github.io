import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  gradientColor?: string;
  gradientFrom?: string;
  gradientOpacity?: number;
  gradientSize?: number;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#9e7aff",
  gradientTo = "#fe8bbb",
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const shouldReduceMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const gradientSizeRef = useRef(gradientSize);
  const cardBoundsRef = useRef<DOMRect | null>(null);
  const pointerPositionRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const pointerFrameRef = useRef(0);

  useEffect(() => {
    gradientSizeRef.current = gradientSize;
  }, [gradientSize]);

  const reset = useCallback(() => {
    if (pointerFrameRef.current) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = 0;
    }
    pointerPositionRef.current = null;
    cardBoundsRef.current = null;
    const offscreenPosition = -gradientSizeRef.current;
    mouseX.set(offscreenPosition);
    mouseY.set(offscreenPosition);
    setIsActive(false);
  }, [mouseX, mouseY]);

  const flushPointerPosition = useCallback(() => {
    pointerFrameRef.current = 0;
    const bounds = cardBoundsRef.current;
    const pointerPosition = pointerPositionRef.current;

    if (!bounds || !pointerPosition) return;
    mouseX.set(pointerPosition.clientX - bounds.left);
    mouseY.set(pointerPosition.clientY - bounds.top);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleWindowBlur = () => reset();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") reset();
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pointerFrameRef.current) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reset]);

  const orbSize = gradientSize * 2;
  const orbPosition = {
    height: orbSize,
    marginLeft: -gradientSize,
    marginTop: -gradientSize,
    width: orbSize,
    x: mouseX,
    y: mouseY,
  };
  const opacityTransition = {
    duration: shouldReduceMotion ? 0 : 0.22,
    ease: "easeOut" as const,
  };

  return (
    <div
      className={["magic-card", className].filter(Boolean).join(" ")}
      onPointerMove={(event) => {
        pointerPositionRef.current = { clientX: event.clientX, clientY: event.clientY };
        if (!pointerFrameRef.current) {
          pointerFrameRef.current = window.requestAnimationFrame(flushPointerPosition);
        }
      }}
      onPointerEnter={(event) => {
        cardBoundsRef.current = event.currentTarget.getBoundingClientRect();
        pointerPositionRef.current = { clientX: event.clientX, clientY: event.clientY };
        setIsActive(true);
        if (!pointerFrameRef.current) {
          pointerFrameRef.current = window.requestAnimationFrame(flushPointerPosition);
        }
      }}
      onPointerLeave={reset}
    >
      <div className="magic-card-glow-clip" aria-hidden="true">
        <motion.div
          className="magic-card-glow-orb"
          animate={{ opacity: isActive ? gradientOpacity : 0 }}
          initial={false}
          style={{
            ...orbPosition,
            background: `radial-gradient(circle, ${gradientColor}, transparent 70%)`,
          }}
          transition={opacityTransition}
        />
      </div>
      <div className="magic-card-content">{children}</div>
      <div className="magic-card-border-mask" aria-hidden="true">
        <motion.div
          className="magic-card-border-orb"
          animate={{ opacity: isActive ? 1 : 0 }}
          initial={false}
          style={{
            ...orbPosition,
            background: `radial-gradient(circle, ${gradientFrom}, ${gradientTo} 48%, transparent 72%)`,
          }}
          transition={opacityTransition}
        />
      </div>
    </div>
  );
}
