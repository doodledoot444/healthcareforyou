import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/explore", label: "Explore" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/achievements", label: "Achievements" },
  { href: "/dashboard/journal", label: "Journal" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function Navbar() {
  return (
    <nav className="hidden border-b border-zinc-200 bg-white/95 backdrop-blur md:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-4">
        <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
          Joyful Health Tracker
        </Link>
        <ul className="flex items-center gap-6 text-sm text-zinc-700">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-teal-700">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <LogoutButton className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900" />
          </li>
        </ul>
      </div>
    </nav>
  );
}
