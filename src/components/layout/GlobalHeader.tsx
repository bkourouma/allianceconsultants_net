"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACADEMIE, LINES, getLine } from "@/lib/network";
import type { NetworkLine } from "@/lib/network";
import type { MenuItem } from "@/lib/validators/content";
import styles from "./GlobalHeader.module.css";

interface GlobalHeaderProps {
  menu: MenuItem[];
  brandName: string;
  logoUrl: string;
  /** Real contact channels, shown as quick actions in the mobile panel. */
  contact?: { phones: string[]; whatsapp?: string | null };
  /** Sub-links for the Services / Formations mega-panels (footer menu data). */
  panelLinks?: { services?: MenuItem[]; formations?: MenuItem[] };
}

type PanelKind = "solutions" | "services" | "formations";

const BRAND = { color: "#1457f5", on: "#ffffff" };

const PANEL_BY_HREF: Record<string, PanelKind> = {
  "/solutions": "solutions",
  "/services": "services",
  "/formations": "formations",
};

const PANEL_FOOTER: Record<PanelKind, { href: string; label: string }> = {
  solutions: { href: "/solutions", label: "Toutes les solutions" },
  services: { href: "/services", label: "Tous les services" },
  formations: { href: "/formations", label: "Toutes les formations" },
};

function routeAccent(pathname: string): { color: string; on: string } {
  const m = pathname.match(/^\/solutions\/([^/]+)/);
  if (m) {
    const line = getLine(m[1]);
    if (line) return { color: line.color, on: line.onColor };
  }
  if (pathname === "/formations" || pathname.startsWith("/formations/")) {
    return { color: ACADEMIE.color, on: ACADEMIE.onColor };
  }
  return BRAND;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const waHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

/* ───────────────────────── Logo ───────────────────────── */

function Logo({
  brandName,
  logoUrl,
  priority,
}: {
  brandName: string;
  logoUrl: string;
  priority?: boolean;
}) {
  // The PNG is a 500px square with generous padding: crop to the artwork.
  return (
    <Link
      href="/"
      className="relative block h-12 w-24 shrink-0 overflow-hidden rounded-md lg:h-14 lg:w-28"
    >
      <Image
        src={logoUrl}
        alt={`${brandName} — retour à l’accueil`}
        fill
        priority={priority}
        sizes="112px"
        className="object-cover object-center"
      />
    </Link>
  );
}

/* ───────────────────────── Roundel ───────────────────────── */

function Roundel({
  line,
  size = "md",
}: {
  line: Pick<NetworkLine, "name" | "glyph" | "color" | "onColor">;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-extrabold transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/item:scale-110",
        size === "md" ? "size-10 text-base" : "size-8 text-sm",
      )}
      style={{ background: line.color, color: line.onColor }}
    >
      {line.glyph}
    </span>
  );
}

/* ───────────────────────── Scroll progress ───────────────────────── */

