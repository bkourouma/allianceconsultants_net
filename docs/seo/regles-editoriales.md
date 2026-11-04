# Règles éditoriales et SEO · allianceconsultants.net

Ces règles s'appliquent à toute modification du contenu du site : textes des pages, balises `title`, H1, meta descriptions, FAQ et liens internes. Elles s'ajoutent aux consignes de l'autopilote SEO de Mission Control et à la constitution du site (`.specify/memory/constitution.md`) : l'agent qui rédige les respecte, l'agent qui vérifie les contrôle.

**Une pull request qui enfreint l'une de ces règles est refusée.** Le vérificateur emploie le code de motif le plus précis (`UNSOURCED_CLAIM`, `INVENTED_PRICE`, `SCOPE_CREEP`…) ou, à défaut, `OTHER`, en citant le numéro de la règle (par exemple « R7 : « Abidjan » retiré de la meta description »).

Ce fichier ne se modifie qu'à la main, après accord de l'équipe Alliance Consultants.

## 1. Ce que le site a le droit d'affirmer

- **R1. Source de vérité.** Une fonctionnalité, un chiffre, une référence client ou une condition commerciale n'est affirmé que s'il figure déjà, sur la branche `main`, dans `content/` (fiches des solutions, services et formations, `site-settings.json`) ou dans les fiches de fonctionnalités de `docs/` (`FONCTIONNALITES-*.md`, `immotopia-fonctionnalites.md`). Pour une solution, sa fiche `content/solutions/<slug>.mdx` prime : un texte ne lui prête rien qu'elle ne dise pas déjà.
- **R2. Allégations non validées.** Les mentions suivantes ne sont ajoutées à aucune page, aucun title ni aucune meta description : « 100+ projets », « 8 pays », « dizaines de clients », tout pourcentage ou multiplicateur de gain (« +40 % de productivité », « x10 plus vite », « 60 à 80 % »), « Certifié & Sécurisé », « Hébergement souverain », les durées, prix et programmes de formation qui ne figurent pas déjà dans `content/trainings/`, et toute date de l'historique autre que la fondation en 2003 à Abidjan. Une mention de cette liste déjà présente sur une page n'est pas recopiée ailleurs ; son retrait relève d'une décision de l'équipe, pas d'une pull request SEO. Les allégations interdites de `scripts/validate-content.ts` (« certifié médical », « agréé MDR », « conforme CE », « licence d'agence immobilière », « agréé OHADA ») font échouer la construction.
- **R3. Périmètre des offres.**
  - Alliance Consultants ne vend pas de scanners. Les articles sur les scanners restent des guides neutres qui mènent à la numérisation, à la dématérialisation des archives et à DocuPro Suite ; aucun texte ne présente la vente ou l'intégration de scanners comme un service.
  - MedicPro est un logiciel de gestion réglementaire pharmaceutique, jamais présenté comme un logiciel médical ni comme un logiciel de cabinet : le cabinet médical relève de CliniquePro.
  - CliniquePro s'adresse à toutes les cliniques, centres de santé et cabinets médicaux, toutes spécialités. L'hospitalisation, le laboratoire et la pharmacie ne sont pas présentés comme des modules de CliniquePro.
  - L'automatisation IA commence par un audit de 5 jours et s'appuie sur les logiciels en place, par leurs API, sans les remplacer.
- **R4. Preuves.** Aucun nom de client, aucun logo, aucun témoignage, aucune certification ni aucune récompense qui ne figure pas déjà sur le site. Les cas clients restent anonymisés et sans chiffres. Aucun superlatif présenté comme un fait (« le meilleur », « n°1 », « leader », « le seul ») : « meilleur logiciel de… » peut figurer comme sujet traité (« comment choisir… »), jamais comme une affirmation sur une solution d'Alliance Consultants.
- **R5. Prix.** Le site n'affiche pas de prix. Une pull request SEO n'ajoute aucun prix, aucune remise, aucune offre d'essai ni aucun tarif de formation.

## 2. Positionnement et mots-clés

Le site s'adresse aux décideurs des entreprises et institutions d'Afrique francophone, en Côte d'Ivoire d'abord. Son avantage dans les recherches est d'être un éditeur africain, installé à Abidjan depuis 2003.

