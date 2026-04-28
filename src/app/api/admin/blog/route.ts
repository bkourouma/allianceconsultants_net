import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { createBlogPost } from "@/lib/admin/blog";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const post = await createBlogPost(body, session.user.id);
    revalidateTag("blog");
    return NextResponse.json({ ok: true, id: post.id, slug: post.slug });
  } catch (e) {
    if (e instanceof ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of e.issues) {
        errors[issue.path.join(".") || "_root"] = issue.message;
      }
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }
    console.error("Blog create failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
