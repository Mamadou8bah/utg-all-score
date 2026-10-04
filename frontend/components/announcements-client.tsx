"use client";

import { AnnouncementCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import type { AnnouncementItem } from "@/lib/types";

export default function AnnouncementsClient() {
  const { data: announcements, loading, error, reload } = useApiData<AnnouncementItem[]>("/api/announcements", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Announcements" title="Football notices" description="Venue changes, results windows, and official sports communication." />
      {!announcements.length ? <p className="empty-state">No announcements published yet.</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((item) => <AnnouncementCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
