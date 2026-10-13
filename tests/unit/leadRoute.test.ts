import { describe, it, expect, vi, beforeEach } from "vitest";

// IMPORTANT — mocks must be declared before importing the route handler.
const createMock = vi.fn();
const sendMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

vi.mock("@/lib/mailer", () => ({
  sendLeadNotification: (...args: unknown[]) => sendMock(...args),
}));

// Import AFTER mocks are wired
const { POST } = await import("@/app/api/lead/route");

function buildRequest(body: Record<string, unknown>, ip = "10.0.0.1") {
  return new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
      "user-agent": "vitest-test-agent",
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  intent: "demo",
  solutionSlug: "medicpro",
  fromPage: "/solutions/medicpro",
  fromBlock: "section-demo",
  name: "Jean Dupont",
  email: "jean@example.com",
  phone: "+225010203",
  organization: "Alliance Test SARL",
  message: "Bonjour, je souhaite organiser une démonstration MedicPro pour mon équipe.",
  consent: true,
  honeypot: "",
};

beforeEach(() => {
  createMock.mockReset();
  sendMock.mockReset();
});

describe("POST /api/lead", () => {
  it("returns 204 silently when honeypot is filled, without persisting or mailing", async () => {
    // Use a unique IP per test to avoid the in-memory rate-limit bleed across tests.
    const res = await POST(
      buildRequest({ ...validBody, honeypot: "I am a bot" }, "10.0.0.10") as never
    );
    expect(res.status).toBe(204);
    expect(createMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 when consent is missing or false", async () => {
    const res = await POST(
      buildRequest({ ...validBody, consent: false }, "10.0.0.11") as never
    );
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("persists the lead and notifies, returning 200 + reference + mailSent:true on success", async () => {
    createMock.mockResolvedValue({
      id: "lead_test_id_001",
      createdAt: new Date(),
      intent: "DEMO",
      solutionSlug: "medicpro",
      fromPage: "/solutions/medicpro",
      fromBlock: "section-demo",
      name: validBody.name,
      email: validBody.email,
      phone: validBody.phone,
      organization: validBody.organization,
      message: validBody.message,
      consent: true,
      userAgent: "vitest-test-agent",
      ipHash: null,
      honeypot: null,
      status: "NEW",
      notes: null,
      contactedAt: null,
      contactedBy: null,
    });
    sendMock.mockResolvedValue(undefined);

    const res = await POST(buildRequest(validBody, "10.0.0.12") as never);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; reference: string; mailSent: boolean };
    expect(json.ok).toBe(true);
    expect(json.reference).toBe("lead_test_id_001");
    expect(json.mailSent).toBe(true);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("returns 200 + mailSent:false when mailer fails (lead is still persisted)", async () => {
    createMock.mockResolvedValue({
      id: "lead_test_id_002",
      createdAt: new Date(),
      intent: "DEMO",
      solutionSlug: "medicpro",
      fromPage: "/solutions/medicpro",
      fromBlock: "section-demo",
      name: validBody.name,
      email: validBody.email,
      phone: validBody.phone,
      organization: validBody.organization,
      message: validBody.message,
      consent: true,
      userAgent: "vitest-test-agent",
      ipHash: null,
      honeypot: null,
      status: "NEW",
      notes: null,
      contactedAt: null,
      contactedBy: null,
    });
    sendMock.mockRejectedValue(new Error("SMTP unreachable"));

    const res = await POST(buildRequest(validBody, "10.0.0.13") as never);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; reference: string; mailSent: boolean };
    expect(json.ok).toBe(true);
    expect(json.reference).toBe("lead_test_id_002");
    expect(json.mailSent).toBe(false);
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when rate limit is exceeded for a single IP", async () => {
    createMock.mockResolvedValue({
      id: "lead_rl",
      createdAt: new Date(),
      intent: "DEMO",
      solutionSlug: "medicpro",
      fromPage: "/solutions/medicpro",
      fromBlock: "section-demo",
      name: validBody.name,
      email: validBody.email,
      phone: validBody.phone,
      organization: validBody.organization,
      message: validBody.message,
      consent: true,
      userAgent: "vitest-test-agent",
      ipHash: null,
      honeypot: null,
      status: "NEW",
      notes: null,
      contactedAt: null,
      contactedBy: null,
    });
    sendMock.mockResolvedValue(undefined);

    const ip = "10.0.0.99";
    // 5 OK + 1 throttled (default LEAD_RATE_LIMIT_PER_10MIN = 5)
    for (let i = 0; i < 5; i++) {
      const ok = await POST(buildRequest(validBody, ip) as never);
      expect(ok.status).toBe(200);
    }
    const sixth = await POST(buildRequest(validBody, ip) as never);
    expect(sixth.status).toBe(429);
  });

  describe("formulaire HTML sans JavaScript (repli 303)", () => {
    // Sous Docker, req.url porte l'hôte interne du conteneur : le Location ne doit jamais
    // en dépendre (chemin relatif, résolu par le navigateur sur l'adresse publique).
    function buildFormRequest(fields: Record<string, string>, ip: string) {
      return new Request("http://013da9911305:3000/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          host: "allianceconsultants.net",
          "x-forwarded-proto": "https",
          "x-forwarded-for": ip,
        },
        body: new URLSearchParams(fields).toString(),
      });
    }

    it("honeypot rempli → 303 vers /contact-recu (relatif)", async () => {
      const res = await POST(buildFormRequest({ honeypot: "bot" }, "10.0.1.1") as never);
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("/contact-recu");
    });

    it("validation échouée → 303 vers /contact-erreur?reason=validation (relatif)", async () => {
      const res = await POST(buildFormRequest({ name: "x" }, "10.0.1.2") as never);
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("/contact-erreur?reason=validation");
    });

    it("succès → 303 vers /contact-recu?ref=… (relatif, sans hôte interne)", async () => {
      createMock.mockResolvedValue({ id: "lead_form_001" });
      sendMock.mockResolvedValue(undefined);
      const res = await POST(
        buildFormRequest({ ...validBody, consent: "true" } as Record<string, string>, "10.0.1.3") as never
      );
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("/contact-recu?ref=lead_form_001");
    });

    it("succès, mail en échec → 303 avec &mail=ko", async () => {
      createMock.mockResolvedValue({ id: "lead_form_002" });
      sendMock.mockRejectedValue(new Error("SMTP unreachable"));
      const res = await POST(
        buildFormRequest({ ...validBody, consent: "true" } as Record<string, string>, "10.0.1.4") as never
      );
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("/contact-recu?ref=lead_form_002&mail=ko");
    });

    it("erreur de base de données → 303 vers /contact-erreur?reason=server", async () => {
      createMock.mockRejectedValue(new Error("db down"));
      const res = await POST(
        buildFormRequest({ ...validBody, consent: "true" } as Record<string, string>, "10.0.1.5") as never
      );
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("/contact-erreur?reason=server");
    });
  });
});
