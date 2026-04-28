# Tasks — 002 — Backoffice + Blog éditorial

Légende : `[P]` parallélisable · `[S]` séquentiel (dépend de la tâche
précédente). Les tâches sont rangées par phase logique. Chaque tâche est
testable en isolation.

## Phase 0 — Constitution & spec (✅ terminé)

- [x] T000 — Constitution amendée v1.0.0 → v1.0.1.
- [x] T001 — `specs/002-backoffice-blog/spec.md`.
- [x] T002 — `specs/002-backoffice-blog/plan.md`.
- [x] T003 — `specs/002-backoffice-blog/data-model.md`.

## Phase 1 — Schéma Prisma & seed

- [ ] T010 [P] — Étendre `prisma/schema.prisma` avec `User`, `BlogPost`,
      `BlogTag`, `BlogPostTag`, enums `Role`, `PostStatus`.
- [ ] T011 [S] — `npx prisma migrate dev --name backoffice_blog` (en local) ;
      committer le dossier `prisma/migrations/`.
- [ ] T012 [P] — Créer `prisma/seed.ts` (idempotent : ne crée l'admin que
      s'il n'existe pas, lit `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- [ ] T013 [P] — Ajouter `"prisma": { "seed": "tsx prisma/seed.ts" }` dans
      `package.json`.

## Phase 2 — Auth (NextAuth v5)

- [ ] T020 [P] — Installer `next-auth@beta`, `@auth/prisma-adapter`,
      `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`,
      `@tiptap/extension-link`, `@tiptap/extension-image`,
      `isomorphic-dompurify`.
- [ ] T021 [S] — Créer `src/lib/auth.ts` (NextAuth config : Credentials
      provider + Prisma adapter + session JWT + callbacks `session`/`jwt`
      pour exposer `user.id` et `user.role`).
- [ ] T022 [S] — `src/app/api/auth/[...nextauth]/route.ts` : exporte
      `GET` + `POST` depuis `auth.handlers`.
- [ ] T023 [S] — Remplacer `src/middleware.ts` : matcher `/admin/:path*`,
      utiliser `auth` middleware NextAuth, exclure `/admin/login`,
      rediriger non-authentifiés vers `/admin/login?callbackUrl=…`.
- [ ] T024 [P] — `src/lib/validators/auth.ts` (LoginInputSchema +
      PasswordChangeInputSchema).
- [ ] T025 [P] — Rate-limit login : helper réutilisable
      `src/lib/ratelimit.ts` (extraction commune avec
      `src/app/api/lead/route.ts`), appliquer dans le `authorize()` du
      Credentials provider sur la base de l'IP.
- [ ] T026 [S] — `src/components/admin/LoginForm.tsx` (client) +
      `src/app/admin/login/page.tsx` (server, redirige si déjà
      authentifié).

## Phase 3 — Layout & Dashboard admin

- [ ] T030 [P] — `src/components/admin/AdminShell.tsx` (header + sidebar +
      slot enfant).
- [ ] T031 [P] — `src/components/admin/AdminSidebar.tsx` (liens :
      Dashboard, Leads, Blog, Mon compte, Déconnexion).
- [ ] T032 [P] — `src/components/admin/KpiCard.tsx`.
- [ ] T033 [S] — `src/app/admin/layout.tsx` (server) : vérifie session,
      redirige vers `/admin/login` sinon, rend `<AdminShell>`.
- [ ] T034 [S] — `src/app/admin/page.tsx` (dashboard 4 KPIs + liens
      raccourcis).
- [ ] T035 [P] — `src/app/admin/account/page.tsx` (changement mot de
      passe).
- [ ] T036 [P] — Route handler de déconnexion (button → POST
      `/api/auth/signout`).

## Phase 4 — Backoffice Leads

- [ ] T040 [P] — `src/lib/admin/leads.ts` : `listLeads({ filters,
      pagination })`, `getLeadById(id)`, `updateLeadStatus(id, patch,
      adminEmail)`.
- [ ] T041 [P] — `src/components/admin/LeadFilters.tsx` (client, query
      string).
- [ ] T042 [P] — `src/components/admin/LeadStatusForm.tsx` (client,
      mutation via `fetch` PATCH JSON).
- [ ] T043 [S] — `src/app/admin/leads/page.tsx` (table paginée +
      filtres).
- [ ] T044 [S] — `src/app/admin/leads/[id]/page.tsx` (détail + form de
      qualification).
- [ ] T045 [S] — `src/app/api/admin/leads/[id]/route.ts` (PATCH, vérif
      session + Zod).

## Phase 5 — Backoffice Blog

- [ ] T050 [P] — `src/lib/slug.ts` (slugify FR avec accents → ASCII +
      kebab + collisions DB).
- [ ] T051 [P] — `src/lib/sanitize.ts` (DOMPurify wrapper avec liste
      blanche).
- [ ] T052 [P] — `src/lib/validators/blog.ts` (Zod : BlogPostInput,
      BlogPostPatch, TagInput).
- [ ] T053 [P] — `src/lib/admin/blog.ts` (queries CRUD + tags
      upsert).
- [ ] T054 [P] — `src/components/admin/RichTextEditor.tsx` (Tiptap +
      toolbar minimale : bold/italic/lien/image/H2/H3/listes/quote).
- [ ] T055 [P] — `src/components/admin/TagInput.tsx`.
- [ ] T056 [P] — `src/components/admin/ImageUploader.tsx` (POST vers
      `/api/admin/blog/upload`).
- [ ] T057 [P] — `src/components/admin/BlogPostForm.tsx` (réutilise
      RichTextEditor, TagInput, ImageUploader).
- [ ] T058 [S] — `src/app/admin/blog/page.tsx` (liste avec filtres
      status).
- [ ] T059 [S] — `src/app/admin/blog/new/page.tsx` (création).
- [ ] T060 [S] — `src/app/admin/blog/[id]/page.tsx` (édition).
- [ ] T061 [S] — `src/app/api/admin/blog/route.ts` (POST).
- [ ] T062 [S] — `src/app/api/admin/blog/[id]/route.ts` (PATCH +
      DELETE).
- [ ] T063 [S] — `src/app/api/admin/blog/upload/route.ts` (POST image,
      vérif MIME, stockage `public/uploads/blog/`).

## Phase 6 — Blog public

- [ ] T070 [P] — `src/lib/blog.ts` : `listPublishedPosts({ page, tag })`,
      `getPostBySlug(slug)`, `listAllTags()`, `listRelatedPosts(post,
      n)`. Toutes filtrent `status: 'PUBLISHED'`.
- [ ] T071 [P] — `src/lib/seo.ts` : `buildArticleJsonLd`,
      `buildBlogBreadcrumbJsonLd`.
- [ ] T072 [P] — `src/components/blog/BlogIndexCard.tsx`,
      `BlogTagBadge.tsx`, `BlogArticleHero.tsx`.
- [ ] T073 [S] — `src/app/blog/page.tsx` (index paginé,
      `searchParams: { page, tag }`).
- [ ] T074 [S] — `src/app/blog/[slug]/page.tsx` (détail + JSON-LD +
      CTA contact en fin + articles connexes).
- [ ] T075 [S] — `src/app/feed.xml/route.ts` (RSS 2.0).
- [ ] T076 [S] — `src/app/sitemap.ts` : ajouter `/blog` + chaque article
      publié (lecture Prisma).
- [ ] T077 [S] — `next.config.ts` : `redirects()` `/ressources` → `/blog`
      (301 permanent).

## Phase 7 — Site settings & menu

- [ ] T080 [P] — `content/site-settings.json` :
  - `primaryMenu` : remplacer `{ "label": "Ressources", "href":
    "/ressources" }` par `{ "label": "Blog", "href": "/blog" }`.
  - `footerMenu.ressources` → `footerMenu.blog` ; les hrefs `/ressources`
    deviennent `/blog`.
- [ ] T081 [S] — `src/lib/validators/content.ts` : aucune modification de
      schéma (le record `footerMenu` est déjà permissif `z.record(z.string(), …)`).
- [ ] T082 [S] — `src/components/layout/GlobalFooter.tsx` : lire
      `footerMenu.blog` au lieu de `footerMenu.ressources`, libellé
      "Blog".

## Phase 8 — Tests

- [ ] T090 [P] — `tests/unit/sanitize.test.ts` : vérifie qu'un input
      contenant `<script>`, `onerror=`, `javascript:` est strippé.
- [ ] T091 [P] — `tests/unit/slug.test.ts` : « Tête à tête : SEO 2026 »
      → `tete-a-tete-seo-2026` ; collisions → suffixe.
- [ ] T092 [P] — `tests/unit/blog-validators.test.ts` : Zod accepts/refuses.
- [ ] T093 [P] — `tests/unit/auth.test.ts` : login OK / mauvais mot de
      passe / utilisateur inconnu — message générique.
- [ ] T094 [S] — `tests/e2e/admin-flow.spec.ts` (Playwright) :
  - login → dashboard,
  - créer brouillon (titre, excerpt, contenu),
  - publier,
  - vérifier `/blog/<slug>` (200, H1, JSON-LD `Article`),
  - vérifier `/blog` liste l'article,
  - vérifier `/feed.xml` contient l'article.

## Phase 9 — Qualité & livraison

- [ ] T100 [S] — `npm run typecheck` propre.
- [ ] T101 [S] — `npm run lint` propre.
- [ ] T102 [S] — `npm run test:ci` vert.
- [ ] T103 [S] — `npm run test:e2e` vert (suppose `prisma migrate deploy`
      + seed admin appliqués sur l'environnement de test).
- [ ] T104 [S] — `npm run lhci` ≥ 85 mobile sur `/blog` et un article.
- [ ] T105 [S] — `.gitignore` : ajouter `public/uploads/blog/*`
      (sauf `.gitkeep`) pour éviter de committer les uploads de dev.
- [ ] T106 [S] — `CLAUDE.md` mis à jour (nouvelle feature active).

## Notes opérationnelles

- En prod, ajouter au pipeline (Dockerfile ou job d'init) :
  `npx prisma migrate deploy && npx prisma db seed`.
- Surveiller `next-auth` v5 (encore en bêta) : tagguer la version exacte.
- Les uploads sur disque local supposent un volume persistant en
  Docker. À documenter dans `infra/docker-compose.yml` (mount
  `./uploads:/app/public/uploads`).
