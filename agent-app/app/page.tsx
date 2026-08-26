"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LineupPlayer, Match, SquadPlayer } from "@/lib/types";
import { AgentShell, Button, Card, Field, Input, Select } from "@/components/ui";
import { apiFetch, apiJson, logout } from "@/lib/api";
import { agentNav } from "@/lib/nav";

const emptyPlayer = (): LineupPlayer => ({ number: 1, name: "", role: "MF" });

function playerLabel(player: SquadPlayer) {
  return `#${player.number} ${player.name} (${player.role})`;
}

export default function AgentDashboardPage() {
  const [user, setUser] = useState<{ name: string; schoolName?: string | null } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [scores, setScores] = useState({ homeScore: 0, awayScore: 0, status: "UPCOMING", timer: "", venue: "" });
  const [eventForm, setEventForm] = useState({ minute: "", type: "Goal", player: "", team: "", detail: "" });
  const [homeLineup, setHomeLineup] = useState<LineupPlayer[]>([emptyPlayer()]);
  const [awayLineup, setAwayLineup] = useState<LineupPlayer[]>([emptyPlayer()]);
  const [homeSubs, setHomeSubs] = useState<LineupPlayer[]>([]);
  const [awaySubs, setAwaySubs] = useState<LineupPlayer[]>([]);
  const [message, setMessage] = useState("");

  const selected = matches.find((m) => m.id === selectedId);
  const homeSquad = selected?.squads?.home ?? [];
  const awaySquad = selected?.squads?.away ?? [];

  async function load() {
    const me = await apiJson<{ user: { name: string; schoolName?: string | null } }>("/api/auth/me");
    setUser(me.user);
    const matchList = await apiJson<Match[]>("/api/portal/matches");
    setMatches(matchList);
    if (matchList[0] && !selectedId) {
      setSelectedId(matchList[0].id);
    }
  }

  async function loadMatchDetail(matchId: string) {
    const detail = await apiJson<Match>(`/api/portal/matches/${matchId}`);
    setMatches((prev) => prev.map((match) => (match.id === detail.id ? { ...match, ...detail } : match)));
  }

  useEffect(() => {
    load().catch(() => setMessage("Could not load matches. Sign in again if this persists."));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadMatchDetail(selectedId).catch(() => {});
  }, [selectedId]);

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
    setHomeSubs(selected.lineups?.home.subs ?? []);
    setAwaySubs(selected.lineups?.away.subs ?? []);
    setEventForm((prev) => ({ ...prev, team: prev.team || selected.home, player: "", detail: "" }));
  }, [selectedId, selected]);

  const matchNotStarted = selected?.status === "UPCOMING";

  function squadForTeam(teamName: string) {
    if (!selected) return [] as SquadPlayer[];
    if (teamName === selected.home) return homeSquad;
    if (teamName === selected.away) return awaySquad;
    return [];
  }

  function eventPlayerOptions() {
    const squad = squadForTeam(eventForm.team);
    if (squad.length) return squad;
    // Fall back to published lineup names if squad is empty
    if (!selected) return [];
    const side = eventForm.team === selected.home ? "home" : eventForm.team === selected.away ? "away" : null;
    if (!side) return [];
    const rows = [...(selected.lineups?.[side].starting ?? []), ...(selected.lineups?.[side].subs ?? [])];
    return rows.map((row, index) => ({
      id: `${side}-${index}`,
      number: row.number,
      name: row.name,
      role: row.role
    }));
  }

  async function saveMatch() {
    if (!selectedId) return;
    if (selected?.status === "UPCOMING" && scores.status === "UPCOMING") {
      const scoreChanging = scores.homeScore !== selected.homeScore || scores.awayScore !== selected.awayScore;
      if (scoreChanging) {
        setMessage("Set status to Live before updating the score.");
        return;
      }
    }
    const res = await apiFetch(`/api/portal/matches/${selectedId}`, {
      method: "PATCH",
      body: JSON.stringify(scores)
    });
    const json = await res.json().catch(() => null);
    setMessage(res.ok ? "Match updated on public site." : json?.error || "Failed to update match.");
    await load();
    if (selectedId) await loadMatchDetail(selectedId);
  }

  async function addEvent(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    if (selected?.status === "UPCOMING") {
      setMessage("Set status to Live before adding match events.");
      return;
    }
    const res = await apiFetch(`/api/portal/matches/${selectedId}`, {
      method: "POST",
      body: JSON.stringify({ action: "add-event", ...eventForm, minute: Number(eventForm.minute) })
    });
    const json = await res.json().catch(() => null);
    setMessage(res.ok ? "Event added." : json?.error || "Failed to add event.");
    setEventForm({ minute: "", type: "Goal", player: "", team: selected?.home ?? "", detail: "" });
    await load();
    await loadMatchDetail(selectedId);
  }

  async function saveLineups(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    const home = [
      ...homeLineup.filter((p) => p.name.trim()).map((p) => ({ ...p, isSub: false })),
      ...homeSubs.filter((p) => p.name.trim()).map((p) => ({ ...p, isSub: true }))
    ];
    const away = [
      ...awayLineup.filter((p) => p.name.trim()).map((p) => ({ ...p, isSub: false })),
      ...awaySubs.filter((p) => p.name.trim()).map((p) => ({ ...p, isSub: true }))
    ];
    const res = await apiFetch(`/api/portal/matches/${selectedId}`, {
      method: "POST",
      body: JSON.stringify({ action: "set-lineups", home, away })
    });
    const json = await res.json().catch(() => null);
    setMessage(res.ok ? "Lineups published." : json?.error || "Failed to save lineups.");
    await load();
    await loadMatchDetail(selectedId);
  }

  function updateLineupRow(
    side: "home" | "away",
    kind: "starting" | "subs",
    index: number,
    field: keyof LineupPlayer,
    value: string | number
  ) {
    const setter =
      side === "home"
        ? kind === "starting"
          ? setHomeLineup
          : setHomeSubs
        : kind === "starting"
          ? setAwayLineup
          : setAwaySubs;
    setter((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function selectSquadPlayer(side: "home" | "away", kind: "starting" | "subs", index: number, playerName: string) {
    const squad = side === "home" ? homeSquad : awaySquad;
    const player = squad.find((p) => p.name === playerName);
    const setter =
      side === "home"
        ? kind === "starting"
          ? setHomeLineup
          : setHomeSubs
        : kind === "starting"
          ? setAwayLineup
          : setAwaySubs;
    setter((rows) =>
      rows.map((row, i) =>
        i === index
          ? player
            ? { number: player.number, name: player.name, role: player.role }
            : { ...row, name: playerName }
          : row
      )
    );
  }

  function addLineupRow(side: "home" | "away", kind: "starting" | "subs") {
    const setter =
      side === "home"
        ? kind === "starting"
          ? setHomeLineup
          : setHomeSubs
        : kind === "starting"
          ? setAwayLineup
          : setAwaySubs;
    setter((rows) => [...rows, { number: rows.length + 1, name: "", role: "MF" }]);
  }

  function removeLineupRow(side: "home" | "away", kind: "starting" | "subs", index: number) {
    const setter =
      side === "home"
        ? kind === "starting"
          ? setHomeLineup
          : setHomeSubs
        : kind === "starting"
          ? setAwayLineup
          : setAwaySubs;
    setter((rows) => (rows.length <= 1 && kind === "starting" ? rows : rows.filter((_, i) => i !== index)));
  }

  function renderLineupEditor(side: "home" | "away", kind: "starting" | "subs", label: string, rows: LineupPlayer[]) {
    const squad = side === "home" ? homeSquad : awaySquad;
    const selectedNames = new Set(rows.map((r) => r.name).filter(Boolean));

    return (
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-950">{label}</p>
        {!squad.length ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            No squad registered for this team yet. Ask an admin to add players, or type names manually.
          </p>
        ) : null}
        {rows.map((player, index) => (
          <div key={`${side}-${kind}-${index}`} className="grid grid-cols-[3rem_1fr_4.5rem_auto] gap-2 sm:grid-cols-[60px_1fr_80px_auto]">
            <Input
              type="number"
              min={1}
              value={player.number}
              onChange={(e) => updateLineupRow(side, kind, index, "number", Number(e.target.value))}
            />
            {squad.length ? (
              <Select value={player.name} onChange={(e) => selectSquadPlayer(side, kind, index, e.target.value)} required={kind === "starting" && index < 11}>
                <option value="">Select player</option>
                {squad.map((option) => (
                  <option key={option.id} value={option.name} disabled={selectedNames.has(option.name) && option.name !== player.name}>
                    {playerLabel(option)}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={player.name}
                placeholder="Player name"
                onChange={(e) => updateLineupRow(side, kind, index, "name", e.target.value)}
              />
            )}
            <Select value={player.role} onChange={(e) => updateLineupRow(side, kind, index, "role", e.target.value)}>
              <option value="GK">GK</option>
              <option value="DF">DF</option>
              <option value="MF">MF</option>
              <option value="FW">FW</option>
            </Select>
            <Button type="button" variant="ghost" onClick={() => removeLineupRow(side, kind, index)}>
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => addLineupRow(side, kind)}>
          + Add {kind === "subs" ? "substitute" : "player"}
        </Button>
      </div>
    );
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
              <p className="font-semibold text-slate-950">
                {match.home} {match.homeScore} - {match.awayScore} {match.away}
              </p>
              <p className="text-text-secondary">
                {match.competition} · {match.status}
                {match.timer ? ` · ${match.timer}` : ""}
              </p>
            </button>
          ))}
          {!matches.length ? (
            <p className="text-sm text-text-secondary">
              No matches assigned yet. Ask an admin to assign you to a competition or specific fixtures.
            </p>
          ) : null}
        </div>
      </Card>

      {selected ? (
        <>
          <Card title={`Update score — ${selected.home} vs ${selected.away}`}>
            {matchNotStarted ? (
              <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                This match has not started. Set status to <strong>Live</strong> first, then update scores and events.
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Field label={`${selected.home} goals`}>
                <Input
                  type="number"
                  min={0}
                  value={scores.homeScore}
                  disabled={matchNotStarted}
                  onChange={(e) => setScores({ ...scores, homeScore: Number(e.target.value) })}
                />
              </Field>
              <Field label={`${selected.away} goals`}>
                <Input
                  type="number"
                  min={0}
                  value={scores.awayScore}
                  disabled={matchNotStarted}
                  onChange={(e) => setScores({ ...scores, awayScore: Number(e.target.value) })}
                />
              </Field>
              <Field label="Status">
                <Select value={scores.status} onChange={(e) => setScores({ ...scores, status: e.target.value })}>
                  <option value="UPCOMING" disabled={selected.status !== "UPCOMING"}>
                    Upcoming
                  </option>
                  <option value="LIVE">Live</option>
                  <option value="HT" disabled={matchNotStarted}>
                    Half Time
                  </option>
                  <option value="FT" disabled={matchNotStarted}>
                    Full Time
                  </option>
                </Select>
              </Field>
              <Field label="Match clock">
                <Input
                  value={scores.timer}
                  disabled={matchNotStarted && scores.status === "UPCOMING"}
                  onChange={(e) => setScores({ ...scores, timer: e.target.value })}
                  placeholder="e.g. 67'"
                />
              </Field>
              <Field label="Venue">
                <Select value={scores.venue} onChange={(e) => setScores({ ...scores, venue: e.target.value })}>
                  {["UTG Main Field", "UTG Faraba Campus", "Independence Stadium", scores.venue]
                    .filter((v, i, arr) => v && arr.indexOf(v) === i)
                    .map((venue) => (
                      <option key={venue} value={venue}>
                        {venue}
                      </option>
                    ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Button onClick={saveMatch}>Publish to public site</Button>
            </div>
          </Card>

          <Card title="Match events">
            {selected.events?.length ? (
              <ul className="mb-4 space-y-2">
                {selected.events.map((ev, index) => (
                  <li key={`${ev.minute}-${ev.type}-${ev.player}-${index}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-950">
                      {ev.minute}&apos; · {ev.type}
                    </span>{" "}
                    <span className="text-text-secondary">
                      {ev.player} ({ev.team})
                      {ev.detail ? ` — ${ev.detail}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-text-secondary">No events recorded yet.</p>
            )}
            <form className="grid gap-4 md:grid-cols-2" onSubmit={addEvent}>
              <fieldset disabled={matchNotStarted} className="contents">
                <Field label="Minute">
                  <Input
                    type="number"
                    min={0}
                    max={130}
                    value={eventForm.minute}
                    onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Type">
                  <Select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value, detail: "" })}>
                    <option>Goal</option>
                    <option>Own Goal</option>
                    <option>Assist</option>
                    <option>Yellow Card</option>
                    <option>Red Card</option>
                    <option>Substitution</option>
                  </Select>
                </Field>
                <Field label="Team">
                  <Select
                    value={eventForm.team}
                    onChange={(e) => setEventForm({ ...eventForm, team: e.target.value, player: "", detail: "" })}
                    required
                  >
                    <option value="">Select team</option>
                    <option value={selected.home}>{selected.home}</option>
                    <option value={selected.away}>{selected.away}</option>
                  </Select>
                </Field>
                <Field label="Player">
                  {eventPlayerOptions().length ? (
                    <Select
                      value={eventForm.player}
                      onChange={(e) => setEventForm({ ...eventForm, player: e.target.value })}
                      required
                    >
                      <option value="">Select player</option>
                      {eventPlayerOptions().map((player) => (
                        <option key={player.id} value={player.name}>
                          {playerLabel(player)}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={eventForm.player}
                      onChange={(e) => setEventForm({ ...eventForm, player: e.target.value })}
                      placeholder={eventForm.team ? "No squad — type player name" : "Select a team first"}
                      required
                    />
                  )}
                </Field>
                {eventForm.type === "Substitution" ? (
                  <Field label="Player coming on">
                    {eventPlayerOptions().length ? (
                      <Select
                        value={eventForm.detail}
                        onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })}
                        required
                      >
                        <option value="">Select substitute</option>
                        {eventPlayerOptions()
                          .filter((p) => p.name !== eventForm.player)
                          .map((player) => (
                            <option key={player.id} value={player.name}>
                              {playerLabel(player)}
                            </option>
                          ))}
                      </Select>
                    ) : (
                      <Input
                        value={eventForm.detail}
                        onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })}
                        placeholder="Player coming on"
                        required
                      />
                    )}
                  </Field>
                ) : eventForm.type === "Goal" ? (
                  <Field label="Assist (optional)">
                    {eventPlayerOptions().length ? (
                      <Select value={eventForm.detail} onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })}>
                        <option value="">None</option>
                        {eventPlayerOptions()
                          .filter((p) => p.name !== eventForm.player)
                          .map((player) => (
                            <option key={player.id} value={`Assist: ${player.name}`}>
                              {playerLabel(player)}
                            </option>
                          ))}
                      </Select>
                    ) : (
                      <Input
                        value={eventForm.detail}
                        onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })}
                        placeholder="Optional assist note"
                      />
                    )}
                  </Field>
                ) : (
                  <Field label="Detail">
                    <Input value={eventForm.detail} onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })} />
                  </Field>
                )}
                <div className="md:col-span-2">
                  <Button type="submit" variant="secondary">
                    Add event
                  </Button>
                </div>
              </fieldset>
            </form>
          </Card>

          <Card title="Lineups">
            <form className="space-y-8" onSubmit={saveLineups}>
              <div className="grid gap-6 lg:grid-cols-2">
                {renderLineupEditor("home", "starting", `${selected.home} — starting XI`, homeLineup)}
                {renderLineupEditor("away", "starting", `${selected.away} — starting XI`, awayLineup)}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {renderLineupEditor("home", "subs", `${selected.home} — substitutes`, homeSubs.length ? homeSubs : [])}
                {renderLineupEditor("away", "subs", `${selected.away} — substitutes`, awaySubs.length ? awaySubs : [])}
              </div>
              <div className="flex flex-wrap gap-2">
                {!homeSubs.length ? (
                  <Button type="button" variant="ghost" onClick={() => setHomeSubs([emptyPlayer()])}>
                    + Add {selected.home} subs
                  </Button>
                ) : null}
                {!awaySubs.length ? (
                  <Button type="button" variant="ghost" onClick={() => setAwaySubs([emptyPlayer()])}>
                    + Add {selected.away} subs
                  </Button>
                ) : null}
              </div>
              <Button type="submit">Publish lineups</Button>
            </form>
          </Card>
        </>
      ) : null}

      <p className="text-sm text-text-secondary">
        Publish news and announcements in the{" "}
        <Link href="/content" className="font-semibold text-primary">
          content workspace →
        </Link>
      </p>
    </AgentShell>
  );
}
