import Link from "next/link";
import type { SiteSettings } from "@/lib/validators/content";

interface GlobalFooterProps {
  settings: SiteSettings;
}

export function GlobalFooter({ settings }: GlobalFooterProps) {
  const { brand, contact, footerMenu } = settings;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-dark)] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-xl font-bold text-white">{brand.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{brand.tagline}</p>

            <div className="mt-6 space-y-2 text-sm">
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                >
                  {contact.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                >
                  {contact.phone}
                </a>
              </p>
              <p className="text-gray-400">{contact.address.street}</p>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Solutions</h3>
            <ul className="mt-4 space-y-2">
              {footerMenu.solutions?.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & Formations */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
            <ul className="mt-4 space-y-2">
              {footerMenu.services?.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-white">Formations</h3>
            <ul className="mt-4 space-y-2">
              {footerMenu.formations?.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources & Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Ressources</h3>
            <ul className="mt-4 space-y-2">
              {footerMenu.ressources?.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {year} {brand.name}. Tous droits réservés. Fondée en {brand.foundingYear}.
          </p>
          <div className="flex items-center gap-4 text-sm">
            {footerMenu.legal?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
