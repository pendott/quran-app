import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { teacherNavItems } from "@/lib/navigation";
import { requireRole } from "@/lib/rbac";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["TEACHER"]);

  return (
    <DashboardShell
      navItems={teacherNavItems}
      roleLabel="Teacher"
      userName={session.user.name ?? session.user.email ?? "Teacher user"}
      workspaceTitle="Teacher desk"
      workspaceTagline="Today’s classes, meeting links, notes, and attendance."
    >
      {children}
    </DashboardShell>
  );
}
