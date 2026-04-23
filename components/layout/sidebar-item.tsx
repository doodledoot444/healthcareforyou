import Link from "next/link";
import type { NavItem } from "@/components/layout/navigation-config";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({ item, isActive, isCollapsed, onNavigate }: SidebarItemProps) {
  if (!item.href) {
    return null;
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center rounded-xl border px-3 py-2 text-sm font-medium transition",
        isCollapsed ? "justify-center" : "gap-3",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50",
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!isCollapsed ? <span>{item.label}</span> : null}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-emerald-600 transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
