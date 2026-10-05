"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

type Request = { kind: "confirm" | "prompt" | "alert"; message: string; initial?: string; type?: "text" | "date" | "number" };
type Result = boolean | string | null;
type DialogApi = { confirm: (message: string) => Promise<boolean>; prompt: (message: string, initial?: string, type?: Request["type"]) => Promise<string | null>; alert: (message: string) => Promise<void> };
const Context = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  const [value, setValue] = useState("");
  const pending = useRef<((result: Result) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const finish = useCallback((result: Result) => {
    const resolve = pending.current;
    pending.current = null;
    dialog.current?.close();
    setRequest(null);
    resolve?.(result);
  }, []);
  const open = useCallback((next: Request): Promise<Result> => {
    if (pending.current) return Promise.resolve(null);
    setValue(next.initial || "");
    return new Promise(resolve => { pending.current = resolve; setRequest(next); });
  }, []);
  useEffect(() => { finish(null); }, [pathname, finish]);
  useEffect(() => () => { pending.current?.(null); pending.current = null; }, []);
  useEffect(() => {
    if (!request) return;
    const focused = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    if (request.kind === "prompt") input.current?.focus(); else cancel.current?.focus();
    return () => { if (focused?.isConnected) focused.focus(); };
  }, [request]);
  const api: DialogApi = {
    confirm: async message => (await open({kind:"confirm",message})) === true,
    prompt: async (message,initial,type="text") => { const result = await open({kind:"prompt",message,initial,type}); return typeof result === "string" ? result : null; },
    alert: async message => { await open({kind:"alert",message}); }
  };
  const destructive = request?.kind === "confirm" && /delete|remove/i.test(request.message);
  return <Context.Provider value={api}>{children}
    {request ? <dialog ref={dialog} className="app-action-dialog" aria-labelledby="action-dialog-title" aria-describedby="action-dialog-description"
      onCancel={e=>{e.preventDefault();e.stopPropagation();finish(null);}}
      onClick={e=>{if(e.target===e.currentTarget)finish(null);}}>
      <form onSubmit={e=>{e.preventDefault();finish(request.kind === "prompt" ? value.trim() : true);}}>
        <header><h2 id="action-dialog-title">{request.kind === "prompt" ? "Competition setup" : destructive ? "Confirm deletion" : request.kind === "alert" ? "AllScore update" : "Confirm action"}</h2><button type="button" className="action-dialog-close" aria-label="Close dialog" onClick={()=>finish(null)}><X size={20}/></button></header>
        <p id="action-dialog-description">{request.message}</p>
        {request.kind === "prompt" ? <label className="action-dialog-field">{request.type === "date" ? "Start date" : request.type === "number" ? "Teams per group" : "Your response"}<input ref={input} type={request.type} required min={request.type === "number" ? 1 : undefined} max={request.type === "number" ? 2 : undefined} step={request.type === "number" ? 1 : undefined} value={value} onChange={e=>setValue(e.target.value)} /></label> : null}
        <footer>{request.kind !== "alert" ? <button ref={cancel} type="button" className="action-dialog-cancel" onClick={()=>finish(null)}>Cancel</button> : null}<button ref={request.kind === "alert" ? cancel : undefined} type="submit" className={`action-dialog-submit${destructive ? " action-dialog-submit--danger" : ""}`}>{destructive ? "Delete" : request.kind === "prompt" ? "Continue" : request.kind === "alert" ? "OK" : "Confirm"}</button></footer>
      </form>
    </dialog> : null}
  </Context.Provider>;
}
export function useDialogs() { const api=useContext(Context); if(!api)throw new Error("DialogProvider is required"); return api; }
