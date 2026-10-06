import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { UmamiTracker } from "@/components/shared/UmamiTracker";
import { RouteSpine } from "@/components/fx/RouteSpine";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { JsonLd } from "@/components/shared/JsonLd";
import { getSiteSettings } from "@/lib/content";
import { buildSiteGraphJsonLd } from "@/lib/seo";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-bricolage",
  axes: ["opsz", "wdth"],
});

const text = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text-figtree",
});

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className={`site-root ${display.variable} ${text.variable}`}>
      <JsonLd data={buildSiteGraphJsonLd(settings)} />
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
      <AssistantWidget />
    </div>
  );
}
