# Contract — Page section composition

**Type**: UI rendering contract (Next.js App Router page)
**File**: `src/app/solutions/[slug]/page.tsx` (NEW)
**Components**: `src/components/solutions/*` (NEW), built on `src/components/{ui,shared,layout}/` (existing).
**Consumers**: tests Playwright (`tests/e2e/solution-pages.spec.ts`).

## Purpose

Garantir l'ordre, la présence et le nommage des sections HTML rendues sur chaque page solution, conformément à la constitution (principe IV — cohérence éditoriale) et à FR-003 du spec.

## Conventions Next.js

- La page est un **Server Component** par défaut. Seul `LeadFormSection.tsx` est marqué `"use client"`.
- `generateStaticParams()` retourne les six slugs (issu de `getAllSolutionDetailSlugs()`).
- `generateMetadata({ params })` consomme le frontmatter via `getSolutionDetailBySlug(params.slug)` et appelle `buildMetadata({...})` (existant dans `src/lib/seo.ts`).
- Trois `<script type="application/ld+json">` injectés en tête de `<main>` via :
  - `buildProductJsonLd(solution, siteUrl)`
  - `buildFaqJsonLd(solution.faq)`
  - `buildBreadcrumbJsonLd(solution.slug, solution.name, siteUrl)`
- `<Header>` et `<Footer>` proviennent de `src/components/layout/` (existants) et encadrent `<main>` via le `RootLayout` partagé `src/app/layout.tsx`.

## Ordre canonique des sections

Pour chaque URL `/solutions/<slug>`, l'élément `<main>` doit exposer exactement les sections suivantes, dans cet ordre, identifiées par un attribut `id` stable :

| Ordre | `id` | Composant (`src/components/solutions/`) | Contenu source |
|---|---|---|---|
| 1 | `hero` | `SolutionHero.tsx` | `solution.hero`, `solution.name` |
| 2 | `proposition-de-valeur` | `ValueProp.tsx` | `solution.valueProposition` |
| 3 | `cibles` | `TargetAudience.tsx` | `solution.targetAudience[]` |
| 4 | `fonctionnalites` | `FeatureGrid.tsx` | `solution.featureGroups[]` |
| 5 | `benefices` | `BenefitList.tsx` | `solution.benefits[]` |
| 6 | `cas-usage` *(si non vide)* | `UseCases.tsx` | `solution.useCases[]` |
| 7 | `preuves` | `ProofBlock.tsx` | `solution.proof` (ou fallback `useCases` si proof vide) |
| 8 | `faq` | `Faq.tsx` | `solution.faq[]` |
| 9 | `solutions-associees` | `RelatedSolutions.tsx` | `solution.relatedSolutions[]` |
| 10 | `demander-une-demo` | `LeadFormSection.tsx` (`"use client"`) | formulaire `LeadInputSchema` |

## Règles de rendu

1. Le `<h1>` de la page est rendu **uniquement** dans `SolutionHero.tsx` à partir de `solution.hero.headline`. Aucune autre section n'utilise `<h1>`.
2. Chaque section utilise `<h2>` pour son titre principal. Les sous-titres internes utilisent `<h3>`.
3. Le CTA principal du `Hero` pointe vers `#demander-une-demo` (ancre interne) — il doit rester visible **above the fold** sur viewport mobile 375×667 et desktop 1280×800.
4. `RelatedSolutions` doit afficher au moins le premier élément avec son libellé de différenciation visible (`<p>` après le `<a>`).
5. `ProofBlock` est rendu même si `proof` est absent : il affiche alors un bloc « cas d'usage » dérivé de `useCases` (jamais une section vide).
6. `Faq` est rendu en `<details>/<summary>` (accessible clavier nativement, pas de JS requis).
7. `LeadFormSection` (`"use client"`) :
   - Pré-renseigne via `<input type="hidden">` : `intent` (= `"demo"` ou `"training"` pour École Digitale), `solutionSlug` (= `solution.slug`), `fromPage` (= `usePathname()`), `fromBlock` (= passé en prop par le parent).
   - Champ `honeypot` rendu via `<input type="text" name="honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only pointer-events-none" />`.
   - `<form action="/api/lead" method="post">` natif **+** `onSubmit` JS qui fait `fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })` ; en cas d'absence de JS, le formulaire fonctionne quand même.
8. La page injecte les trois blocs JSON-LD via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }}>`.
9. `<header>` et `<footer>` (de `src/components/layout/`) sont en dehors de `<main>`.
10. Aucune section ne doit afficher de bloc vide ni de texte placeholder ; toute donnée optionnelle absente entraîne le **non-rendu** de la sous-section concernée (et non un libellé « N/A »).

## Page index `/solutions`

- Server Component dans `src/app/solutions/page.tsx`.
- Consomme `getSolutions()` (existant) pour afficher les six cartes (réutilise un composant `SolutionCard.tsx` qui existe probablement dans `src/components/homepage/` — sinon on l'extrait dans `src/components/shared/`).
- `<h1>` : « Nos solutions ». `<h2>` par carte.
- Lien `<Link href="/solutions/<slug>">` sur chaque carte.
- `generateMetadata` : title « Nos solutions — Alliance Consultants », meta description courte.

## Tests obligatoires (`tests/e2e/solution-pages.spec.ts`)

Pour chacune des six URLs `/solutions/{docupro-suite,medicpro,cliniquepro,immotopia-cloud,annonces-web,ecole-digitale}` :

1. La page répond `200`.
2. Le DOM contient **exactement un** `<h1>` et son texte est non vide.
3. Les sections d'`id` `hero`, `proposition-de-valeur`, `cibles`, `fonctionnalites`, `benefices`, `preuves`, `faq`, `solutions-associees`, `demander-une-demo` sont présentes, dans cet ordre.
4. Un `<a>` ou `<button>` libellé du CTA principal pointe vers `#demander-une-demo` et est visible sur viewport 375×667 sans défilement.
5. Trois scripts `<script type="application/ld+json">` contiennent respectivement un objet `@type: "Product"`, `@type: "FAQPage"`, `@type: "BreadcrumbList"`.
6. `axe-core` ne signale aucune violation `serious` ou `critical`.
7. Pour MedicPro : la section `solutions-associees` contient un lien vers `/solutions/cliniquepro` en première position. Symétrique pour les paires (medicpro/cliniquepro) et (immotopia-cloud/annonces-web).
8. Le formulaire contient les hidden inputs `intent`, `solutionSlug`, `fromPage` correctement pré-remplis.

Pour la page index `/solutions` :

9. La page répond `200` et contient les six liens vers `/solutions/<slug>`.
