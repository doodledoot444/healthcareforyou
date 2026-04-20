import { redirect } from "next/navigation";
import { AUTH_REDIRECT_PATH } from "@/features/auth/constants";

export default async function ProfilePage() {
  redirect(`${AUTH_REDIRECT_PATH}/profile`);
}
