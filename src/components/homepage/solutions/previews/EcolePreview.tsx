"use client";

import { useState } from "react";
import { Chip, CheckRow, PreviewFrame } from "./PreviewFrame";

const CLASSES = {
  "6e A": ["Aya K.", "Yao B.", "Mariam T.", "Kouadio S.", "Fatou D.", "Ibrahim C.", "Esther N.", "Serge A."],
  "5e B": ["Nadège L.", "Moussa O.", "Prisca G.", "Awa Y.", "Eric M.", "Salimata B.", "Jonas F.", "Rita H."],
} as const;
type ClassId = keyof typeof CLASSES;
const CLASS_IDS = Object.keys(CLASSES) as ClassId[];

type Marks = Record<ClassId, boolean[]>;

const INITIAL: Marks = {
  "6e A": [true, true, false, true, true, false, true, false],
  "5e B": [true, false, true, true, false, true, true, true],
};

export function EcolePreview({ name }: { name: string }) {
  const [cls, setCls] = useState<ClassId>("6e A");
  const [marks, setMarks] = useState<Marks>(INITIAL);

  const students = CLASSES[cls];
  const present = marks[cls].filter(Boolean).length;

  const update = (next: boolean[]) => setMarks((m) => ({ ...m, [cls]: next }));
  const set = (i: number, v: boolean) => update(marks[cls].map((x, j) => (j === i ? v : x)));

  return (
    <PreviewFrame product={name} module="Présences">
      <div className="flex h-full flex-col gap-3">
        <div role="group" aria-label="Classe" className="flex flex-wrap items-center gap-1.5">
          {CLASS_IDS.map((c) => (
            <Chip key={c} pressed={cls === c} onClick={() => setCls(c)}>
              {c}
            </Chip>
          ))}
          <span className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => update(students.map(() => true))}
              className="inline-flex min-h-11 items-center rounded-[3px] px-3 text-[0.8125rem] font-bold text-ink underline decoration-2 underline-offset-4 hover:bg-enamel sm:min-h-8"
            >
              Tous présents
            </button>
            <button
              type="button"
              onClick={() => update(students.map(() => false))}
              className="inline-flex min-h-11 items-center rounded-[3px] px-3 text-[0.8125rem] font-bold text-ink-soft underline decoration-2 underline-offset-4 hover:bg-enamel sm:min-h-8"
            >
              Remettre à zéro
            </button>
          </span>
        </div>

        <ul className="grid min-h-0 flex-1 list-none content-start gap-x-3 overflow-y-auto p-0 sm:grid-cols-2">
          {students.map((s, i) => (
            <li key={s}>
              <CheckRow checked={marks[cls][i]} onChange={(v) => set(i, v)}>
                {s}
              </CheckRow>
            </li>
          ))}
        </ul>

        <div className="border-t border-rule pt-2">
          <p role="status" aria-live="polite" className="t-num text-[0.8125rem] font-bold text-ink">
            {present} / {students.length} présents — classe {cls}
          </p>
          <div aria-hidden className="mt-1.5 flex gap-1">
            {students.map((s, i) => (
              <span
                key={s}
                className={
                  "h-2 flex-1 rounded-[2px] transition-colors duration-300 motion-reduce:transition-none " +
                  (marks[cls][i] ? "bg-ink" : "bg-enamel ring-1 ring-inset ring-rule")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}
