# Prompt CI/CD — réplication du pipeline sur une nouvelle application

Ce document contient un **prompt générique** prêt à coller dans **Claude Code**,
à la racine du repo d'une nouvelle application, pour répliquer le pipeline
CI/CD utilisé par `allianceconsultants.net` et déployer sur le **même serveur
partagé**.

L'architecture cible est mutualisée : un seul serveur, un nginx hôte qui
termine TLS pour tous les domaines, et chaque app tourne en Docker Compose
isolé derrière un port loopback unique.

---

## 1. Variables à choisir avant de coller le prompt

Renseigne ces 5 valeurs, puis fais un **chercher/remplacer** dans le prompt
ci-dessous avant de le coller dans Claude Code.

| Placeholder            | Description                                                            | Exemple                                  |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| `<DOMAIN>`             | Domaine public de l'app (sous-domaine de `allianceconsultants.net`)    | `ai-masterclass.allianceconsultants.net` |
| `<SLUG>`               | Slug court (label runner, préfixe conteneurs, nom image, deploy path)  | `ai-masterclass`                         |
| `<LOOPBACK_PORT>`      | Port loopback hôte libre (5 chiffres possibles, voir registre ci-bas)  | `3701`                                   |
| `<GH_USER_OR_ORG>`     | Utilisateur ou organisation GitHub propriétaire du repo                | `bkourouma`                              |
| `<GH_REPO>`            | Nom du repo GitHub de la nouvelle app                                  | `ai-masterclass`                         |

### Registre des ports loopback déjà attribués sur le serveur

> **Mets à jour ce tableau à chaque nouvelle app déployée.**

| Port  | App                            | Domaine                                  |
| ----- | ------------------------------ | ---------------------------------------- |
| 3700  | allianceconsultants-net        | allianceconsultants.net                  |
| _3701_ | _libre — prochain à utiliser_  | —                                        |
| _3702_ | _libre_                        | —                                        |

---

## 2. Prompt à coller dans Claude Code (repo de la nouvelle app)

