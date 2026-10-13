import { Prisma, PrismaClient, type PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// 1. Admin user
// ---------------------------------------------------------------------------

async function ensureAdminUser(): Promise<{ id: string; email: string } | null> {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin Alliance";

  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_EMAIL ou ADMIN_PASSWORD manquant. Aucun utilisateur admin créé.",
    );
    return null;
  }

  if (password.length < 12) {
    throw new Error(
      "[seed] ADMIN_PASSWORD doit contenir au moins 12 caractères.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Utilisateur admin déjà présent : ${email}`);
    return { id: existing.id, email: existing.email };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`[seed] Utilisateur admin créé : ${user.email}`);
  return { id: user.id, email: user.email };
}

// ---------------------------------------------------------------------------
// 2. Blog tags
// ---------------------------------------------------------------------------

const TAGS: { slug: string; label: string }[] = [
  { slug: "solutions", label: "Solutions SaaS" },
  { slug: "services", label: "Services & Conseil" },
  { slug: "formations", label: "Formations" },
  { slug: "ia", label: "Intelligence Artificielle" },
  { slug: "automatisation", label: "Automatisation" },
  { slug: "ged", label: "GED & Archivage" },
  { slug: "sante", label: "Santé" },
  { slug: "immobilier", label: "Immobilier" },
  { slug: "education", label: "Éducation" },
  { slug: "transformation-digitale", label: "Transformation digitale" },
  { slug: "developpement", label: "Développement & Architecture" },
  { slug: "donnees", label: "Données & SQL" },
];

async function seedTags(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const t of TAGS) {
    const tag = await prisma.blogTag.upsert({
      where: { slug: t.slug },
      update: { label: t.label },
      create: { slug: t.slug, label: t.label },
    });
    map[t.slug] = tag.id;
  }
  console.log(`[seed] ${TAGS.length} tags blog en base.`);
  return map;
}

// ---------------------------------------------------------------------------
// 3. Blog posts
// ---------------------------------------------------------------------------

interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  publishedDaysAgo: number;
  /**
   * Thématique de l'article : sert aussi à choisir les 3 articles de « À lire
   * ensuite » (les tags rares comme "ged" ou "sante" pèsent plus que les tags
   * larges "solutions", "services", "formations"). Donner 2 à 3 tags dont au
   * moins un tag thématique précis.
   */
  tagSlugs: string[];
  /**
   * FAQ de l'article (facultatif). Si présente, la page affiche une section
   * « Questions fréquentes » sous le corps de l'article et publie le JSON-LD
   * FAQPage. Réponses en TEXTE BRUT (10 à 1 500 caractères), ne pas répéter
   * la FAQ dans bodyHtml. Détails : src/lib/blog-faq.ts.
   *   faq: [{ question: "Combien de pages par jour ... ?", answer: "..." }],
   */
  faq?: { question: string; answer: string }[];
}

/**
 * Build a clean, sanitizer-safe HTML body.
 * Only uses allowed tags from src/lib/sanitize.ts: p, h2, h3, ul, li, strong, em.
 */
