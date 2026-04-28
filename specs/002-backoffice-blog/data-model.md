# Data Model — 002 — Backoffice + Blog

## Modèles existants conservés

### `Lead` (inchangé)
Voir `prisma/schema.prisma`. Cette feature **lit et met à jour** les
champs `status`, `notes`, `contactedAt`, `contactedBy` depuis l'admin.
Aucune modification de schéma sur `Lead`.

## Nouveaux modèles

### `User`
Représente un compte admin du backoffice.

| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | |
| `email` | `String` | `@unique` | min 5 car., format e-mail validé Zod |
| `name` | `String?` | optionnel | |
| `passwordHash` | `String` | non vide | bcrypt rounds ≥ 10 |
| `role` | `Role` (enum) | défaut `ADMIN` | extensible (`EDITOR` futur) |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Enum `Role`** : `ADMIN`, `EDITOR` (réservé future feature multi-user).

**Index** : `@@index([email])`.

### `BlogPost`

| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | |
| `slug` | `String` | `@unique`, `^[a-z0-9-]+$`, max 80 | URL public |
| `title` | `String` | min 10, max 120 | H1 page |
| `excerpt` | `String` | min 60, max 200, `@db.Text` | listing public + meta default |
| `coverUrl` | `String?` | URL relative type `/uploads/blog/<file>` | optionnel |
| `coverAlt` | `String?` | min 4, max 160 si présent | accessibilité |
| `bodyHtml` | `String` | `@db.Text`, min 200 | sortie Tiptap **sanitisée** |
| `seoTitle` | `String?` | min 10, max 60 | fallback : `title` |
| `seoDescription` | `String?` | min 50, max 160 | fallback : `excerpt` |
| `ogImage` | `String?` | URL | fallback : `coverUrl` |
| `status` | `PostStatus` enum | défaut `DRAFT` | `DRAFT`, `PUBLISHED` |
| `publishedAt` | `DateTime?` | nullable | auto-posée à la publication, modifiable |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |
| `authorId` | `String` | FK → `User.id` `onDelete: Restrict` | |
| `tags` | `BlogPostTag[]` | relation many-to-many via table de jointure | |

**Index** :
- `@@index([status, publishedAt(sort: Desc)])` — listing public.
- `@@index([slug])` — déjà couvert par `@unique`.
- `@@index([authorId])`.

**Règles métier** :
- `status = PUBLISHED` ⇒ `publishedAt` non nul.
- `slug` unique global (pas de duplication même entre DRAFT et PUBLISHED).

### `BlogTag`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `slug` | `String` | `@unique`, kebab-case, max 60 |
| `label` | `String` | max 60 |
| `createdAt` | `DateTime` | `@default(now())` |

`label` = libellé affiché ; `slug` = URL (`/blog?tag=<slug>`).

### `BlogPostTag`
Table de jointure explicite (permet d'ajouter `position` plus tard si besoin).

| Champ | Type | Contraintes |
|---|---|---|
| `postId` | `String` | FK `BlogPost.id` `onDelete: Cascade` |
| `tagId` | `String` | FK `BlogTag.id` `onDelete: Cascade` |
| `@@id([postId, tagId])` | clé composite | |
| `@@index([tagId])` | | |

## Migration

Une seule migration initiale — `prisma migrate dev --name backoffice_blog`.
Aucun renommage d'objet existant. Le modèle `Lead` n'est pas touché.

## Validators Zod (côté `src/lib/validators/`)

- `auth.ts` :
  - `LoginInputSchema` (`email`, `password`).
  - `PasswordChangeInputSchema` (`currentPassword`, `newPassword`).
- `blog.ts` :
  - `BlogPostInputSchema` — miroir des champs de `BlogPost` (sans `id`,
    `createdAt`, `updatedAt`, `authorId`, `bodyHtml` reçu mais re-sanitisé
    avant persistance).
  - `BlogPostPatchSchema` — `BlogPostInputSchema.partial()` + ré-application
    de la règle `PUBLISHED ⇒ publishedAt`.
  - `TagInputSchema` (`label`, `slug` optionnel auto-généré).

Toutes les chaînes sont `.trim()` côté serveur avant validation.
