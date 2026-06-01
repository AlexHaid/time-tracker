"use client";

import React, { useCallback, useState } from "react";
import { parseISO } from "date-fns";
import { Clock, Timer } from "lucide-react";
import CalendarGrid from "@/components/time-tracker/CalendarGrid";
import TaskPanel from "@/components/time-tracker/TaskPanel";
import TaskModal from "@/components/time-tracker/TaskModal";
import DeleteConfirmDialog from "@/components/time-tracker/DeleteConfirmDialog";
import ImportExportBar from "@/components/time-tracker/ImportExportBar";
import { getEntries, addEntries, updateEntry, deleteEntry, generateId } from "@/lib/time-tracker/storage";
import { parseTimeInput, getDatesInRange, formatDate } from "@/lib/time-tracker/time-parser";
import type { TimeEntry, TaskFormData } from "@/lib/time-tracker/types";

function getTodayString(): string {
  return formatDate(new Date());
}

function loadInitialEntries(): TimeEntry[] {
  if (typeof window === "undefined") return [];
  return getEntries();
}

export default function TimeTrackerPage() {
  // Current month displayed in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  // Selected date (YYYY-MM-DD) - initialize with today
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
  // All entries (loaded from localStorage via lazy initializer)
  const [entries, setEntries] = useState<TimeEntry[]>(loadInitialEntries);
  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalDate, setTaskModalDate] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  // Modal key - increments each time modal opens to force fresh state
  const [modalKey, setModalKey] = useState(0);
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null);

  // Refresh entries from localStorage
  const refreshEntries = useCallback(() => {
    setEntries(getEntries());
  }, []);

  // Get entries for the selected date
  const selectedDateEntries = selectedDate
    ? entries.filter((e) => e.date === selectedDate)
    : [];

  // Calculate total time for selected date
  const selectedDateTotalMinutes = selectedDateEntries.reduce(
    (s, e) => s + e.spentMinutes,
    0
  );

  // Calculate total time for current month
  const monthTotalMinutes = entries
    .filter((e) => {
      try {
        const entryDate = parseISO(e.date + "T00:00:00");
        return (
          entryDate.getMonth() === currentMonth.getMonth() &&
          entryDate.getFullYear() === currentMonth.getFullYear()
        );
      } catch {
        return false;
      }
    })
    .reduce((s, e) => s + e.spentMinutes, 0);

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
  const handleEditEntry = (entry: TimeEntry) => {
    setTaskModalDate(entry.date);
    setEditingEntry(entry);
    setModalKey((k) => k + 1);
    setTaskModalOpen(true);
  };

  // Handler: delete entry from task panel
  const handleDeleteEntry = (entry: TimeEntry) => {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  };

  // Handler: confirm delete
  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.id);
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
      updateEntry(editingEntry.id, {
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
        const newEntries: TimeEntry[] = dates.map((d) => ({
          id: generateId(),
          name: data.name.trim(),
          description: data.description.trim(),
          date: d,
          spentMinutes: minutes,
        }));
        addEntries(newEntries);
      } else {
        const newEntry: TimeEntry = {
          id: generateId(),
          name: data.name.trim(),
          description: data.description.trim(),
          date: data.date,
          spentMinutes: minutes,
        };
        addEntries([newEntry]);
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
    <div className="min-h-screen flex flex-col bg-background">
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
              <span className="font-semibold">
                {formatTotal(monthTotalMinutes)}
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
              entries={entries}
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
          {selectedDate && selectedDateEntries.length > 0 && (
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
