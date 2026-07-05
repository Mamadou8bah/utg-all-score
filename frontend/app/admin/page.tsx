import { redirect } from "next/navigation";

export default function LegacyAdminRedirect() {
  redirect(process.env.ADMIN_APP_URL ?? "http://localhost:3001");
}
