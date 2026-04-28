import Link from "next/link";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { listAllPublishedTags } from "@/lib/blog";

export const metadata = { title: "Nouvel article" };

export default async function NewBlogPostPage() {
  const tagSuggestions = await listAllPublishedTags();

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/blog" className="text-slate-500 hover:text-primary">
          ← Retour aux articles
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Nouvel article
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Rédigez et enregistrez en brouillon, puis publiez quand le contenu est prêt.
        </p>
      </header>

      <BlogPostForm
        mode="create"
        tagSuggestions={tagSuggestions.map((t) => ({ slug: t.slug, label: t.label }))}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          coverUrl: null,
          coverAlt: null,
          bodyHtml: "",
          seoTitle: null,
          seoDescription: null,
          ogImage: null,
          status: "DRAFT",
          tags: [],
        }}
      />
    </div>
  );
}
