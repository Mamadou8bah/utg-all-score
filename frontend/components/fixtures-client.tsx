"use client";

import { useState } from "react";
import { FixtureCard, ResultCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { fixtures, results, type Match } from "@/lib/data";
import { MatchDetailsModal } from "@/components/match-details-modal";

export default function FixturesClient() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader 
        eyebrow="Fixtures" 
        title="Past & Upcoming Fixtures" 
        description="Track completed fixtures and upcoming games in one place." 
      />
      
      {results.length > 0 || fixtures.length > 0 ? (
        <div className="space-y-8">
          {results.length > 0 && (
            <section className="space-y-3">
              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Past Fixtures</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.map((match) => (
                  <ResultCard
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </section>
          )}

          {fixtures.length > 0 && (
            <section className="space-y-3">
              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Upcoming Fixtures</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fixtures.map((match) => (
                  <FixtureCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => setSelectedMatch(match)} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white/40">
          <p className="text-sm font-bold text-text-secondary">No fixtures found.</p>
        </div>
      )}

      {selectedMatch && (
        <MatchDetailsModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}