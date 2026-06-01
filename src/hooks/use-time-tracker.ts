"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import {
  fetchEntries,
  createEntries,
  updateEntryAPI,
  deleteEntryAPI,
} from "@/lib/time-tracker/api";
import { parseTimeInput, getDatesInRange, formatDate } from "@/lib/time-tracker/time-parser";
import type { TimeEntry, EntriesByDate, TaskFormData, TimeEntryWithDate } from "@/lib/time-tracker/types";

export function useTimeTracker() {
  // Mounted flag — prevents hydration mismatch by deferring
  // browser-only state (Date, localStorage) to client-side effect
  const [mounted, setMounted] = useState(false);

  // Current month displayed in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  // Selected date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>("");
  // All entries grouped by date
  const [entriesByDate, setEntriesByDate] = useState<EntriesByDate>({});
  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalDate, setTaskModalDate] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<TimeEntryWithDate | null>(null);
  // Modal key - increments each time modal opens to force fresh state
  const [modalKey, setModalKey] = useState(0);
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntryWithDate | null>(null);

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
  const selectedDateEntries = useMemo(() => {
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

  // Handler: add task button clicked on a day cell
  const handleAddTask = (date: string) => {
    setTaskModalDate(date);
    setEditingEntry(null);
    setModalKey((k) => k + 1);
    setTaskModalOpen(true);
  };

  // Handler: edit entry from task panel
  const handleEditEntry = (entry: TimeEntryWithDate) => {
    setTaskModalDate(entry.date);
    setEditingEntry(entry);
    setModalKey((k) => k + 1);
    setTaskModalOpen(true);
  };

  // Handler: delete entry from task panel
  const handleDeleteEntry = (entry: TimeEntryWithDate) => {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  };

  // Handler: confirm delete
  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntryAPI(deletingEntry.id, deletingEntry.date);
      refreshEntries();
    }
    setDeleteDialogOpen(false);
    setDeletingEntry(null);
  };

  // Handler: submit task form
  const handleSubmitTask = (data: TaskFormData) => {
    const minutes = parseTimeInput(data.spentTime);
    if (!minutes || minutes <= 0) return;

    if (editingEntry) {
      // Update existing entry
      updateEntryAPI(editingEntry.id, editingEntry.date, {
        name: data.name.trim(),
        description: data.description.trim(),
        date: data.date,
        type: data.type,
        spentMinutes: minutes,
      });
    } else {
      // Create new entry(s)
      if (data.isPeriod && data.periodEndDate) {
        const dates = getDatesInRange(
          data.date,
          data.periodEndDate,
          data.includeNonWorkingDays
        );
        const newEntries = dates.map((d) => ({
          name: data.name.trim(),
          description: data.description.trim(),
          date: d,
          spentMinutes: minutes,
          type: data.type,
        }));
        createEntries(newEntries);
      } else {
        createEntries([
          {
            name: data.name.trim(),
            description: data.description.trim(),
            date: data.date,
            spentMinutes: minutes,
            type: data.type,
          },
        ]);
      }
    }

    refreshEntries();
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
    handleAddTask,
    handleEditEntry,
    handleDeleteEntry,
    handleConfirmDelete,
    handleSubmitTask,
    taskModalOpen,
    setTaskModalOpen,
    taskModalDate,
    editingEntry,
    modalKey,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingEntry,
  };
}
