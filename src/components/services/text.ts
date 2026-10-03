/**
 * Small text helpers used by the services & formations pages.
 * Everything here only RESTATES content that already exists in the MDX
 * front-matter; nothing is invented.
 */

/** Splits on commas that are not inside parentheses. */
function splitTopLevel(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      out.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  out.push(buf);
  return out;
}

function capitalise(s: string): string {
  return s.charAt(0).toLocaleUpperCase("fr-FR") + s.slice(1);
}

/**
 * "Maîtrisez X : a, b, c et d." -> ["A", "B", "C", "D"].
 * Returns [] when the sentence has no colon-introduced list.
 */
export function extractTopics(shortDescription: string): string[] {
  const idx = shortDescription.indexOf(":");
  if (idx === -1) return [];
  const tail = shortDescription
    .slice(idx + 1)
    .replace(/[.\s]+$/, "")
    .trim();
  const parts = splitTopLevel(tail).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];
  // Last item often reads "x et y" -> split once.
  const last = parts[parts.length - 1];
  const m = last.match(/^(.+?)\s+et\s+(.+)$/);
  if (m && !m[1].includes("(") && parts.length > 1) {
    parts.splice(parts.length - 1, 1, m[1].trim(), m[2].trim());
  }
  return parts.map(capitalise);
}

/** Benefit sentences carrying unvalidated figures are not displayed. */
export function isSafeClaim(text: string | undefined): text is string {
  if (!text) return false;
  return !/\d\s*%|\bx\s?\d+\b|\+\s?\d+/i.test(text);
}
