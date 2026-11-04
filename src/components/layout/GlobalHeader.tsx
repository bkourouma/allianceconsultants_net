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
import { ACADEMIE, LINES, lineStyle } from "@/lib/network";
import type { MenuItem } from "@/lib/validators/content";
import styles from "./GlobalHeader.module.css";

interface GlobalHeaderProps {
  menu: MenuItem[];
  brandName: string;
  logoUrl: string;
  /** Real contact channels, shown in the mobile coupon wallet. */
  contact?: { phones: string[]; whatsapp?: string | null };
  /** Sub-links for the Services / Formations dropdowns (footer menu data). */
  panelLinks?: { services?: MenuItem[]; formations?: MenuItem[] };
}

type PanelKind = "solutions" | "services" | "formations";

const PANEL_BY_HREF: Record<string, PanelKind> = {
  "/solutions": "solutions",
  "/services": "services",
  "/formations": "formations",
};

const PANEL_META: Record<
  PanelKind,
  { label: string; caption: string; all: string }
> = {
  solutions: {
    label: "Solutions",
    caption: "Nos solutions",
    all: "Toutes les solutions",
  },
  services: {
    label: "Services",
    caption: "Nos services",
    all: "Tous les services",
  },
  formations: {
    label: "Formations",
    caption: "Nos formations",
    all: "Toutes les formations",
  },
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const waHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

/** Mono, uppercase, tracked: the voice of the coupon's printed fields. */
const NAV_TYPE =
  "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] xl:text-[0.75rem] xl:tracking-[0.14em]";

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
      className="relative block h-12 w-24 shrink-0 overflow-hidden rounded-[3px] lg:h-14 lg:w-28"
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

/* ───────────────────────── Product chip ───────────────────────── */

function Chip({ id, className }: { id?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block size-3.5 shrink-0 rounded-[2px] bg-[var(--accent)] transition-transform duration-300 ease-[var(--ease-out-expo)]",
        className,
      )}
      style={
        id === "academie"
          ? ({ "--accent": ACADEMIE.color } as CSSProperties)
          : id
            ? lineStyle(id)
            : ({ "--accent": "var(--color-ink)" } as CSSProperties)
      }
    />
  );
}

/* ───────────────────────── Dropdown coupon sheet ───────────────────────── */

