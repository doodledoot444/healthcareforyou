import { redirect } from "next/navigation";
import { AUTH_REDIRECT_PATH } from "@/features/auth/constants";

export default async function AchievementsPage() {
  redirect(`${AUTH_REDIRECT_PATH}/achievements`);
}
