import { prisma } from "@/lib/db";
import {
  fetchKnockoutBracket,
  recomputeCompetitionStandings,
  recomputeStandings
} from "@/lib/services/competition-engine";
import type {
  AnnouncementItem,
  AthleteProfile,
  Competition,
  CompetitionStats,
  FootballEventItem,
  Match,
  MatchEvent,
  NewsItem,
  StandingRow,
  TeamProfile
} from "@/lib/types";

const matchInclude = {
  competition: { include: { school: true } },
  homeTeam: true,
  awayTeam: true,
  events: { orderBy: { minute: "asc" as const } },
  lineups: true
};

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function serializeMatch(match: Awaited<ReturnType<typeof fetchMatchById>>): Match | null {
  if (!match) return null;

  const events: MatchEvent[] = match.events.map((event) => ({
    minute: event.minute,
    type: event.type,
    player: event.player,
    team: event.team,
    detail: event.detail
  }));

  const homeLineups = match.lineups.filter((l) => l.teamId === match.homeTeamId);
  const awayLineups = match.lineups.filter((l) => l.teamId === match.awayTeamId);

  const lineups =
    homeLineups.length || awayLineups.length
      ? {
          home: {
            starting: homeLineups.filter((l) => !l.isSub).map(({ number, name, role }) => ({ number, name, role })),
            subs: homeLineups.filter((l) => l.isSub).map(({ number, name, role }) => ({ number, name, role }))
          },
          away: {
            starting: awayLineups.filter((l) => !l.isSub).map(({ number, name, role }) => ({ number, name, role })),
            subs: awayLineups.filter((l) => l.isSub).map(({ number, name, role }) => ({ number, name, role }))
          }
        }
      : undefined;

  return {
    id: match.id,
    competitionId: match.competition.slug,
    competition: match.competition.name,
    home: match.homeTeam.name,
    away: match.awayTeam.name,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    venue: match.venue,
    kickoff: match.kickoff.toISOString(),
    status: match.status as Match["status"],
    timer: match.timer ?? undefined,
    stage: match.stage as Match["stage"],
    round: match.round ?? undefined,
    groupId: match.groupId ?? undefined,
    events,
    lineups
  };
}

export async function fetchMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: matchInclude
  });
}

export async function fetchMatchesByStatus(status: "LIVE" | "FT" | "UPCOMING") {
  const matches = await prisma.match.findMany({
    where: { status },
    include: matchInclude,
    orderBy: { kickoff: status === "UPCOMING" ? "asc" : "desc" }
  });
  return matches.map((m) => serializeMatch(m)!);
}

export async function fetchAllMatches() {
  const matches = await prisma.match.findMany({
    include: matchInclude,
    orderBy: { kickoff: "desc" }
  });
  return matches.map((m) => serializeMatch(m)!);
}

export async function fetchCompetitions(): Promise<Competition[]> {
  const items = await prisma.competition.findMany({
    include: { school: true },
    orderBy: { name: "asc" }
  });

  return items.map((item) => ({
    id: item.slug,
    name: item.name,
    type: item.type as Competition["type"],
    schoolName: item.school?.name,
    description: item.description,
    format: item.format as Competition["format"],
    logo: item.logo ?? undefined
  }));
}

export async function fetchStandings(competitionSlug?: string): Promise<StandingRow[]> {
  const standings = await prisma.standing.findMany({
    where: competitionSlug ? { competition: { slug: competitionSlug } } : undefined,
    include: { competition: true, team: true },
    orderBy: [{ pts: "desc" }, { gd: "desc" }, { gf: "desc" }]
  });

  return standings.map((row) => ({
    competitionId: row.competition.slug,
    groupKey: row.groupKey || undefined,
    team: row.team.name,
    played: row.played,
    win: row.win,
    draw: row.draw,
    loss: row.loss,
    gf: row.gf,
    ga: row.ga,
    gd: row.gd,
    pts: row.pts
  }));
}

export async function fetchAllKnockoutBrackets() {
  const tournaments = await prisma.competition.findMany({
    where: { format: "TOURNAMENT" },
    select: { slug: true }
  });

  const result: Record<string, Awaited<ReturnType<typeof fetchKnockoutBracket>>> = {};
  for (const comp of tournaments) {
    const bracket = await fetchKnockoutBracket(comp.slug);
    if (bracket.length) result[comp.slug] = bracket;
  }
  return result;
}

export async function fetchCompetitionGroups() {
  const groups = await prisma.competitionGroup.findMany({
    include: { teamEntries: { include: { team: true } }, competition: true },
    orderBy: { name: "asc" }
  });

  const result: Record<string, { id: string; name: string; teams: string[] }[]> = {};
  for (const group of groups) {
    const key = group.competition.slug;
    if (!result[key]) result[key] = [];
    result[key].push({
      id: group.id,
      name: group.name,
      teams: group.teamEntries.map((entry) => entry.team.name)
    });
  }
  return result;
}

