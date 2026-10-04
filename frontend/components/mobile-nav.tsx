"use client";

import { Radio, Ellipsis, LayoutGrid, Newspaper } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const pathname = usePathname();

  const bottomLinks = [
    { href: "/", label: "Matches", icon: <img src="/images/football.svg" alt="" aria-hidden="true" width={22} height={22} /> },
    { href: "/live", label: "Live", icon: <Radio size={22} /> },
    { href: "/standings", label: "Leagues", icon: <LayoutGrid size={22} /> },

    { href: "/news", label: "News", icon: <Newspaper size={22} /> },
    { href: "/more", label: "More", icon: <Ellipsis size={22} /> }
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {bottomLinks.map((link) => (
        <Link key={link.href} href={link.href} aria-current={(pathname === link.href || (link.href === "/more" && pathname === "/settings")) ? "page" : undefined}
          className={cn("bottom-nav__item", (pathname === link.href || (link.href === "/more" && pathname === "/settings")) && "bottom-nav__item--active")}>
          {link.icon}<span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
};
