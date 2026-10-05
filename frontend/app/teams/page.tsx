"use client";
import { useLanguage } from "@/components/language-provider";

import { useState } from "react";
import { DataFeedback } from "@/components/data-feedback";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { useApiData } from "@/lib/use-api-data";
import type { TeamProfile } from "@/lib/types";
export default function TeamsPage() {
  const { t: translate } = useLanguage();
  const { data: teams, loading, error, reload } = useApiData<TeamProfile[]>("/api/teams", []);
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="page-shell section-space"><h1 className="page-title">{translate("Teams")}</h1>
    {loading || error ? <DataFeedback loading={loading} error={error} onRetry={reload} /> : teams.length ? [...teams].sort((a,b) => a.name.localeCompare(b.name)).map(t => <button type="button" className="list-item" key={t.name} onClick={() => setSelected(t.name)}>{t.logo ? <img className="list-crest" src={t.logo} alt="" /> : <span className="crest crest--home">{t.name[0]}</span>}<div><div className="list-item__title">{t.name}</div>{t.tone ? <div className="list-item__meta">{t.tone}</div> : null}</div></button>) : <div className="empty-state">{translate("No teams registered yet.")}</div>}
    {selected ? <TeamDetailsModal teamName={selected} onClose={() => setSelected(null)} /> : null}
  </div>;
}
