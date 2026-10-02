import Script from "next/script";

// Mesure d'audience : Umami, hébergé par Alliance Consultants (sans cookie, sans adresse IP conservée). L'identifiant du site
// est public (il figure dans le HTML servi) ; `data-domains` limite le comptage au vrai site : ni le développement local ni un
// aperçu ne gonflent les chiffres.
const SCRIPT_URL = "https://analytics.allianceconsultants.net/script.js";
const WEBSITE_ID = "6e76e848-4cfc-4317-abea-cb43be066bfd";
const DOMAINS = "allianceconsultants.net,www.allianceconsultants.net";

/**
 * Pages vues, origine, pays et appareil des visiteurs. Rien n'est chargé en développement.
 * Placé dans le layout du site public uniquement : l'espace /admin n'est pas compté.
 */
export function UmamiTracker() {
  if (process.env.NODE_ENV !== "production") return null;
  return <Script src={SCRIPT_URL} data-website-id={WEBSITE_ID} data-domains={DOMAINS} strategy="afterInteractive" />;
}
