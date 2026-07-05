export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT";
  schoolId?: string | null;
  schoolName?: string | null;
};

export type MatchEvent = {
  minute: number;
  type: string;
  player: string;
  team: string;
  detail: string;
};

export type LineupPlayer = { number: number; name: string; role: string };

export type Match = {
  id: string;
  competitionId: string;
  competition: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  kickoff: string;
  status: string;
  timer?: string;
  events: MatchEvent[];
  lineups?: {
    home: { starting: LineupPlayer[]; subs: LineupPlayer[] };
    away: { starting: LineupPlayer[]; subs: LineupPlayer[] };
  };
};
