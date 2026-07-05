"use client";

import { useRef } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

export const DatePickerTimeline = ({
  selectedDate,
  onDateChange
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(subDays(selectedDate, 3), i));

  function openCalendar() {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  }

  function handleDateInput(value: string) {
    if (!value) return;
    onDateChange(new Date(`${value}T12:00:00`));
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 px-1 no-scrollbar">
      <input
        ref={inputRef}
        type="date"
        className="sr-only"
        value={format(selectedDate, "yyyy-MM-dd")}
        onChange={(event) => handleDateInput(event.target.value)}
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={openCalendar}
        aria-label="Pick a date"
        className="flex-shrink-0 rounded-xl bg-white p-3 shadow-sm border border-slate-100 active:scale-95 transition-all text-text-secondary hover:border-primary/30 hover:text-primary"
      >
        <CalendarIcon size={18} />
      </button>

      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onDateChange(date)}
            className={cn(
              "relative flex flex-col items-center justify-center min-w-[64px] py-2.5 rounded-2xl transition-all border",
              isSelected
                ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                : "bg-white border-slate-100 text-text-secondary hover:border-slate-200"
            )}
          >
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-tighter",
                isSelected ? "text-white/70" : "text-text-secondary/60"
              )}
            >
              {format(date, "EEE")}
            </span>
            <span className="text-sm font-black mt-0.5">{format(date, "dd")}</span>
            {isToday && !isSelected ? (
              <div className="absolute top-1.5 right-2 h-1 w-1 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
