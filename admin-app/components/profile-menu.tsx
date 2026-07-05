"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, KeyRound, LogOut, UserRound, X } from "lucide-react";
import { apiFetch, apiJson, logout, PUBLIC_SITE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button, Input } from "@/components/ui";

type AdminUser = {
  name: string;
  email: string;
  role: string;
  schoolName?: string | null;
};

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "password" | "profile">("menu");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiJson<{ user: AdminUser }>("/api/auth/me")
      .then((data) => {
        setUser(data.user);
        setName(data.user.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setView("menu");
    setError("");
    setMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");
      setUser(json.data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to change password");
      setMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setView("menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open profile menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-primary shadow-sm transition active:scale-95"
      >
        {initials || <UserRound size={18} />}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] lg:hidden" onClick={closeMenu} />
          <div
            className={cn(
              "z-50 overflow-hidden border border-slate-100 bg-white shadow-float",
              "fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] rounded-[24px] lg:absolute lg:inset-auto lg:right-0 lg:top-12 lg:w-[320px] lg:rounded-[24px]"
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Account</p>
                <p className="text-sm font-bold text-slate-950">
                  {view === "password" ? "Change password" : view === "profile" ? "Edit profile" : "Profile & settings"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {view === "menu" ? (
              <div className="space-y-1 p-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-950">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">{user?.role ?? "ADMIN"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setView("profile");
                    setError("");
                    setMessage("");
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserRound size={18} /> Edit profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("password");
                    setError("");
                    setMessage("");
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <KeyRound size={18} /> Change password
                </button>
                <a
                  href={PUBLIC_SITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink size={18} /> Public AllScore site
                </a>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-error hover:bg-error/5"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            ) : null}

            {view === "profile" ? (
              <form className="space-y-3 p-4" onSubmit={saveProfile}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-950">Display name</span>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                {message ? <p className="text-sm text-primary">{message}</p> : null}
                {error ? <p className="text-sm text-error">{error}</p> : null}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                  <Button type="button" variant="ghost" onClick={() => setView("menu")}>Back</Button>
                </div>
              </form>
            ) : null}

            {view === "password" ? (
              <form className="space-y-3 p-4" onSubmit={changePassword}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-950">Current password</span>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-950">New password</span>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-950">Confirm new password</span>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                </label>
                {message ? <p className="text-sm text-primary">{message}</p> : null}
                {error ? <p className="text-sm text-error">{error}</p> : null}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</Button>
                  <Button type="button" variant="ghost" onClick={() => setView("menu")}>Back</Button>
                </div>
              </form>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
