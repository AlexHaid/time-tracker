"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, AlertCircle } from "lucide-react";
import { parseTimeInput, formatMinutes, getDatesInRange } from "@/lib/time-tracker/time-parser";
import type { TaskFormData, TimeEntry } from "@/lib/time-tracker/types";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  editingEntry: TimeEntry | null;
  onSubmit: (data: TaskFormData) => void;
}

const emptyForm: TaskFormData = {
  name: "",
  description: "",
  date: "",
  spentTime: "",
  isPeriod: false,
  periodEndDate: "",
  includeNonWorkingDays: false,
};

function getInitialForm(date: string, editingEntry: TimeEntry | null): TaskFormData {
  if (editingEntry) {
    return {
      name: editingEntry.name,
      description: editingEntry.description,
      date: editingEntry.date,
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

export default function TaskModal({
  open,
  onOpenChange,
  date,
  editingEntry,
  onSubmit,
}: TaskModalProps) {
  // Since this component is remounted with a new key each time the modal opens,
  // we can safely initialize state from props here
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Track Time"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your tracked time entry."
              : "Add a new time entry for your task."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task-name">
              Task name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-name"
              placeholder="e.g. Code review, Meeting, Development..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Optional details about this task..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Task Date */}
          <div className="space-y-2">
            <Label htmlFor="task-date">Date</Label>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                id="task-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                disabled={isEditing}
              />
            </div>
          </div>

          <Separator />

          {/* Period checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="period-check"
              checked={form.isPeriod}
              onCheckedChange={(checked) =>
                setForm({ ...form, isPeriod: checked === true, includeNonWorkingDays: false })
              }
              disabled={isEditing}
            />
            <div className="space-y-1">
              <Label htmlFor="period-check" className="cursor-pointer">
                Track across a period
              </Label>
              <p className="text-xs text-muted-foreground">
                Add the same time entry to each day in the date range
              </p>
            </div>
          </div>

          {/* Period options */}
          {form.isPeriod && (
            <div className="space-y-3 pl-7 animate-in slide-in-from-top-1 duration-200">
              {/* End date */}
              <div className="space-y-2">
                <Label htmlFor="period-end">
                  Period end date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="period-end"
                  type="date"
                  value={form.periodEndDate}
                  onChange={(e) => setForm({ ...form, periodEndDate: e.target.value })}
                  min={form.date}
                  className={errors.periodEndDate ? "border-destructive" : ""}
                  disabled={isEditing}
                />
                {errors.periodEndDate && (
                  <p className="text-xs text-destructive">{errors.periodEndDate}</p>
                )}
              </div>

              {/* Include non-working days */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="nonworking-check"
                  checked={form.includeNonWorkingDays}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, includeNonWorkingDays: checked === true })
                  }
                  disabled={isEditing}
                />
                <div className="space-y-1">
                  <Label htmlFor="nonworking-check" className="cursor-pointer">
                    Include non-working days
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    If unchecked, weekends (Sat &amp; Sun) will be skipped
                  </p>
                </div>
              </div>

              {/* Period preview */}
              {periodPreview && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {periodPreview}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Separator />

          {/* Spent Time */}
          <div className="space-y-2">
            <Label htmlFor="spent-time">
              Spent time <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="spent-time"
                placeholder='e.g. 30m, 1.5h, .5h, 2h'
                value={form.spentTime}
                onChange={(e) => setForm({ ...form, spentTime: e.target.value })}
                className={errors.spentTime ? "border-destructive" : ""}
              />
              {timePreview && (
                <span className="text-sm text-primary font-medium whitespace-nowrap">
                  = {timePreview}
                </span>
              )}
            </div>
            {errors.spentTime && (
              <p className="text-xs text-destructive">{errors.spentTime}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Formats: &quot;30m&quot; = 30 min, &quot;1.5h&quot; = 1h 30min, &quot;.5h&quot; = 30 min
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Track Time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
