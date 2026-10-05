"use client";
import { useLanguage } from "@/components/language-provider";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DetailDialog } from "@/components/detail-dialog";
import { DataFeedback } from "@/components/data-feedback";
import { MatchRow, StandingsTable } from "@/components/cards";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { KnockoutBracket } from "@/components/knockout-bracket";
import { useApiData, useCompetitionsBundle } from "@/lib/use-api-data";
import type { Competition, Match, StandingRow } from "@/lib/types";

export function CompetitionDetailsModal({ competition, onClose }: { competition: Competition; onClose: () => void }) {
  const { t: translate } = useLanguage();
  const [tab, setTab] = useState("Fixtures");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const fixtures = useApiData<Match[]>("/api/fixtures", []);
  const results = useApiData<Match[]>("/api/results", []);
  const live = useApiData<Match[]>("/api/live", []);
  const table = useApiData<StandingRow[]>("/api/standings", []);
  const extras = useCompetitionsBundle([], {}, {}, {}, { includeExtras: true });
  const matches = useMemo(() => [...new Map([...results.data, ...fixtures.data, ...live.data].map(m => [m.id,m])).values()].filter(m => m.competitionId === competition.id).sort((a,b) => a.kickoff.localeCompare(b.kickoff)), [results.data, fixtures.data, live.data, competition.id]);
  const rows = table.data.filter(r => r.competitionId === competition.id);
  const groupOptions = competition.format === "TOURNAMENT"
    ? (extras.groups[competition.id] ?? []).map(group => ({ id: group.id, name: group.name }))
    : [];
  const visibleGroups = groupOptions.length ? groupOptions : [...new Set(rows.map(r => r.groupKey || ""))].map(id => ({ id, name: id }));
  const activeGroup = selectedGroup || visibleGroups[0]?.id || "";
  const leaders = useMemo(() => {
    const map = new Map<string, { player: string; team: string; goals: number; assists: number; yellow: number; red: number }>();
    for (const m of matches) for (const e of m.events || []) {
      const rawType = e.type.toLowerCase();
      const type = /yellow/.test(rawType) ? "yellow" : /red/.test(rawType) ? "red" : /assist/.test(rawType) ? "assist" : /goal/.test(rawType) && !/own/.test(rawType) ? "goal" : rawType;
      if (!e.player || !["goal", "assist", "yellow", "red"].includes(type)) continue;
      const key = `${e.team}:${e.player}`;
      const row = map.get(key) || { player: e.player, team: e.team, goals: 0, assists: 0, yellow: 0, red: 0 };
      if (type === "goal") row.goals++; if (type === "assist") row.assists++; if (type === "yellow") row.yellow++; if (type === "red") row.red++;
      map.set(key, row);
    }
    return [...map.values()];
  }, [matches]);
  const feedLoading = fixtures.loading || results.loading || live.loading;
  const feedError = fixtures.error || results.error || live.error;
  const retry = () => { fixtures.reload(); results.reload(); live.reload(); };
  const metric = tab === "Scorers" ? "goals" : tab === "Assists" ? "assists" : "yellow";
  const ranked = leaders.filter(r => tab === "Cards" ? r.yellow + r.red > 0 : r[metric] > 0).sort((a,b) => tab === "Cards" ? (b.yellow + b.red) - (a.yellow + a.red) : b[metric] - a[metric]);
  const tabs = ["Fixtures", "Table", "Scorers", "Assists", "Cards", ...(competition.format === "TOURNAMENT" ? ["Knockout"] : [])];
  return <DetailDialog label={competition.name} onClose={onClose} className="reference-detail fixed inset-0 z-[100]">
    <div className="reference-detail__frame">
      <header className="detail-topline"><button type="button" aria-label={translate("Close competition details")} onClick={onClose}><ArrowLeft size={20} /></button><h1>{competition.name}</h1></header>
      <p className="detail-subtitle">{translate(competition.type === "GENERAL" ? "University" : competition.schoolName || "School")} · {translate(competition.format === "LEAGUE" ? "League" : "Tournament")}</p>
      <div className="sub-tabs" role="group" aria-label={translate("Competition sections")}>{tabs.map(t => <button type="button" key={t} className={`sub-tab${tab === t ? " sub-tab--active" : ""}`} aria-pressed={tab === t} onClick={() => setTab(t)}>{translate(t)}</button>)}</div>
      <div className="reference-detail__body">
        {tab === "Table" ? table.loading || table.error ? <DataFeedback loading={table.loading} error={table.error} onRetry={table.reload} /> : rows.length ? <div className="space-y-4">{visibleGroups.length > 1 ? <div className="sub-tabs" role="tablist" aria-label={translate("Groups")}>{visibleGroups.map(group => <button type="button" role="tab" key={group.id} aria-selected={activeGroup === group.id} className={`sub-tab${activeGroup === group.id ? " sub-tab--active" : ""}`} onClick={() => setSelectedGroup(group.id)}>{translate(group.name)}</button>)}</div> : null}<StandingsTable rows={rows.filter(row => (row.groupKey || "") === activeGroup)} onTeamClick={setSelectedTeam} /></div> : <div className="empty-state">{translate("No standings recorded yet.")}</div> : tab === "Knockout" ? extras.loading || extras.error ? <DataFeedback loading={extras.loading} error={extras.error} onRetry={extras.reload} /> : extras.brackets[competition.id]?.length ? <KnockoutBracket rounds={extras.brackets[competition.id]} /> : <div className="empty-state">{translate("Knockout rounds not scheduled yet.")}</div> : feedLoading || feedError ? <DataFeedback loading={feedLoading} error={feedError} onRetry={retry} /> : tab === "Fixtures" ? matches.length ? matches.map(m => <MatchRow key={m.id} match={m} onClick={() => setSelectedMatch(m)} />) : <div className="empty-state">{translate("No fixtures scheduled yet.")}</div> : ranked.length ? ranked.map((r,i) => <button type="button" key={`${r.team}:${r.player}`} className="list-item scorer-row" onClick={() => setSelectedTeam(r.team)}><span className="scorer-rank">{i + 1}</span><div><div className="list-item__title">{r.player}</div><div className="list-item__meta">{r.team}</div></div><strong className="scorer-total">{translate(tab === "Cards" ? `${r.yellow} yellow · ${r.red} red` : r[metric])}</strong></button>) : <div className="empty-state">{translate(`No ${tab.toLowerCase()} recorded yet.`)}</div>}
      </div>
    </div>
    {selectedMatch ? <MatchDetailsModal match={matches.find(m => m.id === selectedMatch.id) || selectedMatch} onClose={() => setSelectedMatch(null)} /> : null}
    {selectedTeam ? <TeamDetailsModal teamName={selectedTeam} onClose={() => setSelectedTeam(null)} /> : null}
  </DetailDialog>;
}
