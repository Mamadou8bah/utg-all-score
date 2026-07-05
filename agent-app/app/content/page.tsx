"use client";

import { useEffect, useState } from "react";
import { AgentShell, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { apiFetch, apiJson, logout } from "@/lib/api";
import { agentNav } from "@/lib/nav";

type NewsItem = { id: string; title: string; excerpt: string; category: string; publishedAt: string };
type AnnouncementItem = { id: string; title: string; body: string; level: string; createdAt: string };

export default function AgentContentPage() {
  const [message, setMessage] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newsForm, setNewsForm] = useState({ title: "", excerpt: "", body: "", category: "UTGSU Football", image: "" });
  const [alertForm, setAlertForm] = useState({ title: "", body: "", level: "info" });

  async function load() {
    const data = await apiJson<{ news: NewsItem[]; announcements: AnnouncementItem[] }>("/api/portal/content");
    setNews(data.news);
    setAnnouncements(data.announcements);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function publishNews(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/content", {
      method: "POST",
      body: JSON.stringify({
        type: "news",
        ...newsForm,
        image: newsForm.image || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop"
      })
    });
    setMessage(res.ok ? "News published." : "Failed to publish news.");
    if (res.ok) {
      setNewsForm({ title: "", excerpt: "", body: "", category: "UTGSU Football", image: "" });
      load();
    }
  }

  async function publishAlert(event: React.FormEvent) {
    event.preventDefault();
    const res = await apiFetch("/api/portal/content", {
      method: "POST",
      body: JSON.stringify({ type: "announcement", ...alertForm })
    });
    setMessage(res.ok ? "Announcement published." : "Failed to publish announcement.");
    if (res.ok) {
      setAlertForm({ title: "", body: "", level: "info" });
      load();
    }
  }

  async function remove(type: "news" | "announcement", id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await apiFetch("/api/portal/content", { method: "DELETE", body: JSON.stringify({ type, id }) });
    setMessage(res.ok ? "Deleted." : "Failed to delete.");
    if (res.ok) load();
  }

  return (
    <AgentShell title="News & Announcements" subtitle="Publish football updates to the public AllScore site." nav={agentNav} onLogout={logout}>
      {message ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p> : null}
      <Card title="Football news article">
        <form className="grid gap-4" onSubmit={publishNews}>
          <Field label="Title"><Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required /></Field>
          <Field label="Excerpt"><Input value={newsForm.excerpt} onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })} required /></Field>
          <Field label="Category">
            <Select value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}>
              <option>Match Report</option>
              <option>UTGSU Football</option>
              <option>Transfer News</option>
            </Select>
          </Field>
          <ImageUpload value={newsForm.image} onChange={(image) => setNewsForm({ ...newsForm, image })} label="Cover image" />
          <Field label="Body"><Textarea value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} /></Field>
          <Button type="submit">Publish news</Button>
        </form>
      </Card>
      <Card title="Campus football announcement">
        <form className="grid gap-4" onSubmit={publishAlert}>
          <Field label="Title"><Input value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} required /></Field>
          <Field label="Message"><Textarea value={alertForm.body} onChange={(e) => setAlertForm({ ...alertForm, body: e.target.value })} required /></Field>
          <Field label="Level">
            <Select value={alertForm.level} onChange={(e) => setAlertForm({ ...alertForm, level: e.target.value })}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
            </Select>
          </Field>
          <Button type="submit" variant="secondary">Publish announcement</Button>
        </form>
      </Card>
      <Card title="Your published news">
        <div className="space-y-2">
          {news.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="text-text-secondary">{item.category} · {new Date(item.publishedAt).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" onClick={() => remove("news", item.id)}>Delete</Button>
            </div>
          ))}
          {!news.length ? <p className="text-sm text-text-secondary">No news published yet.</p> : null}
        </div>
      </Card>
      <Card title="Your announcements">
        <div className="space-y-2">
          {announcements.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="text-text-secondary">{item.level} · {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" onClick={() => remove("announcement", item.id)}>Delete</Button>
            </div>
          ))}
          {!announcements.length ? <p className="text-sm text-text-secondary">No announcements yet.</p> : null}
        </div>
      </Card>
    </AgentShell>
  );
}
