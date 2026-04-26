# Fonctionnalites du site internet

Ce document sert de reference fonctionnelle pour construire le site internet de la plateforme d'annonces immobilieres. Il decrit les parcours attendus, les pages, les fonctionnalites principales, les regles de gestion et les priorites de realisation.

> Note de cadrage : le code et la documentation existants utilisent plusieurs noms commerciaux (`ImmoTopia`, `ImmoAnnonces`, `ImmoConnect`). Le nom final doit etre stabilise avant la mise en production.

## 1. Vision du produit

La plateforme est une marketplace immobiliere mobile-first pour la Cote d'Ivoire, puis potentiellement l'Afrique de l'Ouest.

Elle permet de :

- Rechercher des biens immobiliers a vendre ou a louer.
- Consulter des annonces detaillees avec photos, videos, prix, localisation et informations vendeur.
- Contacter directement les vendeurs, proprietaires ou agences via WhatsApp ou telephone.
- Publier des annonces immobilieres depuis un compte utilisateur.
- Mettre en avant des annonces via des forfaits ou options payantes.
- Verifier les utilisateurs et agences pour renforcer la confiance.
- Gerer la moderation, les paiements, les utilisateurs et les operations depuis un backoffice.

## 2. Publics cibles

### Visiteurs

Utilisateurs non connectes qui consultent les annonces, recherchent un bien et contactent un vendeur.

### Utilisateurs particuliers

Personnes physiques qui souhaitent publier, modifier et suivre leurs annonces.

### Agences immobilieres

Professionnels qui publient plusieurs annonces, demandent une verification, gerent leur visibilite et peuvent beneficier d'abonnements.

### Utilisateurs verifies

Comptes ayant obtenu un badge de confiance apres controle documentaire par l'equipe.

### Administrateurs

Equipe interne chargee de l'exploitation : moderation, support, finance, verification, supervision technique et gestion des roles.

## 3. Parcours utilisateurs principaux

### 3.1 Rechercher un bien

1. L'utilisateur arrive sur la page d'accueil.
2. Il lance une recherche par localisation, type de transaction, type de bien, prix ou nombre de chambres.
3. Il consulte une liste paginee d'annonces.
4. Il affine les resultats avec les filtres.
5. Il ouvre une annonce pour voir le detail.
6. Il contacte le vendeur par WhatsApp ou telephone.
7. S'il est connecte, il peut enregistrer la recherche pour recevoir des alertes.

### 3.2 Publier une annonce

1. L'utilisateur se connecte ou cree un compte.
2. Il complete son profil si necessaire.
3. Il accede au parcours "Deposer une annonce".
4. Il choisit le mode de publication :
   - Formulaire classique.
   - Assistant IA, reserve aux utilisateurs verifies.
5. Il renseigne les informations du bien.
6. Il ajoute des photos ou videos.
7. Il publie l'annonce.
8. Il peut ensuite la suivre, la modifier ou la supprimer depuis son espace.

### 3.3 Faire verifier son profil

1. L'utilisateur accede a la demande de verification.
2. Il choisit le type de demande : particulier ou agence.
3. Il fournit les informations et documents requis.
4. L'equipe admin examine la demande.
5. La demande est approuvee ou rejetee avec une note.
6. Le badge verifie est affiche sur le profil et les annonces si la demande est approuvee.

### 3.4 Mettre en avant une annonce

1. Le vendeur choisit une annonce existante.
2. Il selectionne une option de promotion ou un forfait.
3. Il choisit un moyen de paiement.
4. Le paiement est initialise.
5. Le fournisseur de paiement confirme le statut via redirection et webhook.
6. L'annonce beneficie de la mise en avant si le paiement est confirme.

### 3.5 Administrer la plateforme

1. Un administrateur se connecte au backoffice.
2. Il accede uniquement aux modules autorises par son role.
3. Il traite les annonces, demandes de verification, avis, transactions ou incidents.
4. Toute action sensible est tracee dans les journaux d'audit.

## 4. Pages publiques

### 4.1 Accueil (`/`)

Objectif : presenter rapidement la proposition de valeur et orienter vers la recherche ou la publication.

