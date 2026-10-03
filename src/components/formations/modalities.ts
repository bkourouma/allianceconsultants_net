export type ModalityKey = "presentiel" | "distanciel" | "intra";

export const MODALITY_LABELS: Record<ModalityKey, string> = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  intra: "Intra-entreprise",
};

export const MODALITY_KEYS = Object.keys(MODALITY_LABELS) as ModalityKey[];

export function activeModalities(
  m: Record<ModalityKey, boolean>,
): ModalityKey[] {
  return MODALITY_KEYS.filter((k) => m[k]);
}
