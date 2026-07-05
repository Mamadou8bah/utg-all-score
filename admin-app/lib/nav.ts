import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Shield,
  Trophy,
  CalendarDays,
  type LucideIcon
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel?: string;
};

export const adminNav: AdminNavItem[] = [
  { href: "/", label: "Overview", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/schools", label: "Schools", icon: GraduationCap },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/competitions", label: "Competitions", shortLabel: "Comps", icon: Trophy },
  { href: "/matches", label: "Matches", shortLabel: "Fixtures", icon: CalendarDays }
];
