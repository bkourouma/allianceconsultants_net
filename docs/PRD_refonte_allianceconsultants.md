# PRD — Refonte du site AllianceConsultants.net

**Projet :** Refonte du site corporate, solutions SaaS, services IA et formations d’Alliance Consultants  
**Version :** 1.0  
**Date :** 26 avril 2026  
**Document préparé pour :** Alliance Consultants SARL / Alliance Computer Consultants  
**Format :** Product Requirements Document, utilisable par une équipe produit, UX/UI, contenu, SEO et développement.

---

## 1. Résumé exécutif

Alliance Consultants a évolué d’un positionnement principalement centré sur **DocuPro Suite** vers une offre plus large combinant **solutions SaaS verticales**, **développement d’applications métier**, **automatisation des processus par IA**, **formation IA / développement** et **accompagnement à la transformation numérique**.

La refonte de `allianceconsultants.net` doit donc repositionner le site comme une **marque ombrelle technologique** capable de présenter clairement :

1. **DocuPro Suite** — plateforme GED modulaire déjà présente sur le site.
2. **MedicPro** — solution santé / médicale à intégrer depuis le prospectus produit.
3. **ImmoTopia.cloud** — logiciel SaaS de gestion immobilière.
4. **Annonces Web** — portail / service d’annonces immobilières, relié à l’écosystème immobilier.
5. **École Digitale** — espace formation, montée en compétence, IA et développement logiciel.
6. **Formations IA et développement de processus via IA** — offre transverse pour les entreprises, équipes métiers et développeurs.
7. **Services historiques et experts** — consultance, développement spécifique, AMOA, dématérialisation, scanners, GED et automatisation.

Le nouveau site doit rendre cette évolution **évidente dès la page d’accueil**, sans obliger l’utilisateur à parcourir les menus. L’objectif est de passer d’un site vitrine orienté GED à un site corporate moderne, structuré autour de l’écosystème complet d’Alliance Consultants.

---

## 2. Contexte et diagnostic

### 2.1 Situation actuelle

Le contenu public actuel met fortement en avant DocuPro Suite, ses modules GED et ImmoTopia. L’accueil présente déjà DocuPro, ImmoTopia, l’historique de l’entreprise, les références, les technologies et certains services. Cependant, plusieurs évolutions stratégiques ne sont pas suffisamment visibles : MedicPro, Annonces Web, École Digitale, formations IA, automatisation IA et développement de processus via IA.

Les contenus existants révèlent également des problèmes à corriger pendant la refonte :

- Hiérarchie de l’offre encore trop centrée sur DocuPro.
- Présence d’éléments de template non finalisés, par exemple `Get Consultation Now!`, `Edit Template`, `Name`, `Email`, `Submit Form`.
- Footer incohérent sur certaines pages, notamment une mention `Institut Froebel` à supprimer ou à justifier.
- Coordonnées multiples à harmoniser : emails, téléphones et adresses différents selon les pages.
- Menus répétés dans le DOM sur plusieurs pages.
- Pages de formations et services à enrichir avec objectifs, programme, durée, publics cibles, CTA et preuves.
- Stratégie de domaines / sous-domaines à clarifier entre `allianceconsultants.net`, `docupro.allianceconsultants.net`, `devaccrocs.allianceconsultants.net`, `immotopia.cloud` et les plateformes d’annonces.

### 2.2 Problème produit

Un visiteur qui arrive sur le site ne comprend pas immédiatement qu’Alliance Consultants est désormais :

- un éditeur de plusieurs solutions SaaS ;
- un intégrateur de processus métier augmentés par IA ;
- un organisme / pôle de formation digitale ;
- un partenaire de transformation numérique pour plusieurs secteurs.

Le site doit donc résoudre un problème de **lisibilité stratégique** : présenter clairement l’écosystème complet, tout en conservant la crédibilité historique de DocuPro et l’expertise en génie logiciel.

### 2.3 Opportunité

La refonte peut devenir un levier commercial majeur si elle permet :

- d’orienter rapidement chaque cible vers la bonne solution ;
- de générer des demandes de démo qualifiées ;
- de valoriser les références et l’expertise technique ;
- de rendre les formations IA et développement plus visibles ;
- de connecter les sites produits à un socle corporate cohérent ;
- de renforcer le SEO sur les requêtes SaaS, GED, immobilier, santé, IA, formation et automatisation.

---

## 3. Vision produit

### 3.1 Vision

Créer un site corporate moderne qui positionne Alliance Consultants comme un **éditeur et intégrateur africain de solutions SaaS, IA et automatisation métier**, au service des entreprises, administrations, établissements de santé, acteurs immobiliers et apprenants.

### 3.2 Proposition de valeur recommandée

> **Alliance Consultants conçoit des solutions SaaS, IA et métiers pour digitaliser les documents, automatiser les processus, gérer l’immobilier, accompagner les organisations de santé et former les talents du numérique.**

### 3.3 Message d’accueil recommandé

> **Solutions SaaS, IA et transformation digitale pour les organisations africaines**  
> De la GED à la gestion immobilière, de la santé digitale à la formation IA, Alliance Consultants développe des plateformes robustes et accompagne vos processus métiers de bout en bout.

CTA principaux :

- **Demander une démo**
- **Découvrir nos solutions**
- **Voir nos formations IA**

CTA secondaires :

- **Parler à un expert**
- **Nous confier un projet logiciel**
- **Automatiser un processus métier**

---

## 4. Objectifs et résultats attendus

### 4.1 Objectifs business

| Objectif | Description | Priorité |
|---|---|---:|
| Clarifier l’écosystème Alliance Consultants | Rendre visibles DocuPro, MedicPro, ImmoTopia, Annonces Web, École Digitale, IA et services. | P0 |
| Augmenter les demandes de démo | Centraliser les CTA et formulaires qualifiés par solution. | P0 |
| Générer des leads B2B qualifiés | DSI, directions générales, services archives, agences immobilières, cliniques, administrations, responsables formation. | P0 |
| Renforcer la crédibilité | Références, chiffres, historique, expertise technique, certifications et cas d’usage. | P1 |
| Développer le SEO | Créer des pages ciblées par solution, secteur, service et formation. | P1 |
| Structurer l’offre formation | Mettre en avant l’IA, le développement logiciel, SQL Server, GED, gestion de projet et processus IA. | P1 |
| Préparer l’évolutivité | CMS propre, architecture modulaire, ajout facile de nouvelles solutions ou formations. | P1 |

