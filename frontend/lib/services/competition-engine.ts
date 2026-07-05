import { prisma } from "@/lib/db";
import type { KnockoutRound } from "@/lib/types";

export type { KnockoutRound };

type TeamStats = { played: number; win: number; draw: number; loss: number; gf: number; ga: number };

function emptyStats(): TeamStats {
  return { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0 };
}

function applyResult(stats: TeamStats, gf: number, ga: number) {
  stats.played += 1;
  stats.gf += gf;
  stats.ga += ga;
  if (gf > ga) stats.win += 1;
  else if (gf < ga) stats.loss += 1;
  else stats.draw += 1;
}

async function upsertStandingRow(
  competitionId: string,
  teamId: string,
  groupKey: string,
  row: TeamStats
) {
  const gd = row.gf - row.ga;
  const pts = row.win * 3 + row.draw;
  await prisma.standing.upsert({
    where: {
      competitionId_teamId_groupKey: { competitionId, teamId, groupKey }
    },
    create: { competitionId, teamId, groupKey, ...row, gd, pts },
    update: { ...row, gd, pts }
  });
}

async function buildStandingsFromMatches(
  competitionId: string,
  groupKey: string,
  registeredTeamIds: string[],
  matchFilter: { stage?: string | { in: string[] }; groupId?: string }
) {
  const finished = await prisma.match.findMany({
    where: {
      competitionId,
      status: "FT",
      ...matchFilter
    }
  });

  const stats = new Map<string, TeamStats>();
  for (const teamId of registeredTeamIds) {
    stats.set(teamId, emptyStats());
  }

  for (const match of finished) {
    if (!stats.has(match.homeTeamId)) stats.set(match.homeTeamId, emptyStats());
    if (!stats.has(match.awayTeamId)) stats.set(match.awayTeamId, emptyStats());
    applyResult(stats.get(match.homeTeamId)!, match.homeScore, match.awayScore);
    applyResult(stats.get(match.awayTeamId)!, match.awayScore, match.homeScore);
  }

  for (const [teamId, row] of stats) {
    await upsertStandingRow(competitionId, teamId, groupKey, row);
  }
}

export async function recomputeCompetitionStandings(competitionId: string) {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      groups: { include: { teamEntries: true } },
      teamEntries: true
    }
  });
  if (!competition) return;

  const keysToKeep = new Set<string>([""]);
  for (const group of competition.groups) keysToKeep.add(group.id);

  await prisma.standing.deleteMany({
    where: {
      competitionId,
      groupKey: { notIn: [...keysToKeep] }
    }
  });

  if (competition.format === "LEAGUE") {
    const teamIds = competition.teamEntries.map((e) => e.teamId);
    await buildStandingsFromMatches(competitionId, "", teamIds, {
      stage: { in: ["LEAGUE", "GROUP"] }
    });
    return;
  }

  if (competition.groups.length > 0) {
    for (const group of competition.groups) {
      const teamIds = group.teamEntries.map((e) => e.teamId);
      await buildStandingsFromMatches(competitionId, group.id, teamIds, {
        stage: "GROUP",
        groupId: group.id
      });
    }
    return;
  }

  const teamIds = competition.teamEntries.map((e) => e.teamId);
  await buildStandingsFromMatches(competitionId, "", teamIds, {
    stage: { in: ["LEAGUE", "GROUP"] }
  });
}

