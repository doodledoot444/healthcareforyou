import type { ReactNode } from "react";

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {title ? <h2 className="mb-3 text-lg font-semibold text-zinc-900">{title}</h2> : null}
      {children}
    </section>
  );
}
