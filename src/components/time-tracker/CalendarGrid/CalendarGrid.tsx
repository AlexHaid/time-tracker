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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EntriesByDate, WorkType } from "@/lib/time-tracker/types";
import DayCell from "./DayCell";
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