function ScrollProgress({ fallback }: { fallback: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let raf = 0;
    let lastColor = "";

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${ratio})`;

      // Colour = accent of the section currently under the header.
      let color = fallbackRef.current;
      const probe = document.elementFromPoint(window.innerWidth / 2, 84);
      if (probe && !probe.closest("header")) {
        const v = getComputedStyle(probe).getPropertyValue("--accent").trim();
        if (v) color = v;
      }
      if (color !== lastColor) {
        lastColor = color;
        bar.style.background = color;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fallback]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-full h-[3px] w-full motion-reduce:hidden"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left will-change-transform"
        style={{ transform: "scaleX(0)", background: fallback }}
      />
    </div>
  );
}

/* ───────────────────────── Mega panel ───────────────────────── */

function MegaPanel({
  id,
  kind,
  open,
  extra,
  onNavigate,
}: {
  id: string;
  kind: PanelKind;
  open: boolean;
  extra?: MenuItem[];
  onNavigate: () => void;
}) {
  const footer = PANEL_FOOTER[kind];
  const label =
    kind === "solutions"
      ? "Solutions"
      : kind === "services"
        ? "Services"
        : "Formations";

  return (
    <div
      id={id}
      role="group"
      aria-label={label}
      className={cn(
        "fixed inset-x-0 top-[72px] border-b border-rule bg-panel shadow-[0_18px_30px_-18px_rgba(11,27,58,0.28)] transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        open
          ? "visible translate-y-0 opacity-100"
          : "invisible -translate-y-1 opacity-0",
      )}
    >
      <div className="wrap py-6">
        {kind === "solutions" ? (
          <ul className="grid grid-cols-3 gap-x-4 gap-y-1">
            {LINES.map((line) => (
              <li key={line.id}>
                <Link
                  href={`/solutions/${line.slug}`}
                  onClick={onNavigate}
                  className="group/item relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-enamel"
                >
                  <Roundel line={line} />
                  <span className="min-w-0">
                    <span className="block font-display text-[1.0625rem] font-bold leading-tight text-ink">
                      {line.name}
                    </span>
                    <span className="block text-sm text-ink-mute">
                      {line.sector}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-[3px] origin-left scale-x-0 rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/item:scale-x-100 group-focus-visible/item:scale-x-100"
                    style={{ background: line.color }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-3 gap-x-4 gap-y-1">
            {(extra ?? []).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="group/item relative flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-enamel"
                >
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full border-[3px] bg-panel transition-colors duration-300 group-hover/item:bg-[var(--c)]"
                    style={
                      {
                        borderColor:
                          kind === "formations"
                            ? ACADEMIE.color
                            : "var(--color-ink)",
                        "--c":
                          kind === "formations"
                            ? ACADEMIE.color
                            : "var(--color-ink)",
                      } as CSSProperties
                    }
                  />
                  <span className="font-display text-[1.0625rem] font-bold leading-tight text-ink">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-rule bg-enamel">
        <div className="wrap flex items-center justify-between gap-4 py-3">
          <p className="text-sm text-ink-mute">
            {kind === "solutions"
              ? "Six lignes, un seul réseau."
              : kind === "services"
                ? "Des correspondances entre vos outils et vos équipes."
                : "La ligne circulaire de l’Académie."}
          </p>
          <Link
            href={footer.href}
            onClick={onNavigate}
            className="group/all inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-ink transition-colors hover:bg-panel"
          >
            {footer.label}
            <ArrowRight
              aria-hidden
              strokeWidth={2}
              className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/all:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Desktop nav ───────────────────────── */

function DesktopNav({
  items,
  primary,
  pathname,
  panelLinks,
}: {
  items: MenuItem[];
  primary?: MenuItem;
  pathname: string;
  panelLinks?: GlobalHeaderProps["panelLinks"];
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const toggleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [centers, setCenters] = useState<number[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<{ id: PanelKind; pinned: boolean } | null>(
    null,
  );

  const activeIdx = items.findIndex((i) => isActive(pathname, i.href));
  const lastX = useRef<number | null>(null);

  const panelOf = useCallback(
    (item: MenuItem): PanelKind | null => {
      const kind = PANEL_BY_HREF[item.href];
      if (!kind) return null;
      if (kind === "services" && !panelLinks?.services?.length) return null;
      if (kind === "formations" && !panelLinks?.formations?.length) return null;
      return kind;
    },
    [panelLinks],
  );

  const measure = useCallback(() => {
    const next = itemRefs.current.map((li) =>
      li ? li.offsetLeft + li.offsetWidth / 2 : 0,
    );
    setCenters((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i])
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure, items.length]);

  // Close panels on navigation.
  useEffect(() => {
    setOpen(null);
    setHover(null);
  }, [pathname]);

  // Escape dismisses an open panel wherever focus is (hover-opened included).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside closes a pinned panel.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const clearTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const target = hover ?? (activeIdx >= 0 ? activeIdx : null);
  const x = target !== null && centers[target] ? centers[target] : lastX.current;
  if (x !== null) lastX.current = x;
  const trainVisible = hover !== null && x !== null;
  const firstX = centers[0] ?? 0;
  const activeX = activeIdx >= 0 ? (centers[activeIdx] ?? 0) : 0;

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden h-full min-w-0 flex-1 items-center justify-end gap-2 lg:flex xl:gap-3"
    >
      <ul
        ref={listRef}
        className="relative flex h-full items-stretch"
        onPointerLeave={() => setHover(null)}
      >
        {/* hairline track */}
        <li
          aria-hidden
          className="pointer-events-none absolute inset-x-2 bottom-[12.5px] h-px bg-rule"
        />
        {/* distance already travelled, in the route colour */}
        {activeIdx > 0 && (
          <li
            aria-hidden
            className="pointer-events-none absolute bottom-[12px] h-0.5 bg-[var(--route)] transition-[width] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
            style={{ left: firstX, width: Math.max(0, activeX - firstX) }}
          />
        )}

        {items.map((item, i) => {
          const active = i === activeIdx;
          const kind = panelOf(item);
          const panelId = `nav-panel-${kind}`;
          const isOpen = open?.id === kind && kind !== null;

          return (
            <li
              key={item.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative flex h-full"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimer();
                setHover(i);
                setOpen((cur) =>
                  kind
                    ? { id: kind, pinned: cur?.id === kind && cur.pinned }
                    : null,
                );
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "mouse" || !kind) return;
                clearTimer();
                closeTimer.current = setTimeout(
                  () =>
                    setOpen((cur) => (cur?.id === kind && !cur.pinned ? null : cur)),
                  140,
                );
              }}
              onFocus={() => setHover(i)}
              onBlur={(e) => {
                setHover(null);
                if (
                  kind &&
                  e.relatedTarget &&
                  !e.currentTarget.contains(e.relatedTarget as Node)
                ) {
                  setOpen((cur) => (cur?.id === kind ? null : cur));
                }
              }}
              onKeyDown={(e: ReactKeyboardEvent<HTMLLIElement>) => {
                if (e.key === "Escape" && isOpen && kind) {
                  e.stopPropagation();
                  setOpen(null);
                  toggleRefs.current[kind]?.focus();
                }
              }}
            >
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full items-center whitespace-nowrap pb-4 text-sm font-semibold transition-colors duration-200 xl:text-[0.9375rem]",
                  kind ? "pl-2 pr-0.5 xl:pl-2.5 xl:pr-1" : "px-2 xl:px-2.5",
                  active ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                {item.label}
              </Link>
              {kind && (
                <button
                  type="button"
                  ref={(el) => {
                    toggleRefs.current[kind] = el;
                  }}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-label={`${isOpen ? "Fermer" : "Ouvrir"} le menu ${item.label}`}
                  onClick={() => {
                    clearTimer();
                    setOpen((cur) =>
                      cur?.id === kind && cur.pinned
                        ? null
                        : { id: kind, pinned: true },
                    );
                  }}
                  className="mr-1 grid h-full w-6 place-items-center pb-4 text-ink-soft transition-colors hover:text-ink"
                >
                  <ChevronDown
                    aria-hidden
                    strokeWidth={2}
                    className={cn(
                      "size-4 transition-transform duration-300 ease-[var(--ease-out-expo)]",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              )}

              {/* station */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-[13px] left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border-2 transition-[width,height,background-color,border-color] duration-300",
                  active
                    ? "size-[14px] border-[var(--route)] bg-[var(--route)]"
                    : "size-[11px] border-ink-mute bg-panel",
                )}
              />

              {kind && (
                <MegaPanel
                  id={panelId}
                  kind={kind}
                  open={isOpen}
                  extra={
                    kind === "services"
                      ? panelLinks?.services
                      : kind === "formations"
                        ? panelLinks?.formations
                        : undefined
                  }
                  onNavigate={() => setOpen(null)}
                />
              )}
            </li>
          );
        })}

        {/* the train */}
        <li
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-[13px] left-0 z-10 transition-[transform,opacity] duration-[550ms] ease-[var(--ease-out-expo)] motion-reduce:transition-none",
            trainVisible ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: `translate3d(${(x ?? 0) - 13}px, 50%, 0)` }}
        >
          <span className="relative flex h-[11px] w-[26px] items-center justify-center gap-[3px] rounded-full bg-ink">
            <span className="size-[3px] rounded-full bg-white/90" />
            <span className="size-[3px] rounded-full bg-white/90" />
            <span className="size-[3px] rounded-full bg-[var(--route)] ring-1 ring-white/80" />
          </span>
        </li>
      </ul>

      {primary && (
        <Link
          href={primary.href}
          aria-current={isActive(pathname, primary.href) ? "page" : undefined}
          className="group/cta inline-flex h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-full bg-ink pl-4 pr-1.5 text-sm font-bold text-white no-underline xl:pl-5 xl:text-[0.9375rem] transition-colors duration-300 hover:bg-night-2"
        >
          {primary.label}
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-[var(--route)] text-[var(--on-route)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5 group-hover/cta:rotate-[-8deg]"
          >
            <ArrowRight strokeWidth={2} className="size-4" />
          </span>
        </Link>
      )}
    </nav>
  );
}

/* ───────────────────────── Mobile panel ───────────────────────── */

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function MobilePanel({
  items,
  primary,
  pathname,
  brandName,
  logoUrl,
  contact,
  onClose,
  closeRef,
}: {
  items: MenuItem[];
  primary?: MenuItem;
  pathname: string;
  brandName: string;
  logoUrl: string;
  contact?: GlobalHeaderProps["contact"];
  onClose: (opts?: { restoreFocus?: boolean }) => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [closeRef]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const current = document.activeElement;
    if (!current || !panelRef.current?.contains(current) || current === panelRef.current) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }
    if (e.shiftKey && current === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const phone = contact?.phones?.[0];
  const whatsapp = contact?.whatsapp;
  const link = () => onClose({ restoreFocus: false });

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col overflow-hidden bg-enamel outline-none lg:hidden",
        styles.panelIn,
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-rule bg-panel px-[clamp(1rem,4vw,2.5rem)]">
        <Logo brandName={brandName} logoUrl={logoUrl} />
        <button
          ref={closeRef}
          type="button"
          onClick={() => onClose()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink pl-4 pr-3 text-[0.9375rem] font-bold text-white"
        >
          Fermer
          <X aria-hidden strokeWidth={2} className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="wrap py-6">
          <nav aria-label="Navigation principale">
            <ul>
              {items.map((item, i) => {
                const colour = LINES[i % LINES.length].color;
                const active = isActive(pathname, item.href);
                const isLast = i === items.length - 1;
                return (
                  <li
                    key={item.href}
                    className={cn("relative pl-10", styles.rise)}
                    style={{ "--i": i } as CSSProperties}
                  >
                    {!isLast && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -bottom-7 left-[9px] top-7 w-1 -translate-x-1/2 rounded-full",
                          styles.grow,
                        )}
                        style={{
                          background: colour,
                          animationDelay: `${i * 40 + 120}ms`,
                        }}
                      />
                    )}
                    <div className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-10 top-7 size-[18px] -translate-y-1/2 rounded-full border-[4px] bg-panel"
                        style={{
                          borderColor: colour,
                          background: active ? colour : undefined,
                        }}
                      />
                      <Link
                        href={item.href}
                        onClick={link}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-14 items-center font-display text-[1.875rem] font-bold leading-none tracking-[-0.03em]",
                          active ? "text-ink" : "text-ink-soft",
                        )}
                      >
                        {item.label}
                      </Link>
                    </div>

                    {PANEL_BY_HREF[item.href] === "solutions" && (
                      <ul className="grid grid-cols-2 gap-2 pb-5 pt-1">
                        {LINES.map((line) => (
                          <li key={line.id}>
                            <Link
                              href={`/solutions/${line.slug}`}
                              onClick={link}
                              className="group/item flex min-h-11 items-center gap-2 rounded-2xl bg-panel py-1.5 pl-1.5 pr-2.5 text-[0.8125rem] font-bold leading-tight text-ink ring-1 ring-rule"
                            >
                              <Roundel line={line} size="sm" />
                              {line.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {primary && (
            <Link
              href={primary.href}
              onClick={link}
              className="group/cta mt-6 flex h-14 items-center justify-between rounded-full bg-ink pl-7 pr-2 text-base font-bold text-white"
            >
              {primary.label}
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full bg-[var(--route)] text-[var(--on-route)]"
              >
                <ArrowRight strokeWidth={2} className="size-5" />
              </span>
            </Link>
          )}

          {(phone || whatsapp) && (
            <div className="mt-3 grid grid-cols-2 gap-3 pb-6">
              {phone && (
                <a
                  href={telHref(phone)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-panel text-[0.9375rem] font-bold text-ink ring-2 ring-inset ring-ink"
                >
                  <Phone aria-hidden strokeWidth={2} className="size-4" />
                  Appeler
                  <span className="sr-only"> {phone}</span>
                </a>
              )}
              {whatsapp && (
                <a
                  href={waHref(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-panel text-[0.9375rem] font-bold text-ink ring-2 ring-inset ring-ink"
                >
                  <MessageCircle aria-hidden strokeWidth={2} className="size-4" />
                  WhatsApp
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Header ───────────────────────── */

export function GlobalHeader({
  menu,
  brandName,
  logoUrl,
  contact,
  panelLinks,
}: GlobalHeaderProps) {
  const pathname = usePathname();
  const route = routeAccent(pathname);
  const items = menu.filter((i) => !i.primary);
  const primary = menu.find((i) => i.primary);

  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(true);

  const close = useCallback((opts?: { restoreFocus?: boolean }) => {
    restoreFocus.current = opts?.restoreFocus !== false;
    setOpen(false);
  }, []);

  // Body scroll lock + focus return while the mobile panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const burger = burgerRef.current;
    return () => {
      document.body.style.overflow = previous;
      if (restoreFocus.current) burger?.focus();
      restoreFocus.current = true;
    };
  }, [open]);

  // Close on navigation and when the viewport grows to desktop.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-rule bg-panel"
      style={
        {
          "--route": route.color,
          "--on-route": route.on,
        } as CSSProperties
      }
    >
      <div className="wrap flex h-16 items-center justify-between gap-4 lg:h-[72px] xl:gap-6">
        <Logo brandName={brandName} logoUrl={logoUrl} priority />

        <DesktopNav
          items={items}
          primary={primary}
          pathname={pathname}
          panelLinks={panelLinks}
        />

        <button
          ref={burgerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-panel pl-4 pr-3 text-[0.9375rem] font-bold text-ink ring-2 ring-inset ring-ink transition-colors hover:bg-enamel lg:hidden"
        >
          Menu
          <Menu aria-hidden strokeWidth={2} className="size-5" />
        </button>
      </div>

      <ScrollProgress fallback={route.color} />

      {open && (
        <MobilePanel
          items={items}
          primary={primary}
          pathname={pathname}
          brandName={brandName}
          logoUrl={logoUrl}
          contact={contact}
          onClose={close}
          closeRef={closeRef}
        />
      )}
    </header>
  );
}
