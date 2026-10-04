import Link from "next/link";
import { CalendarDays, Trophy, Users, Megaphone, Medal, ChevronRight, Calendar } from "lucide-react";

const links = [
  { href: "/fixtures", label: "Fixtures", description: "Upcoming games and past fixtures", icon: CalendarDays },
  { href: "/results", label: "Results", description: "Full-time scores and match reports", icon: Trophy },
  { href: "/teams", label: "Teams", description: "Explore university teams", icon: Users },
  { href: "/athletes", label: "Athletes", description: "Meet the players", icon: Medal },
  { href: "/events", label: "Events", description: "What’s happening on campus", icon: Calendar },
  { href: "/announcements", label: "Announcements", description: "Official updates and notices", icon: Megaphone }
];

export default function MorePage() {
  return (
    <div className="page-shell section-space">
      <h1 className="page-title">More</h1>
      <nav aria-label="Explore AllScore">
        {links.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="explore-row">
            <Icon size={21} className="text-primary" />
            <div><span className="block text-sm font-semibold">{label}</span><span className="text-xs text-text-secondary">{description}</span></div>
            <ChevronRight size={18} className="ml-auto text-text-secondary" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
