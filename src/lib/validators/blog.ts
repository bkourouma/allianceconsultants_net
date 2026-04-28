import { z } from "zod";

export const PostStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type PostStatusInput = z.infer<typeof PostStatusSchema>;

export const TagInputSchema = z.object({
  label: z.string().trim().min(2).max(60),
});
export type TagInput = z.infer<typeof TagInputSchema>;

const BlogPostBaseSchema = z.object({
  title: z.string().trim().min(10).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Le slug doit être en kebab-case (a-z, 0-9, -).")
    .min(3)
    .max(80)
    .optional(),
  excerpt: z.string().trim().min(60).max(200),
  coverUrl: z.string().trim().min(1).max(300).nullable().optional(),
  coverAlt: z.string().trim().min(4).max(160).nullable().optional(),
  bodyHtml: z.string().min(200).max(200_000),
  seoTitle: z.string().trim().min(10).max(60).nullable().optional(),
  seoDescription: z.string().trim().min(50).max(160).nullable().optional(),
  ogImage: z.string().trim().min(1).max(300).nullable().optional(),
  status: PostStatusSchema.default("DRAFT"),
  publishedAt: z
    .union([z.string().datetime(), z.date(), z.null()])
    .optional(),
  tags: z.array(z.string().trim().min(2).max(60)).max(10).default([]),
});

export const BlogPostInputSchema = BlogPostBaseSchema.refine(
  (d) => !d.coverUrl || d.coverAlt,
  {
    message: "coverAlt est requis quand coverUrl est défini.",
    path: ["coverAlt"],
  },
);

export type BlogPostInput = z.infer<typeof BlogPostInputSchema>;

export const BlogPostPatchSchema = BlogPostBaseSchema.partial().refine(
  (d) => !d.coverUrl || d.coverAlt,
  {
    message: "coverAlt est requis quand coverUrl est défini.",
    path: ["coverAlt"],
  },
);

export type BlogPostPatch = z.infer<typeof BlogPostPatchSchema>;

export const LeadStatusPatchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "ARCHIVED", "SPAM"]),
  notes: z
    .string()
    .trim()
    .max(4000)
    .nullable()
    .optional(),
});

export type LeadStatusPatch = z.infer<typeof LeadStatusPatchSchema>;
