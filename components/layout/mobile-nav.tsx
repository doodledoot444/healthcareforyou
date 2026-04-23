import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/explore", label: "Explore" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/journal", label: "Journal" },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-6 gap-1 px-2 py-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block rounded-lg px-2 py-2 text-center text-xs font-medium text-zinc-700 hover:bg-zinc-100">
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <LogoutButton className="block w-full rounded-lg px-2 py-2 text-center text-xs font-medium text-zinc-700 hover:bg-zinc-100" />
        </li>
      </ul>
    </nav>
  );
}