Fonctionnalites attendues :

- Header fixe avec logo, navigation, changement de langue, acces compte et bouton de depot d'annonce.
- Hero avec formulaire de recherche.
- Annonces a la une.
- Categories de biens.
- Explication "Comment ca marche" pour chercheurs et proprietaires.
- Statistiques de confiance.
- Section confiance et securite.
- Temoignages.
- Capture d'alertes email/telephone.
- FAQ.
- Footer avec navigation, support, contact, CGU et confidentialite.

### 4.2 Recherche et liste d'annonces (`/listings`, `/search`)

Objectif : permettre de trouver rapidement une annonce pertinente.

Fonctionnalites attendues :

- Barre de recherche texte.
- Filtres :
  - Type de bien : appartement, villa, terrain, bureau, commerce.
  - Type de transaction : vente ou location.
  - Prix minimum et maximum.
  - Surface minimum et maximum.
  - Nombre de chambres.
  - Nombre de salles de bain.
  - Commune/quartier.
  - Tri par date, prix, surface ou vues selon les options disponibles.
- Pagination avec chargement de resultats supplementaires.
- Etats de chargement, erreur et aucun resultat.
- Bouton "Enregistrer cette recherche" pour les utilisateurs connectes.
- Redirection vers la connexion si un visiteur veut enregistrer une recherche.

### 4.3 Detail d'une annonce (`/listings/:id`)

Objectif : donner toutes les informations utiles pour decider de contacter le vendeur.

Fonctionnalites attendues :

- Galerie media avec photos, videos, miniatures et navigation.
- Titre, prix, adresse, commune/quartier et type de bien.
- Badges : verifie, premium, a la une, nouveau selon le contexte.
- Caracteristiques : surface, chambres, salles de bain, statut.
- Description detaillee.
- Mise en avant de l'atout principal du bien.
- Informations supplementaires : date de publication, mise a jour, vues, reference.
- Bloc vendeur avec badge verifie si applicable.
- Actions de contact :
  - WhatsApp avec message pre-rempli.
  - Appel telephonique.
  - Partage de l'annonce.
- Conseils de securite.
- Avis publics sur le vendeur.
- Formulaire d'avis pour utilisateurs connectes.
- Reponse publique du vendeur aux avis.
- Autres annonces du meme vendeur.
- Annonces recemment consultees.
- Barre de contact mobile fixe.

### 4.4 Authentification (`/login`)

Objectif : permettre l'acces aux fonctionnalites protegees.

Fonctionnalites attendues :

- Connexion email + mot de passe.
- Inscription email + mot de passe.
- Verification email.
- Renvoi du lien de verification.
- Connexion Google OAuth.
- Redirection vers la page demandee apres connexion.
- Gestion des erreurs de session.
- Acceptation obligatoire des CGU et de la politique de confidentialite a l'inscription.

### 4.5 Pages legales (`/terms`, `/privacy`)

Objectif : exposer les conditions d'utilisation et la politique de confidentialite.

Fonctionnalites attendues :

- Conditions generales d'utilisation.
- Politique de confidentialite.
- Version de politique utilisee pour le consentement.
- Liens accessibles depuis l'inscription et le footer.

### 4.6 Retour de paiement (`/payment/return`)

Objectif : informer l'utilisateur du resultat d'un paiement apres redirection fournisseur.

Fonctionnalites attendues :

- Affichage de l'etat du paiement : succes, echec, annule ou en attente.
- Verification du statut cote backend.
- Lien de retour vers l'annonce ou l'espace utilisateur.

## 5. Espace utilisateur

### 5.1 Tableau de bord (`/dashboard`)

Objectif : offrir une entree personnelle apres connexion.

Fonctionnalites attendues :

- Resume du compte.
- Acces rapide aux annonces, recherches sauvegardees, profil et verification.
- Mise en avant des actions incompletes : profil a completer, email a verifier, verification a demander.

### 5.2 Profil (`/profile`)

Objectif : gerer les informations personnelles.

Fonctionnalites attendues :

