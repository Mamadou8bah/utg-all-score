"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Search, Shield, Trophy, UserRound, X } from "lucide-react";
import Link from "next/link";
import { emptySearchResults, type SearchResults } from "@/lib/search-types";
import { TeamDetailsModal } from "@/components/team-details-modal";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { CompetitionDetailsModal } from "@/components/competition-details-modal";
import { NewsDetailsModal } from "@/components/news-details-modal";
import type { Competition, Match, NewsItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Category = "all" | keyof SearchResults;
const categories: Array<{ id: Category; label: string }> = [{ id: "all", label: "All" }, { id: "teams", label: "Teams" }, { id: "players", label: "Players" }, { id: "competitions", label: "Leagues" }, { id: "matches", label: "Matches" }, { id: "news", label: "News" }];

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [results, setResults] = useState<SearchResults>(emptySearchResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selection, setSelection] = useState<{ team?: string; match?: Match; competition?: Competition; news?: NewsItem }>({});
  const term = query.trim();

  useEffect(() => {
    setResults(emptySearchResults);
    setError("");
    if (term.length < 2) { setLoading(false); return; }
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Unable to search. Check your connection and try again.");
        const json = await response.json();
        if (!json.data || !Array.isArray(json.data.teams)) throw new Error("Search returned an unexpected response.");
        if (active) setResults(json.data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to search.");
      } finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [term, retry]);

  const total = Object.entries(results).filter(([key]) => category === "all" || key === category).reduce((sum, [, items]) => sum + items.length, 0);
  const visible = (key: Category) => category === "all" || category === key;
  const close = () => setSelection({});

  return <div className="search-page page-shell">
    <div className="search-header">
      <div className="flex items-center gap-3"><Link href="/" aria-label="Back to matches" className="search-back"><ArrowLeft size={21} /></Link><h1>Search AllScore</h1></div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="search-input-wrap">
        <Search size={20} aria-hidden="true" />
        <input aria-label="Search teams, players, leagues, matches and news" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Teams, players, leagues…" maxLength={80} autoComplete="off" />
        {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={18} /></button>}
      </form>
    </div>
    <div className="search-filters no-scrollbar" role="group" aria-label="Search categories">
      {categories.map((item) => <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
    </div>
    <div className="search-results" aria-busy={loading}>
      <p role="status" aria-live="polite" className="search-status">{term.length < 2 ? "Search by team, player, competition, venue or news title. Enter at least 2 characters." : loading ? "Searching AllScore…" : error ? "" : total === 0 ? `No results for “${term}”. Try another name or category.` : `${total} result${total === 1 ? "" : "s"} · Up to 10 per category`}</p>
      {error && <div role="alert" className="search-error"><p>{error}</p><button onClick={() => setRetry((value) => value + 1)}>Try again</button></div>}
      {!loading && !error && <>
        {visible("teams") && results.teams.length > 0 && <section><h2>Teams</h2>{results.teams.map((team) => <button key={team.id} className="search-result" onClick={() => setSelection({ team: team.name })}><span className="search-result-icon">{team.logo ? <img src={team.logo} alt="" /> : <Shield size={20} />}</span><span><strong>{team.name}</strong><small>{team.school || "University football"}</small></span><ChevronRight size={18} /></button>)}</section>}
        {visible("players") && results.players.length > 0 && <section><h2>Players</h2>{results.players.map((player) => <button key={player.id} className="search-result" onClick={() => setSelection({ team: player.team })}><span className="search-result-icon"><UserRound size={20} /></span><span><strong>{player.name}</strong><small>#{player.number} · {player.team} · View squad</small></span><ChevronRight size={18} /></button>)}</section>}
        {visible("competitions") && results.competitions.length > 0 && <section><h2>Leagues & competitions</h2>{results.competitions.map((item) => <button key={item.id} className="search-result" onClick={() => setSelection({ competition: item })}><span className="search-result-icon"><Trophy size={20} /></span><span><strong>{item.name}</strong><small>{item.schoolName || (item.format === "LEAGUE" ? "League" : "Tournament")}</small></span><ChevronRight size={18} /></button>)}</section>}
        {visible("matches") && results.matches.length > 0 && <section><h2>Matches</h2>{results.matches.map((match) => <button key={match.id} className="search-result" onClick={() => setSelection({ match })}><span><strong>{match.home} vs {match.away}</strong><small>{match.competition} · {formatDate(match.kickoff)} · {match.status}</small></span><span className="search-score">{match.status === "UPCOMING" ? "VS" : `${match.homeScore} – ${match.awayScore}`}</span></button>)}</section>}
        {visible("news") && results.news.length > 0 && <section><h2>News</h2>{results.news.map((item) => <button key={item.id} className="search-result" onClick={() => setSelection({ news: item })}><span><strong>{item.title}</strong><small>{item.category} · {formatDate(item.publishedAt)}</small></span><ChevronRight size={18} /></button>)}</section>}
      </>}
    </div>
    {selection.team && <TeamDetailsModal teamName={selection.team} onClose={close} />}
    {selection.match && <MatchDetailsModal match={selection.match} onClose={close} />}
    {selection.competition && <CompetitionDetailsModal competition={selection.competition} onClose={close} />}
    {selection.news && <NewsDetailsModal item={selection.news} onClose={close} />}
  </div>;
}
