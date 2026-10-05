"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { type Match, type StandingRow, type Competition, type AthleteProfile } from "@/lib/types";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { Badge, Button, MetaLine } from "@/components/ui";
import { ChevronRight, Trophy, Info, CalendarDays, Zap, Newspaper, LayoutGrid } from "lucide-react";

export const Hero = () => {
  const { t: translate } = useLanguage();
  return (
  <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-5 py-7 text-white shadow-float sm:rounded-[36px] sm:px-8 sm:py-8 lg:px-10">
    <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div>
        <Badge variant="live">{translate("Official Campus Sports")}</Badge>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{translate("Your Official University Sports Hub.")}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">{translate("UTG AllScore brings live match control, results, official updates, and athlete storytelling into one fast sports app.")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/live" className="flex-1 sm:flex-none"><Button className="w-full sm:w-auto">{translate("Live Scores")}</Button></Link>
          <Link href="/fixtures" className="flex-1 sm:flex-none"><Button variant="ghost" className="w-full bg-slate-800 text-white ring-1 ring-slate-600 hover:bg-slate-700 sm:w-auto">{translate("Fixtures")}</Button></Link>
        </div>
      </div>
      <div className="grid gap-3">
        <div className="rounded-[28px] border border-slate-700 bg-slate-800 p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{translate("Live right now")}</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{translate("ICT vs Business")}</p>
              <p className="mt-1 text-xs text-slate-300">{translate("VC Tournament")}</p>
            </div>
            <Badge variant="live" className="h-6 px-2">72'</Badge>
          </div>
          <div className="mt-3 flex items-center gap-4 text-3xl font-bold"><span>2</span><span className="text-slate-500">:</span><span>1</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Installable", "Fast PWA"],
            ["Offline", "Cached scores"]
          ].map(([title, value]) => (
            <div key={title} className="rounded-[24px] border border-slate-700 bg-slate-900 p-3">
              <p className="text-[10px] text-slate-400">{translate(title)}</p>
              <p className="mt-1 text-sm font-semibold">{translate(value)}</p>
            </div>
          ))}
          <div className="hidden rounded-[24px] border border-slate-700 bg-slate-900 p-3 sm:block">
            <p className="text-[10px] text-slate-400">{translate("Alerts")}</p>
            <p className="mt-1 text-sm font-semibold">{translate("Live Push")}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
};

const TeamMark = ({ teamName, className }: { teamName: string; className: string }) => {
  return (
  <div className={cn("bg-slate-50 flex items-center justify-center text-slate-400", className)}>
    <span className="font-black">{teamName[0]}</span>
  </div>
);
};

export const MatchRow = ({ match, onClick }: { match: Match; onClick?: () => void }) => {
  const { t: translate, locale } = useLanguage();
  const live = match.status === "LIVE" || match.status === "HT";
  const scored = match.status !== "UPCOMING";
  return (
    <button type="button" onClick={onClick} className="match-row"
      aria-label={`${match.home} ${locale === "fr-FR" ? "contre" : "versus"} ${match.away}, ${scored ? `${match.homeScore} ${locale === "fr-FR" ? "à" : "to"} ${match.awayScore}, ${translate(match.status)}` : formatTime(match.kickoff, locale)}`}>
      <span className="match-row__side match-row__side--home">
        <span className="match-row__name">{match.home}</span>
        <TeamMark teamName={match.home} className="crest crest--home" />
      </span>
      <span className="match-row__centre">
        <span className={scored ? "match-row__score" : "match-row__kickoff"}>
          {translate(scored ? `${match.homeScore} – ${match.awayScore}` : formatTime(match.kickoff, locale))}
        </span>
        <span className={cn("match-row__status", live && "match-row__status--live")}>
          {translate(live ? (match.status === "HT" ? "HT" : `LIVE ${match.timer || ""}`) : scored ? "FT" : "Scheduled")}
        </span>
      </span>
      <span className="match-row__side match-row__side--away">
        <TeamMark teamName={match.away} className="crest crest--away" />
        <span className="match-row__name">{match.away}</span>
      </span>
    </button>
  );
};

export const LiveMatchCard = MatchRow;
export const FixtureCard = MatchRow;
export const ResultCard = MatchRow;

