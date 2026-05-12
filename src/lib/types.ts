export const userRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;

export type UserRole = (typeof userRoles)[number];

export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export type Stat = {
  label: string;
  value: string;
  change: string;
  tone?: "emerald" | "sky" | "amber" | "violet";
};

export type TableRow = Record<string, string>;

export type TimelineItem = {
  title: string;
  description: string;
  meta: string;
};
