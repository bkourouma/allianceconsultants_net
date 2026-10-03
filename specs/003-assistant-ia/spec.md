# Feature 003 — Assistant IA proactif (qualification, coordonnées, démo Calendly)

Widget de conversation présent sur tout le site public (`(site)/layout.tsx`). Il remarque ce que lit le
visiteur, l'engage sur ce sujet, qualifie son besoin, recueille ses coordonnées avec consentement, puis
l'amène à réserver une démonstration via Calendly.

## Parcours visiteur

1. **Lanceur discret** en bas à droite (pastille « Une question ? » ; icône seule sur mobile), aux couleurs de la
   ligne du produit consulté. Aucune sollicitation à l'arrivée.
2. **Accroche proactive**, une seule fois par session, quand le visiteur a manifesté un intérêt net pour la page où
   il se trouve (`src/components/assistant/journey.ts`) :
   - page solution / service / formation : 25 s de lecture active, ou 12 s avec ≥ 55 % de défilement, ou un retour
     sur la page (≥ 10 s) ;
   - accueil : 40 s et ≥ 55 % de défilement ;
   - jamais sur `/contact-demo`, `/contact-recu`, `/contact-erreur`, `/privacy`, `/mentions-legales` ;
   - jamais après une fermeture explicite ni si l'assistant a déjà été ouvert ; s'efface seule après 30 s.
   - « Lecture active » = onglet visible **et** activité (souris, clavier, toucher, défilement) dans les 20 s.
3. **Ouverture sur la page vue** : le premier message (texte statique de `content/assistant.json`, aucun appel au
   modèle) reprend l'intérêt remarqué et pose la question de découverte. Exemple CliniquePro : « Je vois que vous
   vous intéressez à CliniquePro : vous êtes propriétaire ou responsable d'une clinique ? Et comment gérez-vous
   aujourd'hui vos patients, vos rendez-vous et votre caisse… ? »
4. **Qualification** par le modèle (Claude) : une question à la fois, réponses rapides cliquables, réponses
   fondées uniquement sur la base de connaissances construite à partir de `content/`.
5. **Coordonnées** : après 3-4 échanges (ou à la demande), le modèle appelle `show_contact_form`. Le visiteur remplit
   un formulaire (nom, organisation, e-mail, téléphone/WhatsApp, consentement non pré-coché, résumé visible) →
   `POST /api/lead` existant (`intent` selon la page, `fromBlock: "assistant-ia"`, résumé + pages vues dans `message`).
6. **Démo** : juste après l'envoi, la carte de réservation s'affiche (déterministe, sans appel au modèle). Calendly
   s'ouvre dans le panneau, **chargé seulement après un clic**, pré-rempli (nom, e-mail). L'événement
   `calendly.event_scheduled` (origine vérifiée) confirme la réservation.

Un bouton « Pressé ? Réserver une démo » reste disponible dès le 2ᵉ message : l'entonnoir ne dépend pas du modèle.

## Architecture

| Élément | Fichier |
|---|---|
| Textes éditoriaux (accroches, ouvertures, réponses rapides, axes de découverte, URL Calendly) | `content/assistant.json` (schéma `AssistantConfigSchema`, validé au build + cohérence avec les pages) |
| Contrat client/serveur (Zod, événements de flux) | `src/lib/assistant/protocol.ts` |
| Prompt système (partie stable mise en cache + contexte visiteur) | `src/lib/assistant/prompt.ts` |
| Base de connaissances (solutions, services, formations, contact — sans chiffres non validés) | `src/lib/assistant/knowledge.ts` |
| Outils d'interface du modèle (`suggest_replies`, `show_contact_form`, `show_demo_booking`) | `src/lib/assistant/tools.ts` |
| Chat en streaming NDJSON | `src/app/api/assistant/chat/route.ts` |
| Textes publics d'une page + réglages | `src/app/api/assistant/topic/route.ts` |
| Widget (lanceur, accroche) / panneau (chargé à l'ouverture, ~10 kB gzip) | `src/components/assistant/AssistantWidget.tsx`, `AssistantPanel.tsx` |
| Suivi de parcours, conversation, formulaire, Calendly | `journey.ts`, `useAssistantChat.ts`, `ContactCard.tsx`, `Booking.tsx` |

Le modèle ne reçoit jamais de résultat d'outil et **aucun outil n'écrit en base** : les coordonnées ne partent que du
formulaire validé (client **et** serveur, honeypot, limitation de débit de `/api/lead`).

## Réglages et exploitation

- `ANTHROPIC_API_KEY` (secret, `.env.production` sur le VPS). Sans clé ou en cas de panne : le widget affiche un
  message clair et propose directement le formulaire de coordonnées.
- `ASSISTANT_MODEL` (défaut `claude-opus-5-5` ; `claude-sonnet-5-5` ou `claude-haiku-4-5` pour réduire le coût).
- `ASSISTANT_RATE_LIMIT_PER_10MIN` (défaut 40 / IP) et `ASSISTANT_DAILY_CAP` (défaut 3000 messages / 24 h au total) :
  disjoncteur de coût. Compteurs en mémoire (mono-instance, comme le reste du site).
- URL Calendly : `calendlyUrl` dans `content/assistant.json` (`null` → repli « un consultant vous contacte » + WhatsApp).
- Journalisation : modèle, tokens, `cache_read`, `stop_reason` uniquement (jamais de contenu de conversation).
- nginx : `X-Accel-Buffering: no` + bloc dédié dans `docker/nginx/nginx.conf` ; si le nginx **hôte** met les réponses en
  mémoire tampon (`proxy_buffering on` forcé), le texte n'arrivera qu'à la fin.

## Sécurité et vie privée

- Suivi de parcours uniquement dans `sessionStorage` ; transmis au serveur seulement quand le visiteur écrit.
- Aucun transcript conservé côté serveur. La page `/privacy` (section 8, `#assistant-ia`) décrit le traitement par
  Anthropic (sous-traitant, États-Unis) et Calendly.
- Rendu des messages sans HTML interprété ; liens limités aux chemins du site et à `*.allianceconsultants.net`,
  `immotopia.cloud`, `calendly.com` en https.
- Le modèle ne donne ni prix, ni délais, ni chiffres de gains, ni noms de clients, ni certifications (règles de
  `PRODUCT.md`) ; il décline le hors-sujet et ne révèle pas ses instructions.

## Tests

- Unitaires : `tests/unit/assistant*.test.ts(x)` (protocole, outils, sujets/prompt/KB, route de chat avec SDK simulé,
  rendu de texte).
- E2E : `tests/e2e/assistant.spec.ts` (accroche sous horloge simulée, pages silencieuses, tunnel complet avec API
  simulées, panne du chat, axe WCAG sur le panneau ouvert).

## À valider côté Alliance Consultants

- Relecture juridique de la section 8 de `/privacy` (contrat de sous-traitance et conditions de conservation chez
  Anthropic ; mention Calendly).
- Choix du modèle selon le budget (le coût par conversation se lit dans les journaux : tokens et `cache_read`).
- Textes de `content/assistant.json` (ton, questions de découverte) à relire avec l'équipe commerciale.
