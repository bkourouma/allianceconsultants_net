import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

async function load(sha: string | undefined) {
  vi.resetModules();
  vi.stubEnv("APP_COMMIT_SHA", sha);
  return (await import("../../next.config")).default;
}

describe("build commit attestation", () => {
  it("exposes the complete build SHA and preserves existing configuration", async () => {
    const sha = "a".repeat(40);
    const config = await load(sha);
    const rules = await config.headers!();
    expect(rules.flatMap((rule) => rule.headers).filter((header) => header.key === "x-commit-sha"))
      .toEqual([{ key: "x-commit-sha", value: sha }]);
    expect((await config.redirects!()).length).toBeGreaterThan(0);
    expect(rules.flatMap((rule) => rule.headers)).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });

  it.each([undefined, "", "main", "abc1234", "A".repeat(40), "g".repeat(40), "a".repeat(41), "a".repeat(40) + "\n", "a".repeat(40) + "\r\nInjected: true"])(
    "omits missing or invalid SHA %s", async (sha) => {
      const config = await load(sha);
      expect((await config.headers!()).flatMap((rule) => rule.headers)
        .some((header) => header.key === "x-commit-sha")).toBe(false);
    },
  );
});
