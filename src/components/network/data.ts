/**
 * RÉSEAU map — authored geometry + station content.
 *
 * Everything is hand-placed on an octilinear grid (horizontal, vertical and
 * 45° segments only) inside a 960 × 540 viewBox. Names come from the real
 * featureGroups of content/solutions/*.mdx, content/services/*.mdx and
 * content/trainings/*.mdx — nothing is invented.
 */
import { ACADEMIE, LINES } from "@/lib/network";
import type { LineId, NetworkLine } from "@/lib/network";

export const VB_W = 960;
export const VB_H = 540;
export const STROKE = 11;
/** Parallel offset between two lines that share track. */
export const TRACK_GAP = 13;

export type Pt = readonly [number, number];
export type Anchor = "start" | "middle" | "end";
export type Side = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export const TERMINUS = { at: [830, 280] as Pt, r: 24 };
const TY = TERMINUS.at[1];
const UP = TY - TRACK_GAP / 2; // upper track of the DocuPro + MedicPro bundle
const DN = TY + TRACK_GAP / 2; // lower track

/** Explicit label placement (overrides `side`). */
export interface LabelAt {
  x: number;
  y: number;
  anchor: Anchor;
}

export interface StationGeo {
  id: string;
  /** Full module name (tooltip, board, mobile list). */
  name: string;
  /** Label lines drawn on the map. */
  label: string[];
  at: Pt;
  side: Side;
  /** Real feature titles from the MDX featureGroup. */
  detail: string[];
}

export interface LineGeo {
  id: LineId;
  /** Centre-line waypoints, origin → terminus. */
  pts: Pt[];
  /** Name badge at the origin (x = left edge, w = width). */
  badge: { x: number; w: number };
  stations: StationGeo[];
}