### 4.2 Objectifs utilisateur

| Utilisateur | Besoin principal | Résultat attendu |
|---|---|---|
| Directeur général / décideur | Comprendre l’offre et la valeur business rapidement. | Identifier la bonne solution et demander un rendez-vous. |
| DSI / responsable informatique | Évaluer la robustesse technique, sécurité et intégration. | Accéder aux fiches solutions, stack, architecture et contact technique. |
| Responsable archives / administratif | Digitaliser documents, courriers et workflows. | Comprendre DocuPro et demander une démo GED. |
| Agence immobilière / syndic / promoteur | Gérer biens, locations, copropriétés, annonces, clients et paiements. | Découvrir ImmoTopia et Annonces Web. |
| Établissement de santé | Comprendre MedicPro et ses cas d’usage. | Télécharger / consulter la fiche MedicPro et demander une démo. |
| Responsable formation / apprenant | Identifier une formation IA ou développement. | Consulter le programme, les tarifs/modalités et s’inscrire. |
| Organisation en transformation | Automatiser un processus avec IA, n8n ou développement spécifique. | Soumettre un besoin et obtenir un cadrage. |

---

## 5. Portée du projet

### 5.1 Inclus dans la refonte MVP

Le MVP de refonte inclut :

- Nouveau site corporate `allianceconsultants.net`.
- Nouvelle page d’accueil centrée sur l’écosystème complet.
- Nouveau menu principal et footer harmonisés.
- Pages de présentation pour chaque solution : DocuPro, MedicPro, ImmoTopia, Annonces Web, École Digitale.
- Pages services : développement spécifique, automatisation IA, AMOA, consultance, dématérialisation, scanners.
- Pages formations : IA, développement web / .NET, SQL Server, GED, gestion de projet, processus IA.
- Page références / clients.
- Page À propos.
- Page contact & démo avec formulaires qualifiés.
- Blog / ressources.
- SEO technique, schémas de données structurées et redirections.
- CMS administrable.
- Analytics et suivi de conversions.
- Corrections des incohérences de contenu et suppression des éléments parasites.

### 5.2 Hors périmètre MVP

Sauf décision contraire, ces éléments ne sont pas inclus dans la première livraison :

- Refonte complète des applications SaaS elles-mêmes.
- Migration fonctionnelle des plateformes DocuPro, ImmoTopia, MedicPro ou Annonces Web.
- Back-office LMS complet pour l’École Digitale si une plateforme externe existe déjà.
- CRM commercial avancé sur mesure.
- Chatbot IA autonome avec accès à données internes.
- Marketplace de formations multi-formateurs.
- Paiement en ligne complet pour toutes les formations, sauf intégration légère si l’existant CinetPay est confirmé.

### 5.3 Hypothèses importantes

- MedicPro est traité comme une solution stratégique à intégrer, mais le prospectus produit n’était pas disponible dans les fichiers accessibles au moment de ce PRD. La page MedicPro devra donc être finalisée après réception du prospectus : fonctionnalités exactes, captures, bénéfices, cible, logo, URL, tarification et modules.
- Annonces Web est compris comme le portail / service d’annonces immobilières connecté à l’écosystème ImmoTopia.
- École Digitale est compris comme le hub formation d’Alliance Consultants, éventuellement lié au sous-domaine existant de formation.
- Les coordonnées officielles doivent être validées avant mise en production.

---

## 6. Architecture de marque recommandée

### 6.1 Principe

Alliance Consultants doit devenir la **marque ombrelle**. Les solutions doivent être visibles comme des produits ou plateformes appartenant à l’écosystème.

```text
Alliance Consultants
├── Solutions SaaS
│   ├── DocuPro Suite
│   ├── MedicPro
│   ├── ImmoTopia.cloud
│   └── Annonces Web
├── École Digitale
│   ├── Formations IA
│   ├── Développement logiciel
│   ├── SQL Server
│   ├── GED / Archivage
│   └── Gestion de projet
├── Services experts
│   ├── Développement spécifique
│   ├── Automatisation IA des processus
│   ├── AMOA
│   ├── Consultance
│   ├── Dématérialisation
│   └── Scanners professionnels
└── Ressources
    ├── Blog
    ├── Guides
    ├── Cas clients
    └── FAQ
```

### 6.2 Règle de communication

Chaque page doit répondre à trois questions :

1. **À qui s’adresse l’offre ?**
2. **Quel problème métier résout-elle ?**
3. **Quelle action l’utilisateur doit-il faire maintenant ?**

---

## 7. Cibles et personas

### Persona 1 — Décideur transformation digitale

- **Profil :** DG, DGA, directeur transformation, responsable organisation.
- **Objectif :** réduire les tâches manuelles, digitaliser, piloter les opérations.
- **Freins :** complexité, coût, résistance au changement, manque de visibilité ROI.
- **Contenu attendu :** bénéfices business, cas clients, chiffres, accompagnement, démo.
- **CTA recommandé :** `Planifier un diagnostic digital`.

### Persona 2 — DSI / responsable informatique

- **Profil :** responsable IT, architecte, chef de projet technique.
- **Objectif :** valider architecture, sécurité, intégration et maintenance.
- **Freins :** sécurité, interopérabilité, hébergement, réversibilité, support.
- **Contenu attendu :** stack, API, sécurité, cloud, DevOps, support, documentation.
- **CTA recommandé :** `Parler à un expert technique`.

### Persona 3 — Responsable archives / GED

- **Profil :** documentaliste, archiviste, secrétaire général, responsable courrier.
- **Objectif :** centraliser, indexer, rechercher, tracer et automatiser les documents.
- **Freins :** perte de documents, délais, conformité, adoption utilisateur.
- **Contenu attendu :** DocuPro, modules, cas d’usage, démo, intégration scanner.
- **CTA recommandé :** `Demander une démo DocuPro`.

