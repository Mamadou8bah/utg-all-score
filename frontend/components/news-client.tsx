"use client";

import { useState } from "react";
import { NewsCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { newsItems } from "@/lib/data";
import { NewsDetailsModal } from "@/components/news-details-modal";

export default function NewsClient() {
  const [selectedNews, setSelectedNews] = useState<any>(null);

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader 
        eyebrow="News" 
        title="Official sports newsroom" 
        description="A lightweight reading experience for reports, features, and platform news." 
      />
      
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
