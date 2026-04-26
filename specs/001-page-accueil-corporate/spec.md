# Feature Specification: Page d'accueil corporate Alliance Consultants

**Feature Branch**: `001-page-accueil-corporate`
**Created**: 2026-04-26
**Status**: Draft
**Input**: User description: "Créer la spécification fonctionnelle de la nouvelle page d'accueil de allianceconsultants.net. La page doit repositionner Alliance Consultants comme une marque ombrelle technologique africaine et rendre visible son écosystème complet : DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale, services experts, formations IA et développement, automatisation IA des processus métiers."

## Contexte et alignement constitutionnel

Cette spécification est régie par la constitution du projet ([.specify/memory/constitution.md](../../.specify/memory/constitution.md), v1.0.0).

Ancrages constitutionnels critiques :
- **I. Clarté de positionnement** — un visiteur DOIT comprendre en moins de 10 secondes qu'Alliance Consultants est un éditeur et intégrateur africain de solutions SaaS, IA et métiers.
- **II. Architecture de marque ombrelle** — DocuPro NE DOIT PAS éclipser les autres solutions ; chaque solution répond à : à qui ? quel problème ? quelle action maintenant ?
- **III. Priorité business** — chaque page importante DOIT exposer au moins un CTA business above the fold (desktop ET mobile).
- **IV. Cohérence éditoriale** — sur les pages solutions ; les blocs solution affichés sur l'accueil DOIVENT respecter la même hiérarchie informationnelle.
- **V. Modularité** — les sections et blocs de la page d'accueil DOIVENT être conçus comme composants réutilisables (cartes solution, bloc CTA, bloc FAQ, etc.).
- **VI. Souveraineté de la constitution** — toute décision de contenu, de structure ou de conversion DOIT être conforme à la constitution.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprendre Alliance Consultants en moins de 10 secondes (Priority: P1)

Un décideur B2B (DG, DSI, directeur métier) arrive sur la page d'accueil pour la première fois. Il doit comprendre, sans scroller au-delà de la zone visible (above the fold), qu'Alliance Consultants est un éditeur et intégrateur africain de solutions SaaS, IA et métiers couvrant plusieurs secteurs (GED, santé, immobilier, formation, automatisation), et non un éditeur mono-produit.

**Why this priority**: c'est l'objectif stratégique fondamental de la refonte (cf. Vision et Principe I de la constitution). Sans cette compréhension immédiate, tout le reste du tunnel de conversion s'effondre.

**Independent Test**: tester la promesse de valeur en présentant la zone visible (hero) à un panel de décideurs B2B francophones africains et vérifier qu'au moins 80 % d'entre eux peuvent reformuler correctement, en moins de 10 secondes, le positionnement « éditeur et intégrateur africain de solutions SaaS, IA et métiers, multi-secteurs ».

**Acceptance Scenarios**:

1. **Given** un décideur B2B découvre la page pour la première fois sur desktop, **When** il regarde la zone visible (hero) sans scroller, **Then** il identifie : (a) le nom Alliance Consultants, (b) la nature multi-solutions et multi-secteurs de l'offre, (c) au moins un CTA business explicite (Demander une démo, Découvrir nos solutions, ou Voir les formations IA).
2. **Given** un décideur B2B découvre la page sur mobile, **When** il regarde la zone visible sans scroller, **Then** la promesse de valeur, au moins un CTA business et au moins un élément de réassurance sectorielle restent visibles et lisibles.
3. **Given** un visiteur lit le hero, **When** il cherche à savoir quels secteurs sont couverts, **Then** des badges ou éléments de réassurance présentent au minimum : GED, Santé, Immobilier, IA, Formation, Automatisation.

---

### User Story 2 - Identifier une solution adaptée à son métier et demander une démo (Priority: P1)

Un décideur B2B veut identifier rapidement la solution SaaS pertinente pour son secteur (documentaire, pharmaceutique, ophtalmologique, immobilier, annonces, formation) et déclencher une demande de démo sans frictions.

