import { cn } from "@/lib/utils";
import { FieldErrorMessage } from "./FormField";

/**
 * A ruled field box of the booking coupon: a hairline navy box with the
 * visible caption (mono, like a printed form) on its first line and the
 * control below it. The box carries the focus ring and the error colour; the
 * control inside stays borderless (use `ruledControl`).
 */
export function RuledField({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          "rounded-[3px] border bg-panel transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-expo)] focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(15,42,90,0.22)]",
          error ? "border-[#b4123f] border-2" : "border-ink-mute",
        )}
      >
        <label
          htmlFor={id}
          className="t-field flex items-baseline justify-between gap-3 px-3 pt-2 !text-xs"
        >
          <span>
            {label}
            {required ? (
              <span aria-hidden="true" className="ml-1">
                *
              </span>
            ) : null}
          </span>
          {optional ? (
            <span className="font-normal normal-case tracking-normal">
              facultatif
            </span>
          ) : null}
        </label>
        {children}
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-mute">
          {hint}
        </p>
      ) : null}
      {error ? <FieldErrorMessage id={`${id}-error`}>{error}</FieldErrorMessage> : null}
    </div>
  );
}

const CONTROL =
  "block w-full bg-transparent px-3 text-base text-ink placeholder:text-ink-mute focus-visible:!outline-none focus:outline-none";

/** Borderless single-line control to put inside a `RuledField`. */
export const ruledInput = cn(CONTROL, "h-10 pb-1");

/** Borderless multi-line control to put inside a `RuledField`. */
export const ruledTextarea = cn(CONTROL, "min-h-28 resize-y pb-2 pt-1 leading-relaxed");
