import React, { forwardRef, useRef, type ReactNode } from "react";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

export interface DockProps {
  children: ReactNode;
  className?: string;
  direction?: "top" | "middle" | "bottom";
  disableMagnification?: boolean;
  iconDistance?: number;
  iconMagnification?: number;
  iconSize?: number;
}

export interface DockIconProps {
  children?: ReactNode;
  className?: string;
  disableMagnification?: boolean;
  distance?: number;
  magnification?: number;
  mouseX?: MotionValue<number>;
  size?: number;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

export const Dock = forwardRef<HTMLDivElement, DockProps>(function Dock(
  {
    children,
    className,
    direction = "middle",
    disableMagnification = false,
    iconDistance = DEFAULT_DISTANCE,
    iconMagnification = DEFAULT_MAGNIFICATION,
    iconSize = DEFAULT_SIZE,
  },
  ref,
) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      ref={ref}
      className={["magic-dock", `magic-dock--${direction}`, className]
        .filter(Boolean)
        .join(" ")}
      onMouseLeave={() => mouseX.set(Infinity)}
      onMouseMove={(event) => mouseX.set(event.pageX)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<DockIconProps>(child) || child.type !== DockIcon) {
          return child;
        }

        return React.cloneElement(child, {
          ...child.props,
          disableMagnification,
          distance: iconDistance,
          magnification: iconMagnification,
          mouseX,
          size: iconSize,
        });
      })}
    </motion.div>
  );
});

export function DockIcon({
  children,
  className,
  disableMagnification = false,
  distance = DEFAULT_DISTANCE,
  magnification = DEFAULT_MAGNIFICATION,
  mouseX,
  size = DEFAULT_SIZE,
}: DockIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const fallbackMouseX = useMotionValue(Infinity);
  const cursorDistance = useTransform(mouseX ?? fallbackMouseX, (pointerX) => {
    const bounds = iconRef.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return pointerX - bounds.x - bounds.width / 2;
  });
  const animatedSize = useTransform(
    cursorDistance,
    [-distance, 0, distance],
    [size, disableMagnification ? size : magnification, size],
  );
  const springSize = useSpring(animatedSize, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={iconRef}
      className={["magic-dock-icon", className].filter(Boolean).join(" ")}
      style={{ height: springSize, width: springSize }}
    >
      <div className="magic-dock-icon-content" style={{ height: size, width: size }}>
        {children}
      </div>
    </motion.div>
  );
}
