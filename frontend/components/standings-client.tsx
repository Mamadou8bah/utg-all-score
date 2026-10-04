"use client";
import { useState } from "react";
import type { Competition } from "@/lib/types";
import { DataFeedback } from "@/components/data-feedback";
import { useCompetitionsBundle } from "@/lib/use-api-data";
import { CompetitionDetailsModal } from "@/components/competition-details-modal";

export default function StandingsClient() {
  const [selected, setSelected] = useState<Competition | null>(null);
  const { competitions, loading, error, reload } = useCompetitionsBundle();
  return <div className="page-shell section-space">
    <h1 className="page-title">Competitions</h1>
    {loading || error ? <DataFeedback loading={loading} error={error} onRetry={reload} /> : competitions.length ? [...competitions].sort((a,b) => a.name.localeCompare(b.name)).map(c => (
      <button type="button" key={c.id} className="list-item" onClick={() => setSelected(c)}>
        <div><div className="list-item__title">{c.name}</div><div className="list-item__meta">{c.type === "GENERAL" ? "University" : c.schoolName || "School"} · {c.format === "LEAGUE" ? "League" : "Tournament"}</div></div>
      </button>
    )) : <div className="empty-state">No competitions published yet.</div>}
    {selected ? <CompetitionDetailsModal competition={selected} onClose={() => setSelected(null)} /> : null}
  </div>;
}
