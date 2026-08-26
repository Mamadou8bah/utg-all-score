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
  competition: true,
  homeTeam: true,
  awayTeam: true,
  events: { orderBy: { minute: "asc" as const } },
  lineups: true
};

/** Lightweight list payload — no squad players. */
export const matchIncludeList = matchInclude;

/** Portal match payloads that need squad dropdowns for agents. */
export const matchIncludeWithSquads = {
  competition: true,
  homeTeam: { include: { players: { orderBy: { number: "asc" as const } } } },
  awayTeam: { include: { players: { orderBy: { number: "asc" as const } } } },
  events: { orderBy: { minute: "asc" as const } },
  lineups: true,
  agents: { include: { user: true } }
};

/** Agent/admin match list without loading every team's full squad. */
export const matchIncludePortalList = {
  competition: true,
  homeTeam: true,
  awayTeam: true,
  events: { orderBy: { minute: "asc" as const } },
  lineups: true,
  agents: { include: { user: true } }
};

type TeamWithPlayers = {
  id: string;
  name: string;
  players?: Array<{ id: string; number: number; name: string; role: string; position?: string | null }>;
};

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

type SerializableMatch = NonNullable<Awaited<ReturnType<typeof fetchMatchById>>> & {
  agents?: Array<{ user: { id: string; name: string; email: string } }>;
  homeTeam: TeamWithPlayers;
  awayTeam: TeamWithPlayers;
  events?: Array<{ minute: number; type: string; player: string; team: string; detail: string }>;
  lineups?: Array<{ teamId: string; number: number; name: string; role: string; isSub: boolean }>;
};

function mapSquadPlayers(team: TeamWithPlayers) {
  return (team.players ?? []).map((player) => ({
    id: player.id,
    number: player.number,
    name: player.name,
    role: player.role,
    position: player.position ?? undefined
  }));
}

export function serializeMatch(match: SerializableMatch | null): Match | null {
  if (!match) return null;

  const events: MatchEvent[] = (match.events ?? []).map((event) => ({
    minute: event.minute,
    type: event.type,
    player: event.player,
    team: event.team,
    detail: event.detail
  }));

  const lineupRows = match.lineups ?? [];
  const homeLineups: typeof lineupRows = [];
  const awayLineups: typeof lineupRows = [];
  for (const row of lineupRows) {
    if (row.teamId === match.homeTeamId) homeLineups.push(row);
    else if (row.teamId === match.awayTeamId) awayLineups.push(row);
  }

  const mapLineupSide = (rows: typeof lineupRows) => ({
    starting: rows.filter((l) => !l.isSub).map(({ number, name, role }) => ({ number, name, role })),
    subs: rows.filter((l) => l.isSub).map(({ number, name, role }) => ({ number, name, role }))
  });

  const lineups =
    homeLineups.length || awayLineups.length
      ? {
          home: mapLineupSide(homeLineups),
          away: mapLineupSide(awayLineups)
        }
      : undefined;

  const agents = match.agents?.map((entry) => ({
    id: entry.user.id,
    name: entry.user.name,
    email: entry.user.email
  }));

  const homeSquad = mapSquadPlayers(match.homeTeam);
  const awaySquad = mapSquadPlayers(match.awayTeam);
  const squads =
    homeSquad.length || awaySquad.length
      ? { home: homeSquad, away: awaySquad }
      : undefined;

  return {
    id: match.id,
    competitionId: match.competition.slug,
    competition: match.competition.name,
    home: match.homeTeam.name,
    away: match.awayTeam.name,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
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
    agents,
    lineups,
    squads
  };
}

export async function fetchMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: matchInclude
  });
}

export async function fetchMatchesByStatus(
  status: "LIVE" | "HT" | "FT" | "UPCOMING" | ("LIVE" | "HT")[],
  options?: { take?: number; competitionSlug?: string }
) {
  const statuses = Array.isArray(status) ? status : [status];
  const upcomingOnly = statuses.includes("UPCOMING") && statuses.length === 1;
  const matches = await prisma.match.findMany({
    where: {
      status: { in: statuses },
      ...(options?.competitionSlug ? { competition: { slug: options.competitionSlug } } : {})
    },
    include: matchIncludeList,
    orderBy: { kickoff: upcomingOnly ? "asc" : "desc" },
    take: options?.take ?? (upcomingOnly ? 60 : 80)
  });
  return matches.map((m) => serializeMatch(m)!);
}

export async function fetchAllMatches(take = 100) {
  const matches = await prisma.match.findMany({
    include: matchIncludeList,
    orderBy: { kickoff: "desc" },
    take
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

  const brackets = await Promise.all(
    tournaments.map(async (comp) => [comp.slug, await fetchKnockoutBracket(comp.slug)] as const)
  );

  const result: Record<string, Awaited<ReturnType<typeof fetchKnockoutBracket>>> = {};
  for (const [slug, bracket] of brackets) {
    if (bracket.length) result[slug] = bracket;
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
      _count: { select: { teamEntries: true } },
      teamEntries: { select: { teamId: true } },
      matches: {
        where: { status: "FT" },
        select: {
          homeScore: true,
          awayScore: true,
          stage: true,
          round: true,
          kickoff: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } }
        }
      },
      standings: {
        include: { team: { select: { name: true } } }
      }
    }
  });

  const teamIds = [...new Set(competitions.flatMap((comp) => comp.teamEntries.map((entry) => entry.teamId)))];
  const scorers =
    teamIds.length === 0
      ? []
      : await prisma.player.findMany({
          where: { teamId: { in: teamIds }, goals: { gt: 0 } },
          select: {
            name: true,
            goals: true,
            teamId: true,
            team: { select: { name: true } }
          },
          orderBy: { goals: "desc" }
        });

  const result: Record<string, CompetitionStats> = {};

  for (const comp of competitions) {
    const finishedMatches = comp.matches;
    const totalGoals = finishedMatches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0);
    const competitionTeamIds = new Set(comp.teamEntries.map((entry) => entry.teamId));

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

    const topScorerPlayer = scorers.find((player) => competitionTeamIds.has(player.teamId));
    const topScorer = topScorerPlayer
      ? { name: topScorerPlayer.name, team: topScorerPlayer.team.name, goals: topScorerPlayer.goals }
      : null;

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
      teamCount: comp._count.teamEntries
    };
  }

  return result;
}

export async function fetchNews(): Promise<NewsItem[]> {
  const items = await prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 30
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
    orderBy: { createdAt: "desc" },
    take: 30
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
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [
        { agents: { some: { userId } } },
        { competition: { agents: { some: { userId } } } }
      ]
    },
    select: { id: true }
  });
  return Boolean(match);
}

export { recomputeStandings, recomputeCompetitionStandings, fetchKnockoutBracket };
