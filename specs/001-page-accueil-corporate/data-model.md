# Phase 1 — Data Model (révisé)

**Feature**: Page d'accueil corporate Alliance Consultants
**Date**: 2026-04-26 (révisé : recadrage site corporate vitrine — contenu en MDX, base minimale pour les leads).

Ce document décrit **2 catégories** de données :

1. **Schémas de contenu** : frontmatters MDX et `site-settings.json` (source de vérité éditoriale en Git, validés par Zod au build).
2. **Schéma de base de données** : un seul modèle Prisma `Lead`, dédié à la capture du formulaire `/contact-demo`.

Aucun modèle d'authentification, aucun modèle User/Account/Session. La page admin `/admin/leads` est protégée par HTTP Basic Auth via env vars (cf. [research.md](./research.md#d-06)).

---

## 1. Site Settings — `content/site-settings.json`

**Singleton JSON**, source unique des données globales du site (constitution Règles de gouvernance du contenu — coordonnées centralisées).

```json
{
  "brand": {
    "name": "Alliance Consultants",
    "alternateName": "Alliance Computer Consultants",
    "tagline": "Solutions SaaS, IA et transformation digitale pour l'Afrique francophone.",
    "logoUrl": "/images/logo.svg",
    "foundingYear": 2003
  },
  "contact": {
    "email": "contact@allianceconsultants.net",
    "phone": "+225XXXXXXXXXX",
    "whatsapp": "+225XXXXXXXXXX",
    "address": {
      "street": "...",
      "city": "Abidjan",
      "country": "CI"
    }
  },
  "social": {
    "linkedin": "https://...",
    "facebook": "https://...",
    "youtube": null,
    "x": null
  },
  "primaryMenu": [
    { "label": "Accueil", "href": "/" },
    { "label": "Solutions", "href": "/solutions" },
    { "label": "Services", "href": "/services" },
    { "label": "Formations", "href": "/formations" },
    { "label": "Références", "href": "/references" },
    { "label": "Ressources", "href": "/ressources" },
    { "label": "À propos", "href": "/a-propos" },
    { "label": "Contact & Démo", "href": "/contact-demo", "primary": true }
  ],
  "footerMenu": {
    "solutions": [
      { "label": "DocuPro Suite", "href": "/solutions/docupro-suite" },
      { "label": "MedicPro", "href": "/solutions/medicpro" },
      { "label": "CliniquePro", "href": "/solutions/cliniquepro" },
      { "label": "ImmoTopia.cloud", "href": "/solutions/immotopia-cloud" },
      { "label": "Annonces Web", "href": "/solutions/annonces-web" },
      { "label": "École Digitale", "href": "/solutions/ecole-digitale" }
    ],
    "services": [...],
    "formations": [...],
    "ressources": [
      { "label": "Blog", "href": "/ressources" },
      { "label": "FAQ", "href": "/ressources#faq" },
      { "label": "Guides", "href": "/ressources#guides" }
    ],
    "legal": [
      { "label": "Mentions légales", "href": "/mentions-legales" },
      { "label": "Politique de confidentialité", "href": "/confidentialite" }
    ]
  }
}
```

**Validation Zod** (`lib/validators/content.ts`) :

```ts
export const SiteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().min(2),
    alternateName: z.string().optional(),
    tagline: z.string().min(10).max(200),
    logoUrl: z.string().min(1),
    foundingYear: z.number().int().min(1900).max(2100),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\+\d{6,15}$/),    // E.164
    whatsapp: z.string().regex(/^\+\d{6,15}$/).nullable().optional(),
    address: z.object({
      street: z.string().min(2),
      city: z.string().min(2),
      country: z.string().length(2),             // ISO-3166-1 alpha-2
    }),
  }),
  social: z.object({
    linkedin: z.string().url().nullable().optional(),
    facebook: z.string().url().nullable().optional(),
    youtube: z.string().url().nullable().optional(),
    x: z.string().url().nullable().optional(),
  }),
  primaryMenu: z.array(MenuItemSchema).min(1),
  footerMenu: z.record(z.string(), z.array(MenuItemSchema)),
});

export const MenuItemSchema = z.object({
  label: z.string().min(2).max(40),
  href: z.string().min(1),
  primary: z.boolean().optional(),
});
```

---

## 2. Homepage content — `content/homepage.mdx`

Le contenu spécifique de l'accueil (libellés des sections, intros, CTA) est défini dans un MDX dédié pour permettre l'édition sans toucher au code des composants.

