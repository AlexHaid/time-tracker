"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMinutesShort } from "@/lib/time-tracker/time-parser";
import { WORK_TYPE_COLORS } from "@/lib/time-tracker/types";
import type { WorkType } from "@/lib/time-tracker/types";
import styles from "./DayCell.module.css";

/** 8 hours in minutes */
const EIGHT_HOURS = 480;

/** Get time color style object based on daily total */
function getTimeColorStyle(totalMinutes: number): { color: string } {
  if (totalMinutes < EIGHT_HOURS) return { color: "#ef4444" };
  if (totalMinutes === EIGHT_HOURS) return { color: "#16a34a" };
  return { color: "#3b82f6" };
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

export default function DayCell({
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
  const [hovered, setHovered] = useState(false);

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
