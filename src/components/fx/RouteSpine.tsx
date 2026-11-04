"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./RouteSpine.module.css";

const MIN_SECTIONS = 3;

/**
 * Perforation rail: a decorative dashed line in the left margin with one
 * small tick per top-level <main> section (no numerals); the current one
 * carries a small red dot. Purely visual (aria-hidden, no focusables).
 * Only visible >= 1360px. Kept under the historical RouteSpine name so the
 * layout mount does not change.
 */
export function RouteSpine() {
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement>(null);
  /** 0..1 position of each section top within <main>. */
  const [at, setAt] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const main = document.getElementById("main-content");
    let sections: HTMLElement[] = [];
    let tops: number[] = []; // document offsets
    let heights: number[] = [];
    let darks: boolean[] = [];
    let mainTop = 0;
    let mainH = 1;
    let raf = 0;
    let lastCurrent = -1;

    const measure = () => {
      if (!main || !sections.length) return;
      const y = window.scrollY;
      const mr = main.getBoundingClientRect();
      mainTop = mr.top + y;
      mainH = Math.max(1, mr.height);
      tops = sections.map((el) => el.getBoundingClientRect().top + y);
      heights = sections.map((el) => el.getBoundingClientRect().height);
      darks = sections.map((el) => {
        const rgb = getComputedStyle(el)
          .backgroundColor.match(/[\d.]+/g)
          ?.map(Number);
        return (
          !!rgb &&
          rgb.length >= 3 &&
          (rgb[3] ?? 1) > 0.5 &&
          (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 < 0.35
        );
      });
    };

    const publish = () => {
      const next = tops.map((t) => Math.min(1, Math.max(0, (t - mainTop) / mainH)));
      setAt((prev) =>
        prev.length === next.length && prev.every((v, i) => Math.abs(v - next[i]) < 0.0005)
          ? prev
          : next
      );
    };

    const update = () => {
      raf = 0;
      if (!sections.length) return;
      // Fade the rail out once the (dark) footer stub scrolls into view.
      const footer = document.querySelector("footer");
      railRef.current?.toggleAttribute(
        "data-away",
        !!footer && footer.getBoundingClientRect().top < window.innerHeight * 0.85
      );
      const readY = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      for (let i = 0; i < tops.length; i++) if (tops[i] <= readY) idx = i;
      // Each tick sits over whichever section is under it on screen: switch
      // it to a light ink while that section is dark (night).
      const rail = railRef.current;
      if (rail) {
        const rr = rail.getBoundingClientRect();
        rail.querySelectorAll<HTMLElement>("[data-tick]").forEach((el) => {
          const docY = window.scrollY + rr.top + parseFloat(el.dataset.p ?? "0") * rr.height;
          let k = 0;
          for (let i = 0; i < tops.length; i++) if (tops[i] <= docY) k = i;
          el.toggleAttribute("data-dark", !!darks[k] && docY < tops[k] + heights[k]);
        });
      }
      if (idx !== lastCurrent) {
        lastCurrent = idx;
        setCurrent(idx);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const detect = () => {
      if (!main) return;
      sections = Array.from(main.querySelectorAll<HTMLElement>(":scope > section"));
      if (sections.length < MIN_SECTIONS) {
        sections = [];
        tops = [];
        setAt((s) => (s.length ? [] : s));
        return;
      }
      measure();
      publish();
      lastCurrent = -1;
      schedule();
    };

    const remeasure = () => {
      if (!sections.length) return;
      measure();
      publish();
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

  if (at.length < MIN_SECTIONS) return null;

  const cur = Math.min(current, at.length - 1);

  return (
    <div ref={railRef} className={styles.rail} aria-hidden="true">
      <div className={styles.line} />
      {at.map((p, i) => (
        <span
          key={i}
          data-tick=""
          data-p={p.toFixed(4)}
          className={`${styles.tick} ${i <= cur ? styles.tickPassed : ""}`}
          style={{ top: `${(p * 100).toFixed(3)}%` }}
        >
          <span className={styles.bar} />
        </span>
      ))}
      <span className={styles.dot} style={{ top: `${(at[cur] * 100).toFixed(3)}%` }} />
    </div>
  );
}
