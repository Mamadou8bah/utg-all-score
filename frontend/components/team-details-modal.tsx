"use client";
import { useLanguage } from "@/components/language-provider";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DetailDialog } from "@/components/detail-dialog";
import { DataFeedback } from "@/components/data-feedback";
import { MatchRow, StandingsTable } from "@/components/cards";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { useFootballBundle } from "@/lib/use-api-data";
import type { Match } from "@/lib/types";

export function TeamDetailsModal({ teamName, onClose }: { teamName: string; onClose: () => void }) {
  const { t: translate } = useLanguage();
  const { results, fixtures, teams, athletes, standings, loading, error, reload } = useFootballBundle();
  const [tab, setTab] = useState("Overview");
  const [selected, setSelected] = useState<Match | null>(null);
  const team = teams.find(t => t.name === teamName);
  const matches = [...new Map([...results,...fixtures].map(m => [m.id,m])).values()].filter(m => m.home === teamName || m.away === teamName).sort((a,b) => b.kickoff.localeCompare(a.kickoff));
  const players = athletes.filter(a => a.team === teamName);
  const form = matches.filter(m => m.status === "FT").slice(0,5).reverse().map(m => { const home = m.home === teamName; const score = home ? m.homeScore : m.awayScore; const against = home ? m.awayScore : m.homeScore; return score > against ? "W" : score < against ? "L" : "D"; });
  const teamStandings = standings.filter(row => row.team === teamName);
  return <DetailDialog label={teamName} onClose={onClose} className="reference-detail fixed inset-0 z-[110]">
    <div className="reference-detail__frame">
      <header className="detail-topline"><button type="button" aria-label={translate("Close team details")} onClick={onClose}><ArrowLeft size={20} /></button><h1>{teamName}</h1></header>
      <div className="team-profile-heading">{team?.logo ? <img src={team.logo} alt="" /> : <span className="team-initial">{teamName[0]}</span>}<div><strong>{teamName}</strong><p className="list-item__meta">{translate("University football team")}</p></div></div>
      <div className="sub-tabs" role="group" aria-label={translate("Team sections")}>{["Overview", "Fixtures", "Squad", "Table"].map(t => <button type="button" key={t} className={`sub-tab${tab === t ? " sub-tab--active" : ""}`} aria-pressed={tab === t} onClick={() => setTab(t)}>{translate(t)}</button>)}</div>
      <div className="reference-detail__body">
        {loading || error ? <DataFeedback loading={loading} error={error} onRetry={reload} /> : tab === "Fixtures" ? matches.length ? matches.map(m => <MatchRow key={m.id} match={m} onClick={() => setSelected(m)} />) : <div className="empty-state">{translate("No fixtures scheduled yet.")}</div> : tab === "Squad" ? players.length ? players.map(p => <article className="list-item" key={p.id}>{p.image ? <img className="player-thumbnail" src={p.image} alt="" /> : null}<div><div className="list-item__title">{p.name}</div><div className="list-item__meta">{translate(p.role)} · {translate(p.statLine)}</div></div></article>) : <div className="empty-state">{translate("No player profiles published yet.")}</div> : tab === "Table" ? teamStandings.length ? <div className="space-y-4">{[...new Set(teamStandings.map(row => row.competitionId))].map(competitionId => <section key={competitionId}><h2 className="panel-title">{competitionId}</h2><StandingsTable rows={standings.filter(row => row.competitionId === competitionId)} /></section>)}</div> : <div className="empty-state">{translate("No league table published yet.")}</div> : <><h2 className="panel-title">{translate("Recent results")}</h2><div className="reference-panel">{matches.filter(m => m.status === "FT").slice(0, 5).map(m => <MatchRow key={m.id} match={m} onClick={() => setSelected(m)} />)}{!matches.some(m => m.status === "FT") ? <p>{translate("No completed matches yet.")}</p> : null}</div><h2 className="panel-title">{translate("Recent form")}</h2><div className="reference-panel">{form.length ? <div className="team-form">{form.map((f,i) => <span key={i} data-result={f}>{translate(f)}</span>)}</div> : <p>{translate("No completed matches yet.")}</p>}</div><h2 className="panel-title">{translate("About")}</h2><div className="reference-panel">{translate(team?.tone || "No team overview published yet.")}</div></>}
      </div>
    </div>
    {selected ? <MatchDetailsModal match={selected} onClose={() => setSelected(null)} /> : null}
  </DetailDialog>;
}
