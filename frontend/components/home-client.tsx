"use client";
import { useLanguage } from "@/components/language-provider";

import { useMemo, useState } from "react";
import { CompetitionDetailsModal } from "@/components/competition-details-modal";
import { isSameDay } from "date-fns";
import { DataFeedback } from "@/components/data-feedback";
import { MatchRow } from "@/components/cards";
import { DatePickerTimeline } from "@/components/date-picker-timeline";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { useApiData, useCompetitionsBundle } from "@/lib/use-api-data";
import type { Competition, Match } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomeClient() {
  const { t: translate } = useLanguage();
  const { data: fixtures, loading: fixturesLoading, error: fixturesError, reload: reloadFixtures } = useApiData<Match[]>("/api/fixtures", []);
  const { data: results, loading: resultsLoading, error: resultsError, reload: reloadResults } = useApiData<Match[]>("/api/results", []);
  const { data: live, loading: liveLoading, error: liveError, reload: reloadLive } = useApiData<Match[]>("/api/live", []);
  const { competitions, error: competitionsError, reload: reloadCompetitions } = useCompetitionsBundle();
  const [date, setDate] = useState(new Date());
  const [filter, setFilter] = useState("all");
  const [scope, setScope] = useState("all");
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const error = fixturesError || resultsError || liveError || competitionsError;
  const reload = () => { reloadFixtures(); reloadResults(); reloadLive(); reloadCompetitions(); };
  const loading = fixturesLoading || resultsLoading || liveLoading;

  const groups = useMemo(() => {
    const matches = new Map([...results, ...fixtures, ...live].map((match) => [match.id, match]));
    const grouped = new Map<string, Match[]>();
    for (const match of matches.values()) {
      const competition = competitions.find((comp) => comp.id === match.competitionId);
      if (!isSameDay(new Date(match.kickoff), date)) continue;
      if (filter === "live" && match.status !== "LIVE" && match.status !== "HT") continue;
      if (filter === "upcoming" && match.status !== "UPCOMING") continue;
      if (filter === "results" && match.status !== "FT") continue;
      if (scope !== "all" && competition?.type !== scope) continue;
      grouped.set(match.competitionId, [...(grouped.get(match.competitionId) || []), match]);
    }
    const order = { LIVE: 0, HT: 1, UPCOMING: 2, FT: 3 };
    return [...grouped.entries()].map(([id, matches]) => ({
      id, name: matches[0].competition,
      matches: matches.sort((a, b) => order[a.status] - order[b.status] || new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [fixtures, results, live, competitions, date, filter, scope]);

  return (
    <div className="page-shell match-centre">
      <div className="secondary-strip no-scrollbar" role="group" aria-label={translate("Filter matches")}>
        {[["all", "All"], ["live", "Live"], ["upcoming", "Upcoming"], ["results", "Results"]].map(([value, label]) => (
          <button key={value} type="button" className={cn("filter-chip", filter === value && "filter-chip--active")}
            aria-pressed={filter === value} onClick={() => setFilter(value)}>{translate(label)}</button>
        ))}
        <span className="filter-divider" aria-hidden="true" />
        {[["all", "All leagues"], ["GENERAL", "University"], ["SCHOOL", "Schools"]].map(([value, label]) => (
          <button key={value} type="button" className={cn("filter-chip", scope === value && "filter-chip--active")}
            aria-pressed={scope === value} onClick={() => setScope(value)}>{translate(label)}</button>
        ))}
      </div>
      <DatePickerTimeline selectedDate={date} onDateChange={setDate} />
      {loading || error ? <DataFeedback loading={loading} error={error} onRetry={reload} /> : groups.length === 0 ? (
        <div className="empty-state">{translate("No fixtures for this day with the current filters.")}</div>
      ) : groups.map((group) => (
        <section key={group.id} className="league-group" aria-label={group.name}>
          <button type="button" className="league-group__header" onClick={() => setSelectedCompetition(competitions.find((competition) => competition.id === group.id) ?? null)}>
            <span>{group.name}</span><span className="league-group__meta">{group.matches.length} {translate(group.matches.length === 1 ? "match" : "matches")}</span>
          </button>
          {group.matches.map((match) => <MatchRow key={match.id} match={match} onClick={() => setSelectedMatch(match)} />)}
        </section>
      ))}
      {selectedCompetition ? <CompetitionDetailsModal competition={selectedCompetition} onClose={() => setSelectedCompetition(null)} /> : null}
      {selectedMatch ? <MatchDetailsModal match={[...live, ...fixtures, ...results].find((match) => match.id === selectedMatch.id) ?? selectedMatch} onClose={() => setSelectedMatch(null)} /> : null}
    </div>
  );
}
