"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";
import { Button } from "@/components/ui";

export function ImageUpload({
  value,
  onChange,
  label = "Image"
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
        {value ? (
          <img src={value} alt="Preview" className="h-20 w-32 rounded-2xl object-cover ring-1 ring-slate-100" />
        ) : (
          <div className="flex h-20 w-32 items-center justify-center rounded-2xl bg-slate-50 text-xs text-slate-400 ring-1 ring-slate-100">
            No image
          </div>
        )}
        <div className="space-y-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button type="button" variant="ghost" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </Button>
          {error ? <p className="text-sm text-error">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