**Why this priority**: la génération de leads qualifiés via la demande de démo est le CTA principal des pages solutions (Principe III). L'accueil doit faire office de hub vers chaque solution et ne pas masquer une solution au profit d'une autre.

**Independent Test**: vérifier que les six solutions (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale) sont toutes présentes, identifiables, équivalentes en traitement visuel, et qu'un visiteur peut, à partir de l'accueil, atteindre la page d'une solution donnée et déclencher une demande de démo en moins de 3 interactions.

**Acceptance Scenarios**:

1. **Given** un décideur arrive sur l'accueil, **When** il consulte la section solutions, **Then** les 6 cartes solutions sont présentes, et chaque carte affiche : nom, description courte, bénéfice principal, catégorie métier, lien/CTA secondaire vers la page solution dédiée.
2. **Given** la section solutions est affichée, **When** un observateur compare le traitement visuel des cartes, **Then** aucune solution (en particulier DocuPro) n'est mise en avant de manière disproportionnée par taille, couleur, position ou densité de contenu.
3. **Given** un décideur clique sur une carte solution, **When** la navigation se déclenche, **Then** il atterrit sur la page solution correspondante OU sur un CTA « Demander une démo » qualifié pour cette solution.
4. **Given** un décideur du secteur santé, **When** il scrute la page, **Then** il identifie sans ambiguïté MedicPro (gestion réglementaire pharmaceutique) et CliniquePro (gestion de clinique ophtalmologique) comme deux solutions distinctes.

---

### User Story 3 - Découvrir l'offre IA et automatisation, demander l'automatisation d'un processus (Priority: P2)

Un décideur intéressé par l'IA, l'automatisation des processus ou l'analyse documentaire intelligente doit pouvoir, depuis l'accueil, comprendre l'offre IA d'Alliance Consultants et déclencher une demande d'automatisation.

**Why this priority**: l'IA et l'automatisation sont un axe stratégique de différenciation. Le CTA « Automatiser un processus » est un CTA business autorisé par la constitution (Principe III) ; il doit exister sur l'accueil sans dépendre uniquement du menu.

**Independent Test**: vérifier qu'une section dédiée IA / automatisation est présente sur l'accueil, qu'elle décrit les capacités principales (workflows intelligents, analyse documentaire, extraction, classification, intégration métier), et qu'elle expose un CTA « Automatiser un processus ».

**Acceptance Scenarios**:

1. **Given** un décideur arrive sur l'accueil, **When** il scrolle la page, **Then** il rencontre une section IA & automatisation visible sans avoir à utiliser le menu principal.
2. **Given** la section IA est affichée, **When** un décideur la lit, **Then** elle présente au minimum : automatisation de tâches répétitives, workflows intelligents (orchestration), analyse documentaire, extraction d'informations, résumé/classification, intégration de l'IA dans les applications métier.
3. **Given** un décideur souhaite agir, **When** il observe la section IA, **Then** un CTA « Automatiser un processus » est visible et conduit vers le formulaire/contact qualifié.

---

### User Story 4 - Découvrir l'offre formation et demander une formation entreprise (Priority: P2)

Un responsable formation, RH, ou directeur métier doit identifier l'offre formation d'Alliance Consultants (École Digitale et thématiques associées), comprendre les modalités (présentiel, distanciel, intra-entreprise) et déclencher une demande de formation entreprise ou consulter le catalogue.

**Why this priority**: la « demande de formation » est un CTA business explicitement listé dans la constitution (Principe III). L'École Digitale est l'une des six solutions du périmètre MVP.

**Independent Test**: vérifier qu'une section formation existe sur l'accueil, qu'elle liste les thématiques (IA, développement, n8n, SQL Server, GED, gestion de projet), qu'elle indique les modalités, et qu'elle expose deux CTA : « Voir le catalogue » et « Demander une formation entreprise ».

**Acceptance Scenarios**:

