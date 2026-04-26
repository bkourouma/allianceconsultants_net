<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 (template placeholder) → 1.0.0
Bump rationale: MAJOR — première ratification d'une constitution complète et
exécutoire pour le projet de refonte du site Alliance Consultants. Remplacement
intégral du gabarit générique par un cadre projet métier (web corporate B2B
multi-solutions). Toutes les sections ont été redéfinies.

Modified principles:
- [PRINCIPLE_1_NAME] → I. Clarté de positionnement
- [PRINCIPLE_2_NAME] → II. Architecture de marque ombrelle
- [PRINCIPLE_3_NAME] → III. Priorité business (génération de leads qualifiés)
- [PRINCIPLE_4_NAME] → IV. Cohérence éditoriale des pages solutions
- [PRINCIPLE_5_NAME] → V. Modularité, réutilisabilité et qualité technique
- (ajouts) → VI. Souveraineté de la constitution (gouvernance Spec Kit)

Added sections:
- Vision du projet
- Règles UX/UI
- Règles de contenu
- Règles SEO
- Règles techniques
- Règles de sécurité
- Règles d'accessibilité
- Règles de gouvernance du contenu
- Critères d'acceptation globaux
- Processus d'amendement de la constitution

Removed sections:
- [SECTION_2_NAME] / [SECTION_3_NAME] génériques (remplacés par des
  sections métier dédiées)

Templates requiring updates:
- ✅ .specify/templates/constitution-template.md — non modifié (gabarit
  générique conservé pour réinitialisations futures)
- ✅ .specify/templates/plan-template.md — compatible : la section
  "Constitution Check" lit dynamiquement ce fichier ; aucun ajustement requis
- ✅ .specify/templates/spec-template.md — compatible
- ✅ .specify/templates/tasks-template.md — compatible
- ⚠ docs/ et CLAUDE.md — à enrichir lors des prochaines features pour
  référencer les règles UX/SEO/contenu si pertinent (non bloquant)

Follow-up TODOs: aucun. RATIFICATION_DATE = 2026-04-26 (adoption initiale).
-->

# Alliance Consultants — Constitution du projet de refonte du site corporate

## Nom du projet

**Refonte du site allianceconsultants.net** — site corporate de la marque
ombrelle Alliance Consultants (éditeur et intégrateur africain de solutions
SaaS, IA et métiers).

## Vision du projet

Faire d'allianceconsultants.net la **vitrine officielle et complète de
l'écosystème Alliance Consultants**, capable de :

- positionner Alliance Consultants comme **marque ombrelle technologique**
  africaine, et non comme un site mono-produit centré sur DocuPro ;
- présenter clairement l'**ensemble des solutions SaaS** de l'éditeur
  (DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web,
  École Digitale) ;
- présenter les **services experts** (développement spécifique et SaaS
  métier, automatisation IA des processus, AMOA, transformation digitale,
  dématérialisation des archives, vente et intégration de scanners
  professionnels) ;
- générer des **leads qualifiés B2B** (demande de démo, contact commercial,
  demande de formation, diagnostic digital, demande d'automatisation) ;
- transmettre une image **crédible, moderne, rassurante et commercialement
  efficace**, adaptée aux décideurs B2B de l'Afrique francophone.

Le site est un actif commercial autant qu'un actif éditorial. Toute décision
de design, de contenu, d'architecture ou de technique doit être tranchée à
l'aune de cette vision.

## Principes fondamentaux

### I. Clarté de positionnement (NON NÉGOCIABLE)

En **moins de 10 secondes** sur la page d'accueil ou sur n'importe quelle
page d'entrée, un visiteur DOIT comprendre qu'Alliance Consultants est un
**éditeur et intégrateur africain de solutions SaaS, IA et métiers**.

Règles dérivées :
- Le hero d'accueil DOIT contenir une promesse de valeur explicite,
  multi-solutions, et orientée écosystème.
- DocuPro **NE DOIT PAS éclipser** les autres solutions. Aucune section
  "produit phare unique" n'est autorisée.
- Le naming, les visuels, les CTA et la hiérarchie de l'information DOIVENT
  refléter une marque ombrelle, pas un produit unique.

### II. Architecture de marque ombrelle (NON NÉGOCIABLE)

Alliance Consultants est la **marque ombrelle**. Chaque solution est
présentée comme un **produit ou une plateforme de l'écosystème**.

Toute page solution DOIT répondre explicitement à trois questions :
1. **À qui s'adresse l'offre ?** (cibles : secteur, taille, rôle, besoin).
2. **Quel problème métier résout-elle ?** (douleur concrète, contexte
   africain quand pertinent).
3. **Quelle action l'utilisateur doit-il faire maintenant ?** (CTA principal
   non ambigu).

