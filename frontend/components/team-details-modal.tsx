"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DetailDialog } from "@/components/detail-dialog";
import { DataFeedback } from "@/components/data-feedback";
import { MatchRow } from "@/components/cards";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { useFootballBundle } from "@/lib/use-api-data";
import type { Match } from "@/lib/types";

export function TeamDetailsModal({ teamName, onClose }: { teamName: string; onClose: () => void }) {
  const { results, fixtures, teams, athletes, loading, error, reload } = useFootballBundle();
  const [tab, setTab] = useState("Matches");
  const [selected, setSelected] = useState<Match | null>(null);
  const team = teams.find(t => t.name === teamName);
  const matches = [...new Map([...results,...fixtures].map(m => [m.id,m])).values()].filter(m => m.home === teamName || m.away === teamName).sort((a,b) => b.kickoff.localeCompare(a.kickoff));
  const players = athletes.filter(a => a.team === teamName);
  const form = matches.filter(m => m.status === "FT").slice(0,5).reverse().map(m => { const home = m.home === teamName; const score = home ? m.homeScore : m.awayScore; const against = home ? m.awayScore : m.homeScore; return score > against ? "W" : score < against ? "L" : "D"; });
  return <DetailDialog label={teamName} onClose={onClose} className="reference-detail fixed inset-0 z-[110]">
    <div className="reference-detail__frame">
      <header className="detail-topline"><button type="button" aria-label="Close team details" onClick={onClose}><ArrowLeft size={20} /></button><h1>{teamName}</h1></header>
      <div className="team-profile-heading">{team?.logo ? <img src={team.logo} alt="" /> : <span className="team-initial">{teamName[0]}</span>}<div><strong>{teamName}</strong><p className="list-item__meta">University football team</p></div></div>
      <div className="sub-tabs" role="group" aria-label="Team sections">{["Matches", "Squad", "Overview"].map(t => <button type="button" key={t} className={`sub-tab${tab === t ? " sub-tab--active" : ""}`} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="reference-detail__body">
        {loading || error ? <DataFeedback loading={loading} error={error} onRetry={reload} /> : tab === "Matches" ? matches.length ? matches.map(m => <MatchRow key={m.id} match={m} onClick={() => setSelected(m)} />) : <div className="empty-state">No matches recorded yet.</div> : tab === "Squad" ? players.length ? players.map(p => <article className="list-item" key={p.id}>{p.image ? <img className="player-thumbnail" src={p.image} alt="" /> : null}<div><div className="list-item__title">{p.name}</div><div className="list-item__meta">{p.role} · {p.statLine}</div></div></article>) : <div className="empty-state">No player profiles published yet.</div> : <><h2 className="panel-title">Recent form</h2><div className="reference-panel">{form.length ? <div className="team-form">{form.map((f,i) => <span key={i} data-result={f}>{f}</span>)}</div> : <p>No completed matches yet.</p>}</div><h2 className="panel-title">About</h2><div className="reference-panel">{team?.tone || "No team overview published yet."}</div></>}
      </div>
    </div>
    {selected ? <MatchDetailsModal match={selected} onClose={() => setSelected(null)} /> : null}
  </DetailDialog>;
}