1. **Given** un visiteur scrolle l'accueil, **When** il atteint la section École Digitale & formations, **Then** au minimum les thématiques suivantes sont présentes : Formation IA pour entreprises, Développement web/.NET & IA, Automatisation n8n / processus IA, SQL Server, GED & archivage, Gestion de projet.
2. **Given** la section formation est affichée, **When** un visiteur la consulte, **Then** les trois modalités sont indiquées : présentiel, distanciel, intra-entreprise.
3. **Given** la section formation est affichée, **When** un visiteur veut agir, **Then** deux CTA distincts sont visibles : « Voir le catalogue » et « Demander une formation entreprise ».

---

### User Story 5 - Découvrir les services experts et solliciter un service (Priority: P2)

Un décideur en transformation digitale, dématérialisation ou automatisation doit identifier les services experts d'Alliance Consultants (développement spécifique, AMOA, transformation digitale, dématérialisation, scanners) depuis l'accueil et accéder à la page service correspondante.

**Why this priority**: les services experts représentent un axe revenu majeur, distinct des produits SaaS, et complètent l'offre éditeur. Ils doivent être visibles sur l'accueil sans noyer les solutions.

**Independent Test**: vérifier que la section services présente les 5 services attendus, chacun avec titre, description courte, bénéfice et CTA/lien vers la page service.

**Acceptance Scenarios**:

1. **Given** un décideur scrolle l'accueil, **When** il atteint la section services, **Then** les 5 services sont présentés : Développement spécifique / SaaS métier, Assistance à maîtrise d'ouvrage, Consultance transformation digitale, Dématérialisation des archives, Vente et intégration de scanners professionnels.
2. **Given** une carte service est affichée, **When** un décideur la lit, **Then** elle expose : titre, description courte, bénéfice, CTA/lien vers la page service.

---

### User Story 6 - Évaluer la crédibilité avant de convertir (Priority: P3)

Un décideur prudent, avant de demander une démo ou un contact, veut évaluer la crédibilité d'Alliance Consultants : références, ancienneté, secteurs servis, technologies maîtrisées, méthode.

**Why this priority**: la confiance B2B est conditionnée par la crédibilité affichée. La constitution exige des éléments de confiance sur les pages solutions ; sur l'accueil, ils servent à débloquer la conversion des prospects qualifiés mais hésitants.

**Independent Test**: vérifier qu'une section références/crédibilité existe (logos validés, secteurs, historique 2003 / 2006 / 2013 / 2026, chiffres clés validés, témoignages si disponibles) et qu'une section technologies & méthode présente brièvement les compétences techniques clés.

**Acceptance Scenarios**:

1. **Given** un décideur scrolle l'accueil, **When** il atteint la section références, **Then** au moins l'historique (2003, 2006, 2013, 2026) et les secteurs servis sont visibles ; les logos clients et chiffres clés ne sont affichés que s'ils sont validés ; aucun logo ou chiffre placeholder n'est visible.
2. **Given** un décideur veut comprendre la méthode et les technologies, **When** il consulte la section technologies & méthode, **Then** elle présente brièvement : .NET / ASP.NET Core, SQL Server / PostgreSQL / MySQL, Angular ou frontend moderne, Docker / CI-CD, IA / LLM, n8n, intégration API, approche agile et accompagnement métier.

---

### User Story 7 - Conclure la visite par une demande de contact ou de démo (Priority: P1)

Un décideur ayant parcouru la page doit pouvoir conclure sa visite par une action business : demander une démo, contacter le commercial, ou être redirigé vers la page Contact & Démo via un bloc CTA final fort.

**Why this priority**: la conversion finale est l'objectif business numéro un de la page d'accueil (Principe III). Sans bloc final clair, le taux de conversion s'effondre même si la page a tenu sur le reste.

**Independent Test**: vérifier la présence d'un bloc CTA final (titre fort, sous-titre, CTA principal vers Contact & Démo) et la présence soit d'un formulaire court intégré sur l'accueil, soit d'une redirection vers `/contact-demo`.

**Acceptance Scenarios**:

