# Contract — URL & redirections (page d'accueil)

**Feature**: 001 — Page d'accueil corporate
**Type de contrat** : interface URL exposée au public + règles de redirection des CTA business.

---

## URL exposées par cette feature

| Méthode | URL | Description | Réponse attendue |
|---|---|---|---|
| `GET` | `/` | Page d'accueil corporate | `200` HTML — rendu SSR/ISR, `Content-Type: text/html; charset=utf-8` |
| `GET` | `/sitemap.xml` | Sitemap (inclut `/`) | `200` XML |
| `GET` | `/robots.txt` | Robots policy | `200` text/plain — autorise indexation `/`, interdit `/admin` |
| `GET` | `/manifest.webmanifest` | Web manifest | `200` JSON |
| `GET` | `/opengraph-image` | OG image dynamique | `200` PNG |
| `GET` | `/favicon.ico`, `/icon.png`, `/apple-icon.png` | Icônes | `200` images |

**En-têtes obligatoires** sur `GET /` :
- `Content-Type: text/html; charset=utf-8`
- `Cache-Control: public, s-maxage=31536000, stale-while-revalidate=86400` (ISR — revalidate manuel via Server Action)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; script-src 'self' '<MATOMO_URL>'; img-src 'self' data: <MATOMO_URL>; style-src 'self' 'unsafe-inline'; connect-src 'self' <MATOMO_URL>;` (CSP stricte ; Tailwind injecte des styles inline → `'unsafe-inline'` toléré pour `style-src` uniquement)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- **Pas** de `Set-Cookie` non strictement nécessaire (SC-017).

---

## Contrat de redirection des CTA business

Tous les CTA business de l'accueil DOIVENT être des **liens HTML standards** (`<a href="...">`) — pas des `<button onClick>` — pour rester accessibles sans JS, traçables Matomo, partageables.

**Format de l'URL de destination** :

```
/contact-demo?intent=<INTENT>&solution=<SOLUTION_SLUG>&from=homepage&block=<BLOCK_KEY>
```

| Param | Type | Obligatoire | Valeurs |
|---|---|---|---|
| `intent` | enum | oui | `demo`, `contact`, `training`, `automation`, `diagnostic` |
| `solution` | slug | conditionnel | `docupro-suite`, `medicpro`, `cliniquepro`, `immotopia-cloud`, `annonces-web`, `ecole-digitale` — uniquement si CTA porté par une carte solution |
| `from` | enum | oui | `homepage` (constante pour cette feature) |
| `block` | enum | oui | `hero`, `solution-card`, `ai-section`, `service-card`, `training-section`, `final-cta` |

### Mapping des CTA → URL

| CTA (libellé visible) | Origine (block) | URL générée |
|---|---|---|
| Demander une démo (hero) | `hero` | `/contact-demo?intent=demo&from=homepage&block=hero` |
| Découvrir nos solutions (hero) | `hero` | `/solutions` *(navigation interne, pas un CTA business — pas de redirection contact-demo)* |
| Voir les formations IA (hero) | `hero` | `/contact-demo?intent=training&from=homepage&block=hero` |
| Carte solution → « En savoir plus » | `solution-card` | `/solutions/<slug>` *(navigation interne)* |
| Carte solution → « Demander une démo » (si exposé) | `solution-card` | `/contact-demo?intent=demo&solution=<slug>&from=homepage&block=solution-card` |
| Carte ImmoTopia.cloud (lien externe) | `solution-card` | `https://immotopia.cloud/` (target=_blank, rel="noopener noreferrer") |
| Automatiser un processus (section IA) | `ai-section` | `/contact-demo?intent=automation&from=homepage&block=ai-section` |
| Carte service → « En savoir plus » | `service-card` | `/services/<slug>` |
| Voir le catalogue (formations) | `training-section` | `/formations` |
| Demander une formation entreprise | `training-section` | `/contact-demo?intent=training&from=homepage&block=training-section` |
| CTA final | `final-cta` | `/contact-demo?intent=contact&from=homepage&block=final-cta` |

**Important** :
- Les CTA *navigation* (`/solutions`, `/formations`, `/solutions/<slug>`) ne portent **pas** de query param d'intention puisqu'ils mènent vers une page d'écosystème, pas vers la conversion. Ce sont des liens internes standards.
- Les CTA *business* portent systématiquement les 3 query params (`intent`, `from`, `block`) + `solution` quand applicable.
- Lien externe ImmoTopia.cloud : ouverture nouvel onglet, attribut `rel="noopener noreferrer"` obligatoire (sécurité).

---

## Règles de cache et invalidation

- ISR par défaut, `revalidate = false` (cache infini jusqu'à invalidation manuelle).
- Toute Server Action de publication (`Homepage`, `Solution.showOnHomepage`, `Service.showOnHomepage`, `Training.showOnHomepage`, `Reference.showOnHomepage`, `SiteSettings`) appelle `revalidatePath('/')` après commit.
- Les images servies par `next/image` portent leurs propres en-têtes de cache long.

---

## Codes de réponse

| Cas | Code |
|---|---|
| Rendu nominal | `200` |
| `Homepage.status === 'DRAFT'` | `404` *(pas de page accueil publiée)* |
| Erreur DB transitoire | `503` (avec page d'erreur Next.js dégradée, sémantique HTML conservée) |

`404` doit être servi avec un layout simplifié qui conserve le header global et propose au minimum : lien vers `/`, lien vers `/contact-demo`. Pas de placeholder visible.

---

## Tests d'acceptation du contrat (Playwright)

Voir `tests/e2e/redirects.spec.ts` :

- Pour chaque CTA business listé ci-dessus, cliquer et vérifier l'URL de destination + ses query params.
- Vérifier qu'aucun cookie n'est posé après visite + clic sur 3 CTA + retour.
- Vérifier que le lien ImmoTopia ouvre `https://immotopia.cloud/` avec `rel="noopener noreferrer"`.
- Vérifier les en-têtes de réponse `/` (HSTS, CSP, X-Content-Type-Options, etc.).
