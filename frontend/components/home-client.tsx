"use client";

import { useState, useMemo, useEffect } from "react";
import { LiveMatchCard, FixtureCard } from "@/components/cards";
import { InstallPrompt, NotificationToggle, OfflineStatus } from "@/components/ui";
import { liveMatches, fixtures, results, competitions, newsItems, type Competition, type Match } from "@/lib/data";
import { CompetitionSwitcher } from "@/components/competition-switcher";
import { DatePickerTimeline } from "@/components/date-picker-timeline";
import { MatchDetailsModal } from "@/components/match-details-modal";
import { NewsDetailsModal } from "@/components/news-details-modal";
import { isSameDay } from "date-fns";
import { cn, formatDate } from "@/lib/utils";
import { ChevronRight, Newspaper } from "lucide-react";

export default function HomeClient() {
  const [selectedComp, setSelectedComp] = useState<Competition>(competitions[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [newsIndex, setNewsIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll news
  useEffect(() => {
    if (newsItems.length <= 1) return;
    const timer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % Math.min(newsItems.length, 3));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredFixtures = useMemo(() => 
    fixtures.filter(m => m.competitionId === selectedComp.id && isSameDay(new Date(m.kickoff), selectedDate)),
    [selectedComp, selectedDate]
  );

  const filteredResults = useMemo(() => 
    results.filter(m => m.competitionId === selectedComp.id && isSameDay(new Date(m.kickoff), selectedDate)),
    [selectedComp, selectedDate]
  );

  return (
    <div className="page-shell section-space space-y-6">
      {/* Latest News Auto-scroller */}
      <section 
        className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl cursor-pointer"
        onClick={() => setSelectedNews(newsItems[newsIndex])}
      >
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${newsIndex * 100}%)` }}
        >
          {newsItems.slice(0, 3).map((item) => (
            <div key={item.id} className="min-w-full relative p-6 h-56 flex flex-col justify-end text-white selection:bg-primary selection:text-slate-950">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt="" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  <Newspaper size={10} /> {item.category}
                </span>
                <h2 className="text-lg font-black leading-tight line-clamp-2">{item.title}</h2>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/50">
                    {isMounted ? formatDate(item.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
                  </span>
                  <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    Read More <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Indicators */}
        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                newsIndex === i ? "w-4 bg-primary" : "w-1 bg-white/20"
              )} 
            />
          ))}
        </div>
      </section>

      <div className="z-20 sticky top-[72px] bg-background/95 backdrop-blur py-2 space-y-4">
        <CompetitionSwitcher onSelect={setSelectedComp} />
        <DatePickerTimeline selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="space-y-8">
        {/* Upcoming Fixtures */}
        <section className="space-y-3">
          <h2 className="px-1 text-xs font-black uppercase tracking-widest text-slate-950 flex items-center justify-between">
            <span>Upcoming Fixtures</span>
            <span className="text-[10px] text-text-secondary opacity-60 normal-case font-bold">{filteredFixtures.length} matches</span>
          </h2>
          {filteredFixtures.length > 0 ? (
            <div className="grid gap-2">
              {filteredFixtures.map((match) => (
                <FixtureCard 
                  key={match.id} 
                  match={match} 
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-white/40">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">No fixtures for this date</p>
            </div>
          )}
        </section>

        {/* Latest Results */}
        <section className="space-y-3 pb-20">
          <h2 className="px-1 text-xs font-black uppercase tracking-widest text-slate-950">Latest Results</h2>
          {filteredResults.length > 0 ? (
            <div className="grid gap-2">
              {filteredResults.map((match) => (
                <FixtureCard 
                  key={match.id} 
                  match={match} 
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-40 italic">Check historical archives</p>
            </div>
          )}
        </section>
      </div>

      {selectedMatch && (
        <MatchDetailsModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}

      {selectedNews && (
        <NewsDetailsModal 
          item={selectedNews} 
          onClose={() => setSelectedNews(null)} 
        />
      )}
    </div>
  );
}
