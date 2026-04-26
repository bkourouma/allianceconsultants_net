---

description: "Task list for feature 001-pages-corporate-solutions"
---

# Tasks: Pages détaillées des solutions corporate

**Input**: Design documents from `/specs/001-pages-corporate-solutions/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Tests are part of the deliverable per the contracts (`Tests obligatoires` in each contract file).

**Organization**: Tasks are grouped by user story (US1 P1, US2 P2, US3 P2) per spec.md.

## Format

`- [ ] [TaskID] [P?] [Story?] Description with file path`

- `[P]` = parallelizable (different files, no in-flight dependencies).
- `[US1]/[US2]/[US3]` = user-story label (Setup, Foundational and Polish carry no story label).

## Path Conventions

Mono-projet Next.js App Router à la racine du dépôt :

- Application : `src/app/`, `src/components/`, `src/lib/`
- Contenu : `content/solutions/<slug>.mdx`
- Tests : `tests/unit/`, `tests/content/`, `tests/e2e/`
- Scripts : `scripts/`
- Infra : `prisma/`, `infra/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Mettre la base technique de la feature en place sans rien écrire de produit.

- [x] T001 Vérifier / amener la base Next.js homepage sur la branche courante : merger `001-refonte-site-corporate` dans `001-pages-corporate-solutions` (les fichiers `package.json`, `next.config.ts`, `prisma/schema.prisma`, `src/`, `content/`, `infra/`, `scripts/validate-content.ts`, `tests/` existent ensuite à la racine du dépôt).
- [x] T002 Installer les dépendances (`pnpm install` ou `npm install`) à la racine du dépôt.
- [x] T003 [P] Vérifier que la table `Lead` est en place en local (ou via `prisma migrate deploy`/`prisma migrate dev`) à partir de `prisma/schema.prisma`.
- [x] T004 [P] Étendre `.env.example` à la racine pour documenter `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`, `LEAD_RATE_LIMIT_PER_10MIN` (sans valeurs).
- [x] T005 [P] Étendre `lighthouserc.json` à la racine pour ajouter les six URLs `/solutions/<slug>` et la page index `/solutions` aux assertions Lighthouse (seuils : Performance ≥ 0.85 mobile, Accessibility ≥ 0.95, SEO ≥ 0.95, Best-Practices ≥ 0.95).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schémas, loaders, helpers et endpoints partagés. **Bloque** toutes les user stories.

**⚠️ CRITICAL** : aucun travail US1/US2/US3 ne peut commencer avant la fin de cette phase.

