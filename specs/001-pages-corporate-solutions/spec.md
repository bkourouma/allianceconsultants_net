# Feature Specification: Pages détaillées des solutions corporate

**Feature Branch**: `001-pages-corporate-solutions`
**Created**: 2026-04-26
**Status**: Draft
**Input**: User description: "pages détaillées des solutions corporate — DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Décideur évalue une solution SaaS verticale (Priority: P1)

Un décideur (DG, DSI, directeur métier) arrive sur le site `allianceconsultants.net` depuis une recherche ou un partage de lien, clique sur une solution (par exemple « MedicPro » ou « ImmoTopia.cloud ») et accède à une page dédiée qui lui permet, en moins de cinq minutes, de comprendre la proposition de valeur, les fonctionnalités clés, les bénéfices métiers, les cibles, les preuves (références, captures, schémas) et de déclencher une demande de démo qualifiée.

**Why this priority**: C'est le parcours commercial principal du site : sans pages produit complètes et auto-suffisantes, l'écosystème Alliance Consultants reste illisible et les leads B2B ne sont pas générés. Toutes les autres pages (accueil, blog, références) renvoient vers ces pages produit.

**Independent Test**: Pour chaque solution, un visiteur non préparé peut atteindre la page depuis l'accueil ou un lien direct, lire le contenu sans aide externe, et compléter le formulaire « Demander une démo » spécifique à la solution. Le test réussit si la page se suffit à elle-même (proposition de valeur, fonctionnalités, cibles, preuves, CTA actif).

**Acceptance Scenarios**:

1. **Given** un visiteur arrive sur la page d'une solution depuis le menu ou l'accueil, **When** il fait défiler la page, **Then** il voit successivement : un hero avec titre + sous-titre + CTA principal, un bloc proposition de valeur, un bloc cibles / cas d'usage, une grille de fonctionnalités, un bloc bénéfices métier, des preuves (références, captures, témoignages), une FAQ, et un formulaire de contact / démo en bas de page.
2. **Given** un visiteur clique sur le CTA principal « Demander une démo », **When** il soumet le formulaire pré-rempli avec le nom de la solution, **Then** sa demande est enregistrée et associée explicitement à la solution concernée, et il reçoit une confirmation visible.
3. **Given** un visiteur partage l'URL d'une page solution sur les réseaux sociaux ou par email, **When** le lien est ouvert dans un autre contexte, **Then** la page affiche un aperçu (titre, description, image) propre à la solution.

---

### User Story 2 — Comparaison entre solutions de la même verticale (Priority: P2)

