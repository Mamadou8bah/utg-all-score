import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { recomputeCompetitionStandings } from "../lib/services/competition-engine";

loadEnvConfig(process.cwd());

function runtimeDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is required to import the tournament.");
  const url = new URL(value);
  if (url.hostname.endsWith(".neon.tech")) {
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "30");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "20");
  }
  return url.toString();
}

const prisma = new PrismaClient({ datasources: { db: { url: runtimeDatabaseUrl() } } });

const competitionName = "University of The Gambia Students' Union Vice Chancellor's Football Tournament 2026/27";
const competitionSlug = "utgsu-vice-chancellors-football-tournament-2026-27";
const competitionDescription = [
  "Official UTG Students' Union Vice Chancellor's Football Tournament for the 2026/27 season.",
  "Group-stage fixtures are published; knockout dates, venues, and times are to be confirmed.",
  "Quarter-finals: Winner A vs Runner Up B; Winner B vs Runner Up C; Winner C vs Third Position A; Runner Up A vs Third Position B.",
  "Semi-finals: Winner 29 vs Winner 31; Winner 30 vs Winner 32.",
  "Final: Winner 33 vs Winner 34."
].join(" ");

const groups = {
  "Group A": ["ALUMNI", "EDUSA", "ITCA", "NSA", "SSA"],
  "Group B": ["ADMIN", "AESSA", "JSA", "SEASA", "SOSHSA"],
  "Group C": ["ECOMANSA", "LSA", "SAPEH", "UNIGAMSA"]
} as const;

const fixtures = [
  ["Group A", "ITCA", "EDUSA", "2026-10-03T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "SEASA", "ADMIN", "2026-10-03T16:00:00+00:00", "St. Peter's"],
  ["Group C", "SAPEH", "ECOMANSA", "2026-10-03T16:00:00+00:00", "Abuko"],
  ["Group A", "SSA", "NSA", "2026-10-04T15:00:00+00:00", "Yundum Barracks"],
  ["Group B", "SOSHSA", "AESSA", "2026-10-04T16:00:00+00:00", "St. Peter's"],
  ["Group C", "LSA", "UNIGAMSA", "2026-10-04T17:00:00+00:00", "Yundum Barracks"],
  ["Group A", "SSA", "ITCA", "2026-10-10T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "ADMIN", "JSA", "2026-10-10T16:00:00+00:00", "St. Peter's"],
  ["Group C", "ECOMANSA", "LSA", "2026-10-10T16:00:00+00:00", "Abuko"],
  ["Group A", "EDUSA", "ALUMNI", "2026-10-11T15:00:00+00:00", "Yundum Barracks"],
  ["Group B", "SOSHSA", "SEASA", "2026-10-11T16:00:00+00:00", "St. Peter's"],
  ["Group C", "UNIGAMSA", "SAPEH", "2026-10-11T17:00:00+00:00", "Yundum Barracks"],
  ["Group A", "ALUMNI", "SSA", "2026-10-17T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "JSA", "SOSHSA", "2026-10-17T16:00:00+00:00", "St. Peter's"],
  ["Group C", "SAPEH", "LSA", "2026-10-17T16:00:00+00:00", "Abuko"],
  ["Group B", "SEASA", "AESSA", "2026-10-18T15:00:00+00:00", "Yundum Barracks"],
  ["Group A", "ITCA", "NSA", "2026-10-18T16:00:00+00:00", "St. Peter's"],
  ["Group C", "ECOMANSA", "UNIGAMSA", "2026-10-18T17:00:00+00:00", "Yundum Barracks"],
  ["Group A", "NSA", "ALUMNI", "2026-10-24T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "AESSA", "JSA", "2026-10-24T16:00:00+00:00", "St. Peter's"],
  ["Group A", "SSA", "EDUSA", "2026-10-25T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "SOSHSA", "ADMIN", "2026-10-25T16:00:00+00:00", "St. Peter's"],
  ["Group A", "EDUSA", "NSA", "2026-10-31T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "ADMIN", "AESSA", "2026-10-31T16:00:00+00:00", "St. Peter's"],
  ["Group A", "ALUMNI", "ITCA", "2026-11-01T16:00:00+00:00", "Yundum Barracks"],
  ["Group B", "JSA", "SEASA", "2026-11-01T16:00:00+00:00", "St. Peter's"]
] as const;

async function main() {
  const competition = await prisma.competition.upsert({
    where: { slug: competitionSlug },
    update: {
      name: competitionName,
      type: "GENERAL",
      format: "TOURNAMENT",
      description: competitionDescription
    },
    create: {
      slug: competitionSlug,
      name: competitionName,
      type: "GENERAL",
      format: "TOURNAMENT",
      description: competitionDescription
    }
  });

  const teamIds = new Map<string, string>();
  const allTeamNames = [...new Set(Object.values(groups).flat())];
  for (const name of allTeamNames) {
    const team = await prisma.team.upsert({
      where: { name },
      update: {},
      create: {
        name,
        colors: JSON.stringify(["#0055A4", "#FFC72C"]),
        form: JSON.stringify([]),
        tone: `${name} competing in the UTG Students' Union Vice Chancellor's Football Tournament.`
      }
    });
    teamIds.set(name, team.id);
    await prisma.competitionTeam.upsert({
      where: { competitionId_teamId: { competitionId: competition.id, teamId: team.id } },
      update: {},
      create: { competitionId: competition.id, teamId: team.id }
    });
  }

  const groupIds = new Map<string, string>();
  for (const [name, teamNames] of Object.entries(groups)) {
    const group = await prisma.competitionGroup.findFirst({
      where: { competitionId: competition.id, name }
    });
    const savedGroup = group ?? await prisma.competitionGroup.create({
      data: { competitionId: competition.id, name }
    });
    groupIds.set(name, savedGroup.id);
    for (const teamName of teamNames) {
      await prisma.competitionGroupTeam.upsert({
        where: { groupId_teamId: { groupId: savedGroup.id, teamId: teamIds.get(teamName)! } },
        update: {},
        create: { groupId: savedGroup.id, teamId: teamIds.get(teamName)! }
      });
    }
  }

  for (const [groupName, homeName, awayName, kickoffValue, venue] of fixtures) {
    const homeTeamId = teamIds.get(homeName)!;
    const awayTeamId = teamIds.get(awayName)!;
    const kickoff = new Date(kickoffValue);
    const existing = await prisma.match.findFirst({
      where: { competitionId: competition.id, homeTeamId, awayTeamId, kickoff }
    });
    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: { venue, stage: "GROUP", round: groupName, groupId: groupIds.get(groupName) }
      });
    } else {
      await prisma.match.create({
        data: {
          competitionId: competition.id,
          homeTeamId,
          awayTeamId,
          venue,
          kickoff,
          status: "UPCOMING",
          stage: "GROUP",
          round: groupName,
          groupId: groupIds.get(groupName),
          homeScore: 0,
          awayScore: 0
        }
      });
    }
  }
  await recomputeCompetitionStandings(competition.id);

  console.log(JSON.stringify({
    competitionId: competition.id,
    competition: competition.name,
    teams: allTeamNames.length,
    groups: Object.keys(groups).length,
    fixtures: fixtures.length,
    note: "Knockout pairings were recorded in the competition description; matches will be created when TBA dates, venues, and qualified teams are confirmed."
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
