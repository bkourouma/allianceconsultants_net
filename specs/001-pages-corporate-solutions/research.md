# Phase 0 — Research

**Feature**: Pages détaillées des solutions corporate
**Date**: 2026-04-26

Cette note consolide les choix techniques et éditoriaux pris pour la livraison des six pages solutions. Aucune nouvelle stack n'est introduite : la feature **prolonge** la base Next.js livrée par la feature précédente `001-refonte-site-corporate` (homepage MVP). Aucun marqueur `NEEDS CLARIFICATION` n'a été conservé : toutes les décisions sont prises ou explicitement reportées à une feature ultérieure.

## 1. Framework et architecture

- **Décision** : Next.js 15.3 App Router + React 19 + TypeScript strict, comme dans la base existante. Rendu **statique** (SSG) pour les pages détail via `generateStaticParams()` et `generateMetadata()` ; `output: "standalone"` pour Docker.
- **Justification** : la stack est déjà adoptée et utilisée par la homepage. Re-trancher serait incohérent et imposerait une migration. App Router permet de colocaliser route, composants, métadonnées et JSON-LD ; SSG maximise les scores Lighthouse et le SEO.
- **Alternatives considérées** : aucune ; toute autre option violerait la consigne « ne pas changer la stack sans validation explicite ».

## 2. Styling et design system

- **Décision** : Tailwind CSS 4.1 (déjà en place via `@tailwindcss/postcss`), `clsx` + `tailwind-merge` pour la composition de classes (déjà installés). Réutilisation des primitives `src/components/ui/` (Button, Card, Badge, etc.) et `src/components/shared/`.
- **Justification** : aucune duplication ; cohérence visuelle avec la homepage ; mobile-first par défaut.
- **Alternatives considérées** : aucune (cohérence existant).

## 3. Modèle de contenu

- **Décision** : Markdown / MDX dans `content/solutions/<slug>.mdx` (les six fichiers existent déjà), frontmatter validé par un schéma Zod **étendu** :

  ```text
  SolutionDetailSchema = SolutionSchema.extend({
    hero: { ... },
    valueProposition: string,
    targetAudience: [...],
    problemsSolved: [...],
    featureGroups: [...],
    benefits: [...],
    useCases?: [...],
    proof?: { ... },
    faq: [...],
    relatedSolutions: [...]
  })
  ```

  `SolutionSchema` (existant, utilisé par la homepage pour les *cards*) reste inchangé. Le contenu des MDX gagne les nouveaux champs ; la homepage continue de ne lire que les champs qu'elle connaît.
