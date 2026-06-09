import { signOut } from "next-auth/react";

/** Sign out and land on the public homepage on the same host the user opened (not AUTH_URL). */
export async function signOutToHome() {
  await signOut({ redirect: false });
  window.location.assign("/");
}