export async function advanceKnockoutWinner(match: {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  nextMatchId: string | null;
  nextMatchSlot: string | null;
}) {
  if (!match.nextMatchId || !match.nextMatchSlot) return;

  let winnerId: string | null = null;
  if (match.homeScore > match.awayScore) winnerId = match.homeTeamId;
  else if (match.awayScore > match.homeScore) winnerId = match.awayTeamId;

  if (!winnerId) return;

  const data =
    match.nextMatchSlot === "home"
      ? { homeTeamId: winnerId }
      : match.nextMatchSlot === "away"
        ? { awayTeamId: winnerId }
        : null;

  if (!data) return;

  await prisma.match.update({
    where: { id: match.nextMatchId },
    data
  });
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export async function recomputePlayerStatsForTeams(teamIds: string[]) {
  if (!teamIds.length) return;

  await prisma.player.updateMany({
    where: { teamId: { in: teamIds } },
    data: { goals: 0, assists: 0 }
  });

  const players = await prisma.player.findMany({
    where: { teamId: { in: teamIds } },
    include: { team: true }
  });

  const playerLookup = new Map<string, string>();
  for (const player of players) {
    playerLookup.set(`${normalizeName(player.team.name)}::${normalizeName(player.name)}`, player.id);
  }

  const events = await prisma.matchEvent.findMany({
    where: {
      match: { status: "FT" },
      OR: [{ team: { in: players.map((p) => p.team.name) } }]
    }
  });

  const tallies = new Map<string, { goals: number; assists: number }>();

  for (const event of events) {
    const key = `${normalizeName(event.team)}::${normalizeName(event.player)}`;
    const playerId = playerLookup.get(key);
    if (!playerId) continue;

    if (!tallies.has(playerId)) tallies.set(playerId, { goals: 0, assists: 0 });
    const row = tallies.get(playerId)!;

    if (/goal/i.test(event.type)) row.goals += 1;
    if (/assist/i.test(event.type)) row.assists += 1;
  }

  for (const [playerId, row] of tallies) {
    await prisma.player.update({
      where: { id: playerId },
      data: { goals: row.goals, assists: row.assists }
    });
  }
}

export async function updateTeamForm(teamIds: string[]) {
  for (const teamId of teamIds) {
    const recent = await prisma.match.findMany({
      where: {
        status: "FT",
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }]
      },
      orderBy: { kickoff: "desc" },
      take: 5
    });

    const form = recent.reverse().map((match) => {
      const isHome = match.homeTeamId === teamId;
      const gf = isHome ? match.homeScore : match.awayScore;
      const ga = isHome ? match.awayScore : match.homeScore;
      if (gf > ga) return "W";
      if (gf < ga) return "L";
      return "D";
    });

    while (form.length < 5) form.unshift("D");

    await prisma.team.update({
      where: { id: teamId },
      data: { form: JSON.stringify(form.slice(-5)) }
    });
  }
}

export async function processMatchResult(matchId: string, previousStatus?: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { competition: true }
  });
  if (!match) return;

  const becameFt = match.status === "FT";
  const leftFt = previousStatus === "FT" && match.status !== "FT";

  if (becameFt || leftFt) {
    await recomputeCompetitionStandings(match.competitionId);
  }

  if (becameFt && match.stage === "KNOCKOUT") {
    await advanceKnockoutWinner(match);
  }

  if (becameFt || leftFt) {
    await recomputePlayerStatsForTeams([match.homeTeamId, match.awayTeamId]);
    await updateTeamForm([match.homeTeamId, match.awayTeamId]);
  }
}

export async function processMatchDeleted(competitionId: string, homeTeamId: string, awayTeamId: string) {
  await recomputeCompetitionStandings(competitionId);
  await recomputePlayerStatsForTeams([homeTeamId, awayTeamId]);
  await updateTeamForm([homeTeamId, awayTeamId]);
}

export async function syncPlayerStatsForMatchEvent(matchId: string, teamName: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const teamIds = new Set<string>();
  if (match.homeTeamId) teamIds.add(match.homeTeamId);
  if (match.awayTeamId) teamIds.add(match.awayTeamId);

  const team = await prisma.team.findFirst({ where: { name: teamName } });
  if (team) teamIds.add(team.id);

  await recomputePlayerStatsForTeams([...teamIds]);
}

const ROUND_ORDER: Record<string, number> = {
  "Round of 16": 1,
  "Quarter-Final": 2,
  "Semi-Final": 3,
  Final: 4
};

