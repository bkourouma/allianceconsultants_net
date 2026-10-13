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
    title: "Automatisation IA : 7 processus métiers à automatiser en priorité dans une PME",
    excerpt:
      "Sept processus à fort ROI à automatiser en priorité dans une PME africaine grâce à l'IA et à n8n : facturation, support, marketing, RH.",
    bodyHtml: html({
      intro:
        "L'automatisation par l'IA n'est pas un luxe réservé aux grands groupes. Pour une PME, quelques chantiers ciblés peuvent libérer des dizaines d'heures par semaine. Voici les sept processus que nous automatisons le plus souvent chez nos clients.",
      sections: [
        {
          h2: "Les processus à fort ROI",
          p: "À chaque fois, le critère est le même : volume répétitif, règles claires, données structurées disponibles.",
          bullets: [
            "1. Saisie et catégorisation des factures fournisseurs (OCR + LLM)",
            "2. Tri et qualification des demandes support entrantes",
            "3. Génération de réponses standards à des e-mails fréquents",
            "4. Extraction d'informations dans les contrats et CV",
            "5. Production de comptes rendus de réunion à partir d'enregistrements",
            "6. Veille concurrentielle et synthèse automatisée",
            "7. Pré-qualification des leads commerciaux",
          ],
        },
        {
          h2: "La méthode d'automatisation",
          p: "Pour chaque processus : cartographie, calcul du ROI, prototype en 2 semaines, déploiement et suivi des indicateurs.",
        },
        {
          h2: "Les outils mobilisés",
          p: "n8n pour l'orchestration, des LLMs (OpenAI, modèles open-source) pour le traitement, vos applications métier en cible via API.",
        },
      ],
      outro:
        "Un audit d'automatisation Alliance dure 5 jours et produit une feuille de route priorisée par ROI sur 12 mois. Idéal pour démarrer sans engagement long.",
    }),
    seoTitle: "Automatisation IA — 7 processus à prioriser en PME",
    seoDescription:
      "Sept processus métiers à fort ROI à automatiser en PME africaine grâce à l'IA et n8n : factures, support, contrats, RH, marketing.",
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
        "Industrialiser l'automatisation par l'IA suppose de choisir une architecture solide : où s'exécute la logique, comment sont gérés les secrets, comment garantir la fiabilité. Voici trois patrons que nous mettons en place régulièrement.",
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
          p: "Pour générer une réponse en s'appuyant sur des documents internes : base de connaissances, support client, FAQ enrichie.",
        },
        {
          h2: "Architecture 3 — Orchestration multi-étapes",
          p: "Workflow de plusieurs étapes incluant validation humaine, retry, journalisation, et alertes. n8n joue le rôle de chef d'orchestre.",
        },
      ],
      outro:
        "Ces trois patrons couvrent 80 % des cas d'usage IA en entreprise. Le reste relève d'architectures spécifiques que nous concevons sur mesure.",
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
      "Bureau, départemental ou production : tableau comparatif, 6 critères de choix, scanner à défilement ou à plat, OCR et intégration à une GED.",
    bodyHtml: `<p>Un scanner professionnel, parfois appelé numériseur professionnel, n'a rien à voir avec l'appareil multifonction posé dans un couloir. Le scan professionnel consiste à numériser chaque jour des centaines, voire des milliers de pages, en produisant des fichiers lisibles, bien orientés et exploitables par un logiciel. Le bon modèle dépend donc de vos volumes, de vos documents et de l'outil qui recevra les fichiers, bien plus que d'une marque ou d'une fiche technique.</p>
<p>Ce guide est volontairement neutre. Alliance Consultants ne vend pas de scanners : notre métier se situe avant et après le matériel, c'est-à-dire la méthode de numérisation, la <a href="/services/dematerialisation-archives">dématérialisation de vos archives</a> et leur intégration dans une GED. Voici de quoi comparer les catégories, poser les bonnes questions à un revendeur et éviter les erreurs de dimensionnement.</p>
<h2>Bureau, départemental, production : le comparatif</h2>
<p>On distingue trois grandes familles de scanners professionnels. Le critère de départ est le volume de pages à numériser par jour, puis viennent la vitesse, le chargeur automatique et les interfaces disponibles.</p>
<table>
<thead>
<tr><th>Critère</th><th>Scanner de bureau</th><th>Scanner départemental</th><th>Scanner de production</th></tr>
</thead>
<tbody>
<tr><td>Volume indicatif par jour</td><td>Jusqu'à 2 000 pages</td><td>2 000 à 10 000 pages</td><td>Au-delà de 10 000 pages</td></tr>
<tr><td>Vitesse (pages par minute, ordre de grandeur)</td><td>Quelques dizaines de ppm</td><td>Plusieurs dizaines de ppm, souvent davantage</td><td>Cadence élevée et soutenue sur toute la journée</td></tr>
<tr><td>Chargeur automatique (ADF)</td><td>Capacité modérée, recto-verso</td><td>Grande capacité, traitement par lots</td><td>Grande capacité, alimentation industrielle, détection de double alimentation</td></tr>
<tr><td>Formats</td><td>A4, parfois A3 selon le modèle</td><td>A4 et A3 selon le modèle</td><td>De l'A4 aux grands formats ou aux documents difficiles, selon le modèle</td></tr>
<tr><td>Interfaces</td><td>USB, TWAIN, parfois réseau</td><td>TWAIN, ISIS, réseau</td><td>TWAIN, ISIS, intégration à un logiciel de capture ou à une GED</td></tr>
<tr><td>Usage type</td><td>Service, cabinet, numérisation au fil de l'eau</td><td>Secrétariat général, service archives</td><td>Atelier de numérisation, projet de masse</td></tr>
<tr><td>Budget</td><td>Le plus accessible</td><td>Intermédiaire</td><td>Le plus élevé</td></tr>
</tbody>
</table>
<p>Les vitesses sont des ordres de grandeur : elles varient fortement d'un fabricant et d'un modèle à l'autre, et la vitesse annoncée est rarement celle que l'on obtient sur des documents réels (papier fin, agrafes, formats mélangés). Nous ne donnons pas de prix : ils dépendent du modèle, du pays et du revendeur, et il vaut mieux demander plusieurs devis écrits.</p>
<h2>Les 6 critères pour choisir un scanner professionnel</h2>
<p>Avant de comparer des modèles, passez ces six critères en revue. Ils pèsent plus lourd que la marque.</p>
<h3>1. Le volume mensuel réel, et pas seulement la moyenne</h3>
<p>Partez du nombre de pages à numériser, mais aussi des pics : une fin d'exercice, un projet de reprise d'archives ou une campagne ponctuelle changent complètement le dimensionnement. Un appareil trop petit s'use vite et crée des files d'attente ; un appareil surdimensionné immobilise un budget inutilement.</p>
<h3>2. La vitesse et le cycle de service</h3>
<p>La vitesse en pages par minute ne dit pas tout. Le cycle de service, c'est-à-dire le volume quotidien ou mensuel que le fabricant recommande de ne pas dépasser, indique si le scanner est conçu pour tourner toute la journée. Un modèle poussé en permanence au-delà de ce volume vieillit mal.</p>
<h3>3. Le chargeur automatique et la détection de double alimentation</h3>
<p>Un chargeur automatique (ADF) de bonne capacité fait gagner un temps considérable sur les lots. La détection de double alimentation, par ultrasons ou par capteurs, signale quand deux feuilles passent ensemble : sans elle, des pages manquent dans les fichiers, ce que l'on ne découvre souvent que des mois plus tard.</p>
<h3>4. La résolution, la qualité d'image et l'OCR</h3>
<p>Pour des documents texte destinés à la reconnaissance de caractères, 300 dpi est la résolution la plus courante. Monter plus haut alourdit les fichiers sans toujours améliorer le résultat. Vérifiez aussi le redressement automatique, la suppression des pages blanches et le traitement des documents recto-verso de contenu inégal.</p>
<h3>5. La connectique et l'intégration à vos logiciels</h3>
<p>Un scanner doit dialoguer avec l'outil qui reçoit les fichiers : pilotes TWAIN ou ISIS, numérisation vers un dossier réseau, vers une messagerie ou directement vers une GED. Vérifiez la compatibilité avec votre système d'exploitation et vos logiciels avant l'achat, pas après.</p>
<h3>6. Le coût total de possession</h3>
<p>Le prix d'achat n'est qu'une partie de la dépense. Comptez les consommables (rouleaux, tampons de séparation, kits de nettoyage), le contrat de maintenance, la disponibilité des pièces et du support dans votre pays, ainsi que la formation des opérateurs. Un modèle moins cher mais sans support local peut coûter plus cher à l'usage.</p>
<h2>Scanner à défilement ou à plat ?</h2>
<p>La question revient dès que l'on dépasse quelques pages. Les deux technologies ne se concurrencent pas vraiment : elles répondent à des documents différents.</p>
<ul>
<li><strong>Scanner à défilement (avec chargeur)</strong> : les feuilles passent devant le capteur. C'est le choix naturel pour des feuilles volantes en volume, en recto-verso, avec une cadence élevée.</li>
<li><strong>Scanner à plat</strong> : le document est posé sur une vitre. Il convient aux pièces fragiles, aux reliures, aux registres, aux photos ou aux formats irréguliers, mais il est lent et demande un opérateur à chaque page.</li>
<li><strong>Modèles mixtes</strong> : certains scanners associent un chargeur et un plateau, pour traiter l'essentiel en lot et les cas particuliers à la main.</li>
</ul>
<p>Pour un fonds d'archives mélangeant feuilles courantes et documents fragiles, la solution habituelle est un scanner à défilement pour la masse, complété par un poste à plat pour les exceptions.</p>
<h2>Quel scanner pour numériser en PDF consultable (OCR) ?</h2>
<p>Un PDF consultable est un PDF dans lequel un moteur de reconnaissance de caractères (OCR) a ajouté une couche de texte : on peut alors chercher un mot dans le document ou dans toute une base. Presque tous les scanners professionnels savent produire un PDF image ; la reconnaissance de texte est réalisée soit par le scanner, soit par le logiciel de capture, soit par la GED qui reçoit le fichier.</p>
<p>La qualité de l'OCR dépend d'abord de la qualité de l'image : bonne résolution, contraste correct, page bien droite, absence d'ombres. Un scanner honnête sur le papier mais mal réglé donnera un texte truffé d'erreurs. Si vous visez la conservation à long terme, renseignez-vous aussi sur le format PDF/A, pensé pour l'archivage.</p>
<h2>Du scanner à la GED : relier le matériel à l'organisation</h2>
<p>Un scanner produit des fichiers ; une GED les range, les indexe et les rend retrouvables. Sans plan de classement ni indexation, les fichiers numérisés finissent dans un dossier réseau où plus personne ne retrouve rien. C'est pourquoi il faut décider de l'organisation avant le matériel : voir à ce sujet <a href="/blog/dematerialisation-archives-par-ou-commencer">la méthode pour démarrer une dématérialisation</a>.</p>
<p>La GED <a href="/solutions/docupro-suite">DocuPro Suite</a> propose notamment la numérisation et l'indexation avec des champs métier configurables, la recherche multicritère et le pilotage des durées de conservation. Alliance Consultants ne vend pas de scanners, mais vous conseille sur la méthode et configure la prise en charge de votre matériel existant par DocuPro.</p>
<h2>Acheter un scanner ou confier la numérisation ?</h2>
<p>Si la numérisation est continue (courrier, factures, dossiers du quotidien), un scanner de bureau ou départemental adapté se justifie. Si vous avez un fonds historique à numériser en une fois, acheter un scanner de production n'est pas toujours rentable : un prestataire spécialisé, avec son propre matériel et ses opérateurs formés, peut être plus pertinent. Nous détaillons ce choix dans notre guide <a href="/blog/numeriser-archives-papier-quel-materiel-quelle-methode">Numériser ses archives papier : matériel, méthode et coûts</a>, et la partie organisation d'un atelier dans <a href="/blog/scanners-production-integration-formation-support">réussir un projet de numérisation avec des scanners de production</a>.</p>
<p>Attention enfin au cadre juridique : numériser un document n'en fait pas automatiquement une copie opposable, et ne dispense pas de respecter les règles de conservation. Les exigences d'archivage à valeur probante sont présentées dans notre article <a href="/blog/archivage-reglementaire-normes-bonnes-pratiques">Archivage réglementaire : normes et bonnes pratiques</a>.</p>
<h2>En pratique</h2>
<p>Voici une façon simple de procéder pour choisir sans se tromper :</p>
<ul>
<li>Chiffrez vos volumes quotidiens, vos pics et la nature de vos documents (formats, épaisseur, état).</li>
<li>Décidez d'abord de votre plan de classement et de l'outil qui recevra les fichiers.</li>
<li>Présélectionnez deux ou trois modèles dans la bonne catégorie, puis demandez des devis détaillés incluant consommables, maintenance et support local.</li>
<li>Demandez une démonstration au revendeur avec vos propres documents, y compris les plus difficiles.</li>
</ul>
<p>Si votre besoin est surtout un projet d'archives à numériser et à organiser, notre page <a href="/services/dematerialisation-archives">Numérisation et dématérialisation des archives</a> présente l'accompagnement que nous proposons, du conseil à l'intégration dans DocuPro Suite.</p>`,
    seoTitle: "Scanner professionnel : comment choisir (bureau, production)",
    seoDescription:
      "Quel scanner professionnel choisir ? Comparatif bureau, départemental et production selon vos volumes, critères de choix, OCR et intégration à une GED.",
    publishedDaysAgo: 13,
    tagSlugs: ["services", "ged"],
    faq: [
      {
        question: "Quelle différence entre un scanner de bureau et un scanner de production ?",
        answer:
          "Le scanner de bureau est conçu pour un volume modéré, jusqu'à environ 2 000 pages par jour, dans un service ou un cabinet. Le scanner de production est conçu pour tourner toute la journée au-delà de 10 000 pages par jour, avec un chargeur de grande capacité, une détection de double alimentation poussée et une intégration à un logiciel de capture ou à une GED. Le scanner départemental se situe entre les deux.",
      },
      {
        question: "Combien de pages par jour peut traiter un scanner départemental ?",
        answer:
          "On situe généralement un scanner départemental entre 2 000 et 10 000 pages par jour. Ce chiffre est un ordre de grandeur : vérifiez le cycle de service indiqué par le fabricant, c'est-à-dire le volume quotidien ou mensuel recommandé, et comparez-le à vos volumes réels, pics compris.",
      },
      {
        question: "Un scanner professionnel peut-il produire des PDF consultables (OCR) ?",
        answer:
          "Oui, mais la reconnaissance de caractères est faite soit par le scanner, soit par le logiciel de capture, soit par la GED qui reçoit le fichier. Ce qui compte le plus est la qualité de l'image : bonne résolution (300 dpi est courant pour du texte), page bien droite, contraste correct. Pour une conservation longue, renseignez-vous sur le format PDF/A.",
      },
      {
        question: "Que sont les pilotes TWAIN et ISIS ?",
        answer:
          "TWAIN et ISIS sont deux standards qui permettent à un logiciel (logiciel de capture, GED) de piloter un scanner et de récupérer les images. Un scanner compatible avec l'un ou l'autre s'intègre plus facilement à votre chaîne de numérisation. Vérifiez la compatibilité avec votre système d'exploitation avant l'achat.",
      },
      {
        question: "Peut-on tester un scanner avant de l'acheter ?",
        answer:
          "C'est vivement conseillé : demandez une démonstration au revendeur avec vos propres documents, y compris les plus difficiles (papier fin, agrafes, formats mélangés). Observez le taux de bourrage, la qualité d'image et le temps réel de traitement. Alliance Consultants ne vend pas de scanners, mais peut vous aider à cadrer votre projet de numérisation en amont.",
      },
    ],
  },
  {
    slug: "scanners-production-integration-formation-support",
    title:
      "Réussir un projet de numérisation avec des scanners de production : intégration, formation, organisation",
    excerpt:
      "Le matériel ne fait pas le projet : organisation de l'atelier, intégration logicielle, formation des opérateurs et contrôle qualité pour une dématérialisation à grande échelle.",
    bodyHtml: `<p>Un scanner de production performant ne suffit pas à réussir une dématérialisation. Sur un projet de numérisation à grande échelle, la qualité du résultat dépend de l'organisation de l'atelier, de l'intégration logicielle, de la formation des opérateurs et d'un contrôle qualité rigoureux. Ce guide, volontairement neutre, s'adresse aux responsables d'archives, aux DSI et aux directions administratives qui préparent un projet de masse. Alliance Consultants ne vend pas de scanners : nous conseillons sur la méthode et l'intégration à la GED.</p>
<p>Si vous cherchez d'abord à choisir un modèle, commencez par notre guide <a href="/blog/scanner-professionnel-comment-choisir">Scanner professionnel : comment choisir</a>. Nous partons ici du principe que la catégorie de matériel est déjà identifiée.</p>
<h2>Cadrer le projet avant de parler matériel</h2>
<p>Les projets de numérisation qui dérapent le font presque toujours en amont. Avant de lancer le moindre lot, il faut avoir répondu à quelques questions simples :</p>
<ul>
<li>Quels fonds numériser, en quelle quantité, dans quel état (agrafes, trombones, papier fragile, formats mélangés) ?</li>
<li>Pour quel usage : consultation courante, recherche, conservation à valeur probante ?</li>
<li>Quel plan de classement et quelles métadonnées d'indexation, validés par les métiers ?</li>
<li>Quel délai, et combien de personnes disponibles pour préparer et contrôler les lots ?</li>
</ul>
<p>Ces points sont détaillés dans <a href="/blog/dematerialisation-archives-par-ou-commencer">Dématérialisation des archives : par où commencer</a> et dans <a href="/blog/dematerialisation-fondamentaux-plan-classement">les fondamentaux du plan de classement et de l'indexation</a>. Ils déterminent le nombre de scanners, le nombre d'opérateurs et la durée réelle du chantier.</p>
<h2>Organiser l'atelier de numérisation</h2>
<p>Un atelier de numérisation est une petite chaîne de production. Chaque étape doit avoir un responsable et laisser une trace.</p>
<ul>
<li><strong>Réception et inventaire</strong> : les documents arrivent par lots identifiés, avec un bordereau qui permet de suivre chaque boîte ou chaque dossier.</li>
<li><strong>Préparation</strong> : retrait des agrafes et trombones, remise à plat des feuilles pliées, réparation des déchirures, tri et insertion de feuilles de séparation. C'est l'étape la plus longue et la plus sous-estimée.</li>
<li><strong>Numérisation</strong> : lancement des lots avec le bon profil de numérisation selon le type de document.</li>
<li><strong>Contrôle qualité</strong> : vérification de la lisibilité, de la complétude et de l'orientation avant validation.</li>
<li><strong>Indexation et versement</strong> : saisie ou reprise des métadonnées, puis dépôt dans la GED.</li>
<li><strong>Restitution</strong> : remise en boîte des originaux, avec le même identifiant, et décision sur leur sort (conservation ou élimination selon les règles applicables).</li>
</ul>
<p>Prévoyez aussi l'ergonomie des postes, la sécurité des originaux (accès restreint, traçabilité des mouvements) et un plan de repli : un seul scanner pour tout un chantier est un point de défaillance.</p>
<h2>L'intégration logicielle : du scanner à la GED</h2>
<p>Le scanner doit dialoguer naturellement avec votre GED, votre système de fichiers ou votre messagerie. Pour un projet de production, quelques fonctions font gagner un temps considérable :</p>
<ul>
<li>des profils de numérisation par typologie de document (résolution, couleur ou noir et blanc, recto-verso) ;</li>
<li>la reconnaissance de caractères (OCR) et la reconnaissance des séparateurs ou des codes-barres pour découper automatiquement les lots ;</li>
<li>un nommage cohérent des fichiers et le routage vers le bon dossier ou la bonne file de traitement ;</li>
<li>des pilotes standard (TWAIN, ISIS) ou la numérisation vers un dossier réseau, selon le logiciel de capture utilisé.</li>
</ul>
<p>Dans la GED <a href="/solutions/docupro-suite">DocuPro Suite</a>, les documents numérisés sont indexés avec des champs métier configurables puis retrouvés par recherche multicritère. Alliance Consultants configure la prise en charge de votre matériel existant par DocuPro ; la méthode générale est présentée sur la page <a href="/services/dematerialisation-archives">Numérisation et dématérialisation des archives</a>.</p>
<h2>Former les opérateurs</h2>
<p>Un scanner de production entre les mains d'un opérateur mal formé produit des lots à refaire. La formation ne doit pas se limiter au bouton de démarrage. Elle couvre en général :</p>
<ul>
<li>la préparation des lots et la gestion des cas difficiles (papier fin, formats mélangés, pages collées) ;</li>
<li>le choix et le réglage des profils de numérisation ;</li>
<li>le contrôle qualité : que vérifier, à quelle fréquence, que faire d'un lot rejeté ;</li>
<li>la maintenance de premier niveau : nettoyage, remplacement des consommables, signalement d'un incident ;</li>
<li>les règles de confidentialité sur des documents parfois sensibles.</li>
</ul>
<p>Le constructeur ou le revendeur du matériel assure souvent une formation à l'utilisation de la machine ; la formation à la méthode du projet (préparation, indexation, contrôle) relève, elle, de l'organisation qui porte la numérisation, éventuellement avec l'appui d'un conseil.</p>
<h2>Le contrôle qualité sur les lots</h2>
<p>Sur un volume important, on ne relit pas chaque page. On met en place un contrôle qualité statistique : un échantillon de chaque lot est vérifié selon des critères fixés à l'avance (lisibilité, pages manquantes, orientation, exactitude de l'indexation). Si le taux d'anomalies dépasse le seuil retenu, le lot est repris. Ce contrôle doit être documenté, car il fait partie de la confiance que l'on accorde au fonds numérisé.</p>
<h2>Maintenance et support : les questions à poser au fournisseur</h2>
<p>La disponibilité du matériel conditionne le calendrier. Auprès du constructeur ou du revendeur, posez par écrit les questions suivantes :</p>
<ul>
<li>Quel délai d'intervention est garanti en cas de panne, et dans quelle ville ?</li>
<li>Les pièces d'usure et les consommables sont-ils disponibles localement ?</li>
<li>Qui met à jour les firmwares et les pilotes, et comment sont-ils validés avec votre logiciel ?</li>
<li>Existe-t-il un matériel de remplacement en cas d'immobilisation prolongée ?</li>
</ul>
<h2>Atelier interne ou prestataire ?</h2>
<p>Tout projet de masse ne justifie pas d'acheter des scanners de production. Si le chantier a une fin (un fonds historique à traiter une fois), un prestataire équipé, avec des opérateurs déjà formés, évite d'immobiliser un budget et du personnel. Si les volumes sont continus et que la numérisation fait partie du fonctionnement quotidien, l'atelier interne devient pertinent. Dans les deux cas, l'organisation qui porte le projet garde la responsabilité du plan de classement, de l'indexation et du contrôle qualité.</p>
<h2>Les pièges les plus fréquents</h2>
<ul>
<li>Sous-estimer le temps de préparation des documents, souvent supérieur au temps de numérisation lui-même.</li>
<li>Acheter le matériel avant d'avoir défini le plan de classement et l'indexation.</li>
<li>Ne prévoir ni contrôle qualité, ni appareil de secours, ni plan de maintenance.</li>
<li>Oublier la question du sort des originaux, qui doit suivre les règles de conservation applicables (voir <a href="/blog/archivage-reglementaire-normes-bonnes-pratiques">Archivage réglementaire : normes et bonnes pratiques</a>).</li>
</ul>
<h2>En pratique</h2>
<p>Un projet de numérisation à grande échelle se pilote comme un projet à part entière : périmètre pilote, indicateurs de qualité, responsables identifiés, intégration à la GED. Si vous préparez un projet de ce type, notre page <a href="/services/dematerialisation-archives">Numérisation et dématérialisation des archives</a> présente la démarche de conseil et d'intégration à DocuPro Suite, et notre guide <a href="/blog/numeriser-archives-papier-quel-materiel-quelle-methode">Numériser ses archives papier</a> aide à choisir entre équipement interne et prestataire.</p>`,
    seoTitle: "Scanners de production : réussir son projet de numérisation",
    seoDescription:
      "Organisation de l'atelier, intégration à la GED, formation des opérateurs et contrôle qualité : réussir un projet de numérisation à grande échelle.",
    publishedDaysAgo: 30,
    tagSlugs: ["services", "ged"],
    faq: [
      {
        question: "Faut-il choisir le scanner avant le plan de classement ?",
        answer:
          "Non, l'inverse est préférable. Le plan de classement, l'indexation et les volumes à traiter déterminent le nombre de scanners, la cadence nécessaire et le logiciel de capture. Choisir le matériel en premier conduit souvent à un équipement mal dimensionné ou mal intégré à la GED.",
      },
      {
        question: "Que doit couvrir la formation des opérateurs de numérisation ?",
        answer:
          "Elle doit couvrir la préparation des lots (agrafes, déchirures, séparateurs), le réglage des profils de numérisation, le contrôle qualité, la maintenance de premier niveau (nettoyage, consommables) et les règles de confidentialité. La formation à la machine est souvent assurée par le constructeur ou le revendeur ; la méthode du projet relève de l'organisation qui le porte.",
      },
      {
        question: "Comment contrôler la qualité sur un grand volume de documents ?",
        answer:
          "On applique un contrôle qualité par échantillonnage : une part de chaque lot est vérifiée selon des critères définis à l'avance (lisibilité, pages manquantes, orientation, exactitude de l'indexation). Si le taux d'anomalies dépasse le seuil fixé, le lot est repris. Le contrôle est documenté pour garder une trace.",
      },
      {
        question: "Vaut-il mieux internaliser la numérisation ou la confier à un prestataire ?",
        answer:
          "Pour un flux continu de documents, un équipement interne se justifie. Pour un fonds historique à numériser une fois, un prestataire équipé et formé est souvent plus adapté qu'un achat de scanner de production. Le bon choix dépend du volume, du délai, de la sensibilité des documents et des compétences disponibles en interne.",
      },
    ],
  },
  {
    slug: "numeriser-archives-papier-quel-materiel-quelle-methode",
    title: "Numériser ses archives papier : matériel, méthode et coûts",
    excerpt:
      "Les étapes d'une numérisation d'archives, le matériel selon le volume, les facteurs de coût, prestataire ou internalisation, et les normes à respecter.",
    bodyHtml: `<p>Numériser ses archives papier ne se résume pas à acheter un scanner. Un projet réussi suit une méthode : on diagnostique le fonds, on décide du classement, on prépare les documents, on numérise, on contrôle, puis on indexe pour que chaque document soit retrouvable. Le matériel et le budget en découlent. Ce guide présente les étapes, les choix de matériel selon le volume, les facteurs qui font varier le coût, l'arbitrage entre prestataire et internalisation, et les normes à connaître.</p>
<p>Alliance Consultants ne vend pas de scanners : nous accompagnons la méthode et l'intégration des archives numérisées dans la GED, dans le cadre de notre offre de <a href="/services/dematerialisation-archives">numérisation et dématérialisation des archives</a>.</p>
<h2>Les étapes d'une numérisation d'archives</h2>
<h3>1. Le diagnostic du fonds</h3>
<p>On recense les typologies de documents, les volumes, l'état physique (papier fragile, agrafes, formats variés), la valeur juridique et l'usage opérationnel. Ce diagnostic permet de décider ce qui doit être numérisé, ce qui peut rester en papier et ce qui peut être éliminé selon les règles de conservation.</p>
<h3>2. Le plan de classement</h3>
<p>Il structure tout le reste : c'est lui qui permettra de retrouver les documents. Il se construit avec les métiers avant la numérisation. Voir <a href="/blog/dematerialisation-fondamentaux-plan-classement">Plan de classement, indexation, conservation : les fondamentaux</a>.</p>
<h3>3. La préparation des documents</h3>
<p>Retrait des agrafes et trombones, remise à plat, réparation des déchirures, tri, insertion de feuilles de séparation. C'est souvent l'étape la plus longue, et celle qui conditionne la qualité des images.</p>
<h3>4. La numérisation</h3>
<p>On choisit le bon profil (résolution, couleur ou noir et blanc, recto-verso) selon le type de document, puis on traite par lots identifiés.</p>
<h3>5. Le contrôle qualité</h3>
<p>Un échantillon de chaque lot est vérifié : lisibilité, pages manquantes, orientation, complétude. Un lot qui ne passe pas le contrôle est repris.</p>
<h3>6. L'indexation et le versement en GED</h3>
<p>Chaque document reçoit ses métadonnées (titre, date, identifiants métier) afin d'être retrouvé par recherche. Sans cette étape, les fichiers numérisés finissent dans un dossier où plus personne ne retrouve rien. La GED <a href="/solutions/docupro-suite">DocuPro Suite</a> prévoit l'indexation avec des champs métier configurables et la recherche multicritère.</p>
<p>Pour démarrer dans de bonnes conditions, voir aussi <a href="/blog/dematerialisation-archives-par-ou-commencer">Dématérialisation des archives : par où commencer</a>.</p>
<h2>Quel matériel selon le volume</h2>
<p>Le matériel se choisit en fonction du volume de pages par jour, des types de documents et du logiciel qui recevra les fichiers. Les ordres de grandeur ci-dessous reprennent ceux de notre guide <a href="/blog/scanner-professionnel-comment-choisir">Scanner professionnel : comment choisir</a>.</p>
<ul>
<li><strong>Quelques dossiers par jour, numérisation au fil de l'eau</strong> : un scanner de bureau avec chargeur automatique suffit généralement (jusqu'à environ 2 000 pages par jour).</li>
<li><strong>Un service archives ou un secrétariat général</strong> : un scanner départemental, conçu pour des volumes plus importants et un traitement par lots (de l'ordre de 2 000 à 10 000 pages par jour).</li>
<li><strong>Un fonds important à traiter en une fois</strong> : un atelier avec scanners de production (au-delà de 10 000 pages par jour), ou le recours à un prestataire équipé.</li>
<li><strong>Registres, reliures, documents fragiles</strong> : un scanner à plat ou un poste spécialisé, en complément du scanner à défilement.</li>
</ul>
<p>Ne choisissez pas le matériel avant d'avoir fixé le classement et l'indexation : ce sont eux qui déterminent le logiciel de capture et la manière dont les fichiers seront nommés et rangés.</p>
<h2>Ce qui fait varier le coût d'une numérisation</h2>
<p>Nous ne donnons pas de montant : il dépend trop de votre contexte pour être honnête sans étude préalable. En revanche, voici les postes qui pèsent dans un budget :</p>
<ul>
<li>le volume de pages et la proportion de documents difficiles (formats, fragilité) ;</li>
<li>le temps de préparation, qui représente souvent une part majeure du travail ;</li>
<li>le matériel (achat ou location) et ses consommables ;</li>
<li>le temps des opérateurs et du contrôle qualité ;</li>
<li>l'indexation : saisie manuelle ou reprise automatique de métadonnées ;</li>
<li>la GED qui accueille les fichiers, et son déploiement ;</li>
<li>le stockage et la sauvegarde des fichiers numériques dans la durée.</li>
</ul>
<p>Demandez toujours un chiffrage détaillé poste par poste, et comparez à périmètre identique.</p>
<h2>Prestataire ou internalisation ?</h2>
<p>Il n'y a pas de réponse unique ; trois situations se présentent le plus souvent.</p>
<ul>
<li><strong>Flux continu</strong> (courriers, factures, dossiers du quotidien) : l'internalisation avec un scanner adapté est généralement la plus logique.</li>
<li><strong>Fonds historique ponctuel</strong> : un prestataire de numérisation, avec son matériel et ses opérateurs, évite d'immobiliser un budget et du personnel pour un chantier qui a une fin.</li>
<li><strong>Solution mixte</strong> : le prestataire reprend le stock, l'organisation numérise ensuite le flux courant.</li>
</ul>
<p>Dans tous les cas, gardez la maîtrise du plan de classement, de l'indexation et du contrôle qualité : ils engagent la valeur du fonds numérisé. Si vous optez pour un atelier interne, notre article sur <a href="/blog/scanners-production-integration-formation-support">la réussite d'un projet avec des scanners de production</a> détaille l'organisation, la formation et le contrôle des lots.</p>
<h2>Les erreurs à éviter</h2>
<ul>
<li>Numériser avant d'avoir décidé du plan de classement, au risque de devoir tout reclasser.</li>
<li>Négliger l'indexation : un fichier non indexé est un fichier perdu dans la masse.</li>
<li>Se limiter à des sauvegardes sur un seul support, sans copie ailleurs.</li>
<li>Oublier d'associer les utilisateurs métier, qui sont ceux qui retrouveront les documents.</li>
</ul>
<h2>Normes et cadre à respecter</h2>
<p>Numériser un document ne signifie pas toujours que la copie numérique remplace l'original sur le plan juridique, ni que l'on peut détruire le papier. Les règles de conservation et de valeur probante dépendent de la nature des documents et de la réglementation applicable : vérifiez-les avant toute élimination d'originaux.</p>
<p>Pour l'archivage électronique à valeur probante, les normes de référence sont notamment la NF Z42-013 et l'ISO 14641, complétées par l'ISO 27001 pour la sécurité de l'information. Elles sont présentées dans <a href="/blog/archivage-reglementaire-normes-bonnes-pratiques">Archivage réglementaire : normes et bonnes pratiques</a>. Pensez aussi à un format adapté à la conservation, tel que PDF/A, à des sauvegardes régulières et à une gestion des droits d'accès.</p>
<h2>En pratique</h2>
<p>Commencez petit : un périmètre pilote, un plan de classement validé, un échantillon numérisé et contrôlé, puis extension. Si vous souhaitez être accompagné sur le diagnostic, la méthode et l'intégration à la GED, découvrez notre service de <a href="/services/dematerialisation-archives">numérisation et dématérialisation des archives</a> et la plateforme <a href="/solutions/docupro-suite">DocuPro Suite</a>.</p>`,
    seoTitle: "Numériser ses archives papier : matériel, méthode, coûts",
    seoDescription:
      "Numériser ses archives papier : étapes, matériel selon le volume, postes de coût, prestataire ou internalisation et normes d'archivage à respecter.",
    publishedDaysAgo: 2,
    tagSlugs: ["services", "ged"],
    faq: [
      {
        question: "Quelles sont les étapes pour numériser des archives papier ?",
        answer:
          "Les étapes sont le diagnostic du fonds, le plan de classement, la préparation des documents, la numérisation, le contrôle qualité puis l'indexation et le versement dans une GED. L'indexation est essentielle : sans métadonnées, les fichiers numérisés ne sont pas retrouvables.",
      },
      {
        question: "Quel scanner choisir pour numériser des archives ?",
        answer:
          "Cela dépend du volume par jour et de la nature des documents. Un scanner de bureau suffit jusqu'à environ 2 000 pages par jour, un scanner départemental couvre de l'ordre de 2 000 à 10 000 pages par jour, et au-delà il faut un scanner de production ou un prestataire. Les documents fragiles ou reliés demandent un scanner à plat.",
      },
      {
        question: "Combien coûte la numérisation d'archives ?",
        answer:
          "Le coût dépend du volume, de l'état des documents, du temps de préparation, du matériel, du contrôle qualité, de l'indexation et de la GED retenue. Il n'existe pas de tarif universel : demandez un chiffrage détaillé poste par poste et comparez les offres à périmètre identique.",
      },
      {
        question: "Faut-il confier la numérisation à un prestataire ou la faire en interne ?",
        answer:
          "Pour un flux continu de documents, l'internalisation est généralement adaptée. Pour un fonds historique à traiter une fois, un prestataire équipé est souvent préférable. Dans les deux cas, gardez la maîtrise du plan de classement, de l'indexation et du contrôle qualité.",
      },
      {
        question: "Peut-on détruire les originaux papier après numérisation ?",
        answer:
          "Pas automatiquement. La possibilité de détruire un original dépend de la nature du document, des durées de conservation et de la réglementation applicable, ainsi que de la valeur probante de la copie numérique. Vérifiez ces règles avant toute élimination, et appuyez-vous sur les normes d'archivage électronique comme la NF Z42-013 et l'ISO 14641.",
      },
    ],
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
        "Le programme est délivré en présentiel ou hybride, par groupes de 8 à 12 participants. Idéal pour acculturer une équipe transverse avant un programme IA plus large.",
    }),
    seoTitle: "Formation IA entreprise — 6 semaines",
    seoDescription:
      "Six semaines pour faire monter vos équipes en compétence sur l'IA générative : prompt engineering, cas d'usage, gouvernance, pilote.",
    publishedDaysAgo: 3,
    tagSlugs: ["formations", "ia"],
  },
  {
    slug: "cas-usage-ia-pme-africaines-marketing-support-rh",
    title: "Cas d'usage IA pour PME africaines : marketing, support, finance et RH",
    excerpt:
      "Cas d'usage concrets et déployables : génération de contenus marketing, automatisation du support, analyse financière et RH.",
    bodyHtml: html({
      intro:
        "Pour une PME africaine, la question n'est plus « faut-il faire de l'IA ? » mais « par où commencer ? ». Voici des cas d'usage concrets, à coût modéré, déployables en quelques semaines.",
      sections: [
        {
          h2: "Marketing & communication",
          p: "Génération de contenus localisés, déclinaison multilingue, suggestions d'objets d'e-mails, analyse des retombées.",
          bullets: [
            "Posts réseaux sociaux par persona et par marché",
            "Newsletters personnalisées par segment",
            "Brèves de veille concurrentielle",
          ],
        },
        {
          h2: "Support client",
          p: "Catégorisation automatique des tickets, suggestion de réponses à partir d'une base de connaissances, escalade intelligente.",
        },
        {
          h2: "Finance et comptabilité",
          p: "OCR + LLM sur les factures fournisseurs, rapprochements automatisés, alertes sur anomalies de saisie.",
        },
        {
          h2: "RH",
          p: "Tri des CV par adéquation au poste, génération de comptes rendus d'entretien, suggestions de formations selon les compétences.",
        },
      ],
      outro:
        "Chaque cas d'usage se déploie en 4 à 6 semaines avec un ROI mesurable. Nous proposons un audit IA de 5 jours pour cartographier vos opportunités prioritaires.",
    }),
    seoTitle: "Cas d'usage IA — PME africaines",
    seoDescription:
      "Cas d'usage IA concrets pour PME africaines : marketing, support, finance, RH. Déployables en quelques semaines avec ROI mesurable.",
    publishedDaysAgo: 17,
    tagSlugs: ["formations", "ia", "automatisation"],
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