export const LINE_GEO: Record<LineId, LineGeo> = {
  annonces: {
    id: "annonces",
    pts: [[60, 46], [770, 46], [830, 106], [830, TY]],
    badge: { x: 22, w: 154 },
    stations: [
      { id: "annonces-recherche", name: "Recherche et navigation", label: ["Recherche"], at: [195, 46], side: "n", detail: ["Recherche multi-critères", "Annonces détaillées", "Mobile-first", "Alertes de recherche"] },
      { id: "annonces-publication", name: "Publication et gestion d'annonces", label: ["Publication"], at: [305, 46], side: "n", detail: ["Publication par compte", "Photos et mise en valeur", "Forfaits et options payantes", "Modification et suivi"] },
      { id: "annonces-confiance", name: "Confiance et vérification", label: ["Vérification"], at: [405, 46], side: "n", detail: ["Vérification des comptes", "Badge de confiance", "Modération du contenu"] },
      { id: "annonces-relation", name: "Mise en relation et back-office", label: ["Mise en relation"], at: [640, 46], side: "n", detail: ["Contact WhatsApp et téléphone", "Back-office d'exploitation", "Gestion des rôles"] },
    ],
  },
  immotopia: {
    id: "immotopia",
    pts: [[60, 106], [656, 106], [830, TY]],
    badge: { x: 22, w: 146 },
    stations: [
      { id: "immotopia-biens", name: "Catalogue de biens et CRM", label: ["Biens & CRM"], at: [195, 106], side: "n", detail: ["Catalogue de biens centralisé", "CRM clients et prospects", "Suivi commercial"] },
      { id: "immotopia-locatif", name: "Gestion locative", label: ["Gestion", "locative"], at: [305, 106], side: "n", detail: ["Contrats de location", "Quittances et appels de loyer", "Paiements et écarts"] },
      { id: "immotopia-syndic", name: "Syndic et copropriétés", label: ["Syndic &", "copropriétés"], at: [400, 106], side: "n", detail: ["Gestion des copropriétés", "Charges et appels de fonds", "Dossiers copropriétaires"] },
      { id: "immotopia-annonces", name: "Annonces et publication", label: ["Annonces &", "publication"], at: [622, 106], side: "n", detail: ["Publication d'annonces", "Photos et présentation", "Suivi des contacts entrants"] },
    ],
  },
  docupro: {
    id: "docupro",
    pts: [[60, 215], [335, 215], [335 + (UP - 215), UP], [830, UP]],
    badge: { x: 22, w: 130 },
    stations: [
      { id: "docupro-archives", name: "Docu-Archives", label: ["Docu-Archives"], at: [172, 215], side: "n", detail: ["Numérisation et indexation", "Recherche multicritère", "Durée d'utilité administrative", "Prêts physiques"] },
      { id: "docupro-ged", name: "Docu-GED", label: ["Docu-GED"], at: [470, UP], side: "n", detail: ["Centralisation des documents", "Espaces partagés par équipe", "Versions et historique", "Publication contrôlée"] },
      { id: "docupro-courriers", name: "Docu-Courriers", label: ["Docu-Courriers"], at: [574, UP], side: "n", detail: ["Courrier entrant et sortant", "Imputation et notifications", "Suivi des accusés de réception"] },
      { id: "docupro-flow", name: "Docu-Flow", label: ["Docu-Flow"], at: [684, UP], side: "n", detail: ["Workflows configurables", "Personnalisation d'écrans", "Suivi des étapes"] },
    ],
  },
  medicpro: {
    id: "medicpro",
    pts: [[60, 345], [335, 345], [335 + (345 - DN), DN], [830, DN]],
    badge: { x: 22, w: 90 },
    stations: [
      { id: "medicpro-pilotage", name: "Pilotage et tableaux de bord", label: ["Tableau de bord"], at: [150, 345], side: "s", detail: ["Tableau de bord exécutif", "Indicateurs multi-domaines", "Filtres par pays et période"] },
      { id: "medicpro-amm", name: "Procédures AMM et visas", label: ["Procédures", "AMM & visas"], at: [485, DN], side: "s", detail: ["Cycle de vie des procédures AMM", "Suivi des visas", "Exigences par pays", "Vues pivot et reporting"] },
      { id: "medicpro-referentiels", name: "Référentiels et documents", label: ["Référentiels", "& documents"], at: [598, DN], side: "s", detail: ["Catalogue produits pharmaceutiques", "Référentiels pays, agences, grossistes", "Gestion documentaire réglementaire"] },
      { id: "medicpro-ventes", name: "Activité commerciale et budgets", label: ["Ventes", "& budgets"], at: [696, DN], side: "s", detail: ["Suivi des ventes par marché", "Suivi budgétaire", "Stocks et alertes"] },
    ],
  },
  cliniquepro: {
    id: "cliniquepro",
    pts: [[60, 440], [670, 440], [830, TY]],
    badge: { x: 22, w: 112 },
    stations: [
      { id: "cliniquepro-patients", name: "Patients et agenda", label: ["Patients", "& agenda"], at: [165, 440], side: "s", detail: ["Dossier patient centralisé", "Agenda partagé", "Recherche rapide patient", "Suivi des assurances rattachées"] },
      { id: "cliniquepro-consultation", name: "Consultation et examens ophtalmologiques", label: ["Consultation", "& examens"], at: [340, 440], side: "s", detail: ["Modèles de consultation spécialisés", "Ordonnances de lunettes", "Suivi des actes et statuts"] },
      { id: "cliniquepro-caisse", name: "Caisse, facturation et honoraires", label: ["Caisse &", "facturation"], at: [450, 440], side: "s", detail: ["Encaissement et suivi des paiements", "Facturation", "Honoraires médecins"] },
      { id: "cliniquepro-pilotage", name: "Pilotage et tableaux de bord", label: ["Pilotage"], at: [560, 440], side: "s", detail: ["Indicateurs d'activité", "Suivi par médecin", "Traçabilité des actions sensibles"] },
    ],
  },
  ecole: {
    id: "ecole",
    pts: [[60, 505], [770, 505], [830, 445], [830, TY]],
    badge: { x: 22, w: 138 },
    stations: [
      { id: "ecole-etablissements", name: "Multi-établissement et accès", label: ["Multi-établissement"], at: [185, 505], side: "s", detail: ["Gestion multi-établissement", "Authentification et rôles", "Sessions persistantes"] },
      { id: "ecole-academique", name: "Gestion académique", label: ["Gestion académique"], at: [342, 505], side: "s", detail: ["Cycles et programmes", "Classes et années académiques", "Statuts et cycles de vie"] },
      { id: "ecole-pedagogie", name: "Pédagogie et évaluations", label: ["Pédagogie & évaluations"], at: [522, 505], side: "s", detail: ["Cours et ressources", "Devoirs et soumissions", "Évaluations et notes", "Présences"] },
      { id: "ecole-vie", name: "Vie scolaire et finances", label: ["Vie scolaire & finances"], at: [712, 505], side: "s", detail: ["Suivi des étudiants", "Suivi des enseignants", "Paiements et frais de scolarité", "Espace parents"] },
    ],
  },
};