### Persona 4 — Professionnel immobilier

- **Profil :** agence, syndic, gestionnaire locatif, promoteur.
- **Objectif :** centraliser biens, clients, loyers, annonces, paiements et reporting.
- **Freins :** outils dispersés, Excel, suivi manuel, paiements, relances, annonces.
- **Contenu attendu :** ImmoTopia, Annonces Web, fonctionnalités, tarifs, essai/démo.
- **CTA recommandé :** `Voir ImmoTopia` ou `Publier des annonces`.

### Persona 5 — Organisation de santé

- **Profil :** clinique, cabinet, centre médical, gestionnaire hospitalier.
- **Objectif :** comprendre l’offre MedicPro et son impact opérationnel.
- **Freins :** confidentialité, conformité, coût, formation du personnel, migration.
- **Contenu attendu :** modules MedicPro, bénéfices, sécurité, démo, fiche produit.
- **CTA recommandé :** `Demander une démo MedicPro`.

### Persona 6 — Apprenant / responsable formation

- **Profil :** étudiant, développeur, professionnel, RH, centre de formation.
- **Objectif :** trouver une formation concrète en IA, développement ou gestion de projet.
- **Freins :** programme flou, coût, modalité, disponibilité, niveau requis.
- **Contenu attendu :** objectifs, durée, prérequis, prix, programme, inscription.
- **CTA recommandé :** `Voir les formations IA` ou `S’inscrire`.

---

## 8. Arborescence cible

### 8.1 Navigation principale recommandée

```text
Accueil
Solutions
  DocuPro Suite
  MedicPro
  ImmoTopia.cloud
  Annonces Web
  École Digitale
Services
  Développement spécifique
  Automatisation IA & processus métiers
  Assistance à maîtrise d’ouvrage
  Consultance
  Dématérialisation des archives
  Vente & intégration de scanners
Formations
  Formation IA pour entreprises
  Développement web / .NET & IA
  Automatisation n8n / processus IA
  SQL Server
  GED & archivage
  Gestion de projet
Références
Ressources
  Blog
  Guides
  FAQ
À propos
Contact & Démo
```

### 8.2 Footer recommandé

Le footer doit être clair, cohérent et homogène sur toutes les pages.

```text
Alliance Consultants
Solutions SaaS, IA et transformation digitale pour l’Afrique francophone.

Solutions
- DocuPro Suite
- MedicPro
- ImmoTopia.cloud
- Annonces Web
- École Digitale

Services
- Développement spécifique
- Automatisation IA
- AMOA
- Consultance
- Dématérialisation

Formations
- IA
- Développement logiciel
- SQL Server
- GED
- Gestion de projet

Contact
- Adresse officielle validée
- Email officiel validé
- Téléphone officiel validé
- WhatsApp officiel validé

Légal
- Mentions légales
- Politique de confidentialité
- Gestion des cookies
```

---

## 9. Exigences page d’accueil

### 9.1 Objectif de la page

La page d’accueil doit communiquer en moins de 10 secondes que :

- Alliance Consultants est un éditeur / intégrateur technologique.
- L’entreprise propose plusieurs solutions SaaS.
- L’IA et l’automatisation font partie de l’offre.
- Les formations et l’École Digitale sont une activité importante.
- L’utilisateur peut demander une démo ou parler à un expert immédiatement.

### 9.2 Structure détaillée de l’accueil

#### Bloc 1 — Header

Exigences :

- Logo Alliance Consultants.
- Menu principal limité à 7 entrées maximum.
- CTA permanent : `Demander une démo`.
- CTA secondaire possible : `Nous contacter` ou WhatsApp.
- Navigation mobile simple, non dupliquée dans le DOM.

#### Bloc 2 — Hero principal

Contenu recommandé :

**Titre :**  
Solutions SaaS, IA et transformation digitale pour les organisations africaines

**Sous-titre :**  
Alliance Consultants développe des plateformes métiers et accompagne les entreprises dans la GED, la santé digitale, l’immobilier, les annonces web, l’automatisation des processus et la formation IA.

**CTA :**

- Demander une démo
- Découvrir nos solutions
- Voir les formations IA

**Éléments visuels :**

- Illustration écosystème ou dashboard multi-solutions.
- Badges : `GED`, `Immobilier`, `Santé`, `IA`, `Formation`, `Automatisation`.

#### Bloc 3 — Cartes solutions visibles sans scroll profond

Les cinq solutions doivent apparaître explicitement sur l’accueil.

| Solution | Description courte | CTA |
|---|---|---|
| DocuPro Suite | GED, archivage, courriers et workflows documentaires. | Découvrir DocuPro |
| MedicPro | Solution digitale pour organisations de santé. Contenu détaillé à finaliser avec le prospectus. | Découvrir MedicPro |
| ImmoTopia.cloud | ERP immobilier SaaS : biens, CRM, location, syndic, promotion et paiements. | Voir ImmoTopia |
| Annonces Web | Publication et gestion d’annonces immobilières connectées à l’écosystème immobilier. | Voir les annonces |
| École Digitale | Formations IA, développement logiciel, SQL Server, GED et automatisation. | Voir les formations |

#### Bloc 4 — Automatisation IA & processus métiers

Objectif : rendre visible l’évolution IA.

Contenus à afficher :

- Automatisation de tâches répétitives.
- Workflows intelligents avec IA et n8n.
- Intégration de modèles IA dans les applications métier.
- Analyse documentaire, extraction, résumé, classification et assistance métier.
- Développement de processus métiers automatisés.

CTA : `Automatiser un processus`.

#### Bloc 5 — Services experts

Cartes à afficher :

- Développement spécifique / SaaS métier.
- Assistance à maîtrise d’ouvrage.
- Consultance transformation digitale.
- Dématérialisation des archives.
- Vente et intégration de scanners.

#### Bloc 6 — Formations et École Digitale

Message :

> Formez vos équipes aux compétences numériques clés : IA, automatisation, développement .NET, SQL Server, GED et gestion de projet.

Exigences :

