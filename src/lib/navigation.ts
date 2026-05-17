import type { NavItem, UserRole } from "@/lib/types";

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Overview", description: "KPIs, upcoming classes, revenue" },
  { href: "/admin/teachers", label: "Teachers", description: "Profiles, assignments, availability" },
  { href: "/admin/students", label: "Students", description: "Student records and parent links" },
  { href: "/admin/bookings", label: "Bookings", description: "Session flow, reschedules, status" },
  { href: "/admin/payments", label: "Payments", description: "Invoices, package usage, settlement" },
];

export const teacherNavItems: NavItem[] = [
  { href: "/teacher", label: "Today", description: "Daily schedule and class actions" },
  { href: "/teacher/classes", label: "Classes", description: "Upcoming sessions and attendance" },
  { href: "/teacher/availability", label: "Availability", description: "Weekly hours and monthly extra dates" },
  { href: "/teacher/students", label: "Students", description: "Assigned learners and history" },
];

export const studentNavItems: NavItem[] = [
  { href: "/students", label: "Overview", description: "Next class, package balance, reminders" },
  { href: "/students/bookings", label: "Bookings", description: "Calendar view and slot selection" },
  { href: "/students/progress", label: "Progress", description: "Surah and ayah learning timeline" },
  { href: "/students/recordings", label: "Recordings", description: "Replay completed class sessions" },
  { href: "/students/payments", label: "Payments", description: "Receipts, package purchases, refunds" },
];

const defaultRouteByRole: Record<UserRole, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/students",
  PARENT: "/students",
};

export function getDashboardHomeForRole(role: UserRole) {
  return defaultRouteByRole[role];
}

const dashboardPathPrefixByRole: Record<UserRole, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/students",
  PARENT: "/students",
};

/** Reject open redirects and non-app URLs. */
function isSafeRelativeAppPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

/**
 * After credentials sign-in, send the user to their workspace.
 * Honors `callbackUrl` only when it stays under that role’s dashboard prefix.
 */
export function resolvePostLoginPath(callbackUrl: string, role: UserRole) {
  const trimmed = callbackUrl.trim() || "/";
  if (!isSafeRelativeAppPath(trimmed) || trimmed === "/") {
    return getDashboardHomeForRole(role);
  }
  if (
    (role === "STUDENT" || role === "PARENT") &&
    (trimmed === "/checkout" || trimmed.startsWith("/checkout/"))
  ) {
    return trimmed;
  }
  const prefix = dashboardPathPrefixByRole[role];
  if (trimmed === prefix || trimmed.startsWith(`${prefix}/`)) {
    return trimmed;
  }
  return getDashboardHomeForRole(role);
}
