"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, saveToken } from "@/lib/api";
import { APP_LOGO, APP_NAME } from "@/lib/branding";
import { Button, Card, Input } from "@/components/ui";

export default function AgentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, expectedRole: "AGENT" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      saveToken(json.data.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell flex min-h-screen items-center py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[36px] border border-slate-100 bg-slate-950 p-8 text-white shadow-float">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt={APP_NAME} className="h-14 w-14 object-contain" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary/80">{APP_NAME}</p>
              <p className="text-sm font-bold text-white/90">Agent Application</p>
            </div>
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-5xl">School Matchday Console</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
            Update live football scores, match events, lineups, and news for your school. Changes publish instantly to the public AllScore site.
          </p>
        </section>
        <Card title="Agent sign in">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Enter agent app"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-text-secondary">Use credentials provided by the UTGSU admin.</p>
        </Card>
      </div>
    </div>
  );
}
