import Link from "next/link";
import type { SiteSettings } from "@/lib/validators/content";

interface GlobalFooterProps {
  settings: SiteSettings;
}

export function GlobalFooter({ settings }: GlobalFooterProps) {
  const { brand, contact, footerMenu } = settings;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="slds-container_x-large slds-container_center slds-p-vertical_xx-large slds-p-horizontal_medium">
        <div className="slds-grid slds-wrap slds-gutters">
          <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_2-of-5">
            <p className="slds-text-heading_medium site-footer__heading-brand">
              {brand.name}
            </p>
            <p className="slds-text-body_small site-footer__muted slds-m-top_x-small">
              {brand.tagline}
            </p>

            <div className="slds-m-top_medium">
              <p className="slds-m-bottom_xx-small">
                <a
                  href={`mailto:${contact.email}`}
                  className="site-footer__link slds-text-body_small"
                >
                  {contact.email}
                </a>
              </p>
              <p className="slds-m-bottom_xx-small">
                <a
                  href={`tel:${contact.phone}`}
                  className="site-footer__link slds-text-body_small"
                >
                  {contact.phone}
                </a>
              </p>
              <p className="slds-text-body_small site-footer__muted">
                {contact.address.street}
              </p>
            </div>
          </div>

          <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-5">
            <h3 className="slds-text-title_caps site-footer__heading slds-m-bottom_small">
              Solutions
            </h3>
            <ul>
              {footerMenu.solutions?.map((item) => (
                <li key={item.href} className="slds-m-bottom_xx-small">
                  <Link
                    href={item.href}
                    className="site-footer__link slds-text-body_small"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-5">
            <h3 className="slds-text-title_caps site-footer__heading slds-m-bottom_small">
              Services
            </h3>
            <ul>
              {footerMenu.services?.map((item) => (
                <li key={item.href} className="slds-m-bottom_xx-small">
                  <Link
                    href={item.href}
                    className="site-footer__link slds-text-body_small"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="slds-text-title_caps site-footer__heading slds-m-top_medium slds-m-bottom_small">
              Formations
            </h3>
            <ul>
              {footerMenu.formations?.map((item) => (
                <li key={item.href} className="slds-m-bottom_xx-small">
                  <Link
                    href={item.href}
                    className="site-footer__link slds-text-body_small"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-5">
            <h3 className="slds-text-title_caps site-footer__heading slds-m-bottom_small">
              Ressources
            </h3>
            <ul>
              {footerMenu.ressources?.map((item) => (
                <li key={item.href} className="slds-m-bottom_xx-small">
                  <Link
                    href={item.href}
                    className="site-footer__link slds-text-body_small"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__divider slds-m-top_xx-large slds-p-top_large slds-grid slds-wrap slds-grid_align-spread slds-grid_vertical-align-center">
          <p className="slds-text-body_small site-footer__muted">
            © {year} {brand.name}. Tous droits réservés. Fondée en{" "}
            {brand.foundingYear}.
          </p>
          <div className="slds-grid slds-wrap slds-grid_align-end slds-text-body_small">
            {footerMenu.legal?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-footer__link slds-m-left_medium"
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