Si une de ces trois questions n'a pas de réponse claire, la page **NE DOIT
PAS** être considérée comme livrable.

### III. Priorité business — génération de leads qualifiés (NON NÉGOCIABLE)

Toutes les pages importantes (accueil, solutions, services, formations,
références, à propos) DOIVENT favoriser la génération de leads qualifiés.

CTA autorisés et hiérarchisés :
- **demande de démo** (CTA principal des pages solutions) ;
- **contact commercial** ;
- **demande de formation** (École Digitale et pages formations) ;
- **demande de diagnostic digital** ;
- **demande d'automatisation de processus**.

Règles dérivées :
- Chaque page importante DOIT exposer **au moins un CTA visible above the
  fold** sur desktop ET sur mobile.
- Aucun CTA générique (« En savoir plus » seul) ne peut remplacer un CTA
  business sur une page solution ou service.
- Les formulaires de contact DOIVENT être **qualifiants** (au minimum :
  identité, organisation, secteur/besoin, message), sans devenir intrusifs.

### IV. Cohérence éditoriale des pages solutions (NON NÉGOCIABLE)

Chaque page solution DOIT contenir, dans cet ordre logique (l'ordre exact
peut varier selon la solution, mais aucun bloc ne peut être omis sans
justification documentée) :

1. **Hero** clair (titre, sous-titre, CTA principal).
2. **Promesse de valeur** synthétique.
3. **Cibles** (à qui s'adresse la solution).
4. **Problèmes résolus** (douleurs métier).
5. **Modules / fonctionnalités principales**.
6. **Bénéfices** orientés métier (et non orientés feature).
7. **Cas d'usage** ou exemples concrets.
8. **Éléments de confiance** (logos, chiffres, références, témoignages,
   certifications) lorsqu'ils existent.
9. **FAQ** si utile à la décision d'achat.
10. **CTA principal de demande de démo**, complété d'un CTA secondaire
    (contact, brochure, etc.) si pertinent.

### V. Modularité, réutilisabilité et qualité technique (NON NÉGOCIABLE)

Le projet DOIT rester **modulaire, maintenable et évolutif**. Les composants
UI DOIVENT être **réutilisables** et factorisés.

Composants réutilisables minimaux exigés :
- header / navigation principale ;
- footer harmonisé ;
- carte solution / carte service ;
- bloc CTA ;
- section FAQ ;
- formulaire de contact qualifié ;
- bloc témoignage ;
- bloc logos clients / références ;
- bloc statistiques / chiffres clés ;
- section "fonctionnalités" (liste/grille).

Toute duplication de markup ou de styles entre pages identiques est
considérée comme une dette technique à corriger.

### VI. Souveraineté de la constitution (gouvernance Spec Kit)

Cette constitution est la **source d'autorité** du projet. Toute
spécification (`/speckit-specify`), toute clarification, tout plan
(`/speckit-plan`), toute tâche (`/speckit-tasks`) et toute implémentation
(`/speckit-implement`) DOIVENT être vérifiées contre cette constitution.

Règles dérivées :
- Si une demande utilisateur, une spécification, un plan ou une tâche
  **contredit** un principe de cette constitution, l'agent DOIT signaler
  explicitement le conflit, citer le principe en cause, et proposer une
  correction conforme **avant** d'exécuter.
- Aucun raccourci silencieux n'est autorisé. Une décision d'écart DOIT
  passer par le processus d'amendement (voir plus bas).

## Règles UX / UI

- **Mobile-first.** Le design DOIT être pensé d'abord pour mobile, puis
  étendu pour tablette et desktop.
- **Responsive.** Le site DOIT être pleinement utilisable sur desktop,
  tablette et mobile, sans régression de contenu ni de CTA.
- **Navigation principale (menu).** Le menu de référence est :
  *Accueil · Solutions · Services · Formations · Références · Ressources ·
  À propos · Contact & Démo*. Toute évolution DOIT être justifiée et
  amendée.
- **Simplicité.** La navigation DOIT être courte, claire, cohérente entre
  les pages. Pas plus de 2 niveaux dans le menu principal.
- **Design system.** Style corporate moderne, couleurs sobres et
  professionnelles, hiérarchie typographique claire, espacements
  constants, icônes cohérentes, sections aérées, CTA visibles, design
  adapté B2B.
- **Aucune animation excessive.** Les animations DOIVENT rester discrètes
  et utiles (révélations contextuelles, micro-interactions). Pas
  d'animations bloquantes, distrayantes ou nuisibles à la performance.

## Règles de contenu

- **Langue.** Tous les contenus publiés DOIVENT être rédigés en **français
  professionnel**, clair, sans jargon inutile.
- **Public cible.** Décideurs B2B de l'Afrique francophone (DG, DSI,
  directeurs métier, responsables qualité, dirigeants PME/ETI).
