import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/validators/content";
import { ACADEMIE, LINES } from "@/lib/network";
import {
  FacebookIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "./SocialIcons";
import styles from "./GlobalFooter.module.css";
import { ManageCookiesButton } from "@/components/shared/ManageCookiesButton";

interface GlobalFooterProps {
  settings: SiteSettings;
}

type Item = { label: string; href: string };

const isExternal = (href: string) => /^https?:\/\//.test(href);
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const waHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
const normalizeUrl = (url: string) => url.replace(/\/+$/, "").toLowerCase();

/** Footer solution labels ("ImmoTopia") → the matching product chip colour. */
function solutionColour(label: string): string | undefined {
  const key = label.toLowerCase().split(/[\s.]/)[0];
  return LINES.find((l) => l.name.toLowerCase().startsWith(key))?.color;
}

interface Column {
  key: string;
  title: string;
  href: string;
  items: Item[];
  /** Product chip colour for a row (solutions, formations); none for plain rows. */
  chip?: (item: Item) => string | undefined;
}

const NewTab = () => <span className="sr-only"> (nouvel onglet)</span>;

export function GlobalFooter({ settings }: GlobalFooterProps) {
  const { brand, contact, footerMenu, social } = settings;
  const year = new Date().getFullYear();

  const allColumns: Column[] = [
    {
      key: "solutions",
      title: "Solutions",
      href: "/solutions",
      items: footerMenu.solutions ?? [],
      chip: (item) => solutionColour(item.label),
    },
    {
      key: "services",
      title: "Services",
      href: "/services",
      items: footerMenu.services ?? [],
    },
    {
      key: "formations",
      title: "Formations",
      href: "/formations",
      items: footerMenu.formations ?? [],
      chip: () => ACADEMIE.color,
    },
    {
      key: "blog",
      title: "Blog",
      href: "/blog",
      items: footerMenu.blog ?? [],
    },
  ];
  const columns = allColumns.filter((c) => c.items.length > 0);

  const networks = [
    { label: "LinkedIn", href: social.linkedin, Icon: LinkedInIcon },
    { label: "Facebook", href: social.facebook, Icon: FacebookIcon },
    { label: "YouTube", href: social.youtube, Icon: YouTubeIcon },
    { label: "X", href: social.x, Icon: XIcon },
  ].filter((n): n is { label: string; href: string; Icon: typeof XIcon } =>
    Boolean(n.href),
  );

  // Extra Facebook pages (skip the one already shown as the main Facebook icon).
  const mainFacebook = social.facebook ? normalizeUrl(social.facebook) : null;
  const pages = (footerMenu.social ?? []).filter(
    (p) => normalizeUrl(p.href) !== mainFacebook,
  );

  const whatsapp = contact.whatsapp;

  return (
    <footer
      className="text-white"
      style={
        {
          // Focus ring and accents must read on the night stock.
          "--accent": "#9db8ff",
          "--on-accent": "#0b1b3a",
        } as React.CSSProperties
      }
    >
      <div aria-hidden className={styles.edge} />
      <div className="bg-night">
        <div className="wrap pb-24 pt-10 lg:pt-14">
          {/* ─── Tagline + brand ─── */}
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <p className="max-w-[30ch] font-display text-[clamp(1.875rem,1.2rem+2.6vw,3.25rem)] font-extrabold italic leading-[1.02] tracking-[-0.005em] text-white text-balance">
              {brand.tagline}
            </p>
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <div className="relative block h-14 w-28 shrink-0 overflow-hidden rounded-[3px] bg-white">
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  sizes="112px"
                  className="object-cover object-center"
                />
              </div>
              <p className="max-w-[26ch] text-[0.9375rem] leading-snug text-white/75">
                {brand.alternateName ?? brand.name}, depuis {brand.foundingYear}.
              </p>
            </div>
          </div>

          {/* ─── Site columns ─── */}
          <nav
            aria-label="Plan du site"
            className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          >
            {columns.map((col) => (
              <div key={col.key} className="min-w-0">
                <Link
                  href={col.href}
                  className="group/h inline-flex min-h-11 items-center gap-2 font-display text-[1.625rem] font-bold leading-none text-white"
                >
                  {col.title}
                  <span
                    aria-hidden
                    className="h-0.5 w-0 bg-white transition-[width] duration-300 ease-[var(--ease-out-expo)] group-hover/h:w-4 group-focus-visible/h:w-4"
                  />
                </Link>
                <hr className={`${styles.perf} mb-2 mt-1`} aria-hidden />
                <ul>
                  {col.items.map((item) => {
                    const external = isExternal(item.href);
                    const chip = col.chip?.(item);
                    const cls =
                      "group/row flex min-h-11 items-center gap-2.5 rounded-[3px] py-1 text-[0.9375rem] font-medium text-white/80 transition-colors duration-200 hover:text-white";
                    const inner = (
                      <>
                        {chip && (
                          <span
                            aria-hidden
                            className="size-2.5 shrink-0 rounded-[2px] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/row:scale-125"
                            style={{ background: chip }}
                          />
                        )}
                        <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/row:translate-x-0.5">
                          {item.label}
                        </span>
                      </>
                    );
                    return (
                      <li key={`${item.href}-${item.label}`}>
                        {external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cls}
                          >
                            {inner}
                            <ArrowUpRight
                              aria-hidden
                              strokeWidth={2}
                              className="size-3.5 shrink-0 text-white/50"
                            />
                            <NewTab />
                          </a>
                        ) : (
                          <Link href={item.href} className={cls}>
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* ─── Contact + socials ─── */}
          <hr className={`${styles.perf} mt-14 lg:mt-16`} aria-hidden />
          <div className="grid gap-12 pt-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-[1.625rem] font-bold leading-none text-white">
                Nous joindre
              </h2>
              <ul className="mt-4 grid gap-x-8 text-[0.9375rem] sm:grid-cols-2">
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="group/c flex min-h-11 items-center gap-3 break-all text-white/85 transition-colors hover:text-white"
                  >
                    <Mail aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-white/60 group-hover/c:text-white" />
                    {contact.email}
                  </a>
                </li>
                {contact.phones.map((phone) => (
                  <li key={phone}>
                    <a
                      href={telHref(phone)}
                      className="group/c flex min-h-11 items-center gap-3 text-white/85 transition-colors hover:text-white"
                    >
                      <Phone aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-white/60 group-hover/c:text-white" />
                      <span className="t-num">{phone}</span>
                    </a>
                  </li>
                ))}
                {whatsapp && (
                  <li>
                    <a
                      href={waHref(whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/c flex min-h-11 items-center gap-3 text-white/85 transition-colors hover:text-white"
                    >
                      <MessageCircle aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-white/60 group-hover/c:text-white" />
                      <span>
                        WhatsApp <span className="t-num">{whatsapp}</span>
                      </span>
                      <NewTab />
                    </a>
                  </li>
                )}
                <li className="flex min-h-11 items-center gap-3 text-white/85">
                  <MapPin aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-white/60" />
                  {contact.address.street}
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-[1.625rem] font-bold leading-none text-white">
                Nous suivre
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {networks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} — ${brand.name}`}
                      className="grid size-11 place-items-center rounded-[3px] border-2 border-white/60 text-white transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-ink"
                    >
                      <Icon className="size-5" />
                      <NewTab />
                    </a>
                  </li>
                ))}
              </ul>

              {pages.length > 0 && (
                <ul className="mt-4">
                  {pages.map((p) => (
                    <li key={p.href}>
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/c flex min-h-11 items-center gap-3 text-[0.9375rem] text-white/80 transition-colors hover:text-white"
                      >
                        <FacebookIcon className="size-4 shrink-0 text-white/60 group-hover/c:text-white" />
                        <span>{p.label}</span>
                        <span className="sr-only"> (Facebook, nouvel onglet)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ─── Legal ─── */}
          <hr className={`${styles.perf} mt-12`} aria-hidden />
          <div className="flex flex-col gap-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">
              © {year} {brand.name}. Tous droits réservés.
            </p>
            <ul className="flex flex-wrap items-center gap-x-6">
              {(footerMenu.legal ?? []).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <ManageCookiesButton className="inline-flex min-h-11 items-center text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
