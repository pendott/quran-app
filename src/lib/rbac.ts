import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardHomeForRole } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getDashboardHomeForRole(session.user.role));
  }

  return session;
}
