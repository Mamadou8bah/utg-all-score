"use client";

import { useEffect, useState } from "react";
import { AdminShell, Button, Card, Field, Input, Select } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiFetch, apiJson, logout } from "@/lib/api";

type Competition = { id: string; name: string };
type Team = { id: string; name: string };
type Match = {
  id: string;
  competition: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  kickoff: string;
  status: string;
  stage?: string;
  round?: string;
};

export default function MatchesPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState({
    competitionId: "",
    homeTeamId: "",
    awayTeamId: "",
    venue: "UTG Main Field",
    kickoff: "",
    status: "UPCOMING",
    stage: "LEAGUE",
    round: ""
  });
  const [message, setMessage] = useState("");

  async function load() {
    const [compList, teamList, matchList] = await Promise.all([
      apiJson<Competition[]>("/api/portal/admin/competitions"),
      apiJson<Team[]>("/api/portal/admin/teams"),
      apiJson<Match[]>("/api/portal/admin/matches")
    ]);
    setCompetitions(compList);
    setTeams(teamList);
    setMatches(matchList);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/matches", {
      method: "POST",
      body: JSON.stringify(form)
    });
    const json = await res.json();
    setMessage(res.ok ? "Fixture scheduled." : json.error || "Failed.");
    if (res.ok) {
      setForm({ ...form, kickoff: "", homeTeamId: "", awayTeamId: "" });
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this fixture?")) return;
    const res = await apiFetch(`/api/portal/admin/matches/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "Fixture deleted." : json.error || "Failed.");
    if (res.ok) load();
  }

  return (
    <AdminShell title="Match Fixtures" subtitle="Schedule football matches for UTGSU competitions." nav={adminNav} onLogout={logout}>
      {message ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <Card title="Schedule match">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Competition">
            <Select value={form.competitionId} onChange={(e) => setForm({ ...form, competitionId: e.target.value })} required>
              <option value="">Select competition</option>
              {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Kickoff (local)">
            <Input type="datetime-local" value={form.kickoff} onChange={(e) => setForm({ ...form, kickoff: e.target.value })} required />
          </Field>
          <Field label="Home team">
            <Select value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })} required>
              <option value="">Select team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <Field label="Away team">
            <Select value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })} required>
              <option value="">Select team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <Field label="Venue"><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="UPCOMING">Upcoming</option>
              <option value="LIVE">Live</option>
              <option value="FT">Full Time</option>
            </Select>
          </Field>
          <Field label="Stage">
            <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              <option value="LEAGUE">League</option>
              <option value="GROUP">Group</option>
              <option value="KNOCKOUT">Knockout</option>
            </Select>
          </Field>
          <Field label="Round"><Input value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} placeholder="e.g. Matchday 1, Semi-Final" /></Field>
          <div className="md:col-span-2"><Button type="submit">Schedule fixture</Button></div>
        </form>
      </Card>
      <Card title="All fixtures">
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-950">{match.home} vs {match.away}</p>
                <p className="text-sm text-text-secondary">{match.competition} · {match.status}{match.round ? ` · ${match.round}` : ""} · {match.venue}</p>
                <p className="text-xs text-primary">{new Date(match.kickoff).toLocaleString()}</p>
              </div>
              <Button variant="ghost" onClick={() => remove(match.id)}>Delete</Button>
            </div>
          ))}
          {!matches.length ? <p className="text-sm text-text-secondary">No fixtures scheduled yet.</p> : null}
        </div>
      </Card>
    </AdminShell>
  );
}
