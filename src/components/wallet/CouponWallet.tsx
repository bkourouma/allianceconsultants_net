"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LINES, lineStyle } from "@/lib/network";
import type { NetworkLine } from "@/lib/network";
import { cn } from "@/lib/utils";
import styles from "./wallet.module.css";

const HOVER_INTENT_MS = 170;
const TEAR_MS = 420;
const SLOTS = LINES.length - 1;

const number = (line: NetworkLine) =>
  String(LINES.findIndex((l) => l.id === line.id) + 1).padStart(2, "0");

function demoHref(slug: string) {
  const params = new URLSearchParams({
    intent: "demo",
    from: "homepage",
    block: "hero",
    solution: slug,
  });
  return `/contact-demo?${params.toString()}`;
}

/** Small Abidjan → Afrique francophone arc: dashed navy, two end marks. */
function RouteArc() {
  return (
    <span className={styles.arc} aria-hidden>
      <svg viewBox="0 0 220 56" preserveAspectRatio="none" focusable="false">
        <path
          d="M2 50 Q110 -22 218 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className={styles.dotA} />
      <span className={styles.dotB} />
    </span>
  );
}

/**
 * Le Carnet de coupons: the six solutions as a wallet. One coupon is lifted
 * (tilted, stamped, with its detachable stub); the five others sit below as a
 * strict list. Hovering (with intent), focusing with the arrow keys or pressing
 * a row swaps it with the lifted coupon. The stub is a real link to the demo
 * form; pressing it tears the stub off and presses the stamp, then follows the
 * link (skipped under prefers-reduced-motion).
 */
