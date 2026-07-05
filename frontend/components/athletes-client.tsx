"use client";

import { AthleteHighlightCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { useApiData } from "@/lib/use-api-data";
import type { AthleteProfile } from "@/lib/types";

export default function AthletesClient() {
  const { data: athletes } = useApiData<AthleteProfile[]>("/api/athletes", []);

  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Football Players" title="Top UTG football contributors" description="Goal scorers and playmakers from VC Tournament, Unity Shield, and school leagues." />
      <div className="grid gap-4">
        {athletes.map((athlete) => <AthleteHighlightCard key={athlete.id} athlete={athlete} />)}
      </div>
    </div>
  );
}
