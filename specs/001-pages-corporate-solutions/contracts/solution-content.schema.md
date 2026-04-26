# Contract — `SolutionDetail` content schema

**Type**: Zod schema (composition par `extend`) + règles de validation pré-build
**Files**: `src/lib/validators/content.ts` (schéma), `scripts/validate-content.ts` (règles d'intégrité), `src/lib/content.ts` (loader)
**Consumers**: `src/app/solutions/[slug]/page.tsx`, `src/app/sitemap.ts` (déjà), `generateMetadata`, JSON-LD generators, tests Vitest, validate-content.

## Purpose

Garantir que chaque fichier `content/solutions/<slug>.mdx` respecte (a) les exigences de carte homepage déjà actées par `SolutionSchema`, (b) la structure éditoriale détaillée imposée par la constitution (10 blocs des pages solutions) et la spec (FR-003, FR-009, FR-010, FR-011). La build (`pnpm build` qui exécute `tsx scripts/validate-content.ts && next build`) **doit échouer** si un MDX n'est pas conforme.

## Schéma (vue logique, sans code complet)

```
SolutionDetail = SolutionSchema.extend({
  hero: {
    headline: string (10..120)            // rendu en <h1>, unique sur la page
    tagline: string (..200)
    primaryCta: {
      label: string (2..40)
      intent: 'demo' | 'contact' | 'training' | 'automation' | 'diagnostic'
      fromBlock?: string (..60)           // défaut "hero"
    }
    secondaryCta?: {
      label: string (2..40)
      href: string (^https?://|^/)
      intent?: 'demo' | 'contact' | 'training' | 'automation' | 'diagnostic'
    }
    image?: { src: string, alt: string (>=4), width: int, height: int }
  }
  valueProposition: string (60..400)
  targetAudience: Array<{ label: string (..60), description: string (..240) }>   (>=2)
  problemsSolved: Array<string (..240)>                                          (>=3)
  featureGroups: Array<{
    title: string (..80),
    features: Array<{ title: string (..80), description: string (..240) }>       (>=3)
  }>                                                                             (>=1)
  benefits: Array<{
    title: string (..80),
    description: string (..240),
    metric?: string (..40)
  }>                                                                             (>=3)
  useCases?: Array<{ title: string (..80), summary: string (..400) }>
  proof?: {
    logos?: Array<{ name: string, src: string, alt: string (>=4) }>
    stats?: Array<{ value: string, label: string }>
    testimonials?: Array<{ quote: string (10..400), author: string, role?: string, organization?: string }>
  }
  faq: Array<{ question: string (10..200), answer: string (10..1000) }>          (>=3)
  relatedSolutions: Array<{ slug: string (kebab-case), differentiator: string (10..200) }>   (size in {2,3})
  productLink?: { label: string, href: string (^https?://) }
})
```

Les champs hérités de `SolutionSchema` (`slug`, `name`, `category`, `shortDescription`, `mainBenefit`, `iconKey`, `homepageOrder`, `showOnHomepage`, `externalUrl`, `seoTitle`, `seoDescription`, `ogImage`) restent obligatoires comme aujourd'hui — la composition `.extend({...})` ne les altère pas.

`seoTitle` et `seoDescription` (optionnels dans `SolutionSchema`) deviennent **obligatoires** au niveau `SolutionDetail` (contrôle ajouté dans `validate-content.ts` via `.refine`).

## Règles d'intégrité (vérifiées par `scripts/validate-content.ts`)

1. **Unicité du `slug`** dans la collection `content/solutions/`.
2. **Aucun champ texte** ne contient les chaînes suivantes (insensibles à la casse) — la liste `FORBIDDEN_STRINGS` du script existant est étendue avec : `certifié médical`, `agréé MDR`, `conforme CE`, `licence d'agence immobilière`, `agréé OHADA`, en plus des chaînes déjà bloquées (`Edit Template`, `Get Consultation Now`, `Lorem ipsum`, `Institut Froebel`, `Submit Form`, `Your Name Here`, `TODO:`, `FIXME:`).
3. **Aucun `href`** n'est égal à `#`, `javascript:` ou vide.
4. **`relatedSolutions[].slug` ≠ `slug` de la page courante** et doit pointer vers un fichier existant de `content/solutions/`.
5. **Différenciation imposée** :
   - Pour `medicpro`, `relatedSolutions[0].slug === "cliniquepro"`.
   - Pour `cliniquepro`, `relatedSolutions[0].slug === "medicpro"`.
   - Pour `immotopia-cloud`, `relatedSolutions[0].slug === "annonces-web"`.
   - Pour `annonces-web`, `relatedSolutions[0].slug === "immotopia-cloud"`.
6. **`seoTitle`** contient le `name` de la solution (sous-chaîne, insensible à la casse).
7. **Si `proof` absent** ou ses trois listes vides → `useCases.length >= 1`.
8. **Total des `features`** dans toutes les `featureGroups` ≥ 6.
9. **`hero.primaryCta.intent`** est `"demo"` pour toutes les solutions sauf `ecole-digitale` où `"training"` est accepté.
10. **`seoTitle` ≤ 60 caractères**, **`seoDescription` 50..160 caractères** (déjà imposé par `SolutionSchema`, rappel ici).

## Conséquences de violation

- Échec de `tsx scripts/validate-content.ts` (sortie non zéro), donc échec de `pnpm build`.
- Échec du test Vitest `tests/content/solutions-detail.test.ts`.
- Aucune mise en production possible tant que les violations ne sont pas corrigées (gate Constitution Check).

## Loader

Ajouter à `src/lib/content.ts` :

```text
getSolutionDetailBySlug(slug: string): Promise<SolutionDetail & { body: string }>
getAllSolutionDetailSlugs(): Promise<string[]>
```

`getSolutions()` (existant) reste inchangé : il continue de parser avec `SolutionSchema`. La compatibilité descendante est garantie tant que `SolutionDetailSchema = SolutionSchema.extend({...})`.
