import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNavItems } from "@/lib/navigation";
import { requireRole } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(["ADMIN"]);

  return (
    <DashboardShell
      navItems={adminNavItems}
      roleLabel="Admin"
      userName={session.user.name ?? session.user.email ?? "Admin user"}
    >
      {children}
    </DashboardShell>
  );
}
