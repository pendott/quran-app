import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { portalNavItems } from "@/lib/navigation";
import { requireRole } from "@/lib/rbac";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["STUDENT", "PARENT"]);

  return (
    <DashboardShell
      navItems={portalNavItems}
      roleLabel="Student / Parent"
      userName={session.user.name ?? session.user.email ?? "Portal user"}
    >
      {children}
    </DashboardShell>
  );
}
