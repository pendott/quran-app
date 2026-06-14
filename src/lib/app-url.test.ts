import { afterEach, describe, expect, it } from "vitest";
import { getPublicAppUrl, publicLoginUrl } from "./app-url";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("getPublicAppUrl", () => {
  it("uses localhost in development", () => {
    process.env = { ...env, NODE_ENV: "development", AUTH_URL: "http://localhost:3000" };
    expect(getPublicAppUrl()).toBe("http://localhost:3000");
  });

  it("skips localhost AUTH_URL in production", () => {
    process.env = { ...env, NODE_ENV: "production", AUTH_URL: "http://localhost:3000" };
    expect(getPublicAppUrl()).toBe("https://jomngaji.my");
  });

  it("prefers APP_PUBLIC_URL in production", () => {
    process.env = {
      ...env,
      NODE_ENV: "production",
      APP_PUBLIC_URL: "https://jomngaji.my",
      AUTH_URL: "http://localhost:3000",
    };
    expect(getPublicAppUrl()).toBe("https://jomngaji.my");
  });
});

describe("publicLoginUrl", () => {
  it("adds callback path", () => {
    process.env = { ...env, NODE_ENV: "production", AUTH_URL: "https://jomngaji.my" };
    expect(publicLoginUrl("/teacher")).toBe("https://jomngaji.my/login?callbackUrl=%2Fteacher");
  });
});
