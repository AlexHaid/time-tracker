"use client";

import React, { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMinutesShort } from "@/lib/time-tracker/time-parser";
import { WORK_TYPE_COLORS } from "@/lib/time-tracker/types";
import type { EntriesByDate, WorkType } from "@/lib/time-tracker/types";

interface CalendarGridProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onAddTask: (date: string) => void;
  entriesByDate: EntriesByDate;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** 8 hours in minutes */
const EIGHT_HOURS = 480;

/** Color class for spent time based on daily total */
function getTimeColorClass(totalMinutes: number): string {
  if (totalMinutes < EIGHT_HOURS) return "text-red-500";
  if (totalMinutes === EIGHT_HOURS) return "text-green-600";
  return "text-blue-500";
}

export default function CalendarGrid({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  onAddTask,
  entriesByDate,
}: CalendarGridProps) {
  // Generate the calendar days (6 weeks to fill grid)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Split into weeks
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const handlePrevMonth = () => onMonthChange(subMonths(currentMonth, 1));
  const handleNextMonth = () => onMonthChange(addMonths(currentMonth, 1));
  const handleToday = () => onMonthChange(new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" size="sm" onClick={handleToday} className="h-7 text-xs">
            Today
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-2 select-none"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 gap-px bg-border rounded-lg overflow-hidden">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate === dateStr;
            const today = isToday(day);
            const dayEntries = entriesByDate[dateStr] || [];
            const totalMinutes = dayEntries.reduce((s, e) => s + e.spentMinutes, 0);

            return (
              <DayCell
                key={`${wi}-${di}`}
                day={day}
                dateStr={dateStr}
                inMonth={inMonth}
                isSelected={isSelected}
                isToday={today}
                totalMinutes={totalMinutes}
                dayEntries={dayEntries}
                onSelect={() => onDateSelect(dateStr)}
                onAdd={() => onAddTask(dateStr)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

interface DayCellProps {
  day: Date;
  dateStr: string;
  inMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  totalMinutes: number;
  dayEntries: { type: WorkType; spentMinutes: number }[];
  onSelect: () => void;
  onAdd: () => void;
}

function DayCell({
  day,
  dateStr,
  inMonth,
  isSelected,
  isToday,
  totalMinutes,
  dayEntries,
  onSelect,
  onAdd,
}: DayCellProps) {
  const [hovered, setHovered] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // If plus button was clicked, don't also select
    if ((e.target as HTMLElement).closest("[data-plus-btn]")) return;
    onSelect();
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd();
  };

  const dayNum = format(day, "d");

  // Determine if weekend
  const dayOfWeek = day.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-start p-1 min-h-[72px] sm:min-h-[80px] cursor-pointer transition-colors bg-card",
        "hover:bg-accent/50",
        !inMonth && "bg-muted/30",
        isSelected && inMonth && "bg-primary/10 ring-1 ring-primary/30",
        isToday && inMonth && "bg-accent/30",
        isWeekend && inMonth && "bg-secondary/20",
        isWeekend && inMonth && isSelected && "bg-primary/10 ring-1 ring-primary/30"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Date ${dateStr}, ${dayEntries.length} task${dayEntries.length !== 1 ? "s" : ""}, ${totalMinutes > 0 ? formatMinutesShort(totalMinutes) : "no time tracked"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Day number */}
      <span
        className={cn(
          "text-sm font-medium leading-none mt-1 select-none",
          !inMonth && "text-muted-foreground/50",
          isToday && inMonth && "text-primary font-bold",
          isSelected && inMonth && !isToday && "text-primary"
        )}
      >
        {dayNum}
      </span>

      {/* Time summary with colored text and type dots */}
      {totalMinutes > 0 && inMonth && (
        <div className="mt-1 flex flex-col items-center gap-0.5 w-full px-0.5">
          <div className={cn(
            "text-[10px] leading-none font-semibold truncate w-full text-center",
            getTimeColorClass(totalMinutes)
          )}>
            {formatMinutesShort(totalMinutes)}
          </div>
          <div className="flex gap-0.5 justify-center flex-wrap">
            {dayEntries.length <= 4 ? (
              dayEntries.map((entry, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    WORK_TYPE_COLORS[entry.type]?.dot || "bg-primary/70"
                  )}
                />
              ))
            ) : (
              <>
                {/* Show first 2 dots + count for many entries */}
                {dayEntries.slice(0, 2).map((entry, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      WORK_TYPE_COLORS[entry.type]?.dot || "bg-primary/70"
                    )}
                  />
                ))}
                <span className="text-[8px] leading-none text-muted-foreground font-bold">
                  +{dayEntries.length - 2}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plus button - appears on hover */}
      {hovered && inMonth && (
        <button
          data-plus-btn
          onClick={handlePlusClick}
          className={cn(
            "absolute bottom-1 right-1 z-10",
            "h-5 w-5 rounded-full",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "hover:bg-primary/90 transition-all",
            "shadow-sm",
            "animate-in fade-in zoom-in-75 duration-150"
          )}
          aria-label={`Add task for ${dateStr}`}
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
