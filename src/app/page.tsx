"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { Clock, Timer } from "lucide-react";
import CalendarGrid from "@/components/time-tracker/CalendarGrid";
import TaskPanel from "@/components/time-tracker/TaskPanel";
import TaskModal from "@/components/time-tracker/TaskModal";
import DeleteConfirmDialog from "@/components/time-tracker/DeleteConfirmDialog";
import ImportExportBar from "@/components/time-tracker/ImportExportBar";
import { getEntriesByDate, addEntries, updateEntry, deleteEntry, generateId } from "@/lib/time-tracker/storage";
import { parseTimeInput, getDatesInRange, formatDate } from "@/lib/time-tracker/time-parser";
import type { TimeEntry, EntriesByDate, TaskFormData } from "@/lib/time-tracker/types";

function getTodayString(): string {
  return formatDate(new Date());
}

export default function TimeTrackerPage() {
  // Current month displayed in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  // Selected date (YYYY-MM-DD) - initialize with today
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
  // All entries grouped by date — always init empty to match SSR, load after mount
  const [entriesByDate, setEntriesByDate] = useState<EntriesByDate>({});
  // Whether client-side data has been loaded
  const [hydrated, setHydrated] = useState(false);
  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalDate, setTaskModalDate] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<(TimeEntry & { date: string }) | null>(null);
  // Modal key - increments each time modal opens to force fresh state
  const [modalKey, setModalKey] = useState(0);
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<(TimeEntry & { date: string }) | null>(null);

  // Refresh entries from localStorage
  const refreshEntries = useCallback(() => {
    setEntriesByDate(getEntriesByDate());
  }, []);

  // Load entries from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    refreshEntries();
    setHydrated(true);
  }, [refreshEntries]);

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
  const handleEditEntry = (entry: TimeEntry & { date: string }) => {
    setTaskModalDate(entry.date);
    setEditingEntry(entry);
    setModalKey((k) => k + 1);
    setTaskModalOpen(true);
  };

  // Handler: delete entry from task panel
  const handleDeleteEntry = (entry: TimeEntry & { date: string }) => {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  };

  // Handler: confirm delete
  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.date, deletingEntry.id);
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
      updateEntry(editingEntry.id, editingEntry.date, {
        name: data.name.trim(),
        description: data.description.trim(),
        date: data.date,
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
          date: d,
          entry: {
            id: generateId(),
            name: data.name.trim(),
            description: data.description.trim(),
            spentMinutes: minutes,
          },
        }));
        addEntries(newEntries);
      } else {
        addEntries([
          {
            date: data.date,
            entry: {
              id: generateId(),
              name: data.name.trim(),
              description: data.description.trim(),
              spentMinutes: minutes,
            },
          },
        ]);
      }
    }

    refreshEntries();
  };

  // Format minutes display
  const formatTotal = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" suppressHydrationWarning>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Timer className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Time Tracker</h1>
              <p className="text-xs text-muted-foreground">
                Track your time across days and periods
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Monthly total */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">This month:</span>
              <span className="font-semibold" suppressHydrationWarning>
                {hydrated ? formatTotal(monthTotalMinutes) : "0m"}
              </span>
            </div>
            <ImportExportBar onDataChanged={refreshEntries} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Calendar - takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CalendarGrid
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onAddTask={handleAddTask}
              entriesByDate={entriesByDate}
            />
          </div>

          {/* Task Panel - 1 column */}
          <div className="lg:col-span-1 min-h-[400px]">
            <TaskPanel
              selectedDate={selectedDate}
              entries={selectedDateEntries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Time Tracker &mdash; All data stored locally in your browser</span>
          {hydrated && selectedDate && selectedDateEntries.length > 0 && (
            <span>
              Selected day total: <strong className="text-foreground">{formatTotal(selectedDateTotalMinutes)}</strong>
            </span>
          )}
        </div>
      </footer>

      {/* Task Modal - key forces remount to reset form state */}
      {taskModalOpen && (
        <TaskModal
          key={modalKey}
          open={taskModalOpen}
          onOpenChange={setTaskModalOpen}
          date={taskModalDate}
          editingEntry={editingEntry}
          onSubmit={handleSubmitTask}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskName={deletingEntry?.name || ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
