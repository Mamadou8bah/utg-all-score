"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { FixtureCard } from "@/components/cards";
import { type Competition, type Match } from "@/lib/types";
import { useApiData } from "@/lib/use-api-data";
import { CompetitionSwitcher } from "@/components/competition-switcher";
import { DatePickerTimeline } from "@/components/date-picker-timeline";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { NewsDetailsModal } from "@/components/news-details-modal";
import { isSameDay } from "date-fns";
import { cn, formatDate } from "@/lib/utils";
import { ChevronRight, Newspaper, Sparkles } from "lucide-react";

export default function HomeClient() {
  const { data: fixtures } = useApiData<Match[]>("/api/fixtures", []);
  const { data: results } = useApiData<Match[]>("/api/results", []);
  const { data: newsItems } = useApiData<any[]>("/api/news", []);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [newsIndex, setNewsIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const featuredNews = newsItems.slice(0, 3);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (featuredNews.length <= 1) return;
    const timer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % featuredNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredNews.length]);

  const filteredFixtures = useMemo(
    () =>
      selectedComp
        ? fixtures.filter(
            (m) => m.competitionId === selectedComp.id && isSameDay(new Date(m.kickoff), selectedDate)
          )
        : [],
    [selectedComp, selectedDate, fixtures]
  );

  const filteredResults = useMemo(
    () =>
      selectedComp
        ? results.filter(
            (m) => m.competitionId === selectedComp.id && isSameDay(new Date(m.kickoff), selectedDate)
          )
        : [],
    [selectedComp, selectedDate, results]
  );

  return (
    <div className="page-shell section-space space-y-6">
      {featuredNews.length > 0 ? (
        <section
          className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl cursor-pointer"
          onClick={() => setSelectedNews(featuredNews[newsIndex])}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${newsIndex * 100}%)` }}
          >
            {featuredNews.map((item) => (
              <div
                key={item.id}
                className="min-w-full relative p-6 h-56 flex flex-col justify-end text-white selection:bg-primary selection:text-slate-950"
              >
                {item.image ? (
                  <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-slate-900" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-slate-950" />
                <div className="relative z-10 space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-primary text-[10px] font-black uppercase tracking-widest border border-blue-200">
                    <Newspaper size={10} /> {item.category}
                  </span>
                  <h2 className="text-lg font-black leading-tight line-clamp-2">{item.title}</h2>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isMounted
                        ? formatDate(item.publishedAt, { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                      Read More <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {featuredNews.length > 1 ? (
            <div className="absolute bottom-4 right-6 flex gap-1.5">
              {featuredNews.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    newsIndex === i ? "w-4 bg-primary" : "w-1 bg-slate-700"
                  )}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[2rem] border border-dashed border-slate-700 bg-slate-950 p-6 shadow-xl">
          <div className="flex h-44 flex-col justify-between text-white">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Newsroom
            </span>
            <div className="space-y-2">
              <h2 className="text-xl font-black leading-tight sm:text-2xl">More news coming soon</h2>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Match reports, campus sports stories, and official announcements will appear here as they are published.
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex w-fit items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Visit newsroom <ChevronRight size={12} />
            </Link>
          </div>
        </section>
      )}

      <div className="z-20 sticky top-0 md:top-[72px] bg-background py-2 space-y-4">
        <CompetitionSwitcher onSelect={setSelectedComp} />
        <DatePickerTimeline selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="px-1 text-xs font-black uppercase tracking-widest text-slate-950 flex items-center justify-between">
            <span>Upcoming Fixtures</span>
            <span className="text-[10px] text-slate-500 normal-case font-bold">
              {filteredFixtures.length} matches
            </span>
          </h2>
          {filteredFixtures.length > 0 ? (
            <div className="grid gap-2">
              {filteredFixtures.map((match) => (
                <FixtureCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                No fixtures for this date
              </p>
            </div>
          )}
        </section>

        <section className="space-y-3 pb-20">
          <h2 className="px-1 text-xs font-black uppercase tracking-widest text-slate-950">Latest Results</h2>
          {filteredResults.length > 0 ? (
            <div className="grid gap-2">
              {filteredResults.map((match) => (
                <FixtureCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                Check historical archives
              </p>
            </div>
          )}
        </section>
      </div>

      {selectedMatch ? (
        <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      ) : null}

      {selectedNews ? <NewsDetailsModal item={selectedNews} onClose={() => setSelectedNews(null)} /> : null}
    </div>
  );
}
