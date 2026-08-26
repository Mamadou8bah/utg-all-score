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

export type LineupPlayer = { number: number; name: string; role: string; isSub?: boolean };

export type SquadPlayer = {
  id: string;
  number: number;
  name: string;
  role: string;
  position?: string;
};

export type Match = {
  id: string;
  competitionId: string;
  competition: string;
  home: string;
  away: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  kickoff: string;
  status: "LIVE" | "HT" | "FT" | "UPCOMING" | string;
  timer?: string;
  stage?: string;
  round?: string;
  events: MatchEvent[];
  squads?: {
    home: SquadPlayer[];
    away: SquadPlayer[];
  };
  lineups?: {
    home: { starting: LineupPlayer[]; subs: LineupPlayer[] };
    away: { starting: LineupPlayer[]; subs: LineupPlayer[] };
  };
};
