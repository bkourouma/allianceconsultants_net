import { LINES, type LineId, type NetworkLine } from "@/lib/network";

/** Stable 32-bit FNV-1a hash. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lines whose colour passes 3:1 as a UI stroke on white AND 4.5:1 as small
 * text: these are the only ones used as the article-level `--accent`.
 */
const READABLE_LINES: readonly LineId[] = [
  "docupro",
  "medicpro",
  "cliniquepro",
  "annonces",
];

/** The line a post "runs on": deterministic from its slug. */
export function postLineId(slug: string): LineId {
  return READABLE_LINES[hashString(slug) % READABLE_LINES.length];
}

/** A tag's roundel colour: deterministic from its slug. */
export function tagLine(slug: string): NetworkLine {
  return LINES[hashString(`tag:${slug}`) % LINES.length];
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(d: Date): string {
  return dateFmt.format(d);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reading time in whole minutes (≥ 1) at ~220 words per minute. */
export function readingMinutesFromHtml(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function slugifyHeading(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

function escapeText(s: string): string {
  return s.replace(/&(?!(?:[a-z]+|#\d+|#x[0-9a-f]+);)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Render-time enhancement of the ALREADY-SANITISED article HTML.
 * It never widens what is allowed: it only
 *  - adds machine-generated `id`s to h2/h3 (slugified from their own text),
 *  - wraps stand-alone images in <figure> using the (escaped) alt as caption,
 *  - adds loading hints on images.
 * Returns the enhanced HTML and the table of contents.
 */
export function prepareArticle(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  let out = html.replace(
    /<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string | undefined, inner: string) => {
      const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
      if (!text) return match;
      const base = slugifyHeading(text);
      let id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      toc.push({ id, text, level: tag.toLowerCase() === "h2" ? 2 : 3 });
      const cleanAttrs = (attrs ?? "").replace(/\sid="[^"]*"/gi, "");
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    },
  );

  out = out.replace(
    /<p>\s*(<img\b[^>]*>)\s*<\/p>/gi,
    (match, img: string) => {
      const alt = /\balt="([^"]*)"/i.exec(img)?.[1]?.trim();
      if (!alt || alt.length < 3 || alt.length > 220) return match;
      return `<figure>${img}<figcaption aria-hidden="true">${escapeText(alt)}</figcaption></figure>`;
    },
  );

  out = out.replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"');

  return { html: out, toc };
}

/** French typography: keep ":", ";", "?", "!" and closing guillemets glued to the previous word. */
export function frTypo(text: string): string {
  return text.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
}
