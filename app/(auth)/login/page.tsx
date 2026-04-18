import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-zinc-900">Welcome back</h1>
      <p className="mt-2 text-zinc-600">Sign in to continue your health journey.</p>

      <form className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-500"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        New here? <Link href="/register" className="font-semibold text-teal-700">Create an account</Link>
      </p>
    </main>
  );
}