function CouponPanel({
  id,
  kind,
  open,
  pathname,
  extra,
  onNavigate,
}: {
  id: string;
  kind: PanelKind;
  open: boolean;
  pathname: string;
  extra?: MenuItem[];
  onNavigate: () => void;
}) {
  const meta = PANEL_META[kind];

  const rows: { key: string; href: string; name: string; sub?: string; chip: React.ReactNode; n?: string }[] =
    kind === "solutions"
      ? LINES.map((line, i) => ({
          key: line.id,
          href: `/solutions/${line.slug}`,
          name: line.name,
          sub: line.sector,
          n: String(i + 1).padStart(2, "0"),
          chip: <Chip id={line.id} />,
        }))
      : (extra ?? []).map((item) => ({
          key: item.href,
          href: item.href,
          name: item.label,
          chip:
            kind === "formations" ? (
              <Chip id="academie" />
            ) : (
              <Chip />
            ),
        }));

  return (
    <div
      id={id}
      role="group"
      aria-label={meta.label}
      className={cn(
        "coupon absolute -left-3 top-full z-10 w-[min(23rem,calc(100vw-2rem))] overflow-hidden motion-reduce:[transition:none]",
        kind !== "solutions" && "w-[min(21rem,calc(100vw-2rem))]",
        // Visibility flips instantly on open (so focus() works at once) and
        // only after the fade on close.
        open
          ? "visible translate-y-0 opacity-100 [transition:opacity_300ms_cubic-bezier(0.16,1,0.3,1),transform_300ms_cubic-bezier(0.16,1,0.3,1),visibility_0s]"
          : "invisible -translate-y-1.5 opacity-0 [transition:opacity_300ms_cubic-bezier(0.16,1,0.3,1),transform_300ms_cubic-bezier(0.16,1,0.3,1),visibility_0s_linear_300ms]",
      )}
    >
      <p className="t-field border-b-2 border-dashed border-ink px-4 pb-2 pt-3">
        {meta.caption}
      </p>
      <ul data-panel-list>
        {rows.map((row, i) => {
          const current = isActive(pathname, row.href);
          return (
            <li
              key={row.key}
              className={cn(i > 0 && "border-t border-dashed border-ink/30")}
            >
              <Link
                href={row.href}
                onClick={onNavigate}
                aria-current={current ? "page" : undefined}
                className="group/row flex min-h-14 items-center gap-3 px-4 py-2 transition-colors duration-200 hover:bg-enamel focus-visible:bg-enamel"
              >
                {row.n && (
                  <span
                    aria-hidden
                    className="carbon w-7 shrink-0 font-display text-[1.5rem] font-extrabold italic leading-none"
                  >
                    {row.n}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.25rem] font-bold leading-[1.1] text-ink">
                    {row.name}
                  </span>
                  {row.sub && <span className="t-field block">{row.sub}</span>}
                </span>
                {current ? (
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full bg-red"
                  />
                ) : null}
                <span className="group-hover/row:[&>*]:scale-125 group-focus-visible/row:[&>*]:scale-125">
                  {row.chip}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="tear bg-enamel">
        <Link
          href={`/${kind}`}
          onClick={onNavigate}
          className="group/all flex min-h-11 items-center justify-between gap-3 px-4 font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white"
        >
          {meta.all}
          <ArrowRight
            aria-hidden
            strokeWidth={2}
            className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/all:translate-x-1"
          />
        </Link>
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
  const toggleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusFirst = useRef(false);

  const [open, setOpen] = useState<{ id: PanelKind; pinned: boolean } | null>(
    null,
  );

  const activeIdx = items.findIndex((i) => isActive(pathname, i.href));

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

  // Close panels on navigation.
  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  // Keyboard-opened panel: move focus to its first coupon row.
  useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    const panel = document.getElementById(`nav-panel-${open.id}`);
    const first = () => panel?.querySelector<HTMLElement>("a[href]");
    first()?.focus();
    // The panel is still `visibility: hidden` on the very first frame of its
    // open transition, which makes focus() a no-op: retry once painted.
    if (panel?.contains(document.activeElement)) return;
    const raf = requestAnimationFrame(() => first()?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

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

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden h-full min-w-0 flex-1 items-center justify-end gap-3 lg:flex xl:gap-6"
    >
      <ul ref={listRef} className="flex h-full items-stretch">
        {items.map((item, i) => {
          const active = i === activeIdx;
          const kind = panelOf(item);
          const panelId = `nav-panel-${kind}`;
          const isOpen = open?.id === kind && kind !== null;

          return (
            <li
              key={item.href}
              className="relative flex h-full"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimer();
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
                    setOpen((cur) =>
                      cur?.id === kind && !cur.pinned ? null : cur,
                    ),
                  160,
                );
              }}
              onBlur={(e) => {
                if (
                  kind &&
                  e.relatedTarget &&
                  !e.currentTarget.contains(e.relatedTarget as Node)
                ) {
                  setOpen((cur) => (cur?.id === kind ? null : cur));
                }
              }}
              onKeyDown={(e: ReactKeyboardEvent<HTMLLIElement>) => {
                if (!kind) return;
                const target = e.target as HTMLElement;
                const inPanel = !!target.closest(`#${panelId}`);
                if (e.key === "Escape" && isOpen) {
                  e.stopPropagation();
                  setOpen(null);
                  toggleRefs.current[kind]?.focus();
                  return;
                }
                if (e.key === "ArrowDown" && !inPanel) {
                  e.preventDefault();
                  if (isOpen) {
                    document
                      .querySelector<HTMLElement>(`#${panelId} a[href]`)
                      ?.focus();
                  } else {
                    focusFirst.current = true;
                    setOpen({ id: kind, pinned: true });
                  }
                  return;
                }
                if (
                  inPanel &&
                  (e.key === "ArrowDown" || e.key === "ArrowUp")
                ) {
                  e.preventDefault();
                  const links = Array.from(
                    document.querySelectorAll<HTMLElement>(`#${panelId} a[href]`),
                  );
                  const at = links.indexOf(target.closest("a") as HTMLElement);
                  if (e.key === "ArrowUp" && at <= 0) {
                    toggleRefs.current[kind]?.focus();
                    return;
                  }
                  const next = e.key === "ArrowDown" ? at + 1 : at - 1;
                  links[Math.min(links.length - 1, Math.max(0, next))]?.focus();
                }
              }}
            >
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group/link flex h-full items-center whitespace-nowrap transition-colors duration-200",
                  NAV_TYPE,
                  kind ? "pl-2 pr-0.5 xl:pl-3 xl:pr-1" : "px-2 xl:px-3",
                  active ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "relative py-2.5 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 after:ease-[var(--ease-out-expo)] group-hover/link:after:scale-x-100 motion-reduce:after:transition-none",
                    active && "after:scale-x-100 after:bg-red",
                  )}
                >
                  {item.label}
                </span>
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
                  className="relative mr-0.5 grid h-full w-8 place-items-center text-ink-soft transition-colors before:absolute before:inset-y-0 before:-inset-x-1.5 before:content-[''] hover:text-ink"
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

              {kind && (
                <CouponPanel
                  id={panelId}
                  kind={kind}
                  open={isOpen}
                  pathname={pathname}
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
      </ul>

      {primary && (
        <Link
          href={primary.href}
          aria-current={isActive(pathname, primary.href) ? "page" : undefined}
          className={cn(
            "inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-[3px] border-2 border-ink px-3 font-semibold text-ink no-underline transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-expo)] hover:bg-ink hover:text-white active:translate-y-px xl:px-4",
            NAV_TYPE,
            isActive(pathname, primary.href) && "bg-ink text-white",
          )}
        >
          {primary.label}
        </Link>
      )}
    </nav>
  );
}

/* ───────────────────────── Mobile coupon wallet ───────────────────────── */

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
    if (
      !current ||
      !panelRef.current?.contains(current) ||
      current === panelRef.current
    ) {
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

  const phones = contact?.phones ?? [];
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
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b-2 border-ink bg-panel px-[clamp(1rem,4vw,2.5rem)]">
        <Logo brandName={brandName} logoUrl={logoUrl} />
        <button
          ref={closeRef}
          type="button"
          onClick={() => onClose()}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-[3px] border-2 border-ink bg-panel pl-3.5 pr-3 font-semibold text-ink transition-colors hover:bg-ink hover:text-white",
            NAV_TYPE,
          )}
        >
          Fermer
          <X aria-hidden strokeWidth={2} className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={cn("wrap py-6", styles.sheetIn)}>
          <nav aria-label="Navigation principale">
            <ul className="coupon">
              {items.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <li
                    key={item.href}
                    className={cn(i > 0 && "tear", styles.rise)}
                    style={{ "--i": i } as CSSProperties}
                  >
                    <Link
                      href={item.href}
                      onClick={link}
                      aria-current={active ? "page" : undefined}
                      className="group/m flex min-h-[3.75rem] items-center justify-between gap-4 px-5"
                    >
                      <span
                        className={cn(
                          "relative py-1 font-display text-[2.25rem] font-extrabold uppercase italic leading-none tracking-[0.005em] text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-[var(--ease-out-expo)]",
                          active
                            ? "after:scale-x-100 after:bg-red"
                            : "after:bg-ink group-active/m:after:scale-x-100",
                        )}
                      >
                        {item.label}
                      </span>
                      <ArrowRight
                        aria-hidden
                        strokeWidth={2}
                        className="size-5 shrink-0 text-ink-mute transition-transform duration-300 ease-[var(--ease-out-expo)] group-active/m:translate-x-1"
                      />
                    </Link>

                    {PANEL_BY_HREF[item.href] === "solutions" && (
                      <ul className="grid grid-cols-2 gap-x-3 px-5 pb-4">
                        {LINES.map((line) => (
                          <li key={line.id}>
                            <Link
                              href={`/solutions/${line.slug}`}
                              onClick={link}
                              className="flex min-h-11 items-center gap-2.5 font-display text-[1.0625rem] font-bold leading-tight text-ink"
                            >
                              <Chip id={line.id} />
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
              className="group/cta mt-6 flex h-14 items-center justify-center gap-3 rounded-[3px] bg-red font-display text-[1.25rem] font-bold uppercase tracking-[0.06em] text-white no-underline shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] transition-[background-color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] hover:bg-red-dk active:translate-y-[2px] active:shadow-none"
            >
              {primary.label}
              <ArrowRight
                aria-hidden
                strokeWidth={2.25}
                className="size-5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
              />
            </Link>
          )}

          {(phones.length > 0 || whatsapp) && (
            <div className="mt-8 pb-6">
              <hr className="tear" aria-hidden />
              <p className="t-field pt-4">Nous joindre</p>
              <ul className="mt-2 grid gap-2">
                {phones.map((phone) => (
                  <li key={phone}>
                    <a
                      href={telHref(phone)}
                      className="flex h-12 items-center gap-3 rounded-[3px] border-2 border-ink bg-panel px-4 font-semibold text-ink"
                    >
                      <Phone aria-hidden strokeWidth={2} className="size-4 shrink-0" />
                      <span className="font-mono text-[0.875rem] tracking-[0.04em] t-num">
                        {phone}
                      </span>
                    </a>
                  </li>
                ))}
                {whatsapp && (
                  <li>
                    <a
                      href={waHref(whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 items-center gap-3 rounded-[3px] border-2 border-ink bg-panel px-4 font-semibold text-ink"
                    >
                      <MessageCircle aria-hidden strokeWidth={2} className="size-4 shrink-0" />
                      <span className="font-mono text-[0.875rem] tracking-[0.04em]">
                        WhatsApp
                      </span>
                      <span className="sr-only"> (nouvel onglet)</span>
                    </a>
                  </li>
                )}
              </ul>
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
    <header className="sticky top-0 z-50 w-full border-b-2 border-ink bg-panel">
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
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-[3px] border-2 border-ink bg-panel pl-3.5 pr-3 font-semibold text-ink transition-colors hover:bg-ink hover:text-white lg:hidden",
            NAV_TYPE,
          )}
        >
          Menu
          <Menu aria-hidden strokeWidth={2} className="size-5" />
        </button>
      </div>

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
