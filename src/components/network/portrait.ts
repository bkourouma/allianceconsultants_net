/**
 * RÉSEAU map — portrait layout for phones and tablets.
 *
 * Same network, redrawn for a narrow screen: two bundles of parallel strokes
 * run down the page (three lines on each side, labels turned toward the
 * centre), the circular Académie line hangs off the DocuPro + MedicPro
 * strokes, and all six lines converge on the "Demander une démo" terminus at
 * the bottom. Every row is placed by a tiny layout engine (cumulative row
 * heights), so labels cannot collide by construction. Geometry stays
 * octilinear: vertical runs and 45° bends only.
 */
import type { LineId } from "@/lib/network";
import { roundedPath } from "./data";
import type { Pt } from "./data";

export const PW = 360;
export const P_STROKE = 8;
export const P_FONT = 14.5;
export const P_LH = 16;
export const P_DOT = 6.5;
const SP = 15; // gap between two parallel strokes
const EDGE = 24; // first stroke, measured from the side of the drawing
const RING_CORNER = 14;

type Side = "L" | "R";

interface RowDef {
  id: string;
  label: string[];
  /** Service interchange spanning the previous stroke of the same bundle. */
  withPrev?: boolean;
  /** Service interchange sitting on one stroke only. */
  service?: boolean;
}
interface BandDef {
  line: LineId;
  rows: RowDef[];
}

const LEFT: BandDef[] = [
  {
    line: "cliniquepro",
    rows: [
      { id: "cliniquepro-patients", label: ["Patients", "& agenda"] },
      { id: "cliniquepro-consultation", label: ["Consultation", "& examens"] },
      { id: "cliniquepro-caisse", label: ["Caisse &", "facturation"] },
      { id: "cliniquepro-pilotage", label: ["Pilotage"] },
    ],
  },
  {
    line: "medicpro",
    rows: [
      { id: "svc-amoa", label: ["Maîtrise d'ouvrage", "(AMOA)"], withPrev: true },
      { id: "medicpro-pilotage", label: ["Tableau de bord"] },
      { id: "medicpro-amm", label: ["Procédures", "AMM & visas"] },
      { id: "medicpro-referentiels", label: ["Référentiels", "& documents"] },
      { id: "medicpro-ventes", label: ["Ventes", "& budgets"] },
    ],
  },
  {
    line: "docupro",
    rows: [
      { id: "svc-ia", label: ["Automatisation", "IA"], withPrev: true },
      { id: "docupro-archives", label: ["Docu-Archives"] },
      { id: "docupro-ged", label: ["Docu-GED"] },
      { id: "docupro-courriers", label: ["Docu-Courriers"] },
      { id: "docupro-flow", label: ["Docu-Flow"] },
      { id: "svc-demat", label: ["Dématérialisation"], service: true },
    ],
  },
];

const RIGHT: BandDef[] = [
  {
    line: "annonces",
    rows: [
      { id: "annonces-recherche", label: ["Recherche"] },
      { id: "annonces-publication", label: ["Publication"] },
      { id: "annonces-confiance", label: ["Vérification"] },
      { id: "annonces-relation", label: ["Mise en", "relation"] },
    ],
  },
  {
    line: "immotopia",
    rows: [
      { id: "svc-dev", label: ["Développement", "spécifique"], withPrev: true },
      { id: "immotopia-biens", label: ["Biens & CRM"] },
      { id: "immotopia-locatif", label: ["Gestion", "locative"] },
      { id: "immotopia-syndic", label: ["Syndic &", "copropriétés"] },
      { id: "immotopia-annonces", label: ["Annonces &", "publication"] },
    ],
  },
  {
    line: "ecole",
    rows: [
      { id: "ecole-etablissements", label: ["Multi-", "établissement"] },
      { id: "ecole-academique", label: ["Gestion", "académique"] },
      { id: "ecole-pedagogie", label: ["Pédagogie &", "évaluations"] },
      { id: "ecole-vie", label: ["Vie scolaire", "& finances"] },
    ],
  },
];

export type PKind = "station" | "interchange" | "academie";

export interface PNode {
  id: string;
  kind: PKind;
  line?: LineId;
  label: string[];
  /** Dot / capsule centre. */
  x: number;
  y: number;
  /** Capsule span (interchange across several strokes). */
  span?: [number, number];
  /** Label anchor. */
  lx: number;
  anchor: "start" | "end";
  /** Touch / click target. */
  hit: { x: number; y: number; w: number; h: number };
}

export interface PStrand {
  line: LineId;
  side: Side;
  x: number;
  y: number;
  path: string;
  badge: { x: number; y: number; w: number; side: Side };
}

/** Rough pill width for a line name (bold display face at 14.5px). */
const badgeWidth = (name: string) => Math.round(name.length * 8.4 + 30);

const rowHeight = (label: string[]) => (label.length > 1 ? 44 : 30);