Un visiteur du secteur santé souhaite comprendre la différence entre **MedicPro** (médical général) et **CliniquePro** (cliniques / établissements). De la même manière, un acteur immobilier veut distinguer **ImmoTopia.cloud** (gestion) et **Annonces Web** (diffusion d'annonces). Chaque page doit clarifier son périmètre par rapport aux solutions sœurs et proposer une navigation croisée.

**Why this priority**: Le risque commercial est qu'un prospect choisisse la mauvaise solution ou abandonne par confusion. Cela touche en particulier les paires santé (MedicPro / CliniquePro) et immobilier (ImmoTopia / Annonces Web).

**Independent Test**: Sur la page MedicPro, le visiteur identifie en moins d'une minute qu'il existe une offre dédiée cliniques (CliniquePro) et accède à la page comparable. Idem pour la paire ImmoTopia / Annonces Web.

**Acceptance Scenarios**:

1. **Given** un visiteur est sur la page MedicPro, **When** il atteint la section « Pour qui ? » ou « Solutions associées », **Then** il voit un bloc qui mentionne CliniquePro avec un lien direct et une phrase de différenciation.
2. **Given** un visiteur est sur la page ImmoTopia.cloud, **When** il consulte la section solutions associées, **Then** il voit Annonces Web mentionné avec sa différence d'usage et un lien.

---

### User Story 3 — Découverte de l'offre formation depuis l'écosystème (Priority: P2)

Un visiteur intéressé par la montée en compétence (DRH, responsable formation, apprenant) accède à la page **École Digitale** depuis le menu principal et y trouve l'offre de formations (IA, développement, GED, gestion de projet), avec pour chaque catégorie : objectifs, public, durée indicative, modalités et un CTA « S'inscrire » ou « Demander un programme ».

**Why this priority**: École Digitale est la solution transversale qui connecte les autres (formations IA pour automatiser DocuPro, MedicPro, etc.) et constitue un canal d'acquisition complémentaire. Sa page doit être complète mais peut suivre les pages produit prioritaires.

**Independent Test**: Un visiteur arrive sur la page École Digitale, identifie au moins quatre catégories de formations distinctes, et déclenche une demande sur l'une d'elles.

**Acceptance Scenarios**:

1. **Given** un visiteur ouvre la page École Digitale, **When** il fait défiler, **Then** il voit la liste des catégories de formations avec, pour chacune, un résumé, le public cible et un CTA d'inscription ou de demande de programme.
2. **Given** un visiteur clique sur une catégorie de formation, **When** la page de catégorie ou la modale s'affiche, **Then** il voit objectifs, programme indicatif, modalités, et peut soumettre une demande nominative.

---

### Edge Cases

- Que se passe-t-il si une solution n'a pas encore de référence client publiable ? La section « Références / Preuves » affiche des cas d'usage anonymisés ou des chiffres sectoriels plutôt que d'être vide.
- Que se passe-t-il si l'utilisateur soumet le formulaire de démo sans avoir choisi de solution (formulaire générique en bas de page) ? Le formulaire associe automatiquement la solution courante à la demande, ou demande explicitement le choix si invoqué hors page produit.
- Que se passe-t-il si une page solution est ouverte sur mobile en condition réseau dégradée ? Le contenu textuel et la proposition de valeur restent lisibles avant le chargement des médias lourds (captures, vidéos), et le CTA reste actionnable.
- Que se passe-t-il si une solution évolue (ajout d'un module, changement de positionnement) ? Le contenu doit pouvoir être mis à jour via un CMS sans intervention de développement.
- Que se passe-t-il si le visiteur arrive sur l'URL d'un sous-domaine produit (par exemple `docupro.allianceconsultants.net` ou `immotopia.cloud`) ? La page corporate doit clarifier le lien avec le site produit et proposer une navigation cohérente sans contenu dupliqué confondant pour le SEO.
- Que se passe-t-il si la langue du visiteur n'est pas le français ? Le périmètre MVP est francophone ; un mécanisme d'extension multilingue doit rester possible sans refonte structurelle.

## Requirements *(mandatory)*

### Functional Requirements

#### Couverture et structure des pages

- **FR-001**: Le site DOIT proposer une page dédiée pour chacune des six solutions corporate suivantes : DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale.
- **FR-002**: Chaque page solution DOIT être accessible depuis le menu principal du site et depuis la page d'accueil via un bloc « Nos solutions ».
- **FR-003**: Chaque page solution DOIT comporter au minimum les sections suivantes, dans l'ordre : (a) hero (titre, sous-titre, visuel, CTA principal), (b) proposition de valeur, (c) public cible / cas d'usage, (d) fonctionnalités clés organisées par modules ou thèmes, (e) bénéfices métier mesurables, (f) preuves (références, captures, schémas, chiffres ou témoignages), (g) FAQ, (h) bloc « solutions associées », (i) formulaire de demande de démo ou de contact qualifié.
- **FR-004**: Chaque page solution DOIT pouvoir être lue de manière autonome, sans nécessiter la consultation d'une autre page pour comprendre la valeur proposée.

#### Conversion et CTA

- **FR-005**: Chaque page solution DOIT exposer au moins un CTA principal de conversion (« Demander une démo » ou équivalent contextualisé) visible sans défilement sur écrans desktop standard.
- **FR-006**: Le formulaire de contact / démo de chaque page DOIT pré-renseigner ou enregistrer automatiquement le nom de la solution concernée afin que la demande soit qualifiée à la source.
- **FR-007**: Chaque demande soumise DOIT déclencher une notification au destinataire commercial désigné et présenter à l'utilisateur une confirmation explicite de réception.
- **FR-008**: Chaque page solution DOIT proposer au moins un CTA secondaire (par exemple « Parler à un expert », « Télécharger la brochure », « Voir une démo vidéo »).

#### Navigation entre solutions

- **FR-009**: Les pages MedicPro et CliniquePro DOIVENT comporter un bloc explicite de différenciation et de renvoi croisé l'une vers l'autre.
- **FR-010**: Les pages ImmoTopia.cloud et Annonces Web DOIVENT comporter un bloc explicite de différenciation et de renvoi croisé l'une vers l'autre.
- **FR-011**: Chaque page solution DOIT comporter un bloc « solutions associées » qui propose au moins deux autres solutions de l'écosystème pertinentes pour la cible.

#### Contenu et gestion éditoriale

- **FR-012**: Le contenu de chaque page solution (textes, images, fonctionnalités, FAQ, témoignages) DOIT pouvoir être édité via un CMS sans intervention de développement.
- **FR-013**: Chaque page solution DOIT permettre l'ajout, la suppression ou la réorganisation de modules de fonctionnalités sans casser la mise en page.
- **FR-014**: Les coordonnées (email, téléphone, adresse) affichées sur les pages solutions DOIVENT être centralisées et harmonisées avec le reste du site.
- **FR-015**: Les éléments parasites de template (par exemple « Edit Template », mentions étrangères comme « Institut Froebel » sur le footer) DOIVENT être absents des pages solutions livrées.

#### SEO, partage et accessibilité

- **FR-016**: Chaque page solution DOIT exposer un titre SEO (title), une meta-description, des balises de partage social (Open Graph / cartes Twitter) et une URL lisible et stable propre à la solution.
- **FR-017**: Chaque page solution DOIT inclure des données structurées décrivant le produit ou service présenté pour favoriser l'indexation enrichie.
- **FR-018**: Chaque page solution DOIT être pleinement responsive et utilisable sur mobile, tablette et desktop.
- **FR-019**: Chaque page solution DOIT respecter les bonnes pratiques d'accessibilité de niveau WCAG 2.1 AA pour le contenu critique (contrastes, navigation clavier, alternatives textuelles).
- **FR-020**: Chaque page solution DOIT se charger suffisamment rapidement pour que la proposition de valeur principale soit lisible avant le chargement complet des médias lourds.

#### Cohérence et mesure

- **FR-021**: Les pages solutions DOIVENT partager une charte graphique et une grille de composants commune au site corporate (hero, grille de fonctionnalités, bloc preuves, FAQ, formulaire) pour garantir la cohérence visuelle et faciliter la maintenance.
- **FR-022**: Chaque page solution DOIT être instrumentée pour mesurer au minimum : nombre de visites uniques, profondeur de défilement, clics sur CTA principal et secondaire, soumissions de formulaire, et solution d'origine de chaque conversion.
- **FR-023**: La relation avec les sous-domaines ou sites produits existants (par exemple `docupro.allianceconsultants.net`, `immotopia.cloud`) DOIT être explicite sur chaque page solution concernée, avec un lien sortant clair et sans contenu dupliqué nuisible au SEO.

### Key Entities

- **Solution corporate** : Une offre commercialisée par Alliance Consultants (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale). Attributs : nom, slogan, proposition de valeur, cibles, modules / fonctionnalités, bénéfices, preuves, FAQ, CTA, URL, métadonnées SEO, lien éventuel vers un site ou sous-domaine produit.
- **Module / fonctionnalité** : Élément composant la grille de fonctionnalités d'une solution. Attributs : titre, description courte, icône ou visuel, regroupement thématique éventuel.
- **Cas d'usage / cible** : Description d'un type d'organisation ou de rôle utilisateur, attaché à une ou plusieurs solutions. Attributs : libellé, secteur, problème adressé, bénéfice, lien vers la solution.
- **Référence / preuve** : Élément de preuve attaché à une solution (logo client, témoignage, étude de cas, chiffre clé). Attributs : type, contenu, autorisation de publication, lien éventuel.
- **Demande de démo / contact qualifié** : Soumission de formulaire associée à une solution. Attributs : identité du demandeur, organisation, besoin, solution d'origine, canal de contact souhaité, horodatage, statut de traitement.
- **Catégorie de formation** (spécifique à École Digitale) : Regroupement thématique d'offres de formation. Attributs : titre, public cible, objectifs, modalités indicatives, CTA.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des six solutions citées (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web, École Digitale) disposent d'une page dédiée publiée et accessible depuis le menu principal à la mise en ligne.
- **SC-002**: Un visiteur non préparé peut comprendre la proposition de valeur d'une solution et déclencher une demande de démo en moins de cinq minutes lors d'un test utilisateur, sur au moins quatre des six solutions.
- **SC-003**: Au moins 80 % des participants à un test utilisateur identifient correctement la différence entre MedicPro et CliniquePro, et entre ImmoTopia.cloud et Annonces Web, après lecture des pages concernées.
- **SC-004**: Chaque demande de démo soumise depuis une page solution est correctement attribuée à la solution d'origine dans 100 % des cas mesurés.
- **SC-005**: Le taux de conversion (visite de la page solution → soumission du formulaire de démo ou contact) atteint au minimum 1,5 % en moyenne sur les trois mois suivant la mise en ligne, avec un objectif cible de 3 %.
- **SC-006**: Le temps moyen passé sur les pages solutions est d'au moins 90 secondes, indiquant une lecture effective du contenu.
- **SC-007**: Les six pages solutions obtiennent un score d'audit qualité (performance, accessibilité, bonnes pratiques, SEO) supérieur ou égal à 85 / 100 sur les outils d'audit standards, sur mobile comme sur desktop.
- **SC-008**: Les pages solutions sont indexées par les moteurs de recherche dans les quatre semaines suivant la mise en ligne et apparaissent dans les résultats pour au moins une requête cible identifiée par solution.
- **SC-009**: Aucun élément parasite de template (mentions étrangères, libellés type « Edit Template », coordonnées contradictoires) n'est présent sur les pages solutions livrées, mesuré par revue éditoriale avant mise en ligne.
- **SC-010**: Les pages peuvent être mises à jour (ajout / modification d'une fonctionnalité, d'une référence, d'une FAQ) par une équipe éditoriale en moins de 30 minutes par modification simple, sans intervention de développement.

## Assumptions

- Le périmètre couvre la création des **pages corporate** présentant chaque solution sur `allianceconsultants.net` ; il n'inclut pas la refonte des applications SaaS elles-mêmes ni de leurs interfaces produit.
- La langue de publication initiale est le **français**, conformément au public cible africain francophone et au reste du site.
- Les contenus métiers de référence existent déjà dans `docs/` (PRD, fiches fonctionnalités MedicPro, CliniquePro, ImmoTopia, Annonces Web, École Digitale) et serviront de matière première éditoriale ; un travail de rédaction marketing reste nécessaire pour les transformer en pages publiques.
- Une charte graphique et un système de composants pour le site corporate refondu existent ou seront définis en parallèle dans une autre spécification ; cette spécification consomme ces composants sans les définir.
- Les sous-domaines et sites produits existants (`docupro.allianceconsultants.net`, `immotopia.cloud`, etc.) restent en place ; les pages corporate pointent vers eux mais ne s'y substituent pas.
- L'envoi des notifications de demande de démo s'appuie sur le canal e-mail commercial existant d'Alliance Consultants.
- Les références client publiables, captures d'écran et chiffres clés nécessaires aux blocs « preuves » seront fournis ou validés par l'équipe Alliance Consultants avant publication ; à défaut, des cas d'usage anonymisés seront utilisés.
- **Mentions réglementaires** (validé) : pour le MVP, les pages solutions s'en tiennent aux mentions légales standards du site corporate. Aucune mention réglementaire complexe n'est ajoutée. Pour MedicPro et CliniquePro, aucune promesse de conformité médicale non documentée n'est formulée (pas d'allégations médicales). Pour ImmoTopia.cloud et Annonces Web, aucune promesse juridique immobilière non documentée n'est formulée. Les contenus s'appuient strictement sur les fonctionnalités effectivement présentes dans `docs/`.
- **Multilinguisme** (validé) : le MVP est livré en français uniquement. Aucune traduction (anglais ou autre) n'est prévue dans cette tranche. L'architecture de contenu peut rester compatible avec une internationalisation future, mais aucune implémentation i18n n'est demandée à ce stade.