export function CouponWallet() {
  const router = useRouter();
  // order[0] is the lifted coupon, order[1..5] fill the list slots top to bottom.
  // `swapped` = the two coupons that just traded places (they alone animate in).
  const [{ order, swapped }, setState] = useState<{ order: number[]; swapped: number[] }>(() => ({
    order: LINES.map((_, i) => i),
    swapped: [],
  }));
  const touched = swapped.length > 0;
  const [tearing, setTearing] = useState(false);
  const [activeSlot, setActiveSlot] = useState(1);

  const pickRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hover = useRef({ timer: 0, lock: -1 });
  const tearTimer = useRef(0);

  const lift = useCallback((slot: number) => {
    setTearing(false);
    setState(({ order: prev }) => {
      const next = [...prev];
      [next[0], next[slot]] = [next[slot], next[0]];
      return { order: next, swapped: [next[0], next[slot]] };
    });
  }, []);

  useEffect(() => {
    const h = hover.current;
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setTearing(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      window.clearTimeout(h.timer);
      window.clearTimeout(tearTimer.current);
    };
  }, []);

  const lifted = LINES[order[0]];
  const href = demoHref(lifted.slug);

  const onStubClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (tearing) {
      e.preventDefault();
      return;
    }
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    setTearing(true);
    tearTimer.current = window.setTimeout(() => router.push(href), TEAR_MS);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>, slot: number) => {
    if (e.pointerType !== "mouse") return;
    const h = hover.current;
    if (h.lock === slot || h.timer) return;
    h.timer = window.setTimeout(() => {
      h.timer = 0;
      h.lock = slot;
      lift(slot);
    }, HOVER_INTENT_MS);
  };

  const onPointerLeave = (slot: number) => {
    const h = hover.current;
    window.clearTimeout(h.timer);
    h.timer = 0;
    if (h.lock === slot) h.lock = -1;
  };

  const onPickClick = (slot: number) => {
    const h = hover.current;
    window.clearTimeout(h.timer);
    h.timer = 0;
    // A hover already lifted this coupon: the click that follows must not swap it back.
    if (h.lock === slot) {
      h.lock = -1;
      return;
    }
    setActiveSlot(slot);
    lift(slot);
  };

  const onPickKeyDown = (e: KeyboardEvent<HTMLButtonElement>, slot: number) => {
    let next = slot;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = slot === SLOTS ? 1 : slot + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = slot === 1 ? SLOTS : slot - 1;
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = SLOTS;
    else return;
    e.preventDefault();
    setActiveSlot(next);
    lift(next);
    pickRefs.current[next]?.focus();
  };

  return (
    <div className={cn(styles.wallet, touched && styles.touched)}>
      <div className={cn(styles.cap, "t-field")} aria-hidden>
        <span>Nos solutions</span>
        <span>{LINES.length} coupons</span>
      </div>

      {/* Lifted coupon: remounted on each swap so it settles in again. */}
      <div
        key={lifted.id}
        role="group"
        aria-label={`Coupon ${number(lifted)} en avant : ${lifted.name}`}
        className={styles.lift}
        data-tearing={tearing}
      >
        <div className={styles.hd}>
          <span className={styles.hdChip} style={lineStyle(lifted.id)} aria-hidden>
            {lifted.glyph}
          </span>
          <span className={styles.hdName}>{lifted.name}</span>
          <span className={styles.hdTag}>{lifted.sector}</span>
        </div>

        <div className={styles.main}>
          <span className={cn(styles.sectorInline, "t-field")}>{lifted.sector}</span>
          <p className={styles.pitch}>{lifted.pitch}</p>
          <div className={styles.route} aria-hidden>
            <div>
              <div className={styles.pt}>Abidjan</div>
              <span className={styles.sub}>Depuis 2003</span>
            </div>
            <RouteArc />
            <div className={cn(styles.pt, styles.ptEnd)}>
              Afrique
              <br />
              francophone
            </div>
          </div>
          <a href={`/solutions/${lifted.slug}`} className={styles.link}>
            Voir la solution
            <span className="sr-only"> {lifted.name}</span>
            <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
          </a>
        </div>

        <div className={styles.stub}>
          <div className={styles.stubTop} aria-hidden>
            <span className={styles.stubCap}>Coupon détachable</span>
            <span className={styles.stubNum}>{number(lifted)}</span>
          </div>
          <a href={href} className={styles.stubCta} onClick={onStubClick}>
            Demander une démo
            <span className="sr-only"> pour {lifted.name}</span>
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </a>
        </div>

        <span className={styles.notch} aria-hidden />
        <span className={styles.stamp} aria-hidden>
          Démo demandée
        </span>
      </div>

      <ul
        className={styles.rows}
        aria-label="Les cinq autres coupons du carnet"
        aria-describedby="wallet-hint"
      >
        {order.slice(1).map((lineIndex, i) => {
          const slot = i + 1;
          const line = LINES[lineIndex];
          const num = number(line);
          const fresh = swapped.includes(lineIndex);
          return (
            // Keyed by slot: the focused control survives a swap.
            <li key={slot} className={styles.row}>
              <button
                type="button"
                ref={(el) => {
                  pickRefs.current[slot] = el;
                }}
                className={styles.pick}
                tabIndex={slot === activeSlot ? 0 : -1}
                aria-label={`Coupon ${num}, ${line.name}, ${line.sector} : mettre en avant`}
                onClick={() => onPickClick(slot)}
                onFocus={() => setActiveSlot(slot)}
                onKeyDown={(e) => onPickKeyDown(e, slot)}
                onPointerMove={(e) => onPointerMove(e, slot)}
                onPointerLeave={() => onPointerLeave(slot)}
              >
                <span key={`n-${line.id}`} className={cn(styles.no, fresh && styles.swapIn)} aria-hidden>
                  {num}
                </span>
                <span key={line.id} className={cn(styles.nm, fresh && styles.swapIn)} aria-hidden>
                  <span className={styles.nmName}>{line.name}</span>
                  <span className={styles.nmSector}>{line.sector}</span>
                </span>
              </button>
              <a
                key={`l-${line.id}`}
                href={`/solutions/${line.slug}`}
                className={cn(styles.more, fresh && styles.swapIn)}
              >
                <span className={styles.moreTop} aria-hidden>
                  <span className={styles.moreCap}>Coupon {num}</span>
                  <span className={styles.chip} style={lineStyle(line.id)}>
                    {line.glyph}
                  </span>
                </span>
                <span className={styles.moreText}>
                  Voir la solution
                  <span className="sr-only"> {line.name}</span>
                  <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p id="wallet-hint" className="sr-only">
        Survolez ou sélectionnez un coupon pour le mettre en avant. Les flèches haut et bas
        parcourent la liste.
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {touched ? `Coupon ${number(lifted)}, ${lifted.name}, mis en avant.` : ""}
      </p>
    </div>
  );
}