- **Ton.** Crédible, moderne, rassurant, commercial **sans exagération**.
  Aucun superlatif gratuit ("le meilleur", "le numéro un") sans preuve.
- **Orientation bénéfices.** Les contenus DOIVENT être orientés
  **bénéfices métier** avant fonctionnalités techniques.
- **Cohérence des coordonnées.** Coordonnées (adresse, téléphones, e-mails,
  réseaux sociaux) **centralisées et harmonisées** avant publication.
- **Aucun contenu de template visible.** Sont **interdits** dans toute
  page mise en ligne :
  - mentions « *Edit Template* » ;
  - CTA non traduits ou génériques type « *Get Consultation Now!* » ;
  - libellés de formulaires non traduits (« *Name* », « *Email* »,
    « *Submit Form* », etc.) ;
  - références incohérentes au projet (ex. mention « Institut Froebel »
    si non justifiée par le contexte) ;
  - tout *lorem ipsum*, image placeholder, lien `#` non finalisé.

## Règles SEO

Chaque page importante DOIT prévoir, **avant publication** :

- un **title SEO** unique, < 60 caractères si possible ;
- une **meta description** unique, < 160 caractères, orientée bénéfice ;
- un **H1 unique** par page, aligné sur la promesse de la page ;
- une **structure H2 / H3 propre**, hiérarchique, sans saut de niveau ;
- des **contenus indexables** (texte HTML, pas uniquement de l'image) ;
- des **URLs lisibles** (slug court, en minuscules, séparées par tirets) ;
- un **maillage interne** entre solutions, services, formations et contact
  (chaque page solution renvoie vers au moins un service et vers le
  contact) ;
- des **données structurées** (JSON-LD `Organization`, `Product`,
  `Service`, `FAQPage`, `BreadcrumbList`) **lorsque pertinent**.

## Règles techniques

- **Modularité.** Le code DOIT être organisé en composants/sections
  réutilisables, avec une séparation claire entre contenu, structure et
  style.
- **Maintenabilité.** Toute duplication majeure (composant copié-collé)
  est interdite ; un composant réutilisable DOIT être créé.
- **Évolutivité.** L'ajout d'une nouvelle solution ou d'un nouveau service
  ne DOIT pas exiger la réécriture des composants partagés.
- **Pas de dépendances inutiles.** Toute librairie tierce ajoutée DOIT
  être justifiée (besoin réel, pas de duplication, taille raisonnable).
- **Performance web élevée.**
  - images optimisées (compression, formats modernes, dimensions
    adaptées, *lazy loading* pour le hors-écran) ;
  - styles et scripts minimisés ;
  - pas de polices ni de scripts bloquants au-delà du nécessaire ;
  - objectif raisonnable : Lighthouse Performance ≥ 85 sur mobile pour
    les pages clés (accueil, solutions, contact).
- **Cohérence d'arborescence.** Les chemins, noms de fichiers et noms de
  composants DOIVENT respecter une convention unique sur tout le projet.

## Règles de sécurité

- **Validation des formulaires côté client ET côté serveur.** Aucune
  donnée utilisateur ne DOIT être traitée sans validation serveur.
- **Protection anti-spam.** Tout formulaire public DOIT intégrer une
  protection anti-spam (honeypot, captcha discret, ou équivalent).
- **Consentement explicite** lorsque des données personnelles sont
  collectées (case à cocher non pré-cochée, finalité claire).
- **Politique de confidentialité accessible** depuis le footer, en clair,
  avec finalités, durées et droits.
- **Aucune donnée sensible exposée** dans le HTML, le JS, les commentaires
  ou les logs publics.
- **Aucune clé API, aucun secret** dans le code source ni dans le dépôt
  Git. Les secrets DOIVENT vivre dans des variables d'environnement ou un
  gestionnaire de secrets.
- **HTTPS obligatoire** en production, redirections HTTP→HTTPS systématiques.

## Règles d'accessibilité

- **Responsive desktop, tablette et mobile** sans régression de contenu.
- **Contraste suffisant** entre texte et fond (cible WCAG AA :
  ratio ≥ 4.5:1 pour le texte normal).
- **Textes lisibles** (taille minimale ≥ 16 px sur mobile pour le texte
  courant ; éviter les polices trop fines).
- **Navigation clavier possible** sur tous les éléments interactifs (menu,
  liens, boutons, formulaires) avec focus visible.
- **Images optimisées et accessibles** : attributs `alt` significatifs
  pour les images informatives, `alt=""` pour les images décoratives.
- **Pas d'animations excessives** susceptibles de gêner les utilisateurs
  sensibles ; respecter `prefers-reduced-motion` lorsque applicable.
- **Structure sémantique** : utilisation correcte des balises `<header>`,
  `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>`, `<a>`.

## Règles de gouvernance du contenu

- **Aucun contenu de template visible** (cf. *Règles de contenu* ci-dessus).
- **Coordonnées centralisées** : les informations de contact (adresse,
  téléphones, e-mails, réseaux sociaux, horaires) sont définies à un seul
  endroit et réutilisées via composant ou variable de contenu.
- **Cohérence éditoriale inter-pages** : la promesse, le nom de marque, le
  nom des solutions, les libellés des CTA DOIVENT être identiques d'une
  page à l'autre.
- **Validation éditoriale obligatoire** avant mise en production de toute
  page MVP (relecture orthographe, ton, exactitude des chiffres et des
  références citées).
- **Aucune mention parasite ou héritée** d'un ancien template (ex.
  « Institut Froebel » ou autre) si elle n'est pas justifiée par le
  contexte du projet.

