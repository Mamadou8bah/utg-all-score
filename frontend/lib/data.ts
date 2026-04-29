export type CompetitionType = "GENERAL" | "SCHOOL";
export type CompetitionFormat = "LEAGUE" | "TOURNAMENT";

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  schoolName?: string;
  description: string;
  format: CompetitionFormat;
  logo?: string;
}

export const competitions: Competition[] = [
  {
    id: "ifpl-2026",
    name: "VC Tournament",
    type: "GENERAL",
    description: "The Vice Chancellor's university-wide football tournament featuring all schools.",
    format: "TOURNAMENT",
    logo: "/images/ifpl-logo.png"
  },
  {
    id: "sitc-cup-2026",
    name: "ITCA League",
    type: "SCHOOL",
    schoolName: "Information, Technology and Communication Association (ITCA)",
    description: "Internal ITCA league competition between Year 1, Year 2, Year 3, and Year 4.",
    format: "LEAGUE",
    logo: "/images/sitc-logo.png"
  },
  {
    id: "sobfc-2026",
    name: "SOB Challenge Cup",
    type: "SCHOOL",
    schoolName: "School of Business & Commerce",
    description: "Annual sports challenge within the Business School.",
    format: "TOURNAMENT",
    logo: "/images/sobbc-logo.png"
  },
  {
    id: "utgsu-shield-2026",
    name: "UTGSU Unity Shield",
    type: "GENERAL",
    description: "A university-wide mock competition built around recognized UTGSU sub-associations.",
    format: "TOURNAMENT"
  }
];

export const competitionGroups: Record<string, { name: string; teams: string[] }[]> = {
  "sobfc-2026": [
    { name: "Group A", teams: ["Accounting", "Marketing", "Management", "Finance"] },
    { name: "Group B", teams: ["Economics", "Public Admin", "HRM", "Banking"] }
  ],
  "utgsu-shield-2026": [
    {
      name: "Group A",
      teams: [
        "Accountancy Students' Association (ASA)",
        "Economics and Management Students Association (ECOMANSA)",
        "Education Students' Association (EDUSA)",
        "Journalism Students' Association (JSA)"
      ]
    },
    {
      name: "Group B",
      teams: [
        "Information, Technology and Communication Association (ITCA)",
        "Law Students' Association (LSA)",
        "Science Students' Association",
        "Student Association for Public and Environmental Health (SAPEH)"
      ]
    },
    {
      name: "Group C",
      teams: [
        "Agriculture and Environmental Science Students' Association (AESSA)",
        "Architecture and Engineering Students' Association (AESA)",
        "UTG Medical Students Association (UNIGAMSA)",
        "UTG Nursing Students Association (UTG-NSA)"
      ]
    }
  ]
};

export const navLinks = [
  { label: "Fixtures", path: "/fixtures", icon: "CalendarDays" },
  { label: "Competitions", path: "/standings", icon: "LayoutGrid" },
  { label: "News", path: "/news", icon: "Newspaper" }
];

export type MatchStatus = "LIVE" | "FT" | "UPCOMING";

export type MatchEvent = {
  minute: number;
  type: string;
  player: string;
  team: string;
  detail: string;
};

