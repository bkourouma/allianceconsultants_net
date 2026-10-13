import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  output: "standalone",
  // Désactive la redirection automatique « /page/ → /page » faite par Next AVANT
  // le middleware : sans cela, les anciennes URL WordPress terminées par « / »
  // (ex. /tag/x/feed/) subissaient un 308 avant de pouvoir recevoir leur 410.
  // La redirection des barres finales est refaite dans `redirects()` ci-dessous,
  // en excluant les motifs WordPress (qui reçoivent leur 410 dans le middleware).
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Ancienne page « Vente et intégration de scanners » : Alliance Consultants
      // ne vend pas de scanners, l'offre est la numérisation / dématérialisation.
      {
        source: "/services/scanners-professionnels",
        destination: "/services/dematerialisation-archives",
        permanent: true,
      },
      // Ancienne page « Formation » (singulier) de l'ancien site → catalogue actuel.
      { source: "/formation", destination: "/formations", permanent: true },
      { source: "/ressources", destination: "/blog", permanent: true },
      { source: "/ressources/:path*", destination: "/blog/:path*", permanent: true },
      // En DERNIER : les redirections ci-dessus doivent passer en premier (ex.
      // /formation/ → /formations en un seul saut).
      // Barre finale : « /page/ » → « /page » (308), comme le faisait Next par
      // défaut avant `skipTrailingSlashRedirect`. Exclut les anciens motifs
      // WordPress (/tag, /author, /category, /wp-*, /xmlrpc.php, …/feed/ et
      // ?replytocom) : ils doivent atteindre le middleware pour recevoir un 410
      // direct, sans redirection intermédiaire. Voir src/lib/legacy-wordpress.ts.
      {
        source:
          "/:path((?!(?:tag|author|category)/|wp-|xmlrpc)(?!(?:.*/)?feed/$).+)/",
        missing: [{ type: "query", key: "replytocom" }],
        destination: "/:path",
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
