import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a3a5e",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://allianceconsultants.net"),
  // Valeurs de repli pour les pages qui ne passent pas par `buildMetadata`
  // (pages utilitaires, erreurs, espace admin). Les pages du site fixent leur
  // propre titre complet via `buildMetadata`.
  title: {
    default: "Alliance Consultants — SaaS & IA pour l'Afrique",
    template: "%s | Alliance Consultants",
  },
  description:
    "Éditeur et intégrateur africain de solutions SaaS, IA et métiers pour les organisations de l'Afrique francophone.",
  applicationName: "Alliance Consultants",
  openGraph: {
    siteName: "Alliance Consultants",
    locale: "fr_FR",
    type: "website",
  },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
