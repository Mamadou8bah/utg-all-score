"use client";

import { Radio, Ellipsis, Trophy, Newspaper } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Matches", paths: ["/", "/fixtures", "/results"], icon: <img src="/images/football.png" alt="" aria-hidden="true" width={23} height={23} /> },
  { href: "/live", label: "Live", paths: ["/live"], icon: <Radio size={23} strokeWidth={1.8} /> },
  { href: "/standings", label: "Leagues", paths: ["/standings"], icon: <Trophy size={23} strokeWidth={1.8} /> },
  { href: "/news", label: "News", paths: ["/news"], icon: <Newspaper size={23} strokeWidth={1.8} /> },
  { href: "/more", label: "More", paths: ["/more", "/settings", "/teams", "/athletes", "/events", "/announcements", "/search", "/offline"], icon: <Ellipsis size={23} strokeWidth={2} /> }
];

export const MobileNav = () => {
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="Main navigation">
    {links.map(link => {
      const active = link.paths.some(path => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)));
      return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
        className={cn("bottom-nav__item", active && "bottom-nav__item--active")}>
        <span className="bottom-nav__icon" aria-hidden="true">{link.icon}</span>
        <span className="bottom-nav__label">{link.label}</span>
      </Link>;
    })}
  </nav>;
};
