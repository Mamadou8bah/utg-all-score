"use client";

import { AnnouncementCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { useApiData } from "@/lib/use-api-data";
import type { AnnouncementItem } from "@/lib/types";

export default function AnnouncementsClient() {
  const { data: announcements } = useApiData<AnnouncementItem[]>("/api/announcements", []);

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Announcements" title="UTGSU football notices" description="Venue changes, results windows, and official UTGSU sports communication." />
      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((item) => <AnnouncementCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
