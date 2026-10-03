import { LINES } from "@/lib/network";
import { ACADEMIE_STATIONS, LINE_GEO, SERVICES, lineById } from "./data";
import type { Pt, RouteId } from "./data";

export interface NodeInfo {
  id: string;
  /** Route selected when the node is activated (null = tooltip only). */
  route: RouteId | null;
  title: string;
  /** "DocuPro Suite · module", "Service · correspondance"… */
  subtitle: string;
  color: string;
  items: string[];
  note?: string;
  /** Centre of the node in viewBox units. */
  at: Pt;
}

const mid = (a: Pt, b?: Pt): Pt => (b ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : a);
const lineNames = (ids: string[]) =>
  ids.map((id) => lineById(id as (typeof LINES)[number]["id"]).name).join(" et ");

export const NODE_INFO: Record<string, NodeInfo> = {};

for (const l of LINES) {
  for (const s of LINE_GEO[l.id].stations) {
    NODE_INFO[s.id] = {
      id: s.id,
      route: l.id,
      title: s.name,
      subtitle: `${l.name} · module`,
      color: l.color,
      items: s.detail.slice(0, 4),
      note: `Ligne ${l.name}`,
      at: s.at,
    };
  }
}

for (const s of SERVICES) {
  NODE_INFO[s.id] = {
    id: s.id,
    route: s.id === "svc-ia" ? "ia" : null,
    title: s.title,
    subtitle: "Service en correspondance",
    color: "#0b1b3a",
    items: [s.summary],
    note: `Relie ${lineNames(s.lines)}`,
    at: mid(s.at, s.to),
  };
}

for (const s of ACADEMIE_STATIONS) {
  NODE_INFO[s.id] = {
    id: s.id,
    route: "academie",
    title: s.name,
    subtitle: "Académie · formation",
    color: "#6d3be0",
    items: [s.summary],
    note: s.lines ? `Correspondance avec ${lineNames(s.lines)}` : "Ligne Académie",
    at: mid(s.at, s.to),
  };
}

export function nodeAriaLabel(id: string): string {
  const n = NODE_INFO[id];
  if (!n) return id;
  return `${n.title}, ${n.subtitle.toLowerCase()}. ${n.items.join(", ")}${n.note ? `. ${n.note}` : ""}`;
}
