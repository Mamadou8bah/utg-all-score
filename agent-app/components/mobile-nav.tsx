"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { agentNav } from "@/lib/nav";
export function AgentMobileNav() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="portal-bottom-nav">
    {agentNav.map((item) => {
      const active = pathname === item.href;
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
        <span className="portal-tab-icon"><Icon size={21} strokeWidth={active ? 2.5 : 1.8} /></span>
        <span>{item.shortLabel ?? item.label}</span>
      </Link>;
    })}
  </nav>;
}