- Consultation et modification du nom.
- Consultation et modification de l'email.
- Numero WhatsApp au format Cote d'Ivoire.
- Preferences de notifications : email, SMS, push.
- Etat du compte verifie.
- Deconnexion.
- Suppression de compte.

### 5.3 Completion de profil (`/complete-profile`)

Objectif : demander les informations minimales avant publication.

Fonctionnalites attendues :

- Nom complet.
- Email si manquant.
- Numero WhatsApp si necessaire.
- Validation des champs.
- Redirection vers l'action initiale apres completion.

### 5.4 Mes annonces (`/my-listings`)

Objectif : permettre au vendeur de gerer ses annonces.

Fonctionnalites attendues :

- Liste des annonces de l'utilisateur.
- Filtrage par statut : brouillon, publiee, archivee.
- Acces au detail public.
- Modification d'une annonce.
- Suppression d'une annonce.
- Suivi des vues.
- Indication du forfait et de la mise en avant.

### 5.5 Deposer une annonce (`/post-property`)

Objectif : publier un bien immobilier.

Champs principaux :

- Type de transaction : vente ou location.
- Type de bien : appartement, villa, terrain, bureau, commerce.
- Titre.
- Description.
- Prix en FCFA.
- Surface en m2.
- Chambres.
- Salles de bain.
- Adresse ou situation geographique.
- Region/commune.
- Coordonnees GPS.
- Atout principal du bien.
- Equipements.
- Photos et videos.

Modes de publication :

- Formulaire classique en etapes : presentation, caracteristiques, localisation, medias.
- Assistant IA en etapes : transaction, type de bien, attributs, prix, localisation, medias.

Regles de validation :

- Titre : minimum 10 caracteres.
- Description : minimum 50 caracteres.
- Surface : minimum 10 m2.
- Adresse : minimum 5 caracteres.
- Medias : images et videos acceptees.
- Assistant IA : au moins un media requis.

### 5.6 Recherches sauvegardees (`/saved-searches`)

Objectif : conserver des criteres et recevoir des alertes.

Fonctionnalites attendues :

- Liste des recherches sauvegardees.
- Creation depuis la page de resultats.
- Modification du nom, des criteres et de la frequence.
- Suppression.
- Frequences : instantanee, quotidienne, hebdomadaire.
- Compteur de nouvelles annonces correspondantes.

### 5.7 Demande de verification (`/verification-request`)

Objectif : obtenir un badge de confiance.

Fonctionnalites attendues :

- Choix du type de demande : particulier ou agence.
- Nom ou raison sociale.
- Numero d'enregistrement pour les agences.
- Message optionnel.
- Envoi de documents justificatifs.
- Consultation du statut : en attente, approuvee, rejetee.
- Affichage d'une note de revue si disponible.

## 6. Gestion des annonces

### 6.1 Statuts

- `DRAFT` : annonce en brouillon ou non publiee.
- `PUBLISHED` : annonce visible publiquement.
- `ARCHIVED` : annonce retiree de la publication.

### 6.2 Forfaits et visibilite

Forfaits cibles a prendre en charge :

- `FREE` : annonce gratuite, visibilite standard, duree limitee.
- `STANDARD` : visibilite superieure aux annonces gratuites.
- `PREMIUM` : visibilite prioritaire, medias enrichis et mise en avant.

Options de promotion :

- Mise en avant en premiere semaine.
- Mise en avant en deuxieme/troisieme semaine.
- Boost journalier.
- Pins admin sur la page d'accueil : `HOME_A`, `HOME_B1`, `HOME_B2`.

### 6.3 Donnees affichees sur une carte d'annonce

- Photo principale.
- Titre.
- Prix.
- Type de transaction.
- Type de bien.
- Commune/quartier.
- Surface.
- Chambres et salles de bain si applicables.
- Badge vendeur verifie.
- Badge premium ou a la une si applicable.
- Boutons voir l'annonce et WhatsApp.

## 7. Paiements

Objectif : permettre l'achat de forfaits, promotions et abonnements.

Moyens de paiement cibles :

- CinetPay.
- Orange Money.
- MTN Mobile Money.
- Moov Money.
- Carte bancaire.

Fonctionnalites attendues :

