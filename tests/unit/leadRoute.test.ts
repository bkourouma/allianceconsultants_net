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
});
