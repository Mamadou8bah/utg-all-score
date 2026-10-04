"use client";

import { useState } from "react";
import { NewsCard } from "@/components/cards";
import type { NewsItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import { NewsDetailsModal } from "@/components/news-details-modal";

export default function NewsClient() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const { data: newsItems, loading, error, reload } = useApiData<NewsItem[]>("/api/news", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  const sorted = [...newsItems].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const [featured, ...rest] = sorted;

  return (
    <div className="page-shell section-space space-y-3">
      <PageHeader
        eyebrow="News"
        title="News"
        description="Match reports, campus stories, and official updates."
      />

      {featured ? (
        <button type="button" className="news-featured" onClick={() => setSelectedNews(featured)}>
          {featured.image ? <img src={featured.image} alt="" /> : null}
          <span className="news-featured__content">
            <span className="news-featured__label">Latest story · {featured.category}</span>
            <h2>{featured.title}</h2>
            <span className="news-featured__meta">{formatDate(featured.publishedAt, { day: "numeric", month: "short" })}</span>
          </span>
        </button>
      ) : null}
      <div className="news-list">
        {newsItems.length === 0 ? <p className="empty-state">No news published yet.</p> : null}
        {rest.map((item) => (
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
