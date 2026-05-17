/** True when Server-to-Server OAuth credentials are set (and stub mode is off). */
export function isZoomConfigured() {
  if (process.env.ZOOM_USE_STUB === "1") return false;
  return Boolean(
    process.env.ZOOM_ACCOUNT_ID &&
      process.env.ZOOM_CLIENT_ID &&
      process.env.ZOOM_CLIENT_SECRET &&
      process.env.ZOOM_HOST_USER_ID,
  );
}

export function isZoomStubMode() {
  return process.env.ZOOM_USE_STUB === "1";
}
