"use client";

import { useEffect, useState } from "react";
import { AdminShell, Button, Card, Field, Input } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiFetch, apiJson, logout } from "@/lib/api";

type School = { id: string; name: string; shortName: string };

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [form, setForm] = useState({ name: "", shortName: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", shortName: "" });
  const [message, setMessage] = useState("");

  async function load() {
    setSchools(await apiJson<School[]>("/api/portal/admin/schools"));
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/schools", { method: "POST", body: JSON.stringify(form) });
    const json = await res.json();
    setMessage(res.ok ? "School created." : json.error || "Failed.");
    if (res.ok) {
      setForm({ name: "", shortName: "" });
      load();
    }
  }

  async function saveEdit(id: string) {
    const res = await apiFetch(`/api/portal/admin/schools/${id}`, { method: "PATCH", body: JSON.stringify(editForm) });
    const json = await res.json();
    setMessage(res.ok ? "School updated." : json.error || "Failed.");
    if (res.ok) {
      setEditingId(null);
      load();
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    const res = await apiFetch(`/api/portal/admin/schools/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "School deleted." : json.error || "Failed.");
    if (res.ok) load();
  }

  return (
    <AdminShell title="Schools" subtitle="UTG faculties and schools for agents and teams." nav={adminNav} onLogout={logout}>
      {message ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <Card title="Add school">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Short name"><Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="e.g. ICT" /></Field>
          <div className="md:col-span-2"><Button type="submit">Create school</Button></div>
        </form>
      </Card>
      <Card title="All schools">
        <div className="space-y-3">
          {schools.map((school) => (
            <div key={school.id} className="rounded-[20px] bg-slate-50 p-4">
              {editingId === school.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <Input value={editForm.shortName} onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })} />
                  <div className="flex gap-2 md:col-span-2">
                    <Button onClick={() => saveEdit(school.id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{school.name}</p>
                    <p className="text-sm text-text-secondary">{school.shortName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setEditingId(school.id); setEditForm({ name: school.name, shortName: school.shortName }); }}>Edit</Button>
                    <Button variant="ghost" onClick={() => remove(school.id, school.name)}>Delete</Button>
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
