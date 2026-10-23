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
import { TerminusLines } from "./TerminusLines";
import { ManageCookiesButton } from "@/components/shared/ManageCookiesButton";

interface GlobalFooterProps {
  settings: SiteSettings;
}

type Item = { label: string; href: string };

const BRAND = "#1457f5";

const isExternal = (href: string) => /^https?:\/\//.test(href);
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const waHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
const normalizeUrl = (url: string) => url.replace(/\/+$/, "").toLowerCase();

/** Footer solution labels ("ImmoTopia") → the matching line colour. */
function solutionColour(label: string): string {
  const key = label.toLowerCase().split(/[\s.]/)[0];
  const line = LINES.find((l) => l.name.toLowerCase().startsWith(key));
  return line?.color ?? BRAND;
}

interface Column {
  key: string;
  title: string;
  href: string;
  items: Item[];
  colour: (item: Item) => string;
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
      colour: (item) => solutionColour(item.label),
    },
    {
      key: "services",
      title: "Services",
      href: "/services",
      items: footerMenu.services ?? [],
      colour: () => "#ffffff",
    },
    {
      key: "formations",
      title: "Formations",
      href: "/formations",
      items: footerMenu.formations ?? [],
      colour: () => ACADEMIE.color,
    },
    {
      key: "blog",
      title: "Blog",
      href: "/blog",
      items: footerMenu.blog ?? [],
      colour: () => BRAND,
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
      className="bg-night text-white"
      style={
        {
          "--accent": "#9db8ff",
          "--on-accent": "#0b1b3a",
        } as React.CSSProperties
      }
    >
      <div className="wrap pb-8 pt-16 lg:pt-24">
        {/* ─── Terminus ─── */}
        <p className="t-h3 max-w-[44ch] text-white/90">{brand.tagline}</p>

        <div className="mt-12 lg:mt-16">
          <TerminusLines />
        </div>

        {/* ─── Line diagram of the site ─── */}
        <nav
          aria-label="Plan du site"
          className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {columns.map((col) => {
            const rows: (Item & { c: string; head?: boolean })[] = [
              { label: col.title, href: col.href, c: "#ffffff", head: true },
              ...col.items.map((it) => ({ ...it, c: col.colour(it) })),
            ];
            // The heading station takes the colour of the first station.
            rows[0].c = col.key === "solutions" ? "#ffffff" : rows[1]?.c ?? "#ffffff";

            return (
              <div key={col.key} className="min-w-0">
                <ul>
                  {rows.map((row, i) => {
                    const last = i === rows.length - 1;
                    const external = !row.head && isExternal(row.href);
                    const common =
                      "group/row flex min-h-11 items-center rounded-md py-1 transition-colors duration-200";
                    const text = row.head
                      ? "font-display text-xl font-bold text-white"
                      : "text-[0.9375rem] font-medium text-white/80 group-hover/row:text-white";
                    return (
                      <li
                        key={`${row.href}-${row.label}`}
                        className={
                          "relative pl-9 " +
                          (last
                            ? ""
                            : "before:absolute before:left-[8.5px] before:top-1/2 before:h-full before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-[var(--c)]")
                        }
                        style={{ "--c": row.c } as React.CSSProperties}
                      >
                        <span
                          aria-hidden
                          className={
                            "absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--c)] transition-colors duration-300 " +
                            (row.head
                              ? "size-[19px] -translate-x-[1px] bg-[var(--c)]"
                              : "size-[17px] bg-night group-hover/row:bg-[var(--c)]")
                          }
                        />
                        {external ? (
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${common} ${text} gap-1.5`}
                          >
                            <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/row:translate-x-1">
                              {row.label}
                            </span>
                            <ArrowUpRight
                              aria-hidden
                              strokeWidth={2}
                              className="size-3.5 shrink-0 text-white/50"
                            />
                            <NewTab />
                          </a>
                        ) : (
                          <Link href={row.href} className={`${common} ${text}`}>
                            <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/row:translate-x-1">
                              {row.label}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* ─── Contact, brand, socials ─── */}
        <div className="mt-16 grid gap-12 border-t border-white/15 pt-12 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr]">
          <div>
            <div className="relative block h-14 w-28 overflow-hidden rounded-xl bg-white">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                sizes="112px"
                className="object-cover object-center"
              />
            </div>
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-white/75">
              {brand.alternateName ?? brand.name}, depuis {brand.foundingYear}.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Nous joindre
            </h2>
            <ul className="mt-4 space-y-1 text-[0.9375rem]">
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
            <h2 className="font-display text-xl font-bold text-white">
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
                    className="grid size-11 place-items-center rounded-full text-white ring-1 ring-inset ring-white/35 transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-white hover:text-ink"
                  >
                    <Icon className="size-5" />
                    <NewTab />
                  </a>
                </li>
              ))}
            </ul>

            {pages.length > 0 && (
              <ul className="mt-5 space-y-0.5">
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
        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
    </footer>
  );
}
