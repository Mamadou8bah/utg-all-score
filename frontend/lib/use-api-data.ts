"use client";

import { useCallback, useEffect, useState } from "react";
import type { AthleteProfile, Competition, CompetitionStats, KnockoutRound, Match, StandingRow, TeamProfile } from "@/lib/types";

export function useApiData<T>(endpoint: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    let pending = false;
    let controller: AbortController | undefined;
    setLoading(true);
    async function load() {
      if (pending) return;
      pending = true;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 30000);
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Request failed");
        const json = await response.json();
        if (json.data === undefined) throw new Error("Unexpected response");
        if (active) { setData(json.data); setError(null); }
      } catch {
        if (active) setError("Unable to load updates. Check your connection and try again.");
      } finally {
        window.clearTimeout(timeout);
        pending = false;
        if (active) setLoading(false);
      }
    }
    void load();
    // Refresh score feeds while the app is visible, and reconnect after going offline.
    const pollScores = /^\/api\/(live|fixtures|results)(\?|$)/.test(endpoint);
    const timer = pollScores ? window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 30000) : undefined;
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("online", refresh);
    if (pollScores) document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [endpoint, revision]);

  return { data, loading, error, reload };
}

type CompetitionsBundleOptions = { includeExtras?: boolean };
type CompetitionsBundle = {
  competitions: Competition[];
  groups: Record<string, { id: string; name: string; teams: string[] }[]>;
  brackets: Record<string, KnockoutRound[]>;
  stats: Record<string, CompetitionStats>;
};

export function useCompetitionsBundle(
  fallbackCompetitions: Competition[] = [],
  fallbackGroups: CompetitionsBundle["groups"] = {},
  fallbackBrackets: CompetitionsBundle["brackets"] = {},
  fallbackStats: CompetitionsBundle["stats"] = {},
  options: CompetitionsBundleOptions = {}
) {
  const endpoint = options.includeExtras ? "/api/competitions?include=groups,brackets,stats" : "/api/competitions";
  const { data, ...state } = useApiData<Partial<CompetitionsBundle>>(endpoint, {});
  return {
    competitions: data.competitions ?? fallbackCompetitions,
    groups: data.groups ?? fallbackGroups,
    brackets: data.brackets ?? fallbackBrackets,
    stats: data.stats ?? fallbackStats,
    ...state
  };
}

export function useFootballBundle() {
  const standings = useApiData<StandingRow[]>("/api/standings", []);
  const fixtures = useApiData<Match[]>("/api/fixtures", []);
  const results = useApiData<Match[]>("/api/results", []);
  const teams = useApiData<TeamProfile[]>("/api/teams", []);
  const athletes = useApiData<AthleteProfile[]>("/api/athletes", []);
  const reload = useCallback(() => {
    standings.reload(); fixtures.reload(); results.reload(); teams.reload(); athletes.reload();
  }, [standings.reload, fixtures.reload, results.reload, teams.reload, athletes.reload]);
  return {
    standings: standings.data, fixtures: fixtures.data, results: results.data,
    teams: teams.data, athletes: athletes.data,
    loading: standings.loading || fixtures.loading || results.loading || teams.loading || athletes.loading,
    error: standings.error || fixtures.error || results.error || teams.error || athletes.error,
    reload
  };
}