## Critères d'acceptation globaux

Une page, une section ou une fonctionnalité **NE PEUT être considérée
comme terminée** que si **tous** les critères suivants sont satisfaits :

1. Elle **respecte la constitution** (principes, règles UX, contenu, SEO,
   technique, sécurité, accessibilité, gouvernance du contenu).
2. Elle est **responsive** (desktop, tablette, mobile) et fonctionnelle
   sur les principaux navigateurs récents.
3. Elle dispose d'un **contenu clair, finalisé, en français professionnel**.
4. Elle contient un **CTA pertinent** (au minimum un, hiérarchisé et aligné
   sur la *Priorité business*).
5. Elle **ne contient aucun placeholder visible** (lorem ipsum, image
   bouchon, lien `#`, mention de template, libellé non traduit).
6. Elle **respecte la structure SEO** exigée (title, meta description,
   H1 unique, hiérarchie H2/H3, slug propre, données structurées si
   pertinent).
7. Elle **ne casse pas la cohérence globale** du site (header, footer,
   navigation, design system, ton éditorial).
8. Elle est **prête pour intégration ou mise en production** (pas de TODO
   bloquant, pas d'erreur console, pas de lien mort).

### Périmètre MVP imposé

Le MVP DOIT contenir **au minimum** :

- la **page d'accueil** ;
- les **pages solutions** : *DocuPro Suite*, *MedicPro*, *CliniquePro*,
  *ImmoTopia.cloud*, *Annonces Web*, *École Digitale* ;
- les **pages services** (développement spécifique / SaaS métier,
  automatisation IA des processus, AMOA, transformation digitale,
  dématérialisation des archives, vente et intégration de scanners
  professionnels) ;
- les **pages formations** (École Digitale et offres associées) ;
- la **page références** ;
- la **page à propos** ;
- la **page contact & démo** ;
- un **footer harmonisé** ;
- des **formulaires de contact qualifiés**.

Aucune solution citée ci-dessus ne peut être omise du MVP sans amendement
formel de la constitution.

## Processus d'amendement de la constitution

1. **Initiative.** Toute proposition d'amendement (ajout, modification,
   suppression d'un principe ou d'une règle) DOIT être soumise par écrit,
   avec :
   - le principe ou la règle visé(e) ;
   - la modification proposée (texte avant / après) ;
   - la justification métier, UX, technique ou de gouvernance ;
   - l'impact attendu sur les artefacts Spec Kit existants
     (`spec.md`, `plan.md`, `tasks.md`, composants, pages livrées).