export async function fetchKnockoutBracket(competitionSlug: string): Promise<KnockoutRound[]> {
  const competition = await prisma.competition.findUnique({
    where: { slug: competitionSlug },
    include: {
      matches: {
        where: { stage: "KNOCKOUT" },
        include: { homeTeam: true, awayTeam: true },
        orderBy: { kickoff: "asc" }
      }
    }
  });

  if (!competition) return [];

  const grouped = new Map<string, KnockoutRound["matches"]>();
  for (const match of competition.matches) {
    const round = match.round ?? "Knockout";
    if (!grouped.has(round)) grouped.set(round, []);
    grouped.get(round)!.push({
      id: match.id,
      home: match.homeTeam.name,
      away: match.awayTeam.name,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      kickoff: match.kickoff.toISOString(),
      venue: match.venue
    });
  }

  return [...grouped.entries()]
    .map(([round, matches]) => ({
      round,
      order: ROUND_ORDER[round] ?? 99,
      matches
    }))
    .sort((a, b) => a.order - b.order);
}

export async function autoQualifyGroupWinners(competitionId: string, advancePerGroup = 2) {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { groups: { orderBy: { name: "asc" } } }
  });
  if (!competition || competition.format !== "TOURNAMENT" || !competition.groups.length) return [];

  const qualified: Array<{ teamId: string; teamName: string; groupName: string; rank: number }> = [];

  for (const group of competition.groups) {
    const rows = await prisma.standing.findMany({
      where: { competitionId, groupKey: group.id },
      include: { team: true },
      orderBy: [{ pts: "desc" }, { gd: "desc" }, { gf: "desc" }]
    });

    rows.slice(0, advancePerGroup).forEach((row, index) => {
      qualified.push({
        teamId: row.teamId,
        teamName: row.team.name,
        groupName: group.name,
        rank: index + 1
      });
    });
  }

  return qualified;
}

type QualifiedTeam = Awaited<ReturnType<typeof autoQualifyGroupWinners>>[number];

function buildKnockoutPairings(qualified: QualifiedTeam[], advancePerGroup: number) {
  const byGroup = new Map<string, QualifiedTeam[]>();
  for (const entry of qualified) {
    if (!byGroup.has(entry.groupName)) byGroup.set(entry.groupName, []);
    byGroup.get(entry.groupName)!.push(entry);
  }
  for (const entries of byGroup.values()) entries.sort((a, b) => a.rank - b.rank);

  const groupNames = [...byGroup.keys()].sort();

  if (advancePerGroup >= 2 && groupNames.length >= 2) {
    const winners = groupNames
      .map((group) => byGroup.get(group)!.find((entry) => entry.rank === 1))
      .filter((entry): entry is QualifiedTeam => !!entry);
    const runners = groupNames
      .map((group) => byGroup.get(group)!.find((entry) => entry.rank === 2))
      .filter((entry): entry is QualifiedTeam => !!entry);
    if (winners.length && runners.length) {
      return {
        pairings: winners.map((winner, index) => [winner.teamId, runners[(index + 1) % runners.length]!.teamId] as [string, string]),
        byeTeamId: null as string | null
      };
    }
  }

  const topPerGroup = groupNames.map((group) => byGroup.get(group)![0]).filter(Boolean);
  const pairings: Array<[string, string]> = [];
  let byeTeamId: string | null = null;

  if (topPerGroup.length % 2 === 1) {
    byeTeamId = topPerGroup.pop()!.teamId;
  }

  for (let index = 0; index < topPerGroup.length; index += 2) {
    if (index + 1 < topPerGroup.length) {
      pairings.push([topPerGroup[index]!.teamId, topPerGroup[index + 1]!.teamId]);
    }
  }

  return { pairings, byeTeamId };
}

function roundNameForPairingCount(count: number) {
  if (count >= 4) return "Quarter-Final";
  if (count >= 2) return "Semi-Final";
  return "Knockout";
}

