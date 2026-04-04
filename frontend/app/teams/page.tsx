import { PageHeader } from "@/components/ui";
import { faculties } from "@/lib/data";

export default function TeamsPage() {
  return (
    <div className="page-shell section-space space-y-8">
      <PageHeader eyebrow="Teams / Faculties" title="Faculty sports identities" description="Each faculty gets a clean card summary for sports entered, performance snapshot, and competitive identity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {faculties.map((faculty) => (
          <article key={faculty.name} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-primary">{faculty.record}</p>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{faculty.name}</h3>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{faculty.tone}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {faculty.sports.map((sport) => <span key={sport} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-text-secondary">{sport}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