```mdx
---
seoTitle: "Alliance Consultants — Solutions SaaS, IA et transformation digitale"
seoDescription: "Éditeur et intégrateur africain de plateformes SaaS, IA et métiers : GED, santé, immobilier, annonces, École Digitale, automatisation des processus."
ogImage: "/images/og-home.png"

hero:
  title: "Solutions SaaS, IA et transformation digitale pour les organisations africaines"
  subtitle: "Alliance Consultants développe des plateformes métiers pour la GED, la santé, l'immobilier, les annonces web, l'automatisation des processus et la formation digitale."
  ctas:
    - label: "Demander une démo"
      intent: "demo"
      primary: true
    - label: "Découvrir nos solutions"
      href: "/solutions"
    - label: "Voir les formations IA"
      intent: "training"
  reassuranceBadges: ["GED", "Santé", "Immobilier", "IA", "Formation", "Automatisation"]

solutionsSection:
  title: "Notre écosystème de solutions SaaS"
  intro: "..."

aiSection:
  title: "Automatisation IA des processus métiers"
  bullets:
    - "Automatisation de tâches répétitives"
    - "Workflows intelligents avec IA et n8n"
    - "Analyse documentaire, extraction, résumé, classification"
    - "Intégration de l'IA dans les applications métier"
    - "Développement de processus métiers automatisés"
  ctaLabel: "Automatiser un processus"

trainingsSection:
  title: "École Digitale — formations IA, dev et automatisation"
  intro: "..."
  modalities: ["Présentiel", "Distanciel", "Intra-entreprise"]

referencesSection:
  title: "Ils nous font confiance"
  history:
    - { year: 2003, label: "Création" }
    - { year: 2006, label: "..." }
    - { year: 2013, label: "..." }
    - { year: 2026, label: "Refonte écosystème" }

techSection:
  title: "Technologies et méthode"
  stack: [".NET / ASP.NET Core", "SQL Server / PostgreSQL / MySQL", "Angular / front-end moderne", "Docker / CI-CD", "IA / LLM", "n8n", "Intégration API"]
  methodSummary: "Approche agile, accompagnement métier de bout en bout."

finalCta:
  title: "Un projet SaaS, GED, immobilier, santé ou IA ? Parlons-en."
  label: "Discuter de votre projet"
---

(Optionnel : corps libre en MDX si le designer veut un texte supplémentaire entre des sections.)
```

**Validation Zod** :

```ts
export const HomepageSchema = z.object({
  seoTitle: z.string().min(10).max(60),         // SC-015
  seoDescription: z.string().min(50).max(160),  // SC-015
  ogImage: z.string().optional(),
  hero: z.object({
    title: z.string().min(10),
    subtitle: z.string().min(20),
    ctas: z.array(CtaSchema).min(1).max(3),     // FR-004
    reassuranceBadges: z.array(z.string()).min(6),  // FR-005
  }),
  solutionsSection: z.object({ title: z.string().min(2), intro: z.string().optional() }),
  aiSection: z.object({
    title: z.string().min(2),
    bullets: z.array(z.string()).min(5),         // FR-021
    ctaLabel: z.string().min(2),
  }),
  trainingsSection: z.object({
    title: z.string(),
    intro: z.string().optional(),
    modalities: z.array(z.string()).length(3),   // FR-041
  }),
  referencesSection: z.object({
    title: z.string(),
    history: z.array(z.object({ year: z.number(), label: z.string() })),
  }),
  techSection: z.object({
    title: z.string(),
    stack: z.array(z.string()).min(3),
    methodSummary: z.string(),
  }),
  finalCta: z.object({
    title: z.string().min(10),
    label: z.string().min(2),
  }),
});

export const CtaSchema = z.object({
  label: z.string().min(2).max(40),
  intent: z.enum(["demo", "contact", "training", "automation", "diagnostic"]).optional(),
  href: z.string().optional(),
  primary: z.boolean().optional(),
}).refine((c) => c.intent || c.href, { message: "CTA must have either intent or href" });
```

---

## 3. Solutions, Services, Trainings, References — frontmatters MDX

Chaque solution / service / formation / référence est un fichier MDX avec frontmatter typé.

### `content/solutions/<slug>.mdx`

```mdx
---
slug: "docupro-suite"
name: "DocuPro Suite"
category: "GED"
shortDescription: "GED, archivage, courriers et workflows documentaires."
mainBenefit: "Centralisez vos documents, fluidifiez vos courriers, automatisez vos workflows."
iconKey: "ged"
homepageOrder: 1
showOnHomepage: true
externalUrl: null

seoTitle: "DocuPro Suite — GED, archivage, courriers, workflows"
seoDescription: "DocuPro Suite, la plateforme GED modulaire d'Alliance Consultants pour les administrations et entreprises africaines."
ogImage: "/images/solutions/docupro-suite-og.png"
---

(Corps : sections détaillées de la page solution dédiée — modules, cas d'usage, FAQ, etc.
 Livré par features ultérieures. La feature 001 n'utilise que le frontmatter pour la carte sur l'accueil.)
```

