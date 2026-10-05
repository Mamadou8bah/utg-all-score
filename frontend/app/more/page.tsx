"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { CalendarDays, Trophy, Users, Megaphone, Medal, Calendar, Settings } from "lucide-react";

const links = [
  { href: "/search", label: "Search", description: "Find matches, competitions, teams and news", icon: Settings },
  { href: "/settings", label: "Settings", description: "Notifications and device preferences", icon: Settings },
  { href: "/fixtures", label: "Fixtures", description: "Upcoming games and past fixtures", icon: CalendarDays },
  { href: "/results", label: "Results", description: "Full-time scores and match reports", icon: Trophy },
  { href: "/teams", label: "Teams", description: "Explore university teams", icon: Users },
  { href: "/athletes", label: "Athletes", description: "Meet the players", icon: Medal },
  { href: "/events", label: "Events", description: "What’s happening on campus", icon: Calendar },
  { href: "/announcements", label: "Announcements", description: "Official updates and notices", icon: Megaphone }
];

export default function MorePage() {
  const { t: translate } = useLanguage();
  return (
    <div className="page-shell section-space">
      <h1 className="page-title">{translate("More")}</h1>
      <nav aria-label={translate("Explore AllScore")}>
        {links.map(({ href, label, description }) => (
          <Link key={href} href={href} className="list-item">

            <div><span className="list-item__title block">{translate(label)}</span><span className="list-item__meta block">{translate(description)}</span></div>

          </Link>
        ))}
      </nav>
      <h2 className="panel-title">{translate("About UTG AllScore")}</h2>
      <div className="reference-panel">{translate("University football scores, fixtures, competition tables and official campus updates. Match times use Africa/Banjul.")}</div>
    </div>
  );
}
