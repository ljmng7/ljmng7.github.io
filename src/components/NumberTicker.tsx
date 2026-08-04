import { useEffect, useMemo, useRef, type HTMLAttributes } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

interface NumberTickerProps extends HTMLAttributes<HTMLSpanElement> {
  decimalPlaces?: number;
  delay?: number;
  direction?: "up" | "down";
  value: number;
}

export function NumberTicker({
  className,
  decimalPlaces = 0,
  delay = 0,
  direction = "up",
  value,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces,
      }),
    [decimalPlaces],
  );

  useEffect(() => {
    if (!isInView) return;
    const timeout = window.setTimeout(() => {
      motionValue.set(direction === "down" ? 0 : value);
    }, reduceMotion ? 0 : delay * 1000);
    return () => window.clearTimeout(timeout);
  }, [delay, direction, isInView, motionValue, reduceMotion, value]);

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatter.format(value);
      return;
    }

    return springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = formatter.format(Number(latest.toFixed(decimalPlaces)));
    });
  }, [decimalPlaces, formatter, reduceMotion, springValue, value]);

  return (
    <span className={className} ref={ref} {...props}>
      {formatter.format(direction === "down" ? value : 0)}
    </span>
  );
}
