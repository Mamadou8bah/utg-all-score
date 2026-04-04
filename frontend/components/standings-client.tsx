"use client";

import { useMemo, useState } from "react";
import { competitions, type Competition } from "@/lib/data";
import { CompetitionDetailsModal } from "@/components/competition-details-modal";
import { ChevronRight, LayoutGrid, Trophy } from "lucide-react";

export default function StandingsClient() {
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

  const filteredCompetitions = useMemo(
    () => competitions.slice().sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const CompetitionListItem = ({ competition }: { competition: Competition }) => (
    <button
      onClick={() => setSelectedComp(competition)}
      className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-slate-50"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        {competition.logo ? (
          <img src={competition.logo} alt="" className="h-8 w-8 object-contain" />
        ) : (
          <LayoutGrid size={20} className="text-slate-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-slate-950">{competition.name}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em]">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">{competition.format}</span>
          <span className="text-slate-400">•</span>
          <span className="truncate text-text-secondary">
            {competition.type === "GENERAL" ? "University" : competition.schoolName}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-slate-300 transition group-hover:text-primary">
        <ChevronRight size={18} />
      </div>
    </button>
  );

  return (
    <div className="page-shell section-space pb-36">
      {filteredCompetitions.length > 0 ? (
        <div className="space-y-2">
          {filteredCompetitions.map((competition) => (
            <CompetitionListItem key={competition.id} competition={competition} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Trophy size={36} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-black text-slate-500">No competitions match this filter.</p>
        </div>
      )}

      {/* Detail Overlay */}
      {selectedComp && (
        <CompetitionDetailsModal
          competition={selectedComp}
          onClose={() => setSelectedComp(null)}
        />
      )}
    </div>
  );
}