1. **Given** un décideur arrive en bas de page, **When** il observe la zone finale, **Then** un bloc CTA final est présent avec un titre fort orienté écosystème (par défaut : « Un projet SaaS, GED, immobilier, santé ou IA ? Parlons-en. ») et un CTA principal qui mène vers Contact & Démo.
2. **Given** un formulaire court est intégré sur l'accueil, **When** un décideur le consulte, **Then** il comporte au minimum les champs : nom, email, téléphone, organisation, solution d'intérêt, message, et une case de consentement explicite à la politique de confidentialité (case non pré-cochée).
3. **Given** la page d'accueil ne porte pas de formulaire intégré, **When** un décideur clique sur le CTA final, **Then** il est redirigé vers `/contact-demo` sans perte d'intention.

---

### Edge Cases

- **Visiteur sur connexion lente (3G simulée)** : la promesse de valeur (texte + CTA principal) DOIT être lisible et actionnable dès que la zone visible est rendue, sans attendre le chargement complet des images de fond ou des assets non critiques.
- **Visiteur avec JavaScript désactivé** : les contenus essentiels (promesse, navigation, cartes solutions, services, formations, footer, coordonnées, liens vers les pages solutions/services/formations/contact) DOIVENT rester accessibles ; les fonctionnalités enrichies (animations, micro-interactions) peuvent être dégradées gracieusement.
- **Visiteur en navigation clavier uniquement** : tous les CTA, liens, cartes solutions/services et champs de formulaire DOIVENT être atteignables et activables au clavier, avec un focus visible.
- **Visiteur utilisant un lecteur d'écran** : la structure sémantique (header, nav, main, sections, footer) DOIT permettre une lecture cohérente ; les images informatives portent un `alt` pertinent, les images décoratives un `alt` vide.
- **Visiteur configurant `prefers-reduced-motion`** : les animations DOIVENT être réduites ou supprimées.
- **Saisie incomplète ou invalide du formulaire** : la validation client ET serveur DOIT empêcher la soumission, afficher un message clair en français, et préserver les saisies déjà valides.
- **Tentative de spam sur le formulaire** : une protection anti-spam (honeypot, captcha discret ou équivalent) DOIT bloquer les soumissions automatisées sans gêner les humains.
- **Visiteur arrivant via un lien profond avec ancre (ex. `#solutions`)** : la section ciblée DOIT être atteinte avec un offset correct (le header sticky ne doit pas masquer le titre de section).
- **Visiteur consultant la page sur tablette en orientation paysage et portrait** : le rendu DOIT rester sans régression de contenu ni de CTA.

## Requirements *(mandatory)*

### Functional Requirements

#### Hero principal

- **FR-001** : la page DOIT afficher un hero en zone visible (above the fold) sur desktop, tablette et mobile, contenant : un titre fort, un sous-titre, une promesse de valeur orientée SaaS / IA / GED / santé / immobilier / formation, et 1 à 3 CTA business (maximum 3).
- **FR-002** : le titre par défaut DOIT être : « Solutions SaaS, IA et transformation digitale pour les organisations africaines », ajustable en validation éditoriale sans changer le sens.
- **FR-003** : le sous-titre par défaut DOIT être : « Alliance Consultants développe des plateformes métiers pour la GED, la santé, l'immobilier, les annonces web, l'automatisation des processus et la formation digitale. », ajustable en validation éditoriale sans changer le sens.
- **FR-004** : les CTA principaux du hero DOIVENT être au maximum 3, choisis parmi : « Demander une démo », « Découvrir nos solutions », « Voir les formations IA ». Le CTA « Demander une démo » DOIT être présent et hiérarchiquement dominant.
- **FR-005** : le hero DOIT exposer des badges ou éléments de réassurance couvrant au minimum : GED, Santé, Immobilier, IA, Formation, Automatisation.
- **FR-006** : le hero NE DOIT PAS donner l'impression d'un produit unique ; aucun bloc « produit phare » centré sur DocuPro n'est autorisé.

#### Section solutions SaaS

