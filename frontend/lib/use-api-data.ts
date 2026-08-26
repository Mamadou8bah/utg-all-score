"use client";

import { useEffect, useState } from "react";
import type { AthleteProfile, Competition, CompetitionStats, KnockoutRound, Match, StandingRow, TeamProfile } from "@/lib/types";

export function useApiData<T>(endpoint: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        if (active && json.data !== undefined) setData(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  return { data, loading };
}

type CompetitionsBundleOptions = {
  /** Load groups/brackets/stats (heavy). Default is competitions list only. */
  includeExtras?: boolean;
};

export function useCompetitionsBundle(
  fallbackCompetitions: Competition[] = [],
  fallbackGroups: Record<string, { id: string; name: string; teams: string[] }[]> = {},
  fallbackBrackets: Record<string, KnockoutRound[]> = {},
  fallbackStats: Record<string, CompetitionStats> = {},
  options: CompetitionsBundleOptions = {}
) {
  const [competitions, setCompetitions] = useState<Competition[]>(fallbackCompetitions);
  const [groups, setGroups] = useState<Record<string, { id: string; name: string; teams: string[] }[]>>(fallbackGroups);
  const [brackets, setBrackets] = useState(fallbackBrackets);
  const [stats, setStats] = useState<Record<string, CompetitionStats>>(fallbackStats);
  const [loading, setLoading] = useState(true);
  const endpoint = options.includeExtras
    ? "/api/competitions?include=groups,brackets,stats"
    : "/api/competitions";

  useEffect(() => {
    let active = true;
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.data?.competitions) setCompetitions(json.data.competitions);
        if (json.data?.groups) setGroups(json.data.groups);
        if (json.data?.brackets) setBrackets(json.data.brackets);
        if (json.data?.stats) setStats(json.data.stats);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  return { competitions, groups, brackets, stats, loading };
}

export function useFootballBundle() {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [results, setResults] = useState<Match[]>([]);
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/standings").then((r) => r.json()),
      fetch("/api/fixtures").then((r) => r.json()),
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/athletes").then((r) => r.json())
    ])
      .then(([standingsRes, fixturesRes, resultsRes, teamsRes, athletesRes]) => {
        if (!active) return;
        if (standingsRes.data) setStandings(standingsRes.data);
        if (fixturesRes.data) setFixtures(fixturesRes.data);
        if (resultsRes.data) setResults(resultsRes.data);
        if (teamsRes.data) setTeams(teamsRes.data);
        if (athletesRes.data) setAthletes(athletesRes.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { standings, fixtures, results, teams, athletes, loading };
}
