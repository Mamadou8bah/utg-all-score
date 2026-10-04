"use client";

import { AthleteHighlightCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useApiData } from "@/lib/use-api-data";
import type { AthleteProfile } from "@/lib/types";

export default function AthletesClient() {
  const { data: athletes, loading, error, reload } = useApiData<AthleteProfile[]>("/api/athletes", []);

  if (loading || error) return <div className="page-shell"><DataFeedback loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page-shell section-space">
      <PageHeader eyebrow="Football Players" title="Top UTG football contributors" description="Goal scorers and playmakers from VC Tournament, Unity Shield, and school leagues." />
      {!athletes.length ? <p className="empty-state">No athletes published yet.</p> : null}
      <div className="reference-list">
        {athletes.map((athlete) => <AthleteHighlightCard key={athlete.id} athlete={athlete} />)}
      </div>
    </div>
  );
}
