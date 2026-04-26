# Contract — JSON-LD Organization

**Feature**: 001 — Page d'accueil corporate
**Source de vérité** : FR-105, SC-014 du [spec.md](../spec.md). Source des données : singleton `SiteSettings` du [data-model.md](../data-model.md).

---

## Emplacement et rendu

Le JSON-LD est sérialisé dans le `<head>` de la page d'accueil par un composant **Server** `<JsonLd organization={...} />`, qui rend une balise `<script type="application/ld+json">{...}</script>`.

Le rendu est **côté serveur** (RSC) → indexable par les moteurs de recherche dès la première requête (FR-103).

---

## Schéma de référence

Conforme à [schema.org/Organization](https://schema.org/Organization). Les champs marqués *(obligatoire)* DOIVENT être renseignés et publiés avant la mise en production de la page d'accueil.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Alliance Consultants",
  "alternateName": "Alliance Computer Consultants",
  "url": "https://allianceconsultants.net/",
  "logo": "https://allianceconsultants.net/images/logo.svg",
  "description": "Éditeur et intégrateur africain de solutions SaaS, IA et métiers : GED, santé, immobilier, annonces, formation digitale, automatisation des processus.",
  "foundingDate": "2003",
  "areaServed": [
    { "@type": "Place", "name": "Côte d'Ivoire" },
    { "@type": "Place", "name": "Afrique francophone" }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "<addressStreet — depuis SiteSettings>",
    "addressLocality": "<addressCity>",
    "addressCountry": "CI"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "sales",
      "email": "<contactEmail>",
      "telephone": "<contactPhone>",
      "availableLanguage": ["French"]
    }
  ],
  "sameAs": [
    "<socialLinkedIn — si défini>",
    "<socialFacebook — si défini>",
    "<socialYouTube — si défini>",
    "<socialX — si défini>"
  ]
}
```

---

## Mapping vers `SiteSettings`

| Champ JSON-LD | Source `SiteSettings` |
|---|---|
| `name` | `brandName` |
| `description` | `brandTagline` (ou champ dédié `seoDescription` si plus long) |
| `url` | constante `https://allianceconsultants.net/` (configurée via `NEXT_PUBLIC_SITE_URL`) |
| `logo` | `logoUrl` (résolu en URL absolue) |
| `address.streetAddress` | `addressStreet` |
| `address.addressLocality` | `addressCity` |
| `address.addressCountry` | code ISO du pays (par défaut `CI`) |
| `contactPoint[].email` | `contactEmail` |
| `contactPoint[].telephone` | `contactPhone` |
| `sameAs[]` | filtrer `[socialLinkedIn, socialFacebook, socialYouTube, socialX]` non nuls |
| `foundingDate` | `2003` (constante validée par PRD section 9.2 bloc 7) |

---

## Règles d'émission

1. **Suppression des entrées nulles** : tout champ optionnel dont la source est `null` ou chaîne vide DOIT être omis du JSON (pas de `"sameAs": [null, null]`).
2. **URLs absolues** : tous les `url` et `logo` DOIVENT être absolus (`https://...`). Si la source contient une URL relative, le renderer la résout via `NEXT_PUBLIC_SITE_URL`.
3. **Téléphone** : format E.164 international (`+225...`) attendu en `SiteSettings.contactPhone`. Aucune normalisation automatique côté JSON-LD — c'est la responsabilité de l'éditeur.
4. **Échappement** : le JSON DOIT être sérialisé avec `JSON.stringify` puis injecté tel quel ; aucun caractère HTML brut ne doit s'y glisser (XSS).
5. **Validation à la publication** : la Server Action de publication de `SiteSettings` exécute une validation de cohérence (champs obligatoires non vides) avant d'autoriser la mise en ligne.

---

## Composant de rendu (référence)

```tsx
// src/components/shared/JsonLd.tsx (Server Component)
type OrgJsonLdProps = {
  settings: SiteSettings;
  siteUrl: string;
};

export function OrganizationJsonLd({ settings, siteUrl }: OrgJsonLdProps) {
  const sameAs = [
    settings.socialLinkedIn,
    settings.socialFacebook,
    settings.socialYouTube,
    settings.socialX,
  ].filter((u): u is string => Boolean(u));

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brandName,
    alternateName: "Alliance Computer Consultants",
    url: siteUrl,
    logo: new URL(settings.logoUrl, siteUrl).toString(),
    description: settings.brandTagline,
    foundingDate: "2003",
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressStreet,
      addressLocality: settings.addressCity,
      addressCountry: "CI",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: settings.contactEmail,
        telephone: settings.contactPhone,
        availableLanguage: ["French"],
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

---

## Tests d'acceptation

1. **Validation syntaxique** : Playwright récupère le `<script type="application/ld+json">` de `/`, le parse en JSON, asserte qu'il est valide.
2. **Validation sémantique** : passe le bloc dans le validateur Schema.org (via API publique ou bibliothèque `schema-dts`) → 0 erreur, 0 warning bloquant.
3. **Champs obligatoires** : asserte la présence de `@type`, `name`, `url`, `logo`, `description`, `address`, `contactPoint`.
4. **Cohérence des données** : asserte que `name === SiteSettings.brandName`, `contactPoint[0].email === SiteSettings.contactEmail`, etc.
5. **Pas d'entrée vide** : asserte qu'aucune valeur n'est `null`, `""` ou `undefined`.
6. **Test post-déploiement** : audit manuel via [Google Rich Results Test](https://search.google.com/test/rich-results) sur la page d'accueil de production.

Critère SC-014 : audit Rich Results Test passe sans erreur sur `Organization`.

---

## Évolutions prévues (hors feature 001)

- Ajout de `WebSite` avec `potentialAction` (SearchAction) quand un moteur de recherche interne sera implémenté.
- Ajout de `BreadcrumbList` sur les pages internes (features 002+).
- Ajout de `Product` ou `SoftwareApplication` sur les pages solutions (features 002+).
- Ajout de `Course` sur les pages formations (features 002+).
- Ajout de `FAQPage` quand des FAQ seront publiées sur les pages solutions/services.

Aucune de ces évolutions n'est implémentée par cette feature.
