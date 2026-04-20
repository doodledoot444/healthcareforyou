import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/achievements", label: "Achievements" },
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
        </ul>
      </div>
    </nav>
  );
}
