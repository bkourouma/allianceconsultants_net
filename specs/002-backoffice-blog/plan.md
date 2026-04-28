# Implementation Plan — 002 — Backoffice + Blog éditorial

**Branch**: `002-backoffice-blog` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Constitution**: v1.0.1

## Summary

Ajouter un **espace d'administration privé** (`/admin`) à `allianceconsultants.net`
et un **blog public** (`/blog`) qui remplace l'ancien item « Ressources » du
menu principal. La feature s'inscrit dans la continuité technique des
features 001 (homepage et pages solutions) : Next.js 15 App Router, React
19, Tailwind 4, Prisma + PostgreSQL, Vitest + Playwright. Aucune nouvelle
plateforme, aucun nouveau langage.

Concrètement, la feature :

1. **Amende** la constitution (PATCH 1.0.0 → 1.0.1) — *Ressources* → *Blog*
   dans le menu de référence.
2. **Étend** le schéma Prisma avec 4 modèles : `User`, `BlogPost`, `BlogTag`,
   `BlogPostTag`. Pas de migration sur le modèle `Lead` existant.
3. **Ajoute** NextAuth (Auth.js v5) avec un Credentials provider + adapter
   Prisma. Stratégie de session : JWT (cookie HTTP-only, Secure, SameSite=Lax).
4. **Remplace** `src/middleware.ts` (Basic Auth) par un middleware NextAuth
   protégeant `/admin/**` (sauf `/admin/login`).
5. **Ajoute** une dépendance riche-éditeur : `@tiptap/react`,
   `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`,
   `@tiptap/extension-image`, `isomorphic-dompurify` pour la sanitisation
   serveur.
6. **Crée** les routes serveur App Router :
   - `src/app/admin/layout.tsx` (layout admin protégé)
   - `src/app/admin/login/page.tsx`
   - `src/app/admin/page.tsx` (dashboard)
   - `src/app/admin/leads/page.tsx`, `src/app/admin/leads/[id]/page.tsx`
   - `src/app/admin/blog/page.tsx`, `src/app/admin/blog/new/page.tsx`,
     `src/app/admin/blog/[id]/page.tsx`
   - `src/app/admin/account/page.tsx`
   - `src/app/api/auth/[...nextauth]/route.ts` (NextAuth handler)
   - `src/app/api/admin/leads/[id]/route.ts` (PATCH)
   - `src/app/api/admin/blog/route.ts` (POST)
   - `src/app/api/admin/blog/[id]/route.ts` (PATCH/DELETE)
   - `src/app/api/admin/blog/upload/route.ts` (POST cover image)
7. **Crée** les routes publiques :
   - `src/app/blog/page.tsx`
   - `src/app/blog/[slug]/page.tsx`
   - `src/app/feed.xml/route.ts`
   - Redirection `/ressources` → `/blog` (via `next.config.ts redirects()`).
8. **Crée** les composants UI partagés admin :
   `AdminShell`, `AdminSidebar`, `LoginForm`, `LeadStatusForm`,
   `BlogPostForm`, `RichTextEditor` (Tiptap), `ImageUploader`,
   `TagInput`.
9. **Crée** les helpers serveur : `src/lib/auth.ts` (NextAuth config),
   `src/lib/admin/leads.ts`, `src/lib/admin/blog.ts`,
   `src/lib/sanitize.ts`, `src/lib/blog.ts` (lecture publique paginée).
10. **Étend** `src/lib/seo.ts` avec `buildArticleJsonLd` et
    `buildBlogBreadcrumbJsonLd`.
11. **Met à jour** `content/site-settings.json` :
    - dans `primaryMenu`, l'item `Ressources / /ressources` devient
      `Blog / /blog` ;
    - dans `footerMenu`, la clé `ressources` devient `blog` (et le composant
      `GlobalFooter.tsx` lit cette nouvelle clé).
12. **Met à jour** `src/app/sitemap.ts` (ajouter `/blog` + chaque article
    publié — récupérés via Prisma).
13. **Met à jour** `src/app/robots.ts` — `/admin/` reste interdit (déjà le
    cas).
