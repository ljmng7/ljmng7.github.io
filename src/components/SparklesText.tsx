import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SparklesTextProps {
  children: string;
  className?: string;
  colors?: {
    first: string;
    second: string;
  };
  sparklesCount?: number;
}

interface SparkleConfig {
  color: string;
  delay: number;
  duration: number;
  left: number;
  scale: number;
  top: number;
}

function createSparkles(
  count: number,
  colors: SparklesTextProps["colors"],
): SparkleConfig[] {
  const palette = colors ?? { first: "#a07cfe", second: "#fe8fb5" };

  return Array.from({ length: count }, (_, index) => ({
    color: index % 2 === 0 ? palette.first : palette.second,
    delay: (index * 0.47) % 2.8,
    duration: 1.8 + (index % 4) * 0.34,
    left: 4 + ((index * 37) % 92),
    scale: 0.58 + (index % 3) * 0.18,
    top: 4 + ((index * 53) % 88),
  }));
}

export function SparklesText({
  children,
  className,
  colors,
  sparklesCount = 10,
}: SparklesTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const sparkles = useMemo(
    () => createSparkles(sparklesCount, colors),
    [colors, sparklesCount],
  );
  const classes = ["sparkles-text", className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className="sparkles-text-label">{children}</span>
      <span aria-hidden="true" className="sparkles-text-stars">
        {sparkles.map((sparkle, index) => (
          <motion.svg
            className="sparkles-text-star"
            height="20"
            key={`${index}-${sparkle.left}-${sparkle.top}`}
            viewBox="0 0 20 20"
            width="20"
            style={{
              color: sparkle.color,
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
            }}
            initial={{ opacity: 0, rotate: 0, scale: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.55, rotate: 0, scale: sparkle.scale }
                : {
                    opacity: [0, 1, 0],
                    rotate: [0, 45, 90],
                    scale: [0, sparkle.scale, 0],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    delay: sparkle.delay,
                    duration: sparkle.duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }
            }
          >
            <path
              d="M10 0c0 6.75 3.25 10 10 10-6.75 0-10 3.25-10 10 0-6.75-3.25-10-10-10 6.75 0 10-3.25 10-10Z"
              fill="currentColor"
            />
          </motion.svg>
        ))}
      </span>
    </span>
  );
}
