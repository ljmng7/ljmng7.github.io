import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

interface PointerProps extends HTMLMotionProps<"div"> {
  children?: ReactNode;
}

export function Pointer({ className, style, children, ...props }: PointerProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const parentBoundsRef = useRef<DOMRect | null>(null);
  const pointerPositionRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const pointerFrameRef = useRef(0);

  useEffect(() => {
    const parentElement = containerRef.current?.parentElement ?? null;

    const flushMousePosition = () => {
      pointerFrameRef.current = 0;
      const bounds = parentBoundsRef.current;
      const pointerPosition = pointerPositionRef.current;
      if (!bounds || !pointerPosition) return;

      x.set(pointerPosition.clientX - bounds.left);
      y.set(pointerPosition.clientY - bounds.top);
    };

    const handleMousePosition = (event: PointerEvent) => {
      pointerPositionRef.current = { clientX: event.clientX, clientY: event.clientY };
      if (!pointerFrameRef.current) {
        pointerFrameRef.current = window.requestAnimationFrame(flushMousePosition);
      }
    };

    const handleMouseEnter = (event: PointerEvent) => {
      parentBoundsRef.current = parentElement?.getBoundingClientRect() ?? null;
      handleMousePosition(event);
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      if (pointerFrameRef.current) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = 0;
      }
      pointerPositionRef.current = null;
      parentBoundsRef.current = null;
      setIsActive(false);
    };

    if (parentElement) {
      parentElement.style.cursor = "none";
      parentElement.addEventListener("pointermove", handleMousePosition, { passive: true });
      parentElement.addEventListener("pointerenter", handleMouseEnter, { passive: true });
      parentElement.addEventListener("pointerleave", handleMouseLeave, { passive: true });
    }

    return () => {
      if (parentElement) {
        parentElement.style.cursor = "";
        parentElement.removeEventListener("pointermove", handleMousePosition);
        parentElement.removeEventListener("pointerenter", handleMouseEnter);
        parentElement.removeEventListener("pointerleave", handleMouseLeave);
      }
      window.cancelAnimationFrame(pointerFrameRef.current);
    };
  }, [x, y]);

  return (
    <>
      <div ref={containerRef} aria-hidden="true" />
      <AnimatePresence>
        {isActive && (
          <motion.div
            {...props}
            className={["magic-pointer", className].filter(Boolean).join(" ")}
            style={{ x, y, ...style }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
