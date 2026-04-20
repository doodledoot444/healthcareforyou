import { redirect } from "next/navigation";
import Link from "next/link";
import { AUTH_REDIRECT_PATH } from "@/features/auth/constants";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(AUTH_REDIRECT_PATH);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-100 px-6 py-16">
      <main className="w-full max-w-4xl rounded-3xl bg-white p-10 shadow-xl ring-1 ring-teal-100 md:p-14">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
            Joyful Health Tracker
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            Build better habits with daily mood check-ins and actionable trends.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            A modular, analytics-ready wellness platform built for maintainable growth and fast deployment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
