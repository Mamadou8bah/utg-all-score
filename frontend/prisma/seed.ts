import { PrismaClient } from "@prisma/client";
import {
  recomputeCompetitionStandings,
  recomputePlayerStatsForTeams,
  updateTeamForm
} from "../lib/services/competition-engine";
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  ensureDefaultAdmin
} from "../lib/bootstrap-admin";

const prisma = new PrismaClient();

const schools = [
  { name: "School of ICT", shortName: "ICT" },
  { name: "School of Business & Commerce", shortName: "SOB" },
  { name: "School of Arts & Humanities", shortName: "Arts" },
  { name: "School of Medicine", shortName: "Med" },
  { name: "School of Law", shortName: "Law" },
  { name: "School of Agriculture", shortName: "Agri" },
  { name: "School of Journalism", shortName: "Journ" },
  { name: "School of Education", shortName: "Edu" }
];

const associationTeams = [
  { name: "Accountancy Students' Association (ASA)", school: "School of Business & Commerce", colors: ["#0F766E", "#F8FAFC"], form: ["D", "W", "W", "L", "D"] },
  { name: "Economics and Management Students Association (ECOMANSA)", school: "School of Business & Commerce", colors: ["#7C3AED", "#FDE68A"], form: ["W", "W", "D", "W", "L"] },
  { name: "Education Students' Association (EDUSA)", school: "School of Education", colors: ["#0284C7", "#F8FAFC"], form: ["D", "L", "W", "D", "W"] },
  { name: "Journalism Students' Association (JSA)", school: "School of Journalism", colors: ["#111827", "#EF4444"], form: ["L", "W", "D", "L", "W"] },
  { name: "Information, Technology and Communication Association (ITCA)", school: "School of ICT", colors: ["#2563EB", "#E0F2FE"], form: ["D", "W", "W", "D", "W"] },
  { name: "Law Students' Association (LSA)", school: "School of Law", colors: ["#7F1D1D", "#FCD34D"], form: ["W", "D", "W", "W", "L"] },
  { name: "Science Students' Association", school: "School of Agriculture", colors: ["#0F172A", "#22C55E"], form: ["L", "W", "W", "L", "D"] },
  { name: "Student Association for Public and Environmental Health (SAPEH)", school: "School of Medicine", colors: ["#059669", "#ECFCCB"], form: ["W", "D", "L", "W", "D"] },
  { name: "Agriculture and Environmental Science Students' Association (AESSA)", school: "School of Agriculture", colors: ["#166534", "#FDE68A"], form: ["W", "L", "D", "W", "W"] },
  { name: "Architecture and Engineering Students' Association (AESA)", school: "School of ICT", colors: ["#1D4ED8", "#CBD5E1"], form: ["L", "D", "W", "L", "W"] },
  { name: "UTG Medical Students Association (UNIGAMSA)", school: "School of Medicine", colors: ["#DC2626", "#F8FAFC"], form: ["W", "W", "L", "W", "D"] },
  { name: "UTG Nursing Students Association (UTG-NSA)", school: "School of Medicine", colors: ["#0891B2", "#F0FDFA"], form: ["D", "W", "D", "L", "W"] }
];