- Afficher au moins 4 formations prioritaires.
- Afficher modalités : présentiel, distanciel, intra-entreprise.
- CTA : `Voir le catalogue` et `Demander une formation entreprise`.

#### Bloc 7 — Références et crédibilité

Afficher :

- Logos clients validés.
- Secteurs servis.
- Historique : 2003, 2006, 2013, 2023.
- Chiffres validés uniquement après confirmation : clients, projets, satisfaction.

#### Bloc 8 — Technologies et méthode

Afficher de façon concise :

- .NET / ASP.NET Core.
- Azure DevOps.
- SQL Server / PostgreSQL / MySQL.
- Angular / Bootstrap / front-end moderne.
- Docker / CI/CD.
- IA / LLM / n8n.

#### Bloc 9 — CTA final

Titre : `Un projet SaaS, GED, immobilier, santé ou IA ? Parlons-en.`

Formulaire court :

- Nom
- Email
- Téléphone
- Organisation
- Sujet
- Solution d’intérêt
- Message

CTA : `Envoyer ma demande`.

### 9.3 Critères d’acceptation accueil

- Les cinq solutions sont visibles sur l’accueil.
- DocuPro n’éclipse pas les autres solutions.
- MedicPro est visible dès la section solutions.
- ImmoTopia.cloud et Annonces Web sont présentés comme un écosystème immobilier cohérent.
- École Digitale et formations IA sont visibles sans passer uniquement par un menu.
- Les CTA `Demander une démo`, `Découvrir nos solutions`, `Voir les formations IA` sont présents.
- Aucun contenu de template ou élément parasite n’est visible.
- Les coordonnées affichées sont harmonisées.

---

## 10. Exigences par solution

## 10.1 DocuPro Suite

### Objectif

Présenter DocuPro comme la solution historique et mature d’Alliance Consultants pour la gestion documentaire, l’archivage, les courriers et les workflows.

### Cibles

- Administrations.
- Entreprises privées.
- Services archives.
- DSI.
- Secrétariats généraux.
- Responsables qualité / conformité.

### Contenus requis

- Présentation de la suite.
- Modules : Docu-Archives, Docu-GED, Docu-Courriers, Docu-Flow.
- Cas d’usage : archivage, courrier entrant/sortant, workflow d’approbation, publication documentaire, gestion de prêts physiques.
- Bénéfices : sécurité, traçabilité, recherche rapide, gain de temps, conformité, collaboration.
- Intégrations : scanners, annuaires utilisateurs, systèmes existants, API si disponible.
- Déploiement : SaaS, cloud, on-premise ou hybride si validé.
- CTA : démo, fiche produit, contact expert.

### Fonctionnalités à présenter

| Module | Fonctionnalités visibles |
|---|---|
| Docu-Archives | Dématérialisation, indexation, recherche, durée d’utilité administrative, prêts physiques. |
| Docu-GED | Centralisation, collaboration, publication, espaces partagés, versions. |
| Docu-Courriers | Courriers physiques/numériques, imputation, notifications, suivi, traçabilité. |
| Docu-Flow | Workflows, automatisation, personnalisation d’écrans, suivi des étapes, low-code. |

### Critères d’acceptation

- Chaque module a une carte dédiée et une section détaillée.
- Une demande de démo DocuPro est possible depuis la page.
- La page inclut une FAQ et un bloc sécurité.
- Les modules peuvent être reliés au site / sous-domaine DocuPro si conservé.

---

## 10.2 MedicPro

### Objectif

Rendre visible MedicPro comme une solution stratégique de l’écosystème Alliance Consultants, orientée santé / médical.

### Hypothèse à valider

Le prospectus MedicPro doit être intégré pour confirmer :

- périmètre fonctionnel exact ;
- cible métier ;
- modules ;
- captures d’écran ;
- tarifs éventuels ;
- promesse produit ;
- exigences de confidentialité / conformité ;
- URL ou accès démo.

### Structure de page recommandée

1. Hero MedicPro.
2. Problèmes métiers adressés.
3. Modules / fonctionnalités issus du prospectus.
4. Bénéfices pour les établissements de santé.
5. Sécurité, confidentialité et gestion des accès.
6. Mise en œuvre et formation.
7. FAQ.
8. CTA : demander une démo MedicPro.

### Contenus minimaux à prévoir

Tant que le prospectus n’est pas intégré, la page doit être préparée avec des placeholders contrôlés et non visibles publiquement.

| Élément | Requirement |
|---|---|
| Titre | MedicPro — solution digitale pour la gestion médicale et administrative. |
| Cible | Cliniques, cabinets, centres médicaux, établissements de santé. |
| Promesse | Centraliser les opérations santé, fluidifier le parcours patient et sécuriser les données. |
| CTA | Demander une démo MedicPro. |
| Avertissement interne | Ne pas publier d’allégation fonctionnelle non confirmée par le prospectus. |

### Critères d’acceptation

- MedicPro apparaît dans l’accueil, le menu Solutions et le footer.
- La page ne contient aucune information non validée.
- Le contenu final reprend fidèlement le prospectus.
- Les formulaires MedicPro ne demandent pas de données médicales personnelles.

---

## 10.3 ImmoTopia.cloud

### Objectif

Présenter ImmoTopia comme l’ERP immobilier SaaS d’Alliance Consultants ou de son écosystème, avec redirection claire vers `immotopia.cloud`.

### Cibles

- Agences immobilières.
- Gestionnaires locatifs.
- Syndics.
- Promoteurs immobiliers.
- Administrateurs de biens.

### Fonctionnalités à présenter

- Gestion des biens.
- CRM immobilier.
- Gestion locative.
- Syndic de copropriété.
- Promotion immobilière.
- Paiements Mobile Money.
- Publication d’annonces.
- Reporting et tableaux de bord.
- Import de données Excel / CSV si confirmé.

### Parcours utilisateur

```text
Accueil Alliance Consultants
→ Carte ImmoTopia.cloud
→ Page résumé ImmoTopia sur AllianceConsultants.net
→ CTA Voir la démo / Créer un compte / Aller sur immotopia.cloud
```

### Critères d’acceptation

