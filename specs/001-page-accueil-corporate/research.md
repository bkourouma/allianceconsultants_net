# Phase 0 — Research & Decisions

**Feature**: Page d'accueil corporate Alliance Consultants
**Date**: 2026-04-26 (révisé : recadrage site corporate vitrine, pas plateforme SaaS)
**Statut** : décisions stack et architecture validées par le porteur du projet (« Next.js + React + Tailwind + Postgres + Prisma uniquement si justifié + Docker »).

Toutes les inconnues du *Technical Context* sont résolues ci-dessous. Aucun marqueur `NEEDS CLARIFICATION` ne subsiste.

---

## D-01 — Framework applicatif : Next.js 15 (App Router, RSC)

**Decision** : **Next.js 15** + **App Router** + **React Server Components** + React 19 + TypeScript 5.6 + Node.js 22 LTS.

**Rationale** :
- Stack imposée par le porteur.
- RSC = HTML serveur par défaut, sans hydratation systématique → Lighthouse ≥ 85 mobile et LCP ≤ 2,5 s sans effort sur un site éditorial.
- Metadata API native couvre H1 / title / description / JSON-LD (FR-100..FR-105).
- Server Actions = endpoint `POST /contact-demo` sans construire d'API REST séparée.

**Alternatives considered** :
- **Astro** : meilleur perf brut, mais hors stack imposée.
- **Pages Router (legacy)** : moins de leviers RSC.

---

## D-02 — Modèle de rendu : SSG par défaut, ISR ponctuel

**Decision** : **SSG (Static Site Generation)** au build pour toutes les pages dont le contenu vient des MDX (accueil, solutions, services, formations, références, ressources, à propos). **ISR** (`revalidate`) uniquement si une page consomme des données dynamiques (aucune en MVP). La page d'accueil est rebuildée à chaque déploiement (= chaque PR mergée sur `main`).

**Rationale** :
- Contenu = MDX en Git → un changement = un commit = un build = une mise en prod. Pas de cache à invalider, pas de webhook CMS, pas de file de revalidation.
- HTML statique servi par le reverse proxy (cache long) → LCP < 1 s, INP < 200 ms triviaux.
- Coût serveur quasi nul, uptime ≥ 99,5 % atteint sans infra coûteuse.

**Alternatives considered** :
- **SSR par requête** : surcoût inutile pour du contenu qui change quelques fois par mois.
- **CSR / SPA** : viole « contenus indexables » (FR-103) et Lighthouse mobile.

---

## D-03 — Source de vérité du contenu : fichiers MDX en Git (pas de CMS DB en MVP)

**Decision** : tout le contenu éditorial du site (solutions, services, formations, références, ressources, paramètres globaux du site) vit en **fichiers MDX** dans le dossier `/content/` du repo. Les paramètres globaux (coordonnées, menus, social) vivent dans `/content/site-settings.json`. Versionnement, revue, historique, rollback = Git.

**Workflow éditorial MVP** :
1. L'équipe éditoriale rédige ou édite un MDX (localement, ou via l'éditeur web GitHub/GitLab).
2. PR ouverte avec le diff de contenu.
3. Revue éditoriale et technique en PR (Markdown rendered preview natif sur GitHub).
4. Merge → CI build → déploiement automatique.

**Rationale** :
- Recadrage explicite du porteur : « PostgreSQL/Prisma uniquement si nécessaire pour CMS, formulaires, leads ou contenu administrable ». Le CMS *administrable* peut être différé à une V2 sans bloquer la mise en ligne du site.
- Surface technique minimale : aucune DB, aucun back-office, aucune auth utilisateur, aucun workflow draft/publish à coder.
- Le PRD CMS-001..005 reste un objectif global mais n'est pas un prérequis bloquant pour livrer la feature 001 (l'accueil).
- Permet de livrer un MVP rapide et propre, et d'ajouter un back-office d'édition en feature ultérieure si l'équipe éditoriale le réclame.