14. **Crée** un script de seed `prisma/seed.ts` qui crée le seul utilisateur
    admin à partir de `ADMIN_EMAIL` + `ADMIN_PASSWORD` (idempotent).
15. **Étend** la suite de tests : Vitest pour les helpers
    (sanitize, slug, validators), Playwright pour le flow login →
    création article → publication → visibilité publique.

## Technical Context

**Language/Version**: TypeScript 5.6 strict, identique aux features 001.
**Nouvelles dépendances** :
- `next-auth@^5.0.0-beta` (Auth.js v5)
- `@auth/prisma-adapter@^2`
- `@tiptap/react@^2`, `@tiptap/pm@^2`, `@tiptap/starter-kit@^2`,
  `@tiptap/extension-link@^2`, `@tiptap/extension-image@^2`
- `isomorphic-dompurify@^2`

**Storage** : PostgreSQL via Prisma. Nouveaux modèles `User`, `BlogPost`,
`BlogTag`, `BlogPostTag`. **Migration** requise : `prisma migrate dev` (ou
`prisma db push` en dev local). Pour la prod, ajouter une étape `prisma
migrate deploy` au pipeline.

**Auth** : NextAuth v5 (Auth.js).
- Provider : `Credentials` (e-mail + mot de passe vérifié via bcryptjs).
- Stratégie de session : `jwt` (cookie HTTP-only). Évite la dépendance à
  une table `Session` côté DB et reste compatible avec un déploiement
  edge/SSR.
- Adapter Prisma : utilisé pour le **stockage utilisateurs** uniquement.
  Sessions = JWT, donc pas de table `Session` ni `Account` au MVP.
- Secret : `AUTH_SECRET` (≥ 32 octets).

**Éditeur** : Tiptap (React) — sortie HTML, sanitisé serveur avec
`isomorphic-dompurify`. Liste blanche : `p, h2, h3, h4, ul, ol, li,
strong, em, code, pre, blockquote, a[href|title|target|rel],
img[src|alt|title|width|height], hr, br`.

**Uploads** : disque local sous `public/uploads/blog/`. `next.config.ts`
ignore déjà ce dossier en build (Next.js sert tout `public/` tel quel).
Pour un déploiement multi-instances, prévoir S3 ultérieurement (hors MVP).

**Tests** :
- Vitest : `tests/unit/auth.test.ts`, `tests/unit/sanitize.test.ts`,
  `tests/unit/slug.test.ts`, `tests/unit/blog-validators.test.ts`.
- Playwright : `tests/e2e/admin-flow.spec.ts` (login → créer article →
  publier → vérifier `/blog/<slug>` visible et indexable).

**Performance** : `/blog` et `/blog/[slug]` en ISR (`revalidate: 60`,
revalidation à la demande via `revalidateTag('blog')` après publication).

**Sécurité** : voir spec.md > NFR > Sécurité.

## Constitution Check

*GATE: Doit passer avant d'écrire le code.*