export async function qualifyGroupsToKnockout(
  competitionId: string,
  advancePerGroup = 1,
  opts: { startDate?: Date; venue?: string; intervalDays?: number } = {}
) {
  await recomputeCompetitionStandings(competitionId);

  const qualified = await autoQualifyGroupWinners(competitionId, advancePerGroup);
  if (qualified.length < 2) {
    return { qualified, updated: [] as string[], created: [] as string[], byes: [] as string[] };
  }

  const { pairings, byeTeamId } = buildKnockoutPairings(qualified, advancePerGroup);
  if (!pairings.length) {
    return { qualified, updated: [], created: [], byes: byeTeamId ? [byeTeamId] : [] };
  }

  const venue = opts.venue ?? "UTG Main Field";
  const intervalDays = opts.intervalDays ?? 3;
  let kickoff = opts.startDate ?? new Date();

  const existing = await prisma.match.findMany({
    where: { competitionId, stage: "KNOCKOUT" },
    orderBy: { kickoff: "asc" }
  });

  const byRound = new Map<string, typeof existing>();
  for (const match of existing) {
    const round = match.round ?? "Knockout";
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push(match);
  }

  const sortedRounds = [...byRound.entries()].sort(
    (a, b) => (ROUND_ORDER[a[0]] ?? 99) - (ROUND_ORDER[b[0]] ?? 99)
  );

  const updated: string[] = [];
  const created: string[] = [];
  const pairingTeamIds = new Set(pairings.flat());

  if (sortedRounds.length > 0) {
    const [, roundMatches] = sortedRounds[0]!;

    for (let index = 0; index < pairings.length; index++) {
      const [homeTeamId, awayTeamId] = pairings[index]!;

      if (index < roundMatches.length) {
        await prisma.match.update({
          where: { id: roundMatches[index]!.id },
          data: { homeTeamId, awayTeamId, status: "UPCOMING", homeScore: 0, awayScore: 0 }
        });
        updated.push(roundMatches[index]!.id);
      } else {
        const match = await prisma.match.create({
          data: {
            competitionId,
            homeTeamId,
            awayTeamId,
            venue,
            kickoff: new Date(kickoff),
            status: "UPCOMING",
            stage: "KNOCKOUT",
            round: roundMatches[0]?.round ?? roundNameForPairingCount(pairings.length),
            homeScore: 0,
            awayScore: 0
          }
        });
        created.push(match.id);
      }

      kickoff = new Date(kickoff.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    }

    if (byeTeamId && sortedRounds.length > 1) {
      const nextRoundMatches = sortedRounds[1]![1];
      const target = nextRoundMatches.find(
        (match) => !pairingTeamIds.has(match.homeTeamId) && !pairingTeamIds.has(match.awayTeamId)
      );

      if (target) {
        const slot =
          !pairingTeamIds.has(target.homeTeamId) && pairingTeamIds.has(target.awayTeamId)
            ? { homeTeamId: byeTeamId }
            : { awayTeamId: byeTeamId };

        await prisma.match.update({ where: { id: target.id }, data: slot });
        updated.push(target.id);
      }
    }
  } else {
    const roundName = roundNameForPairingCount(pairings.length);

    for (const [homeTeamId, awayTeamId] of pairings) {
      const match = await prisma.match.create({
        data: {
          competitionId,
          homeTeamId,
          awayTeamId,
          venue,
          kickoff: new Date(kickoff),
          status: "UPCOMING",
          stage: "KNOCKOUT",
          round: roundName,
          homeScore: 0,
          awayScore: 0
        }
      });
      created.push(match.id);
      kickoff = new Date(kickoff.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    }
  }

  return {
    qualified,
    updated,
    created,
    byes: byeTeamId ? [byeTeamId] : []
  };
}

export async function generateLeagueFixtures(competitionId: string, startDate: Date, intervalDays = 7) {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { teamEntries: { include: { team: true } } }
  });
  if (!competition || competition.format !== "LEAGUE") return [];

  const teamIds = competition.teamEntries.map((e) => e.teamId);
  if (teamIds.length < 2) return [];

  const created: string[] = [];
  let matchday = 1;
  let kickoff = new Date(startDate);

  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const match = await prisma.match.create({
        data: {
          competitionId,
          homeTeamId: teamIds[i],
          awayTeamId: teamIds[j],
          venue: "UTG Main Field",
          kickoff: new Date(kickoff),
          status: "UPCOMING",
          stage: "LEAGUE",
          round: `Matchday ${matchday}`,
          homeScore: 0,
          awayScore: 0
        }
      });
      created.push(match.id);
      kickoff = new Date(kickoff.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      matchday += 1;
    }
  }

  return created;
}

// Backwards-compatible export used elsewhere
export async function recomputeStandings(competitionId: string) {
  await recomputeCompetitionStandings(competitionId);
}
