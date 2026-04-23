import type { ReactNode } from "react";

export type NavRole = "user" | "admin";

export type NavItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  children?: NavItem[];
  roles?: NavRole[];
};

function navIcon(label: string) {
  return (
    <span
      aria-hidden
      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white text-[10px] font-semibold text-slate-700"
    >
      {label}
    </span>
  );
}

export const dashboardNavigation: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: navIcon("OV") },
  { label: "Analytics", href: "/dashboard/analytics", icon: navIcon("AN") },
  { label: "Explore", href: "/dashboard/explore", icon: navIcon("EX") },
  { label: "Stories", href: "/dashboard/stories", icon: navIcon("ST") },
  { label: "Progress", href: "/dashboard/progress", icon: navIcon("PR") },
  { label: "Achievements", href: "/dashboard/achievements", icon: navIcon("AC") },
  { label: "Journal", href: "/dashboard/journal", icon: navIcon("JR") },
  { label: "Profile", href: "/dashboard/profile", icon: navIcon("PF") },
];

export function filterNavByRole(items: NavItem[], role: NavRole): NavItem[] {
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return item.roles.includes(role);
  });
}

export function isRouteActive(pathname: string, href?: string): boolean {
  if (!href) {
    return false;
  }

  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
