"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormModal } from "@/components/form-modal";
import { useDialogs } from "@/components/dialog-provider";

import { useEffect, useState } from "react";
import { AdminShell, Button, Card, Field, Input } from "@/components/ui";
import { adminNav } from "@/lib/nav";
import { apiFetch, apiJson } from "@/lib/api";

type School = { id: string; name: string; shortName: string };

export default function SchoolsPage({ schoolId }: { schoolId?: string }) {
  const router=useRouter();
  const [loaded,setLoaded]=useState(false);
  const { confirm } = useDialogs();
  const [schools, setSchools] = useState<School[]>([]);
  const [form, setForm] = useState({ name: "", shortName: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", shortName: "" });
  const [message, setMessage] = useState("");
  const [activeForm, setActiveForm] = useState<string | null>(null);

  async function load() {
    setSchools(await apiJson<School[]>("/api/portal/admin/schools"));
  }

  useEffect(() => {
    load().then(()=>setLoaded(true)).catch(() => {setLoaded(true);setMessage("Unable to load updates. Check your connection and try again.");});
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/admin/schools", { method: "POST", body: JSON.stringify(form) });
    const json = await res.json();
    setMessage(res.ok ? "School created." : json.error || "Failed.");
    if (res.ok) {
      setActiveForm(null);
      if(json.data?.id) router.push(`/schools/${encodeURIComponent(json.data.id)}`);
      setForm({ name: "", shortName: "" });
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
    }
  }

  async function saveEdit(id: string) {
    const res = await apiFetch(`/api/portal/admin/schools/${id}`, { method: "PATCH", body: JSON.stringify(editForm) });
    const json = await res.json();
    setMessage(res.ok ? "School updated." : json.error || "Failed.");
    if (res.ok) {
      setEditingId(null);
      void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
    }
  }

  async function remove(id: string, name: string) {
    if (!(await confirm(`Delete ${name}?`))) return;
    const res = await apiFetch(`/api/portal/admin/schools/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(res.ok ? "School deleted." : json.error || "Failed.");
    if(res.ok) {router.push("/schools");return;}
    if (res.ok) void load().catch(() => setMessage("Could not refresh the latest data. Check your connection and try again."));
  }

  return (
    <AdminShell title={ schoolId ? schools.find(row=>row.id === schoolId)?.name || "Loading details" : "Schools" } subtitle="UTG faculties and schools for agents and teams." nav={adminNav}>
      {schoolId ? <Link href="/schools" className="admin-back-link">← Back to schools</Link> : null}
      {schoolId && !loaded ? <Card><p role="status">Loading details…</p></Card> : null}
      {schoolId && loaded && !schools.some(row=>row.id === schoolId) && !message ? <Card><p>This record was not found. It may have been removed.</p></Card> : null}
      {!schoolId ? <div className="admin-action-toolbar" aria-label="Page actions"><Button type="button" onClick={() => { setMessage(""); setActiveForm("school"); } }>Add school</Button></div> : null}
      {!schoolId && !loaded ? <Card><p role="status">Loading schools…</p></Card> : null}
      {!schoolId && loaded && !schools.length && !message ? <Card><p>No schools yet. Use the action above to add one.</p></Card> : null}
      {message.startsWith("Unable to load") ? <Button variant="ghost" onClick={()=>{setMessage("");setLoaded(false);load().then(()=>setLoaded(true)).catch(()=>{setLoaded(true);setMessage("Unable to load updates. Check your connection and try again.");});}}>Try again</Button> : null}
      {message ? <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <FormModal title="Add school" open={activeForm === "school"} onClose={() => setActiveForm(null)} message={message}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Short name"><Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="e.g. ICT" /></Field>
          <div className="md:col-span-2"><Button type="submit">Create school</Button></div>
        </form>
      </FormModal>
      <Card title={schoolId ? "Overview" : "All schools"}>
        <div className="space-y-3">
          {schools.filter(row=>!schoolId || row.id === schoolId).map((school) => (
            <div key={school.id} className="rounded-[20px] bg-slate-50 p-4">
              {!schoolId ? (<Link href={`/schools/${encodeURIComponent(school.id)}`} className="admin-record-link"><div><strong>{school.name}</strong><p>{school.shortName}</p></div><span aria-hidden="true">›</span></Link>) : editingId === school.id ? (
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
