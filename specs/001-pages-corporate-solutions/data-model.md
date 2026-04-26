# Phase 1 — Data Model

**Feature**: Pages détaillées des solutions corporate
**Date**: 2026-04-26

Le modèle de données combine (a) la **forme typée du contenu MDX** porté par les schémas Zod de `src/lib/validators/content.ts`, (b) le **schéma Prisma `Lead`** déjà défini dans `prisma/schema.prisma` et (c) la **forme du payload formulaire** déjà défini par `LeadInputSchema` dans `src/lib/validators/lead.ts`. Cette feature **étend** les schémas existants sans en réécrire.

## 1. Entité — `Solution` (carte homepage, schéma existant `SolutionSchema`)

**Source** : `src/lib/validators/content.ts` — déjà en place. Cette feature **n'altère pas** ce schéma. Il continue d'être utilisé par la homepage pour les *cards* (`getSolutions()`).

| Champ | Type | Origine | Notes |
|---|---|---|---|
| `slug` | `string` (kebab-case, ≤ 60) | existant | Identifie la solution. |
| `name` | `string` (2..80) | existant | Nom commercial. |
| `category` | `string` (≥ 2) | existant | Texte libre dans la base homepage (ex. « Pharma & Réglementaire » pour MedicPro). Pas d'enum strict. |
| `shortDescription` | `string` (20..220) | existant | Description courte affichée sur la carte. |
| `mainBenefit` | `string` (10..160) | existant | Bénéfice principal. |
| `iconKey` | `string?` | existant | Clé d'icône. |
| `homepageOrder` | `int (≥ 0)` | existant | Ordre d'affichage homepage. |
| `showOnHomepage` | `boolean` | existant | Filtre d'affichage. |
| `externalUrl` | `string (url) ⏐ null?` | existant | Lien sortant éventuel (sous-domaine produit). |
| `seoTitle` | `string (10..60)?` | existant | Title SEO. |
| `seoDescription` | `string (50..160)?` | existant | Meta description. |
| `ogImage` | `string?` | existant | Visuel partage social. |

## 2. Entité — `SolutionDetail` (NEW — étend `SolutionSchema`)

**Source** : nouveau schéma à ajouter dans `src/lib/validators/content.ts` :

```text
SolutionDetailSchema = SolutionSchema.extend({
  hero: HeroSchema,
  valueProposition: string (60..400),
  targetAudience: array(TargetAudienceItem) (>=2),
  problemsSolved: array(string) (>=3),
  featureGroups: array(FeatureGroup) (>=1),
  benefits: array(Benefit) (>=3),
  useCases?: array(UseCase),
  proof?: ProofBlock,
  faq: array(FaqEntry) (>=3),
  relatedSolutions: array(RelatedSolution) (size in {2,3}),
  productLink?: { label: string, href: string (^https?://) }
})
```

Tous les champs ajoutés (sauf `useCases`, `proof`, `productLink`) sont **obligatoires** : un MDX qui ne les fournit pas fait échouer le build via `scripts/validate-content.ts`. Les champs hérités (`slug`, `name`, …) restent obligatoires comme aujourd'hui.

Sous-types (Zod) :

| Sous-type | Champs |
|---|---|
| `HeroSchema` | `headline: string (10..120)` (rendu en `<h1>`), `tagline: string (..200)`, `primaryCta: { label: string (2..40), intent: 'demo'\|'contact'\|'training'\|'automation'\|'diagnostic', fromBlock?: string }`, `secondaryCta?: { label, href, intent? }`, `image?: { src: string, alt: string (>=4), width: int, height: int }` |
| `TargetAudienceItem` | `label: string (..60)`, `description: string (..240)` |
| `FeatureGroup` | `title: string (..80)`, `features: array<{ title: string (..80), description: string (..240) }>` (>=3) |
| `Benefit` | `title: string (..80)`, `description: string (..240)`, `metric?: string (..40)` |
| `UseCase` | `title: string (..80)`, `summary: string (..400)` |
| `ProofBlock` | `logos?: array<{ name, src, alt }>`, `stats?: array<{ value, label }>`, `testimonials?: array<{ quote (10..400), author, role?, organization? }>` |
| `FaqEntry` | `question: string (10..200)`, `answer: string (10..1000)` |
| `RelatedSolution` | `slug: string (kebab-case)`, `differentiator: string (10..200)` |

**Règles d'intégrité (vérifiées par `scripts/validate-content.ts`)** :

1. Tous les `slug` de `relatedSolutions` doivent référencer un fichier de la collection.
2. `relatedSolutions[i].slug` ≠ `slug` de la page courante.
3. Pour `medicpro`, `relatedSolutions[0].slug === "cliniquepro"`. Pour `cliniquepro`, `relatedSolutions[0].slug === "medicpro"`.
4. Pour `immotopia-cloud`, `relatedSolutions[0].slug === "annonces-web"`. Pour `annonces-web`, `relatedSolutions[0].slug === "immotopia-cloud"`.
5. `seoTitle` (déjà optionnel dans `SolutionSchema`) devient **obligatoire** au sens de cette feature : la validation contenu refuse un MDX détail sans `seoTitle` et `seoDescription`.
6. Si `proof` absent ou ses trois listes vides → `useCases` doit contenir ≥ 1 entrée.
7. Total des `features` (toutes `featureGroups` confondus) ≥ 6.
8. Aucun champ texte ne contient les chaînes interdites (liste de `validate-content.ts` à compléter par : `certifié médical`, `conforme CE`, `agréé MDR`, `licence d'agence immobilière`).
9. `hero.primaryCta.intent === "demo"` par défaut pour toutes les solutions sauf École Digitale, où `"training"` est accepté.

