import type { NextAuthConfig } from "next-auth";

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
        return isLoggedIn;
      }
      return true;
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
