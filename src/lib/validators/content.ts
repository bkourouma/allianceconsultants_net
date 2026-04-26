import { z } from "zod";

export const MenuItemSchema = z.object({
  label: z.string().min(2).max(40),
  href: z.string().min(1),
  primary: z.boolean().optional(),
});

export const SiteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().min(2),
    alternateName: z.string().optional(),
    tagline: z.string().min(10).max(200),
    logoUrl: z.string().min(1),
    foundingYear: z.number().int().min(1900).max(2100),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\+\d{6,15}$/),
    whatsapp: z
      .string()
      .regex(/^\+\d{6,15}$/)
      .nullable()
      .optional(),
    address: z.object({
      street: z.string().min(2),
      city: z.string().min(2),
      country: z.string().length(2),
    }),
  }),
  social: z.object({
    linkedin: z.string().url().nullable().optional(),
    facebook: z.string().url().nullable().optional(),
    youtube: z.string().url().nullable().optional(),
    x: z.string().url().nullable().optional(),
  }),
  primaryMenu: z.array(MenuItemSchema).min(1),
  footerMenu: z.record(z.string(), z.array(MenuItemSchema)),
});

export const CtaSchema = z
  .object({
    label: z.string().min(2).max(40),
    intent: z
      .enum(["demo", "contact", "training", "automation", "diagnostic"])
      .optional(),
    href: z.string().optional(),
    primary: z.boolean().optional(),
  })
  .refine((c) => c.intent || c.href, {
    message: "CTA must have either intent or href",
  });

export const HomepageSchema = z.object({
  seoTitle: z.string().min(10).max(60),
  seoDescription: z.string().min(50).max(160),
  ogImage: z.string().optional(),
  hero: z.object({
    title: z.string().min(10),
    subtitle: z.string().min(20),
    ctas: z.array(CtaSchema).min(1).max(3),
    reassuranceBadges: z.array(z.string()).min(6),
  }),
  solutionsSection: z.object({
    title: z.string().min(2),
    intro: z.string().optional(),
  }),
  aiSection: z.object({
    title: z.string().min(2),
    bullets: z.array(z.string()).min(5),
    ctaLabel: z.string().min(2),
  }),
  trainingsSection: z.object({
    title: z.string(),
    intro: z.string().optional(),
    modalities: z.array(z.string()).length(3),
  }),
  referencesSection: z.object({
    title: z.string(),
    history: z.array(z.object({ year: z.number(), label: z.string() })),
  }),
  techSection: z.object({
    title: z.string(),
    stack: z.array(z.string()).min(3),
    methodSummary: z.string(),
  }),
  finalCta: z.object({
    title: z.string().min(10),
    label: z.string().min(2),
  }),
});

export const SolutionSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(60),
  name: z.string().min(2).max(80),
  category: z.string().min(2),
  shortDescription: z.string().min(20).max(220),
  mainBenefit: z.string().min(10).max(160),
  iconKey: z.string().optional(),
  homepageOrder: z.number().int().min(0),
  showOnHomepage: z.boolean(),
  externalUrl: z.string().url().nullable().optional(),
  seoTitle: z.string().min(10).max(60).optional(),
  seoDescription: z.string().min(50).max(160).optional(),
  ogImage: z.string().optional(),
});

// ============================================================================
// SolutionDetail — schéma étendu pour les pages /solutions/[slug]
// (feature 001-pages-corporate-solutions). Compose SolutionSchema afin de
// garder une seule source de vérité par MDX et la rétrocompat homepage.
// ============================================================================

export const SolutionLeadIntentSchema = z.enum([
  "demo",
  "contact",
  "training",
  "automation",
  "diagnostic",
]);

export const SolutionHeroCtaSchema = z.object({
  label: z.string().min(2).max(40),
  intent: SolutionLeadIntentSchema,
  fromBlock: z.string().max(60).optional(),
});

export const SolutionHeroSecondaryCtaSchema = z.object({
  label: z.string().min(2).max(40),
  href: z.string().regex(/^(https?:\/\/|\/|#)/),
  intent: SolutionLeadIntentSchema.optional(),
});

export const SolutionHeroImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(4).max(160),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const SolutionHeroSchema = z.object({
  headline: z.string().min(10).max(120),
  tagline: z.string().min(10).max(200),
  primaryCta: SolutionHeroCtaSchema,
  secondaryCta: SolutionHeroSecondaryCtaSchema.optional(),
  image: SolutionHeroImageSchema.optional(),
});

export const TargetAudienceItemSchema = z.object({
  label: z.string().min(2).max(60),
  description: z.string().min(2).max(240),
});

export const SolutionFeatureSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().min(2).max(240),
});

