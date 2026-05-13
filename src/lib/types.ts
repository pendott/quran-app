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

import type { ReactNode } from "react";

export type TableRow = Record<string, ReactNode>;

export type TimelineItem = {
  title: string;
  description: string;
  meta: string;
};