function html(parts: {
  intro: string;
  sections: { h2: string; p: string; bullets?: string[] }[];
  outro: string;
}): string {
  const sections = parts.sections
    .map((s) => {
      const bullets = s.bullets?.length
        ? `<ul>${s.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
        : "";
      return `<h2>${s.h2}</h2><p>${s.p}</p>${bullets}`;
    })
    .join("");
  return `<p>${parts.intro}</p>${sections}<h2>En pratique</h2><p>${parts.outro}</p>`;
}

const POSTS: SeedPost[] = [
  // =========================================================================
  // SOLUTIONS — DocuPro Suite
  // =========================================================================
  {
    slug: "ged-2026-questions-avant-docupro-suite",
    title: "Adopter une GED en 2026 : 6 questions à se poser avant DocuPro Suite",
    excerpt:
      "Avant de déployer une GED comme DocuPro Suite, six questions structurantes sur le périmètre, les workflows et la conduite du changement.",
    bodyHtml: html({
      intro:
        "Une GED ne se choisit pas sur la fiche produit. La réussite d'un projet de gestion électronique des documents repose d'abord sur le cadrage : périmètre, processus cibles, équipes concernées et indicateurs de succès. Voici les six questions que nous posons systématiquement avant de configurer DocuPro Suite chez nos clients.",
      sections: [
        {
          h2: "1. Quel périmètre documentaire dématérialiser en priorité ?",
          p: "On commence rarement par tout numériser. Identifiez 1 à 3 typologies à fort volume ou à forte valeur métier : courriers entrants, contrats, dossiers RH, factures fournisseurs.",
          bullets: [
            "Volume mensuel et stock historique à reprendre",
            "Sensibilité (RGPD, secret professionnel, valeur probante)",
            "Fréquence de consultation par les équipes",
          ],
        },
        {
          h2: "2. Qui sont les utilisateurs et quels sont leurs gestes quotidiens ?",
          p: "Une GED n'est utile que si elle s'intègre aux gestes des équipes. Cartographiez les profils (saisie, validation, consultation) et leurs outils actuels.",
        },
        {
          h2: "3. Quels workflows de validation automatiser ?",
          p: "Avant DocuPro, listez les circuits actuels : qui valide quoi, dans quel ordre, avec quels délais. C'est la base des workflows configurables.",
        },
      ],
      outro:
        "Avec ce cadrage, le déploiement de DocuPro Suite devient un projet maîtrisé : pilote sur un périmètre clair, mesure des gains (temps de recherche, délais de traitement) et extension progressive aux autres directions.",
    }),
    seoTitle: "Adopter une GED en 2026 — checklist DocuPro Suite",
    seoDescription:
      "Six questions à se poser avant un projet GED avec DocuPro Suite : périmètre, utilisateurs, workflows et indicateurs de succès.",
    publishedDaysAgo: 5,
    tagSlugs: ["solutions", "ged", "transformation-digitale"],
  },
  {
    slug: "docupro-suite-retour-experience-administration",
    title: "DocuPro Suite : retour d'expérience d'une administration sur la dématérialisation",
    excerpt:
      "Comment une administration africaine a réduit ses délais de traitement courriers de 70 % avec DocuPro Suite : périmètre, équipes, et leçons apprises.",
    bodyHtml: html({
      intro:
        "Nous accompagnons régulièrement des administrations dans leurs projets de dématérialisation. Voici les enseignements concrets d'un déploiement DocuPro Suite mené sur 18 mois dans une direction recevant plus de 4 000 courriers par mois.",
      sections: [
        {
          h2: "Le contexte initial",
          p: "Avant DocuPro Suite : des courriers physiques numérisés en PDF mais classés dans un partage de fichiers, sans indexation ni traçabilité des accusés de réception. Les délais moyens de traitement dépassaient 12 jours ouvrés.",
        },
        {
          h2: "Les modules activés",
          p: "Le projet a démarré avec deux modules de DocuPro Suite, en mode pilote :",
          bullets: [
            "Docu-Courrier — réception, imputation, traçabilité des accusés",
            "Docu-Archives — indexation par champs métier configurables",
            "Workflows — circuits de validation paramétrés par direction",
          ],
        },
        {
          h2: "Les résultats à 18 mois",
          p: "Les délais moyens de traitement sont passés de 12 à 3,5 jours. La recherche d'un courrier antérieur prend désormais quelques secondes contre plusieurs minutes auparavant.",
        },
      ],
      outro:
        "Ce qui a fait la différence : un sponsor métier engagé, un pilote restreint avant la généralisation, et une formation des agents de saisie en présentiel. La technologie compte, mais la conduite du changement encore plus.",
    }),
    seoTitle: "DocuPro Suite — cas client administration africaine",
    seoDescription:
      "Retour d'expérience d'un projet DocuPro Suite : -70 % de délais de traitement courriers, indexation, workflows et conduite du changement.",
    publishedDaysAgo: 18,
    tagSlugs: ["solutions", "ged"],
  },

  // =========================================================================
  // SOLUTIONS — MedicPro
  // =========================================================================
  {
    slug: "medicpro-digitaliser-cabinet-medical",
    title: "MedicPro : digitaliser un cabinet médical sans perdre la relation patient",
    excerpt:
      "Comment MedicPro accompagne la digitalisation des cabinets médicaux africains tout en préservant la qualité de la consultation et la confidentialité.",
    bodyHtml: html({
      intro:
        "Digitaliser un cabinet médical, ce n'est pas remplacer le carnet papier par un écran. C'est repenser le parcours patient — accueil, consultation, ordonnance, archivage — avec un outil qui s'efface devant la relation soignante.",
      sections: [
        {
          h2: "Le risque d'une digitalisation mal conçue",
          p: "Beaucoup d'outils transforment la consultation en saisie de formulaire. Le médecin regarde l'écran plutôt que le patient. MedicPro est conçu pour rester en arrière-plan.",
        },
        {
          h2: "Les fonctionnalités clés de MedicPro",
          p: "Un dossier patient unifié et accessible en quelques clics, avec :",
          bullets: [
            "Historique complet (consultations, ordonnances, examens)",
            "Saisie rapide par modèles de consultation et raccourcis",
            "Ordonnance électronique avec base de médicaments à jour",
            "Statistiques pour le pilotage du cabinet",
          ],
        },
        {
          h2: "La confidentialité par défaut",
          p: "Chaque accès au dossier est tracé. Les données sont chiffrées au repos et en transit. Les sauvegardes sont automatiques et restaurables en cas d'incident.",
        },
      ],
      outro:
        "Un déploiement réussi commence par un audit du parcours patient existant et une formation courte mais ciblée. Nous proposons un accompagnement de 4 à 6 semaines selon la taille du cabinet.",
    }),
    seoTitle: "MedicPro — digitaliser un cabinet médical",
    seoDescription:
      "MedicPro, le logiciel cabinet médical d'Alliance Consultants : dossier patient, ordonnance électronique, confidentialité et formation incluses.",
    publishedDaysAgo: 9,
    tagSlugs: ["solutions", "sante"],
  },
  {
    slug: "medicpro-confidentialite-conformite-dossier-patient",
    title: "Dossier patient informatisé : confidentialité et conformité avec MedicPro",
    excerpt:
      "MedicPro garantit la confidentialité du dossier patient grâce au chiffrement, aux droits d'accès granulaires et à l'audit complet des consultations.",
    bodyHtml: html({
      intro:
        "Le dossier patient est l'un des actifs les plus sensibles d'un établissement de santé. Le digitaliser implique une obligation forte : garantir confidentialité, intégrité et traçabilité, à la fois pour la conformité réglementaire et pour la confiance des patients.",
      sections: [
        {
          h2: "Le contrôle d'accès granulaire",
          p: "MedicPro applique un principe simple : chaque utilisateur n'accède qu'aux dossiers strictement nécessaires à son rôle.",
          bullets: [
            "Profils Médecin, Infirmier, Secrétariat, Caisse, Direction",
            "Droits par cabinet, par service ou par praticien référent",
            "Exclusion explicite de données sensibles selon le profil",
          ],
        },
        {
          h2: "Le chiffrement et la sauvegarde",
          p: "Les bases sont chiffrées au repos. Les communications passent par TLS. Des sauvegardes chiffrées sont produites quotidiennement et conservées hors site.",
        },
        {
          h2: "L'audit des consultations",
          p: "Chaque ouverture, modification ou export d'un dossier est journalisé. Les rapports d'audit sont consultables par la direction et peuvent être exportés en cas de demande réglementaire.",
        },
      ],
      outro:
        "MedicPro est conçu pour répondre aux exigences des autorités sanitaires africaines tout en restant simple à utiliser. Un audit de configuration est inclus dans chaque mise en production.",
    }),
    seoTitle: "MedicPro — confidentialité du dossier patient",
    seoDescription:
      "Chiffrement, droits granulaires et audit : comment MedicPro sécurise le dossier patient informatisé pour les cabinets et cliniques africains.",
    publishedDaysAgo: 25,
    tagSlugs: ["solutions", "sante"],
  },

  // =========================================================================
  // SOLUTIONS — CliniquePro
  // =========================================================================
  {
    slug: "cliniquepro-facturation-pilotage-multi-services",
    title: "CliniquePro : structurer la facturation et le pilotage d'une clinique multi-services",
    excerpt:
      "Comment CliniquePro unifie consultations, hospitalisation, laboratoire et caisse pour une facturation fiable et un pilotage en temps réel.",
    bodyHtml: html({
      intro:
        "Dans une clinique multi-services, la difficulté n'est pas tant la prise en charge médicale que la cohérence administrative : un patient passe par plusieurs services dans la même journée et la facturation doit refléter ce parcours sans perte ni double comptage.",
      sections: [
        {
          h2: "Une facturation pilotée par le parcours patient",
          p: "CliniquePro s'appuie sur une notion centrale : la prise en charge. Chaque acte (consultation, examen, hospitalisation) est rattaché à une prise en charge unique, ce qui évite les doublons.",
          bullets: [
            "Tarifs configurables par convention (mutuelles, assurances)",
            "Prise en charge partielle automatique selon les contrats",
            "Édition d'une facture consolidée multi-services",
          ],
        },
        {
          h2: "Le pilotage en temps réel",
          p: "Tableaux de bord par service, par praticien et par période : taux d'occupation, recettes, restes à recouvrer. Les directions disposent d'une vision quotidienne.",
        },
        {
          h2: "L'intégration avec les autres modules",
          p: "Laboratoire, pharmacie, hospitalisation et caisse partagent la même base patient. Un examen prescrit en consultation arrive directement au laboratoire, et son coût remonte dans la facture.",
        },
      ],
      outro:
        "Le déploiement type d'une CliniquePro se fait en 8 à 12 semaines selon le nombre de services. Nous intervenons sur la configuration tarifaire, la formation des caissiers et l'accompagnement de la direction.",
    }),
    seoTitle: "CliniquePro — facturation et pilotage clinique",
    seoDescription:
      "CliniquePro structure la facturation multi-services et le pilotage des cliniques : prises en charge, conventions, tableaux de bord temps réel.",
    publishedDaysAgo: 14,
    tagSlugs: ["solutions", "sante"],
  },
  {
    slug: "cliniquepro-parcours-patient-rdv-sortie",
    title: "Parcours patient orchestré avec CliniquePro : du RDV à la sortie",
    excerpt:
      "Comment CliniquePro orchestre l'ensemble du parcours patient — prise de RDV, accueil, consultation, examens, facturation, sortie — sur une plateforme unique.",
    bodyHtml: html({
      intro:
        "Un patient qui entre dans une clinique attend deux choses : un soin de qualité et un parcours fluide. Quand l'organisation administrative coince, l'expérience se dégrade et le pilotage devient impossible. CliniquePro orchestre ce parcours bout-en-bout.",
      sections: [
        {
          h2: "La prise de rendez-vous et l'accueil",
          p: "Les agendas des praticiens sont partagés. Le secrétariat planifie en quelques clics et envoie les rappels par SMS pour réduire l'absentéisme.",
        },
        {
          h2: "Le passage en consultation et les examens",
          p: "Le médecin retrouve le patient avec son historique complet. Les prescriptions d'examens partent automatiquement vers le laboratoire ou l'imagerie.",
          bullets: [
            "Dossier patient unifié, accessible aux praticiens autorisés",
            "Prescriptions et résultats remontent dans le dossier",
            "Compte-rendu signé et archivé numériquement",
          ],
        },
        {
          h2: "La facturation et la sortie",
          p: "À la sortie, la caisse édite une facture consolidée. Les conventions assurance/mutuelle sont appliquées automatiquement. Les pièces justificatives sont conservées dans le dossier.",
        },
      ],
      outro:
        "Cette orchestration repose sur une configuration métier précise : nomenclature des actes, conventions, droits d'accès. Notre équipe accompagne chaque clinique dans cette phase critique.",
    }),
    seoTitle: "CliniquePro — parcours patient bout-en-bout",
    seoDescription:
      "RDV, accueil, consultation, examens, facturation, sortie : CliniquePro orchestre tout le parcours patient sur une plateforme unique.",
    publishedDaysAgo: 32,
    tagSlugs: ["solutions", "sante"],
  },

  // =========================================================================
  // SOLUTIONS — ImmoTopia.cloud
  // =========================================================================
  {
    slug: "immotopia-cloud-5-leviers-agences-immobilieres",
    title: "Agences immobilières : 5 leviers d'efficacité avec ImmoTopia.cloud",
    excerpt:
      "Cinq leviers concrets pour gagner en efficacité dans une agence immobilière africaine grâce à ImmoTopia.cloud : mandats, biens, clients, diffusion, reporting.",
    bodyHtml: html({
      intro:
        "Les agences immobilières africaines partagent un même défi : gérer une activité multi-sites avec des données dispersées entre tableurs, e-mails et téléphones. ImmoTopia.cloud centralise ces flux et libère du temps commercial.",
      sections: [
        {
          h2: "1. Centraliser les mandats et les biens",
          p: "Une seule base mandats/biens accessible depuis n'importe quel poste. Plus de fichiers Excel locaux qui divergent entre agences.",
          bullets: [
            "Saisie unique avec champs obligatoires métier",
            "Photos, plans, documents juridiques attachés au bien",
            "Historique des prix, des visites et des offres",
          ],
        },
        {
          h2: "2. Suivre les clients et leurs critères",
          p: "Un CRM immobilier connecté aux biens : matching automatique entre une nouvelle annonce et les recherches actives.",
        },
        {
          h2: "3. Diffuser et publier",
          p: "Publication multi-canale : site agence, portails partenaires, réseaux sociaux. Mise à jour propagée instantanément.",
        },
        {
          h2: "4. Piloter en temps réel",
          p: "Tableaux de bord : pipeline, conversion, performance des négociateurs, délai moyen de mise en location.",
        },
        {
          h2: "5. Sécuriser la conformité",
          p: "Vérifications KYC, archivage des contrats et journal d'audit pour répondre aux demandes des autorités de tutelle.",
        },
      ],
      outro:
        "Sur les 12 derniers mois, les agences ayant déployé ImmoTopia.cloud constatent un gain moyen de 30 % sur le temps administratif et une meilleure traçabilité des dossiers.",
    }),
    seoTitle: "ImmoTopia.cloud — 5 leviers pour agences immobilières",
    seoDescription:
      "Mandats, biens, clients, diffusion, reporting : 5 leviers concrets d'efficacité avec ImmoTopia.cloud pour les agences immobilières africaines.",
    publishedDaysAgo: 7,
    tagSlugs: ["solutions", "immobilier", "transformation-digitale"],
  },
  {
    slug: "immotopia-cloud-centraliser-mandats-biens-clients",
    title: "ImmoTopia.cloud : centraliser mandats, biens et clients sur une plateforme SaaS",
    excerpt:
      "ImmoTopia.cloud unifie le portefeuille de mandats, le catalogue de biens et le CRM clients sur une plateforme SaaS multi-agences accessible partout.",
    bodyHtml: html({
      intro:
        "Une agence immobilière qui se développe sur plusieurs sites finit par perdre la vision d'ensemble : qui gère quel bien, quel client a déjà visité quoi, quel mandat arrive à échéance. ImmoTopia.cloud apporte une réponse SaaS multi-agences.",
      sections: [
        {
          h2: "Une seule base, plusieurs agences",
          p: "Chaque agence garde ses données locales mais partage un référentiel commun : biens, mandats, clients. Les transferts entre agences sont tracés.",
        },
        {
          h2: "Le portefeuille mandats",
          p: "Suivi du cycle de vie complet du mandat : signature, exclusivité, échéances, renouvellement.",
          bullets: [
            "Alertes d'échéance et relances automatiques",
            "Documents contractuels archivés numériquement",
            "Statistiques d'efficacité par négociateur",
          ],
        },
        {
          h2: "Le CRM client connecté",
          p: "Profil client avec critères de recherche structurés, historique de visites et offres, communications enregistrées.",
        },
      ],
      outro:
        "ImmoTopia.cloud est livré en mode SaaS : pas d'infrastructure à gérer, mises à jour incluses, support local en français. Le déploiement standard prend 4 à 6 semaines.",
    }),
    seoTitle: "ImmoTopia.cloud — plateforme SaaS multi-agences",
    seoDescription:
      "Plateforme SaaS multi-agences pour centraliser mandats, biens et clients : ImmoTopia.cloud, l'outil métier des agences immobilières africaines.",
    publishedDaysAgo: 22,
    tagSlugs: ["solutions", "immobilier"],
  },

  // =========================================================================
  // SOLUTIONS — Annonces Web
  // =========================================================================
  {
    slug: "annonces-web-lancer-site-classifiees-rentable",
    title: "Lancer un site d'annonces classifiées rentable en Afrique avec Annonces Web",
    excerpt:
      "Modèle économique, modération, SEO et trafic : comment lancer une plateforme d'annonces classifiées rentable en Afrique avec Annonces Web.",
    bodyHtml: html({
      intro:
        "Le marché des annonces classifiées africain est dynamique mais concurrentiel. Lancer une plateforme rentable suppose un produit solide, un modèle économique clair et un investissement marketing maîtrisé. Annonces Web fournit la base technique, mais la stratégie reste votre meilleur atout.",
      sections: [
        {
          h2: "Choisir une niche ou rester généraliste",
          p: "Les plateformes verticales (immobilier, automobile, emploi, agriculture) trouvent plus facilement leur public et leur modèle économique qu'une marketplace généraliste.",
        },
        {
          h2: "Le modèle économique",
          p: "Plusieurs leviers à combiner :",
          bullets: [
            "Mise en avant payante des annonces (boost)",
            "Comptes professionnels avec quotas et abonnements",
            "Bannières publicitaires ciblées",
            "Offres premium pour les utilisateurs (alertes, contact direct)",
          ],
        },
        {
          h2: "La modération et la qualité",
          p: "Une plateforme prospère par la confiance. Modération a priori sur les nouveaux comptes, signalement par la communauté, vérification d'identité pour les pros.",
        },
      ],
      outro:
        "Annonces Web embarque ces fonctionnalités en standard. Notre équipe accompagne le lancement : design, paramétrage des règles métier, intégration des moyens de paiement locaux.",
    }),
    seoTitle: "Annonces Web — lancer une plateforme rentable",
    seoDescription:
      "Modèle économique, modération, SEO : tout pour lancer une plateforme d'annonces classifiées rentable en Afrique avec Annonces Web.",
    publishedDaysAgo: 11,
    tagSlugs: ["solutions", "transformation-digitale"],
  },
  {
    slug: "annonces-web-monetisation-moderation-seo",
    title: "Annonces Web : monétisation, modération et SEO pour vos plateformes verticales",
    excerpt:
      "Monétisation par boost et abonnements, modération en plusieurs niveaux et SEO orienté longue traîne : les leviers techniques d'Annonces Web.",
    bodyHtml: html({
      intro:
        "Une plateforme d'annonces classifiées vit de son trafic et de la qualité des contenus. Annonces Web a été conçue pour combiner trois leviers indissociables : monétisation, modération, SEO.",
      sections: [
        {
          h2: "Monétisation flexible",
          p: "Plusieurs offres peuvent coexister : annonces gratuites pour particuliers, packs pour professionnels, options de mise en avant payantes.",
          bullets: [
            "Paiement Mobile Money intégré",
            "Quotas d'annonces par compte",
            "Boost à durée variable et bannières sponsorisées",
          ],
        },
        {
          h2: "Modération multi-niveaux",
          p: "File de modération avec règles automatiques (mots-clés interdits, doublons, photos suspectes) et validation humaine sur signalement.",
        },
        {
          h2: "SEO et trafic organique",
          p: "URL parlantes, balisage Schema.org, sitemap dynamique, AMP optionnel : les annonces remontent naturellement dans Google sur la longue traîne.",
        },
      ],
      outro:
        "Le succès d'une plateforme d'annonces se mesure sur 6 à 12 mois. Annonces Web est livré avec un kit de démarrage SEO et un module d'analyse pour piloter les chantiers d'optimisation.",
    }),
    seoTitle: "Annonces Web — monétisation, modération, SEO",
    seoDescription:
      "Annonces Web : leviers de monétisation, modération multi-niveaux et SEO pour des plateformes d'annonces classifiées africaines performantes.",
    publishedDaysAgo: 28,
    tagSlugs: ["solutions"],
  },

  // =========================================================================
  // SOLUTIONS — École Digitale
  // =========================================================================
  {
    slug: "ecole-digitale-relation-parents-ecole",
    title: "École Digitale : pourquoi numériser la scolarité change la relation parents-école",
    excerpt:
      "Bulletins, paiements, absences, devoirs : École Digitale change la relation parents-école en donnant une vision quotidienne de la scolarité.",
    bodyHtml: html({
      intro:
        "Pendant longtemps, les parents recevaient les nouvelles de l'école une fois par trimestre, dans un bulletin papier. La numérisation de la scolarité change profondément cette relation : les parents sont informés au quotidien, et l'école gagne en transparence.",
      sections: [
        {
          h2: "Une transparence quotidienne",
          p: "École Digitale envoie aux parents les informations du jour : présence, devoirs donnés, notes saisies, communications de l'établissement.",
          bullets: [
            "Notification SMS ou push selon les préférences",
            "Espace parent par enfant avec historique",
            "Échange direct avec le professeur principal",
          ],
        },
        {
          h2: "Un pilotage simplifié pour l'école",
          p: "Saisie des notes en classe, génération automatique des bulletins, suivi des paiements de scolarité : l'administration recentrée sur la pédagogie.",
        },
        {
          h2: "Une responsabilisation des élèves",
          p: "Les élèves accèdent à leur emploi du temps, leurs devoirs et leurs notes. Cette visibilité encourage l'autonomie et la régularité.",
        },
      ],
      outro:
        "École Digitale se déploie typiquement en 6 à 10 semaines. Nous accompagnons l'établissement sur la formation des enseignants et la communication aux parents pour garantir l'adhésion.",
    }),
    seoTitle: "École Digitale — relation parents-école numérique",
    seoDescription:
      "Bulletins, paiements, absences : École Digitale rapproche parents et école en donnant une vision quotidienne et structurée de la scolarité.",
    publishedDaysAgo: 16,
    tagSlugs: ["solutions", "education"],
  },
  {
    slug: "ecole-digitale-modules-cles-bulletins-paiements",
    title: "Bulletins, paiements et emplois du temps : les 4 modules clés d'École Digitale",
    excerpt:
      "Tour d'horizon des 4 modules clés d'École Digitale : scolarité, finances, communication et pédagogie pour piloter un établissement scolaire.",
    bodyHtml: html({
      intro:
        "Un logiciel de gestion scolaire ne se résume pas à un cahier de notes en ligne. École Digitale s'organise en quatre modules indissociables, qui couvrent l'ensemble du cycle de vie d'un établissement.",
      sections: [
        {
          h2: "1. Scolarité",
          p: "Inscription, classes, emplois du temps, notes, bulletins, conseils de classe.",
          bullets: [
            "Génération automatique des bulletins par période",
            "Coefficients et systèmes de notation configurables",
            "Conseils de classe assistés par tableaux de bord",
          ],
        },
        {
          h2: "2. Finances",
          p: "Suivi des frais de scolarité, échéanciers, paiements partiels, relances automatiques. Intégration Mobile Money pour fluidifier les encaissements.",
        },
        {
          h2: "3. Communication",
          p: "Notifications SMS et push, messagerie interne, diffusion d'annonces officielles, gestion des absences.",
        },
        {
          h2: "4. Pédagogie",
          p: "Cahier de textes, ressources pédagogiques, devoirs en ligne, suivi de la progression individuelle.",
        },
      ],
      outro:
        "Les quatre modules sont conçus pour fonctionner ensemble. Une école peut démarrer sur la scolarité et étendre progressivement aux autres modules selon sa maturité.",
    }),
    seoTitle: "École Digitale — 4 modules pour gérer un établissement",
    seoDescription:
      "Scolarité, finances, communication, pédagogie : les 4 modules clés d'École Digitale pour piloter un établissement scolaire africain.",
    publishedDaysAgo: 35,
    tagSlugs: ["solutions", "education"],
  },

  // =========================================================================
  // SERVICES — Développement spécifique
  // =========================================================================
  {
    slug: "developpement-specifique-vs-saas-standard",
    title: "Développement spécifique vs SaaS standard : quand choisir le sur-mesure ?",
    excerpt:
      "Cinq critères pour décider entre un SaaS standard et un développement spécifique : différenciation, intégration, conformité, coût total et délai.",
    bodyHtml: html({
      intro:
        "Faut-il acheter un SaaS du marché ou développer une solution sur mesure ? La question revient dans tous nos diagnostics. Il n'y a pas de réponse universelle : tout dépend de la nature du processus à outiller et du niveau de différenciation visé.",
      sections: [
        {
          h2: "Quand le SaaS standard suffit",
          p: "Comptabilité, paie, RH généralistes : ces processus sont normés et bien couverts par des éditeurs établis. Le SaaS reste presque toujours le bon choix.",
        },
        {
          h2: "Quand le sur-mesure devient pertinent",
          p: "Le développement spécifique se justifie dans cinq situations :",
          bullets: [
            "Le processus est un avantage concurrentiel différenciant",
            "L'intégration au système existant est complexe",
            "Les exigences réglementaires locales sont fortes",
            "Le coût total d'un SaaS dépasse le coût de développement",
            "Aucun éditeur ne couvre correctement le besoin",
          ],
        },
        {
          h2: "Le modèle hybride",
          p: "Souvent, la meilleure réponse est hybride : SaaS pour les fonctions standard et briques spécifiques pour les processus stratégiques, reliés par API.",
        },
      ],
      outro:
        "Notre équipe AMOA peut vous aider à formaliser la décision : étude comparative, calcul du coût total sur 5 ans, prototype rapide pour valider les hypothèses.",
    }),
    seoTitle: "Développement spécifique vs SaaS — quel choix ?",
    seoDescription:
      "Cinq critères pour décider entre SaaS standard et développement spécifique sur mesure : différenciation, conformité, coût total, intégration.",
    publishedDaysAgo: 4,
    tagSlugs: ["services", "developpement"],
  },
  {
    slug: "developpement-specifique-methode-mvp-recette",
    title: "Cahier des charges, MVP, recette : notre méthode de développement spécifique",
    excerpt:
      "De la spécification au déploiement : méthode itérative, MVP en 3 mois, recette utilisateur structurée et déploiement progressif.",
    bodyHtml: html({
      intro:
        "Un projet de développement spécifique réussit rarement sur un cahier des charges écrit à plat puis livré 12 mois plus tard. Notre méthode privilégie l'itération courte, les démonstrations régulières et la mise en production progressive.",
      sections: [
        {
          h2: "Phase 1 — Cadrage et spécification (4 à 6 semaines)",
          p: "Atelier métier, cartographie des processus, priorisation des cas d'usage, maquette interactive validée avant tout développement.",
        },
        {
          h2: "Phase 2 — MVP (8 à 12 semaines)",
          p: "Une version fonctionnelle déployée sur un environnement pilote couvre les cas d'usage prioritaires.",
          bullets: [
            "Sprints de 2 semaines avec démo systématique",
            "Code review et tests automatisés dès le départ",
            "Documentation utilisateur produite au fil de l'eau",
          ],
        },
        {
          h2: "Phase 3 — Recette et mise en production",
          p: "Recette utilisateur structurée par scénarios, formation des super-utilisateurs, déploiement progressif (par site, par direction).",
        },
      ],
      outro:
        "Cette méthode permet de livrer un premier outil utilisable en 3 à 4 mois et de l'enrichir par incréments tout en mesurant les gains métier.",
    }),
    seoTitle: "Méthode de développement spécifique — MVP & recette",
    seoDescription:
      "Spécification, MVP en 3 mois, recette utilisateur, déploiement progressif : la méthode Alliance pour réussir un développement spécifique.",
    publishedDaysAgo: 19,
    tagSlugs: ["services", "developpement"],
  },

  // =========================================================================
  // SERVICES — Automatisation IA
  // =========================================================================
  {
    slug: "automatisation-ia-7-processus-pme",
    title: "Automatisation IA pour PME : 7 processus métiers à automatiser en priorité",
    excerpt:
      "Sept processus à fort ROI à automatiser en priorité dans une PME grâce à l'IA et à n8n : pour chacun, le problème, ce que fait l'automatisation et comment mesurer le résultat.",
    bodyHtml: [
      `<p>Dans beaucoup de PME africaines, des heures de travail partent chaque semaine dans des tâches répétitives : ressaisir des factures, trier des e-mails, relire des CV, rédiger des comptes rendus. L'<strong>automatisation IA pour PME</strong> consiste à confier ces tâches à des flux automatisés capables de lire des documents et des messages, pour laisser aux équipes la décision et la relation avec les clients. Voici les sept processus que nous automatisons le plus souvent, la façon de choisir le premier et les obstacles à anticiper.</p>`,

      `<h2>Qu'est-ce que l'automatisation IA pour une PME ?</h2>`,
      `<p>Trois notions sont souvent mélangées.</p>`,
      `<ul>`,
      `<li><strong>L'automatisation classique</strong> enchaîne des étapes selon des règles fixes : « quand une facture arrive dans cette boîte, la copier dans ce dossier et prévenir la comptabilité ».</li>`,
      `<li><strong>L'IA</strong> (OCR, modèles de langage ou LLM) apporte ce que les règles fixes ne savent pas faire : lire un document scanné, comprendre un e-mail écrit librement, résumer un texte, en extraire des informations.</li>`,
      `<li><strong>Un agent IA</strong> choisit lui-même ses étapes pour atteindre un objectif. C'est puissant, mais moins prévisible : en PME, on commence presque toujours par des workflows maîtrisés avec une validation humaine aux étapes sensibles.</li>`,
      `</ul>`,
      `<p>L'automatisation IA combine donc les deux premières briques : n8n pour l'enchaînement, l'IA pour la compréhension, vos applications métier en cible via leurs API. Détails techniques : <a href="/blog/n8n-llms-api-architectures-automatisation-ia">architectures-types n8n, LLMs et API</a>.</p>`,

      `<h2>1. Saisie et catégorisation des factures fournisseurs</h2>`,
      `<p><strong>Le problème.</strong> Les factures arrivent par e-mail, en PDF, en photo ou sur papier, dans des formats tous différents. Les ressaisir est long, source d'erreurs, et retarde l'enregistrement comptable.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> Un flux n8n surveille la boîte e-mail ou le dossier de dépôt. L'OCR lit le document, puis un LLM extrait le fournisseur, la date, les montants et propose une catégorie comptable, dans un format de sortie strict. Les données sont contrôlées puis écrites dans votre outil de comptabilité par API ; les anomalies vont au comptable.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Moins de temps de saisie, moins d'erreurs, un délai plus court entre la réception et l'enregistrement. Mesurez le temps de traitement par facture, le nombre de corrections manuelles et le délai d'enregistrement, avant et après, sur un échantillon.</p>`,

      `<h2>2. Tri et qualification des demandes de support</h2>`,
      `<p><strong>Le problème.</strong> Les demandes arrivent par e-mail, formulaire ou messagerie, et quelqu'un doit les lire une à une pour les classer.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> Chaque demande est classée par sujet, urgence et langue, rapprochée des demandes déjà ouvertes, puis dirigée vers la bonne personne. À partir de votre base de connaissances, le système propose un brouillon de réponse que l'agent relit avant envoi.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Suivez le délai de première réponse, la part de demandes correctement orientées dès le premier passage et la charge de tri de l'équipe. Des exemples détaillés figurent dans nos <a href="/blog/cas-usage-ia-pme-africaines-marketing-support-rh">cas d'usage IA pour PME africaines</a>.</p>`,

      `<h2>3. Réponses standards aux e-mails fréquents</h2>`,
      `<p><strong>Le problème.</strong> Les mêmes questions reviennent tous les jours (disponibilité, délais, statut d'une commande, documents à fournir) et chacune demande quelques minutes de rédaction.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> À partir de modèles que vous avez validés et des données de vos applications, le système prépare un brouillon dans le ton de l'entreprise. Un collaborateur relit, ajuste si besoin et envoie.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Des réponses plus rapides et plus homogènes. Mesurez le temps de réponse, la part de brouillons envoyés sans modification et les retours des clients.</p>`,

      `<h2>4. Extraction d'informations dans les contrats et les CV</h2>`,
      `<p><strong>Le problème.</strong> Les informations utiles (dates d'échéance, parties, clauses à surveiller, expérience et compétences d'un candidat) sont enfouies dans des PDF qu'il faut lire en entier.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> L'OCR et un LLM extraient les champs demandés vers un tableau structuré. Pour les contrats, le système alimente un calendrier d'échéances et alerte avant les dates clés. Pour les CV, il présente les profils selon les critères du poste, la décision finale restant celle du recruteur.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Un dépouillement plus rapide et des échéances moins souvent oubliées. Mesurez le temps de dépouillement par dossier et le nombre d'échéances manquées.</p>`,

      `<h2>5. Comptes rendus de réunion à partir d'enregistrements</h2>`,
      `<p><strong>Le problème.</strong> Personne ne veut rédiger le compte rendu, il arrive tard, et les décisions et les actions se perdent.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> L'enregistrement est transcrit, puis un LLM produit un résumé, la liste des décisions et les actions avec leur responsable et leur échéance. Le document est envoyé aux participants après relecture rapide, et les actions peuvent être créées dans votre outil de suivi de tâches.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Mesurez le délai d'envoi du compte rendu et la part d'actions réellement clôturées.</p>`,

      `<h2>6. Veille concurrentielle et synthèse automatisée</h2>`,
      `<p><strong>Le problème.</strong> La veille se fait quand on a le temps, donc rarement.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> n8n collecte régulièrement les sources que vous choisissez (sites de concurrents, actualités du secteur, appels d'offres). Un LLM écarte le bruit, résume l'essentiel et classe les informations par thème. Une synthèse est envoyée chaque semaine par e-mail ou sur votre messagerie.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Mesurez la régularité des envois, l'utilité perçue par les lecteurs et le temps libéré.</p>`,

      `<h2>7. Pré-qualification des leads commerciaux</h2>`,
      `<p><strong>Le problème.</strong> Les demandes arrivent du site, des salons ou des réseaux sociaux. Les commerciaux passent du temps sur des contacts peu qualifiés, et d'autres sont rappelés trop tard.</p>`,
      `<p><strong>Ce que fait l'automatisation.</strong> Chaque demande est analysée, notée selon vos critères de qualification et affectée au bon commercial, avec un résumé du besoin. Un accusé de réception est envoyé immédiatement, et la fiche est créée dans votre outil de suivi commercial.</p>`,
      `<p><strong>Résultat attendu et mesure.</strong> Suivez le délai de premier contact, la part de leads qualifiés et le taux de rendez-vous obtenus.</p>`,

      `<h2>Comment choisir son premier processus</h2>`,
      `<p>Le bon premier projet n'est pas le plus ambitieux, c'est celui qui réunit ces conditions :</p>`,
      `<ul>`,
      `<li><strong>Un volume répétitif</strong> : la tâche revient chaque jour ou chaque semaine, pour que le gain se voie.</li>`,
      `<li><strong>Des règles claires</strong> : vous savez expliquer ce qu'une personne compétente fait, étape par étape.</li>`,
      `<li><strong>Des données disponibles</strong> : les documents et les informations existent en numérique et sont accessibles.</li>`,
      `<li><strong>Un risque maîtrisé</strong> : une erreur est rattrapable, et une validation humaine peut être prévue.</li>`,
      `<li><strong>Un résultat mesurable</strong> : vous pouvez comparer la situation avant et après.</li>`,
      `</ul>`,
      `<p>Notre méthode suit toujours le même enchaînement : cartographie du processus, calcul du ROI, prototype en 2 semaines, déploiement, puis suivi des indicateurs. Pour classer plusieurs candidats, l'audit de 5 jours (voir plus bas) fait ce travail.</p>`,

      `<h2>Les outils : n8n, OCR, LLM et API</h2>`,
      `<p>n8n orchestre, l'OCR lit les documents scannés, les LLM (services du marché ou modèles open-source) comprennent et rédigent, les API écrivent dans vos applications métier. Les <a href="/blog/n8n-llms-api-architectures-automatisation-ia">trois architectures-types n8n, LLMs et API</a> couvrent la plupart de ces cas. Pour que vos équipes fassent ensuite évoluer leurs workflows : notre <a href="/formations/automatisation-n8n-processus-ia">formation à l'automatisation avec n8n</a> et notre <a href="/blog/formation-ia-entreprise-monter-equipes-en-competence">programme de formation IA en 6 semaines</a>.</p>`,

      `<h2>Les obstacles fréquents : données, adoption, sécurité</h2>`,
      `<ul>`,
      `<li><strong>Les données.</strong> Documents illisibles, informations dispersées, habitudes de saisie différentes d'un collaborateur à l'autre : un nettoyage préalable est parfois nécessaire.</li>`,
      `<li><strong>L'adoption.</strong> Une équipe qui craint d'être remplacée ou qui ne comprend pas l'outil le contournera. Associez les utilisateurs dès le cadrage et formez-les.</li>`,
      `<li><strong>La sécurité et la confidentialité.</strong> Factures, contrats et CV contiennent des données sensibles. Il faut décider quel modèle d'IA les traite, qui y a accès et ce qui est journalisé. Une validation humaine reste utile aux étapes sensibles.</li>`,
      `<li><strong>L'absence de mesure.</strong> Sans indicateur défini au départ, impossible de savoir si l'automatisation rapporte. Fixez les mesures avant le prototype.</li>`,
      `</ul>`,

      `<h2>Combien de temps et quel budget</h2>`,
      `<p>Nous démarrons par un <strong>audit d'automatisation de 5 jours</strong> : cartographie de vos processus, calcul du ROI et feuille de route sur 12 mois, priorisée par ROI. Vient ensuite un <strong>prototype en 2 semaines</strong> sur le premier processus retenu, puis le déploiement et le suivi des indicateurs. Le budget dépend du nombre de processus, des volumes et des applications à connecter : c'est précisément ce que l'audit permet de chiffrer.</p>`,

      `<h2>En pratique : faire appel à un consultant en automatisation</h2>`,
      `<p>Un <strong>consultant en automatisation</strong> sert avant tout à choisir les bons processus, à mesurer le gain attendu et à éviter les projets qui s'arrêtent après la démonstration. C'est la mission de notre service d'<a href="/services/automatisation-ia-processus-metiers">automatisation IA pour PME</a> : audit de 5 jours, prototype, déploiement et suivi. Pour démarrer, vous pouvez <a href="/contact-demo?intent=automation&amp;from=blog&amp;block=final-cta">demander un audit d'automatisation</a>.</p>`,
    ].join(""),
    faq: [
      {
        question: "Qu'est-ce que l'automatisation IA pour une PME ?",
        answer:
          "C'est l'utilisation de flux automatisés (par exemple avec n8n), combinés à de l'IA (OCR, modèles de langage), pour prendre en charge des tâches répétitives comme le traitement des factures, le tri du support ou la pré-qualification des leads. Les équipes gardent la décision et valident les étapes sensibles.",
      },
      {
        question: "Quelle différence entre automatisation, IA et agent IA ?",
        answer:
          "L'automatisation suit des règles fixes. L'IA apporte la compréhension de documents et de textes libres. Un agent IA choisit lui-même ses étapes pour atteindre un objectif, ce qui est moins prévisible. En PME, on commence généralement par des workflows maîtrisés combinant automatisation et IA, avec validation humaine.",
      },
      {
        question: "Par quel processus commencer ?",
        answer:
          "Par un processus au volume répétitif, aux règles claires, dont les données sont disponibles en numérique et dont une erreur est rattrapable. Traitement des factures, tri des demandes de support et pré-qualification des leads sont des candidats fréquents. L'audit de 5 jours sert à les classer par ROI.",
      },
      {
        question: "Combien de temps dure un projet d'automatisation ?",
        answer:
          "Nous commençons par un audit de 5 jours, puis réalisons un prototype en 2 semaines sur le premier processus retenu. Le déploiement et le suivi des indicateurs viennent ensuite. Le calendrier exact dépend du nombre de processus et des applications à connecter.",
      },
      {
        question: "L'automatisation remplace-t-elle les employés ?",
        answer:
          "Non. Elle prend en charge les tâches répétitives (saisie, tri, extraction, premiers jets) pour libérer du temps. La décision, la relation client et la validation des cas sensibles restent humaines.",
      },
      {
        question: "Que contient l'audit d'automatisation de 5 jours ?",
        answer:
          "La cartographie des processus étudiés, le calcul du ROI attendu pour chacun et une feuille de route sur 12 mois, priorisée par ROI. Il indique par où commencer et permet de démarrer sans engagement long.",
      },
    ],
    seoTitle: "Automatisation IA PME : 7 processus à automatiser",
    seoDescription:
      "Automatisation IA pour PME : 7 processus à fort ROI (factures, support, contrats, RH, leads), la méthode et un audit de 5 jours avec nos consultants.",
    publishedDaysAgo: 6,
    tagSlugs: ["services", "ia", "automatisation"],
  },
  {
    slug: "n8n-llms-api-architectures-automatisation-ia",
    title: "n8n, LLMs et API : architectures-types pour automatiser vos processus avec l'IA",
    excerpt:
      "Trois architectures-types pour automatiser vos processus avec n8n, des LLMs et vos API métier : extraction, génération et orchestration.",
    bodyHtml: html({
      intro:
        "Industrialiser l'automatisation par l'IA suppose de choisir une architecture solide : où s'exécute la logique, comment sont gérés les secrets, comment garantir la fiabilité. Voici trois patrons que nous mettons en place régulièrement. Ils servent de socle à l'<a href='/blog/automatisation-ia-7-processus-pme'>automatisation IA pour PME</a>, dont notre guide de référence détaille les sept processus prioritaires.",
      sections: [
        {
          h2: "Architecture 1 — Extraction structurée",
          p: "Pour transformer un document non structuré (facture, contrat, CV) en données exploitables.",
          bullets: [
            "Trigger : nouveau fichier dans un dossier ou une boîte e-mail",
            "OCR sur le document si nécessaire",
            "Appel LLM avec un prompt strict et un schéma de sortie JSON",
            "Validation des données et écriture dans la base métier",
          ],
        },
        {
          h2: "Architecture 2 — Génération augmentée par contexte (RAG)",
          p: "Pour générer une réponse en s'appuyant sur des documents internes : base de connaissances, support client, FAQ enrichie. Des exemples concrets figurent dans nos <a href='/blog/cas-usage-ia-pme-africaines-marketing-support-rh'>cas d'usage IA pour PME africaines</a>.",
        },
        {
          h2: "Architecture 3 — Orchestration multi-étapes",
          p: "Workflow de plusieurs étapes incluant validation humaine, retry, journalisation, et alertes. n8n joue le rôle de chef d'orchestre.",
        },
      ],
      outro:
        "Ces trois patrons couvrent la plupart des cas d'usage IA en entreprise. Le reste relève d'architectures spécifiques que nous concevons sur mesure. Pour savoir quels processus automatiser en premier, consultez notre guide d'<a href='/blog/automatisation-ia-7-processus-pme'>automatisation IA pour PME</a>. Pour que vos équipes apprennent à construire ces workflows, voyez la <a href='/formations/automatisation-n8n-processus-ia'>formation à l'automatisation avec n8n</a>.",
    }),
    seoTitle: "Architectures n8n + LLMs — automatisation IA",
    seoDescription:
      "Trois architectures-types pour automatiser vos processus avec n8n, des LLMs et vos API : extraction, génération RAG et orchestration.",
    publishedDaysAgo: 21,
    tagSlugs: ["services", "ia", "automatisation"],
  },

  // =========================================================================
  // SERVICES — AMOA
  // =========================================================================
  {
    slug: "amoa-pourquoi-confier-pilotage-projet-digital",
    title: "AMOA : pourquoi confier le pilotage de votre projet digital à un consultant",
    excerpt:
      "AMOA externalisée : trois bénéfices concrets pour les organisations africaines qui pilotent un projet digital sans équipe interne dédiée.",
    bodyHtml: html({
      intro:
        "Beaucoup d'organisations africaines lancent des projets digitaux sans équipe AMOA dédiée. Le sponsor métier improvise, le prestataire technique avance vite, et le projet dérive parfois sans que personne ne s'en aperçoive avant la livraison.",
      sections: [
        {
          h2: "Le rôle de l'AMOA",
          p: "L'AMOA défend le métier face aux prestataires techniques. Elle traduit le besoin, arbitre les priorités, contrôle la qualité fonctionnelle.",
          bullets: [
            "Rédaction et arbitrage du cahier des charges",
            "Interface entre direction métier et prestataires",
            "Recette fonctionnelle structurée par scénarios",
            "Conduite du changement auprès des utilisateurs",
          ],
        },
        {
          h2: "Trois bénéfices d'une AMOA externalisée",
          p: "Indépendance vis-à-vis du prestataire technique, expertise méthodologique mobilisable rapidement, retours d'expérience d'autres projets similaires.",
        },
        {
          h2: "Quand engager une AMOA",
          p: "Idéalement avant la rédaction du cahier des charges. Au plus tard avant la signature avec le prestataire technique pour structurer la recette.",
        },
      ],
      outro:
        "Notre équipe AMOA intervient en mission ponctuelle ou en accompagnement long. Nous adaptons le format selon la taille du projet et la maturité interne.",
    }),
    seoTitle: "AMOA externalisée — pourquoi en bénéficier",
    seoDescription:
      "AMOA externalisée : pourquoi confier le pilotage de votre projet digital à un consultant indépendant pour éviter les dérives et sécuriser la livraison.",
    publishedDaysAgo: 12,
    tagSlugs: ["services", "transformation-digitale"],
  },
  {
    slug: "amoa-5-livrables-projet-saas",
    title: "AMOA : 5 livrables incontournables pour réussir un projet SaaS métier",
    excerpt:
      "Cahier des charges, plan de tests, plan de déploiement, plan de formation, plan de réversibilité : les 5 livrables AMOA d'un projet SaaS.",
    bodyHtml: html({
      intro:
        "Un projet SaaS métier réussi laisse derrière lui plus que du code en production : il produit un patrimoine documentaire qui sécurise l'organisation. Voici les cinq livrables AMOA que nous produisons systématiquement.",
      sections: [
        {
          h2: "1. Cahier des charges fonctionnel",
          p: "Rédigé en termes métier, priorisé MoSCoW, validé par les utilisateurs clés avant la mise en concurrence.",
        },
        {
          h2: "2. Plan de tests de recette",
          p: "Scénarios fonctionnels couvrant les cas nominaux et les cas limites, avec critères d'acceptation explicites.",
          bullets: [
            "Tests par persona métier",
            "Tests de migration de données",
            "Tests de performance et de charge",
          ],
        },
        {
          h2: "3. Plan de déploiement",
          p: "Stratégie de bascule (big bang ou progressif), gestion des données historiques, plan B en cas d'échec.",
        },
        {
          h2: "4. Plan de formation",
          p: "Parcours de formation par profil, supports pédagogiques, plan de communication interne.",
        },
        {
          h2: "5. Plan de réversibilité",
          p: "Conditions et modalités de récupération des données et de désengagement du prestataire SaaS.",
        },
      ],
      outro:
        "Ces cinq livrables sont notre standard sur tout projet SaaS. Ils protègent l'organisation contre les mauvaises surprises et facilitent les audits internes.",
    }),
    seoTitle: "AMOA — 5 livrables clés d'un projet SaaS",
    seoDescription:
      "Cahier des charges, plan de tests, déploiement, formation, réversibilité : les 5 livrables AMOA incontournables d'un projet SaaS métier.",
    publishedDaysAgo: 27,
    tagSlugs: ["services"],
  },

  // =========================================================================
  // SERVICES — Dématérialisation
  // =========================================================================
  {
    slug: "dematerialisation-archives-par-ou-commencer",
    title: "Dématérialisation des archives : par où commencer dans une organisation africaine",
    excerpt:
      "Diagnostic, périmètre pilote, plan de classement, indexation, conduite du changement : la méthode pour démarrer un projet de dématérialisation.",
    bodyHtml: html({
      intro:
        "La dématérialisation est un sujet vaste : on peut commencer petit et étendre progressivement, ou se lancer dans un programme global qui dépasse souvent les capacités d'absorption de l'organisation. Notre conviction : commencer petit, mais commencer bien.",
      sections: [
        {
          h2: "Étape 1 — Diagnostic des fonds documentaires",
          p: "Inventorier les typologies, les volumes (papier et numérique), la valeur juridique et l'usage opérationnel.",
        },
        {
          h2: "Étape 2 — Choisir un périmètre pilote",
          p: "Trouver le sweet spot entre fort impact métier et complexité raisonnable.",
          bullets: [
            "Volume significatif mais maîtrisable",
            "Utilisateurs motivés et accessibles",
            "Données peu sensibles dans un premier temps",
          ],
        },
        {
          h2: "Étape 3 — Définir le plan de classement",
          p: "Le plan de classement structure tout : il doit être validé par les métiers avant la numérisation.",
        },
        {
          h2: "Étape 4 — Numériser, indexer, contrôler",
          p: "Travail souvent confié à un prestataire spécialisé, avec contrôle qualité statistique sur les lots.",
        },
      ],
      outro:
        "Une dématérialisation bien menée s'amortit en 12 à 18 mois grâce aux gains de productivité et à la sécurisation des données. Nous accompagnons à toutes les étapes, de l'audit à la mise en production.",
    }),
    seoTitle: "Dématérialisation — par où commencer ?",
    seoDescription:
      "Diagnostic, pilote, plan de classement, indexation : la méthode pour démarrer un projet de dématérialisation des archives en Afrique.",
    publishedDaysAgo: 8,
    tagSlugs: ["services", "ged"],
  },
  {
    slug: "dematerialisation-fondamentaux-plan-classement",
    title: "Plan de classement, indexation, conservation : les fondamentaux d'une dématérialisation",
    excerpt:
      "Plan de classement, choix des métadonnées d'indexation et règles de conservation : trois piliers techniques d'une dématérialisation réussie.",
    bodyHtml: html({
      intro:
        "Trois fondamentaux conditionnent la pérennité d'une dématérialisation : la qualité du plan de classement, le choix des métadonnées d'indexation et la cohérence des règles de conservation. Tout le reste en découle.",
      sections: [
        {
          h2: "Le plan de classement",
          p: "Structure logique de vos archives, généralement en 3 à 4 niveaux. Il guide l'utilisateur sans l'enfermer.",
          bullets: [
            "Stable dans le temps mais évolutif",
            "Validé par les directions métier",
            "Documenté et accessible aux utilisateurs",
          ],
        },
        {
          h2: "L'indexation",
          p: "Choix des métadonnées : titre, date, auteur, mots-clés contrôlés, identifiants métier (numéro de dossier, contrat, agent).",
        },
        {
          h2: "La conservation",
          p: "Pour chaque typologie, définir la durée d'utilité administrative, le sort final (élimination, archivage définitif) et les conditions de communicabilité.",
        },
      ],
      outro:
        "Ces trois fondamentaux se travaillent en atelier avec les métiers, avant tout choix d'outil. C'est le passage obligé pour qu'une GED ne devienne pas un cimetière de PDF impossibles à retrouver.",
    }),
    seoTitle: "Dématérialisation — plan de classement et indexation",
    seoDescription:
      "Plan de classement, indexation et règles de conservation : les fondamentaux techniques pour une dématérialisation pérenne et opérationnelle.",
    publishedDaysAgo: 24,
    tagSlugs: ["services", "ged"],
  },

  // =========================================================================
  // SERVICES — Scanners pro
  // =========================================================================
  {
    slug: "scanner-professionnel-comment-choisir",
    title: "Scanner professionnel : comment choisir le bon modèle selon vos volumes",
    excerpt:
      "Scanners de bureau, départementaux ou de production : comment choisir le bon modèle selon votre volume mensuel et vos contraintes métier.",
    bodyHtml: html({
      intro:
        "Le choix d'un scanner professionnel dépend de quelques critères simples : volume quotidien, types de documents, niveau d'automatisation attendu et contraintes d'intégration logicielle. Voici une grille de décision pratique.",
      sections: [
        {
          h2: "Scanner de bureau (jusqu'à 2 000 pages/jour)",
          p: "Pour un service ou un cabinet : scanners compacts avec chargeur automatique, format A4, recto-verso.",
          bullets: [
            "Volume modéré, qualité standard",
            "Driver TWAIN/ISIS pour intégration logicielle",
            "Reconnaissance automatique des couleurs",
          ],
        },
        {
          h2: "Scanner départemental (2 000 à 10 000 pages/jour)",
          p: "Pour un service archives ou un secrétariat général : capacité élevée, fiabilité industrielle, traitement par lots.",
        },
        {
          h2: "Scanner de production (au-delà de 10 000 pages/jour)",
          p: "Pour un atelier de numérisation : matériel haute cadence, intégration GED native, contrôle qualité statistique.",
        },
      ],
      outro:
        "Nos équipes accompagnent le choix du modèle, l'intégration logicielle (TWAIN, ISIS, scan-to-folder/email) et la formation des opérateurs. Un test sur site est systématiquement proposé avant achat.",
    }),
    seoTitle: "Scanner professionnel — comment choisir ?",
    seoDescription:
      "Scanners de bureau, départementaux ou de production : guide de choix d'un scanner professionnel selon le volume et l'usage métier.",
    publishedDaysAgo: 13,
    tagSlugs: ["services", "ged"],
  },
  {
    slug: "scanners-production-integration-formation-support",
    title: "Scanners de production : intégration, formation et support à grande échelle",
    excerpt:
      "Au-delà du matériel : intégration logicielle, formation des opérateurs et support pour des projets de dématérialisation à grande échelle.",
    bodyHtml: html({
      intro:
        "Un scanner de production performant ne suffit pas à réussir une dématérialisation. La qualité du résultat dépend de l'intégration logicielle, de la formation des opérateurs et du support disponible en cas d'incident.",
      sections: [
        {
          h2: "L'intégration logicielle",
          p: "Le scanner doit dialoguer naturellement avec votre GED, votre système de fichiers ou votre messagerie.",
          bullets: [
            "Profils de numérisation par typologie de document",
            "OCR embarqué et reconnaissance des séparateurs",
            "Routage automatique vers le bon dossier ou la bonne file",
          ],
        },
        {
          h2: "La formation des opérateurs",
          p: "Une session de 2 à 3 jours couvre la préparation des lots, le paramétrage des profils, le contrôle qualité et la maintenance courante.",
        },
        {
          h2: "Le support et la maintenance",
          p: "Contrat de maintenance avec délai d'intervention contractuel, pièces détachées, mise à jour des firmwares et drivers.",
        },
      ],
      outro:
        "Sur les projets à grande échelle, nous intervenons en équipe complète : ingénieur d'intégration, formateur, technicien support. La continuité de service est notre engagement principal.",
    }),
    seoTitle: "Scanners de production — intégration & support",
    seoDescription:
      "Au-delà du matériel : intégration logicielle, formation et support pour réussir un projet de dématérialisation avec scanners de production.",
    publishedDaysAgo: 30,
    tagSlugs: ["services", "ged"],
  },

  // =========================================================================
  // FORMATIONS — IA entreprise
  // =========================================================================
  {
    slug: "formation-ia-entreprise-monter-equipes-en-competence",
    title: "Formation IA en entreprise : 6 semaines pour faire monter vos équipes en compétence",
    excerpt:
      "Programme en 6 semaines pour faire monter vos équipes en compétence sur l'IA générative, les cas d'usage et la gouvernance.",
    bodyHtml: html({
      intro:
        "L'IA générative bouscule le quotidien des équipes : marketing, support, juridique, RH. Pour en tirer parti, il faut former, mais surtout cadrer. Notre programme de 6 semaines combine montée en compétence et premiers déploiements pilotes.",
      sections: [
        {
          h2: "Semaines 1-2 — Comprendre l'IA générative",
          p: "Modèles, capacités, limites, biais. Les participants explorent les outils du marché et identifient leur potentiel pour leur métier.",
        },
        {
          h2: "Semaines 3-4 — Prompt engineering et cas d'usage",
          p: "Atelier pratique : construction de prompts efficaces, structuration des sorties, automatisation simple via n8n ou Zapier.",
          bullets: [
            "Rédaction et synthèse de documents internes",
            "Génération de contenus marketing localisés",
            "Pré-qualification de demandes support",
          ],
        },
        {
          h2: "Semaines 5-6 — Pilote et gouvernance",
          p: "Chaque participant déploie un mini-cas d'usage dans son service. En parallèle, on construit la charte IA interne (sécurité, données personnelles, validation humaine).",
        },
      ],
      outro:
        "Le programme est délivré en présentiel ou hybride, par groupes de 8 à 12 participants. Idéal pour acculturer une équipe transverse avant un programme IA plus large. Pour savoir quels processus automatiser ensuite, lisez notre guide d'<a href='/blog/automatisation-ia-7-processus-pme'>automatisation IA pour PME</a> et les <a href='/blog/cas-usage-ia-pme-africaines-marketing-support-rh'>cas d'usage IA pour PME africaines</a>. Le programme se prolonge avec la <a href='/formations/automatisation-n8n-processus-ia'>formation à l'automatisation avec n8n</a>.",
    }),
    seoTitle: "Formation IA entreprise — 6 semaines",
    seoDescription:
      "Six semaines pour faire monter vos équipes en compétence sur l'IA générative : prompt engineering, cas d'usage, gouvernance, pilote.",
    publishedDaysAgo: 3,
    tagSlugs: ["formations", "ia", "automatisation"],
  },
  {
    slug: "cas-usage-ia-pme-africaines-marketing-support-rh",
    title: "Cas d'usage IA pour PME africaines : marketing, support, finance et RH",
    excerpt:
      "Douze cas d'usage IA concrets pour PME africaines, en marketing, support, finance et RH : la situation, l'outil et le résultat attendu, sans promesse chiffrée.",
    bodyHtml: [
      `<p>Pour une PME africaine, la question n'est plus « faut-il faire de l'IA ? » mais « par où commencer ? ». Voici douze cas d'usage concrets, à coût modéré, répartis entre le marketing, le support, la finance et les RH. Les exemples décrivent des situations types, volontairement anonymisées et sans chiffre de gain : les résultats varient selon le contexte, et nous préférons les mesurer chez vous plutôt que de les promettre. Ces cas s'inscrivent dans la démarche décrite dans notre guide d'<a href="/blog/automatisation-ia-7-processus-pme">automatisation IA pour PME</a>.</p>`,

      `<h2>Cas d'usage IA pour le marketing et la communication</h2>`,
      `<p>Le marketing est souvent le premier terrain d'essai de l'IA générative, parce que le risque est faible et que le gain de temps est visible. Dans tous les cas ci-dessous, une personne relit avant publication.</p>`,
      `<h3>Des contenus localisés par marché</h3>`,
      `<p>Une PME de distribution présente dans plusieurs pays doit publier sur les réseaux sociaux avec un ton et des références adaptés à chaque marché. Un LLM décline une même annonce par persona, par marché et par langue, à partir de consignes de marque que vous avez validées. Résultat attendu : un rythme de publication plus régulier et un ton cohérent.</p>`,
      `<h3>Des newsletters adaptées à chaque segment</h3>`,
      `<p>Une entreprise de services B2B envoie la même newsletter à tout son fichier. Après segmentation, un LLM adapte l'accroche et l'objet de l'e-mail à chaque segment, et n8n planifie l'envoi via votre outil d'e-mailing. Résultat attendu : des messages plus pertinents, dont vous suivez l'effet par les ouvertures et les clics.</p>`,
      `<h3>Des brèves de veille concurrentielle</h3>`,
      `<p>Une PME industrielle veut suivre ses concurrents sans y consacrer des heures. n8n collecte les sites et actualités choisis, puis un LLM écarte le bruit et rédige une brève hebdomadaire. Résultat attendu : une veille régulière que la direction commerciale lit réellement. Ce processus est détaillé dans notre guide sur les <a href="/blog/automatisation-ia-7-processus-pme">processus à automatiser en priorité</a>.</p>`,

      `<h2>Support client</h2>`,
      `<p>Le support concentre des volumes répétitifs, ce qui en fait un bon candidat pour l'automatisation, à condition de garder un humain pour les cas délicats.</p>`,
      `<h3>La catégorisation automatique des tickets</h3>`,
      `<p>Un distributeur d'équipements reçoit des demandes par e-mail, formulaire et messagerie. Un LLM les classe par sujet, urgence et langue, et n8n les affecte à la bonne équipe. Résultat attendu : la fin du tri manuel et des demandes urgentes repérées plus vite.</p>`,
      `<h3>Des réponses suggérées à partir d'une base de connaissances</h3>`,
      `<p>Une PME de services numériques répond sans cesse aux mêmes questions techniques. Le système retrouve les passages pertinents de votre documentation (approche dite RAG) et propose un brouillon que l'agent relit. Résultat attendu : des réponses plus rapides et plus homogènes d'un agent à l'autre.</p>`,
      `<h3>Une escalade intelligente</h3>`,
      `<p>Une PME de transport et de logistique veut que les litiges sensibles remontent tout de suite au responsable. Le système repère les signaux d'alerte (ton, mots clés, client stratégique) et transmet automatiquement le dossier avec un résumé. Résultat attendu : moins de réclamations qui s'enveniment faute d'avoir été vues à temps.</p>`,

      `<h2>Finance et comptabilité</h2>`,
      `<p>La finance combine des volumes importants et des règles précises : un terrain favorable, à condition de prévoir un contrôle humain sur les écritures.</p>`,
      `<h3>Les factures fournisseurs, de l'OCR à la comptabilité</h3>`,
      `<p>Une PME de négoce reçoit ses factures dans des formats variés. L'OCR lit le document, un LLM extrait les informations et propose une catégorie, et l'écriture est préparée dans l'outil comptable par API. Le comptable ne traite plus que les anomalies. Résultat attendu : moins de saisie et moins d'erreurs.</p>`,
      `<h3>Les rapprochements automatisés</h3>`,
      `<p>Une PME de distribution rapproche à la main commandes, bons de livraison et factures. Le système compare les documents et ne remonte que les écarts. Résultat attendu : une clôture mensuelle moins pesante, avec des écarts expliqués plutôt que découverts tardivement.</p>`,
      `<h3>Les alertes sur les anomalies de saisie</h3>`,
      `<p>Une entreprise de services veut repérer les doublons, les montants atypiques ou les fournisseurs inconnus avant le paiement. Des contrôles automatiques signalent ces cas au responsable. Résultat attendu : des erreurs corrigées avant qu'elles aient un effet sur la trésorerie.</p>`,

      `<h2>Ressources humaines</h2>`,
      `<p>Les RH manipulent des données personnelles : l'IA prépare et résume, mais la décision reste humaine, et les accès sont strictement contrôlés.</p>`,
      `<h3>Le tri des CV selon l'adéquation au poste</h3>`,
      `<p>Une PME de services reçoit de nombreuses candidatures pour chaque poste. L'OCR et un LLM extraient formation, expérience et compétences, puis présentent les profils au regard des critères du poste. Résultat attendu : un dépouillement plus rapide, la sélection finale restant celle du recruteur.</p>`,
      `<h3>Des comptes rendus d'entretien structurés</h3>`,
      `<p>Un responsable RH prend des notes en entretien, puis passe du temps à les mettre en forme. Un LLM transforme ces notes en compte rendu selon une grille commune, que le responsable relit et corrige. Résultat attendu : des comptes rendus comparables d'un candidat à l'autre.</p>`,
      `<h3>Des suggestions de formations selon les compétences</h3>`,
      `<p>Une PME qui développe ses équipes techniques veut relier compétences actuelles et besoins futurs. Le système croise un référentiel de compétences avec le catalogue de formations et propose des pistes, que le manager valide. Résultat attendu : des plans de formation mieux argumentés, par exemple vers la <a href="/formations/ia-entreprise">formation IA pour entreprises</a>.</p>`,

      `<h2>Par où commencer ?</h2>`,
      `<p>Choisissez un cas qui réunit un volume répétitif, des règles claires et des données disponibles, puis mesurez avant et après. Un cas d'usage se déploie généralement en 4 à 6 semaines. Pour cartographier vos opportunités et les classer par ROI, nous proposons un audit d'automatisation de 5 jours, point de départ de notre démarche d'<a href="/blog/automatisation-ia-7-processus-pme">automatisation IA pour PME</a>. Pour monter vos équipes en compétence, voir aussi la <a href="/blog/formation-ia-entreprise-monter-equipes-en-competence">formation IA en entreprise</a>.</p>`,

      `<blockquote><p><strong>Besoin d'un consultant IA pour votre PME ?</strong> Nos consultants en automatisation vous accompagnent de l'audit de 5 jours au déploiement. Découvrez notre service d'<a href="/services/automatisation-ia-processus-metiers">automatisation IA pour PME</a> ou <a href="/contact-demo?intent=automation&amp;from=blog&amp;block=final-cta">demandez un audit</a>.</p></blockquote>`,
    ].join(""),
    seoTitle: "Cas d'usage IA pour PME africaines : 12 exemples",
    seoDescription:
      "Cas d'usage IA pour le marketing, le support, la finance et les RH en PME africaine : 12 exemples concrets, outils et résultats attendus.",
    publishedDaysAgo: 17,
    tagSlugs: ["services", "ia", "automatisation"],
  },

  // =========================================================================
  // FORMATIONS — Dev web .NET / IA
  // =========================================================================
  {
    slug: "former-developpeurs-dotnet-react-ia-2026",
    title: "Pourquoi former vos développeurs à .NET, React et IA en 2026",
    excerpt:
      "Pile .NET + React + IA : un combo gagnant pour les équipes dev qui doivent livrer des applications métier modernes en 2026.",
    bodyHtml: html({
      intro:
        "Les équipes de développement africaines sont souvent expérimentées sur des piles classiques (.NET, Java, PHP) mais moins outillées sur les frontends modernes et l'intégration IA. Combler cet écart est un investissement clé pour 2026.",
      sections: [
        {
          h2: "Pourquoi .NET reste pertinent",
          p: ".NET 8/9 est performant, multiplateforme, bien outillé. Il reste un excellent choix pour des applications métier robustes et maintenables.",
        },
        {
          h2: "Pourquoi React s'impose côté frontend",
          p: "Écosystème mature, large communauté, composants réutilisables. La combinaison .NET + React permet de livrer rapidement des interfaces riches.",
          bullets: [
            "Composants UI réutilisables entre projets",
            "Hooks pour la gestion d'état et les effets",
            "Server Components et streaming en évolution",
          ],
        },
        {
          h2: "Pourquoi l'IA fait partie du stack",
          p: "Toutes les applications métier intègrent désormais des fonctionnalités IA : recherche augmentée, suggestions, génération assistée. Savoir les intégrer fait partie du métier de développeur.",
        },
      ],
      outro:
        "Notre formation combine les trois briques en un parcours de 4 à 6 semaines, avec un projet fil rouge déployé en cloud. Pensée pour les développeurs en activité.",
    }),
    seoTitle: ".NET + React + IA — pourquoi former en 2026",
    seoDescription:
      "Pile .NET + React + IA : pourquoi former vos développeurs à ce combo gagnant pour livrer des applications métier modernes en 2026.",
    publishedDaysAgo: 10,
    tagSlugs: ["formations", "developpement", "ia"],
  },
  {
    slug: "programme-formation-dotnet-react-ia",
    title: "Du backend .NET au frontend React + IA : programme de la formation Alliance",
    excerpt:
      "Programme détaillé de la formation .NET + React + IA en 6 semaines : API REST, composants React, intégration LLM, déploiement cloud.",
    bodyHtml: html({
      intro:
        "Voici le programme détaillé de notre formation .NET + React + IA, conçu pour les développeurs en activité qui veulent monter en compétence rapidement sans interrompre leur production.",
      sections: [
        {
          h2: "Module 1 — Backend .NET moderne",
          p: "API REST en .NET, ORM Entity Framework, authentification JWT, validation et gestion d'erreurs.",
          bullets: [
            "Architecture en couches et dépendances",
            "Tests unitaires et d'intégration",
            "Documentation OpenAPI / Swagger",
          ],
        },
        {
          h2: "Module 2 — Frontend React",
          p: "Composants, hooks, gestion d'état, formulaires, appels API, accessibilité de base.",
        },
        {
          h2: "Module 3 — Intégration IA",
          p: "Appels à des LLMs, structuration des prompts, gestion des erreurs et coûts, sécurisation des secrets.",
        },
        {
          h2: "Module 4 — Déploiement cloud",
          p: "Containerisation, CI/CD, déploiement sur Azure ou un cloud africain, monitoring et logs.",
        },
      ],
      outro:
        "Le projet fil rouge est une application métier complète : backend, frontend, fonctionnalité IA et déploiement. Les participants repartent avec un livrable utilisable en démonstration.",
    }),
    seoTitle: "Formation .NET + React + IA — programme",
    seoDescription:
      "Programme de la formation .NET + React + IA : API REST, composants, intégration LLM, déploiement cloud, projet fil rouge.",
    publishedDaysAgo: 26,
    tagSlugs: ["formations", "developpement"],
  },

  // =========================================================================
  // FORMATIONS — n8n
  // =========================================================================
  {
    slug: "n8n-ia-5-workflows-premiere-semaine",
    title: "n8n + IA : 5 workflows à mettre en place dès la première semaine",
    excerpt:
      "Cinq workflows n8n + IA simples et utiles à déployer dès la première semaine : tri d'e-mails, résumés, veille, alertes et reporting.",
    bodyHtml: html({
      intro:
        "n8n combiné à un LLM permet d'automatiser des tâches qui réclamaient hier des heures de travail. Voici cinq workflows que nos stagiaires déploient typiquement dès la première semaine de formation.",
      sections: [
        {
          h2: "1. Tri intelligent des e-mails entrants",
          p: "À chaque nouvel e-mail, un appel LLM classe le message par catégorie et urgence, puis le route vers le bon dossier ou la bonne équipe.",
        },
        {
          h2: "2. Résumé automatique de longs documents",
          p: "Dépôt d'un PDF dans un dossier, déclenchement d'un workflow qui produit un résumé structuré et l'envoie par e-mail au demandeur.",
          bullets: [
            "Extraction du texte avec OCR si besoin",
            "Découpage en chunks pour traiter les longs documents",
            "Production d'un résumé hiérarchisé (titre, points clés, actions)",
          ],
        },
        {
          h2: "3. Veille automatisée",
          p: "Récupération quotidienne d'articles via flux RSS, filtrage par mots-clés, synthèse par LLM, envoi en newsletter interne.",
        },
        {
          h2: "4. Alertes business",
          p: "Surveillance d'un indicateur métier (CA, panier moyen, NPS) et alerte sur les écarts significatifs avec contexte généré par LLM.",
        },
        {
          h2: "5. Rapport hebdomadaire",
          p: "Compilation de données issues de plusieurs sources (CRM, billing, support) et génération d'un rapport hebdomadaire commenté.",
        },
      ],
      outro:
        "Ces cinq workflows sont fournis comme templates dans notre formation n8n + IA. Les participants repartent avec un environnement opérationnel déployé sur leur infrastructure.",
    }),
    seoTitle: "n8n + IA — 5 workflows à déployer",
    seoDescription:
      "Cinq workflows n8n + IA à déployer dès la première semaine : tri d'e-mails, résumés, veille, alertes et reporting.",
    publishedDaysAgo: 2,
    tagSlugs: ["formations", "automatisation", "ia"],
  },
  {
    slug: "formation-n8n-autonome-low-code-5-jours",
    title: "Formation n8n : devenir autonome sur l'automatisation low-code en 5 jours",
    excerpt:
      "Programme de 5 jours pour devenir autonome sur n8n : workflows, intégrations API, gestion d'erreurs, hébergement et bonnes pratiques.",
    bodyHtml: html({
      intro:
        "n8n s'apprend vite mais se maîtrise plus lentement. Notre formation de 5 jours équilibre l'acquisition rapide des bases et les bonnes pratiques qui font la différence en production.",
      sections: [
        {
          h2: "Jour 1 — Fondamentaux",
          p: "Concepts (workflow, node, trigger), interface, premier workflow utile, exploration des nodes les plus courants.",
        },
        {
          h2: "Jour 2 — Intégrations API",
          p: "Authentification (API key, OAuth), pagination, gestion des limites de taux, transformation de données avec les nodes Function et Set.",
          bullets: [
            "Connexion à un CRM (HubSpot, Pipedrive)",
            "Appels à des API maison sécurisées par JWT",
            "Webhooks entrants et sortants",
          ],
        },
        {
          h2: "Jour 3 — Robustesse",
          p: "Gestion d'erreurs, retries, branches conditionnelles, alertes, journalisation et observabilité.",
        },
        {
          h2: "Jour 4 — Hébergement et sécurité",
          p: "Auto-hébergement vs cloud, gestion des secrets, sauvegardes, montée de version, rôles et permissions.",
        },
        {
          h2: "Jour 5 — Cas pratiques",
          p: "Chaque participant déploie un cas d'usage de son organisation, accompagné par les formateurs.",
        },
      ],
      outro:
        "Au terme de la formation, les participants peuvent concevoir, déployer et maintenir des workflows en production de façon autonome.",
    }),
    seoTitle: "Formation n8n — autonome en 5 jours",
    seoDescription:
      "Programme n8n de 5 jours : workflows, API, robustesse, hébergement, sécurité et cas pratiques pour devenir autonome.",
    publishedDaysAgo: 23,
    tagSlugs: ["formations", "automatisation"],
  },

  // =========================================================================
  // FORMATIONS — SQL Server
  // =========================================================================
  {
    slug: "sql-server-developpeurs-10-requetes-patterns",
    title: "SQL Server pour développeurs : 10 requêtes et patterns à maîtriser",
    excerpt:
      "Dix requêtes et patterns SQL Server à maîtriser pour tout développeur : CTE, fenêtrage, MERGE, indexation, plans d'exécution.",
    bodyHtml: html({
      intro:
        "Bien maîtriser SQL Server, ce n'est pas connaître par cœur des centaines de fonctions. C'est savoir mobiliser une dizaine de patterns récurrents qui couvrent 90 % des cas d'usage applicatifs.",
      sections: [
        {
          h2: "Les patterns de lecture",
          p: "Lire efficacement, c'est d'abord savoir filtrer, agréger et projeter sans surprise sur les performances.",
          bullets: [
            "CTE et requêtes récursives",
            "Fonctions de fenêtrage (ROW_NUMBER, RANK, SUM OVER)",
            "PIVOT et UNPIVOT pour la mise en forme",
          ],
        },
        {
          h2: "Les patterns d'écriture",
          p: "MERGE pour les upserts, transactions explicites, OUTPUT pour récupérer les lignes modifiées.",
        },
        {
          h2: "Les patterns de performance",
          p: "Lecture du plan d'exécution, choix d'index couvrants, statistiques à jour, paramétrage des requêtes paramétrées.",
        },
      ],
      outro:
        "Notre formation SQL Server couvre ces patterns en 4 jours, avec des ateliers pratiques sur des bases volumineuses. Idéal pour des développeurs déjà à l'aise avec les bases.",
    }),
    seoTitle: "SQL Server — 10 patterns pour développeurs",
    seoDescription:
      "Dix requêtes et patterns SQL Server à maîtriser : CTE, fenêtrage, MERGE, indexation et lecture des plans d'exécution.",
    publishedDaysAgo: 15,
    tagSlugs: ["formations", "donnees", "developpement"],
  },
  {
    slug: "sql-server-administration-production",
    title: "Administrer SQL Server en production : sauvegarde, indexation, haute disponibilité",
    excerpt:
      "Programme d'administration SQL Server : sauvegardes, restauration, plans de maintenance, indexation, haute disponibilité et monitoring.",
    bodyHtml: html({
      intro:
        "Administrer SQL Server en production, c'est garantir la disponibilité, la performance et la récupération en cas d'incident. Voici les blocs incontournables que nous couvrons dans notre formation.",
      sections: [
        {
          h2: "Sauvegarde et restauration",
          p: "Stratégies de sauvegarde complète, différentielle et journal de transactions. Tests de restauration réguliers.",
          bullets: [
            "Modèle de récupération (FULL, SIMPLE, BULK_LOGGED)",
            "Sauvegardes chiffrées et stockage hors site",
            "Procédure de restauration documentée et testée",
          ],
        },
        {
          h2: "Plans de maintenance",
          p: "Reconstruction d'index, mise à jour des statistiques, vérification d'intégrité, purge des journaux.",
        },
        {
          h2: "Haute disponibilité",
          p: "Always On Availability Groups, mirroring (legacy), log shipping. Choix selon le RTO et RPO.",
        },
        {
          h2: "Monitoring et performances",
          p: "DMV, Extended Events, suivi des requêtes lentes, alertes sur les indicateurs critiques.",
        },
      ],
      outro:
        "La formation se déroule sur 4 jours en présentiel, avec un environnement de TP individuel et des cas d'incident à diagnostiquer.",
    }),
    seoTitle: "SQL Server administration — production",
    seoDescription:
      "Sauvegardes, plans de maintenance, indexation, haute disponibilité, monitoring : les fondamentaux d'administration SQL Server en production.",
    publishedDaysAgo: 31,
    tagSlugs: ["formations", "donnees"],
  },

  // =========================================================================
  // FORMATIONS — GED & archivage
  // =========================================================================
  {
    slug: "formation-ged-archivage-responsables-administratifs",
    title: "GED & Archivage : programme de formation pour responsables administratifs",
    excerpt:
      "Programme de formation GED & archivage destiné aux responsables administratifs : plan de classement, indexation, workflows, conformité.",
    bodyHtml: html({
      intro:
        "Une GED ne se déploie pas par les seules équipes IT. Les responsables administratifs (secrétariats généraux, directions des archives, services qualité) doivent en maîtriser les concepts pour piloter le projet et l'usage en production.",
      sections: [
        {
          h2: "Module 1 — Concepts et vocabulaire",
          p: "Documents, fichiers, métadonnées, plan de classement, durée d'utilité administrative, communicabilité.",
        },
        {
          h2: "Module 2 — Construire un plan de classement",
          p: "Méthode ascendante vs descendante, validation par les métiers, documentation et formation.",
          bullets: [
            "Recensement des typologies documentaires",
            "Hiérarchisation et nommage cohérent",
            "Évolution dans le temps et gestion du legacy",
          ],
        },
        {
          h2: "Module 3 — Workflows et signature",
          p: "Modélisation des circuits de validation, intégration de la signature électronique, gestion des relances.",
        },
        {
          h2: "Module 4 — Conformité et archivage probant",
          p: "Cadre juridique, archivage à valeur probante, hébergement, scellement, traçabilité.",
        },
      ],
      outro:
        "La formation se déroule sur 3 jours en présentiel ou en classe virtuelle, avec un atelier pratique sur DocuPro Suite ou un autre outil GED de votre choix.",
    }),
    seoTitle: "Formation GED & archivage — responsables admin",
    seoDescription:
      "Programme GED & archivage pour responsables administratifs : plan de classement, workflows, conformité et archivage probant.",
    publishedDaysAgo: 20,
    tagSlugs: ["formations", "ged"],
  },
  {
    slug: "archivage-reglementaire-normes-bonnes-pratiques",
    title: "Archivage réglementaire : normes et bonnes pratiques pour organisations africaines",
    excerpt:
      "Tour d'horizon des normes d'archivage électronique et bonnes pratiques applicables aux organisations africaines : NF Z42-013, ISO 14641, valeur probante.",
    bodyHtml: html({
      intro:
        "L'archivage électronique à valeur probante répond à des exigences précises, parfois incompatibles avec une simple sauvegarde de fichiers. Voici un tour d'horizon des normes et bonnes pratiques applicables.",
      sections: [
        {
          h2: "Le cadre normatif",
          p: "Plusieurs normes encadrent l'archivage électronique probant.",
          bullets: [
            "NF Z42-013 — exigences techniques et organisationnelles",
            "ISO 14641 — équivalent international",
            "ISO 27001 — sécurité de l'information",
          ],
        },
        {
          h2: "Les principes clés",
          p: "Authenticité, intégrité, intelligibilité et pérennité des documents archivés. Chacun se traduit par des contrôles techniques.",
        },
        {
          h2: "Les bonnes pratiques",
          p: "Empreintes cryptographiques, journalisation horodatée, conservation des formats ouverts, sauvegarde géo-redondante, plan de migration des supports.",
        },
        {
          h2: "Les écueils fréquents",
          p: "Confondre sauvegarde et archivage, négliger la migration des formats, oublier les durées de conservation différenciées par typologie.",
        },
      ],
      outro:
        "Notre équipe accompagne les organisations africaines dans la définition de leur politique d'archivage et dans le choix d'un système conforme. Un audit initial permet de cadrer le besoin.",
    }),
    seoTitle: "Archivage réglementaire — normes & bonnes pratiques",
    seoDescription:
      "NF Z42-013, ISO 14641, valeur probante : normes et bonnes pratiques d'archivage électronique pour organisations africaines.",
    publishedDaysAgo: 33,
    tagSlugs: ["formations", "ged"],
  },
];

