"use client";

import { useState } from "react";
import { ResultCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { results, type Match } from "@/lib/data";
import { MatchDetailsModal } from "@/components/match-details-modal";

export default function ResultsClient() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="page-shell section-space space-y-8 pb-32">
      <PageHeader 
        eyebrow="Results" 
        title="Recent Match History" 
        description="Every goal, every celebrate, and every moment from the latest games." 
      />
      
      {results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((match) => (
            <ResultCard 
              key={match.id} 
              match={match} 
              onClick={() => setSelectedMatch(match)} 
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white/40">
          <p className="text-sm font-bold text-text-secondary">No recent results found.</p>
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