export async function fetchCompetitionStats(): Promise<Record<string, CompetitionStats>> {
  const competitions = await prisma.competition.findMany({
    include: {
      teamEntries: true,
      matches: {
        where: { status: "FT" },
        include: { homeTeam: true, awayTeam: true, events: true }
      },
      standings: { include: { team: true } }
    }
  });

  const result: Record<string, CompetitionStats> = {};

  for (const comp of competitions) {
    const finishedMatches = comp.matches;
    const totalGoals = finishedMatches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0);

    let highestScoringMatch: CompetitionStats["highestScoringMatch"] = null;
    for (const match of finishedMatches) {
      const total = match.homeScore + match.awayScore;
      if (!highestScoringMatch || total > highestScoringMatch.totalGoals) {
        highestScoringMatch = {
          home: match.homeTeam.name,
          away: match.awayTeam.name,
          totalGoals: total
        };
      }
    }

    const scorerTally = new Map<string, { name: string; team: string; goals: number }>();
    for (const match of finishedMatches) {
      for (const event of match.events) {
        if (!/goal/i.test(event.type) || /own/i.test(event.type)) continue;
        const key = `${event.team}::${event.player}`;
        const current = scorerTally.get(key) ?? { name: event.player, team: event.team, goals: 0 };
        current.goals += 1;
        scorerTally.set(key, current);
      }
    }

    const topScorer =
      [...scorerTally.values()].sort((a, b) => b.goals - a.goals)[0] ?? null;

    const finalMatch = finishedMatches
      .filter((match) => match.stage === "KNOCKOUT" && match.round === "Final")
      .sort((a, b) => b.kickoff.getTime() - a.kickoff.getTime())[0];

    let reigningChampion: string | null = null;
    let leaderLabel: CompetitionStats["leaderLabel"] = "Current Leader";

    if (finalMatch) {
      leaderLabel = "Champion";
      if (finalMatch.homeScore > finalMatch.awayScore) reigningChampion = finalMatch.homeTeam.name;
      else if (finalMatch.awayScore > finalMatch.homeScore) reigningChampion = finalMatch.awayTeam.name;
    }

    if (!reigningChampion) {
      const tableRows = comp.standings
        .filter((row) => !row.groupKey)
        .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

      if (tableRows.length) {
        reigningChampion = tableRows[0]!.team.name;
      } else {
        const groupLeaders = new Map<string, typeof comp.standings>();
        for (const row of comp.standings) {
          if (!row.groupKey) continue;
          if (!groupLeaders.has(row.groupKey)) groupLeaders.set(row.groupKey, []);
          groupLeaders.get(row.groupKey)!.push(row);
        }

        const groupWinners = [...groupLeaders.values()]
          .map((rows) => rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)[0])
          .filter(Boolean);

        if (groupWinners.length === 1) {
          reigningChampion = groupWinners[0]!.team.name;
        } else if (groupWinners.length > 1) {
          const best = groupWinners.sort((a, b) => b!.pts - a!.pts || b!.gd - a!.gd || b!.gf - a!.gf)[0];
          reigningChampion = best?.team.name ?? null;
        }
      }
    }

    result[comp.slug] = {
      reigningChampion,
      leaderLabel,
      topScorer,
      highestScoringMatch,
      matchesPlayed: finishedMatches.length,
      totalGoals,
      teamCount: comp.teamEntries.length
    };
  }

  return result;
}

export async function fetchNews(): Promise<NewsItem[]> {
  const items = await prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" }
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    category: item.category,
    image: item.image ?? "",
    publishedAt: item.publishedAt.toISOString(),
    body: item.body ?? undefined
  }));
}

export async function fetchAnnouncements(): Promise<AnnouncementItem[]> {
  const items = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    level: item.level as AnnouncementItem["level"]
  }));
}

export async function fetchTeams(): Promise<TeamProfile[]> {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return teams.map((team) => ({
    name: team.name,
    colors: parseJsonArray(team.colors),
    tone: team.tone ?? "",
    form: parseJsonArray(team.form),
    logo: team.logo ?? undefined
  }));
}

export async function fetchAthletes(): Promise<AthleteProfile[]> {
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: [{ goals: "desc" }, { assists: "desc" }],
    take: 24
  });

  return players.map((player, index) => ({
    id: player.id,
    name: player.name,
    team: player.team.name,
    sport: "Football",
    role: player.position ?? player.role,
    statLine: `${player.goals} goals, ${player.assists} assists`,
    story: `Key contributor for ${player.team.name} in university football competitions.`,
    image: index % 2 === 0 ? "/images/athlete-lamin.svg" : "/images/athlete-maimuna.svg"
  }));
}

export async function fetchFootballEvents(): Promise<FootballEventItem[]> {
  const events = await prisma.footballEvent.findMany({ orderBy: { date: "asc" } });
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    type: event.type,
    venue: event.venue,
    date: event.date.toISOString(),
    description: event.description
  }));
}

export async function getAgentAssignedCompetitionIds(userId: string) {
  const rows = await prisma.competitionAgent.findMany({
    where: { userId },
    select: { competitionId: true }
  });
  return rows.map((row) => row.competitionId);
}

export async function agentCanAccessMatch(userId: string, matchId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      school: { include: { teams: true } },
      competitionAssignments: { select: { competitionId: true } }
    }
  });
  if (!user) return false;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return false;

  if (user.competitionAssignments.some((entry) => entry.competitionId === match.competitionId)) {
    return true;
  }

  if (!user.schoolId || !user.school) return false;

  const teamIds = user.school.teams.map((t) => t.id);
  return teamIds.includes(match.homeTeamId) || teamIds.includes(match.awayTeamId);
}

export { recomputeStandings, recomputeCompetitionStandings, fetchKnockoutBracket };
