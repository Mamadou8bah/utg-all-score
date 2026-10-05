"use client";
import { useLanguage } from "@/components/language-provider";

import { useState } from "react";
import { ResultCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { type Match } from "@/lib/types";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import { MatchDetailsModal } from "@/components/match-details-modal";

export default function ResultsClient() {
  const { t: translate } = useLanguage();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { data: results, loading, error, reload } = useApiData<Match[]>("/api/results", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space space-y-2 pb-32">
      <PageHeader
        eyebrow="Results"
        title={translate("Recent Match History")}
        description="Every goal, every celebrate, and every moment from the latest games."
      />

      {results.length > 0 ? (
        <div className="grid gap-0">
          {results.map((match) => (
            <ResultCard
              key={match.id}
              match={match}
              onClick={() => setSelectedMatch(match)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-slate-100">
          <p className="text-sm font-bold text-text-secondary">{translate("No recent results found.")}</p>
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