/* ───────────────────────── Services = correspondances ───────────────────────── */

export interface ServiceGeo {
  id: string;
  slug: string;
  title: string;
  /** Label lines on the map. */
  label: string[];
  /** Node position; `to` (optional) makes it a capsule spanning two tracks. */
  at: Pt;
  to?: Pt;
  labelAt: LabelAt;
  /** Lines this service connects. */
  lines: LineId[];
  summary: string;
}

export const SERVICES: ServiceGeo[] = [
  {
    id: "svc-dev",
    slug: "developpement-specifique",
    title: "Développement spécifique & SaaS métier",
    label: ["Développement spécifique"],
    at: [492, 46],
    to: [492, 106],
    labelAt: { x: 480, y: 132, anchor: "end" },
    lines: ["annonces", "immotopia"],
    summary: "Applications métiers sur mesure : web, mobile, API, SaaS multi-tenant.",
  },
  {
    id: "svc-demat",
    slug: "dematerialisation-archives",
    title: "Dématérialisation des archives",
    label: ["Dématérialisation"],
    at: [210, 215],
    labelAt: { x: 210, y: 241, anchor: "middle" },
    lines: ["docupro"],
    summary: "Numérisation, indexation et archivage électronique de vos fonds documentaires.",
  },
  {
    id: "svc-scan",
    slug: "scanners-professionnels",
    title: "Vente et intégration de scanners professionnels",
    label: ["Scanners"],
    at: [272, 215],
    labelAt: { x: 272, y: 196, anchor: "middle" },
    lines: ["docupro"],
    summary: "Sélection, fourniture et intégration de scanners adaptés à vos volumes.",
  },
  {
    id: "svc-ia",
    slug: "automatisation-ia-processus-metiers",
    title: "Automatisation IA des processus métiers",
    label: ["Automatisation IA"],
    at: [305, 215],
    to: [305, 345],
    labelAt: { x: 287, y: 284, anchor: "end" },
    lines: ["docupro", "medicpro"],
    summary: "Automatisation de vos processus répétitifs grâce à l'IA, n8n, API et LLMs.",
  },
  {
    id: "svc-amoa",
    slug: "assistance-maitrise-ouvrage",
    title: "Assistance à maîtrise d'ouvrage (AMOA)",
    label: ["Maîtrise d'ouvrage", "(AMOA)"],
    at: [232, 345],
    to: [232, 440],
    labelAt: { x: 248, y: 388, anchor: "start" },
    lines: ["medicpro", "cliniquepro"],
    summary: "Cahiers des charges, pilotage des prestataires, recette et conduite du changement.",
  },
];

/* ───────────────────────── Académie = circular line ───────────────────────── */

export const RING_PTS: Pt[] = [
  [500, 150], [665, 150], [750, 235], [750, 315],
  [665, 400], [500, 400], [415, 315], [415, 235],
];

/** "Académie" name pill, sitting on the loop like the line-name badges. */
export const RING_BADGE = { x: 505, y: 150, w: 90 };

export interface AcademieStation {
  id: string;
  slug: string;
  name: string;
  label: string[];
  at: Pt;
  to?: Pt;
  labelAt: LabelAt;
  lines?: LineId[];
  summary: string;
}