export interface PortraitLayout {
  height: number;
  strands: PStrand[];
  nodes: PNode[];
  ring: {
    path: string;
    badge: { x: number; y: number; w: number };
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  terminus: { x: number; y: number; r: number };
  /** Centre of every node, in drawing units (tooltips). */
  at: Record<string, { x: number; y: number }>;
}

export function buildPortrait(names: Record<LineId, string>): PortraitLayout {
  const strands: PStrand[] = [];
  const nodes: PNode[] = [];

  /* Bends: where every stroke leaves its vertical run (filled in below). */
  const bundle = (side: Side, bands: BandDef[]): number => {
    let y = 14;
    bands.forEach((b, i) => {
      const x = side === "L" ? EDGE + SP * i : PW - EDGE - SP * i;
      const yb = y + 14;
      const w = badgeWidth(names[b.line]);
      strands.push({
        line: b.line,
        side,
        x,
        y: yb,
        path: "",
        badge: { x: side === "L" ? x - 4 : x + 4 - w, y: yb, w, side },
      });
      let cur = yb + 14 + 8;
      for (const r of b.rows) {
        const h = rowHeight(r.label);
        const cy = cur + h / 2;
        const outer = side === "L" ? x - SP : x + SP;
        const own = r.withPrev
          ? ([Math.min(x, outer), Math.max(x, outer)] as [number, number])
          : undefined;
        const edgeIn = side === "L" ? x : x;
        const lx = side === "L" ? edgeIn + 18 : edgeIn - 18;
        const hitX = side === "L" ? x - 12 : 184;
        const hitW = side === "L" ? 176 - hitX : x + 12 - 184;
        nodes.push({
          id: r.id,
          kind: r.withPrev || r.service ? "interchange" : "station",
          line: b.line,
          label: r.label,
          x,
          y: cy,
          span: own,
          lx,
          anchor: side === "L" ? "start" : "end",
          hit: { x: hitX, y: cy - h / 2, w: hitW, h },
        });
        cur += h;
      }
      y = cur + 8;
    });
    return y;
  };

  const yLeft = bundle("L", LEFT);
  bundle("R", RIGHT);

  /* ── Académie: a loop that runs beside the DocuPro stroke ── */
  const lx = EDGE + SP * 3; // third stroke + one = ring edge
  const rx = lx + 150;
  const top = yLeft + 30;
  const h = 318;
  const bottom = top + h;
  const c = 30;
  const ringPts: Pt[] = [
    [lx + c, top], [rx - c, top], [rx, top + c], [rx, bottom - c],
    [rx - c, bottom], [lx + c, bottom], [lx, bottom - c], [lx, top + c],
  ];
  const ringW = 96;
  const ring = {
    path: roundedPath(ringPts, RING_CORNER, true),
    badge: { x: (lx + rx) / 2 - ringW / 2, y: top, w: ringW },
    left: lx,
    right: rx,
    top,
    bottom,
  };
  // Interior labels alternate left / right down the loop, one row each.
  const acaLeft = [
    { id: "aca-ged", label: ["GED &", "archivage"], y: top + 102 },
    { id: "aca-n8n", label: ["Automatisation", "n8n & IA"], y: top + 192 },
  ];
  for (const s of acaLeft) {
    nodes.push({
      id: s.id,
      kind: "interchange",
      label: s.label,
      x: lx,
      y: s.y,
      span: [EDGE + SP, lx],
      lx: lx + 22,
      anchor: "start",
      hit: { x: EDGE + SP - 12, y: s.y - 22, w: rx - (EDGE + SP) - 4, h: 44 },
    });
  }
  const acaRight = [
    { id: "aca-ia", label: ["IA pour", "entreprises"], y: top + 56 },
    { id: "aca-pm", label: ["Gestion de", "projet agile"], y: top + 148 },
    { id: "aca-dev", label: ["Développement", "web & IA"], y: top + 238 },
    { id: "aca-sql", label: ["SQL Server"], y: top + 282 },
  ];
  for (const s of acaRight) {
    const hh = rowHeight(s.label);
    nodes.push({
      id: s.id,
      kind: "academie",
      label: s.label,
      x: rx,
      y: s.y,
      lx: rx - 20,
      anchor: "end",
      hit: { x: lx + 6, y: s.y - hh / 2, w: rx - lx + 8, h: hh },
    });
  }

  /* ── Convergence: parallel 45° bends into the terminus bundle ── */
  const cx = PW / 2;
  const gap = 11;
  const finals = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((k) => cx + k * gap);
  const order: PStrand[] = [
    ...strands.filter((s) => s.side === "L").sort((a, b) => a.x - b.x),
    ...strands.filter((s) => s.side === "R").sort((a, b) => a.x - b.x),
  ];
  // Right strokes: innermost (smallest x) ends nearest the centre-left.
  const dxOf = (s: PStrand, k: number) => Math.abs(finals[k] - s.x);
  const innerLeft = order[2];
  const yBendInner = bottom + 34;
  const yEndDiag = yBendInner + dxOf(innerLeft, 2);
  const roundel = { x: cx, y: yEndDiag + 24 + 34, r: 34 };
  order.forEach((s, k) => {
    const dx = dxOf(s, k);
    const yb = yEndDiag - dx;
    const xf = finals[k];
    s.path = roundedPath(
      [
        [s.x, s.y],
        [s.x, yb],
        [xf, yEndDiag],
        [xf, roundel.y - 6],
      ],
      16,
    );
  });

  const at: Record<string, { x: number; y: number }> = {};
  for (const n of nodes) {
    at[n.id] = { x: n.span ? (n.span[0] + n.span[1]) / 2 : n.x, y: n.y };
  }

  return {
    height: roundel.y + roundel.r + 18,
    strands,
    nodes,
    ring,
    terminus: roundel,
    at,
  };
}
