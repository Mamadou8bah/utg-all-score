import { EventCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { events } from "@/lib/data";

export default function EventsPage() {
  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Events" title="Campus sports calendar" description="Event cards for finals, showcases, media sessions, and official sports programming." />
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}
