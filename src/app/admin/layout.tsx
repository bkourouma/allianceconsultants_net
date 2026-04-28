import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Backoffice Alliance", template: "%s · Backoffice Alliance" },
  description: "Espace d'administration privé d'Alliance Consultants.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
