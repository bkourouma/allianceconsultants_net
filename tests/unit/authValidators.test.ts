import { describe, expect, it } from "vitest";
import {
  LoginInputSchema,
  PasswordChangeInputSchema,
} from "@/lib/validators/auth";

describe("LoginInputSchema", () => {
  it("accepts a valid email and a non-empty password", () => {
    expect(
      LoginInputSchema.safeParse({
        email: "admin@example.com",
        password: "x",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      LoginInputSchema.safeParse({ email: "not-an-email", password: "x" })
        .success,
    ).toBe(false);
  });
});

describe("PasswordChangeInputSchema", () => {
  it("rejects passwords shorter than 12 characters", () => {
    const r = PasswordChangeInputSchema.safeParse({
      currentPassword: "old",
      newPassword: "Short1A",
      newPasswordConfirm: "Short1A",
    });
    expect(r.success).toBe(false);
  });

  it("rejects passwords missing required character classes", () => {
    const r = PasswordChangeInputSchema.safeParse({
      currentPassword: "old",
      newPassword: "alllowercase1",
      newPasswordConfirm: "alllowercase1",
    });
    expect(r.success).toBe(false);
  });

  it("rejects mismatched confirmation", () => {
    const r = PasswordChangeInputSchema.safeParse({
      currentPassword: "old",
      newPassword: "Strong1Password",
      newPasswordConfirm: "Strong1Passworz",
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid password change payload", () => {
    const r = PasswordChangeInputSchema.safeParse({
      currentPassword: "old",
      newPassword: "Strong1Password",
      newPasswordConfirm: "Strong1Password",
    });
    expect(r.success).toBe(true);
  });
});
