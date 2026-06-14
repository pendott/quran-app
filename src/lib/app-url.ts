function isLocalhostUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
  } catch {
    return false;
  }
}

/**
 * Public site URL for links in emails and redirects.
 * Skips localhost when NODE_ENV=production so approval/reset emails use the real domain.
 */
export function getPublicAppUrl() {
  const candidates = [
    process.env.APP_PUBLIC_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  for (const raw of candidates) {
    const url = raw.trim().replace(/\/$/, "");
    if (process.env.NODE_ENV === "production" && isLocalhostUrl(url)) {
      continue;
    }
    return url;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://jomngaji.my";
  }

  return "http://localhost:3000";
}

export function publicLoginUrl(callbackPath?: string) {
  const base = getPublicAppUrl();
  if (!callbackPath) {
    return `${base}/login`;
  }
  return `${base}/login?callbackUrl=${encodeURIComponent(callbackPath)}`;
}