export const NewsCard = ({ item, onClick }: {
  item: { title: string; excerpt: string; category: string; image?: string; publishedAt: string };
  onClick?: () => void;
}) => {
  const { locale } = useLanguage();
  return (
  <button type="button" onClick={onClick} className="news-card text-left">
    <div className="news-card__image">
      {item.image ? <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <span className="news-card__category">{item.category}</span>
    </div>
    <div className="p-3">
      <h2 className="text-[15px] font-bold leading-snug">{item.title}</h2>
      <p className="mt-2 text-xs text-text-secondary">{formatDate(item.publishedAt, { month: "short", day: "numeric" }, locale)}</p>
    </div>
  </button>
);
};

export const AnnouncementCard = ({ item }: { item: { title: string; body: string; level: string } }) => {
  const { t: translate } = useLanguage();
  return (
  <div className="reference-panel">
    <Badge variant={item.level === "warning" ? "warning" : "default"}>{translate(item.level === "warning" ? "Urgent" : "Notice")}</Badge>
    <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
    <p className="mt-2 text-sm leading-6 text-text-secondary">{item.body}</p>
  </div>
);
};

export const AthleteHighlightCard = ({ athlete }: { athlete: AthleteProfile }) => {
  const { t: translate } = useLanguage();
  return (
  <article className="athlete-row">
    <div className="athlete-row__photo">
      <img src={athlete.image} alt={athlete.name} className="h-full w-full object-cover" />
    </div>
    <div>
      <Badge variant="success">{translate(athlete.sport)}</Badge>
      <h3 className="mt-4 text-2xl font-semibold text-slate-950">{athlete.name}</h3>
      <p className="mt-2 text-sm text-text-secondary">{athlete.team} · {translate(athlete.role)}</p>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{athlete.story}</p>
      <p className="mt-4 text-sm font-semibold text-primary">{translate(athlete.statLine)}</p>
    </div>
  </article>
);
};

export const EventCard = ({ event }: { event: { title: string; type: string; venue: string; date: string; description: string } }) => {
  const { locale } = useLanguage();
  return (
  <article className="reference-panel">
    <div className="flex items-center justify-between gap-3">
      <Badge variant="default">{event.type}</Badge>
      <p className="text-sm text-text-secondary">{formatDate(event.date, undefined, locale)}</p>
    </div>
    <h3 className="mt-4 text-xl font-semibold text-slate-950">{event.title}</h3>
    <p className="mt-2 text-sm text-text-secondary">{event.venue}</p>
    <p className="mt-4 text-sm leading-6 text-text-secondary">{event.description}</p>
  </article>
);
};

export const StandingsTable = ({ rows, onTeamClick }: { rows: StandingRow[], onTeamClick?: (teamName: string) => void }) => {
  const { t: translate } = useLanguage();
  return (
  <div className="reference-table">
    <div className="overflow-x-auto">
      <table className="min-w-full whitespace-nowrap text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-text-secondary">
          <tr>
            <th className="px-3 py-4 font-black sm:px-6 sm:py-5">{translate("# Team")}</th>
            <th className="px-2 py-4 text-center sm:px-3 sm:py-5">{translate("PL")}</th>
            <th className="hidden px-3 py-5 text-center sm:table-cell">{translate("W")}</th>
            <th className="hidden px-3 py-5 text-center sm:table-cell">{translate("D")}</th>
            <th className="hidden px-3 py-5 text-center sm:table-cell">{translate("L")}</th>
            <th className="px-2 py-4 text-center sm:px-3 sm:py-5">{translate("GD")}</th>
            <th className="px-3 py-4 text-center sm:px-6 sm:py-5">{translate("PTS")}</th>
          </tr>
        </thead>
        <tbody>
          {[...rows].sort((a,b) => b.pts - a.pts || b.gd - a.gd).map((row, index) => (
            <tr 
              key={row.team} 
              className="border-t border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <td className="max-w-[190px] px-3 py-3 font-black text-slate-950 sm:max-w-none sm:px-6 sm:py-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black",
                    index === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {index + 1}
                  </span>
                  <button 
                    onClick={() => onTeamClick?.(row.team)}
                    className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-primary sm:gap-3"
                  >
                    <TeamMark teamName={row.team} className="h-6 w-6 shrink-0 rounded-lg text-[10px] sm:h-7 sm:w-7" />
                    <span className="truncate">{row.team}</span>
                  </button>
                </div>
              </td>
              <td className="px-2 py-3 text-center font-bold text-slate-600 sm:px-3 sm:py-4">{row.played}</td>
              <td className="hidden px-3 py-4 text-center font-semibold text-slate-500 sm:table-cell">{row.win}</td>
              <td className="hidden px-3 py-4 text-center font-semibold text-slate-500 sm:table-cell">{row.draw}</td>
              <td className="hidden px-3 py-4 text-center font-semibold text-slate-500 sm:table-cell">{row.loss}</td>
              <td className={cn(
                "px-2 py-3 text-center font-bold sm:px-3 sm:py-4",
                row.gd > 0 ? "text-success" : row.gd < 0 ? "text-error" : "text-slate-400"
              )}>
                {translate(row.gd > 0 ? `+${row.gd}` : row.gd)}
              </td>
              <td className="px-3 py-3 text-center text-sm font-black text-primary sm:px-6 sm:py-4 sm:text-base">
                {row.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export const CompetitionCard = ({ 
  competition, 
  onClick 
}: { 
  competition: Competition, 
  onClick?: () => void 
}) => {
  const { t: translate } = useLanguage();
  return (
  <article 
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-card active:scale-[0.98]"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-50 transition-colors group-hover:bg-blue-50">
            {competition.logo ? (
              <img src={competition.logo} alt="" className="h-10 w-10 object-contain" />
            ) : (
              <LayoutGrid size={28} className="text-slate-300 group-hover:text-primary" />
            )}
          </div>
          <div>
            <Badge variant="default" className="mb-1 text-[9px] font-black tracking-[0.2em]">
              {translate(competition.type === "GENERAL" ? "University wide" : competition.schoolName)}
            </Badge>
            <h3 className="text-xl font-black text-slate-950 group-hover:text-primary transition-colors">
              {competition.name}
            </h3>
          </div>
        </div>
        <p className="text-sm font-medium leading-relaxed text-text-secondary line-clamp-2">
          {competition.description}
        </p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
        <ChevronRight size={20} />
      </div>
    </div>
    
    <div className="mt-6 flex items-center gap-3">
       <span className="flex items-center gap-1 text-[10px] font-black uppercase text-text-secondary tracking-widest">
         <Trophy size={12} /> {translate(competition.format)}
       </span>
       <div className="h-1 w-1 rounded-full bg-slate-200" />
       <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none pt-0.5">{translate("Live Season")}</span>
    </div>
  </article>
);
};

export const SkeletonBlock = ({ className }: { className?: string }) => {
  return <div className={`animate-pulse rounded-[28px] bg-slate-200 ${className ?? "h-24 w-full"}`} />;
};
