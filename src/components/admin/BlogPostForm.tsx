"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { TagInput } from "./TagInput";
import { ImageUploader } from "./ImageUploader";

export interface BlogPostFormInitial {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  tags: string[];
}

interface BlogPostFormProps {
  initial: BlogPostFormInitial;
  tagSuggestions?: { slug: string; label: string }[];
  mode: "create" | "edit";
}

export function BlogPostForm({ initial, tagSuggestions = [], mode }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [coverUrl, setCoverUrl] = useState<string | null>(initial.coverUrl);
  const [coverAlt, setCoverAlt] = useState<string>(initial.coverAlt ?? "");
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription ?? "");
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(t: string) {
    return t
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function submit(nextStatus: "DRAFT" | "PUBLISHED", e?: FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      coverUrl: coverUrl || null,
      coverAlt: coverUrl ? coverAlt.trim() || null : null,
      bodyHtml,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      ogImage: null,
      status: nextStatus,
      tags,
    };

    const url =
      mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: Record<string, string>;
        };
        if (body.errors) {
          const first = Object.entries(body.errors)[0];
          setError(first ? `${first[0]} : ${first[1]}` : "Validation échouée.");
        } else {
          setError(body.error ?? "Échec de la sauvegarde.");
        }
        setSubmitting(false);
        return;
      }
      const json = (await res.json()) as { id: string; slug: string };
      setStatus(nextStatus);
      router.push(`/admin/blog/${json.id}?saved=1`);
      router.refresh();
    } catch {
      setError("Erreur réseau.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => submit(status, e)}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div className="space-y-6 lg:col-span-2">
        <Field
          label="Titre"
          hint="10 à 120 caractères. Sert de H1 et de title SEO par défaut."
        >
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(autoSlug(e.target.value));
            }}
            className="block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
            minLength={10}
            maxLength={120}
          />
        </Field>

        <Field
          label="Slug (URL publique)"
          hint="Format kebab-case (a-z, 0-9, -). Doit rester unique."
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              pattern="[a-z0-9\-]+"
              maxLength={80}
              className="block h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </Field>

        <Field
          label="Résumé (excerpt)"
          hint="60 à 200 caractères. Affiché dans les listings et utilisé comme meta description par défaut."
        >
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            minLength={60}
            maxLength={200}
            rows={3}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </Field>

        <Field label="Contenu" hint="Mise en forme riche, sanitisée à l'enregistrement.">
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
        </Field>
      </div>

      <aside className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Publication
          </h2>
          <div className="mt-3 space-y-3 text-sm">
            <p>
              Statut actuel :{" "}
              <span className="font-semibold">
                {status === "PUBLISHED" ? "Publié" : "Brouillon"}
              </span>
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={submitting}
                onClick={() => setStatus("DRAFT")}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {submitting ? "Enregistrement…" : "Enregistrer le brouillon"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit("PUBLISHED")}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
              >
                {submitting ? "Publication…" : "Publier"}
              </button>
              {mode === "edit" && status === "PUBLISHED" ? (
                <button
                  type="button"
                  onClick={() => submit("DRAFT")}
                  className="text-xs text-slate-500 underline-offset-2 hover:text-amber-600 hover:underline"
                >
                  Dépublier (repasser en brouillon)
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Image de couverture
          </h2>
          <div className="mt-3">
            <ImageUploader
              value={coverUrl}
              alt={coverAlt}
              onChange={({ url, alt }) => {
                setCoverUrl(url);
                setCoverAlt(alt);
              }}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tags
          </h2>
          <div className="mt-3">
            <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            SEO (optionnel)
          </h2>
          <div className="mt-3 space-y-3">
            <Field label="Title SEO" hint="≤ 60 caractères. Sinon : titre.">
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={60}
                className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field
              label="Meta description"
              hint="50 à 160 caractères. Sinon : excerpt."
            >
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                maxLength={160}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>
        </section>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
      </aside>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
