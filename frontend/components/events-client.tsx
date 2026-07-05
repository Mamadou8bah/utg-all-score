"use client";

import { EventCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { useApiData } from "@/lib/use-api-data";
import type { FootballEventItem } from "@/lib/types";

export default function EventsClient() {
  const { data: events } = useApiData<FootballEventItem[]>("/api/events", []);

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Football Calendar" title="Football events" description="Finals, knockout rounds, and official football programming." />
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}
