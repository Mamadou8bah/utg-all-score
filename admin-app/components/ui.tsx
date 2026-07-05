"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PUBLIC_SITE_URL } from "@/lib/api";
import { APP_LOGO, APP_NAME } from "@/lib/branding";

export function AdminShell({
  title,
  subtitle,
  nav,
  children,
  onLogout
}: {
  title: string;
  subtitle: string;
  nav: Array<{ href: string; label: string }>;
  children: ReactNode;
  onLogout?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-background/95 backdrop-blur-xl">
        <div className="page-shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_NAME} className="h-10 w-10 object-contain" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">{APP_NAME}</p>
              <p className="text-sm font-bold text-slate-950">Admin</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Admin
            </span>
            {onLogout ? (
              <button
                onClick={onLogout}
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="page-shell section-space grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[32px] bg-slate-950 p-4 text-white shadow-float">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white/55">Administration</p>
          <nav className="mt-2 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-white/10",
                  pathname === item.href && "bg-white text-slate-950"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-white/10 px-3 pt-4">
            <a href={PUBLIC_SITE_URL} className="text-sm text-white/70 transition hover:text-white">
              ← Public AllScore site
            </a>
          </div>
        </aside>

        <main className="space-y-6 animate-slideUp">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">UTGSU Football</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary md:text-base">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-card">
      {title ? <h2 className="mb-4 text-lg font-semibold text-slate-950">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        props.className
      )}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:opacity-50",
        variant === "primary" && "bg-primary text-white shadow-float hover:-translate-y-0.5 hover:bg-primary/90",
        variant === "secondary" && "bg-secondary text-slate-950 hover:bg-secondary/90",
        variant === "ghost" && "border border-slate-200 bg-white text-slate-950 hover:bg-slate-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function LogoMark({ name, logo, size = "md" }: { name: string; logo?: string | null; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-10 w-10 rounded-xl" : "h-14 w-14 rounded-[20px]";
  const img = size === "sm" ? "h-7 w-7" : "h-10 w-10";

  return (
    <div className={cn("flex shrink-0 items-center justify-center bg-slate-50 ring-1 ring-slate-100", box)}>
      {logo ? (
        <img src={logo} alt={name} className={cn(img, "object-contain")} />
      ) : (
        <span className="text-lg font-black text-slate-400">{name[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}
