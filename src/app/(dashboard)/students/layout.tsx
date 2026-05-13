import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { studentNavItems } from "@/lib/navigation";
import { requireRole } from "@/lib/rbac";

export default async function StudentsLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["STUDENT", "PARENT"]);

  return (
    <DashboardShell
      navItems={studentNavItems}
      roleLabel="Student / Parent"
      userName={session.user.name ?? session.user.email ?? "Student"}
      workspaceTitle="Family portal"
      workspaceTagline="Book classes, follow progress, and replay recordings."
    >
      {children}
    </DashboardShell>
  );
}
