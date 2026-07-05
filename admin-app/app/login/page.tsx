"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";
import { APP_LOGO, APP_NAME } from "@/lib/branding";
import { Button, Card, Input } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">{APP_NAME}</p>
              <p className="text-sm font-bold text-white">Admin Application</p>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:mt-8 sm:text-5xl">Football Admin</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:mt-5 sm:max-w-xl sm:text-base">
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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">{error}</p> : null}
            <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
              {loading ? "Signing in..." : "Enter admin app"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