- **R6. Marque ombrelle.** Alliance Consultants est présenté comme un éditeur et intégrateur africain de solutions SaaS, IA et métiers ; aucune solution, pas même DocuPro Suite, n'éclipse les autres sur l'accueil. Les noms s'écrivent comme dans les fiches : « Alliance Consultants », « DocuPro Suite », « MedicPro », « CliniquePro », « ImmoTopia » (« ImmoTopia.cloud » pour le site du produit), « Immo-Annonces.fr », « École Digitale ».
- **R7. L'ancrage local reste.** Quand le title, le H1 ou la meta description d'une page contient « Abidjan », « Côte d'Ivoire », « Afrique » ou « Afrique de l'Ouest », une pull request ne retire jamais cette mention. Si une limite de longueur oblige à choisir, raccourcissez autre chose (un adjectif, « — Alliance Consultants ») plutôt que le lieu.
- **R8. Mots-clés suivis.** Les mots-clés suivis par Mission Control (liste et positions dans le dernier état des lieux, `docs/seo/rapports/`) ne disparaissent jamais du title ni du H1 de la page qui se positionne dessus. Le mot-clé principal se place de préférence au début du title.
- **R9. Une page, une intention.** Le title, le H1 et la meta description de chaque page sont uniques sur le site. Une pull request ne reprend pas le mot-clé principal d'une autre page dans son title, en particulier entre une page solution et un article du blog (pas de cannibalisation).
- **R10. Appels à l'action.** Les pages solutions gardent leur appel principal « Demander une démo » et leur lien vers `/contact-demo` ; aucun appel générique (« En savoir plus » seul) ne les remplace. Les libellés des appels restent identiques d'une page à l'autre.

## 3. Longueurs

Certaines limites sont vérifiées à la construction : une pull request qui les dépasse ne passe pas la CI.

| Type de page | Fichier | Title | Meta description | Contrôle |
| --- | --- | --- | --- | --- |
| Accueil | `content/homepage.mdx` (`seoTitle`, `seoDescription`) | 10 à 60 caractères | 50 à 160 caractères | `scripts/validate-content.ts`, à la construction |
| Solutions | `content/solutions/*.mdx` | 10 à 60 caractères | 50 à 160 caractères | idem |
| Services | `content/services/*.mdx` (champs facultatifs) | 10 à 60 caractères | 50 à 160 caractères | idem |
| Formations | `content/trainings/*.mdx` | `title` (80 caractères au plus) suivi de « — Alliance Consultants » : visez 60 caractères en tout | `shortDescription` : 20 à 220 caractères, 160 conseillés | `title` et `shortDescription` à la construction ; les 60 et 160 conseillés, aucun |
| Articles du blog | en base (voir R16) | 60 caractères au plus | 160 caractères au plus | aucun |

- **R11.** Les champs `seoTitle` sont posés tels quels. Sans `seoTitle`, un service ou une formation reçoit le suffixe « — Alliance Consultants » : la longueur affichée inclut ce suffixe.
- **R12.** Une limite ne justifie jamais d'enfreindre R7 ou R8 : reformulez.

## 4. Style

- **R13. Langue.** Français professionnel, au vouvoiement, avec les accents et la typographie du site : « Côte d'Ivoire » avec majuscules et apostrophe dans le texte visible (les slugs gardent leur forme sans accent).
- **R14. Bénéfices d'abord.** Les textes parlent du bénéfice métier avant la fonctionnalité technique, sans jargon inutile, sur un ton crédible et commercial sans exagération.
- **R15. Pas de redite ni de remplissage.** Une phrase n'ajoute rien qui soit déjà dit dans la phrase qui précède, et un mot-clé n'apparaît que là où il se lit naturellement.

## 5. Liens, adresses et contenus hors du dépôt

- **R16. Articles du blog.** Les articles sont stockés dans la base du site et se modifient dans le back-office (`/admin`). Une pull request SEO ne modifie pas les articles de `prisma/seed.ts` (chemin protégé) : le déploiement ne les applique pas, et leur application ultérieure écraserait les corrections faites dans le back-office.
- **R17. Liens internes.** Les liens internes pointent vers des pages qui existent (solutions, services, formations, articles publiés, `/contact-demo`). Chaque page solution renvoie vers au moins un service et vers le contact.
- **R18. Adresses.** Une pull request ne change jamais le slug (l'adresse) d'une page existante : la page perdrait ses positions. Les redirections et les réponses 410 des anciennes adresses WordPress (`src/middleware.ts`, `src/lib/legacy-wordpress.ts`, `next.config.ts`) relèvent de la configuration : une pull request SEO ne les modifie pas.
- **R19. Coordonnées.** Les coordonnées (adresse, téléphones, e-mails, réseaux sociaux) ne se définissent que dans `content/site-settings.json` ; une pull request SEO ne les modifie pas et ne les recopie pas en dur dans une page.
