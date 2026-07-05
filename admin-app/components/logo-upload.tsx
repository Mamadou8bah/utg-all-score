"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function LogoUpload({
  value,
  onChange,
  label = "Logo"
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-[20px] bg-slate-50 ring-1 ring-slate-100",
            value && "p-2"
          )}
        >
          {value ? (
            <img src={value} alt="Logo preview" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">No logo</span>
          )}
        </div>
        <div className="space-y-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button type="button" variant="ghost" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Uploading…" : value ? "Replace logo" : "Upload logo"}
          </Button>
          {value ? (
            <button type="button" className="block text-xs text-text-secondary hover:text-error" onClick={() => onChange("")}>
              Remove
            </button>
          ) : null}
          <p className="text-xs text-text-secondary">PNG, JPG, or WebP · max 5 MB · stored on Cloudinary</p>
        </div>
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
