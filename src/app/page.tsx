"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { parseISO } from "date-fns";
import { Clock, Timer } from "lucide-react";
import CalendarGrid from "@/components/time-tracker/CalendarGrid";
import TaskPanel from "@/components/time-tracker/TaskPanel";
import TaskModal from "@/components/time-tracker/TaskModal";
import DeleteConfirmDialog from "@/components/time-tracker/DeleteConfirmDialog";
import ImportExportBar from "@/components/time-tracker/ImportExportBar";
import AuthForm from "@/components/auth/AuthForm";
import UserMenu from "@/components/auth/UserMenu";
import {
  fetchEntries,
  createEntries,
  updateEntryAPI,
  deleteEntryAPI,
  exportEntries,
  importEntries,
  clearAllEntries,
} from "@/lib/time-tracker/api";
import { parseTimeInput, getDatesInRange, formatDate } from "@/lib/time-tracker/time-parser";
import type { TimeEntry, EntriesByDate, TaskFormData } from "@/lib/time-tracker/types";

function getTodayString(): string {
  return formatDate(new Date());
}

export default function TimeTrackerPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Current month displayed in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  // Selected date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
  // All entries grouped by date
  const [entriesByDate, setEntriesByDate] = useState<EntriesByDate>({});
  // Whether data has been loaded
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

  // Refresh entries from API
  const refreshEntries = useCallback(async () => {
    try {
      const data = await fetchEntries();
      setEntriesByDate(data);
      setHydrated(true);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      setHydrated(true);
    }
  }, []);

  // Load entries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshEntries();
    } else {
      setEntriesByDate({});
      setHydrated(false);
    }
  }, [isAuthenticated, refreshEntries]);

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
  const handleConfirmDelete = async () => {
    if (deletingEntry) {
      try {
        await deleteEntryAPI(deletingEntry.id);
        await refreshEntries();
      } catch (err) {
        console.error("Failed to delete entry:", err);
      }
    }
    setDeleteDialogOpen(false);
    setDeletingEntry(null);
  };

  // Handler: submit task form
  const handleSubmitTask = async (data: TaskFormData) => {
    const minutes = parseTimeInput(data.spentTime);
    if (!minutes || minutes <= 0) return;

    try {
      if (editingEntry) {
        // Update existing entry
        await updateEntryAPI(editingEntry.id, {
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
          await createEntries(newEntries);
        } else {
          await createEntries([
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

      await refreshEntries();
    } catch (err) {
      console.error("Failed to save entry:", err);
    }
  };

  // Format minutes display
  const formatTotal = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Timer className="h-6 w-6 animate-pulse text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated (wrapped in Suspense for useSearchParams)
  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center gap-3">
            <Timer className="h-6 w-6 animate-pulse text-primary" />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </div>
      }>
        <AuthForm />
      </Suspense>
    );
  }

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
            <UserMenu />
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
          <span>Time Tracker &mdash; Data synced across all your devices</span>
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