- [x] T006 [P] Étendre `src/lib/validators/content.ts` pour exporter `SolutionDetailSchema = SolutionSchema.extend({...})` et tous les sous-schémas requis par `contracts/solution-content.schema.md` (HeroSchema, TargetAudienceItem, FeatureGroup, Benefit, UseCase, ProofBlock, FaqEntry, RelatedSolution). Exporter aussi le type TS `SolutionDetail`.
- [x] T007 [P] Ajouter dans `src/lib/seo.ts` les trois helpers `buildProductJsonLd(solution, siteUrl)`, `buildFaqJsonLd(faq)`, `buildBreadcrumbJsonLd({ slug, name, siteUrl })` typés depuis les types `SolutionDetail` / `FaqEntry`.
- [x] T008 [P] Créer `src/lib/mailer.ts` (wrapper Nodemailer) qui expose `sendLeadNotification(lead)` lisant `SMTP_*`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` depuis `process.env` ; format de l'e-mail conforme à `contracts/lead-form.contract.md` § « Format de l'e-mail envoyé ».
- [x] T009 [P] Étendre `src/lib/content.ts` avec `getSolutionDetailBySlug(slug)` et `getAllSolutionDetailSlugs()` (lire `content/solutions/*.mdx`, parser via `SolutionDetailSchema`, retourner aussi le `body` MDX). `getSolutions()` reste **inchangé**.
- [x] T010 Étendre `scripts/validate-content.ts` :
  - Étendre `FORBIDDEN_STRINGS` avec `certifié médical`, `agréé MDR`, `conforme CE`, `licence d'agence immobilière`, `agréé OHADA`.
  - Pour chaque MDX de `content/solutions/`, valider avec `SolutionDetailSchema` (en plus du `SolutionSchema` actuel).
  - Implémenter les règles d'intégrité de `contracts/solution-content.schema.md` : paires sœurs (medicpro↔cliniquepro, immotopia-cloud↔annonces-web), `seoTitle` contient `name`, total des `features` ≥ 6, `proof` vide → `useCases.length ≥ 1`, `relatedSolutions[].slug` référence une solution existante et ≠ slug courant, `hero.primaryCta.intent` = `"demo"` sauf `ecole-digitale` qui peut avoir `"training"`.
- [x] T011 [P] Créer `src/app/api/lead/route.ts` (Next.js App Router route handler) conforme à `contracts/lead-form.contract.md` : accepte JSON et `application/x-www-form-urlencoded`, valide via `LeadInputSchema`, applique le honeypot et le rate limit (LRU mémoire 5/10 min/IP), hash IP via bcryptjs, persiste via `prisma.lead.create`, appelle `sendLeadNotification(lead)`, répond JSON ou 302 selon `Content-Type`.
- [x] T012 [P] Créer `src/app/contact-recu/page.tsx` — page de confirmation accessible sans JS (lit `searchParams.ref`, `searchParams.solution`, `searchParams.mail`).
- [x] T013 [P] Créer `src/app/contact-erreur/page.tsx` — page d'erreur accessible sans JS (lit `searchParams.reason` et affiche un message neutre).

**Checkpoint** : foundation prête, US1 / US2 / US3 peuvent démarrer.

---

## Phase 3: User Story 1 — Décideur évalue une solution SaaS verticale (Priority: P1) 🎯 MVP

**Goal** : livrer la **mécanique complète** de la page détail solution + une première solution publiée de bout en bout (DocuPro Suite, solution historique standalone). Les composants livrés ici servent **toutes** les pages détail des US suivantes.

**Independent Test** : un visiteur ouvre `/solutions/docupro-suite`, voit les 9–10 sections dans l'ordre, soumet le formulaire, voit la confirmation et une ligne `Lead` est créée en base + un e-mail est envoyé.

### Composants de section (parallélisables — fichiers distincts)

- [x] T014 [P] [US1] Créer `src/components/solutions/SolutionHero.tsx` (Server Component) : rend `<h1>`, sous-titre, CTA principal vers `#demander-une-demo`, CTA secondaire optionnel, image `<Image>`.
- [x] T015 [P] [US1] Créer `src/components/solutions/ValueProp.tsx`.
- [x] T016 [P] [US1] Créer `src/components/solutions/TargetAudience.tsx`.
- [x] T017 [P] [US1] Créer `src/components/solutions/FeatureGrid.tsx`.
- [x] T018 [P] [US1] Créer `src/components/solutions/BenefitList.tsx`.
- [x] T019 [P] [US1] Créer `src/components/solutions/UseCases.tsx` (rend la section uniquement si `useCases?.length > 0`).
- [x] T020 [P] [US1] Créer `src/components/solutions/ProofBlock.tsx` (logos / stats / témoignages ; fallback `useCases` si `proof` vide).
- [x] T021 [P] [US1] Créer `src/components/solutions/Faq.tsx` (rendu `<details>/<summary>`).
- [x] T022 [P] [US1] Créer `src/components/solutions/RelatedSolutions.tsx` (carte par item avec `differentiator`).
- [x] T023 [P] [US1] Créer `src/components/solutions/LeadFormSection.tsx` (`"use client"`) : react-hook-form + `LeadInputSchema`, hidden inputs `intent`, `solutionSlug`, `fromPage`, `fromBlock`, `honeypot` masqué (`sr-only pointer-events-none`, `tabIndex={-1}`, `aria-hidden`), `<form action="/api/lead" method="post">`, soumission `fetch` JSON si JS actif.

### Routes et page index

- [x] T024 [US1] Créer `src/app/solutions/page.tsx` (Server Component) : page index « Nos solutions », appelle `getSolutions()`, rend une grille de cartes (réutilise/extrait un composant Card depuis `src/components/homepage/`), `<h1>` « Nos solutions », `generateMetadata()` propre.
- [x] T025 [US1] Créer `src/app/solutions/[slug]/page.tsx` (Server Component) :
  - `generateStaticParams()` à partir de `getAllSolutionDetailSlugs()`
  - `generateMetadata({ params })` qui appelle `buildMetadata({...})`
  - Rend les 9–10 sections dans l'ordre canonique (T014–T023)
  - Injecte 3 blocs JSON-LD via `<script type="application/ld+json">`
  - `notFound()` si slug absent

### Contenu MVP (DocuPro Suite)

- [x] T026 [US1] Enrichir `content/solutions/docupro-suite.mdx` avec le frontmatter détaillé (hero, valueProposition, targetAudience, problemsSolved, featureGroups, benefits, useCases, proof, faq, relatedSolutions, productLink) à partir de `docs/PRD_refonte_allianceconsultants.md` (sections DocuPro). `relatedSolutions` cite 2–3 solutions sœurs (ex. `medicpro`, `immotopia-cloud`).
- [x] T027 [P] [US1] Ajouter le visuel hero/og DocuPro Suite sous `public/images/solutions/docupro-suite-hero.{webp,svg}` (placeholder neutre acceptable si l'équipe Alliance n'a pas fourni de visuel ; pas de `lorem ipsum`).

**Checkpoint** : `/solutions/docupro-suite` est livrable de bout en bout (rendu + formulaire + JSON-LD + a11y) et `/solutions` liste les six solutions (les 5 autres pointent vers des pages qui ne s'affichent pas encore correctement tant que leur MDX n'a pas été enrichi — `notFound()` est masqué par le contrôle de schéma).

---

## Phase 4: User Story 2 — Comparaison entre solutions de la même verticale (Priority: P2)

**Goal** : enrichir les 4 pages de paires sœurs (santé : MedicPro / CliniquePro ; immobilier : ImmoTopia.cloud / Annonces Web) avec leur frontmatter détaillé et la règle de différenciation `relatedSolutions[0]` croisée.

**Independent Test** : sur `/solutions/medicpro`, le bloc « Solutions associées » affiche en première position un lien vers `/solutions/cliniquepro` avec une phrase de différenciation visible. Symétrique pour les autres paires.

- [x] T028 [P] [US2] Enrichir `content/solutions/medicpro.mdx` à partir de `docs/FONCTIONNALITES_MEDICPRO.md` ; `relatedSolutions[0].slug === "cliniquepro"`.
- [x] T029 [P] [US2] Enrichir `content/solutions/cliniquepro.mdx` à partir de `docs/FONCTIONNALITES-CLINIQUEPRO.md` ; `relatedSolutions[0].slug === "medicpro"`.
- [x] T030 [P] [US2] Enrichir `content/solutions/immotopia-cloud.mdx` à partir de `docs/immotopia-fonctionnalites.md` ; `relatedSolutions[0].slug === "annonces-web"`.
- [x] T031 [P] [US2] Enrichir `content/solutions/annonces-web.mdx` à partir de `docs/FONCTIONNALITES_ANNONCES_WEB.md` ; `relatedSolutions[0].slug === "immotopia-cloud"`.
- [x] T032 [P] [US2] Visuels hero/og pour `medicpro`, `cliniquepro`, `immotopia-cloud`, `annonces-web` sous `public/images/solutions/`.

**Checkpoint** : les 4 pages de paires sœurs sont livrables, chacune avec sa différenciation explicite.

---

## Phase 5: User Story 3 — Découverte de l'offre formation depuis l'écosystème (Priority: P2)

**Goal** : enrichir la page École Digitale avec son contenu formations et l'`intent` `"training"` par défaut sur le CTA principal.

**Independent Test** : sur `/solutions/ecole-digitale`, au moins 4 catégories de formations sont visibles dans `featureGroups` ou `targetAudience`, le CTA principal est libellé « Demander un programme » (ou équivalent), et la soumission produit un `Lead` avec `intent = TRAINING`.

- [x] T033 [US3] Enrichir `content/solutions/ecole-digitale.mdx` à partir de `docs/FONCTIONNALITES_ECOLDIGITALE.md` ; `hero.primaryCta.intent === "training"`, label CTA orienté inscription / programme. `relatedSolutions` cite au moins 2 solutions de l'écosystème (ex. `docupro-suite`, `medicpro`).
- [x] T034 [P] [US3] Visuel hero/og pour `ecole-digitale` sous `public/images/solutions/`.

**Checkpoint** : `/solutions/ecole-digitale` est livrable et oriente vers une demande de programme.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose** : tests, garde-fous, exécution des vérifications obligatoires.

### Tests unitaires (Vitest)

- [x] T035 [P] Créer `tests/unit/jsonLd.test.ts` : forme attendue de `buildProductJsonLd`, `buildFaqJsonLd`, `buildBreadcrumbJsonLd`.
- [x] T036 [P] Créer `tests/unit/solutionSchema.test.ts` : `SolutionDetailSchema` accepte un payload valide minimal, refuse les payloads incomplets sur chaque champ obligatoire, applique les règles paires sœurs (medicpro↔cliniquepro, immotopia-cloud↔annonces-web).
- [x] T037 [P] Créer `tests/unit/leadRoute.test.ts` : route handler avec mocks Prisma + Nodemailer ; cas valide, honeypot rempli (204 silencieux), `consent: false` (400), rate-limit (429), erreur SMTP (200 + `mailSent: false`).

### Tests de contenu (Vitest)

- [x] T038 Créer `tests/content/solutions-detail.test.ts` : lit les 6 fichiers MDX, applique `SolutionDetailSchema`, vérifie les règles d'intégrité (paires sœurs, complétude, chaînes interdites étendues).

### Tests end-to-end (Playwright)

- [x] T039 [P] Créer `tests/e2e/solution-pages.spec.ts` : pour chacune des 6 URLs, vérifie statut 200, `<h1>` unique, ordre des sections, CTA principal pointant vers `#demander-une-demo`, présence des 3 JSON-LD, absence de violations axe `serious|critical`. Pour MedicPro et CliniquePro : présence du lien vers la solution sœur en première position. Idem pour ImmoTopia.cloud / Annonces Web. Page `/solutions` liste les 6 liens.
- [x] T040 [P] Créer `tests/e2e/lead-form.spec.ts` : soumission valide depuis `/solutions/medicpro` → confirmation visible (mode JS), Prisma a une nouvelle ligne (fixture / setup) ; honeypot rempli → 204 ; sans JS → 302 vers `/contact-recu` ; 6 soumissions consécutives → 429.

### Exécution des vérifications obligatoires

- [x] T041 Exécuter `pnpm validate-content` (ou `npm run validate-content`). Corriger toute violation.
- [x] T042 Exécuter `pnpm lint` (ou `npm run lint`). Corriger toute violation.
- [x] T043 Exécuter `pnpm typecheck` (ou `npm run typecheck`). Corriger toute violation.
- [x] T044 Exécuter `pnpm test:ci` (ou `npm run test:ci`). Corriger toute défaillance.
- [x] T045 Exécuter `pnpm build` (ou `npm run build`). Corriger toute violation.
- [ ] T046 (Best-effort — **non exécuté**) `pnpm test:e2e` nécessite un Postgres + SMTP locaux + dev server lancé. Saut volontaire conforme à la consigne « best-effort ». Les fichiers `tests/e2e/solution-pages.spec.ts` et `tests/e2e/lead-form.spec.ts` sont livrés, à exécuter quand l'environnement est disponible.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** : pas de dépendance interne, mais T001 doit être exécuté en premier (la base Next.js est pré-requis absolu).
- **Phase 2 Foundational** : dépend de Phase 1 ; bloque US1/US2/US3.
- **Phase 3 US1 (P1)** : dépend de Phase 2.
- **Phase 4 US2 (P2)** : dépend de Phase 2 ; **réutilise** les composants livrés par US1 (T014–T025) — ne pas démarrer US2 avant la fin de T025.
- **Phase 5 US3 (P2)** : même règle qu'US2.
- **Phase 6 Polish** : dépend de la fin de US1+US2+US3.

### Within Each User Story

- Composants (T014–T023) en parallèle, puis T024 et T025 (dépendent des composants).
- Le contenu MDX (T026, T028–T031, T033) est parallélisable une fois T006/T010 livrés.

### Parallel Opportunities

- Phase 2 : T006/T007/T008/T009/T011/T012/T013 sont tous parallélisables (fichiers distincts). T010 dépend de T006.
- Phase 3 : tous les composants T014–T023 en parallèle.
- Phase 4 : T028–T032 en parallèle (fichiers distincts).
- Phase 6 : T035–T040 en parallèle.

---

## Implementation Strategy

### MVP (US1 seul)

1. Phase 1 + Phase 2 → foundation prête.
2. Phase 3 → DocuPro Suite livrable.
3. Polish ciblé → tests sur DocuPro + validate-content + build.
4. Démo possible.

### Livraison incrémentale

1. MVP US1 → démo.
2. US2 (4 pages paires sœurs) → démo.
3. US3 (École Digitale) → démo.
4. Polish (tests + lighthouse).

---

## Notes

- `[P]` = fichiers distincts, indépendant des tâches en cours.
- Aucun nouveau package npm ne doit être ajouté ; tout est déjà dans `package.json` existant.
- Aucun nouveau modèle Prisma ; le modèle `Lead` existant est utilisé tel quel.
- Toute décision mineure se réfère aux documents de la feature et à la constitution.