export const ACADEMIE_STATIONS: AcademieStation[] = [
  {
    id: "aca-ged",
    slug: "ged-archivage",
    name: "GED & Archivage numérique",
    label: ["GED &", "archivage"],
    at: [415, UP],
    to: [415, DN],
    labelAt: { x: 457, y: 218, anchor: "start" },
    lines: ["docupro", "medicpro"],
    summary: "Dématérialisation, indexation, workflows de validation, archivage réglementaire.",
  },
  {
    id: "aca-n8n",
    slug: "automatisation-n8n-processus-ia",
    name: "Automatisation avec n8n & IA",
    label: ["Automatisation", "n8n & IA"],
    at: [750, UP],
    to: [750, DN],
    labelAt: { x: 708, y: 218, anchor: "end" },
    lines: ["docupro", "medicpro"],
    summary: "Scénarios no-code, intégration API, connexion à des LLMs.",
  },
  {
    id: "aca-ia",
    slug: "ia-entreprise",
    name: "Formation IA pour entreprises",
    label: ["IA pour", "entreprises"],
    at: [640, 150],
    labelAt: { x: 640, y: 178, anchor: "middle" },
    summary: "Cas d'usage, outils, prompt engineering, gouvernance des données.",
  },
  {
    id: "aca-pm",
    slug: "gestion-projet",
    name: "Gestion de projet digital & agile",
    label: ["Gestion de", "projet agile"],
    at: [711, 354],
    labelAt: { x: 686, y: 351, anchor: "end" },
    summary: "Cadrage, planification, Scrum, Kanban et gestion des risques.",
  },
  {
    id: "aca-dev",
    slug: "developpement-web-dotnet-ia",
    name: "Développement web & IA (.NET / React)",
    label: ["Développement", "web & IA"],
    at: [454, 354],
    labelAt: { x: 481, y: 351, anchor: "start" },
    summary: ".NET, React et intégration de fonctionnalités IA, déploiement cloud.",
  },
  {
    id: "aca-sql",
    slug: "sql-server",
    name: "SQL Server — Administration & Développement",
    label: ["SQL Server"],
    at: [610, 400],
    labelAt: { x: 610, y: 425, anchor: "middle" },
    summary: "Requêtes avancées, procédures stockées, indexation, haute disponibilité.",
  },
];

/* ───────────────────────── Routes (journey planner) ───────────────────────── */

export type RouteId = LineId | "ia" | "academie";

export interface RouteDef {
  id: RouteId;
  /** Label in the planner ("Je cherche…"). */
  planner: string;
  name: string;
  /** Short kicker under the name in the board header. */
  sector: string;
  pitch: string;
  color: string;
  onColor: string;
  /** Heading above the module list. */
  modulesTitle: string;
  modules: { name: string; hint?: string }[];
  intent: "demo" | "automation" | "training";
  ctaLabel: string;
  /** Solution slug forwarded to /contact-demo (lines only). */
  solution?: string;
  moreHref: string;
  moreLabel: string;
  /** Lines drawn at full strength. */
  active: LineId[];
  /** Lines kept at medium strength (connected by an interchange). */
  related: LineId[];
}

const lineRoute = (id: LineId, planner: string): RouteDef => {
  const l = LINES.find((x) => x.id === id) as NetworkLine;
  return {
    id,
    planner,
    name: l.name,
    sector: l.sector,
    pitch: l.pitch,
    color: l.color,
    onColor: l.onColor,
    modulesTitle: "Modules",
    modules: LINE_GEO[id].stations.map((s) => ({ name: s.label.join(" "), hint: s.detail[0] })),
    intent: "demo",
    ctaLabel: "Demander une démo",
    solution: l.slug,
    moreHref: `/solutions/${l.slug}`,
    moreLabel: "Voir la solution",
    active: [id],
    related: [],
  };
};

/** Planner order = the visitor's wording, not the product order. */
export const ROUTES: RouteDef[] = [
  lineRoute("docupro", "Archives & GED"),
  lineRoute("medicpro", "Pharma & réglementaire"),
  lineRoute("cliniquepro", "Cliniques"),
  lineRoute("immotopia", "Immobilier & syndic"),
  lineRoute("annonces", "Annonces immobilières"),
  lineRoute("ecole", "Écoles"),
  {
    id: "ia",
    planner: "Automatisation IA",
    name: "Automatisation IA",
    sector: "Service · correspondance",
    pitch:
      "Analyse, modélisation et automatisation de vos processus répétitifs grâce à l'IA et aux outils d'intégration (n8n, API, LLMs).",
    color: "#0b1b3a",
    onColor: "#ffffff",
    modulesTitle: "Ce que nous automatisons",
    modules: [
      { name: "Tâches répétitives et chronophages" },
      { name: "Workflows et circuits de validation digitaux" },
      { name: "Analyse documentaire et extraction de données" },
      { name: "Chatbots métiers et assistants IA" },
    ],
    intent: "automation",
    ctaLabel: "Automatiser un processus",
    moreHref: "/services/automatisation-ia-processus-metiers",
    moreLabel: "Voir le service",
    active: [],
    related: ["docupro", "medicpro"],
  },
  {
    id: "academie",
    planner: "Formation",
    name: "Académie",
    sector: "Formations professionnelles",
    pitch:
      "Formations professionnelles en présentiel, à distance ou en intra-entreprise, pour développer les compétences digitales de vos équipes.",
    color: ACADEMIE.color,
    onColor: ACADEMIE.onColor,
    modulesTitle: "Formations",
    modules: ACADEMIE_STATIONS.map((s) => ({ name: s.label.join(" ") })),
    intent: "training",
    ctaLabel: "Demander un programme",
    moreHref: "/formations",
    moreLabel: "Voir les formations",
    active: [],
    related: ["docupro", "medicpro"],
  },
];

