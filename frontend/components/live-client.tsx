"use client";

import { useState } from "react";
import { LiveMatchCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { type Match } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";
import { MatchDetailsModal } from "@/components/match-details-modal";

export default function LiveClient() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { data: liveMatches } = useApiData<Match[]>("/api/live", []);

  return (
    <div className="page-shell section-space space-y-8 pb-32">
      <PageHeader 
        eyebrow="Live Scores" 
        title="Real-time Match Centre" 
        description="Focused scoreboards with timers, match events, and a high-contrast live treatment for quick scanning." 
      />
      
      {liveMatches.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {liveMatches.map((match) => (
            <LiveMatchCard 
              key={match.id} 
              match={match} 
              onClick={() => setSelectedMatch(match)} 
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-slate-100">
          <p className="text-sm font-bold text-text-secondary">No matches live right now.</p>
        </div>
      )}

      {selectedMatch && (
        <MatchDetailsModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}