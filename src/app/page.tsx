"use client";

import React from "react";
import { useTimeTracker } from "@/hooks/use-time-tracker";
import CalendarGrid from "@/components/time-tracker/CalendarGrid/CalendarGrid";
import TaskPanel from "@/components/time-tracker/TaskPanel/TaskPanel";
import TaskModal from "@/components/time-tracker/TaskModal/TaskModal";
import DeleteConfirmDialog from "@/components/time-tracker/DeleteConfirmDialog/DeleteConfirmDialog";
import AppHeader from "@/components/time-tracker/AppHeader/AppHeader";
import AppFooter from "@/components/time-tracker/AppFooter/AppFooter";
import styles from "./page.module.css";

export default function TimeTrackerPage() {
  const {
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
  } = useTimeTracker();

  return (
    <div className={styles.container}>
      {/* Header */}
      <AppHeader
        mounted={mounted}
        monthTotalMinutes={monthTotalMinutes}
        onDataChanged={refreshEntries}
      />

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
      <AppFooter
        selectedDate={selectedDate}
        selectedDateEntries={selectedDateEntries}
        selectedDateTotalMinutes={selectedDateTotalMinutes}
      />

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
