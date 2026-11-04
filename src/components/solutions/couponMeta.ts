import { LINES } from "@/lib/network";

/** Coupon number (1–6) of a product, following the order of the carnet. */
export function couponNo(slug: string): number {
  const i = LINES.findIndex((l) => l.slug === slug || l.id === slug);
  return i === -1 ? 0 : i + 1;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
