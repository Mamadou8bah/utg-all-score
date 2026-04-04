import { AnnouncementCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { announcements } from "@/lib/data";

export default function AnnouncementsPage() {
  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Announcements" title="Operational updates and notices" description="A focused list for urgent changes, venue updates, and verified administrative communication." />
      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((item) => <AnnouncementCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
