"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { agentNav } from "@/lib/nav";
import { useMounted } from "@/lib/use-mounted";

export function AgentMobileNav() {
  const pathname = usePathname();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-[4.5rem] border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-hidden
      />
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-2 px-2 pt-2">
        {agentNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 pb-2 transition-transform active:scale-90",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <div className={cn("rounded-xl p-2.5 transition-colors", isActive ? "bg-primary/10" : "bg-transparent")}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wide">{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
