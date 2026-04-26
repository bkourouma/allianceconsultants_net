import nodemailer, { type Transporter } from "nodemailer";
import type { Lead } from "@prisma/client";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !portRaw) {
    return null;
  }

  const port = Number.parseInt(portRaw, 10);
  if (Number.isNaN(port)) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  return cachedTransporter;
}

function buildBody(lead: Lead): string {
  const lines = [
    "Nouvelle demande via allianceconsultants.net",
    `Intention   : ${lead.intent}`,
    `Solution    : ${lead.solutionSlug ?? "—"}`,
    `Page source : ${lead.fromPage ?? "—"}`,
    `Bloc source : ${lead.fromBlock ?? "—"}`,
    "",
    `Identité     : ${lead.name}`,
    `Organisation : ${lead.organization}`,
    `E-mail       : ${lead.email}`,
    `Téléphone    : ${lead.phone}`,
    "",
    "Message :",
    lead.message,
    "",
    "---",
    `Référence Prisma : ${lead.id}`,
    `Soumis le        : ${lead.createdAt.toISOString()}`,
    `User-Agent       : ${lead.userAgent ?? "—"}`,
  ];
  return lines.join("\n");
}

export async function sendLeadNotification(lead: Lead): Promise<void> {
  const transporter = getTransporter();
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.SMTP_FROM;

  if (!transporter || !to || !from) {
    throw new Error(
      "SMTP configuration incomplete (missing SMTP_HOST/PORT, SMTP_FROM or LEAD_NOTIFY_TO)"
    );
  }

  await transporter.sendMail({
    from,
    to,
    replyTo: lead.email,
    subject: `[Lead ${lead.intent}] ${lead.name} — ${lead.solutionSlug ?? "general"}`,
    text: buildBody(lead),
  });
}
