import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionStyle,
  type Transition,
  type Variants,
} from "motion/react";

interface SpinningTextProps
  extends Omit<HTMLMotionProps<"div">, "children" | "transition" | "variants"> {
  children: string | string[];
  duration?: number;
  radius?: number | string;
  reverse?: boolean;
  transition?: Transition;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}

interface CharacterStyle extends MotionStyle {
  "--index": number;
  "--radius": string;
  "--total": number;
}

const baseTransition: Transition = {
  repeat: Infinity,
  ease: "linear",
};

const baseItemVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

function getCharacterStyle(
  index: number,
  total: number,
  radius: number | string,
): CharacterStyle {
  return {
    "--index": index,
    "--radius": typeof radius === "number" ? `${radius}ch` : radius,
    "--total": total,
    transform: `
      translate(-50%, -50%)
      rotate(calc(360deg / var(--total) * var(--index)))
      translateY(calc(0px - var(--radius, 5ch)))
    `,
    transformOrigin: "center",
  };
}

export function SpinningText({
  children,
  className,
  duration = 10,
  radius = 5,
  reverse = false,
  style,
  transition,
  variants,
  ...props
}: SpinningTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const text = Array.isArray(children) ? children.join("") : children;
  const letters = [...text, " "];
  const classes = ["spinning-text", className].filter(Boolean).join(" ");

  const finalTransition: Transition = {
    ...baseTransition,
    ...transition,
    duration: transition?.duration ?? duration,
  };

  const containerVariants: Variants = {
    visible: { rotate: reverse ? -360 : 360 },
    ...variants?.container,
  };

  const itemVariants: Variants = {
    ...baseItemVariants,
    ...variants?.item,
  };

  return (
    <motion.div
      {...props}
      className={classes}
      style={style}
      initial="hidden"
      animate={shouldReduceMotion ? "hidden" : "visible"}
      variants={containerVariants}
      transition={finalTransition}
    >
      {letters.map((letter, index) => (
        <motion.span
          aria-hidden="true"
          className="spinning-text-character"
          key={`${index}-${letter}`}
          variants={itemVariants}
          style={getCharacterStyle(index, letters.length, radius)}
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{text}</span>
    </motion.div>
  );
}
