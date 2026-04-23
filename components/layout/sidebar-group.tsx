import type { NavItem } from "@/components/layout/navigation-config";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { isRouteActive } from "@/components/layout/navigation-config";

interface SidebarGroupProps {
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarGroup({ items, pathname, isCollapsed, onNavigate }: SidebarGroupProps) {
  return (
    <nav role="navigation" aria-label="Dashboard navigation" className="grid gap-2">
      {items.map((item) => (
        <SidebarItem
          key={item.href ?? item.label}
          item={item}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
          isActive={isRouteActive(pathname, item.href)}
        />
      ))}
    </nav>
  );
}
