"use client";

import { useState } from "react";
import { createEntries, updateEntryAPI } from "@/lib/time-tracker/api";
import { parseTimeInput, getDatesInRange } from "@/lib/time-tracker/time-parser";
import type { TaskFormData, TimeEntryWithDate } from "@/lib/time-tracker/types";

/**
 * Manages task modal state: open/close, editing entry, and form submission.
 * Receives `refreshEntries` from the calendar state to sync after mutations.
 */
export function useTaskModal(refreshEntries: () => void) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalDate, setTaskModalDate] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<TimeEntryWithDate | null>(null);
  // Modal key - increments each time modal opens to force fresh state
  const [modalKey, setModalKey] = useState(0);

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
    taskModalOpen,
    setTaskModalOpen,
    taskModalDate,
    editingEntry,
    modalKey,
    handleAddTask,
    handleEditEntry,
    handleSubmitTask,
  };
}
