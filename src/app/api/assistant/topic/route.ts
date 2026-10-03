import { NextResponse, type NextRequest } from "next/server";
import { getAssistantConfig, getSiteSettings } from "@/lib/content";
import { TopicIdSchema } from "@/lib/assistant/protocol";
import { resolveTopic, toPublicTopic } from "@/lib/assistant/topics";

export const runtime = "nodejs";

/**
 * Textes publics d'un sujet (accroche, ouverture, réponses rapides) + réglages du widget.
 * Chargé à la demande par le widget : rien n'est ajouté au poids des pages tant que
 * l'assistant n'a pas de raison de parler.
 */
export async function GET(req: NextRequest) {
  const parsed = TopicIdSchema.safeParse(req.nextUrl.searchParams.get("id") ?? "default");
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const [config, settings] = await Promise.all([getAssistantConfig(), getSiteSettings()]);
  return NextResponse.json(
    {
      assistantName: config.name,
      calendlyUrl: config.calendlyUrl,
      contact: {
        phone: settings.contact.phones[0] ?? null,
        whatsapp: settings.contact.whatsapp ?? null,
      },
      topic: toPublicTopic(resolveTopic(config, parsed.data)),
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } },
  );
}
