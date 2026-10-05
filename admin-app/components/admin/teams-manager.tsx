"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormModal } from "@/components/form-modal";
import { useDialogs } from "@/components/dialog-provider";

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

export default function TeamsPage({ teamId }: { teamId?: string }) {
  const router=useRouter();
  const [loaded,setLoaded]=useState(false);
  const { confirm } = useDialogs();
  const [schools, setSchools] = useState<School[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ name: "", schoolId: "", tone: "", logo: "" });
  const [squadTeamId, setSquadTeamId] = useState<string | null>(teamId || null);
  const [squadLoading,setSquadLoading]=useState(false);
  const [squadError,setSquadError]=useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerForm, setPlayerForm] = useState({ number: "", name: "", role: "MF", position: "" });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerForm, setEditPlayerForm] = useState({ number: "", name: "", role: "MF", position: "" });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", schoolId: "", tone: "", logo: "" });
  const [message, setMessage] = useState("");
  const [activeForm, setActiveForm] = useState<string | null>(null);

  async function load() {
    setSchools(await apiJson<School[]>("/api/portal/admin/schools"));
    setTeams(await apiJson<Team[]>("/api/portal/admin/teams"));
  }

  async function loadSquad(teamId: string) {
    setSquadLoading(true);setSquadError("");
    setSquadTeamId(teamId);
    setEditingPlayerId(null);
    setPlayers([]);
    try { setPlayers(await apiJson<Player[]>(`/api/portal/admin/teams/${teamId}/players`)); }
    catch { setSquadError("Could not load this squad. Check your connection and try again."); }
    finally {setSquadLoading(false);}
  }

  useEffect(() => {
    load().then(()=>setLoaded(true)).catch(() => {setLoaded(true);setMessage("Unable to load updates. Check your connection and try again.");});
  }, []);

  useEffect(()=>{if(teamId) void loadSquad(teamId);},[teamId]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/teams", {
      method: "POST",
      body: JSON.stringify({ ...form, logo: form.logo || null })
    });
    const json = await res.json();
    setMessage(res.ok ? "Team created." : json.error || "Failed.");
    if (res.ok) {
      setActiveForm(null);
      if(json.data?.id) router.push(`/teams/${encodeURIComponent(json.data.id)}`);
      setForm({ name: "", schoolId: "", tone: "", logo: "" });
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
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
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
    }
  }

  async function removeTeam(id: string, name: string) {
    if (!(await confirm(`Delete ${name}?`))) return;
    const res = await apiFetch(`/api/portal/admin/teams/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "Team deleted." : json.error || "Failed.");
    if(res.ok) {router.push("/teams");return;}
    if (res.ok) {
      if (squadTeamId === id) setSquadTeamId(null);
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
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
      setActiveForm(null);
      setPlayerForm({ number: "", name: "", role: "MF", position: "" });
      loadSquad(squadTeamId);
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
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
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
    }
  }

  async function removePlayer(id: string) {
    if (!(await confirm("Remove this player?"))) return;
    const res = await apiFetch(`/api/portal/admin/players/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "Player removed." : json.error || "Could not remove player.");
    if (res.ok && squadTeamId) loadSquad(squadTeamId);
    void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
  }

  return (
    <AdminShell title={ teamId ? teams.find(row=>row.id === teamId)?.name || "Team details" : "Football Teams" } subtitle="Register teams, upload logos, and manage squads." nav={adminNav}>
      {teamId ? <Link href="/teams" className="admin-back-link">← Back to teams</Link> : null}
      {teamId && !loaded ? <Card><p role="status">Loading details…</p></Card> : null}
      {teamId && loaded && !teams.some(row=>row.id === teamId) && !message ? <Card><p>This record was not found. It may have been removed.</p></Card> : null}
      {!teamId ? <div className="admin-action-toolbar" aria-label="Page actions"><Button type="button" onClick={() => { setMessage(""); setActiveForm("team"); } }>Add team</Button></div> : null}
      {!teamId && !loaded ? <Card><p role="status">Loading teams…</p></Card> : null}
      {!teamId && loaded && !teams.length && !message ? <Card><p>No teams yet. Use the action above to add one.</p></Card> : null}
      {message.startsWith("Unable to load") ? <Button variant="ghost" onClick={()=>{setMessage("");setLoaded(false);load().then(()=>setLoaded(true)).catch(()=>{setLoaded(true);setMessage("Unable to load updates. Check your connection and try again.");});}}>Try again</Button> : null}
      {message ? <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <FormModal title="Add team" open={activeForm === "team"} onClose={() => setActiveForm(null)} message={message}>
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
      </FormModal>
      <Card title={teamId ? "Overview" : "All teams"}>
        <div className="grid gap-3 md:grid-cols-2">
          {teams.filter(row=>!teamId || row.id === teamId).map((team) => (
            <div key={team.id} className="rounded-[20px] bg-slate-50 p-4">
              {!teamId ? (<Link href={`/teams/${encodeURIComponent(team.id)}`} className="admin-record-link"><LogoMark name={team.name} logo={team.logo}/><div><strong>{team.name}</strong><p>{team.schoolName || "Independent"} · {team.playerCount} players</p></div><span aria-hidden="true">›</span></Link>) : editingTeamId === team.id ? (
                <FormModal title="Edit team" open={true} onClose={()=>setEditingTeamId(null)} message={message}><form className="grid gap-3 md:grid-cols-2" onSubmit={async e=>{e.preventDefault();await saveTeam(team.id);}}>
                  <Input required aria-label="Team name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <Select aria-label="School" value={editForm.schoolId} onChange={(e) => setEditForm({ ...editForm, schoolId: e.target.value })}>
                    <option value="">No school</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    aria-label="Description" value={editForm.tone}
                    onChange={(e) => setEditForm({ ...editForm, tone: e.target.value })}
                    placeholder="Description"
                  />
                  <LogoUpload value={editForm.logo} onChange={(logo) => setEditForm({ ...editForm, logo })} />
                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingTeamId(null)}>
                      Cancel
                    </Button>
                  </div>
                </form></FormModal>
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
      {squadTeamId && teams.some(t=>t.id===squadTeamId) ? (
        <Card title={`Squad — ${teams.find((t) => t.id === squadTeamId)?.name}`}>
          <Button type="button" className="mb-4" onClick={() => { setMessage(""); setActiveForm("player"); }}>Add player</Button>
          <FormModal title="Add player" open={activeForm === "player"} onClose={() => setActiveForm(null)} message={message}>
          <form className="mb-4 grid gap-3 md:grid-cols-5" onSubmit={addPlayer}>
            <Input
              type="number"
              min={1}
              placeholder="#"
              aria-label="Shirt number" value={playerForm.number}
              onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
              required
            />
            <Input
              placeholder="Player name"
              aria-label="Player name" value={playerForm.name}
              onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
              required
              className="md:col-span-2"
            />
            <Select aria-label="Playing role" value={playerForm.role} onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value })}>
              <option value="GK">GK</option>
              <option value="DF">DF</option>
              <option value="MF">MF</option>
              <option value="FW">FW</option>
            </Select>
            <Select aria-label="Position" value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}>
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
          </FormModal>
          {squadLoading ? <p role="status">Loading squad…</p> : null}
          {squadError ? <div role="alert"><p>{squadError}</p><Button variant="ghost" onClick={()=>loadSquad(squadTeamId)}>Try again</Button></div> : null}
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                {editingPlayerId === p.id ? (
                  <FormModal title="Edit player" open={true} onClose={()=>setEditingPlayerId(null)} message={message}><form className="grid gap-3 md:grid-cols-2" onSubmit={async e=>{e.preventDefault();await savePlayer(p.id);}}>
                    <Input
                      type="number"
                      min={1}
                      required aria-label="Shirt number" value={editPlayerForm.number}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, number: e.target.value })}
                    />
                    <Input
                      required aria-label="Player name" value={editPlayerForm.name}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, name: e.target.value })}
                      className="md:col-span-2"
                    />
                    <Select
                      aria-label="Playing role" value={editPlayerForm.role}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, role: e.target.value })}
                    >
                      <option value="GK">GK</option>
                      <option value="DF">DF</option>
                      <option value="MF">MF</option>
                      <option value="FW">FW</option>
                    </Select>
                    <Select
                      aria-label="Position" value={editPlayerForm.position}
                      onChange={(e) => setEditPlayerForm({ ...editPlayerForm, position: e.target.value })}
                    >
                      <option value="">Position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </Select>
                    <div className="flex gap-2 md:col-span-5">
                      <Button type="submit">Save</Button>
                      <Button type="button" variant="ghost" onClick={() => setEditingPlayerId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form></FormModal>
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
            {!squadLoading && !squadError && !players.length ? <p className="text-sm text-text-secondary">No players yet.</p> : null}
          </div>
        </Card>
      ) : null}
    </AdminShell>
  );
}
