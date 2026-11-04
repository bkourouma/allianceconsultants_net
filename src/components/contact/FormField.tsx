import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const ERROR_COLOR = "text-[#b4123f]";

/** Classes d'un champ texte autonome du site : 48 px, filet marine, bague de focus marine. */
export function inputClass(invalid: boolean) {
  return cn(
    "h-12 w-full rounded-[4px] border bg-panel px-3.5 text-base text-ink transition-colors placeholder:text-ink-mute focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-ink/25",
    invalid ? "border-[#b4123f]" : "border-ink-mute",
  );
}

export function FieldErrorMessage({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p
      id={id}
      role="alert"
      className={cn("mt-2 flex items-start gap-2 text-sm font-medium", ERROR_COLOR)}
    >
      <CircleAlert
        aria-hidden
        className="mt-0.5 size-4 shrink-0"
        strokeWidth={2}
      />
      <span>{children}</span>
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-ink">
            *
          </span>
        ) : null}
        {optional ? (
          <span className="ml-2 font-medium text-ink-mute">(facultatif)</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-mute">
          {hint}
        </p>
      ) : null}
      {error ? <FieldErrorMessage id={`${id}-error`}>{error}</FieldErrorMessage> : null}
    </div>
  );
}
