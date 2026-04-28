import { z } from "zod";

/**
 * Schéma de saisie pour le module « Références » (cas clients / projets).
 * Tous les champs sont en texte libre afin d'accommoder des formulations
 * riches (ex. année avec parenthèses « 2015 (démarrage octobre 2015 ;
 * achèvement janvier 2016) », durée nuancée « 1 mois (prévu) », etc.).
 */
const ProjectReferenceBaseSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Le nom de la société doit contenir au moins 2 caractères.")
    .max(160),
  projectTitle: z
    .string()
    .trim()
    .min(3, "Le titre du projet doit contenir au moins 3 caractères.")
    .max(300),
  year: z
    .string()
    .trim()
    .min(1, "Indiquez une année (texte libre).")
    .max(200),
  duration: z
    .string()
    .trim()
    .min(1, "Indiquez une durée (ex. « 1 mois », « 2 ans »).")
    .max(200),
  problem: z
    .string()
    .trim()
    .min(20, "Décrivez la problématique en 20 caractères minimum.")
    .max(8000),
  solution: z
    .string()
    .trim()
    .min(20, "Décrivez la solution proposée en 20 caractères minimum.")
    .max(8000),
  impact: z
    .string()
    .trim()
    .max(8000)
    .nullable()
    .optional(),

  sector: z.string().trim().min(2).max(120).nullable().optional(),
  logoUrl: z.string().trim().min(1).max(500).nullable().optional(),
  published: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const ProjectReferenceInputSchema = ProjectReferenceBaseSchema;
export type ProjectReferenceInput = z.infer<typeof ProjectReferenceInputSchema>;

export const ProjectReferencePatchSchema = ProjectReferenceBaseSchema.partial();
export type ProjectReferencePatch = z.infer<typeof ProjectReferencePatchSchema>;
