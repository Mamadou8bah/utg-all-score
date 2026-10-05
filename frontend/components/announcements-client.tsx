"use client";
import { useLanguage } from "@/components/language-provider";

import { AnnouncementCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import type { AnnouncementItem } from "@/lib/types";

export default function AnnouncementsClient() {
  const { t: translate } = useLanguage();
  const { data: announcements, loading, error, reload } = useApiData<AnnouncementItem[]>("/api/announcements", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space">
      <PageHeader eyebrow="Announcements" title={translate("Football notices")} description="Venue changes, results windows, and official sports communication." />
      {!announcements.length ? <p className="empty-state">{translate("No announcements published yet.")}</p> : null}
      <div className="reference-list">
        {announcements.map((item) => <AnnouncementCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
