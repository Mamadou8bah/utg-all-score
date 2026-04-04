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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl overflow-hidden bg-slate-50 shadow-2xl animate-in slide-in-from-bottom-full duration-300 sm:rounded-[40px] h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white px-6 py-6 shadow-sm sm:px-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-50 ring-1 ring-slate-100">
                {competition.logo ? (
                  <img src={competition.logo} alt="" className="h-12 w-12 object-contain" />
                ) : (
                  <Trophy size={32} className="text-slate-200" />
                )}
              </div>
              <div>
                <Badge variant="default" className="mb-1 text-[9px] font-black tracking-[0.2em] bg-primary/10 text-primary border-none">
                  {competition.type === "GENERAL" ? "Official University Athletics" : competition.schoolName}
                </Badge>
                <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                  {competition.name}
                </h1>
                <p className="text-xs font-bold text-text-secondary mt-1 flex items-center gap-2">
                   UTG AllScore Verified 
                   <span className="h-1 w-1 rounded-full bg-slate-300" />
                   2026 Season
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 title="Share Competition"
                 className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
               >
                  <Share2 size={18} />
               </button>
               <button 
                  onClick={onClose}
                  title="Close Modal"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  <X size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 px-6 py-6 sm:px-10">
          <Tabs 
            variant="pwa"
            tabs={[
              {
                id: "standings",
                label: "Standings",
                content: (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {competition.format === "LEAGUE" ? (
                      <div className="space-y-4">
                        <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Official League Hierarchy</h2>
                        <StandingsTable 
                          rows={compStandings} 
                          onTeamClick={(name) => setSelectedTeam(name)}
                        />
                      </div>
                    ) : groups ? (
                      <div className="grid gap-8 sm:grid-cols-2">
                        {groups.map((group) => (
                           <div key={group.name} className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6 px-1">
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
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
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
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-2xl px-1">
                      <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100">
                         <h2 className="text-xl font-black text-slate-950 mb-4">About this competition</h2>
                         <p className="text-sm leading-8 font-medium text-slate-600 mb-6">
                           {competition.description} This annual event remains the most prestigious athletic gathering at the University of The Gambia. Managed by AllScore, the 2026 season introduces digital match oversight and live data verification for the first time.
                         </p>
                         <div className="grid grid-cols-2 gap-4">
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
