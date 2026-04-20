import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AUTH_LOGIN_PATH } from "@/features/auth/constants";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(AUTH_LOGIN_PATH);
  }

  return <DashboardShell userName={currentUser.name ?? "Friend"}>{children}</DashboardShell>;
}
