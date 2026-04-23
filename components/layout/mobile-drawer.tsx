"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { dashboardNavigation, filterNavByRole } from "@/components/layout/navigation-config";
import { SidebarGroup } from "@/components/layout/sidebar-group";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useSidebarStore } from "@/lib/sidebar-store";

interface MobileDrawerProps {
  userName: string;
}

export function MobileDrawer({ userName }: MobileDrawerProps) {
  const pathname = usePathname() ?? "/dashboard";
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const navItems = filterNavByRole(dashboardNavigation, "user");

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="md:hidden">
        <SheetTitle className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Joyful Health Tracker
        </SheetTitle>
        <SheetDescription className="mt-1 text-sm text-slate-600">Hello, {userName}</SheetDescription>

        <div className="mt-5">
          <SidebarGroup items={navItems} pathname={pathname} isCollapsed={false} onNavigate={() => setOpen(false)} />
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <LogoutButton className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
