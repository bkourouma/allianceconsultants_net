# Feature Specification — 002 — Backoffice + Blog éditorial

**Branch**: `002-backoffice-blog` | **Date**: 2026-04-27
**Constitution**: v1.0.1 (amendée le 2026-04-27 ; *Ressources → Blog* dans le menu de référence)
**Décisions actées en clarification (2026-04-27)** :
- Menu : libellé **« Blog »** + URL publique **`/blog`** (option B). La constitution a été amendée en conséquence.
- Authentification : **NextAuth (Auth.js v5)** + Credentials provider + Prisma adapter.
- Périmètre MVP : **Leads** (consultation, statut, notes) + **Blog** (CRUD complet).
- Éditeur d'articles : **Tiptap** (WYSIWYG riche).
- Utilisateurs : **single admin** seedé via variables d'environnement (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## Objectif business

Doter Alliance Consultants d'un **espace d'administration privé** (`/admin`)
permettant de :
- consulter et qualifier les **leads** générés par le site (CTA démo, contact,
  formation, automatisation, diagnostic) sans accès direct à la base PG ;
- publier des **articles de blog** orientés SEO et leadgen, en remplacement de
  l'item « Ressources » du menu principal.

L'espace blog public **remplace** la rubrique « Ressources » prévue dans le MVP
constitutionnel ; l'ancienne URL `/ressources` est redirigée 301 vers `/blog`
pour préserver l'éventuel jus SEO et tout lien externe.

## Personae

- **Admin Alliance** (interne, 1 personne au lancement) — DG ou responsable
  marketing. Doit pouvoir se connecter, voir l'activité, traiter les leads,
  rédiger des articles. Profil non-développeur : interface FR, claire,
  WYSIWYG.
- **Visiteur public** — décideur B2B (cf. constitution) qui consulte la
  rubrique blog pour comprendre l'expertise (SEO, preuve d'expertise, support
  d'aide à la décision). Génère des leads via les CTA en fin d'article.

## User Stories

### US1 — Connexion sécurisée à l'admin (priorité P0)
*En tant qu'Admin Alliance, je me connecte à `/admin/login` avec mon e-mail et
mon mot de passe pour accéder au backoffice.*

**Critères d'acceptation** :
- Le formulaire `/admin/login` accepte e-mail + mot de passe.
- Mot de passe haché en base (bcrypt, ≥ 10 rounds).
- Toute route `/admin/**` (sauf `/admin/login`) redirige vers `/admin/login`
  si la session est absente ou expirée.
- Après connexion réussie, redirection vers `/admin` (dashboard).
- Un cookie de session HTTP-only, Secure (en prod), SameSite=Lax est posé.
- Le bouton « Se déconnecter » dans le layout admin invalide la session.
- Robots: `/admin` reste interdit dans `robots.txt` (déjà le cas).

### US2 — Tableau de bord (priorité P1)
*En tant qu'Admin, j'arrive sur un tableau de bord qui me donne d'un coup
d'œil l'état des leads et du blog.*

**Critères** : 4 KPI minimum
- leads des 7 derniers jours,
- leads NEW à traiter,
- articles publiés,
- articles brouillons.
- Liens directs vers `/admin/leads?status=NEW` et `/admin/blog?status=DRAFT`.

### US3 — Liste et qualification des leads (priorité P0)
*En tant qu'Admin, je consulte les leads, je filtre par statut/intent/dates,
je passe un lead en CONTACTED ou ARCHIVED et j'ajoute des notes internes.*

**Critères** :
- Liste paginée (20 par page) triée par `createdAt` desc.
- Filtres : `status` (NEW/CONTACTED/QUALIFIED/ARCHIVED/SPAM), `intent`,
  `solutionSlug`, recherche libre (nom/email/organisation).
- Page détail `/admin/leads/[id]` montre tous les champs **sauf** l'IP en
  clair (seulement `ipHash` est stocké, conformément à la constitution
  RGPD).
