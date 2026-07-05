"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, KeyRound, LogOut, UserRound, X } from "lucide-react";
import { apiFetch, apiJson, logout, PUBLIC_SITE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import { useMounted } from "@/lib/use-mounted";

type AdminUser = {
  name: string;
  email: string;
  role: string;
  schoolName?: string | null;
};

export function ProfileMenu() {
  const mounted = useMounted();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ignoreOutsideRef = useRef(false);

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

  useEffect(() => {
    apiJson<{ user: AdminUser }>("/api/auth/me")
      .then((data) => {
        setUser(data.user);
        setName(data.user.name);
      })
      .catch(() => {});
  }, []);

  function closeMenu() {
    setOpen(false);
    setView("menu");
    setError("");
    setMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (ignoreOutsideRef.current) return;

      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      closeMenu();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggleMenu() {
    ignoreOutsideRef.current = true;
    setOpen((value) => !value);
    window.setTimeout(() => {
      ignoreOutsideRef.current = false;
    }, 0);
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

  const panel = open ? (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[80] bg-slate-300"
        onClick={closeMenu}
      />
      <div
        ref={panelRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${menuId}-title`}
        className={cn(
          "fixed z-[90] overflow-hidden border border-slate-100 bg-white shadow-float",
          "inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] max-h-[min(70vh,520px)] overflow-y-auto rounded-[24px]",
          "lg:inset-auto lg:right-6 lg:top-[4.25rem] lg:w-[320px] lg:max-h-[calc(100vh-5rem)]"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Account</p>
            <p id={`${menuId}-title`} className="text-sm font-bold text-slate-950">
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
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-error hover:bg-red-50"
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setView("menu")} className="w-full sm:w-auto">
                Back
              </Button>
            </div>
          </form>
        ) : null}

        {view === "password" ? (
          <form className="space-y-3 p-4" onSubmit={changePassword}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">Current password</span>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">New password</span>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-950">Confirm new password</span>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Updating..." : "Update password"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setView("menu")} className="w-full sm:w-auto">
                Back
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? menuId : undefined}
        className="relative z-[50] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-primary shadow-sm transition active:scale-95"
      >
        {initials || <UserRound size={18} />}
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
