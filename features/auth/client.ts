import { signIn } from "next-auth/react";
import { AUTH_REDIRECT_PATH } from "./constants";

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
