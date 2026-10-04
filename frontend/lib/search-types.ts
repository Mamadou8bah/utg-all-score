import type { Competition, Match, NewsItem } from "@/lib/types";

export type SearchResults = {
  teams: Array<{ id: string; name: string; logo: string | null; school: string | null }>;
  players: Array<{ id: string; name: string; number: number; team: string }>;
  competitions: Competition[];
  matches: Match[];
  news: NewsItem[];
};

export const emptySearchResults: SearchResults = { teams: [], players: [], competitions: [], matches: [], news: [] };
