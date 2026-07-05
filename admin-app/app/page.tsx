"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell, Card } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiJson, logout, PUBLIC_SITE_URL } from "@/lib/api";
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/live`).then((r) => r.json()).catch(() => ({ data: [] }))
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
    <AdminShell title="Admin Dashboard" subtitle={user ? `Signed in as ${user.name}` : "UTGSU Sports Administration"} nav={adminNav} onLogout={logout}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Schools", value: stats.schools },
          { label: "School Agents", value: stats.agents },
          { label: "Football Teams", value: stats.teams },
          { label: "Competitions", value: stats.competitions },
          { label: "Fixtures", value: stats.fixtures },
          { label: "Live Matches", value: stats.liveMatches }
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
          </Card>
        ))}
      </div>
      <Card title="Quick actions">
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/schools" className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold transition hover:bg-white hover:shadow-sm">Manage schools</Link>
          <Link href="/agents" className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold transition hover:bg-white hover:shadow-sm">Add a school agent</Link>
          <Link href="/teams" className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold transition hover:bg-white hover:shadow-sm">Register a football team</Link>
          <Link href="/competitions" className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold transition hover:bg-white hover:shadow-sm">Create a competition</Link>
          <Link href="/matches" className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold transition hover:bg-white hover:shadow-sm">Schedule a fixture</Link>
          <a href={`${PUBLIC_SITE_URL}/live`} className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold transition hover:bg-white hover:shadow-sm">View public live scores</a>
        </div>
      </Card>
    </AdminShell>
  );
}
