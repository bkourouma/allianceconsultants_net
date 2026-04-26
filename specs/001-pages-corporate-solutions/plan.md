# Implementation Plan: Pages détaillées des solutions corporate

**Branch**: `001-pages-corporate-solutions` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pages-corporate-solutions/spec.md`

## Summary

Livrer six pages corporate dédiées sur `allianceconsultants.net` (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale) en **prolongeant la base Next.js déjà livrée** par la feature `001-refonte-site-corporate` (homepage MVP). Cette feature **n'introduit aucune nouvelle stack** : elle réutilise Next.js 15 App Router, React 19, Tailwind 4, le pipeline MDX (`@next/mdx` + `gray-matter`), les content loaders existants (`src/lib/content.ts`), Prisma + PostgreSQL (modèle `Lead` déjà défini), Nodemailer, le stack de tests (Vitest + Playwright + axe-core + Lighthouse CI) et l'infra Docker.

Concrètement, la feature :
1. **Étend** `SolutionSchema` (validateur Zod) avec les blocs détaillés (hero, valueProposition, targetAudience, problemsSolved, featureGroups, benefits, useCases, proof, faq, relatedSolutions) sans casser les usages homepage.
2. **Enrichit** les six fichiers MDX de `content/solutions/` (qui existent déjà avec uniquement les champs « carte homepage ») pour fournir le contenu détaillé, en s'appuyant strictement sur les sources de `docs/`.
3. **Ajoute** la route App Router `src/app/solutions/[slug]/page.tsx` (détail) et `src/app/solutions/page.tsx` (page d'index « Nos solutions »).
4. **Crée** les composants de section dans `src/components/solutions/` (Hero, ValueProp, TargetAudience, FeatureGrid, BenefitList, UseCases, ProofBlock, Faq, RelatedSolutions, LeadFormSection), construits sur les primitives existantes de `src/components/{ui,shared,layout}/`.
5. **Implémente** le route handler `src/app/api/lead/route.ts` qui valide via `LeadInputSchema` existant, hash l'IP (bcryptjs), persiste via Prisma (`prisma.lead.create`) et envoie l'e-mail commercial via Nodemailer.
6. **Ajoute** trois helpers JSON-LD (`buildProductJsonLd`, `buildFaqJsonLd`, `buildBreadcrumbJsonLd`) dans `src/lib/seo.ts`.
7. **Étend** `scripts/validate-content.ts` avec les nouvelles règles d'intégrité (paires sœurs medicpro↔cliniquepro et immotopia-cloud↔annonces-web, non-vide des sections détaillées, etc.).
8. **Étend** la suite de tests (Vitest + Playwright) et la config `lighthouserc.json` pour couvrir les six URLs `/solutions/<slug>`.

Aucune migration de base de données n'est nécessaire (le modèle `Lead` existant suffit). Aucune nouvelle dépendance npm n'est introduite — toutes celles requises (Next.js, React, Tailwind, MDX, Prisma, Zod, react-hook-form, nodemailer, sharp, bcryptjs, vitest, playwright, axe, lhci) sont déjà déclarées dans `package.json`.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict, `"strict": true`, `paths: { "@/*": ["./src/*"] }`)
**Primary Dependencies** (déjà présentes — voir `package.json`) : Next.js 15.3 (App Router, `output: "standalone"`), React 19, Tailwind CSS 4.1 (`@tailwindcss/postcss`), `@next/mdx`, `gray-matter`, Zod 3, react-hook-form 7 + `@hookform/resolvers`, Prisma 5 + `@prisma/client`, Nodemailer 6, Sharp 0.33, bcryptjs 2, `tailwind-merge`, `clsx`.
**Storage**: PostgreSQL via Prisma. Schéma `prisma/schema.prisma` contient déjà le modèle `Lead` (champs `intent`, `solutionSlug`, `fromPage`, `fromBlock`, `name`, `email`, `phone`, `organization`, `message`, `consent`, `userAgent`, `ipHash`, `honeypot`, `status`, `notes`, `contactedAt`, `contactedBy`). **Aucune migration nouvelle** dans cette feature.
**Testing** (déjà configuré) : Vitest 2 (unitaires, content), Playwright 1.49 + `@axe-core/playwright` (e2e + accessibilité), `@lhci/cli` (Lighthouse CI), `tsx scripts/validate-content.ts` (validation pré-build).
**Target Platform**: Hébergement Docker auto-hébergeable. `infra/Dockerfile` (build Next.js standalone), `infra/docker-compose.yml` (Next + Postgres + Matomo via `docker-compose.matomo.yml`), `infra/nginx/` (reverse proxy + HTTPS). Navigateurs cibles : Chrome / Firefox / Safari / Edge en versions des 24 derniers mois, mobile inclus.
**Project Type**: Site web corporate Next.js mono-projet, App Router. Pas de séparation back/front. Le formulaire est un route handler Next.js qui parle à PostgreSQL et au SMTP.
**Performance Goals**: Lighthouse Performance ≥ 85 sur mobile pour chaque `/solutions/<slug>` (objectif constitutionnel, déjà acté pour la homepage). LCP < 2,5 s sur 4G simulée. CLS < 0,1. Pages détail principalement statiques (rendu SSG via `generateStaticParams`).
**Constraints**:
- Mobile-first, responsive (320 → 1920 px).
- WCAG 2.1 AA pour le contenu critique.
- Aucun back-office complexe (la persistance Lead en PG existe déjà côté homepage MVP et reste minimale ; pas d'UI admin nouvelle dans cette feature).
- MVP français uniquement, aucune i18n.
- Aucune allégation médicale ou juridique au-delà de ce que documente `docs/`.
- Aucun secret en dépôt (SMTP, `DATABASE_URL`, `ADMIN_BASIC_*` via variables d'environnement).
- Coordonnées centralisées dans `content/site-settings.json` (déjà la source unique).

**Scale/Scope**: 6 pages détail solutions + 1 page index `/solutions`. Architecture prête pour ajouter d'autres pages (services, formations, références, à propos, contact-démo) dans des features ultérieures sans toucher aux composants partagés. Trafic cible MVP : quelques milliers de visites uniques/mois ; le rendu SSG passe à l'échelle trivialement.

**Dépendance bloquante (à signaler à l'équipe)** : la branche `001-pages-corporate-solutions` part de `main`, qui ne contient pas encore le code Next.js livré dans la feature `001-refonte-site-corporate` (visible dans le worktree `.claude/worktrees/awesome-einstein-24c708/`). L'implémentation de cette feature **suppose** que cette branche homepage est mergée dans `main` au préalable — ou que cette feature est rebasée par-dessus. Aucune ligne de code de cette feature n'est compilable sans la base homepage.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe / règle constitution | Statut | Justification |
|---|---|---|
| I. Clarté de positionnement | ✅ | Hero explicite par page (FR-003.a, FR-005). Le maillage interne renvoie systématiquement vers l'écosystème via `RelatedSolutions` (FR-011) et le `Header` partagé (déjà livré). |
| II. Architecture marque ombrelle | ✅ | Chaque page répond aux trois questions imposées (cibles, problèmes, action) via `TargetAudience`, `BenefitList`, `LeadFormSection` (FR-003 c/e, FR-005). |
| III. Priorité business — leads qualifiés | ✅ | CTA principal « Demander une démo » above the fold mobile + desktop (FR-005). Formulaire `react-hook-form` qualifiant pré-renseignant `solutionSlug`, `fromPage`, `fromBlock`, `intent="demo"` (FR-006). Persistance PG + envoi e-mail garantissent zéro perte de lead. |
| IV. Cohérence éditoriale des pages solutions | ✅ | L'ordre des sections de FR-003 reprend les 10 blocs constitutionnels ; le composant page `[slug]/page.tsx` rend les sections dans l'ordre canonique du contrat `page-sections.contract.md`. Schéma Zod étendu garantit la complétude. |
| V. Modularité, réutilisabilité, qualité technique | ✅ | Aucune nouvelle stack. Composants réutilisables sous `src/components/solutions/` construits sur les primitives existantes (`ui/`, `shared/`). Validation pré-build refuse toute régression. |
| VI. Souveraineté de la constitution | ✅ | Plan, recherche et tests citent les principes ; tout écart serait remonté. |
| Règles UX/UI (mobile-first, menu standard, simplicité, design B2B sobre) | ✅ | Le `Header` existant porte déjà le menu *Accueil · Solutions · Services · Formations · Références · Ressources · À propos · Contact & Démo* (cf. `content/site-settings.json` et `src/components/layout/`). Cette feature ajoute uniquement des pages, sans toucher au menu. |
| Règles de contenu (français, ton, bénéfices, coordonnées centralisées, pas de placeholder) | ✅ | Contenu rédigé à partir de `docs/`. Coordonnées centralisées dans `content/site-settings.json` (déjà la source unique). `scripts/validate-content.ts` rejette les chaînes parasites (liste déjà étendue `Edit Template`, `Get Consultation Now`, `Lorem ipsum`, `Institut Froebel`, `Submit Form`, `Your Name Here`, `TODO:`, `FIXME:`). |
| Règles SEO (title, meta, H1, H2/H3, JSON-LD, slugs, maillage) | ✅ | Schéma Zod impose `seoTitle`, `seoDescription`, `ogImage`. `generateMetadata()` Next.js consomme ces champs. `buildProductJsonLd` + `buildFaqJsonLd` + `buildBreadcrumbJsonLd` injectés via `<script type="application/ld+json">`. `sitemap.ts` liste déjà les 6 routes. |
| Règles techniques (modularité, performance, dépendances justifiées) | ✅ | Aucune dépendance ajoutée. SSG pour les 6 pages, `<Image>` Next.js pour optimisation, Tailwind purge. Cible Lighthouse mobile ≥ 85 inscrite dans `lighthouserc.json`. |
| Règles de sécurité (validation, anti-spam, HTTPS, secrets hors repo) | ✅ | Validation Zod côté client (react-hook-form + resolver) et côté serveur (route handler). Honeypot `z.string().max(0)` déjà dans `LeadInputSchema`. IP hashée (bcryptjs) avant stockage RGPD. HTTPS imposé par Nginx (`infra/nginx/`). Headers de sécurité déjà posés dans `next.config.ts` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). Secrets via env. |
| Règles d'accessibilité (WCAG AA, contrastes, clavier, alt, sémantique) | ✅ | Tests `@axe-core/playwright` étendus à chaque `/solutions/<slug>`. Composants utilisent les balises sémantiques. `prefers-reduced-motion` respecté. |
| Périmètre MVP imposé (les 6 solutions présentes) | ✅ | La feature livre exactement les 6 pages détail. Les pages services / formations / références / à propos / contact-démo relèvent d'autres features (le `Header` les référence déjà avec `status: "coming-soon"` ou liens actifs selon état). |

**Verdict**: Tous les gates constitutionnels passent. Aucune dérogation requise.

## Project Structure

### Documentation (this feature)

```text
specs/001-pages-corporate-solutions/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── solution-content.schema.md
│   ├── lead-form.contract.md
│   └── page-sections.contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created here)
```

### Source Code (repository root)

> **Convention** : structure existante de la feature `001-refonte-site-corporate`. Les fichiers/dossiers marqués (NEW) sont créés par cette feature. Les autres existent déjà et sont **étendus** ou **réutilisés tels quels**.

```text
allianceconsultants_net/
├── package.json                        # Existant — aucune nouvelle dépendance
├── next.config.ts                      # Existant — aucune modification
├── tsconfig.json                       # Existant — aucune modification
├── tailwind.config.ts / postcss.config.mjs  # Existant
├── prisma/
│   └── schema.prisma                   # Existant — modèle Lead déjà conforme
├── infra/
│   ├── Dockerfile                      # Existant
│   ├── docker-compose.yml              # Existant (Next + Postgres)
│   ├── docker-compose.matomo.yml       # Existant
│   └── nginx/                          # Existant (HTTPS reverse proxy)
├── content/
│   ├── site-settings.json              # Existant — source unique coordonnées + menu
│   ├── homepage.mdx                    # Existant
│   └── solutions/
│       ├── docupro-suite.mdx           # Existant — À ENRICHIR avec frontmatter détaillé
│       ├── medicpro.mdx                # Existant — À ENRICHIR
│       ├── cliniquepro.mdx             # Existant — À ENRICHIR
│       ├── immotopia-cloud.mdx         # Existant — À ENRICHIR
│       ├── annonces-web.mdx            # Existant — À ENRICHIR
│       └── ecole-digitale.mdx          # Existant — À ENRICHIR
├── scripts/
│   └── validate-content.ts             # Existant — À ÉTENDRE (règles paires sœurs, complétude détail)
├── public/
│   └── images/
│       └── solutions/                  # (NEW) — visuels par solution (hero, captures, og)
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Existant
│   │   ├── page.tsx                    # Existant (homepage)
│   │   ├── opengraph-image.tsx         # Existant
│   │   ├── robots.ts                   # Existant
│   │   ├── sitemap.ts                  # Existant — liste DÉJÀ les 6 routes /solutions/<slug>
│   │   ├── solutions/
│   │   │   ├── page.tsx                # (NEW) — index « Nos solutions »
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # (NEW) — page détail (generateStaticParams + generateMetadata)
│   │   └── api/
│   │       └── lead/
│   │           └── route.ts            # (NEW) — POST handler (Zod + Prisma + Nodemailer)
│   ├── components/
│   │   ├── layout/                     # Existant (Header, Footer)
│   │   ├── shared/                     # Existant (Cta, Container, etc.)
│   │   ├── ui/                         # Existant (Button, Card, Badge…)
│   │   ├── homepage/                   # Existant
│   │   └── solutions/                  # (NEW)
│   │       ├── SolutionHero.tsx
│   │       ├── ValueProp.tsx
│   │       ├── TargetAudience.tsx
│   │       ├── FeatureGrid.tsx
│   │       ├── BenefitList.tsx
│   │       ├── UseCases.tsx
│   │       ├── ProofBlock.tsx
│   │       ├── Faq.tsx
│   │       ├── RelatedSolutions.tsx
│   │       └── LeadFormSection.tsx
│   ├── lib/
│   │   ├── content.ts                  # Existant — À ÉTENDRE : ajouter getSolutionBySlug(slug)
│   │   ├── seo.ts                      # Existant — À ÉTENDRE : 3 helpers JSON-LD
│   │   ├── prisma.ts                   # Existant
│   │   ├── matomo.ts                   # Existant
│   │   ├── utils.ts                    # Existant
│   │   ├── mailer.ts                   # (NEW) — wrapper Nodemailer pour /api/lead
│   │   └── validators/
│   │       ├── content.ts              # Existant — À ÉTENDRE : SolutionDetailSchema (compose SolutionSchema existant)
│   │       └── lead.ts                 # Existant — réutilisé tel quel (LeadInputSchema)
│   ├── middleware.ts                   # Existant (Basic Auth /admin)
│   └── styles/                         # Existant
└── tests/
    ├── unit/
    │   ├── solutionSchema.test.ts      # (NEW) — couvre SolutionDetailSchema + règles paires sœurs
    │   ├── jsonLd.test.ts              # (NEW) — buildProductJsonLd, buildFaqJsonLd, buildBreadcrumbJsonLd
    │   └── leadRoute.test.ts           # (NEW) — handler /api/lead avec mocks Prisma + Nodemailer
    ├── content/
    │   └── solutions-detail.test.ts    # (NEW) — vérifie les 6 fichiers MDX vs SolutionDetailSchema
    └── e2e/
        ├── solution-pages.spec.ts      # (NEW) — smoke + a11y sur chaque /solutions/<slug>
        └── lead-form.spec.ts           # (NEW) — soumission valide, honeypot, rate-limit, fallback no-JS
