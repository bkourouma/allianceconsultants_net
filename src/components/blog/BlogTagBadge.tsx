import Link from "next/link";

export function BlogTagBadge({
  tag,
  active = false,
}: {
  tag: { slug: string; label: string };
  active?: boolean;
}) {
  return (
    <Link
      href={`/blog/tags/${encodeURIComponent(tag.slug)}`}
      className={
        active
          ? "inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
          : "inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
      }
    >
      {tag.label}
    </Link>
  );
}
