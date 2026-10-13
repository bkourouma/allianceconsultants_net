import type { ReactNode } from "react";
import Link from "next/link";

type Block =
  | { kind: "h2" | "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

function parse(body: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  const flushPara = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    para = [];
  };
  const flushList = () => {
    if (list && list.length) blocks.push({ kind: "ul", items: list });
    list = null;
  };
  for (const raw of body.trim().split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      flushPara();
      flushList();
      blocks.push({ kind: h[1].length === 2 ? "h2" : "h3", text: h[2] });
      continue;
    }
    const li = line.match(/^[-*]\s+(.+)$/);
    if (li) {
      flushPara();
      (list ??= []).push(li[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

/** **gras** and [texte](/chemin-interne) — internal links only. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(\/[^)\s]*\))/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = /^\[([^\]]+)\]\((\/[^)\s]*)\)$/.exec(part);
    if (link) {
      return (
        <Link
          key={i}
          href={link[2]}
          className="font-semibold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-4"
        >
          {link[1]}
        </Link>
      );
    }
    return part;
  });
}

/**
 * Renders the (light) markdown body of a service / training file:
 * ## / ### headings, paragraphs, bullet lists, **bold**, [internal](/links).
 */
export function RichBody({ body }: { body: string }) {
  const blocks = parse(body);
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h2":
            return (
              <h2 key={i} className="t-h3 text-ink [&:not(:first-child)]:pt-6">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="font-display text-xl font-bold tracking-tight text-ink [&:not(:first-child)]:pt-4"
              >
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="t-body list-disc space-y-2 pl-5 text-ink-soft marker:text-[var(--accent)]">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i} className="t-body text-lg leading-relaxed text-ink-soft">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
