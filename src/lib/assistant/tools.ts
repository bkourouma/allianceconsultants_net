import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AssistantAction, ChatState } from "./protocol";

/**
 * Outils « côté interface » : le modèle ne reçoit jamais de résultat d'outil. Un appel d'outil
 * termine simplement le tour et le widget affiche l'élément correspondant (réponses rapides,
 * formulaire de coordonnées, réservation de démo). Aucun outil ne peut donc écrire en base :
 * les coordonnées ne partent que du formulaire, rempli et validé par le visiteur.
 */
export const ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "suggest_replies",
    description:
      "Affiche 2 à 4 réponses rapides cliquables sous ton message. À utiliser quand ta question appelle un choix ou une réponse courte. Ne pas utiliser pour une réponse libre (chiffres, noms) ni avec show_contact_form.",
    input_schema: {
      type: "object",
      properties: {
        replies: {
          type: "array",
          items: { type: "string", maxLength: 40 },
          minItems: 2,
          maxItems: 4,
          description:
            "Réponses que le visiteur pourrait donner, à la première personne, 40 caractères maximum chacune.",
        },
      },
      required: ["replies"],
    },
  },
  {
    name: "show_contact_form",
    description:
      "Affiche le formulaire de coordonnées (nom, organisation, e-mail, téléphone, consentement). À appeler une fois le besoin compris, après avoir expliqué en une ou deux phrases que c'est sans engagement et pour préparer une démonstration adaptée. Ne l'appelle pas si les coordonnées sont déjà recueillies.",
    input_schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          maxLength: 900,
          description:
            "Résumé factuel pour l'équipe commerciale : profil et organisation du visiteur, situation actuelle, difficultés, solution(s) d'intérêt, attentes. 600 caractères conseillés, en français, sans jugement.",
        },
      },
      required: ["summary"],
    },
  },
  {
    name: "show_demo_booking",
    description:
      "Ouvre la réservation d'un créneau de démonstration. À utiliser uniquement si le visiteur refuse de laisser ses coordonnées mais veut réserver, ou s'il les a déjà laissées et demande à réserver.",
    input_schema: { type: "object", properties: {} },
  },
];

const RepliesInput = z.object({
  replies: z.array(z.string().trim().min(1).max(60)).min(1).max(4),
});
const ContactFormInput = z.object({ summary: z.string().trim().min(1).max(900) });

/**
 * Convertit les appels d'outils du modèle en actions d'interface, en appliquant l'état connu :
 * on ne redemande pas des coordonnées déjà recueillies, ni un formulaire déjà affiché.
 * Une seule action par tour (formulaire > réservation > réponses rapides).
 */
export function actionsFromContent(
  content: Anthropic.ContentBlock[],
  state: ChatState,
): AssistantAction[] {
  let replies: string[] | null = null;
  let summary: string | null = null;
  let booking = false;

  for (const block of content) {
    if (block.type !== "tool_use") continue;
    if (block.name === "suggest_replies") {
      const parsed = RepliesInput.safeParse(block.input);
      if (parsed.success) replies = parsed.data.replies;
    } else if (block.name === "show_contact_form") {
      const parsed = ContactFormInput.safeParse(block.input);
      if (parsed.success) summary = parsed.data.summary;
    } else if (block.name === "show_demo_booking") {
      booking = true;
    }
  }

  if (summary && !state.contactCaptured && !state.contactFormShown) {
    return [{ type: "contact_form", summary }];
  }
  if ((booking || summary) && !state.bookingDone) {
    // Le formulaire a déjà été montré ou rempli : on passe à la réservation.
    if (booking || state.contactCaptured) return [{ type: "demo_booking" }];
  }
  if (replies) return [{ type: "replies", replies }];
  return [];
}
