import { Radio, Newspaper, type LucideIcon } from "lucide-react";

export type AgentNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel?: string;
};

export const agentNav: AgentNavItem[] = [
  { href: "/", label: "Matchday Console", shortLabel: "Live", icon: Radio },
  { href: "/content", label: "News & Alerts", shortLabel: "News", icon: Newspaper }
];
