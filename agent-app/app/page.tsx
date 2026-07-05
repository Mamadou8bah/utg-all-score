"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LineupPlayer, Match } from "@/lib/types";
import { AgentShell, Button, Card, Field, Input, Select } from "@/components/ui";
import { apiFetch, apiJson, logout } from "@/lib/api";
import { agentNav } from "@/lib/nav";

const emptyPlayer = (): LineupPlayer => ({ number: 1, name: "", role: "GK" });

export default function AgentDashboardPage() {
  const [user, setUser] = useState<{ name: string; schoolName?: string | null } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [scores, setScores] = useState({ homeScore: 0, awayScore: 0, status: "UPCOMING", timer: "", venue: "" });
  const [eventForm, setEventForm] = useState({ minute: "", type: "Goal", player: "", team: "", detail: "" });
  const [homeLineup, setHomeLineup] = useState<LineupPlayer[]>([emptyPlayer()]);
  const [awayLineup, setAwayLineup] = useState<LineupPlayer[]>([emptyPlayer()]);
  const [message, setMessage] = useState("");

  const selected = matches.find((m) => m.id === selectedId);

  async function load() {
    const me = await apiJson<{ user: { name: string; schoolName?: string | null } }>("/api/auth/me");
    setUser(me.user);
    const matchList = await apiJson<Match[]>("/api/portal/matches");
    setMatches(matchList);
    if (matchList[0] && !selectedId) {
      setSelectedId(matchList[0].id);
    }
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setScores({
      homeScore: selected.homeScore,
      awayScore: selected.awayScore,
      status: selected.status,
      timer: selected.timer ?? "",
      venue: selected.venue ?? ""
    });
    setHomeLineup(selected.lineups?.home.starting.length ? selected.lineups.home.starting : [emptyPlayer()]);
    setAwayLineup(selected.lineups?.away.starting.length ? selected.lineups.away.starting : [emptyPlayer()]);
  }, [selectedId, selected]);

  async function saveMatch() {
    if (!selectedId) return;
    const res = await apiFetch(`/api/portal/matches/${selectedId}`, {
      method: "PATCH",
      body: JSON.stringify(scores)
    });
    setMessage(res.ok ? "Match updated on public site." : "Failed to update match.");
    load();
  }

  async function addEvent(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    const res = await apiFetch(`/api/portal/matches/${selectedId}`, {
      method: "POST",
      body: JSON.stringify({ action: "add-event", ...eventForm, minute: Number(eventForm.minute) })
    });
    setMessage(res.ok ? "Event added." : "Failed to add event.");
    setEventForm({ minute: "", type: "Goal", player: "", team: "", detail: "" });
    load();
  }

  async function saveLineups(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    const home = homeLineup.filter((p) => p.name.trim());
    const away = awayLineup.filter((p) => p.name.trim());
    const res = await apiFetch(`/api/portal/matches/${selectedId}`, {
      method: "POST",
      body: JSON.stringify({ action: "set-lineups", home, away })
    });
    setMessage(res.ok ? "Lineups published." : "Failed to save lineups.");
    load();
  }

  function updateLineup(side: "home" | "away", index: number, field: keyof LineupPlayer, value: string | number) {
    const setter = side === "home" ? setHomeLineup : setAwayLineup;
    setter((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addLineupRow(side: "home" | "away") {
    const setter = side === "home" ? setHomeLineup : setAwayLineup;
    setter((rows) => [...rows, { number: rows.length + 1, name: "", role: "MF" }]);
  }

  return (
    <AgentShell
      title="Matchday Console"
      subtitle={user ? `${user.name} · ${user.schoolName ?? "School agent"}` : "School football agent"}
      nav={agentNav}
      onLogout={logout}
    >
      {message ? <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-primary">{message}</p> : null}

      <Card title="Your matches">
        <div className="space-y-3">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              onClick={() => setSelectedId(match.id)}
              className={`w-full rounded-[20px] p-4 text-left text-sm transition ${selectedId === match.id ? "bg-blue-50 ring-2 ring-blue-300" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <p className="font-semibold text-slate-950">{match.home} {match.homeScore} - {match.awayScore} {match.away}</p>
              <p className="text-text-secondary">{match.competition} · {match.status}{match.timer ? ` · ${match.timer}` : ""}</p>
            </button>
          ))}
          {!matches.length ? <p className="text-sm text-text-secondary">No matches yet. Your admin can assign you to general competitions or schedule school fixtures.</p> : null}
        </div>
      </Card>

      {selected ? (
        <>
          <Card title={`Update score — ${selected.home} vs ${selected.away}`}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Field label={`${selected.home} goals`}><Input type="number" min={0} value={scores.homeScore} onChange={(e) => setScores({ ...scores, homeScore: Number(e.target.value) })} /></Field>
              <Field label={`${selected.away} goals`}><Input type="number" min={0} value={scores.awayScore} onChange={(e) => setScores({ ...scores, awayScore: Number(e.target.value) })} /></Field>
              <Field label="Status">
                <Select value={scores.status} onChange={(e) => setScores({ ...scores, status: e.target.value })}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="LIVE">Live</option>
                  <option value="FT">Full Time</option>
                </Select>
              </Field>
              <Field label="Match clock"><Input value={scores.timer} onChange={(e) => setScores({ ...scores, timer: e.target.value })} placeholder="e.g. 67'" /></Field>
              <Field label="Venue"><Input value={scores.venue} onChange={(e) => setScores({ ...scores, venue: e.target.value })} placeholder="e.g. UTG Main Field" /></Field>
            </div>
            <div className="mt-4"><Button onClick={saveMatch}>Publish to public site</Button></div>
          </Card>

          <Card title="Add match event">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={addEvent}>
              <Field label="Minute"><Input value={eventForm.minute} onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })} required /></Field>
              <Field label="Type">
                <Select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}>
                  <option>Goal</option>
                  <option>Yellow Card</option>
                  <option>Red Card</option>
                  <option>Substitution</option>
                </Select>
              </Field>
              <Field label="Player"><Input value={eventForm.player} onChange={(e) => setEventForm({ ...eventForm, player: e.target.value })} required /></Field>
              <Field label="Team">
                <Select value={eventForm.team} onChange={(e) => setEventForm({ ...eventForm, team: e.target.value })} required>
                  <option value="">Select team</option>
                  <option value={selected.home}>{selected.home}</option>
                  <option value={selected.away}>{selected.away}</option>
                </Select>
              </Field>
              <Field label="Detail"><Input value={eventForm.detail} onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })} className="md:col-span-2" /></Field>
              <div className="md:col-span-2"><Button type="submit" variant="secondary">Add event</Button></div>
            </form>
          </Card>

          <Card title="Starting lineups">
            <form className="space-y-6" onSubmit={saveLineups}>
              <div className="grid gap-6 lg:grid-cols-2">
                {[
                  { side: "home" as const, label: selected.home, rows: homeLineup },
                  { side: "away" as const, label: selected.away, rows: awayLineup }
                ].map(({ side, label, rows }) => (
                  <div key={side} className="space-y-3">
                    <p className="text-sm font-bold text-slate-950">{label}</p>
                    {rows.map((player, index) => (
                      <div key={`${side}-${index}`} className="grid grid-cols-[3rem_1fr_4.5rem] gap-2 sm:grid-cols-[60px_1fr_80px]">
                        <Input type="number" min={1} value={player.number} onChange={(e) => updateLineup(side, index, "number", Number(e.target.value))} />
                        <Input value={player.name} placeholder="Player name" onChange={(e) => updateLineup(side, index, "name", e.target.value)} />
                        <Select value={player.role} onChange={(e) => updateLineup(side, index, "role", e.target.value)}>
                          <option value="GK">GK</option>
                          <option value="DF">DF</option>
                          <option value="MF">MF</option>
                          <option value="FW">FW</option>
                        </Select>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" onClick={() => addLineupRow(side)}>+ Add player</Button>
                  </div>
                ))}
              </div>
              <Button type="submit">Publish lineups</Button>
            </form>
          </Card>
        </>
      ) : null}

      <p className="text-sm text-text-secondary">
        Publish news and announcements in the <Link href="/content" className="font-semibold text-primary">content workspace →</Link>
      </p>
    </AgentShell>
  );
}