| Principe / règle | Statut | Justification |
|---|---|---|
| I. Clarté de positionnement | ✅ | Le blog ne déplace ni n'éclipse les solutions. CTA en bas d'article renvoient vers la prise de contact ; en-tête et liens restent ceux de la marque ombrelle. |
| II. Architecture marque ombrelle | ✅ | Aucune solution n'est mise en avant ; le blog est éditorial transverse. Les articles peuvent évidemment évoquer une solution, mais le CTA principal reste l'écosystème (`/contact-demo`). |
| III. Priorité business — leads qualifiés | ✅ | CTA business obligatoire en fin d'article (`intent=contact`, `fromPage=/blog/<slug>`). Le formulaire admin **ne génère pas de lead** — il qualifie ceux existants. |
| IV. Cohérence éditoriale des pages solutions | ✅ | Aucune page solution n'est touchée par cette feature. |
| V. Modularité, réutilisabilité, qualité technique | ✅ | Composants admin sous `src/components/admin/`, primitives publiques (Button, Card, Section) réutilisées telles quelles. Aucune duplication. |
| VI. Souveraineté de la constitution | ✅ | La feature contredisait le menu de référence (`Ressources`). **Constitution amendée explicitement (v1.0.1)** avant tout code. Le présent plan cite l'amendement et son Sync Impact Report. |
| Règles UX/UI (mobile-first, design B2B sobre) | ✅ | L'admin réutilise le design system (Tailwind 4 + tokens couleur). Layout admin sobre, navigation latérale simple, mobile-first également. |
| Règles de contenu (FR pro, ton, pas de placeholder) | ✅ | Tous les libellés admin et blog en français. `scripts/validate-content.ts` continue de protéger le contenu MDX (le blog est en base, mais la sanitisation et la validation Zod jouent le même rôle). |
| Règles SEO | ✅ | Title/meta/H1 par article, JSON-LD `Article`, breadcrumb, canonical, sitemap, RSS, OpenGraph. Slugs en kebab-case minuscule. |
| Règles techniques (modularité, performance) | ✅ | Quatre dépendances ajoutées, toutes justifiées (auth, éditeur, sanitisation). ISR pour les pages publiques. Lighthouse target 85 mobile sur `/blog` et `/blog/[slug]`. |
| Règles de sécurité | ✅ | Voir NFR. CSRF natif NextAuth, sanitisation HTML, hash bcrypt, rate-limit login, secrets via env, `/admin` interdit aux robots. |
| Règles d'accessibilité | ✅ | Layout admin avec landmark `<main>`, focus visible, labels formulaires. Pages publiques héritent du `<GlobalHeader>` / `<GlobalFooter>` (déjà conformes). |
| Règles gouvernance contenu | ✅ | Coordonnées toujours centralisées (`site-settings.json`). Blog = source unique en base. Pas de mention parasite. |

## Project Structure (delta de la feature)

```
.specify/memory/constitution.md       # ↑ v1.0.1 (amendement Ressources→Blog)
content/site-settings.json            # ↑ menus mis à jour
prisma/
├── schema.prisma                     # + User, BlogPost, BlogTag, BlogPostTag
├── seed.ts                           # NEW — seed admin user
└── migrations/                       # NEW — prisma migrate dev
src/
├── lib/
│   ├── auth.ts                       # NEW — NextAuth config + helpers
│   ├── sanitize.ts                   # NEW — DOMPurify wrapper
│   ├── slug.ts                       # NEW — slugify + uniqueness
│   ├── blog.ts                       # NEW — public blog queries
│   ├── admin/
│   │   ├── leads.ts                  # NEW
│   │   └── blog.ts                   # NEW
│   ├── validators/
│   │   ├── auth.ts                   # NEW — login, password change
│   │   └── blog.ts                   # NEW — BlogPostInput, TagInput
│   └── seo.ts                        # ↑ + buildArticleJsonLd
├── middleware.ts                     # ↑ remplace Basic Auth → NextAuth
├── components/
│   ├── admin/
│   │   ├── AdminShell.tsx            # NEW
│   │   ├── AdminSidebar.tsx          # NEW
│   │   ├── AdminTopbar.tsx           # NEW
│   │   ├── KpiCard.tsx               # NEW
│   │   ├── LoginForm.tsx             # NEW (client)
│   │   ├── LeadFilters.tsx           # NEW (client)
│   │   ├── LeadStatusForm.tsx        # NEW (client)
│   │   ├── BlogPostForm.tsx          # NEW (client)
│   │   ├── RichTextEditor.tsx        # NEW (client, Tiptap)
│   │   ├── TagInput.tsx              # NEW (client)
│   │   └── ImageUploader.tsx         # NEW (client)
│   └── blog/
│       ├── BlogIndexCard.tsx         # NEW
│       ├── BlogTagBadge.tsx          # NEW
│       └── BlogArticleHero.tsx       # NEW
├── app/
│   ├── admin/
│   │   ├── layout.tsx                # NEW
│   │   ├── page.tsx                  # NEW (dashboard)
│   │   ├── login/page.tsx            # NEW
│   │   ├── leads/
│   │   │   ├── page.tsx              # NEW
│   │   │   └── [id]/page.tsx         # NEW
│   │   ├── blog/
│   │   │   ├── page.tsx              # NEW
│   │   │   ├── new/page.tsx          # NEW
│   │   │   └── [id]/page.tsx         # NEW
│   │   └── account/page.tsx          # NEW
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NEW
│   │   └── admin/
│   │       ├── leads/[id]/route.ts   # NEW (PATCH)
│   │       └── blog/
│   │           ├── route.ts          # NEW (POST)
│   │           ├── [id]/route.ts     # NEW (PATCH/DELETE)
│   │           └── upload/route.ts   # NEW (POST image)
│   ├── blog/
│   │   ├── page.tsx                  # NEW
│   │   └── [slug]/page.tsx           # NEW
│   ├── feed.xml/route.ts             # NEW (RSS)
│   ├── sitemap.ts                    # ↑ + /blog + articles
│   └── layout.tsx                    # inchangé
public/uploads/blog/                  # NEW — covers (gitignored)
tests/
├── unit/
│   ├── auth.test.ts                  # NEW
│   ├── sanitize.test.ts              # NEW
│   ├── slug.test.ts                  # NEW
│   └── blog-validators.test.ts       # NEW
└── e2e/
    └── admin-flow.spec.ts            # NEW
```

