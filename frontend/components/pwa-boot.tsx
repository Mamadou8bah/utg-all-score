"use client";

import { useEffect, useState } from "react";

export const PwaBoot = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => null);
    }

    const handleOnline = () => {
      setMessage("Back online. Refreshing score and news caches.");
      window.setTimeout(() => setMessage(null), 3200);
    };

    const handleOffline = () => {
      setMessage("You are offline. Showing cached scores, fixtures, and announcements.");
      window.setTimeout(() => setMessage(null), 3200);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!message) return null;

  return <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-float md:left-auto md:right-4 md:w-[360px]">{message}</div>;
};
