import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Page introuvable | Alliance Consultants" },
  robots: { index: false, follow: false },
};

/** Filet de sécurité hors layout du site (le site public a son propre not-found). */
export default function RootNotFound() {
  return (
    <main style={{ padding: "4rem 1.5rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>Page introuvable</h1>
      <p>L&apos;adresse demandée n&apos;existe pas.</p>
      <p>
        <Link href="/">Retour à l&apos;accueil d&apos;Alliance Consultants</Link>
      </p>
    </main>
  );
}