```

**Structure Decision**: Mono-projet Next.js déjà en place. La feature **prolonge** l'existant en (a) ajoutant une route App Router `solutions/[slug]/page.tsx` + une page index `solutions/page.tsx`, (b) ajoutant un route handler `app/api/lead/route.ts`, (c) créant le dossier de composants `src/components/solutions/`, (d) étendant `SolutionSchema` par composition (`SolutionDetailSchema = SolutionSchema.extend({...})`) pour rester rétro-compatible avec la homepage. Aucune réorganisation de l'existant.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Choix | Pourquoi nécessaire | Alternative simple écartée car |
|---|---|---|
| Étendre `SolutionSchema` plutôt que créer un schéma orthogonal | La homepage et les pages détail partagent les champs identitaires (`slug`, `name`, `category`, `seoTitle`, `seoDescription`, `ogImage`, `homepageOrder`, `showOnHomepage`). Composer via `SolutionSchema.extend({...}) = SolutionDetailSchema` évite la duplication, garde une seule source de vérité par MDX, et permet à `getSolutions()` (carte homepage) de continuer à fonctionner inchangé via parsing partiel ou via `SolutionDetailSchema.pick({...})`. | Deux fichiers MDX par solution (un « card », un « detail ») : duplication, risque de divergence. |
| Persistance Prisma du Lead (au lieu d'un simple e-mail) | **Décision déjà actée par la feature homepage** : modèle `Lead` complet en place (status, ipHash RGPD, contactedAt, etc.). Ne pas le réutiliser serait incohérent. La spec dit « pas de back-office complexe » : Prisma `prisma.lead.create()` + un index sur `createdAt` n'est pas un back-office, juste un stockage minimal pour ne perdre aucun lead en cas de panne SMTP. Aucune UI admin nouvelle dans cette feature. | Stockage uniquement par e-mail : une panne SMTP perd la demande ; pas de file de retraitement ; incohérent avec ce que la homepage utilise déjà. |
| Page index `/solutions` créée ici | `sitemap.ts` la liste déjà avec priorité 0.9 ; le `Header` la référence ; sans elle l'URL renverrait 404 et les six pages détail seraient orphelines en termes de maillage. La page reste minimale (réutilise les *cards* solutions de la homepage). | Aucune page index → 404, lien menu cassé, SEO dégradé. |
