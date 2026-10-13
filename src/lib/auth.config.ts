import type { NextAuthConfig } from "next-auth";
import {
  ADMIN_HOME,
  buildLoginPath,
  normalizeAdminPath,
  trustedOrigins,
} from "@/lib/admin-callback";

/**
 * Edge-safe NextAuth configuration.
 *
 * Ce fichier ne DOIT PAS importer Prisma, bcryptjs ou tout module
 * Node-only : il est consommé par le middleware Next.js qui s'exécute
 * en environnement Edge. La logique d'authentification réelle (Prisma +
 * bcrypt) vit dans `src/lib/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/admin/login";

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        // Non connecté : redirection vers la page de connexion avec un `callbackUrl`
        // réduit au CHEMIN demandé. Le comportement par défaut de NextAuth y recopie
        // `nextUrl.href`, qui sous Docker contient l'hôte interne du conteneur
        // (http://<id-conteneur>:3000/admin). L'origine du `Location` est celle de la
        // requête ; Next la réécrit en relatif, sans dépendre d'en-têtes X-Forwarded-*.
        const { pathname, search } = nextUrl;
        return Response.redirect(new URL(buildLoginPath(pathname, search), nextUrl), 307);
      }
      return true;
    },
    // Après connexion / déconnexion : uniquement des chemins du backoffice (pas de
    // redirection ouverte, pas d'adresse interne héritée d'un ancien lien).
    redirect({ url, baseUrl }) {
      const path = normalizeAdminPath(
        url,
        trustedOrigins(baseUrl, process.env.NEXT_PUBLIC_SITE_URL),
      );
      return `${baseUrl}${path ?? ADMIN_HOME}`;
    },
    session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (typeof token?.role === "string" && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig;