- **FR-010** : la page DOIT contenir une section solutions présentant exactement les 6 solutions du périmètre MVP : DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale.
- **FR-011** : chaque carte solution DOIT contenir : nom de la solution, description courte, bénéfice principal, catégorie métier, lien ou CTA secondaire vers la page solution dédiée. Une icône représentative PEUT être ajoutée.
- **FR-012** : aucune solution ne DOIT bénéficier d'un traitement visuel disproportionné (taille, position, couleur, densité de contenu) par rapport aux autres ; en particulier, DocuPro ne doit pas éclipser les autres solutions.
- **FR-013** : les descriptions DOIVENT refléter, pour chaque solution, son cœur fonctionnel :
  - DocuPro Suite : GED, archivage, courriers, workflows documentaires.
  - MedicPro : gestion réglementaire pharmaceutique (AMM, visas, produits, pays, stocks, ventes, reporting).
  - CliniquePro : gestion complète de clinique ophtalmologique (patients, rendez-vous, consultations, examens, assurances, facturation, caisse).
  - ImmoTopia.cloud : logiciel immobilier cloud (gestion locative, syndic, promotion, paiements, CRM immobilier).
  - Annonces Web : portail d'annonces immobilières (rechercher, publier, mettre en avant des biens).
  - École Digitale : formations IA, développement logiciel, SQL Server, GED, gestion de projet, automatisation.

#### Section IA & automatisation

- **FR-020** : la page DOIT contenir une section dédiée à l'IA et à l'automatisation des processus métiers, accessible sans utiliser le menu (présence sur la page d'accueil par scroll).
- **FR-021** : la section IA DOIT décrire au minimum : automatisation de tâches répétitives, workflows intelligents (orchestration), analyse documentaire, extraction d'informations, résumé et classification, intégration de l'IA dans les applications métier, développement de processus métiers automatisés.
- **FR-022** : la section IA DOIT exposer un CTA « Automatiser un processus » menant au formulaire ou à la page Contact & Démo qualifiée.

#### Section services experts

- **FR-030** : la page DOIT contenir une section services présentant les 5 services suivants : Développement spécifique / SaaS métier, Assistance à maîtrise d'ouvrage, Consultance transformation digitale, Dématérialisation des archives, Vente et intégration de scanners professionnels.
- **FR-031** : chaque carte service DOIT contenir : titre, description courte, bénéfice, CTA ou lien vers la page service correspondante.

#### Section École Digitale & formations

- **FR-040** : la page DOIT contenir une section formations présentant au minimum : Formation IA pour entreprises, Développement web/.NET & IA, Automatisation n8n / processus IA, SQL Server, GED & archivage, Gestion de projet.
- **FR-041** : la section formation DOIT indiquer les trois modalités : présentiel, distanciel, intra-entreprise.
- **FR-042** : la section formation DOIT exposer deux CTA : « Voir le catalogue » et « Demander une formation entreprise ».

#### Section références et crédibilité

- **FR-050** : la page DOIT contenir une section crédibilité, comportant : logos clients (uniquement validés), secteurs servis, historique de la marque (2003, 2006, 2013, 2026), chiffres clés (uniquement validés), témoignages ou cas clients (si disponibles).
- **FR-051** : aucun logo, chiffre, témoignage ou cas client placeholder ou non validé NE DOIT être affiché. Si l'élément n'est pas disponible, il doit être omis ; le bloc résiduel doit rester équilibré visuellement.

#### Section technologies et méthode

- **FR-060** : la page DOIT contenir une section technologies & méthode présentant brièvement : .NET / ASP.NET Core, SQL Server / PostgreSQL / MySQL, Angular ou frontend moderne, Docker / CI-CD, IA / LLM, n8n, intégration API, approche agile et accompagnement métier.

#### CTA final

- **FR-070** : la page DOIT se terminer par un bloc CTA final fort, avec un titre orienté écosystème. Titre par défaut : « Un projet SaaS, GED, immobilier, santé ou IA ? Parlons-en. »
- **FR-071** : le CTA final DOIT mener à la page Contact & Démo (`/contact-demo`).

#### Formulaire de contact / redirection

- **FR-080** : la page d'accueil DOIT, au choix, soit intégrer un formulaire court de contact, soit rediriger vers `/contact-demo`. Le choix DOIT être unique pour le MVP et documenté lors de la phase plan.
- **FR-081** : si un formulaire est intégré sur l'accueil, il DOIT comporter les champs : nom, email, téléphone, organisation, solution d'intérêt (sélection liée aux 6 solutions), message, case de consentement explicite à la politique de confidentialité (non pré-cochée).
- **FR-082** : tout formulaire DOIT être validé côté client ET côté serveur, et intégrer une protection anti-spam (honeypot, captcha discret, ou équivalent).
- **FR-083** : la finalité de la collecte de données DOIT être affichée clairement à proximité du formulaire ; un lien vers la politique de confidentialité DOIT être présent.

#### Header et footer globaux

- **FR-090** : la page d'accueil DOIT utiliser le header global du site, contenant le menu principal : Accueil, Solutions, Services, Formations, Références, Ressources, À propos, Contact & Démo.
- **FR-091** : la page d'accueil DOIT utiliser le footer global du site, contenant : liens solutions, liens services, liens formations, liens ressources, coordonnées officielles centralisées, liens légaux (mentions légales, politique de confidentialité, conditions d'utilisation).
- **FR-092** : header et footer DOIVENT exposer les coordonnées officielles depuis une source unique (centralisée), sans duplication ni divergence entre header, footer, formulaire et page contact.

