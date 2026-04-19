"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(result.error ?? "Registration failed.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (!signInResult || signInResult.error) {
        setError("Account created, but sign in failed. Please sign in manually.");
        router.push("/login");
        return;
      }

      // Use a hard navigation to ensure the session cookie is fully applied before rendering dashboard routes.
      window.location.assign(signInResult.url ?? "/");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-zinc-900">Create your account</h1>
      <p className="mt-2 text-zinc-600">Start tracking your wellness today.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating Account..." : "Register"}
        </button>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        Already have an account? <Link href="/login" className="font-semibold text-teal-700">Sign in</Link>
      </p>
    </main>
  );
}
