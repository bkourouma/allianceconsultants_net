import { describe, expect, it } from "vitest";
import { sanitizeBlogHtml } from "@/lib/sanitize";

describe("sanitizeBlogHtml", () => {
  it("strips <script> tags", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toMatch(/<script/i);
    expect(clean).toContain("<p>Hello</p>");
  });

  it("strips inline event handlers (onerror, onclick, ...)", () => {
    const dirty = '<img src="/x.png" alt="x" onerror="alert(1)" />';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toMatch(/onerror=/i);
    expect(clean).not.toMatch(/alert\(/);
  });

  it("removes javascript: hrefs", () => {
    const dirty = '<a href="javascript:alert(1)">click</a>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toMatch(/javascript:/i);
  });

  it("forces target=_blank rel=noopener noreferrer nofollow on external links", () => {
    const dirty = '<a href="https://example.com">ext</a>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toMatch(/target="_blank"/);
    expect(clean).toMatch(/rel="noopener noreferrer nofollow"/);
  });

  it("preserves headings, lists, blockquote, code", () => {
    const dirty =
      "<h2>Titre</h2><ul><li>a</li></ul><blockquote>q</blockquote><pre><code>x</code></pre>";
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toContain("<h2>Titre</h2>");
    expect(clean).toContain("<li>a</li>");
    expect(clean).toContain("<blockquote>q</blockquote>");
    expect(clean).toContain("<code>x</code>");
  });

  it("strips style attributes", () => {
    const dirty = '<p style="color:red">text</p>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toMatch(/style=/);
  });

  it("preserves simple tables (comparatifs d'articles)", () => {
    const dirty =
      "<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>";
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toContain("<table>");
    expect(clean).toContain("<th>A</th>");
    expect(clean).toContain("<td>1</td>");
  });
});
