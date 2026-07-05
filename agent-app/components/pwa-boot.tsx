"use client";

import { useEffect, useState } from "react";

export function PwaBoot() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => null);
    }

    const show = (text: string) => {
      setMessage(text);
      window.setTimeout(() => setMessage(null), 3200);
    };

    const handleOnline = () => show("Back online. You can publish scores again.");
    const handleOffline = () => show("You are offline. Reconnect to publish updates.");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-float lg:bottom-4 lg:left-auto lg:right-4 lg:w-[360px]">
      {message}
    </div>
  );
}