export const SolutionFeatureGroupSchema = z.object({
  title: z.string().min(2).max(80),
  features: z.array(SolutionFeatureSchema).min(3),
});

export const SolutionBenefitSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().min(2).max(240),
  metric: z.string().min(1).max(40).optional(),
});

export const SolutionUseCaseSchema = z.object({
  title: z.string().min(2).max(80),
  summary: z.string().min(2).max(400),
});

export const ProofLogoSchema = z.object({
  name: z.string().min(2),
  src: z.string().min(1),
  alt: z.string().min(4),
});

export const ProofStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(2),
});

export const ProofTestimonialSchema = z.object({
  quote: z.string().min(10).max(400),
  author: z.string().min(2),
  role: z.string().optional(),
  organization: z.string().optional(),
});

export const SolutionProofSchema = z.object({
  logos: z.array(ProofLogoSchema).optional(),
  stats: z.array(ProofStatSchema).optional(),
  testimonials: z.array(ProofTestimonialSchema).optional(),
});

export const FaqEntrySchema = z.object({
  question: z.string().min(10).max(200),
  answer: z.string().min(10).max(1000),
});

export const RelatedSolutionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(60),
  differentiator: z.string().min(10).max(200),
});

export const SolutionProductLinkSchema = z.object({
  label: z.string().min(2).max(40),
  href: z.string().regex(/^https?:\/\//),
});

export const SolutionDetailSchema = SolutionSchema.extend({
  // SEO promu en obligatoire au niveau page détail
  seoTitle: z.string().min(10).max(60),
  seoDescription: z.string().min(50).max(160),
  hero: SolutionHeroSchema,
  valueProposition: z.string().min(60).max(400),
  targetAudience: z.array(TargetAudienceItemSchema).min(2),
  problemsSolved: z.array(z.string().min(2).max(240)).min(3),
  featureGroups: z.array(SolutionFeatureGroupSchema).min(1),
  benefits: z.array(SolutionBenefitSchema).min(3),
  useCases: z.array(SolutionUseCaseSchema).optional(),
  proof: SolutionProofSchema.optional(),
  faq: z.array(FaqEntrySchema).min(3),
  relatedSolutions: z
    .array(RelatedSolutionSchema)
    .min(2)
    .max(3),
  productLink: SolutionProductLinkSchema.optional(),
});

export type SolutionLeadIntent = z.infer<typeof SolutionLeadIntentSchema>;
export type SolutionHero = z.infer<typeof SolutionHeroSchema>;
export type SolutionHeroCta = z.infer<typeof SolutionHeroCtaSchema>;
export type TargetAudienceItem = z.infer<typeof TargetAudienceItemSchema>;
export type SolutionFeature = z.infer<typeof SolutionFeatureSchema>;
export type SolutionFeatureGroup = z.infer<typeof SolutionFeatureGroupSchema>;
export type SolutionBenefit = z.infer<typeof SolutionBenefitSchema>;
export type SolutionUseCase = z.infer<typeof SolutionUseCaseSchema>;
export type SolutionProof = z.infer<typeof SolutionProofSchema>;
export type FaqEntry = z.infer<typeof FaqEntrySchema>;
export type RelatedSolution = z.infer<typeof RelatedSolutionSchema>;
export type SolutionDetail = z.infer<typeof SolutionDetailSchema>;

export const ServiceSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(60),
  title: z.string().min(2).max(80),
  shortDescription: z.string().min(20).max(220),
  benefit: z.string().min(10).max(160),
  iconKey: z.string().optional(),
  homepageOrder: z.number().int().min(0),
  showOnHomepage: z.boolean(),
  seoTitle: z.string().min(10).max(60).optional(),
  seoDescription: z.string().min(50).max(160).optional(),
});

export const TrainingSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(60),
  title: z.string().min(2).max(80),
  shortDescription: z.string().min(20).max(220),
  category: z.string().min(2),
  modalities: z.object({
    presentiel: z.boolean(),
    distanciel: z.boolean(),
    intra: z.boolean(),
  }),
  homepageOrder: z.number().int().min(0),
  showOnHomepage: z.boolean(),
});

export const ReferenceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["LOGO", "TESTIMONIAL", "CASE_STUDY"]),
  clientName: z.string().min(2),
  sector: z.string().optional(),
  logoUrl: z.string().optional(),
  testimonialQuote: z.string().optional(),
  testimonialAuthor: z.string().optional(),
  testimonialRole: z.string().optional(),
  validated: z.boolean(),
  showOnHomepage: z.boolean(),
  homepageOrder: z.number().int().min(0),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type Homepage = z.infer<typeof HomepageSchema>;
export type Solution = z.infer<typeof SolutionSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Training = z.infer<typeof TrainingSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
