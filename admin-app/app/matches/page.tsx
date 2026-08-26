"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell, Button, Card, Field, Input, Select } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiFetch, apiJson } from "@/lib/api";

type Competition = { id: string; name: string; type: string; format: string; schoolId?: string | null };
type Team = { id: string; name: string; schoolId?: string | null };
type Agent = { id: string; name: string; email: string; schoolName?: string | null; schoolId?: string | null; active: boolean };
type LinkedTeam = { competitionId: string; teamId: string; teamName: string };
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
  agents?: Array<{ id: string; name: string; email: string }>;
};

const VENUES = ["UTG Main Field", "UTG Faraba Campus", "Independence Stadium"];
const ROUND_OPTIONS = ["Matchday 1", "Matchday 2", "Matchday 3", "Quarter-Final", "Semi-Final", "Final", "3rd Place"];

export default function MatchesPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [linkedTeams, setLinkedTeams] = useState<LinkedTeam[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState({
    competitionId: "",
    homeTeamId: "",
    awayTeamId: "",
    venue: "UTG Main Field",
    kickoff: "",
    status: "UPCOMING",
    stage: "LEAGUE",
    round: "",
    agentId: ""
  });
  const [assignByMatch, setAssignByMatch] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function load() {
    const [compList, teamList, agentList, matchList, links] = await Promise.all([
      apiJson<Competition[]>("/api/portal/admin/competitions"),
      apiJson<Team[]>("/api/portal/admin/teams"),
      apiJson<Agent[]>("/api/portal/admin/agents"),
      apiJson<Match[]>("/api/portal/admin/matches"),
      apiJson<LinkedTeam[]>("/api/portal/admin/competition-teams")
    ]);
    setCompetitions(compList);
    setTeams(teamList);
    setAgents(agentList.filter((agent) => agent.active));
    setMatches(matchList);
    setLinkedTeams(links);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const selectedCompetition = competitions.find((c) => c.id === form.competitionId);
  const competitionTeamIds = useMemo(() => {
    if (!form.competitionId) return new Set<string>();
    return new Set(linkedTeams.filter((row) => row.competitionId === form.competitionId).map((row) => row.teamId));
  }, [form.competitionId, linkedTeams]);

  const availableTeams = useMemo(() => {
    if (!form.competitionId) return [];
    const filtered = teams.filter((team) => competitionTeamIds.has(team.id));
    return filtered.length ? filtered : [];
  }, [teams, form.competitionId, competitionTeamIds]);

  const preferredAgents = useMemo(() => {
    if (!selectedCompetition) return agents;
    if (selectedCompetition.type === "SCHOOL" && selectedCompetition.schoolId) {
      const schoolAgents = agents.filter((agent) => agent.schoolId === selectedCompetition.schoolId);
      return schoolAgents.length ? schoolAgents : agents;
    }
    return agents;
  }, [agents, selectedCompetition]);

  function onCompetitionChange(competitionId: string) {
    const competition = competitions.find((c) => c.id === competitionId);
    setForm({
      ...form,
      competitionId,
      homeTeamId: "",
      awayTeamId: "",
      agentId: "",
      stage: competition?.format === "TOURNAMENT" ? "GROUP" : "LEAGUE",
      status: "UPCOMING"
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/matches", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        agentIds: form.agentId ? [form.agentId] : []
      })
    });
    const json = await res.json();
    setMessage(res.ok ? "Fixture scheduled." : json.error || "Failed.");
    if (res.ok) {
      setForm({ ...form, kickoff: "", homeTeamId: "", awayTeamId: "", agentId: "" });
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

  async function assignAgent(matchId: string) {
    const userId = assignByMatch[matchId];
    if (!userId) {
      setMessage("Select an agent to assign.");
      return;
    }
    const res = await apiFetch("/api/portal/admin/match-agents", {
      method: "POST",
      body: JSON.stringify({ matchId, userId })
    });
    const json = await res.json();
    setMessage(res.ok ? "Agent assigned to match." : json.error || "Failed.");
    if (res.ok) {
      setAssignByMatch((prev) => ({ ...prev, [matchId]: "" }));
      load();
    }
  }

  async function unassignAgent(matchId: string, userId: string) {
    const res = await apiFetch("/api/portal/admin/match-agents", {
      method: "DELETE",
      body: JSON.stringify({ matchId, userId })
    });
    const json = await res.json();
    setMessage(res.ok ? "Agent unassigned." : json.error || "Failed.");
    if (res.ok) load();
  }

  return (
    <AdminShell
      title="Match Fixtures"
      subtitle="Schedule fixtures from competition rosters and assign agents per match (or via competition assignment)."
      nav={adminNav}
    >
      {message ? <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <Card title="Schedule match">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Competition">
            <Select value={form.competitionId} onChange={(e) => onCompetitionChange(e.target.value)} required>
              <option value="">Select competition</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kickoff (local)">
            <Input type="datetime-local" value={form.kickoff} onChange={(e) => setForm({ ...form, kickoff: e.target.value })} required />
          </Field>
          <Field label="Home team">
            <Select
              value={form.homeTeamId}
              onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
              required
              disabled={!form.competitionId}
            >
              <option value="">{form.competitionId ? "Select team" : "Select competition first"}</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === form.awayTeamId}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Away team">
            <Select
              value={form.awayTeamId}
              onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
              required
              disabled={!form.competitionId}
            >
              <option value="">{form.competitionId ? "Select team" : "Select competition first"}</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === form.homeTeamId}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          {form.competitionId && !availableTeams.length ? (
            <p className="md:col-span-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No teams linked to this competition yet. Link teams on the Competitions page first.
            </p>
          ) : null}
          <Field label="Venue">
            <Select value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })}>
              {VENUES.map((venue) => (
                <option key={venue} value={venue}>
                  {venue}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="UPCOMING">Upcoming</option>
            </Select>
          </Field>
          <Field label="Stage">
            <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              <option value="LEAGUE">League</option>
              <option value="GROUP">Group</option>
              <option value="KNOCKOUT">Knockout</option>
            </Select>
          </Field>
          <Field label="Round">
            <Select value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })}>
              <option value="">Optional</option>
              {ROUND_OPTIONS.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assigned agent (optional)">
            <Select value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
              <option value="">Assign later / use competition agents</option>
              {preferredAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                  {agent.schoolName ? ` · ${agent.schoolName}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Button type="submit">Schedule fixture</Button>
          </div>
        </form>
      </Card>
      <Card title="All fixtures">
        <div className="space-y-3">
          {matches.map((match) => {
            const assignedIds = new Set((match.agents ?? []).map((a) => a.id));
            const availableAgents = agents.filter((agent) => !assignedIds.has(agent.id));
            return (
              <div key={match.id} className="space-y-3 rounded-[20px] bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {match.home} vs {match.away}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {match.competition} · {match.status}
                      {match.round ? ` · ${match.round}` : ""} · {match.venue}
                    </p>
                    <time className="text-xs text-primary" dateTime={match.kickoff} suppressHydrationWarning>
                      {new Date(match.kickoff).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </time>
                  </div>
                  <Button variant="ghost" onClick={() => remove(match.id)}>
                    Delete
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Match-assigned agents</p>
                  {(match.agents ?? []).length ? (
                    <div className="flex flex-wrap gap-2">
                      {match.agents!.map((agent) => (
                        <span
                          key={agent.id}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-slate-800 ring-1 ring-slate-200"
                        >
                          {agent.name}
                          <button
                            type="button"
                            className="text-xs font-semibold text-error"
                            onClick={() => unassignAgent(match.id, agent.id)}
                          >
                            Remove
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      No per-match agents — competition-assigned agents can still update this fixture.
                    </p>
                  )}

                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[220px] flex-1">
                      <Select
                        value={assignByMatch[match.id] ?? ""}
                        onChange={(e) => setAssignByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                      >
                        <option value="">Assign agent…</option>
                        {availableAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                            {agent.schoolName ? ` · ${agent.schoolName}` : ""}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => assignAgent(match.id)}>
                      Assign
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {!matches.length ? <p className="text-sm text-text-secondary">No fixtures scheduled yet.</p> : null}
        </div>
      </Card>
    </AdminShell>
  );
}
