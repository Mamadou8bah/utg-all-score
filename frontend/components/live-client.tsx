"use client";

import { useState } from "react";
import { LiveMatchCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { type Match } from "@/lib/types";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import { MatchDetailsModal } from "@/components/match-details-modal";

export default function LiveClient() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { data: liveMatches, loading, error, reload } = useApiData<Match[]>("/api/live", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space space-y-2 pb-32">
      <PageHeader
        eyebrow="Live Scores"
        title="Live matches"
        description="Follow live scores and match events."
      />

      {liveMatches.length > 0 ? (
        <div className="grid gap-0">
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
          match={liveMatches.find((match) => match.id === selectedMatch.id) ?? selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
