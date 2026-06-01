"use client";

import { useMemo, useState } from "react";
import { parseTimeInput, formatMinutes, getDatesInRange } from "@/lib/time-tracker/time-parser";
import { DEFAULT_WORK_TYPE } from "@/lib/time-tracker/types";
import type { TaskFormData, TimeEntryWithDate, WorkType } from "@/lib/time-tracker/types";

const emptyForm: TaskFormData = {
  name: "",
  description: "",
  date: "",
  type: DEFAULT_WORK_TYPE,
  spentTime: "",
  isPeriod: false,
  periodEndDate: "",
  includeNonWorkingDays: false,
};

function getInitialForm(date: string, editingEntry: TimeEntryWithDate | null): TaskFormData {
  if (editingEntry) {
    return {
      name: editingEntry.name,
      description: editingEntry.description,
      date: editingEntry.date,
      type: editingEntry.type || DEFAULT_WORK_TYPE,
      spentTime: minutesToTimeString(editingEntry.spentMinutes),
      isPeriod: false,
      periodEndDate: "",
      includeNonWorkingDays: false,
    };
  }
  return {
    ...emptyForm,
    date,
  };
}

/**
 * Convert minutes back to a time input string.
 * e.g. 90 -> "1.5h", 30 -> "30m", 60 -> "1h"
 */
function minutesToTimeString(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h}h`;
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  // Try to express as decimal hours
  const h = minutes / 60;
  // Check if it's a clean decimal
  if (h === Math.round(h * 10) / 10) {
    return `${h}h`;
  }
  // Otherwise just show minutes
  return `${minutes}m`;
}

export function useTaskForm(
  date: string,
  editingEntry: TimeEntryWithDate | null,
  onSubmit: (data: TaskFormData) => void,
  onOpenChange: (open: boolean) => void,
) {
  const [form, setForm] = useState<TaskFormData>(() => getInitialForm(date, editingEntry));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived: time preview
  const timePreview = useMemo(() => {
    if (!form.spentTime.trim()) return "";
    const minutes = parseTimeInput(form.spentTime);
    if (minutes !== null && minutes > 0) {
      return formatMinutes(minutes);
    }
    return "";
  }, [form.spentTime]);

  // Derived: period preview
  const periodPreview = useMemo(() => {
    if (!form.isPeriod || !form.date || !form.periodEndDate) return "";
    const dates = getDatesInRange(form.date, form.periodEndDate, form.includeNonWorkingDays);
    if (dates.length === 0) return "No days in range";
    const minutes = parseTimeInput(form.spentTime);
    if (minutes !== null && minutes > 0) {
      return `${dates.length} day${dates.length !== 1 ? "s" : ""} \u00B7 ${formatMinutes(minutes * dates.length)} total`;
    }
    return `${dates.length} day${dates.length !== 1 ? "s" : ""}`;
  }, [form.isPeriod, form.date, form.periodEndDate, form.includeNonWorkingDays, form.spentTime]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Task name is required";
    }

    if (!form.spentTime.trim()) {
      newErrors.spentTime = "Spent time is required";
    } else {
      const minutes = parseTimeInput(form.spentTime);
      if (minutes === null || minutes <= 0) {
        newErrors.spentTime = 'Invalid time format. Use "30m", "1.5h", ".5h", etc.';
      }
    }

    if (form.isPeriod) {
      if (!form.periodEndDate) {
        newErrors.periodEndDate = "End date is required when period is enabled";
      } else if (form.periodEndDate < form.date) {
        newErrors.periodEndDate = "End date must be on or after the start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isEditing = editingEntry !== null;

  return {
    form,
    setForm,
    errors,
    timePreview,
    periodPreview,
    validate,
    handleSubmit,
    handleCancel,
    isEditing,
  };
}
