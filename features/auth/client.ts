import { signIn, signOut } from "next-auth/react";
import { AUTH_REDIRECT_PATH } from "./constants";

const LOGOUT_EVENT_KEY = "jh-tracker:logout";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  error?: string | null;
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as RegisterResponse;

  if (!response.ok) {
    throw new Error(result.error ?? "Registration failed.");
  }
}

export async function signInWithCredentials(email: string, password: string) {
  return signIn("credentials", {
    email,
    password,
    redirect: false,
    callbackUrl: AUTH_REDIRECT_PATH,
  });
}

export async function logoutUser(callbackUrl = "/") {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => null);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
  }

  await signOut({
    callbackUrl,
    redirect: true,
  });
}

export function onCrossTabLogout(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: StorageEvent) => {
    if (event.key === LOGOUT_EVENT_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("storage", listener);
  };
}
