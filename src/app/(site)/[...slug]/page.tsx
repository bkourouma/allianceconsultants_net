import { notFound } from "next/navigation";

/**
 * Attrape toute URL inconnue du site public pour qu'elle soit rendue avec le
 * layout du site (en-tête, pied de page) et le `not-found.tsx` associé, au lieu
 * de la page 404 nue de Next. Renvoie bien un statut HTTP 404.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
