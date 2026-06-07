import type { UserRole } from "@/lib/types";

/** Parent and student accounts share the same learning dashboard at /students. */
export function isFamilyRole(role: UserRole) {
  return role === "STUDENT" || role === "PARENT";
}

export function familyRoleLabel(role: UserRole) {
  if (role === "PARENT") return "Family account";
  if (role === "STUDENT") return "Learner account";
  return "Account";
}
