import { redirect } from "next/navigation";

export default function LegacyLoginRedirect() {
  redirect(process.env.ADMIN_APP_URL ?? "http://localhost:3001/login");
}
