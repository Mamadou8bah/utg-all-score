"use client";

import { PageHeader } from "@/components/ui";
import { useApiData } from "@/lib/use-api-data";
import type { TeamProfile } from "@/lib/types";

function TeamMark({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-slate-50 ring-1 ring-slate-100">
      {logo ? (
        <img src={logo} alt={name} className="h-10 w-10 object-contain" />
      ) : (
        <span className="text-lg font-black text-slate-400">{name[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}

export default function TeamsPage() {
  const { data: teams } = useApiData<TeamProfile[]>("/api/teams", []);

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader
        eyebrow="Teams"
        title="Football squads"
        description="Registered teams across UTG schools and associations, synced from the AllScore database."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <article key={team.name} className="flex gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-card">
            <TeamMark name={team.name} logo={team.logo} />
            <div>
              <h3 className="text-xl font-semibold text-slate-950">{team.name}</h3>
              {team.tone ? <p className="mt-2 text-sm leading-6 text-text-secondary">{team.tone}</p> : null}
              <div className="mt-4 flex gap-2">
                {team.colors.slice(0, 2).map((color) => (
                  <span key={color} className="h-4 w-4 rounded-full ring-1 ring-slate-200" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </article>
        ))}
        {!teams.length ? <p className="text-sm text-text-secondary">No teams registered yet.</p> : null}
      </div>
    </div>
  );
}
