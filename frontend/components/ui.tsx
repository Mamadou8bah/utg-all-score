"use client";
import { useLanguage } from "@/components/language-provider";

import type React from "react";
import { useEffect, useMemo, useState, useRef } from "react";
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
  Search
} from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => {
  return (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0",
      variant === "primary" && "bg-primary text-white shadow-float hover:-translate-y-0.5 hover:bg-[#004688] active:translate-y-0",
      variant === "secondary" && "bg-secondary text-white hover:bg-[#E6B000] active:scale-[0.99]",
      variant === "ghost" && "bg-white text-text-primary ring-1 ring-slate-200 hover:bg-white",
      variant === "destructive" && "bg-error text-white hover:bg-red-700",
      className
    )}
    {...props}
  />
);
};

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
  <input
    className={cn(
      "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100",
      className
    )}
    {...props}
  />
);
};

export const Badge = ({
  children,
  variant = "default",
  className
}: {
  children: React.ReactNode;
  variant?: "default" | "live" | "success" | "warning";
  className?: string;
}) => {
  return (
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
};

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
}) => {
  const { t: translate } = useLanguage();
  return (
  <div className="page-heading flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">{translate(eyebrow)}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">{translate(title)}</h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary md:text-base md:leading-7">{translate(description)}</p>
    </div>
    {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);
};

export const Tabs = ({
  tabs,
  defaultTab,
  variant = "default"
}: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  variant?: "default" | "pwa";
}) => {
  const { t: translate } = useLanguage();
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
                aria-pressed={tab.id === selected.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "app-tab whitespace-nowrap px-6 py-3 text-sm font-bold transition-colors",
                  isActive 
                    ? "app-tab--active text-primary"
                    : "text-slate-500 hover:text-primary"
                )}
              >
                {translate(tab.label)}
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
            aria-pressed={tab.id === selected.id}
                onClick={() => setActiveTab(tab.id)}
            className={cn(
              "app-tab px-4 py-2 text-sm font-medium transition",
              tab.id === selected.id ? "app-tab--active text-primary" : "text-text-secondary hover:text-primary"
            )}
          >
            {translate(tab.label)}
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
  const { t: translate } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const focused = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => { dialog.close(); focused?.focus(); };
  }, [open]);
  if (!open) return null;

  return (
    <dialog ref={dialogRef} aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-slate-900/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] open:flex items-center justify-center">
      <div className="flex w-full max-w-lg max-h-[min(85dvh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-[32px] bg-white p-6 shadow-float animate-slideUp">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{translate(title)}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{translate(description)}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-text-secondary">{translate("Close")}</button>
        </div>
        <div className="mt-5 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
};

export const Navbar = () => {
  const { t: translate } = useLanguage();
  const pathname = usePathname();
  const links = [
    { label: "Matches", path: "/" },
    { label: "Live", path: "/live" },
    { label: "Leagues", path: "/standings" },
    { label: "News", path: "/news" },
    { label: "More", path: "/more" }
  ];
  return (
    <header className="top-bar">
      <Link href="/" className="top-bar__brand" aria-label={translate("UTG AllScore home")}>
        <img src="/images/utg-allscore-logo.png" alt={translate("UTG AllScore logo")} width={36} height={36} className="top-bar__logo" />
        <span>{translate("UTG AllScore")}</span>
      </Link>
      <nav className="top-bar__nav" aria-label={translate("Main navigation")}>
        {links.map((link) => (
          <Link key={link.path} href={link.path} aria-current={(pathname === link.path || (link.path === "/more" && pathname === "/settings")) ? "page" : undefined}
            className={cn("top-bar__link", (pathname === link.path || (link.path === "/more" && pathname === "/settings")) && "top-bar__link--active")}>
            {translate(link.label)}
          </Link>
        ))}
      </nav>
      <div className="top-bar__actions"><Link href="/search" aria-label={translate("Search AllScore")} className="global-search-link"><Search size={21} /></Link></div>
    </header>
  );
};

