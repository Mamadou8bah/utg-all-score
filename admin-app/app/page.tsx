"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell, Card } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiJson, PUBLIC_SITE_URL, API_URL } from "@/lib/api";
import { apiUrl } from "@/lib/api-url";
import type { Match } from "@/lib/types";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [stats, setStats] = useState({ agents: 0, teams: 0, competitions: 0, liveMatches: 0, schools: 0, fixtures: 0 });

  useEffect(() => {
    Promise.all([
      apiJson<{ user: { name: string } }>("/api/auth/me").catch(() => null),
      apiJson<unknown[]>("/api/portal/admin/agents").catch(() => []),
      apiJson<unknown[]>("/api/portal/admin/teams").catch(() => []),
      apiJson<unknown[]>("/api/portal/admin/competitions").catch(() => []),
      apiJson<unknown[]>("/api/portal/admin/schools").catch(() => []),
      apiJson<Match[]>("/api/portal/admin/matches").catch(() => []),
      fetch(apiUrl("/api/live", API_URL)).then((r) => r.json()).catch(() => ({ data: [] }))
    ]).then(([me, agents, teams, competitions, schools, fixtures, live]) => {
      if (me?.user) setUser(me.user);
      setStats({
        agents: agents?.length ?? 0,
        teams: teams?.length ?? 0,
        competitions: competitions?.length ?? 0,
        schools: schools?.length ?? 0,
        fixtures: fixtures?.length ?? 0,
        liveMatches: (live?.data as Match[])?.length ?? 0
      });
    });
  }, []);

  return (
    <AdminShell title="Admin Dashboard" subtitle={user ? `Signed in as ${user.name}` : "Sports Administration"} nav={adminNav}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
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
            <p className="mt-1 text-2xl font-bold text-slate-950 sm:mt-2 sm:text-3xl">{stat.value}</p>
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
