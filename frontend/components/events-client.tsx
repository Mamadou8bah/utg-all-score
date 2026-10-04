"use client";

import { EventCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import type { FootballEventItem } from "@/lib/types";

export default function EventsClient() {
  const { data: events, loading, error, reload } = useApiData<FootballEventItem[]>("/api/events", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space">
      <PageHeader eyebrow="Football Calendar" title="Football events" description="Finals, knockout rounds, and official football programming." />
      {!events.length ? <p className="empty-state">No events scheduled yet.</p> : null}
      <div className="reference-list">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}
