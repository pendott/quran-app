import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { teacherNavItems } from "@/lib/navigation";
import { requireRole } from "@/lib/rbac";
import { autoCompletePastSessionsForTeacher } from "@/server/booking/auto-complete-past-sessions";
import { getTeacherByUserId } from "@/server/queries/teacher";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["TEACHER"]);
  const teacher = await getTeacherByUserId(session.user.id);
  if (teacher) {
    await autoCompletePastSessionsForTeacher(teacher.id);
  }

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
