"use client";

import { useEffect, useRef, useState } from "react";

export function PwaBoot() {
  const [message, setMessage] = useState<string | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const applyingUpdate = useRef(false);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let installing: ServiceWorker | null = null;
    const show = (text: string) => {
      window.clearTimeout(timer);
      setMessage(text);
      timer = window.setTimeout(() => setMessage(null), 3200);
    };
    const ready = () => {
      if (active && registration.current?.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
    };
    const updateFound = () => {
      installing = registration.current?.installing ?? null;
      installing?.addEventListener("statechange", ready);
    };
    const controllerChanged = () => {
      if (applyingUpdate.current) window.location.reload();
    };
    const checkUpdate = () => {
      if (document.visibilityState === "visible") void registration.current?.update().catch(() => undefined);
    };
    const online = () => { setIsOffline(false); show("Back online. Updates are available."); checkUpdate(); };
    const offline = () => { setIsOffline(true); show("You are offline. Previously viewed scores may be available.") };
    const viewport = () => {
      const focused = document.activeElement;
      const editing = focused instanceof HTMLElement && (focused.matches("input, textarea, select") || focused.isContentEditable);
      const keyboard = editing && !!window.visualViewport && window.innerHeight - window.visualViewport.height > 150;
      document.documentElement.classList.toggle("keyboard-open", keyboard);
    };
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
      navigator.serviceWorker.register(`/sw.js?build=${process.env.NEXT_PUBLIC_BUILD_ID || "local"}`, { updateViaCache: "none" }).then((value) => {
        if (!active) return;
        registration.current = value;
        value.addEventListener("updatefound", updateFound);
        ready();
      }).catch(() => undefined);
    }
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", checkUpdate);
    window.visualViewport?.addEventListener("resize", viewport);
    document.addEventListener("focusin", viewport);
    document.addEventListener("focusout", viewport);
    if (!navigator.onLine) offline();
    return () => {
      active = false;
      window.clearTimeout(timer);
      registration.current?.removeEventListener("updatefound", updateFound);
      installing?.removeEventListener("statechange", ready);
      if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("controllerchange", controllerChanged);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", checkUpdate);
      window.visualViewport?.removeEventListener("resize", viewport);
      document.removeEventListener("focusin", viewport);
      document.removeEventListener("focusout", viewport);
      document.documentElement.classList.remove("keyboard-open");
    };
  }, []);

  if (!message && !updateReady && !isOffline) return null;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[120] rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-float lg:bottom-4 lg:left-auto lg:right-4 lg:w-[360px]">
      {updateReady ? (
        <div className="flex items-center justify-between gap-3">
          <span>A new version is ready. Save your work before updating.</span>
          <button type="button" className="shrink-0 rounded-lg bg-white px-3 py-2 font-semibold text-slate-950"
            onClick={() => {
              if (!registration.current?.waiting) return;
              applyingUpdate.current = true;
              registration.current.waiting.postMessage({ type: "SKIP_WAITING" });
            }}>Update app</button>
        </div>
      ) : (message || "Offline. Saved scores may be out of date.")}
    </div>
  );
}
