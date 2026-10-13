import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { isLegacyWordPressRequest } from "@/lib/legacy-wordpress";

const authMiddleware = NextAuth(authConfig).auth;

/**
 * Deux rôles :
 *  1. anciennes URL WordPress → 410 Gone, sans redirection intermédiaire
 *     (motifs dans src/lib/legacy-wordpress.ts) ;
 *  2. protection du backoffice /admin (NextAuth).
 */
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isLegacyWordPressRequest(request.nextUrl.pathname, request.nextUrl.searchParams)) {
    return new NextResponse("410 Gone — cette page n'existe plus.", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  const { pathname } = request.nextUrl;

  // Seul le backoffice passe par NextAuth.
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  return (authMiddleware as unknown as (r: NextRequest, e: NextFetchEvent) => Promise<Response> | Response)(request, event);
}

// Le matcher doit couvrir tous les motifs de isLegacyWordPressRequest.
export const config = {
  matcher: [
    "/admin/:path*",
    "/tag/:path*",
    "/author/:path*",
    "/category/:path*",
    "/:path*/feed",
    "/wp-(.*)",
    "/xmlrpc.php",
    { source: "/:path*", has: [{ type: "query", key: "replytocom" }] },
  ],
};