> Mets en place le même pipeline CI/CD que l'application existante
> `allianceconsultants-net` pour déployer ce repo sur le serveur partagé,
> derrière le domaine **`<DOMAIN>`**. Procède de bout en bout : analyse mon
> repo, génère tous les fichiers nécessaires, puis liste précisément ce que je
> dois faire côté serveur et côté GitHub.
>
> ### Architecture cible (mutualisée sur un serveur partagé)
>
> - **Build & push** d'une image Docker vers **GHCR** (registry privé) sur
>   chaque push `main`.
> - **Déploiement** sur un **GitHub Actions self-hosted runner** déjà installé
>   sur le serveur (Linux/x64), avec un label dédié par app.
> - L'app tourne en **Docker Compose** isolé : conteneur applicatif + Postgres
>   (si nécessaire) + nginx interne.
> - Le **nginx interne** du compose bind uniquement sur la **loopback**
>   `127.0.0.1:<LOOPBACK_PORT>:80`.
> - Le **nginx de l'hôte** (déjà installé) termine TLS (Let's Encrypt) pour
>   `<DOMAIN>` et fait un `proxy_pass` vers `http://127.0.0.1:<LOOPBACK_PORT>`.
> - **Conventions de nommage à respecter** :
>   - Port loopback hôte = **`<LOOPBACK_PORT>`** (unique par app, ne pas
>     réutiliser un port déjà pris par une autre app du serveur).
>   - Labels du runner self-hosted : `[self-hosted, linux, x64, <SLUG>]`.
>   - Préfixe des conteneurs : `<SLUG>-web`, `<SLUG>-db`, `<SLUG>-nginx`.
>   - Chemin de déploiement sur le serveur : `/home/deployer/apps/<SLUG>`.
>   - Image GHCR : `ghcr.io/<GH_USER_OR_ORG>/<GH_REPO>:latest` et
>     `:${{ github.sha }}`.
>
> ### Ce que tu dois générer dans le repo
>
> 1. **`infra/Dockerfile`** — multi-stage Node/Next.js standalone (à adapter
>    si autre stack, voir plus bas) :
>    - `node:22-alpine` ; `npm ci --legacy-peer-deps`.
>    - Toutes les vars publiques `NEXT_PUBLIC_*` passées en **ARG** puis ENV
>      (Next inline au build → obligatoirement ARGs, pas des ENV runtime).
>    - Si Prisma : `npx prisma generate` avant `npm run build`.
>    - Build : `npm run build` (Next standalone output).
>    - Stage runner : installe `openssl` + `libc6-compat` (Prisma sur Alpine),
>      user non-root `app:app` (uid/gid 1001).
>    - Copie `public/`, `.next/standalone`, `.next/static`, `prisma/` (si
>      Prisma), et **explicitement** `node_modules/bcryptjs` si présent (le
>      tracer de Next l'oublie).
>    - `EXPOSE 3000` ; `CMD ["node", "server.js"]`.
> 2. **`docker-compose.prod.yml`** à la racine — `web` (image GHCR) + `db`
>    (postgres:16-alpine, seulement si Postgres utilisé) + `nginx`
>    (nginx:alpine, ports `"127.0.0.1:<LOOPBACK_PORT>:80"`). `web` lit
>    `.env.production` via `env_file`. `db` healthcheck `pg_isready`.
>    Tous les services ont `restart: unless-stopped` et un `container_name`
>    préfixé par `<SLUG>-`.
> 3. **`docker/nginx/nginx.conf`** — upstream `web:3000`,
>    `server_name <DOMAIN> _;`, cache long sur `/_next/static/`, forward des
>    headers `X-Forwarded-*` (Host, IP, Proto), support `Upgrade/Connection`
>    pour WebSocket, `client_max_body_size 25m`.
> 4. **`.github/workflows/ci.yml`** — sur `push` (`main`, `claude/**`) et
>    `pull_request` (`main`) : Node 22, `npm ci --legacy-peer-deps`, typecheck,
>    lint, tests, build (`npx next build` avec `SKIP_DB_PUSH=true` si Prisma
>    est utilisé au build).
> 5. **`.github/workflows/deploy.yml`** — deux jobs :
>    - **`build`** (ubuntu-latest) : `docker/login-action` GHCR
>      (`secrets.GITHUB_TOKEN`), build avec `--build-arg` pour chaque
>      `NEXT_PUBLIC_*` (tirés de `secrets`), push `:latest` et
>      `:${{ github.sha }}`.
>    - **`deploy`** (runs-on `[self-hosted, linux, x64, <SLUG>]`,
>      `needs: [build]`) :
>      - **Refaire un `docker/login-action` GHCR** dans ce job aussi — sinon
>        le `docker pull` échoue silencieusement et l'ancienne image est
>        redéployée.
>      - Copier `docker-compose.prod.yml` + `docker/nginx/nginx.conf` dans
>        `$DEPLOY_PATH`.
>      - `docker pull` de l'image `:latest`.
>      - `docker compose --env-file .env.production -f docker-compose.prod.yml up -d`.
>      - Attendre 15 s.
>      - Si Prisma :
>        `docker exec <SLUG>-web npx -y prisma@5.22.0 db push --skip-generate --accept-data-loss || true`.
>        **Pin `prisma@5.22.0`** — sinon `npx prisma` résout en v7+ et casse
>        contre `@prisma/client@5.x`.
>      - `docker image prune -f`.
> 6. **`.env.example`** — lister toutes les vars d'env runtime de l'app
>    (DATABASE_URL, AUTH_SECRET, etc.) avec des valeurs placeholders.
>
> ### Adaptations à faire en lisant mon repo
>
> - Si l'app **n'utilise pas Prisma**, supprime `prisma generate`, la copie de
>   `prisma/`, et l'étape `db push` du deploy.
> - Si l'app **n'utilise pas Postgres**, supprime le service `db` du compose
>   et les vars POSTGRES_*.
> - Si l'app **n'est pas Next.js**, adapte le Dockerfile au framework détecté
>   tout en gardant : multi-stage, user non-root, image finale alpine, expose
>   un port unique, et le compose qui mappe ce port via le nginx interne sur
>   `127.0.0.1:<LOOPBACK_PORT>`.
> - Adapte la liste des `NEXT_PUBLIC_*` aux variables réellement référencées
>   dans le code (sinon retire complètement les ARGs publics du Dockerfile et
>   du workflow).
>
> ### À me lister à la fin (instructions opérateur)
>
> 1. **GitHub secrets** à créer sur le repo : `NEXT_PUBLIC_*` (un par var
>    publique build-time), et tout autre secret référencé dans le workflow.
> 2. **GHCR** : confirmer que le package devra être lié au repo et accessible
>    en pull au runner (le login dans deploy est déjà prévu).
> 3. **Self-hosted runner** : commande à exécuter sur le serveur pour ajouter
>    un runner avec le label `<SLUG>` :
>    `./config.sh --url … --token … --labels <SLUG> --name <SLUG>-runner`.
> 4. **Côté serveur** :
>    - Créer `/home/deployer/apps/<SLUG>` + sous-dossier `docker/nginx`.
>    - Y déposer `.env.production` (lister les vars attendues).
>    - Ajouter le vhost nginx hôte pour `<DOMAIN>` qui
>      `proxy_pass http://127.0.0.1:<LOOPBACK_PORT>;` avec
>      `proxy_set_header Host $host;` et les `X-Forwarded-*`.
>    - Émettre le certificat Let's Encrypt
>      (`certbot --nginx -d <DOMAIN>`).
>    - Créer l'enregistrement DNS A `<sous-domaine>` → IP du serveur.
> 5. Le premier déploiement se déclenche par un `git push` sur `main` (ou via
>    `workflow_dispatch`).
>
> Pose-moi des questions seulement si tu ne peux pas inférer le framework / la
> stack du repo. Sinon, génère tout, puis affiche la check-list opérateur.

---

## 3. Check-list rapide après exécution du prompt

Trois actions manuelles côté serveur restent à faire :

1. Enregistrer un nouveau **runner self-hosted** avec le label `<SLUG>`.
2. Créer le **vhost nginx hôte** + cert TLS Let's Encrypt pour `<DOMAIN>`.
3. Déposer **`.env.production`** dans `/home/deployer/apps/<SLUG>/`.

Ensuite : `git push origin main` → le workflow build l'image, push sur GHCR,
puis le runner self-hosted déploie. Vérifie avec
`docker logs --tail 30 <SLUG>-web` et `curl -I https://<DOMAIN>`.

---

## 4. Mise à jour du registre des ports

Après chaque nouveau déploiement, **incrémente la section "Registre des ports
loopback"** au début de ce document avec le port et le domaine attribués, pour
qu'un opérateur suivant n'attribue pas un port déjà pris.
