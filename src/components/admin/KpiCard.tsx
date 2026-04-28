import Link from "next/link";

interface KpiCardProps {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
  tone?: "default" | "warn" | "ok";
}

export function KpiCard({ label, value, href, hint, tone = "default" }: KpiCardProps) {
  const content = (
    <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={
          tone === "warn"
            ? "mt-3 text-3xl font-bold text-amber-600"
            : tone === "ok"
              ? "mt-3 text-3xl font-bold text-emerald-600"
              : "mt-3 text-3xl font-bold text-slate-900"
        }
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </article>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }
  return content;
}
