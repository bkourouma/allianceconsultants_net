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
      className="flex h-[30rem] flex-col overflow-hidden border-2 border-ink bg-panel text-ink sm:h-[27rem] [&_:focus-visible]:outline-ink"
    >
      {/* Window title bar: navy, mono field caption + the product's small colour tab. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 bg-ink px-3 py-2 text-white">
        <span className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em]">
          {product} <span className="text-white/75">· {module}</span>
        </span>
        <span className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.06em] text-white/90">
          Aperçu illustratif — données fictives
        </span>
      </div>
      <div aria-hidden className="h-1.5 shrink-0 bg-[var(--accent)]" />
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
    </div>
  );
}

/** Pressable filter chip (aria-pressed). Selected = navy ink fill. */
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
        "inline-flex min-h-11 items-center justify-center rounded-[3px] px-3.5 text-[0.8125rem] font-bold transition-colors duration-200 motion-reduce:transition-none sm:min-h-8",
        pressed
          ? "bg-ink text-white ring-2 ring-inset ring-ink"
          : "bg-panel text-ink ring-[1.5px] ring-inset ring-ink hover:bg-enamel",
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
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-[3px] px-2 text-sm font-semibold hover:bg-enamel sm:min-h-9",
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
        className="grid size-5 shrink-0 place-items-center rounded-[2px] bg-panel text-transparent ring-2 ring-inset ring-ink transition-colors duration-150 peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink motion-reduce:transition-none"
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </span>
      {children}
    </label>
  );
}

/** Small status tag: icon + label, ruled in navy (no product colour fills). */
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
    ok: "bg-panel text-ink ring-ink",
    warn: "bg-enamel text-ink ring-ink",
    bad: "bg-ink text-white ring-ink",
    neutral: "bg-enamel text-ink ring-rule",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[2px] px-2 py-0.5 text-[0.75rem] font-bold ring-[1.5px] ring-inset",
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
