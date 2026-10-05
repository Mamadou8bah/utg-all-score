"use client";
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
export function FormModal({ open, title, onClose, message, children }: { open: boolean; title: string; onClose: () => void; message?: string; children: ReactNode }) {
  const ref=useRef<HTMLDialogElement>(null);
  const saving=useRef(false);
  const [busy,setBusy]=useState(false);
  const [failure,setFailure]=useState("");
  const close=()=>{if(!saving.current)onClose();};
  const content=Children.map(children,child=>{
    if(!isValidElement<{onSubmit?: (event: FormEvent<HTMLFormElement>)=>void | Promise<void>; children?: ReactNode}>(child) || child.type !== "form")return child;
    return cloneElement(child,{onSubmit:async event=>{
      event.preventDefault();if(saving.current)return;
      saving.current=true;setBusy(true);setFailure("");
      try {await child.props.onSubmit?.(event);}catch{setFailure("Could not save. Check your connection and try again.");}
      finally{saving.current=false;setBusy(false);}
    },children:<fieldset disabled={busy} className="contents">{child.props.children}</fieldset>});
  });
  useEffect(()=>{
    if(!open)return;
    const focused=document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    ref.current?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea")?.focus();
    return()=>{ref.current?.close();if(focused?.isConnected)focused.focus();};
  },[open]);
  if(!open)return null;
  return <dialog ref={ref} className="admin-form-modal" aria-label={title} onCancel={e=>{e.preventDefault();e.stopPropagation();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
    <header><div><p>UTG AllScore Admin</p><h2>{title}</h2></div><button type="button" aria-label="Close form" disabled={busy} onClick={close}><X size={22}/></button></header>
    <div className="admin-form-modal__body">{message?<p role="status" className="admin-form-message">{message}</p>:null}{failure?<p role="alert" className="admin-form-message">{failure}</p>:null}{busy?<p role="status" className="admin-form-message">Saving changes…</p>:null}{content}</div>
    <footer><button type="button" disabled={busy} onClick={close}>Cancel</button></footer>
  </dialog>;
}
