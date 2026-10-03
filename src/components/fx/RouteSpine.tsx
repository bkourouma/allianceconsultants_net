"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./RouteSpine.module.css";

interface Station {
  /** 0..1 position of the section top within <main>. */
  at: number;
  accent: string;
}

const MIN_SECTIONS = 3;
const FALLBACK = "var(--color-ink)";

/**
 * Decorative route spine: one station per top-level <main > section, a line
 * that fills with scroll and a small "train" at the reading position.
 * Purely visual (aria-hidden, not focusable). Only visible >= 1360px.
 */
export function RouteSpine() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    const main = document.getElementById("main-content");
    let sections: HTMLElement[] = [];
    let tops: number[] = []; // document offsets
    let mainTop = 0;
    let mainH = 1;
    let raf = 0;
    let lastPassed = -1;
    let lastAccent = "";

    const detect = () => {
      if (!main) return;
      sections = Array.from(
        main.querySelectorAll<HTMLElement>(":scope > section"),
      );
      if (sections.length < MIN_SECTIONS) {
        sections = [];
        setStations((s) => (s.length ? [] : s));
        return;
      }
      measure();
      const accents = sections.map((el) => {
        const v = getComputedStyle(el).getPropertyValue("--accent").trim();
        return v || FALLBACK;
      });
      setStations(
        tops.map((t, i) => ({
          at: Math.min(1, Math.max(0, (t - mainTop) / mainH)),
          accent: accents[i],
        })),
      );
      lastPassed = -1;
      lastAccent = "";
      schedule();
    };

    const measure = () => {
      if (!main || !sections.length) return;
      const y = window.scrollY;
      const mr = main.getBoundingClientRect();
      mainTop = mr.top + y;
      mainH = Math.max(1, mr.height);
      tops = sections.map((el) => el.getBoundingClientRect().top + y);
      rootRef.current?.style.setProperty(
        "--h",
        `${rootRef.current.clientHeight}px`,
      );
    };

    const update = () => {
      raf = 0;
      const root = rootRef.current;
      if (!root || !sections.length) return;
      const readY = window.scrollY + window.innerHeight * 0.4;
      const p = Math.min(1, Math.max(0, (readY - mainTop) / mainH));
      root.style.setProperty("--p", p.toFixed(4));
      let idx = 0;
      for (let i = 0; i < tops.length; i++) if (tops[i] <= readY) idx = i;
      const count = tops.filter((t) => t <= readY).length;
      if (count !== lastPassed) {
        lastPassed = count;
        setPassed(count);
      }
      const accent =
        getComputedStyle(sections[idx]).getPropertyValue("--accent").trim() ||
        FALLBACK;
      if (accent !== lastAccent) {
        lastAccent = accent;
        root.style.setProperty("--spine-accent", accent);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const remeasure = () => {
      measure();
      if (sections.length) {
        setStations((prev) =>
          prev.length === tops.length
            ? prev.map((s, i) => ({
                ...s,
                at: Math.min(1, Math.max(0, (tops[i] - mainTop) / mainH)),
              }))
            : prev,
        );
      }
      schedule();
    };

    detect();
    // Content may stream in after mount: re-detect on child changes.
    const mo = main ? new MutationObserver(() => detect()) : null;
    if (main) mo?.observe(main, { childList: true });
    const ro = main ? new ResizeObserver(remeasure) : null;
    if (main) ro?.observe(main);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      mo?.disconnect();
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (stations.length < MIN_SECTIONS) return null;

  return (
    <div ref={rootRef} className={styles.spine} aria-hidden="true">
      <div className={styles.track} />
      <div className={styles.fill} />
      {stations.map((s, i) => (
        <span
          key={i}
          className={`${styles.station} ${i < passed ? styles.passed : ""}`}
          style={
            {
              top: `${(s.at * 100).toFixed(3)}%`,
              "--st": s.accent,
            } as React.CSSProperties
          }
        />
      ))}
      <div className={styles.train} />
    </div>
  );
}
