import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: "light" | "dark";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { hover = false, variant = "light", className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-2xl p-6 lg:p-8 transition duration-200",
          variant === "light"
            ? "border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            : "border border-white/10 bg-white/5 backdrop-blur-sm",
          hover &&
            (variant === "light"
              ? "hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30"
              : "hover:-translate-y-0.5 hover:bg-white/[0.07] hover:border-white/20"),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
