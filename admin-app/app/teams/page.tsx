"use client";

import { useEffect, useState } from "react";
import { AdminShell, Button, Card, Field, Input, LogoMark, Select } from "@/components/ui";
import { LogoUpload } from "@/components/logo-upload";
import { adminNav } from "@/lib/nav";
import { apiFetch, apiJson } from "@/lib/api";

type School = { id: string; name: string };
type Team = {
  id: string;
  name: string;
  schoolName: string | null;
  playerCount: number;
  logo?: string | null;
  schoolId?: string | null;
  tone?: string | null;
};
type Player = { id: string; number: number; name: string; role: string; position?: string | null };

export default function TeamsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ name: "", schoolId: "", tone: "", logo: "" });
  const [squadTeamId, setSquadTeamId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerForm, setPlayerForm] = useState({ number: "", name: "", role: "MF", position: "" });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerForm, setEditPlayerForm] = useState({ number: "", name: "", role: "MF", position: "" });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", schoolId: "", tone: "", logo: "" });
  const [message, setMessage] = useState("");

  async function load() {
    setSchools(await apiJson<School[]>("/api/portal/admin/schools"));
    setTeams(await apiJson<Team[]>("/api/portal/admin/teams"));
  }

  async function loadSquad(teamId: string) {
    setSquadTeamId(teamId);
    setEditingPlayerId(null);
    setPlayers(await apiJson<Player[]>(`/api/portal/admin/teams/${teamId}/players`));
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/teams", {
      method: "POST",
      body: JSON.stringify({ ...form, logo: form.logo || null })
    });
    const json = await res.json();
    setMessage(res.ok ? "Team created." : json.error || "Failed.");
    if (res.ok) {
      setForm({ name: "", schoolId: "", tone: "", logo: "" });
      load();
    }
  }

  async function saveTeam(id: string) {
    const res = await apiFetch(`/api/portal/admin/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...editForm, logo: editForm.logo || null })
    });
    const json = await res.json();
    setMessage(res.ok ? "Team updated." : json.error || "Failed.");
    if (res.ok) {
      setEditingTeamId(null);
      load();
    }
  }

  async function removeTeam(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    const res = await apiFetch(`/api/portal/admin/teams/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "Team deleted." : json.error || "Failed.");
    if (res.ok) {
      if (squadTeamId === id) setSquadTeamId(null);
      load();
    }
  }

  async function addPlayer(event: React.FormEvent) {
    event.preventDefault();
    if (!squadTeamId) return;
    const res = await apiFetch(`/api/portal/admin/teams/${squadTeamId}/players`, {
      method: "POST",
      body: JSON.stringify({
        ...playerForm,
        number: Number(playerForm.number),
        position: playerForm.position || null
      })
    });
    const json = await res.json();
    setMessage(res.ok ? "Player added." : json.error || "Failed.");
    if (res.ok) {
      setPlayerForm({ number: "", name: "", role: "MF", position: "" });
      loadSquad(squadTeamId);
      load();
    }
  }

  async function savePlayer(id: string) {
    const res = await apiFetch(`/api/portal/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...editPlayerForm,
        number: Number(editPlayerForm.number),
        position: editPlayerForm.position || null
      })
    });
    const json = await res.json();
    setMessage(res.ok ? "Player updated." : json.error || "Failed.");
    if (res.ok && squadTeamId) {
      setEditingPlayerId(null);
      loadSquad(squadTeamId);
      load();
    }
  }

  async function removePlayer(id: string) {
    if (!confirm("Remove this player?")) return;
    const res = await apiFetch(`/api/portal/admin/players/${id}`, { method: "DELETE" });
    if (res.ok && squadTeamId) loadSquad(squadTeamId);
    load();
  }

  return (
    <AdminShell title="Football Teams" subtitle="Register teams, upload logos, and manage squads." nav={adminNav}>
      {message ? <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <Card title="Add team">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Team name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="School">
            <Select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })}>
              <option value="">Optional school link</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description">
            <Input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className="md:col-span-2" />
          </Field>
          <div className="md:col-span-2">
            <LogoUpload value={form.logo} onChange={(logo) => setForm({ ...form, logo })} label="Team logo" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Create team</Button>
          </div>
        </form>
      </Card>
      <Card title="All teams">
        <div className="grid gap-3 md:grid-cols-2">
          {teams.map((team) => (
            <div key={team.id} className="rounded-[20px] bg-slate-50 p-4">
              {editingTeamId === team.id ? (
                <div className="space-y-3">
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <Select value={editForm.schoolId} onChange={(e) => setEditForm({ ...editForm, schoolId: e.target.value })}>
                    <option value="">No school</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={editForm.tone}
                    onChange={(e) => setEditForm({ ...editForm, tone: e.target.value })}
                    placeholder="Description"
                  />
                  <LogoUpload value={editForm.logo} onChange={(logo) => setEditForm({ ...editForm, logo })} />
                  <div className="flex gap-2">
                    <Button onClick={() => saveTeam(team.id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingTeamId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <LogoMark name={team.name} logo={team.logo} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-950">{team.name}</p>
                    <p className="text-sm text-text-secondary">{team.schoolName ?? "Independent"}</p>
                    <p className="mt-1 text-xs font-semibold text-primary">{team.playerCount} squad players</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => loadSquad(team.id)}>
                        Squad
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingTeamId(team.id);
                          setEditForm({
                            name: team.name,
                            schoolId: team.schoolId ?? "",
                            tone: team.tone ?? "",
                            logo: team.logo ?? ""
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => removeTeam(team.id, team.name)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      {squadTeamId ? (
        <Card title={`Squad — ${teams.find((t) => t.id === squadTeamId)?.name}`}>
          <form className="mb-4 grid gap-3 md:grid-cols-5" onSubmit={addPlayer}>
            <Input
              type="number"
              min={1}
              placeholder="#"
              value={playerForm.number}
              onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
              required
            />
            <Input
              placeholder="Player name"
              value={playerForm.name}
              onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
              required
              className="md:col-span-2"
            />
            <Select value={playerForm.role} onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value })}>
              <option value="GK">GK</option>
              <option value="DF">DF</option>
              <option value="MF">MF</option>
              <option value="FW">FW</option>
            </Select>
            <Select value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}>
              <option value="">Position (optional)</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </Select>
            <div className="md:col-span-5">
              <Button type="submit" variant="secondary">
                Add player
              </Button>
            </div>
          </form>
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                {editingPlayerId === p.id ? (
                  <div className="grid gap-2 md:grid-cols-5">
                    <Input
                      type="number"
                      min={1}
                      value={editPlayerForm.number}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, number: e.target.value })}
                    />
                    <Input
                      value={editPlayerForm.name}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, name: e.target.value })}
                      className="md:col-span-2"
                    />
                    <Select
                      value={editPlayerForm.role}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, role: e.target.value })}
                    >
                      <option value="GK">GK</option>
                      <option value="DF">DF</option>
                      <option value="MF">MF</option>
                      <option value="FW">FW</option>
                    </Select>
                    <Select
                      value={editPlayerForm.position}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, position: e.target.value })}
                    >
                      <option value="">Position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </Select>
                    <div className="flex gap-2 md:col-span-5">
                      <Button onClick={() => savePlayer(p.id)}>Save</Button>
                      <Button variant="ghost" onClick={() => setEditingPlayerId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-950">
                      #{p.number} {p.name}{" "}
                      <span className="text-text-secondary">
                        ({p.role}
                        {p.position ? ` · ${p.position}` : ""})
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingPlayerId(p.id);
                          setEditPlayerForm({
                            number: String(p.number),
                            name: p.name,
                            role: p.role,
                            position: p.position ?? ""
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => removePlayer(p.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!players.length ? <p className="text-sm text-text-secondary">No players yet.</p> : null}
          </div>
        </Card>
      ) : null}
    </AdminShell>
  );
}