async function seedBlogPosts(
  authorId: string,
  tagMap: Record<string, string>,
): Promise<void> {
  let created = 0;
  let updated = 0;

  for (const p of POSTS) {
    const tagIds = p.tagSlugs
      .map((s) => tagMap[s])
      .filter((id): id is string => Boolean(id));

    const publishedAt = new Date(
      Date.now() - p.publishedDaysAgo * 24 * 60 * 60 * 1000,
    );

    const existing = await prisma.blogPost.findUnique({
      where: { slug: p.slug },
      select: {
        id: true,
        title: true,
        excerpt: true,
        bodyHtml: true,
        seoTitle: true,
        seoDescription: true,
        faq: true,
        status: true,
        authorId: true,
      },
    });

    const content = {
      title: p.title,
      excerpt: p.excerpt,
      bodyHtml: p.bodyHtml,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      status: "PUBLISHED" as PostStatus,
      authorId,
    };
    const faq = p.faq && p.faq.length > 0 ? p.faq : Prisma.DbNull;

    if (existing) {
      // La date de publication d'un article existant ne bouge jamais, et
      // `updatedAt` (dateModified du JSON-LD, lastmod du sitemap) n'est mis à
      // jour que si le contenu a réellement changé.
      const unchanged =
        (Object.keys(content) as (keyof typeof content)[]).every(
          (k) => existing[k] === content[k],
        ) &&
        JSON.stringify(existing.faq ?? null) === JSON.stringify(p.faq?.length ? p.faq : null);
      if (!unchanged) {
        await prisma.blogPost.update({
          where: { id: existing.id },
          data: { ...content, faq },
        });
      }
      await prisma.blogPostTag.deleteMany({ where: { postId: existing.id } });
      if (tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: tagIds.map((tagId) => ({ postId: existing.id, tagId })),
          skipDuplicates: true,
        });
      }
      if (!unchanged) updated += 1;
    } else {
      const post = await prisma.blogPost.create({
        data: {
          ...content,
          faq,
          slug: p.slug,
          publishedAt,
        },
      });
      if (tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: tagIds.map((tagId) => ({ postId: post.id, tagId })),
          skipDuplicates: true,
        });
      }
      created += 1;
    }
  }

  console.log(
    `[seed] Articles blog : ${created} créés, ${updated} mis à jour, ${POSTS.length - created - updated} inchangés (total ${POSTS.length}).`,
  );
}

