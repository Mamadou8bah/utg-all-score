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
    <div className="date-strip no-scrollbar" role="group" aria-label="Match dates">
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
        className="date-strip__calendar"
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
            aria-pressed={isSelected}
            className={cn("date-strip__day", isSelected && "date-strip__day--active")}
          >
            <span className="date-strip__wd">{format(date, "EEE")}</span>
            <span className="date-strip__num">{format(date, "dd")}</span>
            {isToday && !isSelected ? (
              <div className="absolute top-1.5 right-2 h-1 w-1 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
