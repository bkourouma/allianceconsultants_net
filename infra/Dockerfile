# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build-time public env vars (inlined by Next.js at build — must be ARGs, not runtime ENVs)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ENV NEXT_PUBLIC_BING_SITE_VERIFICATION=$NEXT_PUBLIC_BING_SITE_VERIFICATION

RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# openssl + libc6-compat: required by Prisma for engine detection on Alpine
RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Schema + seed for `prisma db push` and one-off `tsx prisma/seed.ts`
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# bcryptjs is only used by seed.ts so Next's tracer skips it; copy it explicitly
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
# One-off scripts run inside the container with the bundled tsx (devDependency, so
# not traced by Next): scripts/apply-blog-posts.ts imports prisma/seed.ts.
#   docker exec allianceconsultants-web node node_modules/tsx/dist/cli.mjs scripts/apply-blog-posts.ts --slugs a,b
COPY --from=builder --chown=nextjs:nodejs /app/scripts/apply-blog-posts.ts ./scripts/apply-blog-posts.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
