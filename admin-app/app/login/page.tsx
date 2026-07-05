"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, saveToken } from "@/lib/api";
import { APP_LOGO, APP_NAME } from "@/lib/branding";
import { Button, Card, Input } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@utgsu.edu.gm");
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
        body: JSON.stringify({ email, password, expectedRole: "ADMIN" })
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
    <div className="flex min-h-[var(--app-height)] flex-col px-4 py-6 sm:items-center sm:justify-center sm:py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 sm:max-w-5xl sm:gap-6 lg:grid lg:max-w-5xl lg:grid-cols-[1fr_420px] lg:items-stretch">
        <section className="rounded-[28px] border border-slate-100 bg-slate-950 p-6 text-white shadow-float sm:rounded-[36px] sm:p-8">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt={APP_NAME} className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary/80">{APP_NAME}</p>
              <p className="text-sm font-bold text-white/90">Admin Application</p>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:mt-8 sm:text-5xl">UTGSU Football Admin</h1>
          <p className="mt-4 text-sm leading-7 text-white/72 sm:mt-5 sm:max-w-xl sm:text-base">
            Manage competitions, register teams with logos, and onboard school agents who update live scores on the public AllScore site.
          </p>
        </section>
        <Card title="Admin sign in">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p> : null}
            <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
              {loading ? "Signing in..." : "Enter admin app"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
