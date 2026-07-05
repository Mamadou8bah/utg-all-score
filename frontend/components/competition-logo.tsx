"use client";

import { cn } from "@/lib/utils";
import { Globe, Landmark } from "lucide-react";
import type { Competition } from "@/lib/types";

export function CompetitionLogo({
  competition,
  size = "md",
  className
}: {
  competition: Pick<Competition, "name" | "type" | "logo">;
  size?: "sm" | "md";
  className?: string;
}) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";
  const iconSize = size === "sm" ? 16 : 20;

  if (competition.logo) {
    return (
      <div className={cn("flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-slate-100", box, className)}>
        <img src={competition.logo} alt="" className="h-full w-full object-contain p-1" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        box,
        competition.type === "GENERAL" ? "bg-blue-50 text-primary" : "bg-amber-100 text-slate-800",
        className
      )}
    >
      {competition.type === "GENERAL" ? <Globe size={iconSize} /> : <Landmark size={iconSize} />}
    </div>
  );
}
