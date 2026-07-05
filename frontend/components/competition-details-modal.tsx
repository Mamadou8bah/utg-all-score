"use client";

import { useState, useMemo } from "react";
import { Badge, Button, Tabs } from "@/components/ui";
import { X, Trophy, CalendarDays, LayoutGrid, Info, ChevronRight, Share2 } from "lucide-react";
import { 
  type Competition, 
  type Match, 
  type StandingRow 
} from "@/lib/types";
import { useCompetitionsBundle, useFootballBundle } from "@/lib/use-api-data";
import { StandingsTable, FixtureCard, ResultCard } from "@/components/cards";
import { KnockoutBracket } from "@/components/knockout-bracket";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { MatchDetailsModal } from "@/components/match-details-modal";

export const CompetitionDetailsModal = ({ 
  competition, 
  onClose 
}: { 
  competition: Competition; 
  onClose: () => void 
}) => {
  const { standings, fixtures, results } = useFootballBundle();
  const { groups: competitionGroups, brackets, stats: competitionStats } = useCompetitionsBundle();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  if (!competition) return null;

  const allCompStandings = standings.filter((s) => s.competitionId === competition.id);
  const leagueStandings = allCompStandings.filter((s) => !s.groupKey || s.groupKey === "");
  const compFixtures = fixtures.filter(f => f.competitionId === competition.id);
  const compResults = results.filter(r => r.competitionId === competition.id);
  const groups = competitionGroups[competition.id];
  const bracket = brackets[competition.id];
  const compStats = competitionStats[competition.id];

  const tabs = useMemo(() => {
    const base = [
      {
        id: "standings",
        label: "Standings",
        content: (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 sm:space-y-8">
            {competition.format === "LEAGUE" ? (
              <div className="space-y-3 sm:space-y-4">
                <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Official League Hierarchy</h2>
                <StandingsTable rows={leagueStandings} onTeamClick={(name) => setSelectedTeam(name)} />
              </div>
            ) : groups ? (
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
                {groups.map((group) => (
                  <div key={group.id} className="space-y-3 sm:space-y-4">
                    <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{group.name}</h2>
                    <StandingsTable rows={allCompStandings.filter((s) => s.groupKey === group.id)} onTeamClick={(name) => setSelectedTeam(name)} />
                  </div>
                ))}
              </div>
            ) : (
              <StandingsTable rows={leagueStandings} onTeamClick={(name) => setSelectedTeam(name)} />
            )}
          </div>
        )
      },
      {
        id: "matches",
        label: "Schedule",
        content: (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 sm:space-y-8">
            {compFixtures.length > 0 && (
              <section className="space-y-4">
                <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Upcoming Fixtures</h2>
                <div className="grid gap-3">
                  {compFixtures.map((match) => (
                    <FixtureCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
                  ))}
                </div>
              </section>
            )}
            {compResults.length > 0 && (
              <section className="space-y-4">
                <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Concluded Results</h2>
                <div className="grid gap-3">
                  {compResults.map((match) => (
                    <ResultCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      },
      {
        id: "info",
        label: "History",
        content: (
          <div className="max-w-2xl space-y-6 px-1 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:rounded-[32px] sm:p-8">
              <h2 className="mb-4 text-xl font-black text-slate-950">About this competition</h2>
              <p className="mb-6 text-sm font-medium leading-8 text-slate-600">{competition.description}</p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {compStats?.leaderLabel ?? "Current Leader"}
                  </p>
                  <p className="font-black text-slate-950">{compStats?.reigningChampion ?? "TBD"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Top Scorer</p>
                  <p className="font-black text-slate-950">
                    {compStats?.topScorer
                      ? `${compStats.topScorer.name} (${compStats.topScorer.goals})`
                      : "TBD"}
                  </p>
                  {compStats?.topScorer ? (
                    <p className="mt-1 text-xs font-medium text-text-secondary">{compStats.topScorer.team}</p>
                  ) : null}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Highest Scoring Match</p>
                  <p className="font-black text-slate-950">
                    {compStats?.highestScoringMatch
                      ? `${compStats.highestScoringMatch.totalGoals} goals`
                      : "TBD"}
                  </p>
                  {compStats?.highestScoringMatch ? (
                    <p className="mt-1 text-xs font-medium text-text-secondary">
                      {compStats.highestScoringMatch.home} vs {compStats.highestScoringMatch.away}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Season Totals</p>
                  <p className="font-black text-slate-950">{compStats?.totalGoals ?? 0} goals</p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {compStats?.matchesPlayed ?? 0} matches · {compStats?.teamCount ?? 0} teams
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ];

    if (competition.format === "TOURNAMENT") {
      base.splice(1, 0, {
        id: "knockout",
        label: "Knockout",
        content: (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            {bracket?.length ? (
              <KnockoutBracket rounds={bracket} />
            ) : (
              <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/50 p-12 text-center">
                <LayoutGrid size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Knockout rounds not scheduled yet</p>
              </div>
            )}
          </div>
        )
      });
    }

    return base;
  }, [allCompStandings, bracket, compFixtures, compResults, compStats, competition, groups, leagueStandings]);

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-50 sm:items-center sm:bg-slate-950/40 sm:p-4 sm:backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-slate-50 shadow-2xl animate-in slide-in-from-bottom-full duration-300 sm:h-[92vh] sm:rounded-[40px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white px-4 py-4 shadow-sm sm:px-10 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100 sm:h-20 sm:w-20 sm:rounded-[24px]">
                {competition.logo ? (
                  <img src={competition.logo} alt="" className="h-9 w-9 object-contain sm:h-12 sm:w-12" />
                ) : (
                  <Trophy size={28} className="text-slate-200 sm:size-8" />
                )}
              </div>
              <div className="min-w-0">
                <Badge variant="default" className="mb-1 max-w-full truncate border-none bg-primary/10 text-[8px] font-black tracking-[0.14em] text-primary sm:text-[9px] sm:tracking-[0.2em]">
                  {competition.type === "GENERAL" ? "Official University Athletics" : competition.schoolName}
                </Badge>
                <h1 className="break-words text-xl font-black leading-tight text-slate-950 sm:text-3xl">
                  {competition.name}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold text-text-secondary sm:text-xs">
                   UTG AllScore Verified 
                   <span className="h-1 w-1 rounded-full bg-slate-300" />
                   2026 Season
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
               <button 
                 title="Share Competition"
                 className="hidden h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95 sm:flex"
               >
                  <Share2 size={18} />
               </button>
               <button 
                  onClick={onClose}
                  title="Close Modal"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl transition-all hover:bg-slate-800 active:scale-95 sm:h-11 sm:w-11"
                >
                  <X size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-10 sm:py-6">
          <Tabs variant="pwa" tabs={tabs} />
        </div>

        {/* Nested Team Modal */}
        {selectedTeam && (
          <TeamDetailsModal 
            teamName={selectedTeam} 
            onClose={() => setSelectedTeam(null)} 
          />
        )}

        {/* Nested Match Modal */}
        {selectedMatch && (
          <MatchDetailsModal 
            match={selectedMatch} 
            onClose={() => setSelectedMatch(null)} 
          />
        )}
      </div>
    </div>
  );
};
