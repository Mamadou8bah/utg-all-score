"use client";

import { useEffect, useRef } from "react";

export function DetailDialog({ children, label, onClose, className }: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
  className: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); focused?.focus(); };
  }, []);

  return <dialog ref={ref} aria-label={label}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    className={`detail-dialog ${className}`}>{children}</dialog>;
}
