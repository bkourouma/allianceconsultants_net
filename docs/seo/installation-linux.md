# Installation reproductible sous Linux

La CI utilisait `npm ci --legacy-peer-deps`, tandis que le superviseur utilisait `npm ci --no-audit --no-fund`. Sans le même réglage, le lockfile produit en mode legacy n'était pas accepté par l'installation stricte. Une tentative de régénération stricte sous Node 24 / npm 11 a également révélé le conflit de pair optionnel entre `next-auth@5.0.0-beta.31` (nodemailer ^7.0.7) et le SMTP existant (nodemailer ^6.9.16).

Le fichier `.npmrc` versionne maintenant le réglage déjà choisi par la CI : `legacy-peer-deps=true`. CI et superviseur exécutent donc `npm ci` avec les mêmes règles de résolution. Aucun contrôle CI n'est supprimé, et aucune mise à niveau majeure du composant SMTP n'est introduite par ce correctif d'installation.

Commandes de référence, depuis le dépôt, sous Linux :

```sh
npm ci --no-audit --no-fund
npm run typecheck
npm run lint
npm run validate-content
npm run test:ci
npm run build
npm start -- --hostname 127.0.0.1 --port 4100
```

La compatibilité de construction et le contrôle de l'accueil se vérifient ensuite dans la recette du superviseur. Le réglage de résolution ne résout pas à lui seul une panne de téléchargement des polices Google.

À traiter séparément : aligner les versions de next-auth/nodemailer après validation du parcours SMTP, puis supprimer le mode legacy seulement lorsque le lockfile et tous les contrôles passent en mode strict.
