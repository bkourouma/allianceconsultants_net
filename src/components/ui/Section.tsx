import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  container?: boolean;
  bg?: "white" | "gray" | "dark" | "primary";
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING_CLASS: Record<NonNullable<SectionProps["padding"]>, string> = {
  none: "",
  sm: "py-10 lg:py-14",
  md: "py-16 lg:py-20",
  lg: "py-20 lg:py-32",
};

const BG_CLASS: Record<NonNullable<SectionProps["bg"]>, string> = {
  white: "bg-panel text-ink",
  gray: "bg-enamel text-ink",
  dark: "bg-night text-white",
  primary: "bg-ink text-white",
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      container = true,
      bg = "white",
      padding = "lg",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(BG_CLASS[bg], PADDING_CLASS[padding], className)}
        {...props}
      >
        {container ? (
          <div className="wrap">
            {children}
          </div>
        ) : (
          children
        )}
      </section>
    );
  },
);
Section.displayName = "Section";
