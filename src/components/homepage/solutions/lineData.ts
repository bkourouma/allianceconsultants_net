import type { LineId } from "@/lib/network";

/**
 * Stations (key modules) shown on each line's mini diagram.
 * Names are taken from content/solutions/*.mdx and docs/FONCTIONNALITES*.md.
 */
export const STATIONS: Record<LineId, readonly string[]> = {
  docupro: ["Docu-Archives", "Docu-Courriers", "Docu-Flow"],
  medicpro: ["Procédures AMM", "Suivi des visas", "Stocks et alertes"],
  cliniquepro: ["Agenda partagé", "Consultation", "Caisse et facturation"],
  immotopia: ["Catalogue de biens", "Gestion locative", "Syndic et copropriétés"],
  annonces: ["Recherche multi-critères", "Publication d'annonces", "Contact WhatsApp"],
  ecole: ["Présences", "Évaluations et notes", "Paiements de scolarité"],
};
