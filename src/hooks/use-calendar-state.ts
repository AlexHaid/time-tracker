"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { fetchEntries } from "@/lib/time-tracker/api";
import { formatDate } from "@/lib/time-tracker/time-parser";
import type { EntriesByDate, TimeEntryWithDate } from "@/lib/time-tracker/types";

/**
 * Manages calendar navigation, date selection, and entry loading.
 * Responsible for hydration (mounted flag) and computed totals.
 */
export function useCalendarState() {
  // Mounted flag — prevents hydration mismatch by deferring
  // browser-only state (Date, localStorage) to client-side effect
  const [mounted, setMounted] = useState(false);

  // Current month displayed in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  // Selected date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>("");
  // All entries grouped by date
  const [entriesByDate, setEntriesByDate] = useState<EntriesByDate>({});

  // Hydrate browser-only state after mount
  useEffect(() => {
    const today = formatDate(new Date());
    setSelectedDate(today);
    setCurrentMonth(new Date());
    setEntriesByDate(fetchEntries());
    setMounted(true);
  }, []);

  // Refresh entries from localStorage
  const refreshEntries = useCallback(() => {
    setEntriesByDate(fetchEntries());
  }, []);

  // Get entries for the selected date
  const selectedDateEntries: TimeEntryWithDate[] = useMemo(() => {
    if (!selectedDate) return [];
    const list = entriesByDate[selectedDate] || [];
    return list.map((e) => ({ ...e, date: selectedDate }));
  }, [entriesByDate, selectedDate]);

  // Calculate total time for selected date
  const selectedDateTotalMinutes = selectedDateEntries.reduce(
    (s, e) => s + e.spentMinutes,
    0
  );

  // Calculate total time for current month
  const monthTotalMinutes = useMemo(() => {
    let total = 0;
    for (const [dateKey, list] of Object.entries(entriesByDate)) {
      try {
        const entryDate = parseISO(dateKey + "T00:00:00");
        if (
          entryDate.getMonth() === currentMonth.getMonth() &&
          entryDate.getFullYear() === currentMonth.getFullYear()
        ) {
          total += list.reduce((s, e) => s + e.spentMinutes, 0);
        }
      } catch {
        // skip invalid dates
      }
    }
    return total;
  }, [entriesByDate, currentMonth]);

  // Handler: date selected on calendar
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return {
    mounted,
    currentMonth,
    setCurrentMonth,
    selectedDate,
    entriesByDate,
    refreshEntries,
    selectedDateEntries,
    selectedDateTotalMinutes,
    monthTotalMinutes,
    handleDateSelect,
  };
}
