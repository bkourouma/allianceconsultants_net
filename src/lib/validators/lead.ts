import { z } from "zod";

export const LeadInputSchema = z.object({
  intent: z.enum(["demo", "contact", "training", "automation", "diagnostic"]),
  solutionSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(60)
    .optional(),
  fromPage: z.string().max(200).optional(),
  fromBlock: z.string().max(60).optional(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(40),
  organization: z.string().max(160).optional().default(""),
  message: z.string().max(4000).optional().default(""),
  consent: z.literal(true),
  honeypot: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;
