import { NextResponse } from "next/server";
import { listLatestPublishedForFeed } from "@/lib/blog";

export const revalidate = 300;
export const runtime = "nodejs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCdata(input: string): string {
  return input.replace(/]]>/g, "]]]]><![CDATA[>");
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof listLatestPublishedForFeed>> = [];
  try {
    posts = await listLatestPublishedForFeed(20);
  } catch {
    posts = [];
  }

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const title = escapeXml(p.title);
      const description = escapeXml(p.seoDescription ?? p.excerpt);
      const pubDate = p.publishedAt.toUTCString();
      const author = p.authorName ? escapeXml(p.authorName) : "Alliance Consultants";
      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>${author}</author>
      <content:encoded><![CDATA[${escapeCdata(p.bodyHtml)}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const lastBuild = posts[0]?.publishedAt
    ? posts[0]!.publishedAt.toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Alliance Consultants</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Articles, analyses et retours d'expérience d'Alliance Consultants : IA, automatisation, SaaS métier en Afrique francophone.</description>
    <language>fr-FR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
