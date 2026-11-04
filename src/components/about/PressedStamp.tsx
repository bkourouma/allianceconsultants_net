"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./PressedStamp.module.css";

interface PressedStampProps {
  children: React.ReactNode;
  /**
   * "load": the stamp presses once shortly after the page paints (CSS only).
   * "view": it presses once when scrolled into view (JS arms it after mount).
   * Under prefers-reduced-motion the stamp is simply there.
   */
  trigger?: "load" | "view";
  /** Font size of the stamp, any CSS length. */
  size?: string;
  /** Rotation in degrees (−4…−6 recommended). */
  rotate?: number;
  className?: string;
}

type Phase = "static" | "armed" | "pressing";

/** A red rubber stamp. Server-renders in its final, stamped state. */
export function PressedStamp({
  children,
  trigger = "load",
  size,
  rotate = -5,
  className,
}: PressedStampProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    if (trigger !== "view") return;
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const arm = window.setTimeout(() => setPhase("armed"), 0);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("pressing");
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(arm);
      io.disconnect();
    };
  }, [trigger]);

  return (
    <span
      ref={ref}
      className={cn(
        "stamp",
        styles.root,
        trigger === "load" && styles.onLoad,
        phase === "armed" && styles.armed,
        phase === "pressing" && styles.pressing,
        className,
      )}
      style={
        {
          "--stamp-rot": `${rotate}deg`,
          ...(size ? { "--stamp-size": size } : null),
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}
