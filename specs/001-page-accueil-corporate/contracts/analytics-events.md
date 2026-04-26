# Contract — Événements Matomo

**Feature**: 001 — Page d'accueil corporate
**Source de vérité** : FR-140..FR-144, SC-016 du [spec.md](../spec.md).

Tous les événements sont émis vers Matomo auto-hébergé en mode sans cookie (FR-141, SC-017). Aucun PII (FR-144).

---

## Configuration Matomo (snippet d'init)

```js
// Snippet injecté en <head> par <MatomoTracker /> (composant Client)
var _paq = window._paq = window._paq || [];
_paq.push(['disableCookies']);                 // FR-141 (sans cookie)
_paq.push(['setDoNotTrack', true]);            // respect DNT
_paq.push(['anonymizeIp', 2]);                 // FR-141 (anonymisation)
_paq.push(['enableHeartBeatTimer']);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u = process.env.NEXT_PUBLIC_MATOMO_URL;
  _paq.push(['setTrackerUrl', u + 'matomo.php']);
  _paq.push(['setSiteId', process.env.NEXT_PUBLIC_MATOMO_SITE_ID]);
  var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
  g.async = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s);
})();
```

---

## Catalogue des événements

Format Matomo : `_paq.push(['trackEvent', category, action, name?, value?])`.

Convention de nommage :
- `category` = bloc fonctionnel (`Hero`, `Solutions`, `IA`, `Services`, `Trainings`, `FinalCTA`, `Engagement`).
- `action` = type d'interaction (`ClickCTA`, `ClickCard`, `Scroll`).
- `name` = identifiant précis (slug solution, intent, etc.).
- `value` = numérique optionnel (profondeur scroll en %).

### Événements CTA business

| ID | Quand | category | action | name |
|---|---|---|---|---|
| `EV-001` | Clic « Demander une démo » (hero) | `Hero` | `ClickCTA` | `demo` |
| `EV-002` | Clic « Découvrir nos solutions » (hero) | `Hero` | `ClickCTA` | `solutions` |
| `EV-003` | Clic « Voir les formations IA » (hero) | `Hero` | `ClickCTA` | `training` |
| `EV-010` | Clic carte solution (lien interne) | `Solutions` | `ClickCard` | `<solution-slug>` |
| `EV-011` | Clic CTA secondaire « Demander une démo » sur carte solution | `Solutions` | `ClickCTA` | `demo:<solution-slug>` |
| `EV-012` | Clic carte ImmoTopia.cloud (lien externe) | `Solutions` | `ClickCardExternal` | `immotopia-cloud` |
| `EV-020` | Clic « Automatiser un processus » (section IA) | `IA` | `ClickCTA` | `automation` |
| `EV-030` | Clic carte service | `Services` | `ClickCard` | `<service-slug>` |
| `EV-040` | Clic « Voir le catalogue » (formations) | `Trainings` | `ClickCTA` | `catalog` |
| `EV-041` | Clic « Demander une formation entreprise » | `Trainings` | `ClickCTA` | `enterprise-training` |
| `EV-050` | Clic CTA final | `FinalCTA` | `ClickCTA` | `contact` |

### Événements de profondeur de scroll

| ID | Quand | category | action | value |
|---|---|---|---|---|
| `EV-100` | Scroll atteint 25 % de la page | `Engagement` | `Scroll` | `25` |
| `EV-101` | Scroll atteint 50 % | `Engagement` | `Scroll` | `50` |
| `EV-102` | Scroll atteint 75 % | `Engagement` | `Scroll` | `75` |
| `EV-103` | Scroll atteint 100 % (fin de page) | `Engagement` | `Scroll` | `100` |

Implémentation côté client via `IntersectionObserver` sur des sentinels positionnés à 25/50/75/100 % de la hauteur du document. Chaque palier émis **une seule fois par session**.

### Événements de navigation interne (informationnels)

Les liens de navigation pure (header, footer, breadcrumb) ne sont **pas** instrumentés en plus du `trackPageView` automatique → évite le bruit. Seuls les CTA business listés ci-dessus émettent des événements explicites.

---

## Règles d'émission

1. **Pas de PII** (FR-144) : aucun `name` ne contient d'email, nom, téléphone, IP. Les slugs sont des identifiants techniques publics.
2. **Idempotence** : un même clic ne doit pas émettre 2 fois (vérifier via `data-tracked` attribute si nécessaire).
3. **Ordre** : `trackEvent` peut être émis **avant** la navigation grâce à `_paq.push` (pas besoin de `event.preventDefault`) — Matomo place l'événement dans la file et le flushe avant le `unload`.
4. **Hors ligne / bloqué** : si Matomo est inaccessible, la navigation utilisateur n'est **pas** dégradée (le snippet est asynchrone).

---

## Helper côté code

```ts
// src/lib/matomo.ts
type EventCategory = 'Hero' | 'Solutions' | 'IA' | 'Services' | 'Trainings' | 'FinalCTA' | 'Engagement';

export function trackEvent(
  category: EventCategory,
  action: string,
  name?: string,
  value?: number
) {
  if (typeof window === 'undefined') return;
  // @ts-expect-error — _paq injecté par MatomoTracker
  (window._paq ||= []).push(['trackEvent', category, action, name, value]);
}
```

---

## Tests d'acceptation (Playwright)

Voir `tests/e2e/analytics.spec.ts`. Stratégie :

1. Intercepter les requêtes vers `<MATOMO_URL>matomo.php` (route mock en CI).
2. Pour chaque ID `EV-XXX` ci-dessus, simuler l'interaction et asserter que la requête correspondante est émise avec les bons paramètres.
3. Asserter que **zéro requête** vers Matomo ne contient un email, nom, téléphone, ou IP de l'utilisateur (regex de vérification).
4. Asserter que les événements de scroll ne sont émis qu'**une fois** chacun par session (pas de doublons après scroll bidirectionnel).

Critère de réussite SC-016 : tous les événements `EV-001..EV-050` + `EV-100..EV-103` sont déclenchés par le test exhaustif et zéro PII détecté.

---

## Tableau de bord Matomo recommandé (à préparer côté Matomo)

- Goal « Conversion homepage → contact-demo » = visite de `/contact-demo` avec `from=homepage`.
- Funnel : `/` → événement `Hero/ClickCTA/demo` → `/contact-demo` → soumission formulaire (instrumentée par feature `/contact-demo`).
- Segments : par `intent` (demo, training, automation, contact), par `block` (hero, ai-section, final-cta), par device (mobile vs desktop).

Ces tableaux relèvent de la configuration Matomo (admin), pas du code applicatif.
