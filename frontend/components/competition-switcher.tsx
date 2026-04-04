"use client";

import { useState, useMemo, useEffect } from "react";
import { competitions, type Competition } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ChevronDown, Globe, Landmark, Star } from "lucide-react";

export const CompetitionSwitcher = ({ 
  onSelect 
}: { 
  onSelect: (comp: Competition) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(competitions[0]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from local storage
  useEffect(() => {
    const saved = localStorage.getItem("favorite-competitions");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(favId => favId !== id)
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
  }, [favorites]);

  const handleSelect = (comp: Competition) => {
    setSelected(comp);
    onSelect(comp);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full px-1 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            selected.type === "GENERAL" ? "bg-primary/10 text-primary" : "bg-secondary/20 text-slate-800"
          )}>
            {selected.type === "GENERAL" ? <Globe size={20} /> : <Landmark size={20} />}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {selected.type === "GENERAL" ? "University Wide" : selected.schoolName}
            </p>
            <p className="text-sm font-bold text-slate-950">{selected.name}</p>
          </div>
        </div>
        <ChevronDown size={20} className={cn("text-text-secondary transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
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
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    comp.type === "GENERAL" ? "bg-primary/10" : "bg-slate-100"
                  )}>
                    {comp.type === "GENERAL" ? <Globe size={16} /> : <Landmark size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{comp.name}</p>
                    <p className="text-[10px]">{comp.type === "GENERAL" ? "General" : comp.schoolName}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => toggleFavorite(e, comp.id)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Star 
                    size={16} 
                    className={cn(
                      "transition-all",
                      favorites.includes(comp.id) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-slate-300"
                    )} 
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