- Édition possible : `status`, `notes`, `contactedBy` (auto-rempli avec
  l'e-mail admin courant), `contactedAt` (auto-posé au passage en
  CONTACTED).
- Pas de suppression en MVP (RGPD : ajouter une procédure d'export/suppression
  fera l'objet d'une feature dédiée).

### US4 — Rédaction et publication d'articles de blog (priorité P0)
*En tant qu'Admin, je crée un article via un éditeur riche, je le sauvegarde
en brouillon, je le prévisualise et je le publie.*

**Critères** :
- `/admin/blog` : liste articles (titre, statut, date pub, auteur, tags).
- `/admin/blog/new` : formulaire avec
  - titre (10–120 car.),
  - slug (auto-généré depuis le titre, modifiable, unique),
  - excerpt (60–200 car., obligatoire — sert au listing public et meta
    description par défaut),
  - cover image (upload PNG/JPG/WebP ≤ 2 MB, stocké dans
    `public/uploads/blog/`),
  - tags (saisie libre + autocomplete sur tags existants),
  - corps Tiptap (HTML stocké et sanitisé côté serveur),
  - SEO : `seoTitle` (≤ 60), `seoDescription` (50–160), `ogImage` optionnel,
  - statut : DRAFT / PUBLISHED,
  - `publishedAt` (auto à la publication, modifiable).
- Bouton « Aperçu » ouvre `/blog/<slug>?preview=1` dans un nouvel onglet
  (visible **uniquement** authentifié).
- Slug unique imposé en base ; en cas de conflit, suffixe `-2`, `-3`, etc.
- À la publication, l'article apparaît dans `/blog`, `/sitemap.xml` et
  `/feed.xml` immédiatement (revalidation).
- Validation serveur : Zod sur tous les champs, sanitisation HTML Tiptap.

### US5 — Blog public (priorité P0)
*En tant que visiteur, je consulte la liste des articles puis je lis un
article, je découvre l'expertise Alliance Consultants, et je suis incité à
prendre contact.*

**Critères** :
- `/blog` : index paginé (12 par page), tri date desc, filtre par tag.
  - Pour chaque article : cover, titre, excerpt, date, tags.
  - SEO : title « Blog | Alliance Consultants », meta description, JSON-LD
    `Blog`, breadcrumb, canonical.
- `/blog/[slug]` : page détail.
  - Hero (titre, date, tags, cover).
  - Corps HTML rendu (typographie soignée — `prose` Tailwind).
  - Bloc auteur en pied (réutilise les coordonnées Alliance).
  - **CTA business obligatoire** en fin d'article (« Discutons de votre
    projet », `intent=contact`, `fromPage=/blog/<slug>`).
  - Articles connexes (3 derniers du même tag ou les 3 plus récents si pas
    de tag).
  - JSON-LD `Article` + `BreadcrumbList`.
  - Maillage interne : au moins 1 lien sortant vers une page solution OU
    service depuis l'article (responsabilité éditoriale, vérifié à la
    relecture, pas par lint automatique au MVP).
- `/feed.xml` : flux RSS 2.0 des 20 derniers articles publiés.
- `/sitemap.xml` : ajoute `/blog` (priority 0.7, changeFrequency weekly) et
  `/blog/<slug>` pour chaque article publié (priority 0.6, weekly).
- Redirection 301 : `/ressources` → `/blog` ; `/ressources/*` → `/blog/*`
  (bien qu'aucun sous-chemin `/ressources/*` n'ait jamais été indexé, on
  pose la règle par sécurité).

### US6 — Changement de mot de passe admin (priorité P2)
*En tant qu'Admin, je peux changer mon mot de passe depuis `/admin/account`.*

**Critères** :
- Formulaire : ancien mot de passe + nouveau (min 12 car., 1 chiffre, 1
  majuscule, 1 minuscule).
