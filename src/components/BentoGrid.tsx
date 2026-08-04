import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"article"> {
  actions: ReactNode;
  background: ReactNode;
  description: string;
  Icon: ElementType;
  name: string;
}

const mergeClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(" ");

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div className={mergeClassNames("bento-grid", className)} {...props}>
      {children}
    </div>
  );
}

export function BentoCard({
  actions,
  background,
  className,
  description,
  Icon,
  name,
  ...props
}: BentoCardProps) {
  return (
    <article className={mergeClassNames("bento-card", className)} {...props}>
      <div className="bento-card-background" aria-hidden="true">
        {background}
      </div>

      <div className="bento-card-body">
        <div className="bento-card-copy">
          <Icon className="bento-card-icon" aria-hidden="true" />
          <h2 className="bento-card-title">{name}</h2>
          <p className="bento-card-description">{description}</p>
        </div>
        <div className="bento-card-action bento-card-action--mobile">{actions}</div>
      </div>

      <div className="bento-card-action bento-card-action--desktop">{actions}</div>
      <div className="bento-card-hover-overlay" aria-hidden="true" />
    </article>
  );
}