**Validation Zod** :

```ts
export const SolutionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(60),
  name: z.string().min(2).max(80),
  category: z.string().min(2),
  shortDescription: z.string().min(20).max(220),
  mainBenefit: z.string().min(10).max(160),
  iconKey: z.string().optional(),
  homepageOrder: z.number().int().min(0),
  showOnHomepage: z.boolean(),
  externalUrl: z.string().url().nullable().optional(),
  seoTitle: z.string().min(10).max(60).optional(),
  seoDescription: z.string().min(50).max(160).optional(),
  ogImage: z.string().optional(),
});
```

### `content/services/<slug>.mdx`

```mdx
---
slug: "automatisation-ia-processus-metiers"
title: "Automatisation IA des processus métiers"
shortDescription: "Auditons vos processus, automatisons les tâches répétitives, intégrons l'IA dans vos applications métier."
benefit: "Gagnez du temps, réduisez les erreurs, tracez les opérations."
iconKey: "automation-ai"
homepageOrder: 2
showOnHomepage: true

seoTitle: "Automatisation IA & processus métiers"
seoDescription: "Automatisez vos workflows métier avec IA et n8n. Audit, cartographie, développement et intégration."
---
```

**Validation** : `ServiceSchema` (analogue à `SolutionSchema`).

### `content/trainings/<slug>.mdx`

```mdx
---
slug: "ia-entreprise"
title: "Formation IA pour entreprises"
shortDescription: "..."
category: "IA"
modalities:
  presentiel: true
  distanciel: true
  intra: true
homepageOrder: 1
showOnHomepage: true
---
```

**Validation** : `TrainingSchema`.

### `content/references/<id>.mdx`

```mdx
---
id: "ref-2026-001"
type: "TESTIMONIAL"   # LOGO | TESTIMONIAL | CASE_STUDY
clientName: "..."
sector: "Banque"
logoUrl: "/images/references/...png"
testimonialQuote: "..."
testimonialAuthor: "..."
testimonialRole: "..."
validated: true                 # SC-009 : seuls les validated:true sont rendus
showOnHomepage: false
homepageOrder: 0
---
```

**Validation** : `ReferenceSchema`.

---

## 4. Modèle Prisma — `Lead` (unique modèle)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum LeadIntent {
  DEMO
  CONTACT
  TRAINING
  AUTOMATION
  DIAGNOSTIC
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  ARCHIVED
  SPAM
}

