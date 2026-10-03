import type { ReactNode } from "react";
import { Check as CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fixed-height window so switching rows / states never reflows the page. */
export function PreviewFrame({
  product,
  module,
  children,
}: {
  product: string;
  module: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={`Aperçu illustratif de ${product}, données fictives`}
      className="flex h-[30rem] flex-col overflow-hidden rounded-lg bg-panel text-ink shadow-[0_24px_48px_-28px_rgba(7,18,43,0.6)] sm:h-[27rem]"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-b border-rule bg-enamel px-3 py-2">
        <span className="t-station">
          {product} <span className="text-ink-mute">· {module}</span>
        </span>
        <span className="text-[0.75rem] font-semibold text-ink-mute">
          Aperçu illustratif — données fictives
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
    </div>
  );
}

/** Pressable filter chip (aria-pressed). Selected = full line colour. */
export function Chip({
  pressed,
  onClick,
  children,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-3.5 text-[0.8125rem] font-bold transition-colors duration-200 motion-reduce:transition-none sm:min-h-8",
        pressed
          ? "bg-[var(--accent)] text-[var(--on-accent)] ring-2 ring-inset ring-ink"
          : "bg-enamel text-ink ring-1 ring-inset ring-rule hover:bg-rule/60",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Checkbox row: native input (keyboard + SR), ink tick box. */
export function CheckRow({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm font-semibold hover:bg-enamel sm:min-h-9",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="grid size-5 shrink-0 place-items-center rounded-[4px] bg-panel text-transparent ring-2 ring-inset ring-ink transition-colors duration-150 peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </span>
      {children}
    </label>
  );
}

/** Small status pill: icon + label, ink text on a tinted ground. */
export function Pill({
  tone,
  icon,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "neutral";
  icon?: ReactNode;
  children: ReactNode;
}) {
  const tones = {
    ok: "bg-line-medicpro/15 ring-line-medicpro/50",
    warn: "bg-line-ecole/30 ring-line-ecole",
    bad: "bg-line-annonces/15 ring-line-annonces/50",
    neutral: "bg-enamel ring-rule",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.75rem] font-bold text-ink ring-1 ring-inset",
        tones[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Polite status line for SR users, visually a quiet footer. */
export function LiveNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("text-[0.8125rem] font-semibold text-ink-soft", className)}>
      {children}
    </p>
  );
}

export function formatFcfa(n: number): string {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}