// ---------------------------------------------------------------------------
// 4. Références projet (cas clients — table ProjectReference)
// ---------------------------------------------------------------------------

interface SeedProjectReferenceRow {
  companyName: string;
  projectTitle: string;
  year: string;
  duration: string;
  problem: string;
  solution: string;
  sector?: string | null;
}

const PROJECT_REFERENCE_SEED: SeedProjectReferenceRow[] = [
  {
    companyName: "Mairie de Yopougon",
    projectTitle: "Système d'Archivage et de Gestion des registres",
    year: "2015",
    duration: "1 mois",
    problem:
      "Sécuriser et faciliter la recherche des registres d'état civil.",
    solution:
      "Mise en place d'un système d'archivage électronique et structuration des registres.",
    sector: "Collectivités",
  },
  {
    companyName: "SIPRA",
    projectTitle:
      "Assistance à Maîtrise d'Ouvrage pour la mise en place d'un ERP",
    year: "2015",
    duration: "1 mois",
    problem:
      "Unifier et structurer les processus métiers d'un groupe avicole intégré.",
    solution:
      "Cadrage et assistance à la mise en place d'un ERP couvrant production, finance, RH et opérations.",
    sector: "Agroalimentaire",
  },
  {
    companyName: "CNPS",
    projectTitle: "Audit du Projet GED-WORKFLOW",
    year: "2014",
    duration: "1 mois",
    problem:
      "Projet GED en difficulté nécessitant une évaluation et une décision stratégique.",
    solution:
      "Audit des systèmes, équipements et processus avec recommandations sur la poursuite du projet.",
    sector: "Sécurité sociale",
  },
  {
    companyName: "USAID / Health Systems 20/20 / Ministère de la Santé",
    projectTitle: "Archivage des Documents Administratifs",
    year: "2012",
    duration: "2 mois",
    problem:
      "Mauvaise organisation et exploitation des dossiers administratifs du personnel de santé.",
    solution:
      "Archivage, informatisation du plan de classement et indexation des dossiers.",
    sector: "Santé",
  },
  {
    companyName: "CEPICI",
    projectTitle: "Workflow de traitement des agréments à l'investissement",
    year: "2012",
    duration: "2 mois",
    problem:
      "Traitement manuel et peu traçable des dossiers d'investissement.",
    solution:
      "Conception et déploiement d'un workflow avec formation et assistance utilisateurs.",
    sector: "Investissement",
  },
  {
    companyName: "NSCT",
    projectTitle:
      "Audit informatique et mise en place d'outils de comptabilité analytique ABC",
    year: "2011",
    duration: "12 mois",
    problem:
      "Manque d'outils pour piloter les coûts et améliorer la gestion financière.",
    solution:
      "Mise en place de procédures analytiques et d'un système informatique adapté.",
    sector: "Finance",
  },
  {
    companyName: "PlanetPharma",
    projectTitle: "Mise en place d'un CRM pour la centrale d'achat",
    year: "2011",
    duration: "14 mois",
    problem:
      "Difficulté à piloter les activités commerciales multi-pays et les reportings.",
    solution:
      "Déploiement d'un CRM pour gérer les ventes, budgets, reportings et notes de frais.",
    sector: "Pharma",
  },
  {
    companyName: "CBM Expertises",
    projectTitle: "Mise en place d'un système de GED",
    year: "2011",
    duration: "3 mois",
    problem: "Gestion documentaire inefficace et non sécurisée.",
    solution:
      "Mise en place d'un plan d'archivage et d'un système GED avec archivage physique et électronique.",
    sector: "Services",
  },
  {
    companyName: "SOPIE",
    projectTitle: "Audit du système d'information",
    year: "2009",
    duration: "6 mois",
    problem:
      "Données comptables non fiables et système d'information défaillant.",
    solution:
      "Audit SI, réconciliation des bases et automatisation des états financiers et reportings.",
    sector: "Industrie",
  },
  {
    companyName: "Groupe SIFCA",
    projectTitle: "Gestion des reportings et Business Intelligence",
    year: "2006",
    duration: "5 mois",
    problem:
      "Difficulté à consolider les reportings de nombreuses filiales.",
    solution:
      "Mise en place d'une architecture BI et automatisation des reportings.",
    sector: "Agroalimentaire",
  },
  {
    companyName: "Polychimie",
    projectTitle: "Interfaçage avec base de données SAARI",
    year: "2006",
    duration: "3 mois",
    problem: "Manque d'intégration entre gestion, stocks et reporting.",
    solution:
      "Intégration de SAARI avec les applications métiers et mise en place d'un système qualité.",
    sector: "Industrie chimique",
  },
];

async function seedProjectReferences(): Promise<void> {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < PROJECT_REFERENCE_SEED.length; i++) {
    const row = PROJECT_REFERENCE_SEED[i];
    const existing = await prisma.projectReference.findFirst({
      where: {
        companyName: row.companyName,
        projectTitle: row.projectTitle,
      },
      select: { id: true },
    });

    const data = {
      companyName: row.companyName,
      projectTitle: row.projectTitle,
      year: row.year,
      duration: row.duration,
      problem: row.problem,
      solution: row.solution,
      sector: row.sector ?? null,
      published: true,
      displayOrder: i,
    };

    if (existing) {
      await prisma.projectReference.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;
    } else {
      await prisma.projectReference.create({ data });
      created += 1;
    }
  }

  console.log(
    `[seed] Références projet : ${created} créées, ${updated} mises à jour (total ${PROJECT_REFERENCE_SEED.length}).`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await seedProjectReferences();

  const admin = await ensureAdminUser();

  if (!admin) {
    console.warn(
      "[seed] Pas d'admin disponible — impossible de seeder les articles. Définis ADMIN_EMAIL/ADMIN_PASSWORD.",
    );
    return;
  }

  const tagMap = await seedTags();
  await seedBlogPosts(admin.id, tagMap);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
