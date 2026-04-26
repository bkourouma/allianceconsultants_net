import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  container?: boolean;
  bg?: "white" | "gray" | "dark" | "primary";
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ as: Tag = "section", container = true, bg = "white", className, children, ...props }, ref) => {
    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "py-16 lg:py-24",
          {
            "bg-white": bg === "white",
            "bg-gray-50": bg === "gray",
            "bg-[var(--color-dark)] text-white": bg === "dark",
            "bg-[var(--color-primary)] text-white": bg === "primary",
          },
          className
        )}
        {...props}
      >
        {container ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        ) : (
          children
        )}
      </Tag>
    );
  }
);
Section.displayName = "Section";
