import { redirect } from "next/navigation";
import { AUTH_REDIRECT_PATH } from "@/features/auth/constants";

export default async function ProgressPage() {
  redirect(`${AUTH_REDIRECT_PATH}/progress`);
}
