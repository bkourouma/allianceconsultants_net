# Rapports SEO

Ce dossier rassemble les **rapports d'analyse SEO** du site, datés, pour l'équipe et pour les agents IA qui travaillent sur ce dépôt.

## Lire

- Le rapport le plus récent est le dernier par ordre alphabétique (les noms commencent par la date).
- Chaque rapport commence par un en-tête (front matter) : `site`, `date`, `source`, `periode`, nombre de recommandations par priorité.
- Le **plan d'action** (section 3) liste toutes les recommandations numérotées R1, R2… ; le détail est dans les sections 4 (page par page) et 5 (site entier).

## Agents : avant de toucher au contenu ou au SEO du site

1. Lire le rapport le plus récent (au moins la synthèse et le plan d'action).
2. Pour appliquer une recommandation, citer son numéro et la date du rapport dans le commit et la pull request (ex. « SEO R3 du 2026-10-17 »).
3. Ne jamais modifier un rapport existant : une nouvelle analyse donne un nouveau fichier.

## Écrire un rapport

- Nom : `AAAA-MM-JJ-<type>.md` — `analyse-seo` pour l'Agent SEO du dashboard, `audit-<sujet>` pour un audit fait pendant un chantier (ex. `2026-10-17-audit-technique.md`). Si le nom existe déjà, ajouter `-2`, `-3`…
- En-tête : `type: rapport-seo`, `site`, `nom`, `date`, `source` (`agent-seo-dashboard` ou `audit-chantier`), `auteur`, `periode` si des données Search Console sont utilisées, `recommandations`.
- Plan : 1. Synthèse · 2. Chiffres clés · 3. Plan d'action (tableau N° / priorité / action / recommandation / page / effort) · 4. Analyse page par page · 5. Site entier · 6. Concurrence et objectifs · 7. Mots-clés proposés · 8. Annexes · 9. Méthode et limites. Une section sans contenu reste présente avec « Rien à signaler ».
- Chaque recommandation : numéro, titre, priorité (haute / moyenne / basse), action (ajouter, retirer, réécrire, nouvelle page, technique), page concernée, mots-clés visés, effort, et **quoi faire exactement** (titres, textes, balises proposés).
