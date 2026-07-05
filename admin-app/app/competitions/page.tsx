"use client";



import { useEffect, useState } from "react";

import { AdminShell, Button, Card, Field, Input, LogoMark, Select, Textarea } from "@/components/ui";

import { LogoUpload } from "@/components/logo-upload";

import { adminNav } from "@/lib/nav";

import { apiFetch, apiJson } from "@/lib/api";



type School = { id: string; name: string };

type Team = { id: string; name: string };

type Competition = { id: string; name: string; slug: string; type: string; format: string; teamCount: number; matchCount: number; groupCount: number; logo?: string | null; description?: string; schoolId?: string | null };

type Entry = { competitionId: string; teamId: string; teamName: string; competitionName: string };



export default function CompetitionsPage() {

  const [schools, setSchools] = useState<School[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);

  const [competitions, setCompetitions] = useState<Competition[]>([]);

  const [entries, setEntries] = useState<Entry[]>([]);

  const [form, setForm] = useState({ name: "", slug: "", type: "GENERAL", format: "LEAGUE", description: "", schoolId: "", logo: "" });

  const [linkForm, setLinkForm] = useState({ competitionId: "", teamId: "" });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({ name: "", slug: "", type: "GENERAL", format: "LEAGUE", description: "", schoolId: "", logo: "" });

  const [message, setMessage] = useState("");



  async function load() {

    setSchools(await apiJson<School[]>("/api/portal/admin/schools"));

    setTeams(await apiJson<Team[]>("/api/portal/admin/teams"));

    setCompetitions(await apiJson<Competition[]>("/api/portal/admin/competitions"));

    setEntries(await apiJson<Entry[]>("/api/portal/admin/competition-teams"));

  }



  useEffect(() => {

    load().catch(() => {});

  }, []);



  async function handleCreate(event: React.FormEvent) {

    event.preventDefault();

    const res = await apiFetch("/api/portal/admin/competitions", {

      method: "POST",

      body: JSON.stringify({ ...form, schoolId: form.type === "SCHOOL" ? form.schoolId : null, logo: form.logo || null })

    });

    const json = await res.json();

    setMessage(res.ok ? "Competition created." : json.error || "Failed.");

    if (res.ok) {

      setForm({ name: "", slug: "", type: "GENERAL", format: "LEAGUE", description: "", schoolId: "", logo: "" });

      load();

    }

  }



  async function saveEdit(id: string) {

    const res = await apiFetch(`/api/portal/admin/competitions/${id}`, {

      method: "PATCH",

      body: JSON.stringify({ ...editForm, schoolId: editForm.type === "SCHOOL" ? editForm.schoolId : null, logo: editForm.logo || null })

    });

    const json = await res.json();

    setMessage(res.ok ? "Competition updated." : json.error || "Failed.");

    if (res.ok) {

      setEditingId(null);

      load();

    }

  }



  async function remove(id: string, name: string) {

    if (!confirm(`Delete ${name} and all its matches?`)) return;

    const res = await apiFetch(`/api/portal/admin/competitions/${id}`, { method: "DELETE" });

    const json = await res.json();

    setMessage(res.ok ? "Competition deleted." : json.error || "Failed.");

    if (res.ok) load();

  }



  async function handleLink(event: React.FormEvent) {

    event.preventDefault();

    const res = await apiFetch("/api/portal/admin/competition-teams", { method: "POST", body: JSON.stringify(linkForm) });

    const json = await res.json();

    setMessage(res.ok ? "Team linked." : json.error || "Failed.");

    if (res.ok) load();

  }



  async function unlink(competitionId: string, teamId: string) {

    const res = await apiFetch("/api/portal/admin/competition-teams", {

      method: "DELETE",

      body: JSON.stringify({ competitionId, teamId })

    });

    const json = await res.json();

    setMessage(res.ok ? "Team unlinked." : json.error || "Failed.");

    if (res.ok) load();

  }



  async function generateFixtures(competitionId: string, name: string) {

    const startDate = prompt(`Start date for ${name} fixtures (YYYY-MM-DD)`, new Date().toISOString().slice(0, 10));

    if (!startDate) return;

    const res = await apiFetch(`/api/portal/admin/competitions/${competitionId}/generate-fixtures`, {

      method: "POST",

      body: JSON.stringify({ startDate })

    });

    const json = await res.json();

    setMessage(res.ok ? `Generated ${json.data?.count ?? 0} fixtures.` : json.error || "Failed.");

    if (res.ok) load();

  }



  async function qualifyGroups(competitionId: string, name: string) {

    const advanceRaw = prompt(
      `Teams to advance per group for ${name} (1 = group winners, 2 = top two):`,
      "1"
    );

    if (advanceRaw === null) return;

    const advancePerGroup = advanceRaw === "2" ? 2 : 1;
    const startDate = prompt(`Knockout start date (YYYY-MM-DD)`, new Date().toISOString().slice(0, 10));

    if (!startDate) return;

    const res = await apiFetch(`/api/portal/admin/competitions/${competitionId}/qualify-groups`, {

      method: "POST",

      body: JSON.stringify({ advancePerGroup, startDate })

    });

    const json = await res.json();

    if (res.ok) {
      const data = json.data;
      setMessage(
        `Qualified ${data?.qualified?.length ?? 0} teams. Updated ${data?.updatedCount ?? 0}, created ${data?.createdCount ?? 0} knockout fixtures.`
      );
      load();
    } else {
      setMessage(json.error || "Failed.");
    }

  }



  return (

    <AdminShell title="Competitions" subtitle="VC Tournament, Unity Shield, ITCA League, and school cups." nav={adminNav}>

      {message ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p> : null}

      <Card title="Create competition">

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>

          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>

          <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></Field>

          <Field label="Type">

            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>

              <option value="GENERAL">General (UTGSU-wide)</option>

              <option value="SCHOOL">School internal</option>

            </Select>

          </Field>

          <Field label="Format">

            <Select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>

              <option value="LEAGUE">League</option>

              <option value="TOURNAMENT">Tournament</option>

            </Select>

          </Field>

          {form.type === "SCHOOL" ? (

            <Field label="School">

              <Select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} required>

                <option value="">Select school</option>

                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}

              </Select>

            </Field>

          ) : null}

          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2" required /></Field>

          <div className="sm:col-span-2"><LogoUpload value={form.logo} onChange={(logo) => setForm({ ...form, logo })} label="Competition logo" /></div>

          <div className="sm:col-span-2"><Button type="submit" className="w-full sm:w-auto">Create competition</Button></div>

        </form>

      </Card>

      <Card title="Add team to competition">

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleLink}>

          <Field label="Competition">

            <Select value={linkForm.competitionId} onChange={(e) => setLinkForm({ ...linkForm, competitionId: e.target.value })} required>

              <option value="">Select competition</option>

              {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}

            </Select>

          </Field>

          <Field label="Team">

            <Select value={linkForm.teamId} onChange={(e) => setLinkForm({ ...linkForm, teamId: e.target.value })} required>

              <option value="">Select team</option>

              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}

            </Select>

          </Field>

          <div className="sm:col-span-2"><Button type="submit" variant="secondary" className="w-full sm:w-auto">Link team</Button></div>

        </form>

      </Card>

      <Card title="Linked teams">

        <div className="space-y-2">

          {entries.map((e) => (

            <div key={`${e.competitionId}-${e.teamId}`} className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">

              <span className="min-w-0"><strong>{e.teamName}</strong> in {e.competitionName}</span>

              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => unlink(e.competitionId, e.teamId)}>Unlink</Button>

            </div>

          ))}

          {!entries.length ? <p className="text-sm text-text-secondary">No teams linked yet.</p> : null}

        </div>

      </Card>

      <Card title="Active competitions">

        <div className="space-y-3">

          {competitions.map((c) => (

            <div key={c.id} className="rounded-[20px] bg-slate-50 p-4">

              {editingId === c.id ? (

                <div className="grid gap-3 sm:grid-cols-2">

                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />

                  <Input value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} />

                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="sm:col-span-2" />

                  <div className="sm:col-span-2"><LogoUpload value={editForm.logo} onChange={(logo) => setEditForm({ ...editForm, logo })} /></div>

                  <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">

                    <Button onClick={() => saveEdit(c.id)}>Save</Button>

                    <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>

                  </div>

                </div>

              ) : (

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                  <LogoMark name={c.name} logo={c.logo} />

                  <div className="min-w-0 flex-1">

                    <p className="font-semibold text-slate-950">{c.name}</p>

                    <p className="text-sm text-text-secondary">{c.type} · {c.format} · {c.slug}</p>

                    <p className="mt-1 text-xs font-semibold text-primary">{c.teamCount} teams · {c.matchCount} matches{c.groupCount ? ` · ${c.groupCount} groups` : ""}</p>

                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">

                    {c.format === "LEAGUE" ? (
                      <Button variant="secondary" className="w-full sm:w-auto" onClick={() => generateFixtures(c.id, c.name)}>Generate fixtures</Button>
                    ) : null}

                    {c.format === "TOURNAMENT" && c.groupCount > 0 ? (
                      <Button variant="secondary" className="w-full sm:w-auto" onClick={() => qualifyGroups(c.id, c.name)}>Qualify to knockout</Button>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" onClick={() => { setEditingId(c.id); setEditForm({ name: c.name, slug: c.slug, type: c.type, format: c.format, description: c.description ?? "", schoolId: c.schoolId ?? "", logo: c.logo ?? "" }); }}>Edit</Button>

                    <Button variant="ghost" onClick={() => remove(c.id, c.name)}>Delete</Button>
                    </div>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>

      </Card>

    </AdminShell>

  );

}