model Lead {
  id              String     @id @default(cuid())
  createdAt       DateTime   @default(now())

  // Intention & origine (transmis par les query params des CTA)
  intent          LeadIntent
  solutionSlug    String?    // si CTA porté par une carte solution
  fromPage        String?    // ex: "/", "/solutions/docupro-suite"
  fromBlock       String?    // ex: "hero", "ai-section", "final-cta"

  // Champs formulaire (FR-081 — déplacé dans la feature /contact-demo,
  // mais le modèle est défini ici pour permettre la livraison conjointe)
  name            String
  email           String
  phone           String
  organization    String
  message         String     @db.Text
  consent         Boolean                            // RGPD — case non pré-cochée

  // Métadonnées techniques (audit, anti-spam)
  userAgent       String?    @db.Text
  ipHash          String?    // sha256(ip + salt) — pas d'IP brute (RGPD)
  honeypot        String?    // si non vide → SPAM

  // Cycle de vie
  status          LeadStatus @default(NEW)
  notes           String?    @db.Text
  contactedAt     DateTime?
  contactedBy     String?

  @@index([createdAt])
  @@index([status])
  @@index([intent])
}
```

**Notes** :
- Aucune autre entité (pas de User/Account/Session/Solution/Service/...).
- `ipHash` au lieu d'IP en clair → RGPD-friendly + utile pour rate limiting / détection abus sans tracer la personne.
- `honeypot` = champ caché côté formulaire ; toute valeur non vide → marqué SPAM automatiquement (FR-082 anti-spam).
- Modèle livré avec cette feature (bootstrap) ; la feature `/contact-demo` consommera ce modèle. La feature 001 n'a besoin que de la migration initiale + du seed.

**Validation Zod du payload entrant** :

```ts
// lib/validators/lead.ts
export const LeadInputSchema = z.object({
  intent: z.enum(["demo", "contact", "training", "automation", "diagnostic"]),
  solutionSlug: z.string().regex(/^[a-z0-9-]+$/).max(60).optional(),
  fromPage: z.string().max(200).optional(),
  fromBlock: z.string().max(60).optional(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(40),
  organization: z.string().min(2).max(160),
  message: z.string().min(10).max(4000),
  consent: z.literal(true),                 // doit être coché explicitement
  honeypot: z.string().max(0).optional(),   // doit rester vide
});
```

---

## 5. Loader de contenu (référence)

```ts
// src/lib/content.ts (Server-only)
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { SolutionSchema, ServiceSchema, TrainingSchema, ReferenceSchema, HomepageSchema, SiteSettingsSchema } from "./validators/content";

const ROOT = path.join(process.cwd(), "content");

export async function getSiteSettings() {
  const raw = await fs.readFile(path.join(ROOT, "site-settings.json"), "utf-8");
  return SiteSettingsSchema.parse(JSON.parse(raw));
}

export async function getHomepage() {
  const raw = await fs.readFile(path.join(ROOT, "homepage.mdx"), "utf-8");
  const { data, content } = matter(raw);
  return { ...HomepageSchema.parse(data), body: content };
}

export async function getSolutions(opts: { homepageOnly?: boolean } = {}) {
  const dir = path.join(ROOT, "solutions");
  const files = await fs.readdir(dir);
  const solutions = await Promise.all(
    files.filter((f) => f.endsWith(".mdx")).map(async (f) => {
      const raw = await fs.readFile(path.join(dir, f), "utf-8");
      const { data } = matter(raw);
      return SolutionSchema.parse(data);
    }),
  );
  let result = solutions.sort((a, b) => a.homepageOrder - b.homepageOrder);
  if (opts.homepageOnly) result = result.filter((s) => s.showOnHomepage);
  return result;
}
// idem getServices, getTrainings, getReferences (filtrant validated === true)
```

---

## 6. Garde-fou anti-template (au build)

Un script de pré-build (`scripts/validate-content.ts`) :

1. Charge tous les fichiers de `/content/**` via les loaders ci-dessus → fail si Zod rejette.
2. Lit le contenu textuel et fait échouer le build si l'une des chaînes interdites apparaît :

```ts
const FORBIDDEN_STRINGS = [
  "Edit Template", "Get Consultation Now", "Lorem ipsum",
  "Institut Froebel", "Submit Form", "Your Name Here",
  "TODO:", "FIXME:",
];
```

→ Couvre FR-116, FR-132, SC-009, SC-010 dès le build (avant déploiement).

---

## 7. Données initiales (seed)

`prisma/seed.ts` insère uniquement :

- **0 lead** (la table doit être vide en prod ; en dev, possibilité de créer des leads de test via l'UI ou Prisma Studio).

Le contenu éditorial (solutions, services, formations) est livré directement comme fichiers MDX dans le repo. Les 6 solutions, 5 services, 6 formations attendus par la spec sont créés en MDX en *placeholder* (titre + description courte minimale + flag `showOnHomepage: false` par défaut, à passer à `true` au cas par cas par l'éditeur après validation).

---

## 8. Mapping vers la spec et la constitution

| Contrainte | Tracé vers |
|---|---|
| `Homepage.hero.ctas` (max 3) | FR-004 |
| `Homepage.hero.reassuranceBadges` (≥ 6) | FR-005 |
| `Solution.showOnHomepage` + `homepageOrder` | FR-010, FR-012, SC-002, SC-003 |
| `Solution.externalUrl` (ImmoTopia) | spec § 4.7, [contracts/urls.md](./contracts/urls.md) |
| `Reference.validated` (filtre rendu) | FR-051, SC-009 |
| `SiteSettings.contact.*` (singleton JSON) | FR-091, FR-092, SC-011 |
| Validation Zod longueurs SEO | FR-100, FR-101, SC-015 |
| Garde-fou anti-template (chaînes interdites) | FR-116, FR-132, SC-009, SC-010 |
| Modèle `Lead` + Zod | FR-080..FR-082 (côté `/contact-demo`), FORM-001..FORM-007 (PRD), SC-013 |
| `Lead.ipHash` + `honeypot` | FR-082 anti-spam, RGPD |

---

## Suppressions vs version précédente du data-model

- `User`, `Account`, `Session`, `VerificationToken` (Auth.js) → **supprimés**, plus de back-office d'édition en MVP.
- `SiteSettings` (Prisma) → **remplacé** par `content/site-settings.json`.
- `Homepage` (Prisma) → **remplacé** par `content/homepage.mdx`.
- `Solution`, `Service`, `Training`, `Reference` (Prisma) → **remplacés** par MDX dans `content/{solutions,services,trainings,references}/*.mdx`.
- Workflow `DRAFT/PUBLISHED` → **supprimé** (la « publication » = merge de la PR sur `main`).

Seul `Lead` reste en Prisma, pour la robustesse de la capture commerciale.
