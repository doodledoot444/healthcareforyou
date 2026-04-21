import type { ReactNode } from "react";

interface DashboardSectionShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardSectionShell({ title, description, children }: DashboardSectionShellProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </header>
      {children}
    </section>
  );
}
