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
  { href: "/teacher/students", label: "Students", description: "Assigned learners and history" },
];

export const portalNavItems: NavItem[] = [
  { href: "/portal", label: "Overview", description: "Next class, package balance, reminders" },
  { href: "/portal/bookings", label: "Bookings", description: "Calendar view and slot selection" },
  { href: "/portal/progress", label: "Progress", description: "Surah and ayah learning timeline" },
  { href: "/portal/recordings", label: "Recordings", description: "Replay completed class sessions" },
  { href: "/portal/payments", label: "Payments", description: "Receipts, package purchases, refunds" },
];

const defaultRouteByRole: Record<UserRole, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/portal",
  PARENT: "/portal",
};

export function getDashboardHomeForRole(role: UserRole) {
  return defaultRouteByRole[role];
}
