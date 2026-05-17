import { describe, expect, it, afterEach } from "vitest";
import { shouldUseSecureAuthCookies } from "./auth-cookies";

describe("shouldUseSecureAuthCookies", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("returns false for http AUTH_URL even in production", () => {
    process.env = { ...env, NODE_ENV: "production", AUTH_URL: "http://localhost:3000" };
    expect(shouldUseSecureAuthCookies()).toBe(false);
  });

  it("returns true for https AUTH_URL", () => {
    process.env = { ...env, AUTH_URL: "https://app.example.com" };
    expect(shouldUseSecureAuthCookies()).toBe(true);
  });
});
