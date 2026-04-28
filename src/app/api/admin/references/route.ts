import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { createProjectReference } from "@/lib/admin/projectReferences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const ref = await createProjectReference(body);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e) {
    if (e instanceof ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of e.issues) {
        errors[issue.path.join(".") || "_root"] = issue.message;
      }
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }
    console.error("ProjectReference create failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