- ImmoTopia est visible comme solution SaaS majeure.
- La page résume la proposition de valeur sans dupliquer inutilement tout le site produit.
- Les CTA renvoient vers `immotopia.cloud` ou un formulaire de démo.
- Les liens vers Annonces Web sont visibles.

---

## 10.4 Annonces Web — annonces immobilières

### Objectif

Présenter Annonces Web comme le canal de publication et de diffusion des annonces immobilières de l’écosystème ImmoTopia.

### Positionnement recommandé

> **Publiez, gérez et valorisez vos annonces immobilières depuis un écosystème connecté à votre gestion immobilière.**

### Fonctionnalités attendues

- Publication d’annonces immobilières.
- Recherche et filtrage des annonces.
- Catégories : location, vente, terrain, bureaux, immeubles, etc.
- Fiches annonces avec photos, localisation, prix, caractéristiques.
- Formulaire de contact / demande de visite.
- Connexion éventuelle avec ImmoTopia pour la diffusion automatisée.
- SEO par type de bien, ville, quartier et transaction.

### Critères d’acceptation

- La relation entre ImmoTopia et Annonces Web est claire.
- Le site corporate explique le service sans se substituer au portail.
- Les CTA permettent de publier une annonce, voir les annonces ou demander une démo.

---

## 10.5 École Digitale

### Objectif

Structurer l’offre formation sous une identité claire : École Digitale d’Alliance Consultants.

### Positionnement recommandé

> **Former les talents et les équipes aux compétences numériques clés : IA, développement logiciel, automatisation, bases de données, GED et gestion de projet.**

### Offres à mettre en avant

- Formation en IA pour entreprises.
- Développement web avec ASP.NET Core, Entity Framework et IA.
- Intégration de l’IA dans les applications.
- Automatisation des processus avec IA / n8n.
- SQL Server.
- Gestion de projet GED.
- Archivage et GED.
- Développement mobile / MAUI si confirmé.

### Pages formation — structure obligatoire

Chaque formation doit inclure :

- Titre clair.
- Résumé.
- Objectifs pédagogiques.
- Public cible.
- Prérequis.
- Durée.
- Modalités : présentiel, distance, intra-entreprise.
- Prix ou mention `sur devis`.
- Programme détaillé.
- Exercices / ateliers.
- Formateur.
- Attestation / certification si applicable.
- CTA : s’inscrire / demander le programme / formation entreprise.

### Critères d’acceptation

- L’École Digitale est visible sur l’accueil.
- Les formations IA sont prioritaires.
- L’inscription est simple et accessible.
- Le formulaire de formation distingue particulier, entreprise et intra-entreprise.

---

## 11. Exigences services

## 11.1 Développement spécifique / SaaS métier

### Objectif

Valoriser l’expertise d’Alliance Consultants dans la conception d’applications métier et de plateformes SaaS.

### Contenus requis

- Développement web et applications métier.
- Architecture ASP.NET Core / .NET.
- Entity Framework Core.
- API REST.
- Architecture modulaire / DDD si applicable.
- Azure DevOps, CI/CD, monitoring.
- Tests, sécurité, documentation, formation.
- Méthodologie projet.
- Exemples de cas d’usage : portail métier, ERP sectoriel, workflow, dashboard, intégration IA.

### CTA

- `Soumettre un projet logiciel`.
- `Demander un cadrage technique`.

---

## 11.2 Automatisation IA & développement de processus via IA

### Objectif

Créer une nouvelle page stratégique qui formalise l’offre d’automatisation des processus par IA.

### Problèmes adressés

- Tâches répétitives.
- Traitement manuel des documents.
- Relances non suivies.
- Validation lente.
- Données dispersées.
- Dépendance excessive à Excel, emails et WhatsApp.

### Fonctionnalités / services à présenter

- Audit de processus existants.
- Cartographie des workflows.
- Développement de processus automatisés.
- Automatisation avec n8n ou outils équivalents.
- Intégration IA : résumé, classification, extraction, assistance rédactionnelle, analyse.
- Intégration aux applications métiers.
- Tableaux de bord de suivi.
- Documentation et formation.

### Exemples de cas d’usage

- Tri automatique de demandes entrantes.
- Extraction d’informations depuis documents.
- Génération de comptes rendus.
- Relances commerciales ou administratives.
- Workflow de validation de courrier ou facture.
- Assistant interne pour support métier.
- Intégration IA dans une application .NET.

### Critères d’acceptation

- Cette offre existe comme page dédiée.
- Elle est visible sur l’accueil.
- Elle dispose d’un formulaire spécifique `Automatiser un processus`.
- Les bénéfices sont exprimés en temps gagné, réduction d’erreurs et traçabilité.

---

## 11.3 Assistance à maîtrise d’ouvrage

### Contenus requis

- Cadrage des besoins.
- Cahier des charges.
- Choix de solutions / prestataires.
- Planification.
- Gestion des risques.
- Suivi qualité.
- Recette.
- Conduite du changement.

### CTA

- `Sécuriser mon projet`.

---

## 11.4 Consultance

### Contenus requis

- Audit SI / digital.
- Conseil en transformation numérique.
- Roadmap.
- Optimisation organisationnelle.
- Automatisation.
- IA appliquée aux processus métier.
- Gouvernance projet.

### CTA

- `Demander un diagnostic`.

---

## 11.5 Dématérialisation des archives

### Contenus requis

- Diagnostic documentaire.
- Tri et préparation.
- Numérisation.
- Indexation.
- Intégration GED / DocuPro.
- Sécurité et confidentialité.
- Conservation et traçabilité.
- Gains : temps, espace, conformité, RSE.

### CTA

- `Évaluer mon projet de dématérialisation`.

---

## 11.6 Vente et intégration de scanners

### Contenus requis

- Scanners bureautiques.
- Scanners professionnels.
- Scanners A3.
- Scanners portables.
- Chargeurs automatiques.
- Conseil d’achat.
- Installation.
- Formation.
- Intégration à DocuPro.

### CTA

- `Choisir un scanner adapté`.

---

## 12. Exigences fonctionnelles générales

### 12.1 CMS et administration

