"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { announcements, appMeta, navLinks } from "@/lib/data";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { 
  Home, 
  Radio, 
  LayoutGrid,
  CalendarDays, 
  Newspaper, 
  ChevronRight, 
  Bell, 
  Search 
} from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" && "bg-primary text-white shadow-float hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0",
      variant === "secondary" && "bg-secondary text-slate-950 hover:bg-secondary/90 active:scale-[0.99]",
      variant === "ghost" && "bg-white/70 text-text-primary ring-1 ring-slate-200 hover:bg-white",
      variant === "destructive" && "bg-error text-white hover:bg-error/90",
      className
    )}
    {...props}
  />
);

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
      className
    )}
    {...props}
  />
);

export const Badge = ({
  children,
  variant = "default",
  className
}: {
  children: React.ReactNode;
  variant?: "default" | "live" | "success" | "warning";
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
      variant === "default" && "bg-slate-100 text-text-secondary",
      variant === "live" && "bg-live/10 text-live",
      variant === "success" && "bg-success/10 text-success",
      variant === "warning" && "bg-warning/10 text-warning",
      className
    )}
  >
    {children}
  </span>
);

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between px-1">
    <div className="max-w-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary md:text-base md:leading-7">{description}</p>
    </div>
    {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export const Tabs = ({
  tabs,
  defaultTab,
  variant = "default"
}: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  variant?: "default" | "pwa";
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);
  const selected = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab, tabs]);

  if (variant === "pwa") {
    return (
      <div className="w-full">
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-black transition-all active:scale-95",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 ring-1 ring-slate-100"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selected.content}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-card">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              tab.id === selected.id ? "bg-primary text-white" : "bg-slate-100 text-text-secondary hover:bg-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{selected.content}</div>
    </div>
  );
};

export const Modal = ({
  open,
  title,
  description,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-float animate-slideUp">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-text-secondary">
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8 h-16 relative">
        {/* PC Version Navigation (Left) */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {[
            { label: "Home", path: "/", icon: <Home size={18} /> },
            { label: "Live", path: "/live", icon: <Radio size={18} /> },
            { label: "Competitions", path: "/standings", icon: <LayoutGrid size={18} /> },
            { label: "Fixtures", path: "/fixtures", icon: <CalendarDays size={18} /> },
          ].map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black transition-all",
                pathname === item.path 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-text-secondary hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Center Logo (Always Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center z-50">
          <Link href="/" className="flex items-center">
            <div className="relative h-11 w-11 overflow-hidden transition-transform active:scale-95">
              <img 
                src="https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png" 
                alt="UTG AllScore Logo" 
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
        </div>

        {/* PC Version Navigation (Right) */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
          <Link href="/news" className={cn(
            "text-sm font-black text-text-secondary hover:text-slate-950 px-4 py-2 rounded-2xl transition-all flex items-center gap-2",
            pathname === "/news" && "bg-primary/10 text-primary shadow-sm"
          )}>
            <Newspaper size={18} />
            News
          </Link>
        </div>

        {/* Mobile View Elements */}
        <div className="md:hidden flex items-center justify-between w-full">
           <Link href="/news" className="p-2 text-slate-500 active:scale-90 transition-all">
              <Search size={22} strokeWidth={2.5} />
           </Link>
           {/* Logo is absolute in center */}
           <div className="h-10 w-10" />
        </div>
      </div>
    </header>
  );
};

import { Menu as MenuIcon } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-white/70">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-text-secondary sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <p className="font-semibold text-slate-950">{appMeta.name}</p>
        <p>{appMeta.tagline}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/announcements">Announcements</Link>
        <Link href="/events">Events</Link>
        <Link href="/offline">Offline view</Link>
      </div>
    </div>
  </footer>
);

export const Sidebar = () => {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Overview" },
    { href: "/admin?tab=matches", label: "Matches" },
    { href: "/admin?tab=content", label: "Content" },
    { href: "/admin?tab=users", label: "Users" }
  ];

  return (
    <aside className="rounded-[32px] bg-slate-950 p-5 text-white shadow-float">
      <p className="text-xs uppercase tracking-[0.28em] text-white/55">Admin Dashboard</p>
      <div className="mt-6 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("rounded-2xl px-4 py-3 text-sm transition", pathname === "/admin" && item.href === "/admin" ? "bg-white text-slate-950" : "bg-white/5 text-white/74 hover:bg-white/10")}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export const InstallPrompt = () => {
  const [eventState, setEventState] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setEventState(event);
    };
    const handleInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return <Badge variant="success">Installed</Badge>;
  if (!eventState) return <Badge variant="default">Installable PWA</Badge>;

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await eventState.prompt();
        setEventState(null);
      }}
    >
      Install App
    </Button>
  );
};

export const OfflineStatus = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return <div className={cn("rounded-full px-4 py-2 text-sm font-medium", online ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{online ? "Online and syncing" : "Offline mode active"}</div>;
};

export const NotificationToggle = () => {
  const [status, setStatus] = useState<"idle" | "enabled" | "denied" | "unsupported">("idle");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("enabled");
    if (Notification.permission === "denied") setStatus("denied");
  }, []);

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Notifications
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Push notifications" description="Enable alerts for live starts, official results, and urgent university sports announcements.">
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-text-secondary">
            {status === "enabled" && "Browser notifications are enabled for this device."}
            {status === "denied" && "Notifications are blocked in this browser. Update browser settings to turn them back on."}
            {status === "unsupported" && "This browser does not support push notifications."}
            {status === "idle" && "Grant permission to receive match starts, result drops, and announcement banners."}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                if (!("Notification" in window)) {
                  setStatus("unsupported");
                  return;
                }
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                  setStatus("enabled");
                  await fetch("/api/push/subscribe", { method: "POST" });
                } else if (permission === "denied") {
                  setStatus("denied");
                }
              }}
            >
              Enable alerts
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Maybe later
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const AnnouncementTicker = () => (
  <div className="overflow-hidden rounded-[28px] border border-secondary/30 bg-secondary/15 px-4 py-3">
    <div className="flex min-w-max gap-8 animate-marquee">
      {[...announcements, ...announcements].map((item, index) => (
        <div key={`${item.id}-${index}`} className="flex items-center gap-3">
          <Badge variant={item.level === "warning" ? "warning" : "default"}>{item.level === "warning" ? "Alert" : "Update"}</Badge>
          <p className="text-sm font-medium text-slate-950">
            {item.title}: <span className="font-normal text-text-secondary">{item.body}</span>
          </p>
        </div>
      ))}
    </div>
  </div>
);

export const MetaLine = ({ date, venue }: { date: string; venue?: string }) => (
  <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
    <span>{formatDate(date, { day: "numeric", month: "short" })}</span>
    <span>{formatTime(date)}</span>
    {venue ? <span>{venue}</span> : null}
  </div>
);
