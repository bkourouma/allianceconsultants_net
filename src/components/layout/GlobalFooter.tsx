import Link from "next/link";
import type { SiteSettings } from "@/lib/validators/content";

interface GlobalFooterProps {
  settings: SiteSettings;
}

export function GlobalFooter({ settings }: GlobalFooterProps) {
  const { brand, contact, footerMenu } = settings;
  const year = new Date().getFullYear();

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

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
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
  );
}