**Alternatives considered** :
- **CMS DB + admin Next.js** (plan précédent) : trop lourd pour le MVP — exigeait Auth.js, modèles User/Account/Session, CRUD complets, workflow brouillon/publication. Coût initial disproportionné par rapport à un site qui change peu.
- **Headless CMS SaaS (Sanity, Contentful)** : contradiction avec souveraineté + dépendance externe + abonnement.
- **Strapi/Payload self-host** : ajoute un service à opérer (admin + DB CMS) sans bénéfice tant que l'équipe éditoriale n'a pas besoin d'autonomie immédiate.

**Risques et mitigations** :
- *Risque* : éditeur non-technique sans accès Git → *mitigation* : interface web GitHub/GitLab permet l'édition en ligne ; documentation `quickstart.md` pour l'éditeur dans une feature ultérieure ; back-office d'édition réintroduit si besoin.
- *Risque* : changement de contenu nécessite un déploiement → *mitigation* : pipeline CI/CD < 5 min, suffisant pour un site corporate.

---

## D-04 — Base de données : Postgres + Prisma — uniquement pour les leads

**Decision** : **PostgreSQL 16** + **Prisma 5**, schéma minimal **une seule table `Lead`** (cf. [data-model.md](./data-model.md)). Hébergement : conteneur Docker à côté de l'app web.

**Rationale** :
- Justifié par le besoin métier majeur : ne **pas perdre** un lead capturé via `/contact-demo` (envoyer un email seul est trop fragile : si SMTP tombe, le lead disparaît). Postgres = tampon fiable.
- Permet aussi un export CSV simple pour la prospection commerciale.
- Postgres 16 = mature, open-source, bien outillé Prisma, sauvegardes faciles.

**Alternatives considered** :
- **SQLite** : simple, mais Next.js multi-process en prod ne s'y prête pas bien.
- **Pas de DB du tout (email seulement)** : risque de perte de leads — non acceptable pour l'objectif business.
- **Service externe type Airtable/Notion** : dépendance + souveraineté.

---

## D-05 — Styling : Tailwind CSS 4 + design tokens

**Decision** : **Tailwind CSS 4**. Tokens (couleurs, typographies, espacements) en variables CSS dans `globals.css`. Aucun framework UI lourd.

**Rationale** :
- Stack imposée. Mobile-first par construction. Bundle CSS ~ 25-30 KB. Compatible WCAG AA si tokens validés (contrôlés en CI via axe-core).

**Alternatives considered** : Sass/BEM (verbeux), CSS-in-JS (runtime overhead, conflit RSC).

---

## D-06 — Authentification admin : HTTP Basic Auth (pas d'Auth.js / NextAuth)

**Decision** : la page `/admin/leads` (consultation/export des leads soumis) est protégée par **HTTP Basic Auth** appliquée par `middleware.ts` Next.js. Identifiants : variables d'environnement `ADMIN_BASIC_USER` / `ADMIN_BASIC_PASSWORD_HASH` (hash bcrypt).

**Rationale** :
- Recadrage explicite du porteur : « Auth.js v5 complet si uniquement nécessaire pour un mini back-office » (à éviter), « système d'authentification public » (hors périmètre).
- Site sans utilisateur public, sans inscription, sans session côté visiteur. Un seul (ou très peu) admin pour consulter les leads.
- HTTP Basic Auth = supportée nativement par tous les navigateurs, zéro dépendance ajoutée, zéro modèle User à maintenir.
- Cookie Basic Auth est strictement nécessaire à l'accès admin → ne déclenche pas l'exigence RGPD de bandeau.

**Sécurité** :
- HTTPS obligatoire (sinon mot de passe en clair).
- Hash bcrypt (cost ≥ 12), pas de mot de passe en clair en env.
- Rate limiting basique (en mémoire MVP) sur l'authentification.
- Le périmètre admin est limité à `/admin/*` ; aucun accès à des opérations destructives (juste lecture + export CSV).

**Alternatives considered** :
- **Auth.js v5 + modèles User/Account/Session/VerificationToken** (plan précédent) : disproportionné pour 1-2 admins.
- **OAuth Google interne** : utile si l'équipe a un Google Workspace mais ajoute complexité de configuration et dépendance externe.
- **Pas d'admin du tout, export via `psql`** : viable mais moins ergonomique. Garde possible si l'équipe préfère.

**Évolutivité** : si plus tard un back-office d'édition de contenu est ajouté (V2), on pourra basculer vers Auth.js. Le code MVP n'enferme aucune décision.

