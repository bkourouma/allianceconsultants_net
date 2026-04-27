import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  container?: boolean;
  bg?: "white" | "gray" | "dark" | "primary";
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING_CLASS: Record<NonNullable<SectionProps["padding"]>, string> = {
  none: "",
  sm: "slds-p-vertical_medium",
  md: "slds-p-vertical_x-large",
  lg: "slds-p-vertical_xx-large",
};

const BG_CLASS: Record<NonNullable<SectionProps["bg"]>, string> = {
  white: "section--white",
  gray: "section--gray",
  dark: "section--dark",
  primary: "section--primary",
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
          <div className="slds-container_x-large slds-container_center slds-p-horizontal_medium">
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
