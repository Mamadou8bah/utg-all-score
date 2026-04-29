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
    name: "Inter-Faculty Premier League",
    type: "GENERAL",
    description: "The main university-wide football competition featuring all schools.",
    format: "LEAGUE",
    logo: "/images/ifpl-logo.png"
  },
  {
    id: "sitc-cup-2026",
    name: "SITC Dean's Cup",
    type: "SCHOOL",
    schoolName: "School of ICT",
    description: "Internal competition for the School of ICT departments.",
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
    competition: "Inter-Faculty Premier League",
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
    competition: "SITC Dean's Cup",
    home: "Computer Science",
    away: "Information Systems",
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
    id: "f1",
    competitionId: "ifpl-2026",
    competition: "Inter-Faculty Premier League",
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
    competition: "SITC Dean's Cup",
    home: "Software Engineering",
    away: "Cybersecurity",
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
    competition: "Inter-Faculty Premier League",
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
  { competitionId: "sitc-cup-2026", team: "Computer Science", played: 2, win: 2, draw: 0, loss: 0, gf: 4, ga: 1, gd: 3, pts: 6 },
  { competitionId: "sitc-cup-2026", team: "Information Systems", played: 2, win: 1, draw: 0, loss: 1, gf: 2, ga: 2, gd: 0, pts: 3 },

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
  { id: "e1", title: "Inter-Faculty Finals Night", type: "Finals", venue: "UTG Main Campus", date: "2026-05-28T18:00:00+00:00", description: "Final football and basketball fixtures followed by awards and media interviews." },
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
    logo: "/images/itca-logo.png"
  },
  {
    name: "Law Students' Association (LSA)",
    colors: ["#7F1D1D", "#FCD34D"],
    tone: "Tactically mature and excellent at controlling set-piece phases.",
    form: ["W", "D", "W", "W", "L"]
  },
  {
    name: "Science Students' Association",
    colors: ["#0F172A", "#22C55E"],
    tone: "Energetic side that relies on athletic recovery and direct vertical play.",
    form: ["L", "W", "W", "L", "D"]
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