- Initialisation d'un checkout.
- Association du paiement a une annonce ou a un abonnement.
- Redirection vers le fournisseur si necessaire.
- Page de retour apres paiement.
- Endpoint webhook pour confirmation serveur a serveur.
- Journalisation immutable des webhooks.
- Reconciliation des transactions en backoffice.
- Statuts : en attente, succes, echec, annule.

## 8. Avis et confiance

Objectif : renforcer la qualite des vendeurs et agences.

Fonctionnalites attendues :

- Avis avec note de 1 a 5.
- Commentaire obligatoire.
- Moderation avant publication.
- Reponse publique du vendeur.
- Badge auteur verifie si applicable.
- Moyenne et nombre total d'avis approuves.
- Signalement ou rejet par moderation.

## 9. Geographie et recherche locale

Objectif : adapter le site au marche ivoirien.

Fonctionnalites attendues :

- Catalogue de regions et communes.
- Affichage du nom francais des communes.
- Recherche par commune/quartier.
- Stockage des coordonnees GPS.
- Recherche geospatiale par latitude, longitude et rayon.
- Possibilite d'etendre le modele a d'autres pays.

## 10. PWA, mobile et accessibilite

Le site doit etre concu mobile-first.

Fonctionnalites attendues :

- Interface responsive pour mobile, tablette et desktop.
- Targets tactiles confortables.
- Manifest PWA.
- Page offline.
- Service worker pour le cache.
- Support futur des notifications push pour les alertes.
- Navigation clavier.
- Hierarchie de titres correcte.
- Contrastes conformes WCAG 2.1 AA.
- Etats de focus visibles.

## 11. Internationalisation

Langues cibles :

- Francais par defaut.
- Anglais.

Fonctionnalites attendues :

- Toggle FR/EN dans le header.
- Traduction des textes de navigation, accueil, recherche, annonces, paiements, profils et erreurs.
- Formatage localise des montants en FCFA.
- Formatage localise des dates.

## 12. Backoffice admin

Route frontend : `/admin`.

Objectif : permettre a l'equipe interne d'exploiter la plateforme.

### 12.1 Roles

- `SUPER_ADMIN` : acces complet.
- `OPS` : operations annonces, agences, files, webhooks, transactions.
- `MODERATOR` : moderation annonces et avis.
- `FINANCE` : transactions, webhooks et reconciliation.
- `SUPPORT` : consultation et actions limitees sur les utilisateurs.

### 12.2 Modules

#### Authentification admin

- Connexion.
- Deconnexion.
- Session admin.
- Consultation et mise a jour du profil.
- Changement de mot de passe.

#### Dashboard

- KPIs operationnels.
- Alertes de moderation.
- Synthese des transactions.
- Vue rapide des files et webhooks.

#### Annonces

- Liste filtreable.
- Detail annonce.
- Changement de statut.
- Publication, archivage ou remise en brouillon.
- Pin ou retrait de pin homepage.

#### Agences

- Liste des agences.
- Detail agence.
- Verification ou rejet.
- Consultation des documents.

#### Utilisateurs

- Recherche par nom, email ou telephone.
- Detail utilisateur.
- Mise a jour du statut verifie.
- Actions support limitees.

#### Demandes de verification

- Liste des demandes.
- Detail des informations et documents.
- Approbation ou rejet avec note.

#### Avis

- Liste des avis.
- Detail.
- Approbation, rejet ou signalement.

#### Transactions

- Liste filtreable par fournisseur, statut, date et montant.
- Detail transaction.
- Reconciliation manuelle.

#### Webhooks

- Liste des webhooks recus.
- Detail du payload.
- Verification du traitement.
- Marquage comme traite.

#### Files de jobs

- Vue d'ensemble des queues.
- Liste des jobs.
- Relance des jobs echoues.

#### Administration

- Gestion des comptes admin.
- Activation/desactivation.
- Gestion des roles.
- Journaux d'audit.
- Export des journaux.
- Parametres d'authentification.

## 13. API fonctionnelle cible

### Authentification utilisateur

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/resend-verification`
- `GET /api/auth/verify-email`
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/verification-request`
- `GET /api/auth/verification-request/me`
- `POST /api/auth/logout`
- `DELETE /api/auth/account`
- `GET /api/auth/check`