export type Match = {
  id: string;
  competitionId: string; // Linked to Competition
  competition: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  kickoff: string;
  status: MatchStatus;
  timer?: string;
  events: MatchEvent[];
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
  competitionId: string; // Linked to Competition
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

export const appMeta = {
  name: "UTG AllScore",
  shortName: "AllScore",
  tagline: "The Official Hub for University Sports Updates"
};

export const liveMatches: Match[] = [
  {
    id: "m1",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "School of ICT",
    away: "School of Business",
    homeScore: 2,
    awayScore: 1,
    venue: "UTG Main Field",
    kickoff: "2026-04-03T16:00:00+00:00",
    status: "LIVE",
    timer: "72'",
    events: [
      { minute: 14, type: "Goal", player: "Lamin Jatta", team: "School of ICT", detail: "Near-post finish after a cutback." },
      { minute: 58, type: "Goal", player: "Fatou Touray", team: "School of Business", detail: "Rebound finished low into the corner." },
      { minute: 67, type: "Goal", player: "Ebrima Ceesay", team: "School of ICT", detail: "Struck from the edge after second-ball pressure." }
    ],
    lineups: {
      home: {
        starting: [
          { number: 1, name: "Modou Jagne", role: "GK" },
          { number: 4, name: "Yusupha Sarr", role: "DEF" },
          { number: 5, name: "Omar Colley", role: "DEF" },
          { number: 8, name: "Ebrima Ceesay", role: "MID" },
          { number: 10, name: "Lamin Jatta", role: "MID" },
          { number: 7, name: "Bubacarr Gaye", role: "FWD" },
        ],
        subs: [
          { number: 12, name: "Pa Modou Jagne", role: "GK" },
          { number: 15, name: "Sulayman Sowe", role: "MID" },
        ]
      },
      away: {
        starting: [
          { number: 1, name: "Musa Camara", role: "GK" },
          { number: 2, name: "Dodou Touray", role: "DEF" },
          { number: 6, name: "Alieu Jallow", role: "DEF" },
          { number: 11, name: "Fatou Touray", role: "MID" },
          { number: 9, name: "Mustapha Sanyang", role: "FWD" },
          { number: 21, name: "Bakary Badjie", role: "FWD" },
        ],
        subs: [
          { number: 13, name: "Isatou Bah", role: "MID" },
          { number: 18, name: "Dembo Darboe", role: "FWD" },
        ]
      }
    }
  },
  {
    id: "m2",
    competitionId: "ifpl-2026",
    competition: "Campus Basketball Series",
    home: "School of Medicine",
    away: "School of Arts",
    homeScore: 54,
    awayScore: 58,
    venue: "Indoor Hall B",
    kickoff: "2026-04-03T18:30:00+00:00",
    status: "LIVE",
    timer: "Q4 06:12",
    events: [
      { minute: 34, type: "3PT", player: "Mariam Jallow", team: "School of Arts", detail: "Pull-up triple from the wing." },
      { minute: 36, type: "Steal", player: "Binta Sowe", team: "School of Medicine", detail: "Fast break generated from backcourt pressure." }
    ]
  },
  {
    id: "m3",
    competitionId: "sitc-cup-2026",
    competition: "ITCA League",
    home: "Year 3",
    away: "Year 2",
    homeScore: 1,
    awayScore: 0,
    venue: "Faraba Court",
    kickoff: "2026-04-03T17:00:00+00:00",
    status: "LIVE",
    timer: "40'",
    events: []
  },
  {
    id: "m4",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Information, Technology and Communication Association (ITCA)",
    away: "Law Students' Association (LSA)",
    homeScore: 1,
    awayScore: 1,
    venue: "Brikama Campus Arena",
    kickoff: "2026-04-05T15:00:00+00:00",
    status: "LIVE",
    timer: "63'",
    events: [
      { minute: 18, type: "Goal", player: "Ousman Sowe", team: "Information, Technology and Communication Association (ITCA)", detail: "Driven finish after a quick overload on the right." },
      { minute: 51, type: "Goal", player: "Awa Bah", team: "Law Students' Association (LSA)", detail: "Placed low from the edge of the box after a recycled corner." }
    ]
  }
];

export const fixtures: Match[] = [
  {
    id: "f9",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Information, Technology and Communication Association (ITCA)",
    away: "Law Students' Association (LSA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Faraba Sports Ground",
    kickoff: "2026-04-29T16:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f10",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Economics and Management Students Association (ECOMANSA)",
    away: "Accountancy Students' Association (ASA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Brikama Campus Arena",
    kickoff: "2026-04-29T18:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f11",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "UTG Medical Students Association (UNIGAMSA)",
    away: "Architecture and Engineering Students' Association (AESA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Faraba Sports Ground",
    kickoff: "2026-04-30T16:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f12",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Journalism Students' Association (JSA)",
    away: "Education Students' Association (EDUSA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Kanifing Annex Pitch",
    kickoff: "2026-04-30T18:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f13",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Science Students' Association",
    away: "Student Association for Public and Environmental Health (SAPEH)",
    homeScore: 0,
    awayScore: 0,
    venue: "UTG Main Field",
    kickoff: "2026-05-01T16:30:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f14",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Agriculture and Environmental Science Students' Association (AESSA)",
    away: "UTG Nursing Students Association (UTG-NSA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Brikama Campus Arena",
    kickoff: "2026-05-01T18:30:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f15",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Accountancy Students' Association (ASA)",
    away: "Information, Technology and Communication Association (ITCA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Kanifing Annex Pitch",
    kickoff: "2026-05-02T16:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f16",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "Law Students' Association (LSA)",
    away: "Economics and Management Students Association (ECOMANSA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Faraba Sports Ground",
    kickoff: "2026-05-02T18:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f1",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "School of Arts",
    away: "School of Medicine",
    homeScore: 0,
    awayScore: 0,
    venue: "Faraba Sports Ground",
    kickoff: "2026-04-05T16:30:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f4",
    competitionId: "sitc-cup-2026",
    competition: "ITCA League",
    home: "Year 1",
    away: "Year 4",
    homeScore: 0,
    awayScore: 0,
    venue: "Faraba Sports Ground",
    kickoff: "2026-04-06T14:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f5",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Accountancy Students' Association (ASA)",
    away: "Education Students' Association (EDUSA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Kanifing Annex Pitch",
    kickoff: "2026-04-06T16:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f6",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Science Students' Association",
    away: "Student Association for Public and Environmental Health (SAPEH)",
    homeScore: 0,
    awayScore: 0,
    venue: "Faraba Sports Ground",
    kickoff: "2026-04-07T15:30:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f7",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "UTG Medical Students Association (UNIGAMSA)",
    away: "UTG Nursing Students Association (UTG-NSA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Main Campus 5-a-side Court",
    kickoff: "2026-04-08T17:00:00+00:00",
    status: "UPCOMING",
    events: []
  },
  {
    id: "f8",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Agriculture and Environmental Science Students' Association (AESSA)",
    away: "Architecture and Engineering Students' Association (AESA)",
    homeScore: 0,
    awayScore: 0,
    venue: "Brikama Campus Arena",
    kickoff: "2026-04-08T18:30:00+00:00",
    status: "UPCOMING",
    events: []
  }
];

export const results: Match[] = [
  {
    id: "r1",
    competitionId: "ifpl-2026",
    competition: "VC Tournament",
    home: "School of Business",
    away: "School of Arts",
    homeScore: 3,
    awayScore: 2,
    venue: "UTG Main Field",
    kickoff: "2026-03-28T16:00:00+00:00",
    status: "FT",
    events: []
  },
  {
    id: "r3",
    competitionId: "sobfc-2026",
    competition: "SOB Challenge Cup",
    home: "Accounting",
    away: "Marketing",
    homeScore: 2,
    awayScore: 2,
    venue: "Business School Court",
    kickoff: "2026-04-02T16:00:00+00:00",
    status: "FT",
    events: []
  },
  {
    id: "r4",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Journalism Students' Association (JSA)",
    away: "Economics and Management Students Association (ECOMANSA)",
    homeScore: 0,
    awayScore: 2,
    venue: "Kanifing Annex Pitch",
    kickoff: "2026-04-03T16:00:00+00:00",
    status: "FT",
    events: []
  },
  {
    id: "r5",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Law Students' Association (LSA)",
    away: "Science Students' Association",
    homeScore: 1,
    awayScore: 0,
    venue: "Brikama Campus Arena",
    kickoff: "2026-04-03T17:30:00+00:00",
    status: "FT",
    events: []
  },
  {
    id: "r6",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "UTG Medical Students Association (UNIGAMSA)",
    away: "Architecture and Engineering Students' Association (AESA)",
    homeScore: 3,
    awayScore: 1,
    venue: "Main Campus 5-a-side Court",
    kickoff: "2026-04-04T15:00:00+00:00",
    status: "FT",
    events: []
  },
  {
    id: "r7",
    competitionId: "utgsu-shield-2026",
    competition: "UTGSU Unity Shield",
    home: "Accountancy Students' Association (ASA)",
    away: "Education Students' Association (EDUSA)",
    homeScore: 1,
    awayScore: 1,
    venue: "Kanifing Annex Pitch",
    kickoff: "2026-04-01T16:30:00+00:00",
    status: "FT",
    events: []
  }
];

export const standings: StandingRow[] = [
  // IFPL Standings
  { competitionId: "ifpl-2026", team: "School of ICT", played: 5, win: 4, draw: 1, loss: 0, gf: 11, ga: 5, gd: 6, pts: 13 },
  { competitionId: "ifpl-2026", team: "School of Business", played: 5, win: 3, draw: 1, loss: 1, gf: 9, ga: 7, gd: 2, pts: 10 },
  
  // SITC Cup Standings
  { competitionId: "sitc-cup-2026", team: "Year 3", played: 2, win: 2, draw: 0, loss: 0, gf: 4, ga: 1, gd: 3, pts: 6 },
  { competitionId: "sitc-cup-2026", team: "Year 2", played: 2, win: 1, draw: 0, loss: 1, gf: 2, ga: 2, gd: 0, pts: 3 },
  { competitionId: "sitc-cup-2026", team: "Year 1", played: 2, win: 1, draw: 0, loss: 1, gf: 3, ga: 3, gd: 0, pts: 3 },
  { competitionId: "sitc-cup-2026", team: "Year 4", played: 2, win: 0, draw: 0, loss: 2, gf: 1, ga: 4, gd: -3, pts: 0 },

  // UTGSU Unity Shield Standings
  { competitionId: "utgsu-shield-2026", team: "Economics and Management Students Association (ECOMANSA)", played: 1, win: 1, draw: 0, loss: 0, gf: 2, ga: 0, gd: 2, pts: 3 },
  { competitionId: "utgsu-shield-2026", team: "Accountancy Students' Association (ASA)", played: 1, win: 0, draw: 1, loss: 0, gf: 1, ga: 1, gd: 0, pts: 1 },
  { competitionId: "utgsu-shield-2026", team: "Education Students' Association (EDUSA)", played: 1, win: 0, draw: 1, loss: 0, gf: 1, ga: 1, gd: 0, pts: 1 },
  { competitionId: "utgsu-shield-2026", team: "Journalism Students' Association (JSA)", played: 1, win: 0, draw: 0, loss: 1, gf: 0, ga: 2, gd: -2, pts: 0 },
  { competitionId: "utgsu-shield-2026", team: "Law Students' Association (LSA)", played: 2, win: 1, draw: 1, loss: 0, gf: 2, ga: 1, gd: 1, pts: 4 },
  { competitionId: "utgsu-shield-2026", team: "Information, Technology and Communication Association (ITCA)", played: 1, win: 0, draw: 1, loss: 0, gf: 1, ga: 1, gd: 0, pts: 1 },
  { competitionId: "utgsu-shield-2026", team: "Student Association for Public and Environmental Health (SAPEH)", played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  { competitionId: "utgsu-shield-2026", team: "Science Students' Association", played: 1, win: 0, draw: 0, loss: 1, gf: 0, ga: 1, gd: -1, pts: 0 },
  { competitionId: "utgsu-shield-2026", team: "UTG Medical Students Association (UNIGAMSA)", played: 1, win: 1, draw: 0, loss: 0, gf: 3, ga: 1, gd: 2, pts: 3 },
  { competitionId: "utgsu-shield-2026", team: "UTG Nursing Students Association (UTG-NSA)", played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  { competitionId: "utgsu-shield-2026", team: "Agriculture and Environmental Science Students' Association (AESSA)", played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  { competitionId: "utgsu-shield-2026", team: "Architecture and Engineering Students' Association (AESA)", played: 1, win: 0, draw: 0, loss: 1, gf: 1, ga: 3, gd: -2, pts: 0 }
];

export const newsItems = [
  {
    id: "n1",
    title: "SITC edge a tense title-race fixture under the lights",
    excerpt: "A composed second-half display keeps ICT on top of the inter-faculty table.",
    category: "Match Report",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-04-02T20:30:00+00:00"
  },
  {
    id: "n2",
    title: "Festival Week expands to include track and volleyball showcases",
    excerpt: "This year’s university sports festival widens the athlete spotlight beyond football.",
    category: "Campus Sports",
    image: "https://images.unsplash.com/photo-1511406361295-0a5ff814c0ad?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-04-01T12:00:00+00:00"
  },
  {
    id: "n3",
    title: "AllScore rollout prepares faculties for live digital match operations",
    excerpt: "Officials and faculty coordinators begin using the new mobile-first scoring workflows.",
    category: "Platform",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-03-31T08:45:00+00:00"
  },
  {
    id: "n4",
    title: "UTGSU Unity Shield mock schedule spotlights sub-association rivalries",
    excerpt: "Recognized UTGSU sub-associations now appear across fixtures, standings, and live match views in the demo data.",
    category: "Campus Sports",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop",
    publishedAt: "2026-04-05T09:20:00+00:00"
  }
];

export const announcements = [
  { id: "a1", title: "Results publication window", body: "Official results must be submitted by faculty officers within 30 minutes of full time.", level: "info" },
  { id: "a2", title: "Venue adjustment", body: "Tonight's basketball fixture has moved to Indoor Hall B due to weather.", level: "warning" },
  { id: "a3", title: "UTGSU Unity Shield added", body: "Mock matchday data now includes recognized UTGSU sub-associations for richer demo schedules and standings.", level: "info" }
];

export const athletes = [
  {
    id: "ath1",
    name: "Lamin Jatta",
    team: "School of ICT",
    sport: "Football",
    role: "Attacking Midfielder",
    statLine: "4 goals, 3 assists, 12 key passes",
    story: "Creative final-third controller with an instinct for match-defining moments.",
    image: "/images/athlete-lamin.svg"
  },
  {
    id: "ath2",
    name: "Maimuna Sarr",
    team: "School of Arts",
    sport: "Athletics",
    role: "Sprinter / Winger",
    statLine: "27 sprints, 2 goals, 9 shots",
    story: "Explosive transition runner standing out across both athletics and football.",
    image: "/images/athlete-maimuna.svg"
  },
  {
    id: "ath3",
    name: "Ousman Sowe",
    team: "Information, Technology and Communication Association (ITCA)",
    sport: "Football",
    role: "Wide Forward",
    statLine: "3 goals, 2 assists, 8 progressive carries",
    story: "Direct runner who stretches back lines and creates early chances for ITCA.",
    image: "/images/athlete-lamin.svg"
  },
  {
    id: "ath4",
    name: "Awa Bah",
    team: "Law Students' Association (LSA)",
    sport: "Football",
    role: "Attacking Midfielder",
    statLine: "2 goals, 11 chances created, 86% pass accuracy",
    story: "Calm under pressure and often decisive in tight knockout-style matches.",
    image: "/images/athlete-maimuna.svg"
  },
  {
    id: "ath5",
    name: "Fatou Njie",
    team: "UTG Medical Students Association (UNIGAMSA)",
    sport: "Football",
    role: "Center Forward",
    statLine: "4 goals, 1 assist, 13 shots on target",
    story: "Clinical finisher leading the early scoring race in the Unity Shield mock table.",
    image: "/images/athlete-lamin.svg"
  },
  {
    id: "ath6",
    name: "Muhammed Ceesay",
    team: "Economics and Management Students Association (ECOMANSA)",
    sport: "Football",
    role: "Deep-Lying Playmaker",
    statLine: "2 assists, 17 recoveries, 21 line-breaking passes",
    story: "Sets the tempo from midfield and keeps ECOMANSA compact between transitions.",
    image: "/images/athlete-maimuna.svg"
  },
  {
    id: "ath7",
    name: "Binta Colley",
    team: "Education Students' Association (EDUSA)",
    sport: "Football",
    role: "Box-to-Box Midfielder",
    statLine: "1 goal, 9 duels won, 6 interceptions",
    story: "Relentless engine in midfield with a strong recovery run profile.",
    image: "/images/athlete-lamin.svg"
  }
];

export const events = [
  { id: "e1", title: "VC Tournament Finals Night", type: "Finals", venue: "UTG Main Campus", date: "2026-05-28T18:00:00+00:00", description: "Final football and basketball fixtures followed by awards and media interviews." },
  { id: "e2", title: "Athlete Media Day", type: "Media", venue: "Sports Press Lounge", date: "2026-04-09T11:00:00+00:00", description: "Portraits, interviews, and official content capture for top-performing athletes." }
];

export const teams = [
  { 
    name: "School of ICT", 
    colors: ["#0055A4", "#000000"], 
    tone: "Data-driven squad with high pressing and strong ball security.",
    form: ["W", "W", "D", "W", "W"],
    logo: "/images/ict-logo.png"
  },
  { 
    name: "School of Business", 
    colors: ["#FFC72C", "#000000"], 
    tone: "Direct transitions and powerful second-half performances.",
    form: ["W", "L", "W", "D", "W"],
    logo: "/images/business-logo.png"
  },
  { 
    name: "School of Arts", 
    colors: ["#E4002B", "#FFFFFF"], 
    tone: "Creative flair with an emphasis on individual brilliance.",
    form: ["L", "W", "L", "W", "D"],
    logo: "/images/arts-logo.png"
  },
  { 
    name: "School of Medicine", 
    colors: ["#008C45", "#FFFFFF"], 
    tone: "Disciplined defensive structure with patient build-up.",
    form: ["D", "D", "W", "L", "L"],
    logo: "/images/medicine-logo.png"
  },
  { 
    name: "School of Law", 
    colors: ["#6A2A2E", "#D4AF37"], 
    tone: "Methodical and tactical, excels in set-piece situations.",
    form: ["W", "D", "L", "W", "W"],
    logo: "/images/law-logo.png"
  },
  { 
    name: "School of Engineering", 
    colors: ["#4B2E83", "#B7A57A"], 
    tone: "Physical and robust, known for endurance and late goals.",
    form: ["L", "L", "W", "D", "W"],
    logo: "/images/engineering-logo.png"
  },
  { 
    name: "School of Agriculture", 
    colors: ["#006400", "#FFD700"], 
    tone: "Hard-working unit with a strong team-first mentality.",
    form: ["W", "L", "W", "L", "W"],
    logo: "/images/agriculture-logo.png"
  },
  { 
    name: "School of Journalism", 
    colors: ["#000000", "#FFFFFF"], 
    tone: "Fast-paced and communicative, great at exploiting gaps.",
    form: ["D", "W", "W", "L", "D"],
    logo: "/images/journalism-logo.png"
  },
  { 
    name: "School of Education", 
    colors: ["#00A3E0", "#FFFFFF"], 
    tone: "Strategic and adaptive, focuses on fundamental play.",
    form: ["L", "W", "D", "W", "L"],
    logo: "/images/education-logo.png"
  },
  {
    name: "Accountancy Students' Association (ASA)",
    colors: ["#0F766E", "#F8FAFC"],
    tone: "Structured side that values shape, patience, and clean final-third combinations.",
    form: ["D", "W", "W", "L", "D"]
  },
  {
    name: "Economics and Management Students Association (ECOMANSA)",
    colors: ["#7C3AED", "#FDE68A"],
    tone: "Press-resistant midfield group with strong game management in big moments.",
    form: ["W", "W", "D", "W", "L"]
  },
  {
    name: "Education Students' Association (EDUSA)",
    colors: ["#0284C7", "#F8FAFC"],
    tone: "Disciplined unit built on compact defending and quick support play.",
    form: ["D", "L", "W", "D", "W"]
  },
  {
    name: "Journalism Students' Association (JSA)",
    colors: ["#111827", "#EF4444"],
    tone: "Fast starters who thrive in open, transition-heavy matches.",
    form: ["L", "W", "D", "L", "W"]
  },
  {
    name: "Information, Technology and Communication Association (ITCA)",
    colors: ["#2563EB", "#E0F2FE"],
    tone: "Sharp passing team with comfort in possession and aggressive recovery pressing.",
    form: ["D", "W", "W", "D", "W"],
    logo: "data:image/png;base64,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"
  },
  {
    name: "Law Students' Association (LSA)",
    colors: ["#7F1D1D", "#FCD34D"],
    tone: "Tactically mature and excellent at controlling set-piece phases.",
    form: ["W", "D", "W", "W", "L"],
    logo: "data:image/png;base64,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"
  },
  {
    name: "Science Students' Association",
    colors: ["#0F172A", "#22C55E"],
    tone: "Energetic side that relies on athletic recovery and direct vertical play.",
    form: ["L", "W", "W", "L", "D"],
    logo: "data:image/jpeg;base64,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"
  },
  {
    name: "SOSHSA",
    colors: ["#3B82F6", "#FFFFFF"],
    tone: "A well-rounded team with good wing play.",
    form: ["W", "D", "W", "W", "W"],
    logo: "data:image/jpeg;base64,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"
  },
  {
    name: "Student Association for Public and Environmental Health (SAPEH)",
    colors: ["#059669", "#ECFCCB"],
    tone: "Balanced squad with strong communication and good spacing across the pitch.",
    form: ["W", "D", "L", "W", "D"]
  },
  {
    name: "Agriculture and Environmental Science Students' Association (AESSA)",
    colors: ["#166534", "#FDE68A"],
    tone: "Work-rate driven team that stays organized and dangerous late in matches.",
    form: ["W", "L", "D", "W", "W"]
  },
  {
    name: "Architecture and Engineering Students' Association (AESA)",
    colors: ["#1D4ED8", "#CBD5E1"],
    tone: "Physical team with an emphasis on aerial control and defensive duels.",
    form: ["L", "D", "W", "L", "W"]
  },
  {
    name: "UTG Medical Students Association (UNIGAMSA)",
    colors: ["#DC2626", "#F8FAFC"],
    tone: "Efficient attacking side that stays composed in central areas.",
    form: ["W", "W", "L", "W", "D"]
  },
  {
    name: "UTG Nursing Students Association (UTG-NSA)",
    colors: ["#0891B2", "#F0FDFA"],
    tone: "Collective-minded group with strong defensive rotations and overlap play.",
    form: ["D", "W", "D", "L", "W"]
  }
];

export const teamSquads: Record<string, { number: number; name: string; role: string; position?: string; goals?: number; assists?: number }[]> = {
  "School of ICT": [
    { number: 1, name: "Modou Jagne", role: "GK", position: "Goalkeeper" },
    { number: 4, name: "Yusupha Sarr", role: "DEF", position: "Center Back" },
    { number: 5, name: "Omar Colley", role: "DEF", position: "Left Back" },
    { number: 8, name: "Ebrima Ceesay", role: "MID", position: "Central Midfield", goals: 2, assists: 4 },
    { number: 10, name: "Lamin Jatta", role: "MID", position: "Attacking Midfield", goals: 4, assists: 3 },
    { number: 7, name: "Bubacarr Gaye", role: "FWD", position: "Right Wing", goals: 3, assists: 1 },
    { number: 9, name: "Alieu Njie", role: "FWD", position: "Striker", goals: 5, assists: 0 },
    { number: 6, name: "Samba Bah", role: "MID", position: "Defensive Midfield" },
  ],
  "School of Business": [
    { number: 1, name: "Musa Camara", role: "GK", position: "Goalkeeper" },
    { number: 2, name: "Dodou Touray", role: "DEF", position: "Right Back" },
    { number: 6, name: "Alieu Jallow", role: "DEF", position: "Center Back" },
    { number: 11, name: "Fatou Touray", role: "MID", position: "Winger", goals: 3, assists: 2 },
    { number: 9, name: "Mustapha Sanyang", role: "FWD", position: "Striker", goals: 6, assists: 1 },
    { number: 21, name: "Bakary Badjie", role: "FWD", position: "Support Striker", goals: 2, assists: 5 },
  ],
  "School of Arts": [
    { number: 1, name: "Pa Abdou", role: "GK", position: "Goalkeeper" },
    { number: 10, name: "Maimuna Sarr", role: "FWD", position: "Winger", goals: 2, assists: 6 },
    { number: 7, name: "Mariam Jallow", role: "MID", position: "Playmaker", goals: 1, assists: 4 },
  ]
};

export const matchDetails: Record<string, { stats: { label: string; home: number; away: number }[] }> = {
  "m1": {
    stats: [
      { label: "Possession", home: 54, away: 46 },
      { label: "Shots", home: 12, away: 8 },
      { label: "Shots on Target", home: 5, away: 3 },
      { label: "Corners", home: 6, away: 4 },
      { label: "Fouls", home: 11, away: 14 },
      { label: "Yellow Cards", home: 1, away: 2 },
    ]
  },
  "m3": {
    stats: [
      { label: "Possession", home: 48, away: 52 },
      { label: "Shots", home: 7, away: 11 },
      { label: "Shots on Target", home: 2, away: 4 },
      { label: "Corners", home: 3, away: 5 },
      { label: "Fouls", home: 15, away: 12 },
    ]
  }
};

export const faculties = [
  { name: "School of ICT", sports: ["Football", "Basketball", "Athletics"], record: "13 pts, 11 GF, 5 GA", tone: "Data-driven squad with high pressing and strong ball security." },
  { name: "School of Business", sports: ["Football", "Volleyball"], record: "10 pts, 9 GF, 7 GA", tone: "Direct transitions and powerful second-half performances." },
  { name: "School of Arts", sports: ["Athletics", "Football"], record: "7 pts, 8 GF, 8 GA", tone: "Versatile athlete pool with standout speed and recovery runs." },
  { name: "School of Law", sports: ["Football", "Debate"], record: "9 pts, 6 GF, 4 GA", tone: "Composed and methodical with a strong competitive edge." },
  { name: "School of Medicine", sports: ["Football", "Basketball"], record: "8 pts, 7 GF, 6 GA", tone: "Disciplined shape with reliable late-game execution." }
];

export const dashboardStats = [
  { label: "Live Matches", value: "4", change: "+2 right now" },
  { label: "Fixtures This Week", value: "16", change: "Across 4 competitions" },
  { label: "Published Results", value: "42", change: "95% verified" },
  { label: "Push Subscribers", value: "1.8k", change: "+12% month-on-month" }
];

export const quickActions = ["Publish result", "Start live match", "Push campus alert", "Upload athlete feature"];
