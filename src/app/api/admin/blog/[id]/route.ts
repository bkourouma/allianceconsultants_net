import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { deleteBlogPost, updateBlogPost } from "@/lib/admin/blog";

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

  try {
    const post = await updateBlogPost(id, body);
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
    console.error("Blog update failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await deleteBlogPost(id);
    revalidateTag("blog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Blog delete failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
