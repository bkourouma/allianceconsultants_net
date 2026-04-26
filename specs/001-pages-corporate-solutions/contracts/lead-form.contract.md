# Contract — `POST /api/lead`

**Type**: Next.js App Router route handler
**File**: `src/app/api/lead/route.ts` (NEW)
**Schema**: `LeadInputSchema` dans `src/lib/validators/lead.ts` (existant, **inchangé**)
**Persistence**: Prisma `prisma.lead.create()` sur le modèle `Lead` (existant, **inchangé**)
**Mailer**: `src/lib/mailer.ts` (NEW) — wrapper Nodemailer
**Consumers**: `LeadFormSection.tsx` (composant client), tests Vitest, tests Playwright.

## Purpose

Recevoir une demande de démo / contact qualifié soumise depuis une page solution (ou la page contact générique), valider le payload, rejeter le spam, **persister via Prisma** dans la table `Lead`, **notifier par e-mail** le destinataire commercial, répondre au client (JSON ou redirection selon `Content-Type`).

## Request

- **Méthode** : `POST`
- **URL** : `/api/lead`
- **Headers** acceptés : `Content-Type: application/json` (cas JS actif) **ou** `Content-Type: application/x-www-form-urlencoded` (fallback HTML pur).
- **Body** (forme `LeadInputSchema`, **strictement le schéma existant**) :

  ```json
  {
    "intent": "demo | contact | training | automation | diagnostic",
    "solutionSlug": "string (kebab-case ≤ 60)?",
    "fromPage": "string (≤ 200)?",
    "fromBlock": "string (≤ 60)?",
    "name": "string (2..120)",
    "email": "string (RFC email, ≤ 200)",
    "phone": "string (6..40)",
    "organization": "string (2..160)",
    "message": "string (10..4000)",
    "consent": true,
    "honeypot": "string (must be empty)"
  }
  ```

  Côté pages solutions, `intent`, `solutionSlug`, `fromPage` et `fromBlock` sont pré-remplis en `<input type="hidden">` :
  - `intent = "demo"` (ou `"training"` pour École Digitale)
  - `solutionSlug = <slug courant>`
  - `fromPage = "/solutions/<slug>"`
  - `fromBlock = "hero" | "section-demo" | "sticky-cta"` selon le bouton qui a ouvert le formulaire.

## Pipeline serveur (route handler)

```
1.  Lire body (JSON ou urlencoded)
2.  Si honeypot non vide:
       - JSON  → 204 No Content (silencieux)
       - HTML  → 302 Location: /contact-recu (silencieux pour le bot)
3.  LeadInputSchema.safeParse(body)
       - échec → 400 + { ok: false, errors }   (JSON)
                 ou 302 /contact-erreur?reason=validation   (HTML)
4.  Rate limit (LRU mémoire, 5 req / 10 min / IP) :
       - dépassé → 429 + { ok: false, error: "rate_limited" }
                   ou 302 /contact-erreur?reason=rate_limited
5.  ipHash = await bcrypt.hash(ip, 8)
6.  lead = await prisma.lead.create({
       data: {
         intent: input.intent.toUpperCase() as LeadIntent,
         solutionSlug, fromPage, fromBlock,
         name, email, phone, organization, message, consent,
         userAgent: request.headers.get('user-agent') ?? null,
         ipHash,
         honeypot: input.honeypot ?? null,
         status: "NEW"
       }
    })
7.  Tenter mailer.sendLeadNotification(lead) :
       - succès → mailSent = true
       - échec  → mailSent = false ; logger l'erreur (le lead est déjà persisté → pas perdu)
8.  Réponse :
       - JSON → 200 { ok: true, reference: lead.id, mailSent }
       - HTML → 302 Location: /contact-recu?ref=<id>
```

## Responses

