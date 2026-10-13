/**
 * Applique en base UNIQUEMENT les articles de blog listés, à partir des données
 * de prisma/seed.ts (POSTS), sans rejouer tout le seed.
 *
 *   tsx scripts/apply-blog-posts.ts --slugs a,b,c            # simulation (défaut)
 *   tsx scripts/apply-blog-posts.ts --slugs a,b,c --dry-run  # idem
 *   tsx scripts/apply-blog-posts.ts --slugs a,b,c --apply    # écrit, en une transaction
 *
 * Production (conteneur web, voir infra/Dockerfile) :
 *   docker exec allianceconsultants-web node node_modules/tsx/dist/cli.mjs \
 *     scripts/apply-blog-posts.ts --slugs a,b,c [--apply]
 *
 * Garanties :
 *  - un slug absent de POSTS => erreur, rien n'est écrit ;
 *  - jamais de création d'utilisateur : l'auteur est l'admin existant
 *    (ADMIN_EMAIL s'il est défini et existe, sinon le plus ancien compte ADMIN) ;
 *  - les articles non listés ne sont pas touchés ;
 *  - même logique que seedBlogPosts : contenu, faq, tags, auteur ; la date de
 *    publication n'est posée qu'à la création (publishedDaysAgo) et un article
 *    existant n'a jamais son publishedAt modifié ; `updatedAt` ne bouge que si
 *    le contenu change réellement.
 */
import { Prisma, PrismaClient, type PostStatus } from "@prisma/client";
import { POSTS, TAGS, type SeedPost } from "../prisma/seed";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

interface Args {
  slugs: string[];
  apply: boolean;
}

function parseArgs(argv: string[]): Args {
  let slugs: string[] = [];
  let apply = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") apply = true;
    else if (a === "--dry-run") apply = false;
    else if (a === "--slugs") slugs = (argv[++i] ?? "").split(",");
    else if (a.startsWith("--slugs=")) slugs = a.slice("--slugs=".length).split(",");
    else throw new Error(`Argument inconnu : ${a}`);
  }
  slugs = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (slugs.length === 0) {
    throw new Error("Usage : apply-blog-posts.ts --slugs a,b,c [--dry-run | --apply]");
  }
  return { slugs, apply };
}

function faqOf(p: SeedPost): { question: string; answer: string }[] {
  return p.faq && p.faq.length > 0 ? p.faq : [];
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function oneLine(s: string, max = 110): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Extrait autour du premier écart entre deux textes. */
function firstDiff(before: string, after: string): string {
  let i = 0;
  while (i < before.length && i < after.length && before[i] === after[i]) i++;
  const cut = (s: string) => oneLine(s.slice(Math.max(0, i - 30), i + 60), 100);
  return `index ${i} — base « ${cut(before)} » / seed « ${cut(after)} »`;
}

async function findAuthor() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (email) {
    const u = await prisma.user.findUnique({ where: { email } });
    if (u) return u;
  }
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    throw new Error(
      "Aucun utilisateur admin en base : le script ne crée jamais d'utilisateur. " +
        "Créez l'admin (seed ou backoffice) puis relancez.",
    );
  }
  return admin;
}

const loadExisting = (slug: string) =>
  prisma.blogPost.findUnique({
    where: { slug },
    include: { tags: { include: { tag: { select: { slug: true } } } } },
  });

interface Plan {
  post: SeedPost;
  existing: Awaited<ReturnType<typeof loadExisting>>;
  contentChanged: boolean;
  tagsChanged: boolean;
}

