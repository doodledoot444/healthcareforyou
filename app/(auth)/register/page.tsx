"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { AUTH_LOGIN_PATH, AUTH_REDIRECT_PATH } from "@/features/auth/constants";
import { registerUser, signInWithCredentials } from "@/features/auth/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
        await registerUser({ name, email, password });

        const signInResult = await signInWithCredentials(email, password);

        if (!signInResult || signInResult.error) {
          setError("Account created, but sign in failed. Please sign in manually.");
          router.push(AUTH_LOGIN_PATH);
          return;
        }

        // Use a hard navigation so session state is settled before protected UI renders.
        window.location.assign(signInResult.url ?? AUTH_REDIRECT_PATH);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Registration failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, name, password, router],
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-cyan-50 via-emerald-50 to-white px-4 py-10 sm:px-6 sm:py-14">
      <section className="w-full max-w-md rounded-2xl border border-cyan-100 bg-white/95 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="mb-6 space-y-2">
          <p className="inline-flex rounded-xl bg-cyan-100 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
            Joyful Health Tracker
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Create your account</h1>
          <p className="text-sm text-slate-600">Start tracking your wellness in under a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>

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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
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
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-cyan-700 hover:text-cyan-600">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
