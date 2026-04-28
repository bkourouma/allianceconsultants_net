import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LeadStatusPatchSchema } from "@/lib/validators/blog";
import { updateLead } from "@/lib/admin/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = LeadStatusPatchSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  try {
    const updated = await updateLead(
      id,
      parsed.data,
      session.user.email ?? "unknown",
    );
    return NextResponse.json({ ok: true, lead: updated });
  } catch (e) {
    console.error("Lead update failed", e);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 },
    );
  }
}
