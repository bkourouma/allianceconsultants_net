import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Rendu minimal et sûr du texte de l'assistant : paragraphes, listes à puces, **gras** et
 * liens [libellé](/chemin). Aucun HTML n'est interprété (rien n'est injecté dans le DOM) ;
 * seuls les liens internes ou vers les domaines d'Alliance Consultants sont rendus cliquables.
 */

// L'URL d'un lien tolère un niveau de parenthèses (« javascript:alert(1) ») : sinon la parenthèse
// fermante resterait dans le texte affiché.
const URL_PART = String.raw`(?:[^()\s]|\([^()\s]*\))+`;
const TOKEN = new RegExp(String.raw`(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\(${URL_PART}\))`, "g");
const LINK = new RegExp(String.raw`^\[([^\]]+)\]\((${URL_PART})\)$`);
const LIST_ITEM = /^\s*[-*•]\s+/;
const TRUSTED_HOSTS = [/(^|\.)allianceconsultants\.net$/, /^immotopia\.cloud$/, /^calendly\.com$/];

const LINK_CLASS =
  "font-semibold text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink hover:decoration-2";

function renderLink(label: string, href: string, key: number, onNavigate?: () => void): ReactNode {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link key={key} href={href} className={LINK_CLASS} onClick={onNavigate}>
        {label}
      </Link>
    );
  }
  try {
    const url = new URL(href);
    if (url.protocol === "https:" && TRUSTED_HOSTS.some((re) => re.test(url.hostname))) {
      return (
        <a key={key} href={url.toString()} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
  } catch {
    // URL invalide : rendue comme texte.
  }
  return label;
}

function inline(text: string, onNavigate?: () => void): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = LINK.exec(part);
    if (link) return renderLink(link[1]!, link[2]!, i, onNavigate);
    return part;
  });
}

export function RichText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks = text.trim().split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const out: ReactNode[] = [];
        let bullets: string[] = [];
        let paragraph: string[] = [];

        const flushBullets = () => {
          if (bullets.length === 0) return;
          out.push(
            <ul key={`ul-${out.length}`} className="my-1.5 list-disc space-y-1 pl-5 marker:text-ink-mute">
              {bullets.map((b, i) => (
                <li key={i}>{inline(b, onNavigate)}</li>
              ))}
            </ul>,
          );
          bullets = [];
        };
        const flushParagraph = () => {
          if (paragraph.length === 0) return;
          out.push(
            <p key={`p-${out.length}`}>
              {paragraph.map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {inline(line, onNavigate)}
                </span>
              ))}
            </p>,
          );
          paragraph = [];
        };

        for (const line of lines) {
          if (LIST_ITEM.test(line)) {
            flushParagraph();
            bullets.push(line.replace(LIST_ITEM, ""));
          } else {
            flushBullets();
            paragraph.push(line);
          }
        }
        flushBullets();
        flushParagraph();

        return (
          <div key={bi} className="space-y-2 [&:not(:first-child)]:mt-2">
            {out}
          </div>
        );
      })}
    </>
  );
}
