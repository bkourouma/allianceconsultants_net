# Quickstart — Pages détaillées des solutions corporate

**Feature**: 001-pages-corporate-solutions
**Public** : développeur reprenant le projet à froid.
**Hypothèse** : la base Next.js de la feature `001-refonte-site-corporate` (homepage MVP) est déjà en place sur la branche de travail (mergée dans `main` ou rebasée). Aucune nouvelle stack n'est introduite par cette feature.

## 1. Pré-requis

- Node.js 20.x LTS ou supérieur
- pnpm 9.x (ou npm 10.x — `package-lock.json` existant)
- Docker + Docker Compose (pour Postgres en local et déploiement)
- Un compte SMTP de test (Mailtrap, MailHog ou équivalent) pour la phase de développement

## 2. Installation (au premier checkout)

```bash
# À la racine du dépôt
pnpm install                       # (ou: npm install)
docker compose -f infra/docker-compose.yml up -d postgres
pnpm prisma migrate deploy         # applique les migrations existantes (Lead, etc.)
pnpm prisma generate
```

> Aucune nouvelle migration Prisma n'est nécessaire pour cette feature : le modèle `Lead` (déjà présent dans `prisma/schema.prisma`) couvre tous les besoins.

## 3. Variables d'environnement

Copier `.env.example` (s'il existe ; sinon le créer en s'alignant sur la liste ci-dessous) vers `.env.local` non versionné :

```env
# Base
PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://alliance:alliance@localhost:5432/alliance?schema=public

# SMTP (formulaire lead)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<dev_user>
SMTP_PASS=<dev_pass>
LEAD_TO_EMAIL=commercial+dev@allianceconsultants.net
LEAD_FROM_EMAIL=noreply@allianceconsultants.net
LEAD_RATE_LIMIT_PER_10MIN=5

# Admin Basic Auth (déjà existant)
ADMIN_BASIC_USER=admin
ADMIN_BASIC_PASSWORD=<choisir>
```

## 4. Lancement en local

```bash
pnpm dev               # Next.js dev server sur http://localhost:3000
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest (unitaires + contenu)
pnpm test:e2e          # Playwright (smoke + a11y + formulaire)
pnpm validate-content  # tsx scripts/validate-content.ts (frontmatter MDX)
pnpm lhci              # Lighthouse CI sur les pages clés
pnpm build             # Build complet (validate-content + next build)
```

## 5. Vérifier qu'une page solution est conforme

1. Ouvrir `http://localhost:3000/solutions/medicpro`.
2. Vérifier visuellement la présence des 9 (ou 10 si `useCases` non vide) sections dans l'ordre du contrat `page-sections.contract.md`.
3. Soumettre le formulaire en mode JS, puis vérifier (a) la réception de l'e-mail dans Mailtrap, (b) l'apparition d'une ligne dans la table `Lead` :

   ```bash
   pnpm prisma studio   # interface graphique Prisma
   # ou
   psql $DATABASE_URL -c "select id, intent, solutionSlug, name, createdAt from \"Lead\" order by createdAt desc limit 5;"
   ```

4. Désactiver JavaScript dans le navigateur, soumettre à nouveau → la page doit rediriger vers `/contact-recu`.
5. Lancer `pnpm test:e2e -- --grep medicpro` pour valider automatiquement.
6. Lancer un audit Lighthouse mobile sur l'URL : Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95, Best-Practices ≥ 95.

## 6. Ajouter ou modifier le contenu d'une solution

1. Éditer `content/solutions/<slug>.mdx`.
2. Le frontmatter doit respecter le contrat `solution-content.schema.md`. Lancer `pnpm validate-content` pour vérifier ; la build refusera tout écart.
3. Lancer `pnpm test -- solutions-detail.test.ts` pour vérifier les règles d'intégrité (paires sœurs, complétude).
4. Lancer `pnpm dev` et inspecter la page.

## 7. Mettre en production

1. Construire l'image Docker : `docker build -f infra/Dockerfile -t alliance-site .`
2. Configurer les variables d'environnement chez l'hébergeur Docker (jamais en dépôt) — voir `.env.example`.
3. Déployer via `infra/docker-compose.yml` (Next.js + Postgres) et `infra/docker-compose.matomo.yml` (analytics).
4. Vérifier `https://allianceconsultants.net/sitemap.xml` et `https://allianceconsultants.net/robots.txt`.
5. Vérifier qu'un envoi de test parvient à `LEAD_TO_EMAIL` de production et qu'une ligne est créée dans la table `Lead`.
6. Lancer Lighthouse CI en pré-prod : seuils Performance ≥ 85 mobile, Accessibility ≥ 95, SEO ≥ 95, Best-Practices ≥ 95.

## 8. Pannes courantes

| Symptôme | Cause probable | Action |
|---|---|---|
| `pnpm build` échoue avec `validate-content` | Champ obligatoire manquant ou hors limite dans un MDX solution | Lire le message Zod, corriger le frontmatter MDX. |
| Formulaire renvoie 400 systématiquement | `consent` non coché, `phone` < 6 caractères, ou `message` < 10 caractères | Vérifier les contraintes de `LeadInputSchema`. |
| Lead persisté mais aucun e-mail reçu | Mauvais SMTP ou e-mail dans les spams | Vérifier `SMTP_*`, consulter les logs serveur ; le lead reste dans la table `Lead` (statut `NEW`) et peut être retraité manuellement. |
| Lighthouse Performance < 85 | Image non optimisée ajoutée en dur sous `public/` | Passer par `<Image />` Next.js plutôt qu'un `<img>` direct. |
| Test contenu signale `Edit Template` | Texte parasite recopié depuis l'ancien site | Supprimer la chaîne du MDX. |
| `Cannot find module '@/lib/...'` | Mauvais resolver TS | Vérifier `tsconfig.json` (déjà configuré : `"paths": { "@/*": ["./src/*"] }`). |
| Erreur Prisma au démarrage | `pnpm prisma generate` non exécuté | Lancer `pnpm prisma generate`. |

## 9. Liens utiles

- Spec : [spec.md](./spec.md)
- Plan : [plan.md](./plan.md)
- Contrats : [contracts/](./contracts/)
- Constitution : [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- Sources de contenu : [docs/](../../docs/)
- Base Next.js (référence) : feature `001-refonte-site-corporate` (worktree `.claude/worktrees/awesome-einstein-24c708/` ou branche mergée dans `main`).
