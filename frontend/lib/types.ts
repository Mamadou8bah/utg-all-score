export type CompetitionType = "GENERAL" | "SCHOOL";
export type CompetitionFormat = "LEAGUE" | "TOURNAMENT";
export type MatchStatus = "LIVE" | "HT" | "FT" | "UPCOMING";

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  schoolName?: string;
  description: string;
  format: CompetitionFormat;
  logo?: string;
}

export type MatchEvent = {
  minute: number;
  type: string;
  player: string;
  team: string;
  detail: string;
};

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
  status: MatchStatus;
  timer?: string;
  stage?: "LEAGUE" | "GROUP" | "KNOCKOUT";
  round?: string;
  groupId?: string;
  events: MatchEvent[];
  agents?: Array<{ id: string; name: string; email: string }>;
  squads?: {
    home: SquadPlayer[];
    away: SquadPlayer[];
  };
  lineups?: {
    home: {
      starting: { number: number; name: string; role: string }[];
      subs: { number: number; name: string; role: string }[];
    };
    away: {
      starting: { number: number; name: string; role: string }[];
      subs: { number: number; name: string; role: string }[];
    };
  };
};

export type StandingRow = {
  competitionId: string;
  groupKey?: string;
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  publishedAt: string;
  body?: string;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  level: "info" | "warning";
};

export type TeamProfile = {
  name: string;
  colors: string[];
  tone: string;
  form: string[];
  logo?: string;
};

export type AthleteProfile = {
  id: string;
  name: string;
  team: string;
  sport: string;
  role: string;
  statLine: string;
  story: string;
  image: string;
};

export type FootballEventItem = {
  id: string;
  title: string;
  type: string;
  venue: string;
  date: string;
  description: string;
};

export type KnockoutRound = {
  round: string;
  order: number;
  matches: Array<{
    id: string;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    status: string;
    kickoff: string;
    venue: string;
  }>;
};

export type CompetitionStats = {
  reigningChampion: string | null;
  leaderLabel: "Champion" | "Current Leader";
  topScorer: { name: string; team: string; goals: number } | null;
  highestScoringMatch: { home: string; away: string; totalGoals: number } | null;
  matchesPlayed: number;
  totalGoals: number;
  teamCount: number;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT";
  schoolId?: string | null;
  schoolName?: string | null;
};
