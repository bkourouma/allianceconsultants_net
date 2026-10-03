import styles from "./ArticleBody.module.css";

/**
 * Renders the already-sanitised article HTML (see lib/sanitize.ts, applied at
 * write time) inside the reading surface. `html` must come from
 * `prepareArticle(post.bodyHtml)`, which only adds heading ids / figure
 * wrappers and never widens the sanitiser's whitelist.
 */
export function ArticleBody({ html, id }: { html: string; id: string }) {
  return (
    <div
      id={id}
      lang="fr"
      className={styles.body}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