export function getRoute(id: RouteId | null | undefined): RouteDef | undefined {
  return id ? ROUTES.find((r) => r.id === id) : undefined;
}

/** Plain demo request (terminus). Same params as CTAButton. */
export const DEMO_HREF = "/contact-demo?intent=demo&from=homepage&block=hero";

/** `/contact-demo?...` href — same contract as CTAButton. */
export function contactHref(route: RouteDef, block = "hero"): string {
  const p = new URLSearchParams({ intent: route.intent, from: "homepage", block });
  if (route.solution) p.set("solution", route.solution);
  return `/contact-demo?${p.toString()}`;
}

export function lineById(id: LineId): NetworkLine {
  return LINES.find((l) => l.id === id) as NetworkLine;
}

/* ───────────────────────── Path helpers ───────────────────────── */

/** Polyline with rounded corners (quadratic bends) — octilinear friendly. */
export function roundedPath(pts: readonly Pt[], r = 16, closed = false): string {
  const n = pts.length;
  const f = (v: number) => Math.round(v * 100) / 100;
  const at = (i: number) => pts[(i + n) % n];
  const toward = (from: Pt, to: Pt): Pt => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const t = len === 0 ? 0 : Math.min(r, len / 2) / len;
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  };
  const corner = (i: number) => ({
    a: toward(at(i), at(i - 1)),
    b: toward(at(i), at(i + 1)),
    v: at(i),
  });
  if (!closed) {
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i < n - 1; i += 1) {
      const { a, b, v } = corner(i);
      d += ` L${f(a[0])} ${f(a[1])} Q${f(v[0])} ${f(v[1])} ${f(b[0])} ${f(b[1])}`;
    }
    return `${d} L${f(pts[n - 1][0])} ${f(pts[n - 1][1])}`;
  }
  const first = corner(0);
  let d = `M${f(first.b[0])} ${f(first.b[1])}`;
  for (let i = 1; i < n; i += 1) {
    const { a, b, v } = corner(i);
    d += ` L${f(a[0])} ${f(a[1])} Q${f(v[0])} ${f(v[1])} ${f(b[0])} ${f(b[1])}`;
  }
  d += ` L${f(first.a[0])} ${f(first.a[1])} Q${f(first.v[0])} ${f(first.v[1])} ${f(first.b[0])} ${f(first.b[1])} Z`;
  return d;
}

export function polylineLength(pts: readonly Pt[], closed = false): number {
  let len = 0;
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    len += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return len;
}

/** Label anchor from a compass side. */
export function sideLabel(at: Pt, side: Side, lines: number): LabelAt & { lh: number } {
  const lh = 16;
  const gap = 17;
  const [x, y] = at;
  const stackUp = (base: number) => base - (lines - 1) * lh;
  switch (side) {
    case "n": return { x, y: stackUp(y - gap), anchor: "middle", lh };
    case "s": return { x, y: y + gap + 7, anchor: "middle", lh };
    case "e": return { x: x + gap, y: y + 4 - ((lines - 1) * lh) / 2, anchor: "start", lh };
    case "w": return { x: x - gap, y: y + 4 - ((lines - 1) * lh) / 2, anchor: "end", lh };
    case "ne": return { x: x + 12, y: stackUp(y - 12), anchor: "start", lh };
    case "nw": return { x: x - 12, y: stackUp(y - 12), anchor: "end", lh };
    case "se": return { x: x + 12, y: y + 20, anchor: "start", lh };
    default: return { x: x - 12, y: y + 20, anchor: "end", lh };
  }
}

export { LINES, ACADEMIE };