- **Justification** : composition via `SolutionSchema.extend({...})` = **une seule source de vérité par solution**, **rétro-compatibilité homepage**, **build-time validation** via `scripts/validate-content.ts` (déjà connecté à `package.json:build`). Le corps MDX du fichier reste disponible pour des contenus longs (cas d'usage détaillés, mises en exergue) via `<MDXRemote>` ou import direct.
- **Alternatives considérées** :
  - Deux fichiers par solution (card / detail) : duplication, divergence garantie.
  - Une table PostgreSQL pour le contenu : sur-ingénierie, hors périmètre, casserait l'éditabilité git-based.
  - Schéma autonome `SolutionDetailSchema` non lié à `SolutionSchema` : duplique les champs identitaires.

## 4. Loaders de contenu

- **Décision** : étendre `src/lib/content.ts` avec :
  - `getSolutionDetailBySlug(slug: string): Promise<SolutionDetail & { body: string }>` qui lit le MDX, parse le frontmatter via `SolutionDetailSchema`, retourne aussi le corps MDX.
  - `getAllSolutionDetailSlugs(): Promise<string[]>` (utilisé par `generateStaticParams()`).
  - `getSolutions()` existant **inchangé** (continue de lire le frontmatter avec `SolutionSchema`).
- **Justification** : symétrie avec les loaders existants (`getSiteSettings`, `getHomepage`, `getSolutions`, `getServices`, `getTrainings`, `getReferences`). Pas de nouvelle abstraction.

## 5. Routes Next.js

- **Décision** :
  - `src/app/solutions/page.tsx` — page index « Nos solutions », SSG, liste des six cartes via `getSolutions()` et lien vers `/solutions/<slug>`.
  - `src/app/solutions/[slug]/page.tsx` — page détail, SSG via `generateStaticParams()` qui retourne les six slugs ; `generateMetadata()` qui construit `<title>`/`<meta>` depuis le frontmatter via `buildMetadata()` existant ; rend les sections via les composants de `src/components/solutions/`.
- **Justification** : conventions App Router standard. `sitemap.ts` liste déjà les routes. `robots.ts` les laisse indexables.
- **Alternatives considérées** :
  - **Server Action pour le formulaire** plutôt que route handler : techniquement valable, mais (a) le test e2e d'un Server Action sans JS (fallback dégradé) est plus fragile ; (b) un route handler `POST /api/lead` est explicitement consommable par un `<form action="/api/lead" method="post">` côté HTML pur, garantissant la **soumission sans JS** et donc l'accessibilité totale ; (c) plus simple à mocker en tests unitaires. **Décision : route handler.**

## 6. Formulaire de demande de démo

- **Décision** : composant client `LeadFormSection.tsx` (`"use client"`) utilisant **react-hook-form + `@hookform/resolvers/zod`** (déjà installés) avec `LeadInputSchema` existant (`src/lib/validators/lead.ts`). Soumission `POST /api/lead`. Si JavaScript actif : fetch JSON, message inline. Si JavaScript désactivé : le `<form action="/api/lead" method="post">` standard fonctionne et le route handler redirige vers `/contact-recu` ou `/contact-erreur`.
- **Champs de qualification pré-remplis (FR-006)** : `intent="demo"`, `solutionSlug=<slug courant>`, `fromPage="/solutions/<slug>"`, `fromBlock="hero"` ou `"section-demo"` selon le bouton qui ouvre la modale ou ancre. Tous transmis en champs `<input type="hidden">`.
- **Schéma respecté tel quel** : `name` (champ unique, conforme `LeadInputSchema` existant ; pas de split firstName/lastName), `email`, `phone` (obligatoire), `organization`, `message` (≥ 10 caractères), `consent: true` (case non pré-cochée), `honeypot: ""` (max 0).
- **Anti-spam** : honeypot `honeypot` masqué visuellement (`aria-hidden`, `tabindex="-1"`, hors flux clavier, classe Tailwind `sr-only` + `pointer-events-none`). Pas de captcha visuel pour préserver UX et accessibilité.
- **Justification** : alignement strict avec ce que la homepage prépare (le modèle Prisma `Lead` colle déjà à ce schéma). Pas de divergence de contrat de formulaire entre pages.
- **Alternatives considérées** :
  - **Server Action** : voir §5, écartée pour la robustesse no-JS et la testabilité.
  - **Service tiers (Formspree, etc.)** : interdit par la consigne (souveraineté, secrets externes, pas de persistance maîtrisée).

## 7. Persistance et notification

- **Décision** : le route handler `src/app/api/lead/route.ts` :
  1. Parse le body (JSON ou `application/x-www-form-urlencoded`).
  2. Si `honeypot` non vide → retourne `204` (silencieux pour le bot) ou `302 /contact-recu` (fallback no-JS).
  3. Valide via `LeadInputSchema.parse(body)` ; en cas d'échec, `400` JSON ou `302 /contact-erreur?reason=validation`.
  4. Vérifie le **rate limit** (5 soumissions / 10 min / IP) via une map LRU en mémoire (suffisante pour MVP mono-instance ; documenter qu'un déploiement multi-instance demanderait Redis).
  5. Hash l'IP via `bcryptjs.hash(ip, 8)` → `ipHash`.
  6. `prisma.lead.create({ data: { intent, solutionSlug, fromPage, fromBlock, name, email, phone, organization, message, consent, userAgent, ipHash, honeypot: input.honeypot ?? null, status: "NEW" } })`.
  7. `mailer.sendLeadNotification(lead)` via Nodemailer (variables d'env `SMTP_*`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`). En cas d'échec SMTP, **on ne perd pas le lead** (déjà persisté) ; on log l'erreur et on retourne `200 { ok: true, mailSent: false, reference: lead.id }` côté client (le lead pourra être retraité manuellement).
  8. Réponse `200 { ok: true, reference: lead.id }` (JSON) ou `302 /contact-recu?ref=<id>` (no-JS).
- **Justification** : Prisma + e-mail = double garantie. Le modèle `Lead` existe déjà (champs `status`, `notes`, `contactedAt`, `contactedBy` permettront un retraitement manuel sans nouvelle UI). Pas de queue/worker (sur-ingénierie pour le volume MVP).
- **Alternatives considérées** :
  - E-mail sans persistance : panne SMTP = lead perdu, inacceptable.
  - Stockage seul sans e-mail : aucun déclencheur côté commercial.
  - Queue (Bull/Inngest) : sur-ingénierie pour quelques leads/jour.

## 8. SEO, données structurées et partage social

- **Décision** :
  - `generateMetadata()` par page solution consomme `seoTitle`, `seoDescription`, `ogImage` du frontmatter via `buildMetadata()` existant (étendu si besoin pour `alternates.canonical` propre à la solution).
  - Trois nouveaux helpers dans `src/lib/seo.ts` :
    - `buildProductJsonLd(solution: SolutionDetail, siteUrl: string)` → schema.org `Product` (description, brand=Alliance Consultants, offers optionnel).
    - `buildFaqJsonLd(faq: FaqEntry[])` → schema.org `FAQPage`.
    - `buildBreadcrumbJsonLd(slug: string, name: string, siteUrl: string)` → `BreadcrumbList` (Accueil → Solutions → [Nom]).
  - Injection dans la page via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }}>`.
  - `sitemap.ts` liste déjà les six routes (rien à faire).
- **Justification** : alignement avec la règle SEO constitutionnelle (title, meta, H1 unique, hiérarchie H2/H3, slug propre, données structurées). `buildMetadata()` et `buildOrganizationJsonLd()` existants servent de modèle.
- **Alternatives considérées** : aucune.

## 9. Accessibilité

- **Décision** : tests Playwright + `@axe-core/playwright` (déjà installés) sur chaque `/solutions/<slug>` ; balises sémantiques (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>`, `<a>`) ; `<details>/<summary>` pour la FAQ (accessible clavier sans JS) ; champ honeypot hors flux clavier (`tabindex="-1"`, `aria-hidden`) ; `prefers-reduced-motion` respecté ; alternatives textuelles obligatoires (champ `alt` requis dans le schéma image).
- **Justification** : règle constitutionnelle WCAG 2.1 AA non négociable.
- **Alternatives considérées** : aucune.