| ID | Requirement | Priorité |
|---|---|---:|
| CMS-001 | Le contenu doit être administrable sans intervention développeur pour les pages standard. | P0 |
| CMS-002 | Les solutions, services, formations, articles, FAQ et références doivent être gérés comme types de contenu réutilisables. | P0 |
| CMS-003 | Le CMS doit permettre de définir title, meta description, slug, image sociale et indexation. | P0 |
| CMS-004 | Les administrateurs doivent pouvoir publier/dépublier une formation ou une solution. | P1 |
| CMS-005 | Le CMS doit gérer les brouillons pour éviter les placeholders publics. | P1 |

### 12.2 Formulaires et génération de leads

| ID | Requirement | Priorité |
|---|---|---:|
| FORM-001 | Formulaire global `Contact & Démo`. | P0 |
| FORM-002 | Formulaire spécifique par solution : DocuPro, MedicPro, ImmoTopia, Annonces Web, École Digitale. | P0 |
| FORM-003 | Champ `Solution d’intérêt` obligatoire. | P0 |
| FORM-004 | Champ `Type de demande` : démo, devis, formation, partenariat, support, autre. | P0 |
| FORM-005 | Notifications email vers les destinataires internes validés. | P0 |
| FORM-006 | Protection anti-spam non intrusive. | P0 |
| FORM-007 | Consentement RGPD / données personnelles avant soumission. | P0 |
| FORM-008 | Page ou message de confirmation avec proposition de prise de rendez-vous. | P1 |
| FORM-009 | Export CSV ou connexion CRM. | P1 |

### 12.3 Formations et inscriptions

| ID | Requirement | Priorité |
|---|---|---:|
| EDU-001 | Catalogue de formations filtrable par thème : IA, développement, base de données, GED, projet. | P0 |
| EDU-002 | Page détaillée pour chaque formation. | P0 |
| EDU-003 | Formulaire d’inscription / demande de programme. | P0 |
| EDU-004 | Gestion des modalités : présentiel, distance, intra-entreprise. | P0 |
| EDU-005 | Affichage prix / sur devis selon formation. | P1 |
| EDU-006 | Paiement en ligne optionnel si confirmé. | P2 |
| EDU-007 | Espace apprenant ou LMS complet. | P2 |

### 12.4 Blog et ressources

| ID | Requirement | Priorité |
|---|---|---:|
| RES-001 | Blog / ressources avec catégories. | P1 |
| RES-002 | Guides téléchargeables avec formulaire de capture de lead. | P1 |
| RES-003 | FAQ par solution. | P1 |
| RES-004 | Cas clients / témoignages. | P1 |

### 12.5 Multidomaine et redirections

| ID | Requirement | Priorité |
|---|---|---:|
| DOM-001 | Le site corporate doit pointer clairement vers les sites produits conservés. | P0 |
| DOM-002 | Les sous-domaines doivent être listés et gouvernés. | P0 |
| DOM-003 | Les anciennes URLs doivent être redirigées vers les nouvelles. | P0 |
| DOM-004 | Aucun contenu incohérent ou hors marque ne doit rester accessible sans contexte. | P0 |

---

## 13. Exigences UX/UI

### 13.1 Principes UX

- Clarté avant exhaustivité.
- Solutions visibles avant détails techniques.
- Un CTA principal par section.
- Parcours par profil métier.
- Mobile-first.
- Navigation courte.
- Réassurance forte.
- Aucun jargon inutile dans les titres.

### 13.2 Direction artistique

Recommandation : style corporate SaaS moderne, sobre, professionnel et africain francophone.

Éléments souhaités :

- Visuels de dashboards / interfaces.
- Cartes solutions.
- Icônes cohérentes.
- Couleurs par univers produit, tout en conservant une identité Alliance Consultants.
- Fonds clairs, sections aérées.
- CTA contrastés.
- Typographie lisible.

### 13.3 Navigation mobile

Exigences :

- Menu burger accessible.
- Sous-menus limités.
- CTA `Démo` toujours disponible.
- Pas de double menu dans le DOM.
- Focus clavier visible.
- Boutons tactiles suffisamment grands.

---

## 14. SEO et contenu

### 14.1 Objectifs SEO

- Positionner Alliance Consultants sur les requêtes liées à : GED, archivage numérique, workflow documentaire, ERP immobilier, logiciel immobilier Côte d’Ivoire, annonces immobilières, logiciel santé, formation IA, automatisation IA, développement application métier, AMOA digital.
- Créer des pages piliers par solution et par service.
- Nettoyer les pages parasites et éléments de template indexables.

### 14.2 URLs recommandées

```text
/
/solutions/
/solutions/docupro-suite/
/solutions/medicpro/
/solutions/immotopia-cloud/
/solutions/annonces-web/
/solutions/ecole-digitale/
/services/
/services/developpement-specifique/
/services/automatisation-ia-processus-metiers/
/services/assistance-maitrise-ouvrage/
/services/consultance/
/services/dematerialisation-archives/
/services/scanners-professionnels/
/formations/
/formations/ia-entreprise/
/formations/developpement-web-dotnet-ia/
/formations/automatisation-n8n-processus-ia/
/formations/sql-server/
/formations/ged-archivage/
/formations/gestion-projet/
/references/
/ressources/
/a-propos/
/contact-demo/
```

### 14.3 Données structurées recommandées

| Page | Schema recommandé |
|---|---|
| Accueil | Organization, WebSite |
| Solutions SaaS | SoftwareApplication, Product si applicable |
| Formations | Course |
| FAQ | FAQPage |
| Blog | Article |
| Services | Service |
| Fil d’Ariane | BreadcrumbList |
| Contact | LocalBusiness ou Organization selon choix |

### 14.4 Règles éditoriales

- Titres courts et orientés bénéfice.
- Un H1 unique par page.
- Meta description spécifique par page.
- Sections FAQ sur les pages piliers.
- Témoignages / références validés uniquement.
- Aucune donnée chiffrée non confirmée.
- Aucune information MedicPro non confirmée par le prospectus.

---

## 15. Accessibilité, performance et sécurité

### 15.1 Accessibilité

Objectif : conformité cible **WCAG 2.2 niveau AA**.

Exigences :

