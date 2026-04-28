"use client";

import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: { slug: string; label: string }[];
}

export function TagInput({
  value,
  onChange,
  placeholder = "Saisir un tag puis Entrée",
  suggestions = [],
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  function remove(label: string) {
    onChange(value.filter((t) => t !== label));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      e.preventDefault();
      remove(value[value.length - 1]!);
    }
  }

  const filteredSuggestions = suggestions
    .filter((s) => !value.includes(s.label))
    .filter((s) => !draft || s.label.toLowerCase().includes(draft.toLowerCase()))
    .slice(0, 6);

  return (
    <div>
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
        {value.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {label}
            <button
              type="button"
              onClick={() => remove(label)}
              aria-label={`Retirer le tag ${label}`}
              className="rounded-full text-primary/80 hover:text-primary"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 bg-transparent text-sm focus:outline-none"
        />
      </div>
      {filteredSuggestions.length > 0 && draft ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filteredSuggestions.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => add(s.label)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              + {s.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
