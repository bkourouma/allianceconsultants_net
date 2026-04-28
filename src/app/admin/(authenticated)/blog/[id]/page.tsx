import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { getAdminPostById } from "@/lib/admin/blog";
import { listAllPublishedTags } from "@/lib/blog";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const metadata = { title: "Édition article" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditBlogPostPage({ params, searchParams }: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [post, tagSuggestions] = await Promise.all([
    getAdminPostById(id),
    listAllPublishedTags(),
  ]);
  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/blog" className="text-slate-500 hover:text-primary">
          ← Retour aux articles
        </Link>
      </nav>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Édition de l&apos;article
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Modifiez le contenu, l&apos;aperçu se met à jour à l&apos;enregistrement.
          </p>
        </div>
        <div className="flex gap-2">
          {post.status === "PUBLISHED" ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Voir l&apos;article ↗
            </Link>
          ) : (
            <Link
              href={`/blog/${post.slug}?preview=1`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Aperçu ↗
            </Link>
          )}
          <DeletePostButton postId={post.id} />
        </div>
      </header>

      {sp.saved === "1" ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Modifications enregistrées.
        </p>
      ) : null}

      <BlogPostForm
        mode="edit"
        tagSuggestions={tagSuggestions.map((t) => ({ slug: t.slug, label: t.label }))}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverUrl: post.coverUrl,
          coverAlt: post.coverAlt,
          bodyHtml: post.bodyHtml,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          ogImage: post.ogImage,
          status: post.status,
          tags: post.tags.map((t) => t.tag.label),
        }}
      />
    </div>
  );
}
