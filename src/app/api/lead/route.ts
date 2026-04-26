import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";
import { prisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/mailer";
import type { LeadIntent } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_DEFAULT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const rateBuckets = new Map<string, number[]>();

function rateLimitExceeded(ip: string): boolean {
  const limit = Number.parseInt(
    process.env.LEAD_RATE_LIMIT_PER_10MIN ?? `${RATE_LIMIT_DEFAULT}`,
    10
  );
  const max = Number.isFinite(limit) && limit > 0 ? limit : RATE_LIMIT_DEFAULT;
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const past = (rateBuckets.get(ip) ?? []).filter((t) => t > cutoff);
  if (past.length >= max) {
    rateBuckets.set(ip, past);
    return true;
  }
  past.push(now);
  rateBuckets.set(ip, past);
  return false;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function intentToPrisma(intent: LeadInput["intent"]): LeadIntent {
  return intent.toUpperCase() as LeadIntent;
}

async function readBody(req: NextRequest): Promise<{
  data: Record<string, unknown>;
  isHtmlForm: boolean;
}> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await req.json()) as Record<string, unknown>;
    return { data: json, isHtmlForm: false };
  }
  const formData = await req.formData();
  const data: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === "consent") {
      data[k] = v === "true" || v === "on" || v === "1";
    } else {
      data[k] = typeof v === "string" ? v : "";
    }
  }
  return { data, isHtmlForm: true };
}

export async function POST(req: NextRequest) {
  let body: { data: Record<string, unknown>; isHtmlForm: boolean };
  try {
    body = await readBody(req);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const { data, isHtmlForm } = body;
  const origin = new URL(req.url).origin;

  // Honeypot — silently swallow if filled
  const honeypotFilled =
    typeof data.honeypot === "string" && data.honeypot.length > 0;
  if (honeypotFilled) {
    if (isHtmlForm) {
      return NextResponse.redirect(new URL("/contact-recu", origin), { status: 303 });
    }
    return new NextResponse(null, { status: 204 });
  }

  // Validation
  const parsed = LeadInputSchema.safeParse(data);
  if (!parsed.success) {
    if (isHtmlForm) {
      return NextResponse.redirect(
        new URL("/contact-erreur?reason=validation", origin),
        { status: 303 }
      );
    }
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_root";
      errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }
  const input = parsed.data;

  // Rate limit
  const ip = getClientIp(req);
  if (rateLimitExceeded(ip)) {
    if (isHtmlForm) {
      return NextResponse.redirect(
        new URL("/contact-erreur?reason=rate_limited", origin),
        { status: 303 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  // Hash IP for RGPD-compliant audit
  let ipHash: string | null = null;
  try {
    ipHash = await bcrypt.hash(ip, 8);
  } catch {
    ipHash = null;
  }

  // Persist
  let leadId: string;
  let createdLead;
  try {
    createdLead = await prisma.lead.create({
      data: {
        intent: intentToPrisma(input.intent),
        solutionSlug: input.solutionSlug ?? null,
        fromPage: input.fromPage ?? null,
        fromBlock: input.fromBlock ?? null,
        name: input.name,
        email: input.email,
        phone: input.phone,
        organization: input.organization,
        message: input.message,
        consent: input.consent,
        userAgent: req.headers.get("user-agent") ?? null,
        ipHash,
        honeypot: null,
        status: "NEW",
      },
    });
    leadId = createdLead.id;
  } catch (e) {
    console.error("Lead persistence failed:", e);
    if (isHtmlForm) {
      return NextResponse.redirect(
        new URL("/contact-erreur?reason=server", origin),
        { status: 303 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 }
    );
  }

  // Notify (best-effort — lead is already persisted)
  let mailSent = false;
  try {
    await sendLeadNotification(createdLead);
    mailSent = true;
  } catch (e) {
    console.error("Lead mail notification failed:", e);
    mailSent = false;
  }

  if (isHtmlForm) {
    const dest = mailSent
      ? `/contact-recu?ref=${encodeURIComponent(leadId)}`
      : `/contact-recu?ref=${encodeURIComponent(leadId)}&mail=ko`;
    return NextResponse.redirect(new URL(dest, origin), { status: 303 });
  }

  return NextResponse.json(
    { ok: true, reference: leadId, mailSent },
    { status: 200 }
  );
}
