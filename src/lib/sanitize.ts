import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "a",
  "img",
  "hr",
  "br",
];

const ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
];

/**
 * Sanitise le HTML produit par Tiptap avant persistance.
 * - Liste blanche stricte (cf. spec.md > NFR > Sécurité)
 * - Force `rel="noopener noreferrer nofollow"` et `target="_blank"`
 *   sur tous les liens externes (`http(s)://`).
 */
export function sanitizeBlogHtml(html: string): string {
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR: ["style"],
    USE_PROFILES: { html: true },
  });

  return cleaned.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    (_match, before: string, href: string, after: string) => {
      const cleanedBefore = before.replace(/\b(target|rel)="[^"]*"/gi, "").trim();
      const cleanedAfter = after.replace(/\b(target|rel)="[^"]*"/gi, "").trim();
      const parts = [cleanedBefore, cleanedAfter].filter(Boolean).join(" ");
      const prefix = parts ? `${parts} ` : "";
      return `<a ${prefix}href="${href}" target="_blank" rel="noopener noreferrer nofollow">`;
    },
  );
}
