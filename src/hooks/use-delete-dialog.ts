"use client";

import { useState } from "react";
import { deleteEntryAPI } from "@/lib/time-tracker/api";
import type { TimeEntryWithDate } from "@/lib/time-tracker/types";

/**
 * Manages delete confirmation dialog state.
 * Receives `refreshEntries` from the calendar state to sync after deletion.
 */
export function useDeleteDialog(refreshEntries: () => void) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntryWithDate | null>(null);

  // Handler: delete entry from task panel — opens confirmation
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

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingEntry,
    handleDeleteEntry,
    handleConfirmDelete,
  };
}
