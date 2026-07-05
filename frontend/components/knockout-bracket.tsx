"use client";

import type { KnockoutRound } from "@/lib/types";

export function KnockoutBracket({ rounds }: { rounds: KnockoutRound[] }) {
  if (!rounds.length) {
    return (
      <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Knockout bracket not scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      {rounds.map((round) => (
        <div key={round.round} className="space-y-3">
          <h3 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{round.round}</h3>
          <div className="space-y-2">
            {round.matches.map((match) => (
              <div key={match.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-950">
                  <span className="truncate">{match.home}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {match.status === "UPCOMING" ? "vs" : `${match.homeScore} - ${match.awayScore}`}
                  </span>
                  <span className="truncate text-right">{match.away}</span>
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  {match.status}{match.status === "LIVE" ? "" : ` · ${new Date(match.kickoff).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
