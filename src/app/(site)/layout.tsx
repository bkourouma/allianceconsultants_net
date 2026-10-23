import { Barlow, Barlow_Condensed, Chivo_Mono } from "next/font/google";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { UmamiTracker } from "@/components/shared/UmamiTracker";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { RouteSpine } from "@/components/fx/RouteSpine";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { getSiteSettings } from "@/lib/content";

const display = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display-barlow-condensed",
});

const text = Barlow({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-text-barlow",
});

const mono = Chivo_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-mono-chivo",
});

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className={`site-root ${display.variable} ${text.variable} ${mono.variable}`}>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <GlobalHeader
        menu={settings.primaryMenu}
        brandName={settings.brand.name}
        logoUrl={settings.brand.logoUrl}
        contact={{
          phones: settings.contact.phones,
          whatsapp: settings.contact.whatsapp,
        }}
        panelLinks={{
          services: settings.footerMenu.services,
          formations: settings.footerMenu.formations,
        }}
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <RouteSpine />
      <GlobalFooter settings={settings} />
      <UmamiTracker />
      <GoogleAnalytics />
      <CookieConsent />
      <AssistantWidget />
    </div>
  );
}