export const InstallPrompt = () => {
  const { t: translate } = useLanguage();
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

  if (installed) return <Badge variant="success">{translate("Installed")}</Badge>;
  if (!eventState) return <Badge variant="default">{translate("Installable PWA")}</Badge>;

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await eventState.prompt();
        setEventState(null);
      }}
    >{translate("Install App")}</Button>
  );
};

export const OfflineStatus = () => {
  const { t: translate } = useLanguage();
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

  return <div className={cn("rounded-full px-4 py-2 text-sm font-medium", online ? "bg-green-50 text-success" : "bg-amber-50 text-warning")}>{translate(online ? "Online and syncing" : "Offline mode active")}</div>;
};

export const NotificationSettings = () => {
  const { t: translate } = useLanguage();
  const [status, setStatus] = useState<"idle" | "enabled" | "denied" | "unsupported" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);
  const [busy, setBusy] = useState(false);

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
      .catch(() => setStatus("idle"));
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
    return output;
  };

  const readyRegistration = () => Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Service worker not ready")), 10000))
  ]);

  const turnOffOnThisDevice = async () => {
    setBusy(true);
    try {
      const registration = await readyRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        if (!(await subscription.unsubscribe())) throw new Error("Could not unsubscribe");
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint })
        }).catch(() => undefined);
      }
      setStatus("idle");
      setMessage(null);
    } catch {
      setStatus("error");
      setMessage("Could not turn off notifications on this device.");
    } finally {
      setBusy(false);
    }
  };

  const enableAlerts = async () => {
    if (needsHomeScreen) return;

    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    if (!vapidPublicKey) {
      setStatus("error");
      setMessage("Notifications are not available right now. Please try again later.");
      return;
    }

    let permission: NotificationPermission;
    try { permission = await Notification.requestPermission(); }
    catch { setStatus("error"); setMessage("Could not request notification permission."); return; }
    if (permission === "denied") {
      setStatus("denied");
      return;
    }
    if (permission !== "granted") return;

    setBusy(true);
    try {
      const registration = await readyRegistration();
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
    } catch {
      setStatus("error");
      setMessage("Could not subscribe to push notifications.");
    } finally {
      setBusy(false);
    }
  };

  const enabled = status === "enabled";
  const toggleDisabled = busy || needsHomeScreen || status === "denied" || status === "unsupported";

  const onToggle = async () => {
    if (toggleDisabled) return;
    if (enabled) await turnOffOnThisDevice();
    else await enableAlerts();
  };

  return (
        <div className="space-y-4">
          {needsHomeScreen ? (
            <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-950">{translate("On iPhone, add AllScore to your Home Screen first (Share → Add to Home Screen), then open it from the icon. The Allow prompt only appears in that installed app — not in a Safari tab.")}</div>
          ) : null}

          <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">{translate("Alerts on this device")}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {translate(enabled ? "On — you’ll get match and news alerts." : "Off — turn on to receive alerts.")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label={translate("Toggle push notifications")}
              disabled={toggleDisabled}
              onClick={onToggle}
              aria-busy={busy}
              className={cn("settings-toggle", enabled && "settings-toggle--on")}
            >
            </button>
          </div>

          {status === "denied" ? (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-text-secondary">{translate("Notifications are blocked in this browser. Update browser settings to turn them back on.")}</div>
          ) : null}
          {status === "unsupported" ? (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-text-secondary">{translate("This browser does not support push notifications.")}</div>
          ) : null}
          {status === "error" ? (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-text-secondary">
              {translate(message || "Could not update push notifications.")}
            </div>
          ) : null}

        </div>
  );
};

export const MetaLine = ({ date, venue }: { date: string; venue?: string }) => {
  const { locale } = useLanguage();
  return (
  <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
    <span>{formatDate(date, { day: "numeric", month: "short" }, locale)}</span>
    <span>{formatTime(date, locale)}</span>
    {venue ? <span>{venue}</span> : null}
  </div>
);
};
