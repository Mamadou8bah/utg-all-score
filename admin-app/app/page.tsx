"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell, Card } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiJson, PUBLIC_SITE_URL } from "@/lib/api";
import type { Match } from "@/lib/types";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [stats, setStats] = useState({ agents: 0, teams: 0, competitions: 0, liveMatches: 0, schools: 0, fixtures: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, agents, teams, competitions, schools, fixtures, live] = await Promise.all([
      apiJson<{ user: { name: string } }>("/api/auth/me"),
      apiJson<unknown[]>("/api/portal/admin/agents"),
      apiJson<unknown[]>("/api/portal/admin/teams"),
      apiJson<unknown[]>("/api/portal/admin/competitions"),
      apiJson<unknown[]>("/api/portal/admin/schools"),
      apiJson<Match[]>("/api/portal/admin/matches"),
      apiJson<Match[]>("/api/live")
      ]);
      if (me?.user) setUser(me.user);
      setStats({
        agents: agents?.length ?? 0,
        teams: teams?.length ?? 0,
        competitions: competitions?.length ?? 0,
        schools: schools?.length ?? 0,
        fixtures: fixtures?.length ?? 0,
        liveMatches: live.length
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load the dashboard.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AdminShell title="Admin Dashboard" subtitle={user ? `Signed in as ${user.name}` : "Sports Administration"} nav={adminNav}>
      {error ? <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-900"><p>{error}</p><button type="button" onClick={() => void load()} className="mt-2 font-semibold underline">Try again</button></div> : null}
      <div aria-busy={loading} className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {[
          { label: "Schools", value: stats.schools },
          { label: "School Agents", value: stats.agents },
          { label: "Football Teams", value: stats.teams },
          { label: "Competitions", value: stats.competitions },
          { label: "Fixtures", value: stats.fixtures },
          { label: "Live Matches", value: stats.liveMatches }
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs font-semibold text-text-secondary sm:text-sm">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950 sm:mt-2 sm:text-3xl">{loading || error ? "—" : stat.value}</p>
          </Card>
        ))}
      </div>
      <Card title="Quick actions">
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          <Link href="/schools" className="flex min-h-[52px] items-center rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold transition active:scale-[0.98] sm:rounded-[24px] sm:py-4">Manage schools</Link>
          <Link href="/agents" className="flex min-h-[52px] items-center rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold transition active:scale-[0.98] sm:rounded-[24px] sm:py-4">Add a school agent</Link>
          <Link href="/teams" className="flex min-h-[52px] items-center rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold transition active:scale-[0.98] sm:rounded-[24px] sm:py-4">Register a football team</Link>
          <Link href="/competitions" className="flex min-h-[52px] items-center rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold transition active:scale-[0.98] sm:rounded-[24px] sm:py-4">Create a competition</Link>
          <Link href="/matches" className="flex min-h-[52px] items-center rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold transition active:scale-[0.98] sm:rounded-[24px] sm:py-4">Schedule a fixture</Link>
          <a href={`${PUBLIC_SITE_URL}/live`} className="flex min-h-[52px] items-center rounded-[20px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold transition active:scale-[0.98] sm:rounded-[24px] sm:py-4">View public live scores</a>
        </div>
      </Card>
    </AdminShell>
  );
}
