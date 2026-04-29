import Link from "next/link";
import { athletes, teams, type Match, type StandingRow, type Competition } from "@/lib/data";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { Badge, Button, MetaLine } from "@/components/ui";
import { ChevronRight, Trophy, Info, CalendarDays, Zap, Newspaper, LayoutGrid } from "lucide-react";

export const Hero = () => (
  <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-5 py-7 text-white shadow-float sm:rounded-[36px] sm:px-8 sm:py-8 lg:px-10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,199,44,0.28),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(0,85,164,0.4),_transparent_35%)]" />
    <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div>
        <Badge variant="live">Official Campus Sports</Badge>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Your Official University Sports Hub.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">UTG AllScore brings live match control, results, official updates, and athlete storytelling into one fast sports app.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/live" className="flex-1 sm:flex-none"><Button className="w-full sm:w-auto">Live Scores</Button></Link>
          <Link href="/fixtures" className="flex-1 sm:flex-none"><Button variant="ghost" className="w-full bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15 sm:w-auto">Fixtures</Button></Link>
        </div>
      </div>
      <div className="grid gap-3">
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/55">Live right now</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">ICT vs Business</p>
              <p className="mt-1 text-xs text-white/70">VC Tournament</p>
            </div>
            <Badge variant="live" className="h-6 px-2">72'</Badge>
          </div>
          <div className="mt-3 flex items-center gap-4 text-3xl font-bold"><span>2</span><span className="text-white/40">:</span><span>1</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Installable", "Fast PWA"],
            ["Offline", "Cached scores"]
          ].map(([title, value]) => (
            <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur">
              <p className="text-[10px] text-white/58">{title}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
          <div className="hidden rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur sm:block">
            <p className="text-[10px] text-white/58">Alerts</p>
            <p className="mt-1 text-sm font-semibold">Live Push</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TeamMark = ({ teamName, className }: { teamName: string; className: string }) => {
  const team = teams.find((item) => item.name === teamName);

  return (
    <div className={cn("bg-slate-50 flex items-center justify-center text-slate-400", className)}>
      {team?.logo ? (
        <img src={team.logo} alt="" className="h-full w-full object-contain p-0.5" />
      ) : (
        <span className="font-black">{teamName[0]}</span>
      )}
    </div>
  );
};

export const LiveMatchCard = ({ match, onClick }: { match: Match, onClick?: () => void }) => (
  <article 
    onClick={onClick}
    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
         <span className="flex h-1.5 w-1.5 rounded-full bg-live animate-flash" />
         <span className="text-[10px] font-black uppercase tracking-tight text-live">{match.timer}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <img 
          src="https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png" 
          alt="League Logo"
          className="h-3 w-3 object-contain opacity-60"
        />
        <p className="text-[9px] font-black text-text-secondary uppercase tracking-wider">{match.competition}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TeamMark teamName={match.home} className="h-5 w-5 rounded text-[10px]" />
            <span className="text-sm font-black text-slate-950">{match.home}</span>
          </div>
          <span className="text-lg font-black text-live">{match.homeScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TeamMark teamName={match.away} className="h-5 w-5 rounded text-[10px]" />
            <span className="text-sm font-black text-slate-950">{match.away}</span>
          </div>
          <span className="text-lg font-black text-live">{match.awayScore}</span>
        </div>
      </div>
    </div>

    {match.events.length > 0 && (
      <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
        {match.events.slice(-1).map((event) => (
          <div key={`${match.id}-${event.minute}`} className="flex items-center gap-2 text-[10px]">
            <span className="font-black text-primary">{event.minute}'</span>
            <span className="font-bold text-text-secondary italic">{event.type} · {event.player}</span>
          </div>
        ))}
      </div>
    )}
  </article>
);

export const FixtureCard = ({ match, onClick }: { match: Match, onClick?: () => void }) => (
  <article 
    onClick={onClick}
    className="cursor-pointer rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-colors active:bg-slate-50 sm:px-4"
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex min-w-[44px] flex-col items-center justify-center border-r border-slate-50 py-1 pr-3 sm:min-w-[50px] sm:pr-4">
        <span className="text-xs font-black text-slate-950">{formatTime(match.kickoff)}</span>
        <span className="text-[9px] font-black text-text-secondary uppercase mt-0.5">{match.status}</span>
      </div>
      
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <TeamMark teamName={match.home} className="h-4 w-4 rounded-[4px] text-[8px]" />
            <span className="truncate text-xs font-black text-slate-950 sm:text-sm">{match.home}</span>
          </div>
          {match.status === "FT" && <span className="text-sm font-black text-slate-950">{match.homeScore}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <TeamMark teamName={match.away} className="h-4 w-4 rounded-[4px] text-[8px]" />
            <span className="truncate text-xs font-black text-slate-950 sm:text-sm">{match.away}</span>
          </div>
          {match.status === "FT" && <span className="text-sm font-black text-slate-950">{match.awayScore}</span>}
        </div>
      </div>
    </div>
  </article>
);

export const ResultCard = ({ match, onClick }: { match: Match, onClick?: () => void }) => (
  <article 
    onClick={onClick}
    className="group cursor-pointer rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-colors active:bg-slate-50 sm:px-4"
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex min-w-[44px] flex-col items-center justify-center border-r border-slate-50 py-1 pr-3 sm:min-w-[50px] sm:pr-4">
        <span className="text-xs font-black text-secondary">FT</span>
        <span className="text-[9px] font-black text-text-secondary uppercase mt-0.5">{formatDate(match.kickoff, { month: 'short', day: 'numeric', year: undefined })}</span>
      </div>
      
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <TeamMark teamName={match.home} className="h-4 w-4 rounded-[4px] text-[8px] transition-colors group-hover:bg-slate-100" />
            <span className="truncate text-xs font-black text-slate-950 sm:text-sm">{match.home}</span>
          </div>
          <span className="text-sm font-black text-secondary">{match.homeScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <TeamMark teamName={match.away} className="h-4 w-4 rounded-[4px] text-[8px] transition-colors group-hover:bg-slate-100" />
            <span className="truncate text-xs font-black text-slate-950 sm:text-sm">{match.away}</span>
          </div>
          <span className="text-sm font-black text-secondary">{match.awayScore}</span>
        </div>
      </div>
    </div>
  </article>
);

export const NewsCard = ({ 
  item, 
  onClick 
}: { 
  item: { title: string; excerpt: string; category: string; image?: string; publishedAt: string };
  onClick?: () => void;
}) => (
  <article 
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white shadow-card transition-all hover:-translate-y-1 active:scale-[0.98]"
  >
    {item.image && (
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
      </div>
    )}
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="default" className="bg-slate-100 text-slate-900 border-none px-3 py-1 font-black text-[10px] uppercase">
          {item.category}
        </Badge>
        <span className="text-[10px] font-bold text-text-secondary uppercase">
          {formatDate(item.publishedAt, { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <h3 className="text-xl font-black leading-tight text-slate-950 group-hover:text-primary transition-colors">
        {item.title}
      </h3>
      <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary line-clamp-2 italic">
        "{item.excerpt}"
      </p>
      <div className="mt-6 flex items-center justify-end">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-slate-950 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  </article>
);

export const AnnouncementCard = ({ item }: { item: { title: string; body: string; level: string } }) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card">
    <Badge variant={item.level === "warning" ? "warning" : "default"}>{item.level === "warning" ? "Urgent" : "Notice"}</Badge>
    <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
    <p className="mt-2 text-sm leading-6 text-text-secondary">{item.body}</p>
  </div>
);

export const AthleteHighlightCard = ({ athlete }: { athlete: (typeof athletes)[number] }) => (
  <article className="grid gap-5 rounded-[30px] border border-slate-200 bg-white p-5 shadow-card md:grid-cols-[160px_1fr] md:items-center">
    <div className="relative h-40 overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,_rgba(0,85,164,0.18),_rgba(255,199,44,0.28))]">
      <img src={athlete.image} alt={athlete.name} className="h-full w-full object-cover" />
    </div>
    <div>
      <Badge variant="success">{athlete.sport}</Badge>
      <h3 className="mt-4 text-2xl font-semibold text-slate-950">{athlete.name}</h3>
      <p className="mt-2 text-sm text-text-secondary">{athlete.team} · {athlete.role}</p>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{athlete.story}</p>
      <p className="mt-4 text-sm font-semibold text-primary">{athlete.statLine}</p>
    </div>
  </article>
);

export const EventCard = ({ event }: { event: { title: string; type: string; venue: string; date: string; description: string } }) => (
  <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card">
    <div className="flex items-center justify-between gap-3">
      <Badge variant="default">{event.type}</Badge>
      <p className="text-sm text-text-secondary">{formatDate(event.date)}</p>
    </div>
    <h3 className="mt-4 text-xl font-semibold text-slate-950">{event.title}</h3>
    <p className="mt-2 text-sm text-text-secondary">{event.venue}</p>
    <p className="mt-4 text-sm leading-6 text-text-secondary">{event.description}</p>
  </article>
);

export const StandingsTable = ({ rows, onTeamClick }: { rows: StandingRow[], onTeamClick?: (teamName: string) => void }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card sm:rounded-[30px]">
    <div className="overflow-x-auto">
      <table className="min-w-full whitespace-nowrap text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-text-secondary">
          <tr>
            <th className="px-3 py-4 font-black sm:px-6 sm:py-5"># Team</th>
            <th className="px-2 py-4 text-center sm:px-3 sm:py-5">PL</th>
            <th className="hidden px-3 py-5 text-center sm:table-cell">W</th>
            <th className="hidden px-3 py-5 text-center sm:table-cell">D</th>
            <th className="hidden px-3 py-5 text-center sm:table-cell">L</th>
            <th className="px-2 py-4 text-center sm:px-3 sm:py-5">GD</th>
            <th className="px-3 py-4 text-center sm:px-6 sm:py-5">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.sort((a,b) => b.pts - a.pts || b.gd - a.gd).map((row, index) => (
            <tr 
              key={row.team} 
              className="border-t border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
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
                {row.gd > 0 ? `+${row.gd}` : row.gd}
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

export const CompetitionCard = ({ 
  competition, 
  onClick 
}: { 
  competition: Competition, 
  onClick?: () => void 
}) => (
  <article 
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-card active:scale-[0.98]"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-50 transition-colors group-hover:bg-primary/10">
            {competition.logo ? (
              <img src={competition.logo} alt="" className="h-10 w-10 object-contain" />
            ) : (
              <LayoutGrid size={28} className="text-slate-300 group-hover:text-primary" />
            )}
          </div>
          <div>
            <Badge variant="default" className="mb-1 text-[9px] font-black tracking-[0.2em]">
              {competition.type === "GENERAL" ? "University wide" : competition.schoolName}
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
         <Trophy size={12} /> {competition.format}
       </span>
       <div className="h-1 w-1 rounded-full bg-slate-200" />
       <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none pt-0.5">
         Live Season
       </span>
    </div>
  </article>
);

export const SkeletonBlock = ({ className }: { className?: string }) => <div className={`animate-pulse rounded-[28px] bg-slate-200/70 ${className ?? "h-24 w-full"}`} />;
