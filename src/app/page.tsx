"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { Clock, Timer } from "lucide-react";
import CalendarGrid from "@/components/time-tracker/CalendarGrid";
import TaskPanel from "@/components/time-tracker/TaskPanel";
import TaskModal from "@/components/time-tracker/TaskModal";
import DeleteConfirmDialog from "@/components/time-tracker/DeleteConfirmDialog";
import ImportExportBar from "@/components/time-tracker/ImportExportBar";
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
import styles from "./page.module.css";

export default function TimeTrackerPage() {
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
  const [editingEntry, setEditingEntry] = useState<(TimeEntry & { date: string }) | null>(null);
  // Modal key - increments each time modal opens to force fresh state
  const [modalKey, setModalKey] = useState(0);
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<(TimeEntry & { date: string }) | null>(null);

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

  // Format minutes display
  const formatTotal = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <Timer style={{ height: "1.25rem", width: "1.25rem", color: "var(--primary-foreground)" }} />
            </div>
            <div>
              <h1 className={styles.title}>Time Tracker</h1>
              <p className={styles.subtitle}>
                Track your time across days and periods
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            {/* Monthly total */}
            <div className={styles.monthTotal}>
              <Clock style={{ height: "1rem", width: "1rem" }} className={styles.mutedText} />
              <span className={styles.mutedText}>This month:</span>
              <span className={styles.monthTotalValue}>
                {mounted ? formatTotal(monthTotalMinutes) : "\u2013"}
              </span>
            </div>
            <ImportExportBar onDataChanged={refreshEntries} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Calendar - takes 2 columns on large screens */}
          <div className={styles.calendarCol}>
            <CalendarGrid
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onAddTask={handleAddTask}
              entriesByDate={entriesByDate}
              mounted={mounted}
            />
          </div>

          {/* Task Panel - 1 column */}
          <div className={styles.taskCol}>
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
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Time Tracker &mdash; Data stored locally in your browser</span>
          {selectedDate && selectedDateEntries.length > 0 && (
            <span>
              Selected day total: <strong className={styles.footerTotal}>{formatTotal(selectedDateTotalMinutes)}</strong>
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
