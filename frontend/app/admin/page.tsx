import { Button, PageHeader, Sidebar, Tabs } from "@/components/ui";
import { announcements, dashboardStats, liveMatches, newsItems, quickActions } from "@/lib/data";

export default function AdminPage() {
  return (
    <div className="page-shell section-space">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="space-y-6">
          <PageHeader eyebrow="Admin" title="Operations dashboard" description="A clean command surface for staff to monitor live activity, publish updates, and keep university sports communication accurate." actions={<Button>New quick post</Button>} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <article key={stat.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
                <p className="mt-2 text-sm text-primary">{stat.change}</p>
              </article>
            ))}
          </div>
          <Tabs
            tabs={[
              {
                id: "actions",
                label: "Quick actions",
                content: (
                  <div className="grid gap-3 md:grid-cols-2">
                    {quickActions.map((action) => <button key={action} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-medium text-slate-950 transition hover:bg-slate-100">{action}</button>)}
                  </div>
                )
              },
              {
                id: "matches",
                label: "Live matches",
                content: (
                  <div className="space-y-3">
                    {liveMatches.map((match) => (
                      <div key={match.id} className="rounded-[24px] bg-slate-50 p-4 text-sm">
                        <p className="font-semibold text-slate-950">{match.home} {match.homeScore} - {match.awayScore} {match.away}</p>
                        <p className="mt-1 text-text-secondary">{match.competition} · {match.timer}</p>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                id: "content",
                label: "Content queue",
                content: (
                  <div className="grid gap-3 md:grid-cols-2">
                    {newsItems.concat(announcements.map((item) => ({ id: item.id, title: item.title, excerpt: item.body, category: "Announcement", publishedAt: new Date().toISOString(), image: "" })) as any).map((item: any) => (
                      <div key={item.id} className="rounded-[24px] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">{item.category}</p>
                        <p className="mt-2 font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-2 text-sm text-text-secondary">{item.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