- Mise à jour avec bcrypt (≥ 10 rounds).
- Invalidation de toutes les sessions actives autres que la session courante
  (best-effort si JWT NextAuth — sinon documenter le comportement).

## Exigences non fonctionnelles

- **Sécurité** :
  - Routes `/admin/**` et `/api/admin/**` protégées par session NextAuth
    (middleware Next.js + vérification serveur dans chaque route handler).
  - CSRF : NextAuth pose des tokens CSRF nativement pour les credentials
    flows ; toute mutation admin (`POST`/`PATCH`/`DELETE`) DOIT être faite
    depuis une page `/admin/**` (même origine).
  - Sanitisation HTML : le HTML Tiptap est passé par `DOMPurify` (ou
    équivalent) côté serveur avant persistance.
  - Upload d'images : `Content-Type` MIME vérifié, taille ≤ 2 MB, extension
    réécrite, nom de fichier `cuid()-original.<ext>`. Pas d'exécution
    serveur.
  - Mot de passe admin minimum 12 caractères (politique forte).
  - Pas de secret en dépôt.
- **Performance** :
  - Pages publiques `/blog` et `/blog/[slug]` rendues en SSG/ISR (tag-based
    revalidation après publication).
  - Lighthouse Performance ≥ 85 mobile sur `/blog` et au moins une fiche
    article.
- **SEO** : title/meta/H1 uniques par article, JSON-LD `Article`,
  breadcrumb, canonical, sitemap, RSS, OpenGraph image.
- **Accessibilité** : WCAG AA sur les pages admin ET publiques (contraste,
  focus visible, navigation clavier, labels formulaires).
- **i18n** : français uniquement (cohérent avec MVP constitutionnel).
- **Données** : RGPD — pas d'IP en clair, hash uniquement (déjà le cas pour
  `Lead`). Aucune donnée personnelle d'un commentateur (le blog n'a pas de
  commentaires en MVP).
- **Disponibilité** : pas de SLA spécifique en MVP.

## Hors périmètre MVP

- Multi-utilisateur, rôles fins, invitations.
- Commentaires sur les articles.
- Newsletter / capture e-mail dédiée blog.
- Versionning d'articles, planification (`scheduledFor`).
- Réseaux sociaux (Open Graph générique seulement, pas de share counts).
- Migration des MDX existants (solutions/services/formations) en base — reste
  en fichiers MDX.
- API publique JSON (`/api/blog/posts`).
- 2FA, SSO, OAuth.
- Audit log des actions admin (peut s'ajouter en feature ultérieure).

## Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Vulnérabilité XSS via HTML Tiptap | Critique | Sanitisation serveur (DOMPurify avec liste blanche), CSP stricte sur `/blog/[slug]`. |
| Bruteforce login admin | Élevé | Rate-limit `LOGIN_RATE_LIMIT_PER_10MIN` (5 par défaut, partagé avec le rate-limit lead) + délai d'erreur identique pour user inconnu vs mauvais mot de passe. |
| Upload de fichier malveillant (script) | Élevé | Vérif MIME + extension réécrite + stockage hors `/api/`. |
| Conflit de slug | Moyen | Unicité base + suffixe automatique. |
| SEO : perte de l'URL `/ressources` | Faible | Redirection 301 `/ressources → /blog`. |
| Confusion menu pendant la transition | Faible | Le footer et le header changent en même temps ; le sitemap aussi. |

## Critères d'acceptation globaux (rappel constitution)

- ✅ Mobile-first, responsive desktop/tablette/mobile.
- ✅ FR pro, sans placeholder visible.
- ✅ Au moins un CTA business sur `/blog/[slug]` (CTA contact en fin
  d'article).
- ✅ SEO complet (title, meta, H1, JSON-LD, sitemap, canonical).
- ✅ Cohérence header / footer / design system.
- ✅ Pas de TODO bloquant, pas d'erreur console, pas de lien mort.