2. **Validation.** L'amendement DOIT être validé par le porteur du projet
   (Alliance Consultants) avant d'être appliqué. À défaut de validation
   formelle, la version courante de la constitution prévaut.
3. **Versionnage sémantique** du fichier constitution.md :
   - **MAJOR** — refonte ou suppression d'un principe non négociable, ou
     redéfinition de la gouvernance ;
   - **MINOR** — ajout d'un principe ou d'une section, ou élargissement
     matériel d'une règle existante ;
   - **PATCH** — clarification, reformulation, correction typographique,
     précision non sémantique.
4. **Propagation.** Tout amendement DOIT être suivi d'une **revue de
   cohérence** sur :
   - `.specify/templates/plan-template.md`
   - `.specify/templates/spec-template.md`
   - `.specify/templates/tasks-template.md`
   - `CLAUDE.md` et la documentation projet (`docs/`, `README.md`).
   Les écarts détectés DOIVENT être corrigés ou listés en TODO daté.
5. **Sync Impact Report.** Tout amendement DOIT produire un *Sync Impact
   Report* en commentaire HTML en tête de ce fichier (version avant /
   après, principes modifiés, sections ajoutées/supprimées, templates
   impactés, TODO différés).
6. **Audit de conformité.** À tout moment, l'agent ou le porteur de
   projet peut demander un audit de conformité (`/speckit-analyze`) pour
   vérifier que les artefacts (`spec.md`, `plan.md`, `tasks.md`, pages
   livrées) restent alignés sur la constitution courante. Tout écart
   identifié est traité comme un défaut de qualité bloquant pour la mise
   en production.

---

**Version**: 1.0.0 | **Ratifiée le**: 2026-04-26 | **Dernière modification**: 2026-04-26