async function main() {
  const { slugs, apply } = parseArgs(process.argv.slice(2));

  const bySlug = new Map(POSTS.map((p) => [p.slug, p]));
  const unknown = slugs.filter((s) => !bySlug.has(s));
  if (unknown.length > 0) {
    throw new Error(
      `Slug(s) inconnu(s) dans prisma/seed.ts : ${unknown.join(", ")}. Rien n'a été écrit.`,
    );
  }
  const posts = slugs.map((s) => bySlug.get(s)!);

  const author = await findAuthor();
  console.log(`Mode : ${apply ? "APPLY (écriture)" : "DRY-RUN (aucune écriture)"}`);
  console.log(`Auteur : ${author.email} (compte existant)\n`);

  const tagLabels = new Map(TAGS.map((t) => [t.slug, t.label]));
  const existingTags = new Map(
    (await prisma.blogTag.findMany({ select: { id: true, slug: true } })).map((t) => [t.slug, t.id]),
  );

  const plans: Plan[] = [];
  for (const post of posts) {
    const existing = await loadExisting(post.slug);
    const wanted = {
      title: post.title,
      excerpt: post.excerpt,
      bodyHtml: post.bodyHtml,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      status: "PUBLISHED" as PostStatus,
      authorId: author.id,
    };
    const faq = faqOf(post);
    const wantedTags = post.tagSlugs.filter((t) => tagLabels.has(t) || existingTags.has(t)).sort();

    if (!existing) {
      console.log(`[CRÉATION] ${post.slug}`);
      console.log(`  titre : ${oneLine(post.title)}`);
      console.log(`  bodyHtml : 0 → ${post.bodyHtml.length} caractères · FAQ : ${faq.length} question(s)`);
      console.log(`  tags : ${wantedTags.join(", ") || "(aucun)"}`);
      console.log(`  publishedAt : il y a ${post.publishedDaysAgo} jours\n`);
      plans.push({ post, existing, contentChanged: true, tagsChanged: true });
      continue;
    }

    const changed = (Object.keys(wanted) as (keyof typeof wanted)[]).filter(
      (k) => existing[k] !== wanted[k],
    );
    const faqChanged = !sameJson(existing.faq, faq.length > 0 ? faq : null);
    const currentTags = existing.tags.map((t) => t.tag.slug).sort();
    const tagsChanged = JSON.stringify(currentTags) !== JSON.stringify(wantedTags);
    const contentChanged = changed.length > 0 || faqChanged;

    const age = existing.updatedAt.getTime() - existing.createdAt.getTime();
    console.log(`[${contentChanged || tagsChanged ? "MISE À JOUR" : "INCHANGÉ"}] ${post.slug}`);
    console.log(
      `  base : créé ${existing.createdAt.toISOString()} · modifié ${existing.updatedAt.toISOString()}` +
        (age > 60_000
          ? ` (retouché ${Math.round(age / DAY_MS)} j après sa création : vérifier qu'il n'a pas été modifié dans le backoffice)`
          : " (jamais retouché depuis sa création)"),
    );
    if (contentChanged) {
      console.log(`  champs modifiés : ${[...changed, ...(faqChanged ? ["faq"] : [])].join(", ")}`);
      if (changed.includes("title")) {
        console.log(`  titre : « ${oneLine(existing.title)} » → « ${oneLine(post.title)} »`);
      }
      if (changed.includes("excerpt")) {
        console.log(`  extrait : « ${oneLine(existing.excerpt)} » → « ${oneLine(post.excerpt)} »`);
      }
      if (changed.includes("bodyHtml")) {
        console.log(
          `  bodyHtml : ${existing.bodyHtml.length} → ${post.bodyHtml.length} caractères · premier écart : ${firstDiff(existing.bodyHtml, post.bodyHtml)}`,
        );
      }
      const before = Array.isArray(existing.faq) ? existing.faq.length : 0;
      console.log(`  FAQ : ${before} → ${faq.length} question(s)`);
    }
    if (tagsChanged) {
      console.log(`  tags : [${currentTags.join(", ")}] → [${wantedTags.join(", ")}]`);
    }
    console.log(`  publishedAt conservé : ${existing.publishedAt?.toISOString() ?? "—"}\n`);
    plans.push({ post, existing, contentChanged, tagsChanged });
  }

  const todo = plans.filter((p) => p.contentChanged || p.tagsChanged);
  if (!apply) {
    console.log(
      `Simulation terminée : ${todo.length} article(s) à écrire sur ${plans.length}. Relancez avec --apply pour écrire.`,
    );
    return;
  }
  if (todo.length === 0) {
    console.log("Rien à écrire : tout est déjà à jour.");
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      // Tags : créés s'ils manquent (libellés de TAGS), jamais renommés.
      const tagId = new Map<string, string>();
      for (const plan of todo) {
        for (const slug of plan.post.tagSlugs) {
          if (tagId.has(slug)) continue;
          const label = tagLabels.get(slug);
          const known = existingTags.get(slug);
          if (known) tagId.set(slug, known);
          else if (label) {
            const t = await tx.blogTag.upsert({ where: { slug }, update: {}, create: { slug, label } });
            tagId.set(slug, t.id);
          }
        }
      }

      for (const { post, existing, contentChanged } of todo) {
        const faq = faqOf(post);
        const content = {
          title: post.title,
          excerpt: post.excerpt,
          bodyHtml: post.bodyHtml,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          status: "PUBLISHED" as PostStatus,
          authorId: author.id,
          faq: faq.length > 0 ? faq : Prisma.DbNull,
        };
        let postId: string;
        if (!existing) {
          const created = await tx.blogPost.create({
            data: {
              ...content,
              slug: post.slug,
              publishedAt: new Date(Date.now() - post.publishedDaysAgo * DAY_MS),
            },
          });
          postId = created.id;
        } else {
          postId = existing.id;
          if (contentChanged) await tx.blogPost.update({ where: { id: postId }, data: content });
        }
        await tx.blogPostTag.deleteMany({ where: { postId } });
        const ids = post.tagSlugs.map((s) => tagId.get(s)).filter((x): x is string => Boolean(x));
        if (ids.length > 0) {
          await tx.blogPostTag.createMany({
            data: ids.map((id) => ({ postId, tagId: id })),
            skipDuplicates: true,
          });
        }
      }
    },
    { timeout: 60_000 },
  );

  console.log(`Écrit : ${todo.length} article(s) (${todo.map((p) => p.post.slug).join(", ")}).`);
}

main()
  .catch((err) => {
    console.error(`Erreur : ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
