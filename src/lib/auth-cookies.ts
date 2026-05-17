/**
 * Auth.js uses HTTPS from AUTH_URL to decide secure cookies.
 * Middleware must match, or HTTP Docker/local installs never keep a session.
 */
export function shouldUseSecureAuthCookies() {
  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  if (base.startsWith("https://")) return true;
  if (base.startsWith("http://")) return false;
  return process.env.NODE_ENV === "production";
}
