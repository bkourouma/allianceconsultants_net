# Quickstart — Développement local

**Feature**: 001 — Page d'accueil corporate
**Public** : développeurs rejoignant le projet, ou Claude Code reprenant le travail.

Ce document décrit les étapes pour faire tourner localement la page d'accueil + le back-office admin + Matomo, et pour lancer la suite de tests.

---

## Pré-requis

| Outil | Version | Vérification |
|---|---|---|
| Node.js | ≥ 22 LTS | `node -v` |
| npm (ou pnpm/yarn) | npm ≥ 10 | `npm -v` |
| Docker + Docker Compose | dernière version stable | `docker -v` ; `docker compose version` |
| Git | quelconque récent | `git --version` |

Système d'exploitation : Linux, macOS, Windows (WSL2 recommandé).

---

## 1. Installation

```bash
# Cloner le repo (si pas déjà fait)
git clone <git-url> allianceconsultants_net
cd allianceconsultants_net

# Installer les dépendances Node
npm install

# Copier le fichier d'env
cp .env.example .env.local
```

Éditer `.env.local` et renseigner au minimum :

```bash
# .env.local
DATABASE_URL="postgresql://allcc:allcc@localhost:5432/allcc?schema=public"
NEXTAUTH_SECRET="<générer via: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_MATOMO_URL="http://localhost:8080/"
NEXT_PUBLIC_MATOMO_SITE_ID="1"
ADMIN_BOOTSTRAP_EMAIL="admin@allianceconsultants.local"
ADMIN_BOOTSTRAP_PASSWORD="<mot de passe initial fort, à changer>"
```

---

## 2. Démarrer les services dépendants (Postgres + Matomo)

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

Cela démarre :
- `db` — PostgreSQL 16 sur `localhost:5432`
- `matomo` — Matomo (interface admin) sur `http://localhost:8080`
- `matomo-db` — MariaDB pour Matomo

À la première exécution, ouvrir `http://localhost:8080` et compléter l'installation Matomo (créer un compte admin, déclarer le site `http://localhost:3000`, noter le `siteId` → `1` par défaut).

---

## 3. Initialiser la base et seeder le contenu

```bash
# Appliquer les migrations Prisma
npx prisma migrate dev

# Générer le client Prisma typé
npx prisma generate

# Seeder : crée admin, SiteSettings (placeholder non publiable), Homepage en DRAFT,
# 6 Solutions, 5 Services, 6 Trainings, 0 Reference (toutes en DRAFT)
npx prisma db seed
```

---

## 4. Lancer l'application Next.js en dev

```bash
npm run dev
```

Routes accessibles :
- `http://localhost:3000/` — la page d'accueil → **404** au démarrage (Homepage est en `DRAFT`).
- `http://localhost:3000/admin` — back-office admin → connexion avec les credentials du bootstrap.

### Workflow pour voir la page d'accueil rendue

1. Se connecter à `http://localhost:3000/admin`.
2. Aller dans **Settings**, renseigner les coordonnées et publier.
3. Aller dans **Homepage**, vérifier le contenu, publier.
4. Aller dans **Solutions**, ouvrir chaque solution, vérifier la description, publier.
5. Idem pour **Services** et **Trainings**.
6. Recharger `http://localhost:3000/` → la page d'accueil s'affiche.

À chaque publication, l'ISR de Next.js invalide `/` → le rendu se met à jour en moins de 5 s.

---

## 5. Lancer les tests

### Tests unitaires (Vitest)

```bash
npm run test          # mode watch
npm run test:ci       # une passe, exit code 0/1
```

### Tests E2E (Playwright)

```bash
# Installer les navigateurs Playwright (1ère fois)
npx playwright install --with-deps

# Lancer toute la suite (homepage, redirects, analytics, a11y)
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Une suite ciblée
npx playwright test tests/e2e/homepage.spec.ts
```

Pré-requis E2E : l'app dev tourne (`npm run dev`) **et** Matomo est accessible sur `http://localhost:8080` (les tests `analytics.spec.ts` interceptent les requêtes vers Matomo).

### Audit Lighthouse (CI local)

```bash
npm run lhci          # lance Lighthouse CI sur / et asserte les seuils
```

Seuils par défaut (configurés dans `lighthouserc.json`) :
- Performance ≥ 85 (mobile)
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

---

## 6. Vérifications de conformité avant un commit

```bash
npm run lint          # ESLint + Prettier
npm run typecheck     # tsc --noEmit
npm run test:ci       # Vitest
npm run test:e2e      # Playwright (peut être long)
```

Le pipeline CI rejouera tout cela automatiquement sur la PR (cf. `.github/workflows/ci.yml`).

---

## 7. Tâches admin courantes

### Inviter un nouvel éditeur

```bash
# Via Prisma Studio (interface DB graphique)
npx prisma studio

# OU via un script (à créer dans scripts/create-user.ts)
npx tsx scripts/create-user.ts --email user@example.com --role EDITOR
```

L'utilisateur reçoit ses credentials hors-bande (à noter dans la doc opérationnelle, pas dans le repo).

### Réinitialiser la base de dev

```bash
npx prisma migrate reset --force        # ATTENTION : supprime toutes les données
npx prisma db seed
```

### Inspecter / modifier les données

```bash
npx prisma studio                       # GUI sur http://localhost:5555
```

---

## 8. Troubleshooting

| Symptôme | Cause probable | Action |
|---|---|---|
| `/` répond `404` | `Homepage.status === DRAFT` ou aucun seed | Publier dans `/admin/homepage`, ou rejouer `prisma db seed` |
| Cartes solutions vides | Solutions en `DRAFT` ou `showOnHomepage: false` | Publier les solutions concernées dans `/admin/solutions` |
| Aucun événement Matomo capté en E2E | Matomo non démarré ou mauvais `MATOMO_URL` | `docker compose ps`, vérifier `.env.local` |
| `prisma generate` échoue | Schéma invalide ou DB non joignable | Vérifier `DATABASE_URL`, lancer `prisma migrate dev` |
| Lighthouse perf < 85 en local | Mode dev = pas optimisé ; lancer en mode prod | `npm run build && npm start && npm run lhci` |
| Cookie posé après visite | Tracker non-Matomo introduit par erreur OU Matomo en mode cookie | Auditer DevTools, vérifier `disableCookies()` dans `MatomoTracker` |
| Connexion admin refuse | Bootstrap pas joué OU mauvais mot de passe | `prisma db seed`, ou réinitialiser le mot de passe via `prisma studio` |

---

## 9. Liens utiles

- Spécification fonctionnelle : [spec.md](./spec.md)
- Plan d'implémentation : [plan.md](./plan.md)
- Décisions techniques : [research.md](./research.md)
- Modèle de contenu : [data-model.md](./data-model.md)
- Contrat URL : [contracts/urls.md](./contracts/urls.md)
- Contrat événements Matomo : [contracts/analytics-events.md](./contracts/analytics-events.md)
- Contrat JSON-LD : [contracts/json-ld-organization.md](./contracts/json-ld-organization.md)
- Constitution du projet : [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- PRD complet : [../../docs/PRD_refonte_allianceconsultants.md](../../docs/PRD_refonte_allianceconsultants.md)
