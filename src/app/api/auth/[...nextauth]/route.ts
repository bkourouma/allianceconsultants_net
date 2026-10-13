import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { withPublicOrigin } from "@/lib/public-request";

// NextAuth déduit son URL de `request.url`, qui sous Docker porte l'hôte interne du
// conteneur (http://<id>:3000) : on lui fournit l'origine publique (voir public-request.ts).
export const GET = (req: NextRequest) => handlers.GET(withPublicOrigin(req));
export const POST = (req: NextRequest) => handlers.POST(withPublicOrigin(req));
export const runtime = "nodejs";
