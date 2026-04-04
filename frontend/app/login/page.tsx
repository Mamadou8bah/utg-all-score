"use client";

import { useState } from "react";
import { Button, Input, PageHeader } from "@/components/ui";

export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="page-shell section-space">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[36px] bg-slate-950 p-8 text-white shadow-float">
          <p className="text-sm uppercase tracking-[0.32em] text-white/55">UTG AllScore Admin</p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight">Secure sports operations access.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72">Built for verified updates, fast publishing, and simple matchday workflows across the university sports office.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Biometric-ready UX", "Role-based dashboard", "Clean mobile auth"].map((item) => <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm">{item}</div>)}
          </div>
        </section>
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card">
          <PageHeader eyebrow="Login / Auth" title="Sign in" description="Minimal inputs, clear hierarchy, and touch-friendly form controls for staff and faculty operators." />
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-950">Email</label>
              <Input type="email" placeholder="sports.office@utg.edu.gm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-950">Password</label>
              <Input type="password" placeholder="Enter password" />
            </div>
            <Button type="submit" className="w-full">Continue to dashboard</Button>
            {submitted ? <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">Demo submission captured. Connect your auth provider to complete sign-in flow.</p> : null}
          </form>
        </section>
      </div>
    </div>
  );
}
