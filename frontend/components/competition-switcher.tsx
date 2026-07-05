"use client";

import { useState, useMemo, useEffect } from "react";
import { type Competition } from "@/lib/types";
import { useCompetitionsBundle } from "@/lib/use-api-data";
import { CompetitionLogo } from "@/components/competition-logo";
import { cn } from "@/lib/utils";
import { ChevronDown, Star } from "lucide-react";

export const CompetitionSwitcher = ({
  onSelect
}: {
  onSelect: (comp: Competition) => void;
}) => {
  const { competitions } = useCompetitionsBundle();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Competition | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!selected && competitions.length) {
      setSelected(competitions[0]);
      onSelect(competitions[0]);
    }
  }, [competitions, selected, onSelect]);

  useEffect(() => {
    const saved = localStorage.getItem("favorite-competitions");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("favorite-competitions", JSON.stringify(newFavs));
  };

  const sortedCompetitions = useMemo(() => {
    return [...competitions].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [favorites, competitions]);

  const handleSelect = (comp: Competition) => {
    setSelected(comp);
    onSelect(comp);
    setIsOpen(false);
  };

  if (!selected) return null;

  return (
    <div className="relative w-full px-1 mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <CompetitionLogo competition={selected} />
          <div className="text-left min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary truncate">
              {selected.type === "GENERAL" ? "University Wide" : selected.schoolName}
            </p>
            <p className="text-sm font-bold text-slate-950 truncate">{selected.name}</p>
          </div>
        </div>
        <ChevronDown size={20} className={cn("shrink-0 text-text-secondary transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen ? (
        <div className="absolute left-1 right-1 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-dropdownFade">
          <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
            {sortedCompetitions.map((comp) => (
              <div
                key={comp.id}
                onClick={() => handleSelect(comp)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl p-3 text-left transition cursor-pointer",
                  selected.id === comp.id ? "bg-primary/5 text-primary" : "hover:bg-slate-50 text-text-secondary"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CompetitionLogo competition={comp} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{comp.name}</p>
                    <p className="text-[10px] truncate">{comp.type === "GENERAL" ? "General" : comp.schoolName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(e, comp.id)}
                  className="shrink-0 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                  aria-label={favorites.includes(comp.id) ? "Remove favorite" : "Add favorite"}
                >
                  <Star
                    size={16}
                    className={cn(
                      "transition-all",
                      favorites.includes(comp.id) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
