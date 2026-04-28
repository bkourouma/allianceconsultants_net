import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { LoginInputSchema } from "@/lib/validators/auth";
import { consumeRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";

const LOGIN_RATE_LIMIT_DEFAULT = 5;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = LoginInputSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const limit = Number.parseInt(
          process.env.LOGIN_RATE_LIMIT_PER_10MIN ?? `${LOGIN_RATE_LIMIT_DEFAULT}`,
          10,
        );
        const max = Number.isFinite(limit) && limit > 0 ? limit : LOGIN_RATE_LIMIT_DEFAULT;
        const ip = getClientIpFromHeaders(request.headers as Headers);
        const { allowed } = consumeRateLimit({
          bucket: "login",
          identifier: ip,
          max,
        });
        if (!allowed) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
          await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinO");
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
        };
      },
    }),
  ],
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}