**Transitions d'état** : sans objet (contenu statique généré au build).

## 3. Entité — `LeadInput` (formulaire — schéma existant `LeadInputSchema`)

**Source** : `src/lib/validators/lead.ts` — **inchangé**. Cette feature consomme le schéma tel quel, garantissant la cohérence avec la homepage qui l'utilise déjà.

| Champ | Type | Notes |
|---|---|---|
| `intent` | `enum('demo','contact','training','automation','diagnostic')` | Pré-rempli `"demo"` sur les pages solutions (sauf École Digitale → `"training"`). |
| `solutionSlug` | `string (kebab-case ≤ 60)?` | Pré-rempli avec le slug de la page courante. |
| `fromPage` | `string (≤ 200)?` | Pré-rempli avec le pathname (ex. `"/solutions/medicpro"`). |
| `fromBlock` | `string (≤ 60)?` | Identifie le bouton qui a ouvert le formulaire (`"hero"`, `"section-demo"`, `"sticky-cta"`). |
| `name` | `string (2..120)` | **Champ unique**, pas firstName/lastName. |
| `email` | `string (email, ≤ 200)` | Validation RFC. |
| `phone` | `string (6..40)` | Obligatoire. |
| `organization` | `string (2..160)` | |
| `message` | `string (10..4000)` | Obligatoire. |
| `consent` | `literal(true)` | Case non pré-cochée. Refus = 400. |
| `honeypot` | `string (max 0)?` | Doit être vide. Si rempli → 204 silencieux. |

## 4. Entité — `Lead` (Prisma — modèle existant)

**Source** : `prisma/schema.prisma` — **inchangé**. Aucune migration dans cette feature.

| Champ | Type Prisma | Notes |
|---|---|---|
| `id` | `String @id @default(cuid())` | Identifiant. Renvoyé comme `reference` au client. |
| `createdAt` | `DateTime @default(now())` | Indexé. |
| `intent` | `LeadIntent` (enum) | DEMO / CONTACT / TRAINING / AUTOMATION / DIAGNOSTIC. **Mappé depuis `LeadInputSchema.intent` via uppercase**. |
| `solutionSlug` | `String?` | Renseigné depuis l'input. |
| `fromPage` | `String?` | Renseigné depuis l'input. |
| `fromBlock` | `String?` | Renseigné depuis l'input. |
| `name`, `email`, `phone`, `organization`, `message`, `consent` | identiques à l'input | |
| `userAgent` | `String? @db.Text` | Lu depuis le header `User-Agent` côté serveur. |
| `ipHash` | `String?` | Hash bcryptjs (cost 8) de l'IP cliente. **Jamais l'IP en clair.** |
| `honeypot` | `String?` | Stocké pour audit anti-spam si non vide. |
| `status` | `LeadStatus @default(NEW)` | NEW / CONTACTED / QUALIFIED / ARCHIVED / SPAM. La feature crée toujours `NEW`. |
| `notes`, `contactedAt`, `contactedBy` | nullables | Renseignés par le suivi commercial (hors périmètre UI). |

**Règle de mapping** :

```text
LeadInput.intent ('demo','contact','training','automation','diagnostic')
    → Lead.intent (DEMO, CONTACT, TRAINING, AUTOMATION, DIAGNOSTIC)
```

## 5. Entité — `SiteSettings` (existant)

**Source** : `content/site-settings.json`, schéma `SiteSettingsSchema` dans `src/lib/validators/content.ts` — inchangé. Source unique de vérité pour coordonnées, menu, footer (cf. constitution). Les composants de cette feature consomment `getSiteSettings()` uniquement pour le bandeau de coordonnées éventuel et pour `buildOrganizationJsonLd`.

## 6. Vue récapitulative des relations

```
SolutionDetail (1) ──< relatedSolutions >── (2..3) SolutionDetail
SolutionDetail (1) ──< faq >── (n) FaqEntry
SolutionDetail (1) ──< featureGroups >── (n) FeatureGroup ──< features >── (n) Feature
SolutionDetail (1) ──< benefits >── (n) Benefit
SolutionDetail (1) ──< proof >── (1) ProofBlock { logos[], stats[], testimonials[] }

LeadInput  ──valide──>  Lead (table Prisma)
                         │
                         └─ référencé par solutionSlug  →  SolutionDetail (par slug)

SiteSettings (1)  ←── consommé par Header, Footer, LeadFormSection
```

Aucun nouveau modèle Prisma. Aucune nouvelle migration. Le modèle `Lead` existant suffit.
