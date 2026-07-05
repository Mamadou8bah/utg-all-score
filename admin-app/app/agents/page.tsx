"use client";

import { useEffect, useState } from "react";
import { AdminShell, Button, Card, Field, Input, Select } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiFetch, apiJson, logout } from "@/lib/api";

type School = { id: string; name: string };
type Agent = { id: string; email: string; name: string; schoolName: string | null; active: boolean; schoolId?: string | null };

export default function AgentsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", schoolId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", schoolId: "", active: true, password: "" });
  const [message, setMessage] = useState("");

  async function load() {
    setSchools(await apiJson<School[]>("/api/portal/admin/schools"));
    setAgents(await apiJson<Agent[]>("/api/portal/admin/agents"));
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/agents", { method: "POST", body: JSON.stringify(form) });
    const json = await res.json();
    setMessage(res.ok ? "Agent created." : json.error || "Failed.");
    if (res.ok) {
      setForm({ name: "", email: "", password: "", schoolId: "" });
      load();
    }
  }

  async function saveEdit(id: string) {
    const payload: Record<string, unknown> = { name: editForm.name, schoolId: editForm.schoolId, active: editForm.active };
    if (editForm.password) payload.password = editForm.password;
    const res = await apiFetch(`/api/portal/admin/agents/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    const json = await res.json();
    setMessage(res.ok ? "Agent updated." : json.error || "Failed.");
    if (res.ok) {
      setEditingId(null);
      load();
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete agent ${name}?`)) return;
    const res = await apiFetch(`/api/portal/admin/agents/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "Agent deleted." : json.error || "Failed.");
    if (res.ok) load();
  }

  return (
    <AdminShell title="School Agents" subtitle="Add agents tied to UTG schools." nav={adminNav} onLogout={logout}>
      {message ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <Card title="Create agent">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
          <Field label="Temporary password"><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></Field>
          <Field label="School">
            <Select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} required>
              <option value="">Select school</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <div className="md:col-span-2"><Button type="submit">Add agent</Button></div>
        </form>
      </Card>
      <Card title="Registered agents">
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-[20px] bg-slate-50 p-4 text-sm">
              {editingId === agent.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <Select value={editForm.schoolId} onChange={(e) => setEditForm({ ...editForm, schoolId: e.target.value })}>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                  <Input type="password" placeholder="New password (optional)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} />
                    Active account
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <Button onClick={() => saveEdit(agent.id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{agent.name} {!agent.active ? <span className="text-error">(inactive)</span> : null}</p>
                    <p className="text-text-secondary">{agent.email}</p>
                    <p className="mt-1 text-primary">{agent.schoolName ?? "No school"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setEditingId(agent.id); setEditForm({ name: agent.name, schoolId: agent.schoolId ?? "", active: agent.active, password: "" }); }}>Edit</Button>
                    <Button variant="ghost" onClick={() => remove(agent.id, agent.name)}>Delete</Button>
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
