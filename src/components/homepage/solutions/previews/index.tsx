import type { ComponentType } from "react";
import type { LineId } from "@/lib/network";
import { DocuProPreview } from "./DocuProPreview";
import { MedicProPreview } from "./MedicProPreview";
import { CliniqueProPreview } from "./CliniqueProPreview";
import { ImmoTopiaPreview } from "./ImmoTopiaPreview";
import { AnnoncesPreview } from "./AnnoncesPreview";
import { EcolePreview } from "./EcolePreview";

/** One synthetic, interactive "Aperçu illustratif" per line. */
export const PREVIEWS: Record<LineId, ComponentType<{ name: string }>> = {
  docupro: DocuProPreview,
  medicpro: MedicProPreview,
  cliniquepro: CliniqueProPreview,
  immotopia: ImmoTopiaPreview,
  annonces: AnnoncesPreview,
  ecole: EcolePreview,
};
