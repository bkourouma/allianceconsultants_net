import Link from "next/link";
import type { SiteSettings } from "@/lib/validators/content";

interface GlobalFooterProps {
  settings: SiteSettings;
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export function GlobalFooter({ settings }: GlobalFooterProps) {
  const { brand, contact, footerMenu } = settings;
  const year = new Date().getFullYear();
  const socialLinks = footerMenu.social ?? [];

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-xl font-bold tracking-tight text-white">
              {brand.name}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              {brand.tagline}
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                >
                  {contact.email}
                </a>
              </li>
              {contact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                  >
                    {phone}
                  </a>
                </li>
              ))}
              <li className="text-slate-400">{contact.address.street}</li>
            </ul>
          </div>

          <FooterColumn title="Solutions" items={footerMenu.solutions} />
          <FooterColumn title="Services" items={footerMenu.services} />

          <div className="space-y-8">
            <FooterColumn
              title="Formations"
              items={footerMenu.formations}
              flat
            />
            <FooterColumn
              title="Blog"
              items={footerMenu.blog}
              flat
            />
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-14 border-t border-white/10 pt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Réseaux sociaux
            </h3>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {socialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                  >
                    <FacebookIcon className="size-4 text-[#1877F2]" />
                    <span>{item.label}</span>
                    <span className="sr-only"> (Facebook, ouvre dans un nouvel onglet)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            © {year} {brand.name}. Tous droits réservés. Fondée en{" "}
            {brand.foundingYear}.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {footerMenu.legal?.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  flat,
}: {
  title: string;
  items?: { label: string; href: string }[];
  flat?: boolean;
}) {
  return (
    <div className={flat ? "" : ""}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
        {title}
      </h3>
      <ul className="mt-4 space-y-2 text-sm">
        {items?.map((item) => (
          <li key={item.href}>
            {isExternal(item.href) ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-baseline gap-1 text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className="text-[10px] text-slate-500">
                  ↗
                </span>
                <span className="sr-only"> (ouvre dans un nouvel onglet)</span>
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
