"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-.96 1.84-1.97 3.78-1.97 4.04 0 4.78 2.52 4.78 5.8V21h-4v-5.1c0-1.22-.02-2.78-1.8-2.78-1.8 0-2.07 1.3-2.07 2.69V21h-4V9.75Z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}

interface ShareActionsProps {
  /** Absolute canonical URL of the article. */
  url: string;
  title: string;
  /** "rail": compact icon roundels (sticky sidebar). "bar": labelled pills (end of article). */
  variant?: "rail" | "bar";
  className?: string;
}

export function ShareActions({ url, title, variant = "bar", className }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2400);
    }
  }

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const targets = [
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: <LinkedInGlyph />,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: <MessageCircle aria-hidden className="size-[18px]" strokeWidth={1.75} />,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      icon: <XGlyph />,
    },
  ];

  const pill =
    "inline-flex items-center justify-center gap-2 rounded-full bg-panel text-sm font-bold text-ink no-underline ring-1 ring-ink transition-colors duration-200 hover:bg-ink hover:text-white";
  const sizing = variant === "rail" ? "size-11" : "min-h-11 px-4";

  return (
    <div className={cn(variant === "bar" ? "flex flex-wrap items-center gap-2.5" : "", className)}>
      <ul className={cn("flex flex-wrap items-center gap-2", variant === "bar" && "contents")}>
        <li className={variant === "bar" ? "contents" : ""}>
          <button
            type="button"
            onClick={copy}
            aria-label={variant === "rail" ? (copied ? "Lien copié" : "Copier le lien") : undefined}
            title="Copier le lien"
            className={cn(pill, sizing, copied && "bg-ink text-white")}
          >
            {copied ? (
              <Check aria-hidden className="size-[18px]" strokeWidth={2} />
            ) : (
              <Link2 aria-hidden className="size-[18px]" strokeWidth={1.75} />
            )}
            {variant === "bar" ? (copied ? "Lien copié" : "Copier le lien") : null}
          </button>
        </li>
        {targets.map((s) => (
          <li key={s.key} className={variant === "bar" ? "contents" : ""}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Partager sur ${s.label} (nouvel onglet)`}
              title={`Partager sur ${s.label}`}
              data-umami-event="blog-share"
              data-umami-event-network={s.key}
              className={cn(pill, sizing)}
            >
              {s.icon}
              {variant === "bar" ? s.label : null}
            </a>
          </li>
        ))}
      </ul>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Lien copié dans le presse-papiers" : ""}
      </span>
    </div>
  );
}
