"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appMeta } from "@/lib/data";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { 
  Home, 
  Radio, 
  LayoutGrid,
  CalendarDays, 
  Newspaper, 
  ChevronRight, 
  Bell
} from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0",
      variant === "primary" && "bg-primary text-white shadow-float hover:-translate-y-0.5 hover:bg-[#004688] active:translate-y-0",
      variant === "secondary" && "bg-secondary text-slate-950 hover:bg-[#E6B000] active:scale-[0.99]",
      variant === "ghost" && "bg-white text-text-primary ring-1 ring-slate-200 hover:bg-white",
      variant === "destructive" && "bg-error text-white hover:bg-red-700",
      className
    )}
    {...props}
  />
);

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100",
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
      variant === "live" && "bg-red-50 text-live",
      variant === "success" && "bg-green-50 text-success",
      variant === "warning" && "bg-amber-50 text-warning",
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
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 ring-1 ring-slate-100"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="animate-in slide-in-from-bottom-4 duration-500">
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full max-w-lg max-h-[min(85dvh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-[32px] bg-white p-6 shadow-float animate-slideUp">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-text-secondary">
            Close
          </button>
        </div>
        <div className="mt-5 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-background">
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
                  ? "bg-blue-50 text-primary shadow-sm" 
                  : "text-text-secondary hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Center Logo (desktop only) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center z-50">
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
          <NotificationToggle />
          <Link href="/news" className={cn(
            "text-sm font-black text-text-secondary hover:text-slate-950 px-4 py-2 rounded-2xl transition-all flex items-center gap-2",
            pathname === "/news" && "bg-blue-50 text-primary shadow-sm"
          )}>
            <Newspaper size={18} />
            News
          </Link>
        </div>

        {/* Mobile / PWA: notifications only */}
        <div className="md:hidden flex items-center justify-end w-full">
           <NotificationToggle />
        </div>
      </div>
    </header>
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

  return <div className={cn("rounded-full px-4 py-2 text-sm font-medium", online ? "bg-green-50 text-success" : "bg-amber-50 text-warning")}>{online ? "Online and syncing" : "Offline mode active"}</div>;
};

export const NotificationToggle = () => {
  const [status, setStatus] = useState<"idle" | "enabled" | "denied" | "unsupported" | "error">("idle");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);

  const isStandaloneDisplay = () => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    return Boolean(nav.standalone) || window.matchMedia("(display-mode: standalone)").matches;
  };

  const isIosDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  useEffect(() => {
    const ios = isIosDevice();
    const standalone = isStandaloneDisplay();
    setNeedsHomeScreen(ios && !standalone);

    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      // iOS Safari tab often lacks PushManager until installed
      if (ios && !standalone) {
        setStatus("idle");
        return;
      }
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    // Permission alone is not enough — confirm an active push subscription
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (subscription && Notification.permission === "granted") setStatus("enabled");
        else setStatus("idle");
      })
      .catch(() => setStatus(Notification.permission === "granted" ? "idle" : "idle"));
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
    return output;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "p-2 text-slate-500 transition-all active:scale-90 rounded-2xl hover:bg-slate-50 hover:text-slate-950",
          status === "enabled" && "text-primary"
        )}
        aria-label="Notifications"
      >
        <Bell size={22} strokeWidth={2.5} />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Push notifications"
        description="Enable alerts for kickoff, half time, goals, full time, news, and announcements."
      >
        <div className="space-y-4">
          {needsHomeScreen ? (
            <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-950">
              On iPhone, add AllScore to your Home Screen first (Share → Add to Home Screen), then open it from the icon. The Allow prompt only appears in that installed app — not in a Safari tab.
            </div>
          ) : null}
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-text-secondary">
            {status === "enabled" && "Push notifications are enabled for this device."}
            {status === "denied" && "Notifications are blocked in this browser. Update browser settings to turn them back on."}
            {status === "unsupported" && "This browser does not support push notifications."}
            {status === "idle" &&
              (needsHomeScreen
                ? "Install the app to Home Screen, open it from the icon, then tap Enable alerts."
                : "Grant permission to receive match starts, goals, results, and announcement banners.")}
            {status === "error" && (message || "Could not enable push notifications.")}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={needsHomeScreen}
              onClick={async () => {
                if (needsHomeScreen) return;

                if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
                  setStatus("unsupported");
                  return;
                }

                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
                if (!vapidPublicKey) {
                  setStatus("error");
                  setMessage("Push is not configured (missing VAPID public key).");
                  return;
                }

                const permission = await Notification.requestPermission();
                if (permission === "denied") {
                  setStatus("denied");
                  return;
                }
                if (permission !== "granted") return;

                try {
                  const registration = await navigator.serviceWorker.ready;
                  const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                  });

                  const res = await fetch("/api/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subscription.toJSON())
                  });

                  if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    setStatus("error");
                    setMessage(err?.error || "Failed to save subscription.");
                    return;
                  }

                  setStatus("enabled");
                  setMessage(null);
                  setOpen(false);
                } catch {
                  setStatus("error");
                  setMessage("Could not subscribe to push notifications.");
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

export const MetaLine = ({ date, venue }: { date: string; venue?: string }) => (
  <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
    <span>{formatDate(date, { day: "numeric", month: "short" })}</span>
    <span>{formatTime(date)}</span>
    {venue ? <span>{venue}</span> : null}
  </div>
);
