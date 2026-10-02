import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { UmamiTracker } from "@/components/shared/UmamiTracker";
import { getSiteSettings } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <GlobalHeader
        menu={settings.primaryMenu}
        brandName={settings.brand.name}
        logoUrl={settings.brand.logoUrl}
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <GlobalFooter settings={settings} />
      <UmamiTracker />
    </>
  );
}
