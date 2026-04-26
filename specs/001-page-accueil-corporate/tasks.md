# Tasks: Page d'accueil corporate Alliance Consultants

**Input**: Design documents from `specs/001-page-accueil-corporate/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅
**Stack**: Next.js 15 (App Router, RSC) · TypeScript 5.6 · Tailwind CSS 4 · MDX · Zod · Prisma 5 (Lead only) · Matomo (optional) · Docker

> **Note**: `quickstart.md` references a DB-backed admin approach (DRAFT/PUBLISHED model) that was
> superseded by the plan.md revision. The authoritative source for all implementation decisions is
> `plan.md` (revised 2026-04-26). Content lives in MDX files, not in a database-backed CMS.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[USn]**: User story this task belongs to (from spec.md)
- All file paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialise the Next.js project, tooling, Prisma, and CI foundations.

- [x] T001 Initialise Next.js 15 project with TypeScript 5.6 at repo root (`package.json`, `tsconfig.json`, `next.config.ts`, `package-lock.json`)
- [x] T002 [P] Configure Tailwind CSS 4 with PostCSS (`postcss.config.mjs`) and Tailwind base tokens in `src/styles/globals.css`
- [x] T003 [P] Configure ESLint (`next/core-web-vitals`) and Prettier in `.eslintrc.json` and `.prettierrc`
- [x] T004 [P] Create `.env.example` with all required environment variables (`DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MATOMO_URL`, `NEXT_PUBLIC_MATOMO_SITE_ID`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `LEAD_NOTIFY_EMAIL`)
- [x] T005 Set up Prisma 5 with PostgreSQL datasource and `Lead` model (enums `LeadIntent`, `LeadStatus`) in `prisma/schema.prisma`
- [x] T006 Run initial Prisma migration (`prisma/migrations/`) and generate typed client (`npx prisma migrate dev`)
- [x] T007 [P] Create `src/lib/prisma.ts` — Prisma singleton client (dev hot-reload safe)
- [x] T008 [P] Install Vitest + Playwright + `@axe-core/playwright` as dev dependencies; create `vitest.config.ts` and `playwright.config.ts`
- [x] T009 [P] Create `.github/workflows/ci.yml` — lint + typecheck + `validate-content` script + Vitest (non-blocking on Lighthouse for MVP)
- [x] T010 [P] Create `infra/Dockerfile` — multi-stage build (Node 22 builder → Alpine runner) for Next.js standalone output
- [x] T011 [P] Create `infra/docker-compose.yml` — `web` (Next.js) + `db` (PostgreSQL 16) services; create `infra/docker-compose.matomo.yml` (optional Matomo + MariaDB)
- [x] T012 [P] Create `lighthouserc.json` — Lighthouse CI thresholds (Performance ≥ 85 mobile, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95)

**Checkpoint**: Project boots with `npm run dev`; Prisma client generated; CI pipeline scaffolded.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities, content schemas, design system primitives, global layout — required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T013 [P] Create Zod content validators in `src/lib/validators/content.ts` (`MenuItemSchema`, `SiteSettingsSchema`, `CtaSchema`, `HomepageSchema`, `SolutionSchema`, `ServiceSchema`, `TrainingSchema`, `ReferenceSchema`)
- [x] T014 [P] Create Zod lead validator in `src/lib/validators/lead.ts` (`LeadInputSchema` — intent enum, honeypot must be empty, consent must be `true`)
- [x] T015 Create content loaders in `src/lib/content.ts` — server-only: `getSiteSettings`, `getHomepage`, `getSolutions({ homepageOnly? })`, `getServices({ homepageOnly? })`, `getTrainings({ homepageOnly? })`, `getReferences({ validatedOnly: true })`
- [x] T016 [P] Create `scripts/validate-content.ts` — anti-template guard: loads all `content/**` via Zod loaders, then scans text for forbidden strings (`"Edit Template"`, `"Get Consultation Now"`, `"Lorem ipsum"`, `"Institut Froebel"`, `"Submit Form"`, `"TODO:"`, `"FIXME:"`) and exits non-zero on failure (FR-116/FR-132/SC-009)
- [x] T017 [P] Create `content/site-settings.json` — centralised brand, contact (phone, email, WhatsApp, address), social links, `primaryMenu`, `footerMenu` (solutions, services, formations, ressources, legal) — single source of truth for FR-091/FR-092/SC-011
- [x] T018 [P] Create `src/lib/seo.ts` — `generateMetadata(page)` helper (Metadata API) and `buildOrganizationJsonLd()` returning JSON-LD `Organization` object (SC-014/SC-015)
- [x] T019 [P] Create `src/lib/matomo.ts` — `trackEvent(category, action, name?, value?)` no-op helper when `NEXT_PUBLIC_MATOMO_URL` is unset (FR-140)
- [x] T020 [P] Create `src/components/shared/MatomoTracker.tsx` — client component that conditionally loads Matomo script with `disableCookies()` and IP anonymisation enabled (FR-141/SC-017)
- [x] T021 [P] Create UI primitives in `src/components/ui/`: `Button.tsx` (variants: primary/secondary/ghost), `Card.tsx`, `Section.tsx` (paddings, max-width, responsive)
- [x] T022 [P] Create `src/components/shared/CTAButton.tsx` — `<a>` wrapper: accepts `intent` (maps to `?intent=...`) and optional `solutionSlug` (`&solution=...`); always points to `/contact-demo`; fires `trackEvent` on click (FR-080/FR-081/FR-143)
- [x] T023 [P] Create `src/components/shared/JsonLd.tsx` — renders `<script type="application/ld+json">` with the given JSON object (SC-014)
- [x] T024 Create `src/components/layout/GlobalHeader.tsx` — sticky header with `primaryMenu` from `site-settings.json`; mobile hamburger menu; keyboard navigable; focus-visible on all interactive elements (FR-090/FR-113)
- [x] T025 Create `src/components/layout/GlobalFooter.tsx` — `footerMenu` groups from `site-settings.json`; centralized contact info; privacy policy + legal links (FR-091/FR-092/FR-122)
- [x] T026 Create `src/middleware.ts` — HTTP Basic Auth protecting all `/admin/*` routes (credentials from `ADMIN_USER` / `ADMIN_PASSWORD` env vars); global security response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`)
- [x] T027 [P] Create `src/app/robots.ts` (allow all except `/admin/`) and `src/app/sitemap.ts` (static routes; dynamic solution/service/training slugs from `content/`)
- [x] T028 [P] Create `src/app/opengraph-image.tsx` — default OG image with Alliance Consultants branding
- [x] T029 Create root layout `src/app/layout.tsx` — `<html lang="fr">`, `<GlobalHeader>`, `<GlobalFooter>`, `<MatomoTracker>`, Tailwind stylesheet, viewport meta, font loading (FR-110/FR-130)
- [x] T030 Create skeleton `src/app/page.tsx` — `generateMetadata()` wired to `getHomepage()`, `<JsonLd>` with `buildOrganizationJsonLd()`, empty section slots with correct `<main>` / `<section>` semantics (FR-100/SC-014/SC-015)

**Checkpoint**: `npm run dev` shows the global header + footer; all Zod validators and content loaders compile; `validate-content` script runs without error.

---

## Phase 3: User Story 1 — Hero principal (Priority: P1) 🎯 MVP

**Goal**: A first-time B2B visitor can identify Alliance Consultants' multi-solution positioning in under 10 seconds without scrolling.

**Independent Test**: Load only the hero area (above the fold) on desktop and mobile; verify that title, subtitle, ≥1 business CTA, and sector badges are all visible and readable; confirm "Demander une démo" is the dominant CTA.

- [x] T031 [US1] Author hero block in `content/homepage.mdx` — `seoTitle` (≤60 chars), `seoDescription` (≤160 chars), `hero.title` (default: "Solutions SaaS, IA et transformation digitale pour les organisations africaines"), `hero.subtitle`, `hero.ctas` (≤3 — must include `intent: "demo"` as primary), `hero.reassuranceBadges` (≥6: GED, Santé, Immobilier, IA, Formation, Automatisation) — FR-001 through FR-006
- [x] T032 [P] [US1] Create `src/components/shared/ReassuranceBadges.tsx` — renders sector badge chips from an array of labels with optional icon keys (FR-005/SC-001)
- [x] T033 [US1] Create `src/components/homepage/Hero.tsx` — H1 title, subtitle, `CTAButton` components (≤3), `ReassuranceBadges`; mobile-first layout; text ≥ 16 px on mobile; WCAG AA contrast ratio ≥ 4.5:1; `prefers-reduced-motion` respected on any animation (FR-001/FR-110/FR-111/FR-112/FR-115/SC-005)
- [x] T034 [US1] Wire `Hero` into `src/app/page.tsx` — pass `getHomepage()` data to `<Hero>`; confirm `<h1>` is the unique H1 on the page; confirm metadata (title, description, OG, JSON-LD) is generated server-side (FR-100/FR-101/SC-015)
- [x] T035 [US1] Add Matomo scroll-depth tracking in `src/app/page.tsx` (client boundary) — fire distinct events at 25 %, 50 %, 75 %, 100 % scroll depth; ensure no PII is sent (FR-142/FR-144/SC-016)
- [x] T036 [US1] Audit `src/components/homepage/Hero.tsx` — keyboard focus order correct; all `CTAButton` focusable with visible focus ring; aria-label on icon-only elements (FR-113/SC-008)

**Checkpoint**: `npm run dev` → hero visible above the fold on desktop and mobile; JSON-LD in page source; scroll events firing in Matomo console.

---

## Phase 4: User Story 2 — Section solutions SaaS (Priority: P1) 🎯 MVP

**Goal**: All 6 solutions visible from the homepage with equal visual treatment; each card links to its dedicated solution page.

**Independent Test**: Verify 6 distinct `SolutionCard` components are rendered, each with name + short description + main benefit + category + link; verify no card is visually dominant over others.

- [x] T037 [P] [US2] Create `content/solutions/docupro-suite.mdx` — frontmatter: `slug: "docupro-suite"`, `name: "DocuPro Suite"`, `category: "GED"`, `shortDescription` (≤220 chars, GED/archivage/courriers/workflows), `mainBenefit`, `iconKey: "ged"`, `homepageOrder: 1`, `showOnHomepage: true`, `seoTitle`, `seoDescription` (FR-013)
- [x] T038 [P] [US2] Create `content/solutions/medicpro.mdx` — `category: "Santé/Pharmacie"`, gestion réglementaire pharmaceutique (AMM, visas, produits, pays, stocks, reporting), `homepageOrder: 2`
- [x] T039 [P] [US2] Create `content/solutions/cliniquepro.mdx` — `category: "Santé/Clinique"`, gestion clinique ophtalmologique (patients, RDV, consultations, examens, assurances, facturation, caisse), `homepageOrder: 3`
- [x] T040 [P] [US2] Create `content/solutions/immotopia-cloud.mdx` — `category: "Immobilier"`, logiciel immobilier cloud (gestion locative, syndic, promotion, paiements, CRM), `homepageOrder: 4`
- [x] T041 [P] [US2] Create `content/solutions/annonces-web.mdx` — `category: "Annonces"`, portail annonces immobilières (rechercher, publier, mettre en avant des biens), `homepageOrder: 5`
- [x] T042 [P] [US2] Create `content/solutions/ecole-digitale.mdx` — `category: "Formation"`, formations IA, dev logiciel, SQL Server, GED, gestion de projet, automatisation, `homepageOrder: 6`
- [x] T043 [US2] Create `src/components/shared/SolutionCard.tsx` — displays `name`, `shortDescription`, `mainBenefit`, `category` badge, optional icon; `<a href="/solutions/{slug}">` link as CTA; fires `trackEvent("solutions", "card-click", slug)` on click (FR-011/FR-012/SC-002)
- [x] T044 [US2] Create `src/components/homepage/SolutionsSection.tsx` — 6 `SolutionCard` components in a responsive grid; equitable visual sizing (no card exceeding 1.2× the surface of another — SC-003); section title + optional intro from `homepage.mdx` (FR-010/FR-012)
- [x] T045 [US2] Wire `SolutionsSection` into `src/app/page.tsx` — pass `getSolutions({ homepageOnly: true })` (sorted by `homepageOrder`); add H2 section title

**Checkpoint**: 6 solution cards rendered, visually equal; each card navigates to `/solutions/<slug>`; Matomo card-click events fire.

---

## Phase 5: User Story 7 — Bloc CTA final (Priority: P1) 🎯 MVP

**Goal**: Every visitor who reaches the bottom of the page sees a strong call to action directing them to `/contact-demo` with preserved intent.

**Independent Test**: Scroll to page bottom; verify final CTA block with strong title and primary CTA link to `/contact-demo`; verify no form input is present anywhere on the homepage.

- [x] T046 [US7] Author `finalCta` block in `content/homepage.mdx` — `title: "Un projet SaaS, GED, immobilier, santé ou IA ? Parlons-en."`, `label: "Discuter de votre projet"`, `intent: "contact"` (FR-070)
- [x] T047 [US7] Create `src/components/homepage/FinalCTA.tsx` — strong typographic title, `CTAButton` primary (intent `contact`) → `/contact-demo`; fires `trackEvent("conversion", "final-cta-click")` (FR-071/FR-142)
- [x] T048 [US7] Wire `FinalCTA` into `src/app/page.tsx` as last section before footer
- [x] T049 [US7] Audit all `CTAButton` usages across `src/app/page.tsx` and all homepage section components — confirm every business CTA points to `/contact-demo` with correct `?intent=` query param (and `&solution=` where applicable); confirm zero `<input>`, `<textarea>`, or `<form>` elements exist on the page (FR-080/FR-081/FR-082/SC-013)

**Checkpoint**: Full P1 scope complete — Hero + Solutions + FinalCTA assembled; no form on homepage; all CTAs route to `/contact-demo` with intent.

---

## Phase 6: User Story 3 — Section IA & automatisation (Priority: P2)

**Goal**: A visitor interested in AI/automation finds a dedicated section by scrolling (no menu required) and can trigger a "Automatiser un processus" request.

**Independent Test**: Verify AI section is reachable by scroll on both desktop and mobile; section lists ≥5 capabilities; CTA "Automatiser un processus" links to `/contact-demo?intent=automation`.

- [ ] T050 [US3] Author `aiSection` block in `content/homepage.mdx` — `title: "Automatisation IA des processus métiers"`, `bullets` ≥5 (automatisation tâches répétitives, workflows intelligents, analyse documentaire, extraction/résumé/classification, intégration IA métier, développement processus automatisés), `ctaLabel: "Automatiser un processus"` (FR-021)
- [ ] T051 [US3] Create `src/components/homepage/AISection.tsx` — section title, capability bullet list, `CTAButton` "Automatiser un processus" → `/contact-demo?intent=automation`; fires `trackEvent("conversion", "automate-cta-click")` (FR-020/FR-022/SC-004)
- [ ] T052 [US3] Wire `AISection` into `src/app/page.tsx` — position after Solutions section; add H2 section title

**Checkpoint**: AI section visible by scrolling; CTA fires correct Matomo event and routes to `/contact-demo?intent=automation`.

---

## Phase 7: User Story 4 — Section formations (Priority: P2)

**Goal**: A visitor can identify all 6 training themes and trigger either "Voir le catalogue" or "Demander une formation entreprise" from the homepage.

**Independent Test**: Verify 6 training cards present with title + short description + 3 modalities; verify both CTAs visible and routing correctly.

- [ ] T053 [P] [US4] Create `content/trainings/ia-entreprise.mdx` — `slug: "ia-entreprise"`, `title: "Formation IA pour entreprises"`, `category: "IA"`, `modalities: { presentiel: true, distanciel: true, intra: true }`, `homepageOrder: 1`, `showOnHomepage: true`
- [ ] T054 [P] [US4] Create `content/trainings/developpement-web-dotnet-ia.mdx` — `homepageOrder: 2`
- [ ] T055 [P] [US4] Create `content/trainings/automatisation-n8n-processus-ia.mdx` — `homepageOrder: 3`
- [ ] T056 [P] [US4] Create `content/trainings/sql-server.mdx` — `homepageOrder: 4`
- [ ] T057 [P] [US4] Create `content/trainings/ged-archivage.mdx` — `homepageOrder: 5`
- [ ] T058 [P] [US4] Create `content/trainings/gestion-projet.mdx` — `homepageOrder: 6`
- [ ] T059 [US4] Create `src/components/shared/TrainingCard.tsx` — `title`, `shortDescription`, modality badges (Présentiel / Distanciel / Intra-entreprise) from `modalities` object
- [ ] T060 [US4] Create `src/components/homepage/TrainingsSection.tsx` — 6 `TrainingCard` components; 3 modality labels displayed as global info; 2 CTAs: `CTAButton` "Voir le catalogue" → `/formations` (not via CTAButton — direct link), `CTAButton` "Demander une formation entreprise" → `/contact-demo?intent=training` (FR-040/FR-041/FR-042)
- [ ] T061 [US4] Wire `TrainingsSection` into `src/app/page.tsx` — pass `getTrainings({ homepageOnly: true })`
- [ ] T062 [P] [US4] Add Matomo events in `src/components/homepage/TrainingsSection.tsx` — `trackEvent("conversion", "catalogue-cta-click")` and `trackEvent("conversion", "training-cta-click")` (FR-142/SC-016)

**Checkpoint**: 6 training cards rendered; both CTAs functional; Matomo events fired on click.

---

## Phase 8: User Story 5 — Section services experts (Priority: P2)

**Goal**: A visitor can discover all 5 expert services with title, description, benefit, and a link to the dedicated service page.

**Independent Test**: Verify 5 service cards present, each with title + description + benefit + link; verify no service card is missing or duplicated.

- [ ] T063 [P] [US5] Create `content/services/developpement-specifique.mdx` — `slug: "developpement-specifique"`, `title: "Développement spécifique / SaaS métier"`, `shortDescription`, `benefit`, `homepageOrder: 1`, `showOnHomepage: true`
- [ ] T064 [P] [US5] Create `content/services/automatisation-ia-processus-metiers.mdx` — `homepageOrder: 2`
- [ ] T065 [P] [US5] Create `content/services/assistance-maitrise-ouvrage.mdx` — `title: "Assistance à maîtrise d'ouvrage"`, `homepageOrder: 3`
- [ ] T066 [P] [US5] Create `content/services/dematerialisation-archives.mdx` — `title: "Dématérialisation des archives"`, `homepageOrder: 4`
- [ ] T067 [P] [US5] Create `content/services/scanners-professionnels.mdx` — `title: "Vente et intégration de scanners professionnels"`, `homepageOrder: 5`
- [ ] T068 [US5] Create `src/components/shared/ServiceCard.tsx` — `title`, `shortDescription`, `benefit`, `<a href="/services/{slug}">` link; fires `trackEvent("services", "card-click", slug)` on click (FR-031)
- [ ] T069 [US5] Create `src/components/homepage/ServicesSection.tsx` — 5 `ServiceCard` components in responsive grid; section title from `homepage.mdx` (FR-030)
- [ ] T070 [US5] Wire `ServicesSection` into `src/app/page.tsx` — pass `getServices({ homepageOnly: true })`

**Checkpoint**: 5 service cards rendered; each navigates to `/services/<slug>`; Matomo card-click events fire.

---

## Phase 9: User Story 6 — Références & crédibilité (Priority: P3)

**Goal**: A cautious decision-maker can see brand history (2003/2006/2013/2026), validated client logos/metrics (if available), and technical capabilities before converting.

**Independent Test**: Verify history milestones present; verify no placeholder logos or unvalidated metrics; verify tech stack list matches FR-060.

- [ ] T071 [US6] Author `referencesSection` and `techSection` blocks in `content/homepage.mdx` — `referencesSection.history` with 4 milestones (2003 création, 2006, 2013, 2026 refonte écosystème); `techSection.stack` (≥7 items) and `techSection.methodSummary`; leave `logos` and `stats` empty (no placeholder — FR-051/SC-009)
- [ ] T072 [US6] Create `src/components/homepage/ReferencesSection.tsx` — renders history timeline; renders logos only for `validated: true` references (from `getReferences({ validatedOnly: true })`); renders chiffres clés only if non-null and validated; renders zero placeholder elements (FR-050/FR-051/SC-009)
- [ ] T073 [US6] Create `src/components/homepage/TechMethodSection.tsx` — technology badge list from `techSection.stack`; method summary text; no CTA required (FR-060)
- [ ] T074 [US6] Wire `ReferencesSection` and `TechMethodSection` into `src/app/page.tsx`

**Checkpoint**: History milestones visible; no placeholder logos; tech stack listed accurately.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Compliance, accessibility, performance, editorial review, and E2E validation.

- [ ] T075 Run `npx tsx scripts/validate-content.ts` — confirm zero Zod errors and zero forbidden strings across all `content/**` files before any build (FR-116/FR-132/SC-009/SC-010)
- [ ] T076 [P] Audit `src/styles/globals.css` — add `html { scroll-padding-top: <header-height> }` for anchor deep-link offset; add `@media (prefers-reduced-motion: reduce)` suppression for all transitions/animations (FR-115/edge-case deep-links)
- [ ] T077 [P] Verify SEO structure in `src/app/page.tsx` — single H1, `<title>` ≤60 chars, `<meta name="description">` ≤160 chars, H2/H3 hierarchy with no level skip, all solution/service/training links present (FR-100 through FR-105/SC-015)
- [ ] T078 Full editorial review of all MDX content in `content/` — zero English-language CTA, zero template mention, French professional tone throughout, brand names and CTA labels consistent with other pages, coordonnées match `site-settings.json` (SC-009/SC-010/SC-011)
- [ ] T079 [P] Validate JSON-LD `Organization` output from `src/lib/seo.ts` — `name`, `url`, `logo`, `address`, `email`, `telephone`, `sameAs` (social URLs from site-settings.json); test with Google Rich Results Test or equivalent (SC-014)
- [ ] T080 [P] Audit for zero cookies on first visit — run `npm run build && npm start`, open in browser, check DevTools Application → Cookies; confirm no cookie set before any user interaction (SC-017/FR-123)
- [ ] T081 Create Playwright E2E tests in `tests/e2e/homepage.spec.ts` — covers acceptance scenarios for US1 (hero above-the-fold), US2 (6 cards equitable), US3 (AI section reachable by scroll), US4 (2 CTAs), US5 (5 cards), US6 (no placeholder), US7 (final CTA → /contact-demo); includes `@axe-core/playwright` a11y check (SC-008)
- [ ] T082 [P] Create Playwright E2E tests in `tests/e2e/redirects.spec.ts` — for every `CTAButton` on page: verify navigation ends at `/contact-demo`, correct `intent` param present, `solution` param present where applicable; verify zero form inputs on homepage (FR-080/FR-081/SC-013)
- [ ] T083 [P] Create Playwright E2E tests in `tests/e2e/analytics.spec.ts` — intercept XHR to Matomo; verify all events from FR-142 fire (hero CTAs, 6 solution clicks, automation CTA, 2 training CTAs, 5 service clicks, final CTA, scroll-depth 25/50/75/100); verify no PII in event payloads (FR-142/FR-144/SC-016)
- [ ] T084 [P] Create Vitest frontmatter validation test in `tests/content/frontmatter.test.ts` — loads all MDX files in `content/solutions/`, `content/services/`, `content/trainings/`, `content/references/`; asserts each passes the corresponding Zod schema; asserts `showOnHomepage: true` solutions + services + trainings equal expected counts (6/5/6)
- [ ] T085 Run `npm run build && npm run lhci` — verify Lighthouse mobile scores: Performance ≥ 85, CLS ≤ 0.1, LCP ≤ 2.5 s, INP ≤ 200 ms on homepage build output (SC-007/FR-034 in plan Technical Context)
- [ ] T086 [P] Add Lighthouse CI step to `.github/workflows/ci.yml` using `lhci autorun` — configured as **non-blocking** for MVP (comment: `# non-bloquant MVP — bloquant en V2` per plan.md)

**Checkpoint**: All E2E tests pass; zero cookies on first visit; Lighthouse ≥ 85 mobile; zero forbidden strings; editorial review signed off.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 completion — **blocks all user stories**
- **Phases 3–9 (User Stories)**: All require Phase 2 completion; can proceed in priority order P1 → P2 → P3 or in parallel if staffed
  - P1 stories (US1, US2, US7) should ship together as a coherent MVP increment
  - P2 stories (US3, US4, US5) can follow in any order
  - P3 story (US6) can follow P2
- **Phase 10 (Polish)**: Requires all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — no dependency on other stories
- **US2 (P1)**: Start after Phase 2 — no dependency on other stories (parallel with US1)
- **US7 (P1)**: Start after Phase 2 — no dependency on other stories (but logically follows US2 wiring)
- **US3 (P2)**: Start after Phase 2 — no dependency on P1 stories (section is independent)
- **US4 (P2)**: Start after Phase 2 — no dependency on other P2 stories
- **US5 (P2)**: Start after Phase 2 — no dependency on other P2 stories
- **US6 (P3)**: Start after Phase 2 — no dependency on P2 stories

### Within Each User Story

- MDX content files → Zod-validated by loader → consumed by components → wired into page
- Content files [P] can be created in parallel
- Shared components (`SolutionCard`, `ServiceCard`, `TrainingCard`) must exist before section components
- Section components must exist before wiring into `page.tsx`

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run simultaneously
- All Phase 2 tasks marked [P] can run simultaneously
- Within each user story, all MDX file creation tasks marked [P] can run simultaneously
- Once Phase 2 is complete, US1 + US2 can start in parallel (different component trees)
- US3, US4, US5 can all start in parallel after Phase 2

---

## Parallel Example: Phase 4 (Solutions)

```bash
# Create all 6 solution MDX files simultaneously:
Task T037: content/solutions/docupro-suite.mdx
Task T038: content/solutions/medicpro.mdx
Task T039: content/solutions/cliniquepro.mdx
Task T040: content/solutions/immotopia-cloud.mdx
Task T041: content/solutions/annonces-web.mdx
Task T042: content/solutions/ecole-digitale.mdx
# → then T043 (SolutionCard) → T044 (SolutionsSection) → T045 (wire into page.tsx)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Hero principal
4. Complete Phase 4: US2 — Solutions section
5. Complete Phase 5: US7 — Final CTA
6. **STOP and VALIDATE**: All P1 acceptance criteria pass; page ready for stakeholder review
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → project compiles and global layout shows
2. US1 + US2 + US7 (P1) → full above-the-fold + solution hub + conversion floor → **MVP deployable**
3. US3 + US4 + US5 (P2) → IA, formations, services sections → richer page
4. US6 (P3) → credibility section → completes the page
5. Phase 10 Polish → production-ready, fully validated

### Parallel Team Strategy

With multiple contributors after Phase 2:

- **Contributor A**: US1 (Hero) + US7 (FinalCTA)
- **Contributor B**: US2 (Solutions) — 6 MDX files + card + section
- **Contributor C**: US4 (Trainings) + US5 (Services) — content files in parallel
- **Contributor D**: US3 (AI) + US6 (Références)

---

## Notes

- `[P]` tasks touch different files with no shared state — safe to parallelise
- `[USn]` labels map each task to a user story for traceability against spec.md acceptance criteria
- Every content MDX file passes `scripts/validate-content.ts` before committing
- `CTAButton` is the single component responsible for all `/contact-demo` redirections + intent params — never hard-code the destination URL elsewhere
- `content/site-settings.json` is the single source of truth for all contact details — never duplicate in component files
- References/logos/metrics that are not `validated: true` must be omitted, never replaced with placeholders
- Commits after each task or checkpoint; do not batch across user story boundaries
- The `quickstart.md` references a legacy DB-backed admin approach — follow `plan.md` (revised) for the MDX-based architecture instead
