# Implementation Plan: Page d'accueil corporate Alliance Consultants

**Branch**: `001-page-accueil-corporate` (worktree: `claude/awesome-einstein-24c708`) | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-page-accueil-corporate/spec.md`
**Révision** : 2026-04-26 — recadrage **site corporate vitrine** (pas une plateforme SaaS).

## Summary

Livrer une **page d'accueil corporate** qui repositionne Alliance Consultants comme une **marque ombrelle technologique africaine**, rend visible l'écosystème (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale, services experts, formations, automatisation IA) et redirige toute conversion vers `/contact-demo`.

**Approche technique recadrée — site internet vitrine, pas application SaaS** :

- Application **Next.js 15 (App Router, React Server Components)** + **TypeScript** + **Tailwind CSS 4**.
- **Contenu = fichiers MDX/Markdown** dans `/content/` versionnés en Git (solutions, services, formations, références, ressources, paramètres globaux). Pas de CMS, pas d'admin pour le contenu en MVP.
- **Postgres + Prisma minimal** : **une seule table `Lead`** pour les soumissions du formulaire `/contact-demo` + notifications email.
- **Pas de NextAuth / Auth.js** (pas d'utilisateurs publics). Une page `/admin/leads` optionnelle (consultation/export des leads) est protégée par **HTTP Basic Auth** via middleware (admin unique défini par variables d'env).
- **Matomo auto-hébergé** = **option activable** par variable d'env (`NEXT_PUBLIC_MATOMO_URL`). Si non défini → tracking désactivé sans erreur. Non bloquant pour le lancement MVP.
- **Hébergement Docker** (Linux) derrière reverse proxy avec TLS automatique.
- **Rendu majoritairement statique** (SSG au build pour les pages contenu) → Lighthouse ≥ 85 mobile et Core Web Vitals « Good » sans effort.

Comme c'est la **feature 001** du projet, ce plan pose les fondations techniques (architecture Next.js + MDX, design system minimal, formulaire lead, tooling) **réutilisées par toutes les features suivantes** (pages solutions, services, formations, références, ressources, à propos, contact-démo).

## Technical Context

**Language/Version**: TypeScript 5.6, Node.js 22 LTS
**Primary Dependencies**: Next.js 15 (App Router, RSC), React 19, Tailwind CSS 4, MDX (`@next/mdx` + `gray-matter` pour frontmatter), Zod (validation formulaire), Prisma 5 (schéma minimal `Lead`), Nodemailer (notifications email leads), Sharp (images via `next/image`)
**Storage**:
- **Contenu éditorial** : fichiers MDX/JSON en arborescence `/content/` (Git). Aucune DB pour le contenu MVP.
- **Leads** : PostgreSQL 16, **une seule table `Lead`**.
- **Médias non gérés en CMS** : `/public/images/` (logos, hero, motifs).
**Testing**: Vitest (unit / composants), Playwright (E2E + `@axe-core/playwright` pour accessibilité), Lighthouse CI (perf + SEO + a11y, en CI **non bloquant** pour le MVP, bloquant en V2)
**Target Platform**: Web (desktop + tablette + mobile) ; rendu SSG par défaut, ISR pour pages dépendant de la base (peu nombreuses) ; mobile-first ; navigateurs modernes (Chrome, Edge, Safari, Firefox dernières 2 versions)
**Project Type**: Site web corporate (Next.js mono-projet, ~25-30 pages publiques + 1 page admin minimale optionnelle)
**Performance Goals**: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 sur mobile (Core Web Vitals « Good ») ; Lighthouse Performance ≥ 85 mobile sur la page d'accueil ; TTFB ≤ 600 ms en p75
**Constraints**: HTTPS obligatoire ; mono-langue français (`<html lang="fr">`) ; aucun cookie non strictement nécessaire ; aucun script tracker tiers hors Matomo (optionnel) ; bundle JS critique ≤ 100 KB transféré ; images en AVIF/WebP avec lazy loading ; WCAG 2.2 AA ; uptime ≥ 99,5 % mensuel
**Scale/Scope**: Site corporate ~25-30 pages publiques (cf. architecture URL ci-dessous), trafic estimé ~1 000 visiteurs uniques/jour en cible B2B niche, ~50 leads/mois en cible MVP. Architecture pensée pour évoluer (ajout solution / service / formation = nouveau MDX, pas de release applicative requise).

### Architecture URL cible (couverte par le projet — feature 001 livre uniquement `/`)

```
/
/solutions
/solutions/docupro-suite
/solutions/medicpro
/solutions/cliniquepro
/solutions/immotopia-cloud
/solutions/annonces-web
/solutions/ecole-digitale
/services
/services/developpement-specifique
/services/automatisation-ia-processus-metiers
/services/assistance-maitrise-ouvrage
/services/consultance
/services/dematerialisation-archives
/services/scanners-professionnels
/formations
/formations/ia-entreprise
/formations/developpement-web-dotnet-ia
/formations/automatisation-n8n-processus-ia
/formations/sql-server
/formations/ged-archivage
/formations/gestion-projet
/references
/ressources
/a-propos
/contact-demo
```

Toutes les routes ci-dessus sont **prévues par l'architecture** (routing dynamique sur les MDX), mais **livrées par features successives**. Cette feature 001 ne livre que `/` (et bootstrappe la structure technique).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate (principe) | Évaluation | Justification |
|---|---|---|
| **I. Clarté de positionnement** | PASS | SSG → HTML rendu au build, lisible immédiatement sans hydratation. |
| **II. Marque ombrelle** | PASS | Convention MDX uniforme : un fichier `content/solutions/<slug>.mdx` par solution avec le même frontmatter → aucune asymétrie technique. |
| **III. Priorité business** | PASS | Tous les CTA sont des `<a href>` standards vers `/contact-demo` avec query params d'intention → fonctionnent sans JS, traçables. |
| **IV. Cohérence éditoriale** | PASS | Composant unique `<SolutionCard />` (resp. `<ServiceCard />`, `<TrainingCard />`) garantit la même hiérarchie d'information. |
| **V. Modularité, qualité technique** | PASS | Séparation contenu (MDX) / structure (RSC) / style (Tailwind utilities) ; pas de duplication ; design system minimal partagé. |
| **VI. Souveraineté de la constitution** | PASS | Plan cite la constitution comme source d'autorité ; aucune décision ne contredit un principe ou une règle. |

| Gate (règle constitutionnelle) | Évaluation | Justification |
|---|---|---|
| Règles UX/UI (mobile-first, responsive, animations discrètes) | PASS | Tailwind mobile-first, aucune lib d'animation lourde. |
| Règles de contenu (français pro, pas de template visible) | PASS | Contenu MDX en français, lint anti-template (chaînes interdites) en CI. |
| Règles SEO (H1 unique, JSON-LD, indexable) | PASS | Next.js Metadata API + JSON-LD `Organization` rendu côté serveur ; `sitemap.xml` + `robots.txt` générés ; SSG = contenu indexable. |
| Règles techniques (modularité, perf ≥ 85) | PASS | RSC + SSG + Image optim Next.js. |
| Règles de sécurité (validation client+serveur, HTTPS, pas de secrets en clair) | PASS | Zod côté serveur sur le formulaire lead ; secrets en env vars ; HTTPS via reverse proxy + Let's Encrypt ; HTTP Basic Auth pour `/admin/leads` (cookie session strictement nécessaire — pas de bandeau requis). |
| Règles d'accessibilité (WCAG 2.2 AA) | PASS | axe-core en E2E (Playwright) ; HTML sémantique ; tokens Tailwind avec ratios validés. |
| Règles de gouvernance (anti-template, coordonnées centralisées) | PASS | `content/site-settings.json` = source unique des coordonnées (FR-091/FR-092/SC-011). |

**Verdict** : aucune violation. Section *Complexity Tracking* vide.

## Project Structure

### Documentation (this feature)

```text
specs/001-page-accueil-corporate/
├── plan.md              # Ce fichier (révisé)
├── research.md          # Phase 0 — décisions techniques (révisé)
├── data-model.md        # Phase 1 — schémas MDX/JSON + 1 modèle Prisma `Lead`
├── contracts/
│   ├── urls.md          # Architecture URL + redirections CTA
│   ├── analytics-events.md   # 8 événements MVP
│   └── json-ld-organization.md
├── quickstart.md
├── checklists/requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root <html lang="fr">
│   ├── page.tsx                    # Page d'accueil — feature 001
│   ├── opengraph-image.tsx         # OG image
│   ├── solutions/                  # (livré par features 002+ — routes dynamiques sur MDX)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── services/                   # (livré par features 002+)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── formations/                 # (livré par features 002+)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── references/page.tsx         # (livré par feature ultérieure)
│   ├── ressources/page.tsx         # (livré par feature ultérieure)
│   ├── a-propos/page.tsx           # (livré par feature ultérieure)
│   ├── contact-demo/               # (livré par feature dédiée)
│   │   ├── page.tsx
│   │   └── actions.ts              # Server Action — POST lead → Postgres + email
│   ├── admin/
│   │   └── leads/page.tsx          # (optionnel MVP) — consultation/export des leads, protégé par Basic Auth
│   ├── api/
│   │   └── leads/route.ts          # endpoint export CSV (admin only)
│   ├── sitemap.ts
│   ├── robots.ts
│   └── manifest.ts
├── components/
│   ├── homepage/                   # Composants spécifiques à l'accueil (feature 001)
│   │   ├── Hero.tsx
│   │   ├── SolutionsSection.tsx
│   │   ├── AISection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── TrainingsSection.tsx
│   │   ├── ReferencesSection.tsx
│   │   ├── TechMethodSection.tsx
│   │   └── FinalCTA.tsx
│   ├── shared/                     # Réutilisés par toutes les features
│   │   ├── SolutionCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── TrainingCard.tsx
│   │   ├── CTAButton.tsx
│   │   ├── ReassuranceBadges.tsx
│   │   ├── JsonLd.tsx
│   │   └── MatomoTracker.tsx       # no-op si MATOMO_URL non défini
│   ├── layout/
│   │   ├── GlobalHeader.tsx
│   │   └── GlobalFooter.tsx
│   └── ui/                         # Design system (Button, Card, Section, ...)
├── content/                        # CONTENU = source de vérité éditoriale
│   ├── site-settings.json          # singleton : marque, coordonnées, menus, social
│   ├── homepage.mdx                # contenu de l'accueil (titres, intro sections, CTA labels)
│   ├── solutions/
│   │   ├── docupro-suite.mdx
│   │   ├── medicpro.mdx
│   │   ├── cliniquepro.mdx
│   │   ├── immotopia-cloud.mdx
│   │   ├── annonces-web.mdx
│   │   └── ecole-digitale.mdx
│   ├── services/
│   │   ├── developpement-specifique.mdx
│   │   ├── automatisation-ia-processus-metiers.mdx
│   │   ├── assistance-maitrise-ouvrage.mdx
│   │   ├── consultance.mdx
│   │   ├── dematerialisation-archives.mdx
│   │   └── scanners-professionnels.mdx
│   ├── trainings/
│   │   ├── ia-entreprise.mdx
│   │   ├── developpement-web-dotnet-ia.mdx
│   │   ├── automatisation-n8n-processus-ia.mdx
│   │   ├── sql-server.mdx
│   │   ├── ged-archivage.mdx
│   │   └── gestion-projet.mdx
│   └── references/                 # (alimenté plus tard ; vide en MVP feature 001)
├── lib/
│   ├── content.ts                  # Loaders MDX (parse frontmatter, validation Zod)
│   ├── prisma.ts                   # Client Prisma singleton
│   ├── matomo.ts                   # Helper trackEvent (no-op si non configuré)
│   ├── seo.ts                      # Metadata API + JSON-LD helpers
│   ├── mailer.ts                   # Nodemailer transport (notifications leads)
│   └── validators/
│       ├── lead.ts                 # Schéma Zod du formulaire lead
│       └── content.ts              # Schémas Zod des frontmatters MDX
├── styles/globals.css              # Tailwind base + tokens CSS
└── middleware.ts                   # HTTP Basic Auth pour /admin/* + en-têtes sécurité

