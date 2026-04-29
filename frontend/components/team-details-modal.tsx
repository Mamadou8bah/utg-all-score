"use client";

import { useMemo } from "react";
import { type Match, type StandingRow, results, fixtures, teams, athletes } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";
import { X, Trophy, Users, History, LayoutDashboard, Star } from "lucide-react";

export const TeamDetailsModal = ({ 
  teamName, 
  onClose 
}: { 
  teamName: string, 
  onClose: () => void 
}) => {
  const teamData = useMemo(() => teams.find(t => t.name === teamName), [teamName]);
  
  const teamMatches = useMemo(() => {
    const all = [...results, ...fixtures];
    return all.filter(m => m.home === teamName || m.away === teamName)
      .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());
  }, [teamName]);

  const squad = useMemo(() => athletes.filter(a => a.team === teamName), [teamName]);

  if (!teamData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header / Cover */}
        <div className="relative h-40 bg-slate-900 overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-10">
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
            <button className="p-2 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors">
              <Star size={20} />
            </button>
          </div>
          
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-center w-full px-6">
            <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl font-black text-slate-400 mb-2 border-4 border-slate-50">
              {teamData.logo ? (
                <img src={teamData.logo} alt="" className="h-full w-full object-contain p-2" />
              ) : (
                teamName[0]
              )}
            </div>
            <h2 className="text-xl font-black text-slate-950 truncate max-w-full">{teamName}</h2>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Official University Team</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-10 px-6 pb-24 space-y-6">
          
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-1 text-primary">
                 <Trophy size={14} />
                 <span className="text-[10px] font-black uppercase tracking-wider">Form</span>
               </div>
               <div className="flex gap-1.5">
                 {['W', 'D', 'W', 'W', 'L'].map((res, i) => (
                   <span key={i} className={cn(
                     "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white",
                     res === 'W' ? "bg-green-500" : res === 'D' ? "bg-amber-500" : "bg-red-500"
                   )}>{res}</span>
                 ))}
               </div>
            </div>
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-1 text-secondary">
                 <Users size={14} />
                 <span className="text-[10px] font-black uppercase tracking-wider">Players</span>
               </div>
               <span className="text-lg font-black text-slate-950">{squad.length || 18} Active</span>
            </div>
          </div>

          {/* About */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 flex items-center gap-2">
              <LayoutDashboard size={14} /> Overview
            </h3>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <p className="text-sm font-medium leading-relaxed text-text-secondary italic">
                "{teamData.tone || "Excellence in university sportsmanship."}"
              </p>
            </div>
          </section>

          {/* Schedule */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 flex items-center gap-2">
              <History size={14} /> Matches
            </h3>
            <div className="space-y-2">
              {teamMatches.slice(0, 4).map((m) => (
                <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase w-12">{formatDate(m.kickoff, { month: 'short', day: 'numeric' })}</span>
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <span className={cn("text-xs font-black truncate max-w-[80px]", m.home === teamName ? "text-primary" : "text-slate-400")}>{m.home}</span>
                    <span className="text-xs font-black text-slate-900">{m.status === 'FT' ? `${m.homeScore} : ${m.awayScore}` : "vs"}</span>
                    <span className={cn("text-xs font-black truncate max-w-[80px]", m.away === teamName ? "text-primary" : "text-slate-400")}>{m.away}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Squad */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 flex items-center gap-2">
              <Users size={14} /> Top Athletes
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
              {squad.map((ath) => (
                <div key={ath.id} className="min-w-[140px] bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-lg font-black text-slate-300">
                    {ath.name[0]}
                  </div>
                  <span className="text-sm font-black text-slate-950 truncate w-full text-center">{ath.name}</span>
                  <span className="text-[9px] font-bold text-primary uppercase mt-0.5">{ath.role}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
