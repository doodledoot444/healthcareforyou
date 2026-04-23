"use client";

import { motion } from "framer-motion";
import { LogoutButton } from "@/components/auth/logout-button";
import { dashboardNavigation, filterNavByRole } from "@/components/layout/navigation-config";
import { SidebarGroup } from "@/components/layout/sidebar-group";
import { useSidebarStore } from "@/lib/sidebar-store";

interface SidebarContainerProps {
  pathname: string;
  userName: string;
}

const COLLAPSE_ENABLED = process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSE === "true";

export function SidebarContainer({ pathname, userName }: SidebarContainerProps) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const navItems = filterNavByRole(dashboardNavigation, "user");

  return (
    <motion.aside
      className="hidden rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm md:sticky md:top-6 md:block md:h-[calc(100vh-3rem)] md:overflow-auto"
      animate={{ width: isCollapsed ? 88 : 240 }}
      initial={false}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-2">
        {!isCollapsed ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Joyful Health Tracker</p>
            <p className="mt-2 text-sm text-slate-600">Hello, {userName}</p>
          </div>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">JHT</p>
        )}
        {COLLAPSE_ENABLED ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? ">" : "<"}
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        <SidebarGroup items={navItems} pathname={pathname} isCollapsed={isCollapsed} />
      </div>

      <div className="mt-5 border-t border-emerald-100 pt-4">
        <LogoutButton
          className={
            isCollapsed
              ? "w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              : "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          }
        />
      </div>
    </motion.aside>
  );
}