- Contrastes suffisants.
- Navigation clavier complète.
- Focus visible.
- Labels explicites sur tous les formulaires.
- Alternatives textuelles pour images utiles.
- Icônes avec noms accessibles.
- Structure de titres cohérente.
- Messages d’erreur compréhensibles.
- Aucun élément de menu dupliqué ou invisible mais tabulable.

### 15.2 Performance

Objectifs Core Web Vitals :

- LCP inférieur ou égal à 2,5 secondes.
- INP inférieur ou égal à 200 ms.
- CLS inférieur ou égal à 0,1.
- Images optimisées en WebP/AVIF si possible.
- Chargement différé des images non critiques.
- Limitation des scripts tiers.
- CSS et JS minifiés.

### 15.3 Sécurité

Exigences :

- HTTPS obligatoire.
- Protection anti-spam sur formulaires.
- Validation serveur de toutes les entrées.
- En-têtes de sécurité HTTP.
- Gestion stricte des permissions CMS.
- Sauvegardes régulières.
- Mises à jour CMS / plugins / dépendances.
- Alignement sur OWASP Top 10.
- Aucun formulaire public ne doit demander de données de santé personnelles pour MedicPro.

---

## 16. Analytics et KPI

### 16.1 Événements à suivre

- Clic `Demander une démo`.
- Soumission formulaire par solution.
- Clic vers `immotopia.cloud`.
- Clic vers Annonces Web.
- Clic vers DocuPro / sous-domaine.
- Clic WhatsApp.
- Téléchargement fiche produit.
- Inscription formation.
- Clic email / téléphone.
- Scroll 50% / 90% sur pages piliers.

### 16.2 KPI de succès

| KPI | Cible MVP indicative |
|---|---:|
| Taux de conversion formulaire global | À établir après baseline |
| Nombre de demandes de démo par mois | +30% après 3 mois vs baseline |
| Clics vers pages solutions | +50% après 3 mois vs baseline |
| Clics vers formations IA | Baseline à créer |
| Pages indexées propres | 100% des pages stratégiques |
| Erreurs template visibles | 0 |
| Score accessibilité Lighthouse | 90+ cible |
| Core Web Vitals | Dans les seuils recommandés |

---

## 17. Backlog produit priorisé

### Épic 1 — Architecture et contenus

| ID | User story | Priorité |
|---|---|---:|
| US-001 | En tant que visiteur, je veux comprendre en arrivant que le site présente plusieurs solutions SaaS et services IA. | P0 |
| US-002 | En tant qu’administrateur, je veux gérer les pages solutions sans développeur. | P0 |
| US-003 | En tant qu’équipe marketing, je veux harmoniser coordonnées, footer et messages. | P0 |
| US-004 | En tant que visiteur, je ne veux voir aucun élément de template non finalisé. | P0 |

### Épic 2 — Page d’accueil

| ID | User story | Priorité |
|---|---|---:|
| US-005 | En tant que prospect, je veux voir DocuPro, MedicPro, ImmoTopia, Annonces Web et École Digitale sur l’accueil. | P0 |
| US-006 | En tant que prospect, je veux accéder directement à une demande de démo. | P0 |
| US-007 | En tant que décideur, je veux comprendre la valeur IA et automatisation. | P0 |

### Épic 3 — Solutions

| ID | User story | Priorité |
|---|---|---:|
| US-008 | En tant que responsable GED, je veux découvrir les modules DocuPro et demander une démo. | P0 |
| US-009 | En tant qu’établissement de santé, je veux découvrir MedicPro et demander une démo. | P0 |
| US-010 | En tant qu’agence immobilière, je veux accéder à ImmoTopia et aux annonces. | P0 |
| US-011 | En tant que visiteur immobilier, je veux comprendre le lien entre ImmoTopia et Annonces Web. | P1 |

### Épic 4 — Formations et École Digitale

| ID | User story | Priorité |
|---|---|---:|
| US-012 | En tant qu’apprenant, je veux consulter les formations IA et développement. | P0 |
| US-013 | En tant que RH, je veux demander une formation intra-entreprise. | P1 |
| US-014 | En tant qu’apprenant, je veux connaître durée, prix, prérequis et programme. | P0 |

### Épic 5 — Automatisation IA

| ID | User story | Priorité |
|---|---|---:|
| US-015 | En tant qu’entreprise, je veux soumettre un processus à automatiser. | P0 |
| US-016 | En tant que décideur, je veux voir des exemples de workflows IA. | P1 |

### Épic 6 — SEO, qualité et lancement

| ID | User story | Priorité |
|---|---|---:|
| US-017 | En tant qu’équipe marketing, je veux des URLs propres et des meta descriptions. | P0 |
| US-018 | En tant que visiteur mobile, je veux un site rapide et accessible. | P0 |
| US-019 | En tant que responsable, je veux suivre les conversions par solution. | P0 |
| US-020 | En tant que propriétaire du site, je veux des redirections propres des anciennes pages. | P0 |

---

## 18. Critères d’acceptation globaux

### Contenu

- Toutes les pages MVP sont rédigées, relues et validées.
- MedicPro est finalisé à partir du prospectus avant publication.
- Les coordonnées sont harmonisées.
- Les mentions incohérentes sont supprimées.
- Les anciennes promesses chiffrées sont validées ou retirées.

### UX/UI

- Les cinq solutions sont visibles dès l’accueil.
- La navigation est simple, mobile-first et accessible.
- Les CTA sont cohérents et non concurrents.
- Le footer est identique sur tout le site.

### Technique

- CMS administrable.
- Formulaires fonctionnels avec notifications.
- Redirections 301 configurées.
- Sitemap XML et robots.txt propres.
- Pages stratégiques indexables.
- Pages sans valeur noindex ou supprimées.
- Analytics configuré.

### Qualité

- Aucun élément `Get Consultation Now`, `Edit Template`, `Footer Institut Froebel` non validé.
- Aucun menu dupliqué visible ou tabulable.
- Aucun placeholder public.
- Zéro lien cassé critique.
- Performance et accessibilité validées avant mise en production.

---

## 19. Plan de livraison recommandé