---

## D-07 — Validation : Zod côté client ET serveur (formulaire lead + frontmatters MDX)

**Decision** : **Zod** valide :
1. Le formulaire lead `/contact-demo` (côté client via `react-hook-form` + côté serveur dans la Server Action).
2. Les frontmatters MDX (au build, via un script de pré-build qui parse tous les fichiers `/content/**/*.mdx` et `/content/site-settings.json` — fail rapide si un champ requis manque).

**Rationale** : source unique de vérité, types TS générés, garde-fou contre les contenus invalides en prod.

---

## D-08 — Analytique : Matomo auto-hébergé OPTIONNEL via feature flag

**Decision** : composant `<MatomoTracker />` lit `process.env.NEXT_PUBLIC_MATOMO_URL` et `NEXT_PUBLIC_MATOMO_SITE_ID`. Si l'un des deux est absent, le composant ne rend rien (no-op silencieux). Si présents, il injecte le snippet Matomo en mode **sans cookie** (`disableCookies`, `anonymizeIp(2)`).

Helper `lib/matomo.ts.trackEvent(...)` : no-op si Matomo non configuré.

**Rationale** :
- Recadrage : « Matomo en Docker peut rester optionnel, pas bloquant pour le MVP ».
- Permet un MVP sans dépendance opérationnelle Matomo. Activation = simple ajout des 2 variables d'env + démarrage du conteneur Matomo (cf. `infra/docker-compose.matomo.yml`).
- Ré-applique les décisions Q3/Q4 de la session de clarifications (Matomo + sans cookie + pas de bandeau RGPD) **dès que** Matomo est activé.

**Catalogue d'événements MVP réduit à 8 événements** (cf. [contracts/analytics-events.md](./contracts/analytics-events.md)) :
1. Clic CTA « Demander une démo » (toutes sources)
2. Clic carte solution
3. Clic carte service
4. Clic CTA formation (`Voir le catalogue` ou `Demander une formation entreprise`)
5. Clic vers site externe (immotopia.cloud, sous-domaines)
6. Clic WhatsApp
7. Clic téléphone / email (`tel:` / `mailto:`)
8. Soumission formulaire lead

Profondeur de scroll, segmentation fine, événement par solution distinct → différés en V2.

---

## D-09 — Données structurées : JSON-LD `Organization` rendu côté serveur

**Decision** : composant `<OrganizationJsonLd />` (Server) sérialise `<script type="application/ld+json">` dans le `<head>`. Source des données : `content/site-settings.json`.

**Rationale** : FR-105, SC-014. Cf. [contracts/json-ld-organization.md](./contracts/json-ld-organization.md).

---

## D-10 — Notifications email des leads : Nodemailer + SMTP

**Decision** : à chaque soumission lead validée, le serveur :
1. **Persiste** le lead en DB (Postgres `Lead`).
2. **Envoie** un email de notification au(x) destinataire(s) interne(s) (`LEAD_NOTIFY_TO` en env), via Nodemailer + SMTP.

Si l'envoi email échoue, le lead reste persisté en DB (pas de perte). Logs d'échec + retry simple en MVP.

**Provider SMTP** : choix opérationnel non bloquant — Brevo (ex-Sendinblue), Mailgun, Postmark, Mailjet, ou serveur SMTP existant Alliance Consultants. Configuration via 4 variables d'env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).

**Rationale** : couvre PRD FORM-005 (notifications email destinataires internes validés) et FR-130 (génération de leads = priorité business).

---

## D-11 — Hébergement & déploiement : Docker + reverse proxy

**Decision** : packaging Docker multi-stage. `docker-compose.yml` minimal en 2 services :
1. `web` — application Next.js.
2. `db` — PostgreSQL 16.

`docker-compose.matomo.yml` séparé, à activer si Matomo voulu (ajoute `matomo` + `matomo-db`).