const facultyTeams = [
  { name: "School of ICT", school: "School of ICT", colors: ["#0055A4", "#000000"], form: ["W", "W", "D", "W", "W"], tone: "High pressing and strong ball security across midfield." },
  { name: "School of Business", school: "School of Business & Commerce", colors: ["#FFC72C", "#000000"], form: ["W", "L", "W", "D", "W"], tone: "Direct transitions and powerful second-half performances." },
  { name: "School of Arts", school: "School of Arts & Humanities", colors: ["#E4002B", "#FFFFFF"], form: ["L", "W", "L", "W", "D"], tone: "Creative flair with emphasis on wide overloads." },
  { name: "School of Medicine", school: "School of Medicine", colors: ["#008C45", "#FFFFFF"], form: ["D", "D", "W", "L", "L"], tone: "Disciplined defensive structure with patient build-up." },
  { name: "Year 1 (ITCA)", school: "School of ICT", colors: ["#1E40AF", "#DBEAFE"], form: ["L", "D", "W", "L", "D"], tone: "Young ITCA side building cohesion in internal league play." },
  { name: "Year 2 (ITCA)", school: "School of ICT", colors: ["#1D4ED8", "#BFDBFE"], form: ["W", "L", "D", "W", "L"], tone: "Balanced ITCA year group with strong wing play." },
  { name: "Year 3 (ITCA)", school: "School of ICT", colors: ["#2563EB", "#EFF6FF"], form: ["W", "W", "D", "W", "W"], tone: "Leaders of the ITCA internal league table." },
  { name: "Year 4 (ITCA)", school: "School of ICT", colors: ["#3B82F6", "#F8FAFC"], form: ["L", "W", "L", "D", "W"], tone: "Experienced ITCA side focused on set-piece efficiency." },
  { name: "Accounting (SOB)", school: "School of Business & Commerce", colors: ["#065F46", "#ECFDF5"], form: ["W", "D", "W", "L", "W"], tone: "Structured SOB Challenge Cup unit." },
  { name: "Marketing (SOB)", school: "School of Business & Commerce", colors: ["#B45309", "#FFFBEB"], form: ["D", "W", "L", "W", "D"], tone: "Aggressive pressing team in the Business School cup." }
];

