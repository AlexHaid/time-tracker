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
import styles from "./CalendarGrid.module.css";

interface CalendarGridProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onAddTask: (date: string) => void;
  entriesByDate: EntriesByDate;
  mounted: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** 8 hours in minutes */
const EIGHT_HOURS = 480;

/** Get time color style object based on daily total */
function getTimeColorStyle(totalMinutes: number): { color: string } {
  if (totalMinutes < EIGHT_HOURS) return { color: "#ef4444" };
  if (totalMinutes === EIGHT_HOURS) return { color: "#16a34a" };
  return { color: "#3b82f6" };
}

export default function CalendarGrid({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  onAddTask,
  entriesByDate,
  mounted,
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
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} style={{ height: "2rem", width: "2rem" }}>
          <ChevronLeft style={{ height: "1rem", width: "1rem" }} />
        </Button>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.headerTitle}>{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" size="sm" onClick={handleToday} style={{ height: "1.75rem", fontSize: "0.75rem" }}>
            Today
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} style={{ height: "2rem", width: "2rem" }}>
          <ChevronRight style={{ height: "1rem", width: "1rem" }} />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <div key={d} className={styles.weekdayCell}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className={styles.dayGrid}>
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
                isToday={mounted && today}
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

  // Build day cell class names
  const dayCellClass = cn(
    styles.dayCell,
    !inMonth && styles.dayCellOutOfMonth,
    isSelected && inMonth && styles.dayCellSelected,
    isToday && inMonth && styles.dayCellToday,
    isWeekend && inMonth && !isSelected && styles.dayCellWeekend,
  );

  // Build day number class names
  const dayNumClass = cn(
    styles.dayNum,
    !inMonth && styles.dayNumOutOfMonth,
    isToday && inMonth && styles.dayNumToday,
    isSelected && inMonth && !isToday && styles.dayNumSelected,
  );

  return (
    <div
      className={dayCellClass}
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
      <span className={dayNumClass}>
        {dayNum}
      </span>

      {/* Time summary with colored text and type dots */}
      {totalMinutes > 0 && inMonth && (
        <div className={styles.timeSummary}>
          <div className={styles.timeText} style={getTimeColorStyle(totalMinutes)}>
            {formatMinutesShort(totalMinutes)}
          </div>
          <div className={styles.dotsRow}>
            {dayEntries.length <= 4 ? (
              dayEntries.map((entry, i) => (
                <div
                  key={i}
                  className={cn(styles.dot, !WORK_TYPE_COLORS[entry.type] && styles.dotFallback)}
                  style={WORK_TYPE_COLORS[entry.type] ? { backgroundColor: WORK_TYPE_COLORS[entry.type].dotColor } : undefined}
                />
              ))
            ) : (
              <>
                {/* Show first 2 dots + count for many entries */}
                {dayEntries.slice(0, 2).map((entry, i) => (
                  <div
                    key={i}
                    className={styles.dot}
                    style={{ backgroundColor: WORK_TYPE_COLORS[entry.type]?.dotColor }}
                  />
                ))}
                <span className={styles.overflowCount}>
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
          className={styles.plusBtn}
          aria-label={`Add task for ${dateStr}`}
        >
          <Plus style={{ height: "0.75rem", width: "0.75rem" }} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