Reverse proxy externe (**Caddy** recommandé pour sa simplicité) gère TLS automatique (Let's Encrypt) + redirections HTTP→HTTPS + en-têtes de sécurité (HSTS, CSP, X-Content-Type-Options).

**Rationale** : souveraineté, reproductibilité dev/prod, surface opérationnelle minimale.

---

## D-12 — Monitoring uptime : UptimeRobot (par défaut)

**Decision** : **UptimeRobot** (free tier suffisant pour le MVP). Better Stack en alternative payante.

**Rationale** : FR-137. Configuration à la mise en production.

---

## D-13 — CI/CD : GitHub Actions (ou équivalent)

**Decision** : 2 workflows :
- `ci.yml` (sur PR + push main) : lint (ESLint + Prettier), typecheck (`tsc`), validation des frontmatters MDX, tests unit (Vitest), tests E2E (Playwright + axe-core), Lighthouse CI (**non bloquant en MVP**, bloquant en V2 quand le site sera mature).
- `deploy.yml` (sur merge `main` ou tag) : build image Docker, push registry, déploiement SSH/agent sur VPS.

**Rationale** : prévient les régressions sans bloquer la cadence MVP.

---

## D-14 — Tests : Vitest (unit) + Playwright (E2E + a11y) + LHCI

**Decision** :
- **Vitest** : tests unitaires des composants Server/Client React + helpers (`lib/content.ts`, `lib/matomo.ts`, validators Zod).
- **Playwright** : (a) parcours utilisateur (US1..US7), (b) audit a11y avec `@axe-core/playwright`, (c) vérification émission événements Matomo (interception réseau).
- **Lighthouse CI** : perf ≥ 85, a11y ≥ 95, SEO ≥ 95 (warn-only en MVP).
- **Validation MDX au build** : un script `scripts/validate-content.ts` parse tous les MDX/JSON et applique les schémas Zod ; fail le build si invalide.

**Couverture critique attendue** :
- Tous les CTA business → ciblent `/contact-demo` avec bons query params.
- 6 cartes solutions, 5 cartes services, 6 thématiques formations rendues.
- Aucun cookie posé après visite (si Matomo activé en mode sans cookie ; sinon : aucun cookie tout court).
- axe-core 0 erreur sérieuse sur l'accueil.
- Soumission formulaire valide → ligne créée en DB + email envoyé (mocké en CI).

---

## D-15 — Internationalisation : aucune (mono-langue français MVP)

**Decision** : `<html lang="fr">` codé en dur. Pas de routing i18n, pas de bibliothèque, pas de `hreflang`. Conformément à la session de clarifications Q2.

---

## D-16 — Gestion des images

**Decision** : `next/image` (formats AVIF + WebP générés par Sharp). Logos solutions et image hero stockés dans `public/images/`. Aucun upload utilisateur en MVP.

---

## Récapitulatif des dépendances majeures

| Dépendance | Version cible | Rôle |
|---|---|---|
| `next` | ^15.0 | Framework |
| `react` / `react-dom` | ^19.0 | UI |
| `typescript` | ^5.6 | Typage |
| `tailwindcss` | ^4.0 | Styling |
| `@next/mdx` + `gray-matter` | latest | MDX + frontmatter |
| `@prisma/client` + `prisma` | ^5.20 | ORM (table `Lead` uniquement) |
| `zod` | ^3.23 | Validation |
| `react-hook-form` | ^7.53 | Formulaire lead côté client |
| `nodemailer` | ^6.9 | Notifications email leads |
| `bcryptjs` | ^2.4 | Hash mot de passe Basic Auth admin |
| `vitest` + `@testing-library/react` | latest | Tests unit |
| `@playwright/test` + `@axe-core/playwright` | latest | E2E + a11y |
| `@lhci/cli` | latest | Lighthouse CI |

**Suppressions vs plan précédent** : `next-auth` (Auth.js v5), `@auth/prisma-adapter` — plus nécessaires.

---

## Inconnues résiduelles (non bloquantes pour le développement)

- Choix exact du provider VPS (OVH, Hetzner, Scaleway, Africa Data Centres) — opérationnel.
- Choix exact du provider SMTP — opérationnel, peut être remplacé via env vars.
- Choix exact UptimeRobot vs Better Stack — opérationnel.
- Activation de Matomo dès le MVP ou différé V2 — opérationnel ; le code est prêt dans les deux cas.
- Calendrier d'introduction d'un back-office d'édition (Auth.js + CRUD MDX) — décision produit, non bloquante.

Aucune de ces inconnues ne bloque la livraison de la feature 001.
