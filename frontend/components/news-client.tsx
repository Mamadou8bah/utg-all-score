"use client";

import { useState } from "react";
import { NewsCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import { NewsDetailsModal } from "@/components/news-details-modal";

export default function NewsClient() {
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const { data: newsItems, loading, error, reload } = useApiData<any[]>("/api/news", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space space-y-3">
      <PageHeader
        eyebrow="News"
        title="News"
        description="Match reports, campus stories, and official updates."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {newsItems.length === 0 ? <p className="empty-state">No news published yet.</p> : null}
        {newsItems.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            onClick={() => setSelectedNews(item)}
          />
        ))}
      </div>

      {selectedNews && (
        <NewsDetailsModal
          item={selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </div>
  );
}