| Cas | Statut | Body | Effet |
|---|---|---|---|
| Honeypot rempli (JSON) | `204 No Content` | (vide) | Aucune persistance, aucun e-mail. |
| Honeypot rempli (HTML) | `302` | (redirection `/contact-recu`) | Aucune persistance, aucun e-mail. |
| Validation Zod échouée (JSON) | `400` | `{ ok: false, errors: { <field>: <message> } }` | Aucun effet. |
| Validation Zod échouée (HTML) | `302` | redirection `/contact-erreur?reason=validation` | Aucun effet. |
| Rate limit dépassé | `429` (JSON) ou `302 /contact-erreur?reason=rate_limited` | `{ ok: false, error: "rate_limited" }` | Aucun effet. |
| Erreur Prisma | `500` (JSON) ou `302 /contact-erreur?reason=server` | `{ ok: false, error: "server_error" }` | Aucun e-mail. |
| Succès, e-mail OK | `200` (JSON) ou `302 /contact-recu?ref=<id>` | `{ ok: true, reference: <id>, mailSent: true }` | Lead persisté, e-mail envoyé. |
| Succès, e-mail KO | `200` (JSON) ou `302 /contact-recu?ref=<id>&mail=ko` | `{ ok: true, reference: <id>, mailSent: false }` | Lead persisté, e-mail à retraiter manuellement. |

## Variables d'environnement

| Nom | Obligatoire | Notes |
|---|---|---|
| `DATABASE_URL` | oui | Déjà utilisée par la base homepage. |
| `SMTP_HOST` | oui | Hôte SMTP. |
| `SMTP_PORT` | oui | 587 ou 465. |
| `SMTP_USER` | oui | Identifiant SMTP. |
| `SMTP_PASS` | oui | Mot de passe SMTP. **Jamais en dépôt.** |
| `LEAD_TO_EMAIL` | oui | Boîte de réception commerciale. |
| `LEAD_FROM_EMAIL` | oui | Adresse expéditrice (souvent `noreply@allianceconsultants.net`). |
| `LEAD_RATE_LIMIT_PER_10MIN` | non | Défaut : 5. |
| `PUBLIC_SITE_URL` | oui | Déjà en place pour SEO. |

Aucune de ces variables ne peut figurer dans le code source ni dans `.env` versionné. `.env.example` documente les noms.

## Sécurité

- Toutes les valeurs sont **trimées** (côté serveur) avant validation Zod.
- Le contenu de `message` est tronqué à 4000 caractères côté schéma.
- L'e-mail est composé en **texte brut** avec encodage des sauts de ligne ; aucune valeur utilisateur n'est interpolée dans une URL ou du HTML brut.
- IP **jamais** stockée en clair (bcryptjs, cost 8).
- Headers de sécurité globaux déjà appliqués via `next.config.ts` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- HTTPS imposé par Nginx (`infra/nginx/`).

## Format de l'e-mail envoyé (pour référence d'intégration)

```
Sujet  : [Lead {intent}] {name} — {solutionSlug|general}
De     : {LEAD_FROM_EMAIL}
À      : {LEAD_TO_EMAIL}
Reply-To : {email}
Corps texte :
  Nouvelle demande via allianceconsultants.net
  Intention   : {intent}
  Solution    : {solutionSlug|—}
  Page source : {fromPage|—}
  Bloc source : {fromBlock|—}

  Identité     : {name}
  Organisation : {organization}
  E-mail       : {email}
  Téléphone    : {phone}

  Message :
  {message}

  ---
  Référence Prisma : {lead.id}
  Soumis le        : {lead.createdAt ISO}
  User-Agent       : {userAgent}
```

## Tests obligatoires

1. **Unitaires** (`tests/unit/leadRoute.test.ts`) :
   - payload valide → 200, `prisma.lead.create` appelé, `mailer.sendLeadNotification` appelé.
   - honeypot rempli (JSON) → 204, `prisma.lead.create` **non** appelé.
   - honeypot rempli (HTML) → 302 vers `/contact-recu`.
   - chaque champ invalide → 400 / 302.
   - `consent: false` → 400.
   - rate limit (6e requête en moins de 10 min) → 429.
   - mailer rejette → 200 avec `mailSent: false` et `lead.id` retourné.
2. **E2E** (`tests/e2e/lead-form.spec.ts`) :
   - depuis `/solutions/medicpro`, soumettre → page de confirmation visible (mode JS), entrée Prisma vérifiée via fixture.
   - depuis `/solutions/medicpro` avec JS désactivé → soumission urlencoded, redirection `/contact-recu`.
   - honeypot rempli → 204 silencieux côté UI bot.
   - 6 soumissions consécutives même IP → la 6e renvoie 429.
