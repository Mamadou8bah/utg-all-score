"use client";

import { useState } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

export const DatePickerTimeline = ({ 
  selectedDate, 
  onDateChange 
}: { 
  selectedDate: Date, 
  onDateChange: (date: Date) => void 
}) => {
  // Generate a range of 7 days around the current date
  const dates = Array.from({ length: 7 }, (_, i) => addDays(subDays(new Date(), 3), i));

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 px-1 no-scrollbar">
      <button className="flex-shrink-0 rounded-xl bg-white p-3 shadow-sm border border-slate-100 active:scale-95 transition-all text-text-secondary">
        <CalendarIcon size={18} />
      </button>
      
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());
        
        return (
          <button
            key={date.toISOString()}
            onClick={() => onDateChange(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] py-2.5 rounded-2xl transition-all border",
              isSelected 
                ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                : "bg-white border-slate-100 text-text-secondary hover:border-slate-200"
            )}
          >
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-tighter",
              isSelected ? "text-white/70" : "text-text-secondary/60"
            )}>
              {format(date, "EEE")}
            </span>
            <span className="text-sm font-black mt-0.5">
              {format(date, "dd")}
            </span>
            {isToday && !isSelected && (
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
};