prisma/
├── schema.prisma                   # 1 seul modèle : Lead
└── migrations/

public/
├── icons/
└── images/                         # Logo, hero, motifs

tests/
├── e2e/
│   ├── homepage.spec.ts            # parcours US1..US7 + axe a11y
│   ├── analytics.spec.ts           # vérifie les 8 événements
│   └── redirects.spec.ts           # CTA → /contact-demo + intention
├── unit/
│   └── components/
└── content/
    └── frontmatter.test.ts         # valide tous les MDX au build

infra/
├── Dockerfile                      # multi-stage Next.js (build → runner Alpine)
├── docker-compose.yml              # web + postgres (matomo OPTIONNEL — séparé)
├── docker-compose.matomo.yml       # à activer si Matomo voulu
└── nginx/                          # OU Caddyfile — reverse proxy + TLS

.github/workflows/
├── ci.yml                          # lint + typecheck + test + lhci (non bloquant MVP)
└── deploy.yml
```

**Structure Decision** :

- **Site corporate Next.js mono-projet**, contenu majoritairement en **MDX** versionné en Git (solutions, services, formations, références, ressources, paramètres globaux du site).
- **Postgres minimal** : une seule table `Lead` pour stocker les soumissions du formulaire `/contact-demo`. Aucun autre modèle Prisma en MVP.
- **Pas de back-office d'édition** en MVP : la rédaction passe par PR sur les fichiers MDX. Cette décision est explicitement *réversible* — un back-office d'édition pourra être ajouté en feature ultérieure si l'équipe éditoriale le requiert. Le PRD CMS-001..005 reste un objectif global du site, mais peut être séquencé après la livraison fonctionnelle.
- **Page `/admin/leads`** : page minimale (liste + export CSV) protégée par HTTP Basic Auth, sans NextAuth, sans modèle User. Optionnelle : si non déployée, l'export se fait via `psql` ou Prisma Studio.
- **Matomo** : chargé conditionnellement par `<MatomoTracker />` ; activable par env var. Non bloquant pour la mise en production.

Cette feature 001 livre la page d'accueil `/` + le squelette technique (composants partagés, loader MDX, formulaire lead minimal pour la route `/contact-demo` à finaliser dans la feature dédiée, JSON-LD, sitemap, robots, Docker) que toutes les features suivantes réutiliseront.

## Complexity Tracking

> Aucune violation détectée. Section vide.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(aucune)* | — | — |
