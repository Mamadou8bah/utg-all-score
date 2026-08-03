export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT";
  schoolId?: string | null;
  schoolName?: string | null;
};

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
  status: "LIVE" | "HT" | "FT" | "UPCOMING";
  timer?: string;
};
