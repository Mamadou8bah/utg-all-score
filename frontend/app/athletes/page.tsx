import { AthleteHighlightCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { athletes } from "@/lib/data";

export default function AthletesPage() {
  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Athlete Highlights" title="Profiles with editorial polish" description="Feature cards designed to make athlete content feel official, premium, and social-ready." />
      <div className="grid gap-4">
        {athletes.map((athlete) => <AthleteHighlightCard key={athlete.id} athlete={athlete} />)}
      </div>
    </div>
  );
}
