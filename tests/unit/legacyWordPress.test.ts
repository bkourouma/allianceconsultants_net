import { describe, expect, it } from "vitest";
import { isLegacyWordPressRequest } from "@/lib/legacy-wordpress";

const gone = (url: string) => {
  const u = new URL(url, "https://allianceconsultants.net");
  return isLegacyWordPressRequest(u.pathname, u.searchParams);
};

describe("isLegacyWordPressRequest — anciennes URL WordPress (410)", () => {
  it.each([
    "/tag/digital-marketing/feed/",
    "/tag/digital-marketing",
    "/tag/",
    "/author/iris_kone/feed/",
    "/author/iris_kone",
    "/category/news",
    "/category/news/feed",
    "/feed",
    "/feed/",
    "/comments/feed/",
    "/blog/un-article/feed/",
    "/wp-admin",
    "/wp-admin/",
    "/wp-login.php",
    "/wp-content/uploads/2020/a.jpg",
    "/wp-json/wp/v2/posts",
    "/xmlrpc.php",
    "/5-mistakes-that-are-holding-your-business-back/?replytocom=120",
    "/5-mistakes-that-are-holding-your-business-back?replytocom=120",
    "/blog/un-article?replytocom=3",
    "/?replytocom=1",
  ])("répond 410 pour %s", (url) => {
    expect(gone(url)).toBe(true);
  });

  it.each([
    "/",
    "/blog",
    "/blog/",
    "/blog/tags/ia",
    "/blog/tags/ia/",
    "/blog/tags/automatisation?page=2",
    "/blog/tags/feed-rss",
    "/blog/un-article",
    "/feed.xml",
    "/formation",
    "/formations",
    "/formations/ged-archivage",
    "/services/dematerialisation-archives",
    "/solutions/cliniquepro",
    "/references/abc",
    "/references?secteur=sante",
    "/contact-demo?intent=demo",
    "/sitemap.xml",
    "/robots.txt",
    "/tags/ia",
    "/authors",
    "/categories",
    "/taggers",
    "/admin",
    "/admin/login",
    "/api/lead",
  ])("laisse passer %s", (url) => {
    expect(gone(url)).toBe(false);
  });
});
