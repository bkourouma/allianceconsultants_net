import Link from "next/link";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Solution } from "@/lib/validators/content";

interface SolutionCardProps {
  solution: Solution;
}

const ICON_MAP: Record<string, string> = {
  document: "📄",
  medical: "💊",
  health: "👁️",
  building: "🏢",
  announcement: "📢",
  school: "🎓",
};

export function SolutionCard({ solution }: SolutionCardProps) {
  const icon = solution.iconKey ? (ICON_MAP[solution.iconKey] ?? "⚡") : "⚡";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 60%)",
          }}
        />
        <div className="relative flex h-full items-center justify-between px-6">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-xl bg-white/15 text-3xl shadow-inner backdrop-blur-sm"
          >
            {icon}
          </span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/80">
            {solution.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {solution.name}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {solution.shortDescription}
        </p>

        <p className="mt-4 flex items-start gap-2 text-sm font-medium text-primary-dark">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary"
          >
            ✓
          </span>
          <span>{solution.mainBenefit}</span>
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-5">
          <CTAButton
            intent="demo"
            label="Demander une démo"
            solutionSlug={solution.slug}
            block="solution-card"
            size="sm"
          />
          <Link
            href={`/solutions/${solution.slug}`}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
          >
            En savoir plus →
          </Link>
        </div>
      </div>
    </article>
  );
}
