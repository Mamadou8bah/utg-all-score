"use client";

import { useState, useMemo } from "react";
import { Badge, Button, Tabs } from "@/components/ui";
import { X, Trophy, CalendarDays, LayoutGrid, Info, ChevronRight, Share2 } from "lucide-react";
import { 
  standings, 
  competitions, 
  fixtures, 
  results, 
  competitionGroups,
  type Competition, 
  type Match, 
  type StandingRow 
} from "@/lib/data";
import { StandingsTable, FixtureCard, ResultCard } from "@/components/cards";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { MatchDetailsModal } from "@/components/match-details-modal";

export const CompetitionDetailsModal = ({ 
  competition, 
  onClose 
}: { 
  competition: Competition; 
  onClose: () => void 
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  if (!competition) return null;

  const compStandings = standings.filter(s => s.competitionId === competition.id);
  const compFixtures = fixtures.filter(f => f.competitionId === competition.id);
  const compResults = results.filter(r => r.competitionId === competition.id);
  const groups = competitionGroups[competition.id];

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
          <Tabs 
            variant="pwa"
            tabs={[
              {
                id: "standings",
                label: "Standings",
                content: (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 sm:space-y-8">
                    {competition.format === "LEAGUE" ? (
                      <div className="space-y-3 sm:space-y-4">
                        <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Official League Hierarchy</h2>
                        <StandingsTable 
                          rows={compStandings} 
                          onTeamClick={(name) => setSelectedTeam(name)}
                        />
                      </div>
                    ) : groups ? (
                      <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
                        {groups.map((group) => (
                           <div key={group.name} className="space-y-3 sm:space-y-4">
                              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{group.name}</h2>
                              <StandingsTable 
                                rows={compStandings.filter(s => group.teams.includes(s.team))}
                                onTeamClick={(name) => setSelectedTeam(name)}
                              />
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[32px] border border-dashed border-slate-200 p-12 text-center bg-white/50">
                        <LayoutGrid size={40} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Bracket generation in progress</p>
                      </div>
                    )}

                    {/* Promotion/Relegation Legend */}
                    <div className="grid gap-3 px-1 sm:flex sm:items-center sm:gap-6">
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-text-secondary opacity-70 uppercase tracking-widest">Champions League</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          <span className="text-[10px] font-bold text-text-secondary opacity-70 uppercase tracking-widest">Qualification Playoff</span>
                       </div>
                    </div>
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
                           {compFixtures.map(match => (
                             <FixtureCard 
                                key={match.id} 
                                match={match} 
                                onClick={() => setSelectedMatch(match)}
                             />
                           ))}
                         </div>
                      </section>
                    )}

                    {compResults.length > 0 && (
                      <section className="space-y-4">
                         <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Concluded Results</h2>
                         <div className="grid gap-3">
                           {compResults.map(match => (
                             <ResultCard 
                                key={match.id} 
                                match={match} 
                                onClick={() => setSelectedMatch(match)}
                             />
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
                         <h2 className="text-xl font-black text-slate-950 mb-4">About this competition</h2>
                         <p className="text-sm leading-8 font-medium text-slate-600 mb-6">
                           {competition.description} This annual event remains the most prestigious athletic gathering at the University of The Gambia. Managed by AllScore, the 2026 season introduces digital match oversight and live data verification for the first time.
                         </p>
                         <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                            <div className="rounded-2xl bg-slate-50 p-4">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reigning Champ</p>
                               <p className="font-black text-slate-950">School of ICT</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Record Goals</p>
                               <p className="font-black text-slate-950">42 (2024 Season)</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )
              }
            ]}
          />
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
