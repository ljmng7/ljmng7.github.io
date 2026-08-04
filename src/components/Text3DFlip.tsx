import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useAnimate,
  useReducedMotion,
  type AnimationOptions,
  type ValueAnimationTransition,
} from "motion/react";

interface Text3DFlipProps {
  children: string;
  className?: string;
  flipTextClassName?: string;
  rotateDirection?: "top" | "right" | "bottom" | "left";
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number | "random";
  textClassName?: string;
  transition?: ValueAnimationTransition | AnimationOptions;
}

const defaultTransition: ValueAnimationTransition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
};

const rotationMap = {
  top: "rotateX(90deg)",
  right: "rotateY(90deg)",
  bottom: "rotateX(-90deg)",
  left: "rotateY(-90deg)",
} as const;

const containerTransforms = {
  top: "translateZ(-0.5lh)",
  right: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  bottom: "translateZ(-0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
} as const;

const frontFaceTransforms = {
  top: "translateZ(0.5lh)",
  right: "rotateY(-90deg) translateX(50%) rotateY(90deg)",
  bottom: "translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
} as const;

const backFaceTransforms = {
  top: "rotateX(-90deg) translateZ(0.5lh)",
  right:
    "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
  bottom: "rotateX(90deg) translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(50%) rotateY(-90deg) translateX(50%)",
} as const;

export function Text3DFlip({
  children,
  className,
  flipTextClassName,
  rotateDirection = "right",
  staggerDuration = 0.05,
  staggerFrom = "first",
  textClassName,
  transition = defaultTransition,
}: Text3DFlipProps) {
  const isAnimatingRef = useRef(false);
  const isMountedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const characters = useMemo(() => Array.from(children), [children]);
  const classes = ["text-3d-flip", className].filter(Boolean).join(" ");
  const frontFaceClasses = [
    "text-3d-flip-face",
    "text-3d-flip-face--front",
    textClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const backFaceClasses = [
    "text-3d-flip-face",
    "text-3d-flip-face--back",
    flipTextClassName,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      isAnimatingRef.current = false;
    };
  }, []);

  const getStaggerDelay = useCallback(
    (index: number) => {
      if (staggerFrom === "first") return index * staggerDuration;
      if (staggerFrom === "last") {
        return (characters.length - 1 - index) * staggerDuration;
      }
      if (staggerFrom === "center") {
        const center = Math.floor(characters.length / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * characters.length);
        return Math.abs(randomIndex - index) * staggerDuration;
      }
      return Math.abs(staggerFrom - index) * staggerDuration;
    },
    [characters.length, staggerDuration, staggerFrom],
  );

  const handleHoverStart = useCallback(async () => {
    if (shouldReduceMotion || isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    try {
      await animate(
        ".text-3d-flip-char",
        { transform: rotationMap[rotateDirection] },
        {
          ...transition,
          delay: (index: number) => getStaggerDelay(index),
        },
      );

      if (!isMountedRef.current) return;

      await animate(
        ".text-3d-flip-char",
        { transform: "rotateX(0deg) rotateY(0deg)" },
        { duration: 0 },
      );
    } finally {
      if (isMountedRef.current) {
        isAnimatingRef.current = false;
      }
    }
  }, [animate, getStaggerDelay, rotateDirection, shouldReduceMotion, transition]);

  return (
    <span
      className={classes}
      onClick={handleHoverStart}
      onPointerEnter={handleHoverStart}
      ref={scope}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="text-3d-flip-word">
        {characters.map((character, index) => (
          <span
            className="text-3d-flip-char"
            key={`${index}-${character}`}
            style={{ transform: containerTransforms[rotateDirection] }}
          >
            <span
              className={frontFaceClasses}
              style={{ transform: frontFaceTransforms[rotateDirection] }}
            >
              {character}
            </span>
            <span
              className={backFaceClasses}
              style={{ transform: backFaceTransforms[rotateDirection] }}
            >
              {character}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
