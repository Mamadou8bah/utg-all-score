"use client";

import { Home, Radio, Calendar, LayoutGrid, Newspaper } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const pathname = usePathname();
  
  const bottomLinks = [
    { href: "/", label: "Home", icon: <Home size={22} /> },
    { href: "/live", label: "Live", icon: <Radio size={22} /> },
    { href: "/standings", label: "Competitions", icon: <LayoutGrid size={22} /> },
    { href: "/fixtures", label: "Fixtures", icon: <Calendar size={22} /> },
    { href: "/news", label: "News", icon: <Newspaper size={22} /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 transition-transform active:scale-90",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                {link.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};