### Phase 1 — Cadrage et validation

- Valider l’architecture de marque.
- Valider les coordonnées officielles.
- Obtenir le prospectus MedicPro.
- Valider les sites / sous-domaines à conserver.
- Valider la liste des formations prioritaires.

### Phase 2 — UX / contenu

- Wireframes accueil, solutions, services, formations, contact.
- Rédaction des contenus.
- Matrice SEO.
- Validation des CTA et formulaires.

### Phase 3 — UI design

- Direction artistique.
- Maquettes desktop et mobile.
- Design system léger : boutons, cartes, formulaires, alertes, sections.

### Phase 4 — Développement

- Intégration CMS.
- Création des types de contenu.
- Développement des pages.
- Formulaires et notifications.
- SEO technique.
- Redirections.

### Phase 5 — QA et lancement

- Recette contenu.
- Tests responsive.
- Tests accessibilité.
- Tests performance.
- Tests formulaires.
- Tests analytics.
- Mise en production.
- Monitoring post-lancement.

---

## 20. Matrice de contenu MVP

| Page | Statut | Source / besoin | Priorité |
|---|---|---|---:|
| Accueil | À refondre complètement | Contenu actuel + nouvelles offres | P0 |
| Solutions | À créer | Architecture produit | P0 |
| DocuPro Suite | À renforcer | Contenu actuel modules | P0 |
| MedicPro | À créer | Prospectus requis | P0 |
| ImmoTopia.cloud | À créer / résumer | Site produit existant | P0 |
| Annonces Web | À créer | Positionnement à préciser | P0 |
| École Digitale | À créer | Formations existantes + IA | P0 |
| Développement spécifique | À renforcer | Contenu actuel | P0 |
| Automatisation IA | À créer | Nouvelle offre stratégique | P0 |
| AMOA | À renforcer | Contenu actuel | P1 |
| Consultance | À réécrire | Contenu actuel partiel | P1 |
| Dématérialisation | À réécrire | Contenu actuel partiel | P1 |
| Scanners | À réécrire | Contenu actuel partiel | P2 |
| Formations | À restructurer | Contenus DevAccrocs / existants | P0 |
| Références | À créer / enrichir | Logos + cas clients validés | P1 |
| Blog / ressources | À créer | Calendrier éditorial | P1 |
| À propos | À moderniser | Historique + expertise IA | P1 |
| Contact & Démo | À refondre | Formulaires qualifiés | P0 |

---

## 21. Risques et points de vigilance

| Risque | Impact | Mitigation |
|---|---|---|
| MedicPro publié avec des informations incomplètes | Perte de crédibilité | Attendre prospectus validé avant publication. |
| Trop de solutions sur l’accueil | Surcharge cognitive | Cartes simples + hiérarchie claire + CTA. |
| Confusion entre sites / sous-domaines | Parcours utilisateur fragmenté | Gouvernance de liens et pages passerelles. |
| Ancien contenu parasite indexé | Mauvaise image SEO | Nettoyage, redirections, noindex, Search Console. |
| Coordonnées incohérentes | Perte de confiance | Une source de vérité contact. |
| Formation et SaaS mélangés sans structure | Confusion | École Digitale comme hub séparé mais visible. |
| Dépendance à un page builder lourd | Performance faible | Design system léger et optimisation front-end. |

---

## 22. Recommandations éditoriales immédiates

### À mettre sur l’accueil

- DocuPro Suite.
- MedicPro.
- ImmoTopia.cloud.
- Annonces Web.
- École Digitale.
- Formation IA.
- Automatisation IA des processus.
- Développement logiciel / SaaS.
- Références.
- Contact & démo.

### À retirer ou corriger

- `Get Consultation Now!`.
- `Edit Template`.
- `Name / Email / Message / Submit Form` générique.
- `Footer Institut Froebel`, sauf justification validée.
- Coordonnées contradictoires.
- Menus dupliqués.
- Pages vides, faibles ou hors marque.

### À valider avant mise en production

- Prospectus MedicPro.
- Logo / identité visuelle de chaque solution.
- URL officielle d’Annonces Web.
- Contact officiel unique.
- Chiffres clients / projets / satisfaction.
- Liens entre `allianceconsultants.net`, `immotopia.cloud`, DocuPro et École Digitale.

---

## 23. Sources utilisées

- Contenu aspiré et structuré de `allianceconsultants.net`, fichier `allianceconsultants_contenu_aspire.md`, 24 avril 2026.
- Page d’accueil actuelle d’Alliance Consultants : `https://allianceconsultants.net/`.
- Page modules DocuPro : `https://allianceconsultants.net/nos-modules/`.
- Page À propos : `https://allianceconsultants.net/a-propos/`.
- Page Contact & Démo : `https://allianceconsultants.net/contact/`.
- Site ImmoTopia : `https://immotopia.cloud/`.
- Blog ImmoTopia : `https://immotopia.cloud/blog`.
- Contenus de formation DevAccrocs / Alliance Consultants repérés sur `devaccrocs.allianceconsultants.net`.
- WCAG 2.2 : `https://www.w3.org/TR/WCAG22/`.
- OWASP Top Ten Web Application Security Risks : `https://owasp.org/www-project-top-ten/`.
- Core Web Vitals : `https://web.dev/articles/vitals`.
- Google Search Central — structured data : `https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data`.

---

## 24. Synthèse décisionnelle

La refonte doit prioriser la clarté stratégique. La page d’accueil ne doit plus être seulement une vitrine DocuPro : elle doit devenir la porte d’entrée de l’écosystème Alliance Consultants.

La structure recommandée est :

1. **Alliance Consultants** comme marque ombrelle.
2. **Solutions SaaS** comme premier axe visible.
3. **IA et automatisation** comme preuve d’évolution.
4. **École Digitale** comme pilier formation.
5. **Services experts** comme capacité d’accompagnement.
6. **Contact & démo** comme mécanisme de conversion permanent.

Le succès du projet dépendra surtout de trois décisions rapides :

- valider le contenu MedicPro ;
- harmoniser l’architecture de marque et les domaines ;
- réécrire l’accueil autour des cinq solutions clés et de l’IA.