### Annonces

- `GET /api/listings`
- `GET /api/listings/my`
- `GET /api/listings/:id`
- `POST /api/listings`
- `POST /api/listings/ai-assist`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`

### Recherche sauvegardee

- `GET /api/search/saved`
- `POST /api/search/saved`
- `PATCH /api/search/saved/:id`
- `DELETE /api/search/saved/:id`

### Paiements

- `POST /api/payments/checkout`
- `GET /api/payments/:orderId`
- `GET /api/payments/return/cinetpay`
- `POST /api/payments/return/cinetpay`
- `POST /api/webhooks/payments/:provider`
- `POST /api/webhooks/cinetpay/notify`

### Avis

- `GET /api/reviews/agent/:agentId`
- `POST /api/reviews`
- `POST /api/reviews/:id/respond`

### Historique

- `GET /api/history/recent`

### Geographie

- `GET /api/neighborhoods`
- `GET /api/neighborhoods/popular`
- `GET /api/neighborhoods/:id`

## 14. Regles de securite et conformite

- Les routes utilisateur sensibles necessitent une session valide.
- Les routes admin necessitent une session admin et une permission.
- Les actions admin sensibles doivent etre auditees.
- Les mots de passe sont stockes sous forme de hash.
- Les consentements CGU et confidentialite sont horodates.
- Les webhooks doivent etre journalises et verifies.
- Les endpoints de creation et de recherche sont limites par rate limiting.
- Les fichiers uploades doivent etre limites en taille et type.
- Les donnees personnelles doivent pouvoir etre supprimees via suppression de compte.
- Les numeros ivoiriens doivent respecter le format `+225XXXXXXXXXX` lorsque requis.

## 15. Exigences non fonctionnelles

### Performance

- Chargement rapide sur mobile.
- Optimisation des images.
- Pagination ou chargement progressif des annonces.
- Cache des donnees publiques quand possible.

### SEO

- Pages detail d'annonce indexables.
- Titres et descriptions meta dynamiques.
- URLs propres.
- Sitemap et robots.txt.
- Donnees structurees pour annonces immobilieres a envisager.

### Robustesse

- Etats vides explicites.
- Messages d'erreur comprehensibles.
- Reprise possible apres echec paiement.
- Graceful fallback si WhatsApp, partage natif ou clipboard ne sont pas disponibles.

### Observabilite

- Logs applicatifs.
- Logs d'erreur.
- Suivi des jobs.
- Suivi des webhooks.
- Dashboard admin pour incidents operationnels.

## 16. Priorites de construction

### Version MVP

- Page d'accueil.
- Recherche et liste d'annonces.
- Detail annonce.
- Authentification email/mot de passe.
- Profil utilisateur.
- Depot d'annonce classique.
- Mes annonces.
- Contact WhatsApp et telephone.
- Backoffice minimal : connexion admin, dashboard, moderation annonces.

### Version 1

- Verification utilisateur/agence.
- Avis moderes.
- Recherches sauvegardees.
- Paiements CinetPay.
- Promotions d'annonces.
- Backoffice complet : utilisateurs, agences, transactions, webhooks, audit.

### Version 2

- Assistant IA de publication.
- Abonnements agences.
- Notifications push.
- Recommandations personnalisees.
- Recherche geospatiale avancee.
- Analytics vendeur.

## 17. Criteres d'acceptation globaux

- Un visiteur peut rechercher, filtrer, consulter une annonce et contacter le vendeur.
- Un utilisateur peut creer un compte, completer son profil et publier une annonce.
- Un vendeur peut voir et gerer ses propres annonces.
- Un utilisateur connecte peut sauvegarder une recherche.
- Un utilisateur peut demander une verification avec documents.
- Un administrateur peut moderer les annonces et traiter les demandes selon ses permissions.
- Un paiement confirme active la promotion ou le service achete.
- Les pages principales sont utilisables sur mobile.
- Les erreurs, chargements et etats vides sont affiches clairement.
- Les actions sensibles sont protegees et tracees.