## 10. Performance et build

- **Décision** : SSG pour les six pages détail. `<Image>` Next.js (Sharp déjà installé) pour toute image solution sous `public/images/solutions/`. Pas de JS expédié pour les sections de contenu (Server Components par défaut) ; `LeadFormSection` est l'**unique** composant client. `lighthouserc.json` étendu pour cibler `/solutions/{slug}` avec budget Performance ≥ 85 mobile, Accessibility ≥ 95, SEO ≥ 95, Best-Practices ≥ 95.
- **Justification** : aligne sur la cible constitutionnelle Lighthouse mobile ≥ 85.
- **Alternatives considérées** : aucune.

## 11. Hébergement et CI/CD

- **Décision** : aucune modification d'infra. `infra/Dockerfile` (build Next.js standalone), `infra/docker-compose.yml` (Next + Postgres), `infra/docker-compose.matomo.yml` (analytics auto-hébergé), `infra/nginx/` (reverse proxy + HTTPS) restent en place. Variables d'environnement : `DATABASE_URL` (déjà), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`, `LEAD_RATE_LIMIT_PER_10MIN` (5 par défaut), `PUBLIC_SITE_URL`, `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASSWORD`. Pipeline CI : `pnpm typecheck` + `pnpm lint` + `pnpm test:ci` + `pnpm test:e2e` + `pnpm lhci`.
- **Justification** : auto-hébergement Docker était la décision de la feature précédente. À respecter.
- **Alternatives considérées** : aucune.

## 12. Tests et garde-fous

- **Décision** :
  - **Unitaires (Vitest)** :
    - `tests/unit/solutionSchema.test.ts` : `SolutionDetailSchema` accepte un payload valide, refuse les payloads incomplets, applique les règles de paires sœurs (medicpro→cliniquepro et inverse, immotopia-cloud→annonces-web et inverse).
    - `tests/unit/jsonLd.test.ts` : forme attendue de `buildProductJsonLd`, `buildFaqJsonLd`, `buildBreadcrumbJsonLd`.
    - `tests/unit/leadRoute.test.ts` : route handler avec mocks Prisma + Nodemailer ; cas valide, honeypot rempli (204 silencieux), validation échouée (400), rate-limit atteint (429), erreur SMTP (200 + `mailSent: false`).
  - **Contenu (Vitest)** : `tests/content/solutions-detail.test.ts` lit les six fichiers, applique `SolutionDetailSchema`, vérifie que la liste de chaînes interdites de `validate-content.ts` n'apparaît dans aucun champ détaillé, vérifie les paires sœurs et que tous les `relatedSolutions[].slug` existent.
  - **E2E (Playwright)** : `tests/e2e/solution-pages.spec.ts` (smoke + a11y axe sur les six URLs) ; `tests/e2e/lead-form.spec.ts` (soumission valide, honeypot, sans JS, rate limit).
  - **Lighthouse CI** : `lighthouserc.json` étendu pour les six URLs, seuils Performance ≥ 85 mobile, Accessibility ≥ 95, SEO ≥ 95, Best-Practices ≥ 95.
  - **Validate-content** : `scripts/validate-content.ts` étendu pour appeler `SolutionDetailSchema` (en plus de `SolutionSchema`) et appliquer les nouvelles règles d'intégrité (paires sœurs, FAQ ≥ 3, featureGroups total ≥ 6 features, etc.).
- **Justification** : ces garde-fous matérialisent les critères d'acceptation globaux de la constitution et les *Success Criteria* SC-001 à SC-010 du spec. Ils s'intègrent à la chaîne CI existante sans dépendance nouvelle.

## 13. Différenciation des solutions sœurs (FR-009, FR-010)

- **Décision** : chaque page solution déclare en frontmatter une liste `relatedSolutions` ordonnée. Pour `medicpro`, `relatedSolutions[0].slug === "cliniquepro"` (et inverse). Pour `immotopia-cloud`, `relatedSolutions[0].slug === "annonces-web"` (et inverse). Le composant `RelatedSolutions.tsx` rend la liste avec un `<p>` de différenciation explicite par item. `validate-content.ts` rejette toute entrée non conforme à cette règle.
- **Justification** : couvre FR-009 et FR-010 sans logique conditionnelle dans le rendu.
- **Alternatives considérées** : matching implicite par `category` (santé / immobilier) — moins explicite, plus fragile à l'évolution de l'offre.

## 14. Conformité réglementaire (rappel des décisions verrouillées)

- **Décision** : aucune mention médicale ou juridique non documentée dans `docs/`. Les pages MedicPro et CliniquePro ne revendiquent aucune conformité médicale, certification CE/MDR ou usage clinique non explicité dans `docs/FONCTIONNALITES_MEDICPRO.md` et `docs/FONCTIONNALITES-CLINIQUEPRO.md`. Les pages ImmoTopia.cloud et Annonces Web ne revendiquent aucune conformité juridique immobilière au-delà de ce que `docs/immotopia-fonctionnalites.md` et `docs/FONCTIONNALITES_ANNONCES_WEB.md` documentent. Mentions légales standards (footer existant) suffisent au MVP. Le linter de contenu (`validate-content.ts`) refuse l'apparition de chaînes ambiguës (« certifié médical », « conforme CE », « agréé », etc.) sans validation explicite — règle à compléter dans la liste `FORBIDDEN_STRINGS`.
- **Justification** : décision utilisateur explicite, verrouillée dans la spec (section *Assumptions*) et confirmée à la phase plan.

## 15. Internationalisation

- **Décision** : MVP français uniquement. Pas d'`i18n` activé (Next.js App Router). Les libellés UI restent dans les composants ; les contenus restent dans les MDX et `site-settings.json`. Architecture compatible avec une future migration vers `[locale]` segments.
- **Justification** : décision utilisateur explicite ; éviter la sur-ingénierie.

## 16. Source de vérité du contenu

- **Décision** : les six fichiers MDX de `content/solutions/` sont enrichis à partir des fichiers de `docs/` :

  | Solution | Source `docs/` |
  |---|---|
  | DocuPro Suite | `docs/PRD_refonte_allianceconsultants.md` (sections DocuPro) — pas de fiche fonctionnalités dédiée fournie ; rédaction synthétisée à partir du PRD, aucun chiffre inventé. |
  | MedicPro | `docs/FONCTIONNALITES_MEDICPRO.md` |
  | CliniquePro | `docs/FONCTIONNALITES-CLINIQUEPRO.md` |
  | ImmoTopia.cloud | `docs/immotopia-fonctionnalites.md` |
  | Annonces Web | `docs/FONCTIONNALITES_ANNONCES_WEB.md` |
  | École Digitale | `docs/FONCTIONNALITES_ECOLDIGITALE.md` |

- **Justification** : aligne sur la consigne utilisateur ; toute évolution de contenu passe d'abord par `docs/`, puis par mise à jour du frontmatter MDX correspondant.

## 17. Dépendance à la base homepage (signalement)

- **Décision** : cette feature suppose que la branche `001-refonte-site-corporate` (homepage MVP, visible dans le worktree `.claude/worktrees/awesome-einstein-24c708/`) est **mergée dans `main` avant le démarrage de l'implémentation**, ou que la branche `001-pages-corporate-solutions` est rebasée par-dessus. Le plan, les contrats et les tâches référencent des fichiers (`src/lib/content.ts`, `src/lib/validators/content.ts`, `src/lib/seo.ts`, `prisma/schema.prisma`, `infra/Dockerfile`, etc.) qui n'existent pas encore sur `main`.
- **Justification** : explicité ici pour éviter une exécution sans la base nécessaire.
- **Action recommandée avant `/speckit-tasks`** : confirmer le merge de la base homepage (ou la stratégie de rebase).