#### SEO

- **FR-100** : la page d'accueil DOIT exposer un H1 unique aligné sur la promesse de valeur du hero.
- **FR-101** : la page DOIT exposer un title SEO unique (< 60 caractères) et une meta description unique (< 160 caractères) orientée bénéfice multi-secteurs.
- **FR-102** : la structure des titres DOIT respecter une hiérarchie H2/H3 propre, sans saut de niveau.
- **FR-103** : les contenus principaux DOIVENT être indexables (texte HTML, pas uniquement de l'image).
- **FR-104** : le maillage interne DOIT être présent : chaque carte solution renvoie vers sa page solution, chaque carte service vers sa page service, la section formation vers les pages formations, le CTA final vers Contact & Démo.
- **FR-105** : la page DOIT exposer des données structurées JSON-LD `Organization` (raison sociale, logo, coordonnées, réseaux sociaux). Les types `Product`, `Service`, `FAQPage`, `BreadcrumbList` peuvent être ajoutés s'ils sont pertinents au contenu réellement présent.

#### UX, accessibilité, performance

- **FR-110** : la page DOIT être responsive (desktop, tablette, mobile) sans régression de contenu ni de CTA, en approche mobile-first.
- **FR-111** : le contraste texte/fond DOIT respecter WCAG AA (ratio ≥ 4.5:1 pour le texte courant).
- **FR-112** : la taille du texte courant sur mobile DOIT être ≥ 16 px.
- **FR-113** : tous les éléments interactifs (menu, liens, boutons, cartes cliquables, champs de formulaire) DOIVENT être atteignables au clavier avec un focus visible.
- **FR-114** : les images DOIVENT être optimisées (compression, formats modernes, dimensions adaptées, lazy loading pour le hors-écran) ; les images informatives portent un `alt` pertinent, les images décoratives un `alt` vide.
- **FR-115** : les animations DOIVENT rester discrètes et utiles, et respecter `prefers-reduced-motion` quand applicable. Aucune animation bloquante.
- **FR-116** : aucun placeholder visible (lorem ipsum, image bouchon, lien `#`, mention de template, libellé non traduit, mention « Edit Template ») NE DOIT être présent.

#### Sécurité et confidentialité

- **FR-120** : aucune clé API ni secret NE DOIT être présent dans le HTML, le JS publié ou les commentaires.
- **FR-121** : la page DOIT être servie en HTTPS en production ; les requêtes HTTP DOIVENT être redirigées vers HTTPS.
- **FR-122** : la page DOIT exposer un lien vers la politique de confidentialité depuis le footer.
- **FR-123** : si des cookies non strictement nécessaires sont utilisés, un mécanisme de consentement conforme DOIT être prévu (le détail relève du plan).

#### Gouvernance éditoriale

- **FR-130** : tous les contenus DOIVENT être rédigés en français professionnel, clair, sans jargon inutile.
- **FR-131** : le ton DOIT être crédible, moderne, rassurant, commercial sans exagération ; aucun superlatif gratuit (« le meilleur », « le numéro un ») sans preuve.
- **FR-132** : aucune mention parasite ou héritée d'un ancien template (exemple : « Institut Froebel ») NE DOIT être présente.
- **FR-133** : le nom de marque, le nom des solutions et les libellés des CTA DOIVENT être strictement cohérents avec ceux utilisés sur les autres pages du site.

### Key Entities *(content blocks involved)*

Cette feature porte sur une page éditoriale ; les « entités » sont des blocs de contenu réutilisables :

- **Solution card** : représente une solution SaaS de l'écosystème. Attributs : nom, description courte, bénéfice principal, catégorie métier, icône optionnelle, lien vers page solution, libellé du CTA secondaire.
- **Service card** : représente un service expert. Attributs : titre, description courte, bénéfice, lien vers page service, libellé du CTA secondaire.
- **Training offer** : représente une thématique de formation. Attributs : intitulé, description courte, modalités (présentiel / distanciel / intra-entreprise), lien vers le détail.
- **Reference / proof element** : représente un élément de crédibilité. Variantes : logo client, secteur servi, jalon historique (année + libellé), chiffre clé (libellé + valeur + source), témoignage (citation + auteur + organisation), cas client (titre + résumé). Toutes les instances DOIVENT être validées avant publication.
- **CTA block** : représente un appel à l'action contextuel. Attributs : titre, sous-titre optionnel, libellé du CTA principal, destination, libellé/destination du CTA secondaire optionnel.
- **Lead form** : formulaire de contact qualifié. Attributs : nom, email, téléphone, organisation, solution d'intérêt, message, consentement à la politique de confidentialité.
- **Tech & method block** : présentation synthétique des compétences techniques et de la méthode. Attributs : liste de compétences techniques, énoncé méthode (agile, accompagnement métier).
- **Reassurance badge** : élément graphique indiquant un domaine de compétence (GED, Santé, Immobilier, IA, Formation, Automatisation). Attributs : libellé, icône optionnelle.
- **Global header / Global footer** : composants partagés à toute la page. Attributs : menu principal (header), liens groupés solutions/services/formations/ressources (footer), coordonnées centralisées, liens légaux.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : au moins 80 % d'un panel de décideurs B2B francophones africains testés peuvent reformuler correctement, en moins de 10 secondes, le positionnement « éditeur et intégrateur africain de solutions SaaS, IA et métiers, multi-secteurs » après avoir vu uniquement la zone visible (hero) de la page.
- **SC-002** : 100 % des six solutions du périmètre MVP (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale) sont visibles sur la page d'accueil sans utiliser le menu, et chaque solution est identifiable par nom + description + bénéfice + lien.
- **SC-003** : aucune solution n'occupe plus de 1,2 fois la surface ou la densité de contenu d'une autre solution dans la section solutions (mesure de non-domination de DocuPro et alignement sur le Principe II).
- **SC-004** : la section IA & automatisation et la section formations sont accessibles par scroll depuis l'accueil sans dépendre du menu (vérifié sur desktop et mobile).
- **SC-005** : au moins un CTA business (« Demander une démo », « Découvrir nos solutions », « Voir les formations IA », « Automatiser un processus ») est visible above the fold sur desktop ET sur mobile.
- **SC-006** : le bloc CTA final est présent en bas de page et conduit à `/contact-demo` sans étape parasite.
- **SC-007** : sur mobile, le score Lighthouse Performance des pages clés (dont l'accueil) est ≥ 85 (objectif aligné sur la constitution).
- **SC-008** : la page passe une revue d'accessibilité de niveau WCAG AA sur les critères suivants : contraste du texte courant ≥ 4.5:1, taille de texte courant mobile ≥ 16 px, navigation clavier complète, alternatives textuelles présentes pour les images informatives.
- **SC-009** : zéro élément placeholder visible sur la page (lorem ipsum, image bouchon, lien `#`, libellé non traduit, mention « Edit Template », « Get Consultation Now! », « Institut Froebel », etc.) — vérifié par revue éditoriale obligatoire avant publication.
- **SC-010** : zéro libellé en anglais non intentionnel dans les CTA, formulaires, menus ou microcopy de la page (le ton et la langue sont français professionnel).
- **SC-011** : zéro divergence des coordonnées (adresse, téléphones, e-mails, réseaux sociaux) entre header, footer, formulaire et page Contact & Démo (source unique centralisée).
- **SC-012** : 100 % des cartes solution renvoient vers leur page solution dédiée (maillage interne complet) ; 100 % des cartes service renvoient vers leur page service ; la section formations renvoie vers les pages formations ; le bloc CTA final renvoie vers Contact & Démo.
- **SC-013** : le formulaire (s'il est intégré) refuse les soumissions invalides (validation client + serveur), affiche les erreurs en français, et bloque les soumissions automatisées (anti-spam) sans gêner les humains.
- **SC-014** : la page expose des données structurées JSON-LD `Organization` valides (vérifiables par un outil de validation public).
- **SC-015** : la page contient un H1 unique, un title SEO unique < 60 caractères, une meta description unique < 160 caractères, et une hiérarchie H2/H3 sans saut de niveau.

## Assumptions

- **A-01** : la cible primaire est constituée de décideurs B2B francophones de l'Afrique francophone (DG, DSI, directeurs métier, responsables qualité, dirigeants PME/ETI). Les contenus sont rédigés en français professionnel.
- **A-02** : la marque ombrelle est « Alliance Consultants » ; les six solutions SaaS du périmètre MVP sont stables et nommées comme indiqué (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale).
- **A-03** : les pages solutions, services, formations et la page Contact & Démo seront livrées dans des features ultérieures ; la page d'accueil ne dépend que de leur existence d'URL pour le maillage interne (les liens DOIVENT exister fonctionnellement à la mise en production de l'accueil).
- **A-04** : le périmètre du MVP exigé par la constitution (accueil, 6 pages solutions, pages services, pages formations, page références, page à propos, page Contact & Démo, footer harmonisé, formulaires qualifiés) reste stable. Aucune solution du périmètre MVP n'est retirée.
- **A-05** : les coordonnées officielles, logos clients validés, chiffres clés validés et historique de la marque sont fournis et validés par le porteur du projet avant publication. À défaut, les éléments non validés sont omis (pas de placeholder).
- **A-06** : la politique de confidentialité et les mentions légales sont disponibles et accessibles depuis le footer à la mise en production.
- **A-07** : le site est servi en HTTPS en production, avec redirection HTTP→HTTPS systématique.
- **A-08** : la page d'accueil utilise le header et footer globaux ; ces composants relèvent d'une feature transverse et peuvent être livrés ou stabilisés en parallèle, mais leur API d'usage (menu principal, groupes de liens du footer, coordonnées centralisées) est conforme aux exigences listées ici.
- **A-09** : le choix « formulaire intégré sur l'accueil » vs « redirection vers `/contact-demo` » sera tranché lors de la phase plan, en fonction des arbitrages UX et performance ; les deux options restent conformes à la spec.

## Hors périmètre

- Pas de développement de composants ni d'implémentation dans cette feature de spec.
- Pas de création des pages solutions détaillées (chaque solution fera l'objet d'une feature dédiée).
- Pas de création du CMS ni du back-office d'édition.
- Pas d'intégration backend du formulaire (envoi e-mail, persistance, anti-spam serveur) ; ces points relèveront du plan ultérieur.
- Pas d'animations complexes (au-delà de micro-interactions discrètes prévues par la constitution).
- Pas d'implémentation du design system complet ; cette spec n'engage que les composants/blocs strictement nécessaires à la page d'accueil.
- Pas de création des pages Références, À propos, Ressources, Mentions légales, Politique de confidentialité, qui font l'objet de features distinctes.