## Variables d'environnement

À ajouter dans `.env.local` (et `.env.example` si présent) :

```
# NextAuth (Auth.js v5)
AUTH_SECRET=<openssl rand -base64 32>
AUTH_TRUST_HOST=true            # nécessaire derrière reverse proxy

# Seed admin (lus uniquement par prisma/seed.ts)
ADMIN_EMAIL=admin@allianceconsultants.net
ADMIN_PASSWORD=<≥12 car. fort>

# Anciennes (toujours valides ; ADMIN_BASIC_* peuvent être retirées
# une fois la migration validée en prod)
DATABASE_URL=
SMTP_HOST= …
LEAD_RATE_LIMIT_PER_10MIN=5
LOGIN_RATE_LIMIT_PER_10MIN=5    # NEW — rate-limit login
PUBLIC_SITE_URL=https://allianceconsultants.net
```

`ADMIN_BASIC_USER` / `ADMIN_BASIC_PASSWORD` ne sont **plus** utilisées (le
middleware Basic Auth est supprimé). Les retirer du `.env` une fois la
session NextAuth validée en prod.

## Phases

- **Phase 0** — Constitution amendée + spec.md + plan.md. ✅
- **Phase 1** — Schéma Prisma + migration + seed. Validation des modèles
  par Zod (validators).
- **Phase 2** — Auth : config NextAuth, middleware, login UI. Doit
  fonctionner de bout en bout avant les UIs CRUD.
- **Phase 3** — Backoffice Leads (read + update statut/notes).
- **Phase 4** — Backoffice Blog (CRUD + upload image + Tiptap +
  sanitisation).
- **Phase 5** — Blog public (`/blog`, `/blog/[slug]`, `/feed.xml`,
  sitemap, redirection `/ressources` → `/blog`).
- **Phase 6** — Tests (vitest + playwright) + lint + typecheck.

Chaque phase est testable en isolation et n'introduit pas de régression
sur les pages existantes (homepage, solutions, contact).

## Risques techniques (au-delà des risques business listés dans spec.md)

- **NextAuth v5 (beta)** : encore en bêta au moment de la rédaction. Pin
  exact dans `package.json`. Si stabilité insuffisante, fallback :
  implémenter session-cookie maison + bcryptjs (déjà disponible).
  Décision retenue malgré ce risque pour standardiser l'auth.
- **Rendu serveur de Tiptap** : Tiptap est client-only. Le formulaire
  admin sera un Client Component ; le contenu publié est rendu côté
  serveur en injectant le HTML sanitisé via
  `dangerouslySetInnerHTML`. Un test unitaire `sanitize.test.ts` vérifie
  qu'aucun `<script>`, `on…=` ou `javascript:` ne survit.
- **Migration en prod** : la première migration crée des tables. Penser à
  `prisma migrate deploy` dans le `Dockerfile` ou un job d'init avant
  démarrage.
