"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLIC_SITE_URL } from "@/lib/api";
import { APP_LOGO, APP_NAME } from "@/lib/branding";
import { AgentMobileNav } from "@/components/mobile-nav";
import type { AgentNavItem } from "@/lib/nav";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200", className)} />;
}

export function PortalSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32" />)}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

export function AgentShell({
  title,
  subtitle,
  nav,
  children,
  onLogout
}: {
  title: string;
  subtitle: string;
  nav: AgentNavItem[];
  children: ReactNode;
  onLogout?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="portal-shell flex flex-col">
      <header className="portal-header">
        <div className="portal-topbar">
          <Link href="/" className="portal-brand">
            <img src={APP_LOGO} alt="" className="portal-logo" />
            <span>{APP_NAME}<small>Agent</small></span>
          </Link>
          <div className="portal-actions"><a href={`${PUBLIC_SITE_URL}/search`} aria-label="Search AllScore" className="global-search-link"><Search size={21} /></a>{onLogout ? <button onClick={onLogout} aria-label="Sign out" className="portal-signout"><LogOut size={20} /></button> : null}</div>
        </div>
        <nav className="portal-desktop-nav" aria-label="Desktop navigation">
          {nav.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
          <a href={PUBLIC_SITE_URL}>Public site ↗</a>
        </nav>
      </header>
      <div className="portal-scroll">
        <main className="portal-content">
          <section className="portal-hero">
            <p className="portal-eyebrow">UTG Football · Matchday</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <a href={PUBLIC_SITE_URL} className="portal-public-link">View AllScore ↗</a>
          </section>
          <div className="portal-page">{children}</div>
        </main>
      </div>
      <AgentMobileNav />
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="portal-card">
      {title ? <h2 className="portal-card-title">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block space-y-2">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100",
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
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100",
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
        "min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100",
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
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none",
        variant === "primary" && "bg-primary text-white hover:bg-[#08145f]",
        variant === "secondary" && "bg-secondary text-white hover:bg-[#b80f22]",
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
