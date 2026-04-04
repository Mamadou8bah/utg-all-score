"use client";

import { useState, useMemo } from "react";
import { type Match, standings, results, fixtures } from "@/lib/data";
import { cn, formatTime, formatDate } from "@/lib/utils";
import { X, Calendar, MapPin, TrendingUp, Info, ListOrdered, History } from "lucide-react";
import { TeamDetailsModal } from "@/components/team-details-modal";

export const MatchDetailsModal = ({ 
  match, 
  onClose 
}: { 
  match: Match, 
  onClose: () => void 
}) => {
  const [activeTab, setActiveTab] = useState("Details");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const tabs = ["Details", "Stats", "Lineups", "H2H", "Standings"];

  const competitionStandings = useMemo(() => 
    standings.filter(s => s.competitionId === match.competitionId)
    .sort((a, b) => b.pts - a.pts),
    [match.competitionId]
  );

  const teamHistory = useMemo(() => {
    const allMatches = [...results, ...fixtures, ...[match]]
      .filter(m => m.home === match.home || m.away === match.home || m.home === match.away || m.away === match.away)
      .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());
    return allMatches.slice(0, 5);
  }, [match]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 md:items-center md:justify-center md:bg-slate-900/60 md:p-4">
      <div className="flex-1 w-full max-w-2xl bg-white flex flex-col md:rounded-[32px] md:overflow-hidden md:h-[85vh] animate-slideUp">
        {/* Header Section */}
        <div className="bg-primary px-4 pt-4 pb-0 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-white p-0.5 overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png" 
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/90">{match.competition}</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 pb-8">
            <button 
              onClick={() => setSelectedTeam(match.home)}
              className="flex flex-col items-center gap-2 flex-1 group active:scale-95 transition-transform"
            >
              <div className="h-16 w-16 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-2xl font-black">
                {match.home.charAt(0)}
              </div>
              <span className="text-sm font-black text-center">{match.home}</span>
            </button>

            <div className="flex flex-col items-center gap-1 mx-4">
              <div className="text-4xl font-black flex items-center gap-3">
                {match.status !== "UPCOMING" ? (
                  <>
                    <span>{match.homeScore}</span>
                    <span className="text-white/40">-</span>
                    <span>{match.awayScore}</span>
                  </>
                ) : (
                  <span className="text-2xl">{formatTime(match.kickoff)}</span>
                )}
              </div>
              {match.status === "LIVE" && (
                <div className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-black uppercase flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-white animate-flash" />
                  {match.timer}
                </div>
              )}
              {match.status === "FT" && (
                <span className="text-[10px] font-black uppercase opacity-60">Full Time</span>
              )}
            </div>

            <button 
              onClick={() => setSelectedTeam(match.away)}
              className="flex flex-col items-center gap-2 flex-1 group active:scale-95 transition-transform"
            >
              <div className="h-16 w-16 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-2xl font-black">
                {match.away.charAt(0)}
              </div>
              <span className="text-sm font-black text-center">{match.away}</span>
            </button>
          </div>

          {/* Tab Navigation (SofaScore Style) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 text-sm font-black transition-colors whitespace-nowrap border-b-2",
                  activeTab === tab 
                    ? "border-secondary text-white" 
                    : "border-transparent text-white/50 hover:text-white/80"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 relative">
          
          {/* Team Details Modal (Nested Overlay) */}
          {selectedTeam && (
            <TeamDetailsModal 
              teamName={selectedTeam} 
              onClose={() => setSelectedTeam(null)} 
            />
          )}

          {activeTab === "Details" && (
            <div className="p-4 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <Calendar size={18} className="text-primary" />
                  <span className="font-bold">{new Date(match.kickoff).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <MapPin size={18} className="text-primary" />
                  <span className="font-bold">{match.venue}</span>
                </div>
              </div>

              {match.events.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Match Events
                  </h3>
                  <div className="space-y-6">
                    {match.events.map((event, idx) => (
                      <div key={idx} className={cn(
                        "flex items-start gap-4 text-sm",
                        event.team === match.home ? "flex-row" : "flex-row-reverse"
                      )}>
                        <span className="font-black text-primary text-xs pt-1">{event.minute}'</span>
                        <div className={cn(
                          "flex flex-col",
                          event.team === match.home ? "items-start" : "items-end"
                        )}>
                          <span className="font-black text-slate-900">{event.player}</span>
                          <span className="text-xs text-text-secondary font-bold">{event.type} · {event.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-secondary" />
                  <span className="text-sm font-black text-slate-900">Venue Info</span>
                </div>
                <span className="text-xs font-bold text-text-secondary">UTG Law Building Field</span>
              </div>
            </div>
          )}

          {activeTab === "Stats" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="space-y-6">
                  {[
                    { label: "Possession", home: "45%", away: "55%", hVal: 45, aVal: 55 },
                    { label: "Attempts on goal", home: "12", away: "14", hVal: 12, aVal: 14 },
                    { label: "Shots on target", home: "4", away: "6", hVal: 4, aVal: 6 },
                    { label: "Corner kicks", home: "5", away: "3", hVal: 5, aVal: 3 },
                    { label: "Yellow cards", home: "2", away: "1", hVal: 2, aVal: 1 },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-text-secondary">
                        <span className="text-primary">{stat.home}</span>
                        <span>{stat.label}</span>
                        <span className="text-secondary">{stat.away}</span>
                      </div>
                      <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-1000" 
                          style={{ width: `${(stat.hVal / (stat.hVal + stat.aVal)) * 100}%` }} 
                        />
                        <div 
                          className="bg-secondary h-full transition-all duration-1000" 
                          style={{ width: `${(stat.aVal / (stat.hVal + stat.aVal)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <p className="text-[10px] font-black text-text-secondary uppercase">Live stats update in real-time</p>
              </div>
            </div>
          )}

          {activeTab === "H2H" && (
            <div className="space-y-4 pb-20">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                  <History size={14} /> Team Performance
                </h3>
                <div className="space-y-4">
                  {teamHistory.map((m, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-secondary uppercase">
                          {formatDate(m.kickoff, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className={cn("text-sm font-black", (m.homeScore || 0) > (m.awayScore || 0) ? "text-slate-950" : "text-slate-400")}>{m.home}</span>
                           <span className="text-xs font-black text-primary">{m.homeScore ?? "-"} : {m.awayScore ?? "-"}</span>
                           <span className={cn("text-sm font-black", (m.awayScore || 0) > (m.homeScore || 0) ? "text-slate-950" : "text-slate-400")}>{m.away}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Standings" && (
            <div className="space-y-4 pb-20">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  <div className="flex items-center gap-4">
                    <span className="w-4">#</span>
                    <span>Team</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-4 text-center">PL</span>
                    <span className="w-4 text-center">GD</span>
                    <span className="w-4 text-center text-primary">PTS</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {competitionStandings.map((team, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedTeam(team.team)}
                      className={cn(
                        "w-full px-4 py-3 flex items-center justify-between text-sm transition-colors hover:bg-slate-50",
                        (team.team === match.home || team.team === match.away) ? "bg-primary/5 font-black" : "font-bold text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-4 text-[10px] text-text-secondary">{idx + 1}</span>
                        <span className="truncate max-w-[120px]">{team.team}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="w-4 text-center opacity-60">{team.played}</span>
                        <span className="w-4 text-center opacity-60">{team.gd}</span>
                        <span className="w-4 text-center text-primary">{team.pts}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Lineups" && (
            <div className="space-y-4 pb-20">
              {match.lineups ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Home Team */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-6 w-6 bg-primary text-white text-[10px] font-black rounded flex items-center justify-center">
                         {match.home[0]}
                       </div>
                       <span className="text-xs font-black truncate">{match.home}</span>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-slate-50 pb-1">Starting XI</p>
                        {match.lineups.home.starting.map(p => (
                          <div key={p.number} className="flex items-center gap-3 text-xs">
                            <span className="w-4 font-black text-primary">{p.number}</span>
                            <span className="font-bold text-slate-900 truncate">{p.name}</span>
                            <span className="ml-auto text-[8px] font-black text-slate-300 uppercase">{p.role}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-slate-50 pb-1">Substitutes</p>
                        {match.lineups.home.subs.map(p => (
                          <div key={p.number} className="flex items-center gap-3 text-xs opacity-70">
                            <span className="w-4 font-black text-slate-400">{p.number}</span>
                            <span className="font-bold text-slate-600 truncate">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                       <span className="text-xs font-black truncate">{match.away}</span>
                       <div className="h-6 w-6 bg-secondary text-slate-950 text-[10px] font-black rounded flex items-center justify-center">
                         {match.away[0]}
                       </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-slate-50 pb-1 text-right">Starting XI</p>
                        {match.lineups.away.starting.map(p => (
                          <div key={p.number} className="flex items-center gap-3 text-xs flex-row-reverse">
                            <span className="w-4 font-black text-secondary text-right">{p.number}</span>
                            <span className="font-bold text-slate-900 truncate text-right">{p.name}</span>
                            <span className="mr-auto text-[8px] font-black text-slate-300 uppercase">{p.role}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-slate-50 pb-1 text-right">Substitutes</p>
                        {match.lineups.away.subs.map(p => (
                          <div key={p.number} className="flex items-center gap-3 text-xs opacity-70 flex-row-reverse">
                            <span className="w-4 font-black text-slate-400 text-right">{p.number}</span>
                            <span className="font-bold text-slate-600 truncate text-right">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white rounded-3xl">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <TrendingUp size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900">Lineups Pending</h4>
                    <p className="text-xs text-text-secondary font-bold">Starting XIs will be released 60 minutes before kickoff.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