export async function seedDatabase() {
  console.log("Seeding UTG AllScore football database...");

  await prisma.lineupPlayer.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.competitionGroupTeam.deleteMany();
  await prisma.competitionGroup.deleteMany();
  await prisma.competitionTeam.deleteMany();
  await prisma.player.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.footballEvent.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const schoolMap = new Map<string, string>();
  for (const school of schools) {
    const created = await prisma.school.create({ data: school });
    schoolMap.set(school.name, created.id);
  }

  await ensureDefaultAdmin(prisma);

  const teamMap = new Map<string, string>();

  async function createTeam(
    name: string,
    schoolName: string,
    colors: string[],
    form: string[],
    tone?: string
  ) {
    const team = await prisma.team.create({
      data: {
        name,
        schoolId: schoolMap.get(schoolName),
        colors: JSON.stringify(colors),
        form: JSON.stringify(form),
        tone: tone ?? `Football squad representing ${name} at UTG.`
      }
    });
    teamMap.set(name, team.id);
    return team;
  }

  for (const team of facultyTeams) {
    await createTeam(team.name, team.school, team.colors, team.form, team.tone);
  }

  for (const team of associationTeams) {
    await createTeam(
      team.name,
      team.school,
      team.colors,
      team.form,
      `UTGSU sub-association side competing in university football competitions.`
    );
  }

  const samplePlayers: Record<string, Array<{ number: number; name: string; role: string; position: string; goals: number; assists: number }>> = {
    "School of ICT": [
      { number: 1, name: "Modou Jagne", role: "GK", position: "Goalkeeper", goals: 0, assists: 0 },
      { number: 10, name: "Lamin Jatta", role: "MID", position: "Attacking Midfielder", goals: 4, assists: 3 },
      { number: 8, name: "Ebrima Ceesay", role: "MID", position: "Central Midfielder", goals: 2, assists: 4 },
      { number: 7, name: "Bubacarr Gaye", role: "FWD", position: "Right Winger", goals: 3, assists: 1 }
    ],
    "Information, Technology and Communication Association (ITCA)": [
      { number: 11, name: "Ousman Sowe", role: "FWD", position: "Wide Forward", goals: 3, assists: 2 },
      { number: 6, name: "Samba Bah", role: "MID", position: "Defensive Midfielder", goals: 1, assists: 3 }
    ],
    "Law Students' Association (LSA)": [
      { number: 10, name: "Awa Bah", role: "MID", position: "Attacking Midfielder", goals: 2, assists: 4 },
      { number: 9, name: "Demba Sanyang", role: "FWD", position: "Striker", goals: 3, assists: 1 }
    ],
    "UTG Medical Students Association (UNIGAMSA)": [
      { number: 9, name: "Fatou Njie", role: "FWD", position: "Center Forward", goals: 4, assists: 1 },
      { number: 1, name: "Mariama Camara", role: "GK", position: "Goalkeeper", goals: 0, assists: 0 }
    ],
    "Economics and Management Students Association (ECOMANSA)": [
      { number: 8, name: "Muhammed Ceesay", role: "MID", position: "Deep-Lying Playmaker", goals: 1, assists: 5 }
    ]
  };

  for (const [teamName, players] of Object.entries(samplePlayers)) {
    const teamId = teamMap.get(teamName);
    if (!teamId) continue;
    for (const player of players) {
      await prisma.player.create({ data: { teamId, ...player } });
    }
  }

  const vcTournament = await prisma.competition.create({
    data: {
      slug: "vc-tournament-2026",
      name: "VC Tournament",
      type: "GENERAL",
      format: "TOURNAMENT",
      description: "The Vice Chancellor's university-wide football tournament featuring UTGSU sub-associations and faculty sides."
    }
  });

  const itcaLeague = await prisma.competition.create({
    data: {
      slug: "itca-league-2026",
      name: "ITCA League",
      type: "SCHOOL",
      format: "LEAGUE",
      description: "Internal ITCA football league between Year 1, Year 2, Year 3, and Year 4.",
      schoolId: schoolMap.get("School of ICT")
    }
  });

  const sobCup = await prisma.competition.create({
    data: {
      slug: "sob-challenge-cup-2026",
      name: "SOB Challenge Cup",
      type: "SCHOOL",
      format: "TOURNAMENT",
      description: "Annual football challenge within the School of Business & Commerce.",
      schoolId: schoolMap.get("School of Business & Commerce")
    }
  });

  const unityShield = await prisma.competition.create({
    data: {
      slug: "utgsu-unity-shield-2026",
      name: "UTGSU Unity Shield",
      type: "GENERAL",
      format: "TOURNAMENT",
      description: "UTGSU flagship football competition for recognized sub-associations across The University of The Gambia."
    }
  });

  const compTeams: Record<string, string[]> = {
    [vcTournament.id]: [
      "Information, Technology and Communication Association (ITCA)",
      "Law Students' Association (LSA)",
      "Economics and Management Students Association (ECOMANSA)",
      "Accountancy Students' Association (ASA)",
      "Journalism Students' Association (JSA)",
      "Education Students' Association (EDUSA)",
      "UTG Medical Students Association (UNIGAMSA)",
      "Architecture and Engineering Students' Association (AESA)"
    ],
    [itcaLeague.id]: ["Year 1 (ITCA)", "Year 2 (ITCA)", "Year 3 (ITCA)", "Year 4 (ITCA)"],
    [sobCup.id]: ["Accounting (SOB)", "Marketing (SOB)", "School of Business"],
    [unityShield.id]: associationTeams.map((t) => t.name)
  };

  for (const [compId, teams] of Object.entries(compTeams)) {
    for (const teamName of teams) {
      const teamId = teamMap.get(teamName);
      if (teamId) {
        await prisma.competitionTeam.create({ data: { competitionId: compId, teamId } });
      }
    }
  }

  const groupA = await prisma.competitionGroup.create({
    data: { competitionId: unityShield.id, name: "Group A" }
  });
  const groupB = await prisma.competitionGroup.create({
    data: { competitionId: unityShield.id, name: "Group B" }
  });
  const groupC = await prisma.competitionGroup.create({
    data: { competitionId: unityShield.id, name: "Group C" }
  });

  const groupAssignments: Record<string, string[]> = {
    [groupA.id]: ["Accountancy Students' Association (ASA)", "Economics and Management Students Association (ECOMANSA)", "Education Students' Association (EDUSA)", "Journalism Students' Association (JSA)"],
    [groupB.id]: ["Information, Technology and Communication Association (ITCA)", "Law Students' Association (LSA)", "Science Students' Association", "Student Association for Public and Environmental Health (SAPEH)"],
    [groupC.id]: ["Agriculture and Environmental Science Students' Association (AESSA)", "Architecture and Engineering Students' Association (AESA)", "UTG Medical Students Association (UNIGAMSA)", "UTG Nursing Students Association (UTG-NSA)"]
  };

  for (const [groupId, teams] of Object.entries(groupAssignments)) {
    for (const teamName of teams) {
      const teamId = teamMap.get(teamName);
      if (teamId) {
        await prisma.competitionGroupTeam.create({ data: { groupId, teamId } });
      }
    }
  }

  const teamToGroupId = new Map<string, string>();

  for (const [groupId, teams] of Object.entries(groupAssignments)) {
    for (const teamName of teams) {
      teamToGroupId.set(teamName, groupId);
    }
  }

  async function createMatch(
    competitionId: string,
    home: string,
    away: string,
    venue: string,
    kickoff: Date,
    status: "LIVE" | "FT" | "UPCOMING",
    homeScore: number,
    awayScore: number,
    opts: {
      timer?: string;
      events?: Array<{ minute: number; type: string; player: string; team: string; detail: string }>;
      stage?: string;
      round?: string;
      groupId?: string | null;
      nextMatchId?: string | null;
      nextMatchSlot?: string | null;
    } = {}
  ) {
    const homeTeamId = teamMap.get(home)!;
    const awayTeamId = teamMap.get(away)!;
    const match = await prisma.match.create({
      data: {
        competitionId,
        homeTeamId,
        awayTeamId,
        venue,
        kickoff,
        status,
        homeScore,
        awayScore,
        timer: opts.timer,
        stage: opts.stage ?? "LEAGUE",
        round: opts.round,
        groupId: opts.groupId ?? null,
        nextMatchId: opts.nextMatchId ?? null,
        nextMatchSlot: opts.nextMatchSlot ?? null,
        events: opts.events?.length ? { create: opts.events } : undefined
      }
    });
    return match;
  }

  function unityGroup(teamName: string) {
    return teamToGroupId.get(teamName) ?? null;
  }

  const live1 = await createMatch(
    unityShield.id,
    "Information, Technology and Communication Association (ITCA)",
    "Law Students' Association (LSA)",
    "Brikama Campus Arena",
    new Date("2026-04-05T15:00:00+00:00"),
    "LIVE",
    1,
    1,
    {
      timer: "63'",
      stage: "GROUP",
      round: "Group B",
      groupId: unityGroup("Information, Technology and Communication Association (ITCA)"),
      events: [
        { minute: 18, type: "Goal", player: "Ousman Sowe", team: "Information, Technology and Communication Association (ITCA)", detail: "Driven finish after a quick overload on the right." },
        { minute: 51, type: "Goal", player: "Awa Bah", team: "Law Students' Association (LSA)", detail: "Placed low from the edge of the box after a recycled corner." }
      ]
    }
  );

  await createMatch(
    vcTournament.id,
    "Information, Technology and Communication Association (ITCA)",
    "Law Students' Association (LSA)",
    "UTG Main Field",
    new Date("2026-04-03T16:00:00+00:00"),
    "LIVE",
    2,
    1,
    {
      timer: "72'",
      stage: "GROUP",
      round: "Group Stage",
      events: [
        { minute: 14, type: "Goal", player: "Lamin Jatta", team: "Information, Technology and Communication Association (ITCA)", detail: "Near-post finish after a cutback." },
        { minute: 58, type: "Goal", player: "Muhammed Ceesay", team: "Law Students' Association (LSA)", detail: "Rebound finished low into the corner." },
        { minute: 67, type: "Goal", player: "Ousman Sowe", team: "Information, Technology and Communication Association (ITCA)", detail: "Struck from the edge after second-ball pressure." }
      ]
    }
  );

  await createMatch(
    itcaLeague.id,
    "Year 3 (ITCA)",
    "Year 2 (ITCA)",
    "Faraba Sports Ground",
    new Date("2026-04-03T17:00:00+00:00"),
    "LIVE",
    1,
    0,
    { timer: "40'", stage: "LEAGUE", round: "Matchday 2" }
  );

  await prisma.lineupPlayer.createMany({
    data: [
      { matchId: live1.id, teamId: teamMap.get("Information, Technology and Communication Association (ITCA)")!, number: 1, name: "Modou Jagne", role: "GK", isSub: false },
      { matchId: live1.id, teamId: teamMap.get("Information, Technology and Communication Association (ITCA)")!, number: 11, name: "Ousman Sowe", role: "FWD", isSub: false },
      { matchId: live1.id, teamId: teamMap.get("Information, Technology and Communication Association (ITCA)")!, number: 6, name: "Samba Bah", role: "MID", isSub: false },
      { matchId: live1.id, teamId: teamMap.get("Law Students' Association (LSA)")!, number: 1, name: "Musa Camara", role: "GK", isSub: false },
      { matchId: live1.id, teamId: teamMap.get("Law Students' Association (LSA)")!, number: 10, name: "Awa Bah", role: "MID", isSub: false },
      { matchId: live1.id, teamId: teamMap.get("Law Students' Association (LSA)")!, number: 9, name: "Demba Sanyang", role: "FWD", isSub: false }
    ]
  });

  await createMatch(
    vcTournament.id,
    "Economics and Management Students Association (ECOMANSA)",
    "Accountancy Students' Association (ASA)",
    "UTG Main Field",
    new Date("2026-03-28T16:00:00+00:00"),
    "FT",
    3,
    2,
    { stage: "GROUP", round: "Group Stage" }
  );

  await createMatch(
    unityShield.id,
    "Journalism Students' Association (JSA)",
    "Economics and Management Students Association (ECOMANSA)",
    "Kanifing Annex Pitch",
    new Date("2026-04-03T16:00:00+00:00"),
    "FT",
    0,
    2,
    { stage: "GROUP", round: "Group A", groupId: unityGroup("Journalism Students' Association (JSA)") }
  );

  await createMatch(
    unityShield.id,
    "Law Students' Association (LSA)",
    "Science Students' Association",
    "Brikama Campus Arena",
    new Date("2026-04-03T17:30:00+00:00"),
    "FT",
    1,
    0,
    { stage: "GROUP", round: "Group B", groupId: unityGroup("Law Students' Association (LSA)") }
  );

  await createMatch(
    unityShield.id,
    "UTG Medical Students Association (UNIGAMSA)",
    "Architecture and Engineering Students' Association (AESA)",
    "Main Campus 5-a-side Court",
    new Date("2026-04-04T15:00:00+00:00"),
    "FT",
    3,
    1,
    { stage: "GROUP", round: "Group C", groupId: unityGroup("UTG Medical Students Association (UNIGAMSA)") }
  );

  await createMatch(
    sobCup.id,
    "Accounting (SOB)",
    "Marketing (SOB)",
    "Business School Pitch",
    new Date("2026-04-02T16:00:00+00:00"),
    "FT",
    2,
    2,
    { stage: "LEAGUE", round: "Group Stage" }
  );

  await createMatch(
    itcaLeague.id,
    "Year 3 (ITCA)",
    "Year 1 (ITCA)",
    "Faraba Sports Ground",
    new Date("2026-03-20T16:00:00+00:00"),
    "FT",
    2,
    0,
    { stage: "LEAGUE", round: "Matchday 1" }
  );

  await createMatch(
    itcaLeague.id,
    "Year 2 (ITCA)",
    "Year 4 (ITCA)",
    "Faraba Sports Ground",
    new Date("2026-03-21T16:00:00+00:00"),
    "FT",
    1,
    1,
    { stage: "LEAGUE", round: "Matchday 1" }
  );

  const upcomingFixtures = [
    [vcTournament.id, "Information, Technology and Communication Association (ITCA)", "Law Students' Association (LSA)", "Faraba Sports Ground", "2026-04-29T16:00:00+00:00"],
    [vcTournament.id, "Economics and Management Students Association (ECOMANSA)", "Accountancy Students' Association (ASA)", "Brikama Campus Arena", "2026-04-29T18:00:00+00:00"],
    [unityShield.id, "Accountancy Students' Association (ASA)", "Education Students' Association (EDUSA)", "Kanifing Annex Pitch", "2026-04-06T16:00:00+00:00"],
    [unityShield.id, "UTG Medical Students Association (UNIGAMSA)", "UTG Nursing Students Association (UTG-NSA)", "Main Campus 5-a-side Court", "2026-04-08T17:00:00+00:00"],
    [itcaLeague.id, "Year 1 (ITCA)", "Year 4 (ITCA)", "Faraba Sports Ground", "2026-04-06T14:00:00+00:00"]
  ] as const;

  for (const [compId, home, away, venue, kickoff] of upcomingFixtures) {
    const isUnity = compId === unityShield.id;
    const isItca = compId === itcaLeague.id;
    await createMatch(compId, home, away, venue, new Date(kickoff), "UPCOMING", 0, 0, {
      stage: isItca ? "LEAGUE" : isUnity ? "GROUP" : "GROUP",
      round: isItca ? "Matchday 3" : isUnity ? "Group Stage" : "Group Stage",
      groupId: isUnity ? unityGroup(home) : null
    });
  }

  const final = await createMatch(
    unityShield.id,
    "Economics and Management Students Association (ECOMANSA)",
    "UTG Medical Students Association (UNIGAMSA)",
    "UTG Main Field, Kanifing",
    new Date("2026-05-28T18:00:00+00:00"),
    "UPCOMING",
    0,
    0,
    { stage: "KNOCKOUT", round: "Final" }
  );

  await createMatch(
    unityShield.id,
    "Economics and Management Students Association (ECOMANSA)",
    "Law Students' Association (LSA)",
    "UTG Main Field, Kanifing",
    new Date("2026-05-15T16:00:00+00:00"),
    "UPCOMING",
    0,
    0,
    { stage: "KNOCKOUT", round: "Semi-Final", nextMatchId: final.id, nextMatchSlot: "home" }
  );

  await createMatch(
    unityShield.id,
    "UTG Medical Students Association (UNIGAMSA)",
    "Information, Technology and Communication Association (ITCA)",
    "UTG Main Field, Kanifing",
    new Date("2026-05-15T18:00:00+00:00"),
    "UPCOMING",
    0,
    0,
    { stage: "KNOCKOUT", round: "Semi-Final", nextMatchId: final.id, nextMatchSlot: "away" }
  );

  const allTeamIds = [...teamMap.values()];
  for (const comp of [unityShield, itcaLeague, vcTournament, sobCup]) {
    await recomputeCompetitionStandings(comp.id);
  }
  await recomputePlayerStatsForTeams(allTeamIds);
  await updateTeamForm(allTeamIds);

  await prisma.newsArticle.createMany({
    data: [
      {
        title: "ITCA edge a tense Unity Shield fixture under the lights",
        excerpt: "A composed second-half display keeps ITCA in the Group B hunt at Brikama Campus Arena.",
        body: "ITCA and LSA shared the spoils in a gripping Group B encounter, with Ousman Sowe and Awa Bah both finding the net.",
        category: "Match Report",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
        publishedAt: new Date("2026-04-02T20:30:00+00:00")
      },
      {
        title: "UTGSU confirms football-only matchday operations for 2026",
        excerpt: "AllScore now focuses exclusively on UTG football — VC Tournament, Unity Shield, and school leagues.",
        body: "The UTGSU sports office has standardised digital scoring workflows for football fixtures across all campuses.",
        category: "UTGSU Football",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop",
        publishedAt: new Date("2026-04-01T12:00:00+00:00")
      },
      {
        title: "School agents onboarded for live score updates",
        excerpt: "Faculty and association agents can now publish lineups, goals, and match reports in real time.",
        category: "Platform",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
        publishedAt: new Date("2026-03-31T08:45:00+00:00")
      }
    ]
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "Football results publication window",
        body: "Association agents must submit official football results within 30 minutes of full time.",
        level: "info"
      },
      {
        title: "Unity Shield Group stage continues",
        body: "All Group A, B, and C fixtures run through April at Faraba, Brikama, and Kanifing venues.",
        level: "info"
      },
      {
        title: "Venue change — ITCA League",
        body: "Year 1 vs Year 4 moved to Faraba Sports Ground due to campus scheduling.",
        level: "warning"
      }
    ]
  });

  await prisma.footballEvent.createMany({
    data: [
      {
        title: "UTGSU Unity Shield Semi-Finals",
        type: "Knockout",
        venue: "UTG Main Field, Kanifing",
        date: new Date("2026-05-15T16:00:00+00:00"),
        description: "Semi-final football fixtures across Unity Shield groups with UTGSU match officials."
      },
      {
        title: "VC Tournament Final",
        type: "Final",
        venue: "Faraba Sports Ground",
        date: new Date("2026-05-28T18:00:00+00:00"),
        description: "VC Tournament football final followed by UTGSU awards ceremony."
      }
    ]
  });

  console.log("\n✅ Seed complete!");
  console.log(`   Admin login: ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`   Admin password: ${DEFAULT_ADMIN_PASSWORD}`);
  console.log("   Admin app:  http://localhost:3001/login");
  console.log("   Agent app:  http://localhost:3002/login");
  console.log("   Public site: http://localhost:3000\n");
}

if (process.argv[1]?.includes("seed")) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
