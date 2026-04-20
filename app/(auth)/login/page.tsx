"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { AUTH_REDIRECT_PATH } from "@/features/auth/constants";
import { signInWithCredentials } from "@/features/auth/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await signInWithCredentials(email, password);

        if (!result || result.error) {
          setError("Invalid email or password.");
          return;
        }

        window.location.assign(result.url ?? AUTH_REDIRECT_PATH);
      } catch {
        setError("Sign in failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, password],
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-emerald-50 via-cyan-50 to-white px-4 py-10 sm:px-6 sm:py-14">
      <section className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="mb-6 space-y-2">
          <p className="inline-flex rounded-xl bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
            Joyful Health Tracker
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Welcome back</h1>
          <p className="text-sm text-slate-600">Sign in to continue your daily wellness check-ins.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-600">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
