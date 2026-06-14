import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { familyRoleLabel } from "@/lib/family-role";
import { familyNavItems } from "@/lib/navigation";
import { requireRole } from "@/lib/rbac";

export default async function StudentsLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["STUDENT", "PARENT"]);
  const role = session.user.role;

  return (
    <DashboardShell
      navItems={familyNavItems}
      roleLabel={familyRoleLabel(role)}
      userName={session.user.name ?? session.user.email ?? "Learner"}
      workspaceTitle="Learning portal"
      workspaceTagline="Book classes, follow progress, and replay recordings."
    >
      {children}
    </DashboardShell>
  );
}
