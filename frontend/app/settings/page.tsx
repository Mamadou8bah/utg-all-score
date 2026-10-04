import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotificationSettings } from "@/components/ui";

export const metadata = { title: "Settings | UTG AllScore" };

export default function SettingsPage() {
  return <div className="page-shell section-space">
    <div className="page-heading">
      <Link href="/more" className="inline-flex min-h-11 items-center gap-2 text-sm" aria-label="Back to More"><ArrowLeft size={18} />More</Link>
      <h1>Settings</h1>
      <p className="mt-2 text-sm text-text-secondary">Manage AllScore on this device.</p>
    </div>
    <section className="reference-panel" aria-labelledby="notifications-title">
      <h2 id="notifications-title" className="text-xl font-bold text-primary">Notifications</h2>
      <p className="mb-5 mt-2 text-sm leading-6 text-text-secondary">Alerts for kickoff, half time, goals, full time, news, and announcements.</p>
      <NotificationSettings />
    </section>
  </div>;
}
