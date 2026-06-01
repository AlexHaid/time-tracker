"use client";

import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, AlertCircle } from "lucide-react";
import { WORK_TYPES, WORK_TYPE_COLORS } from "@/lib/time-tracker/types";
import type { TaskFormData, TimeEntryWithDate, WorkType } from "@/lib/time-tracker/types";
import { useTaskForm } from "./use-task-form";
import styles from "./TaskModal.module.css";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  editingEntry: TimeEntryWithDate | null;
  onSubmit: (data: TaskFormData) => void;
}

export default function TaskModal({
  open,
  onOpenChange,
  date,
  editingEntry,
  onSubmit,
}: TaskModalProps) {
  const {
    form,
    setForm,
    errors,
    timePreview,
    periodPreview,
    handleSubmit,
    handleCancel,
    isEditing,
  } = useTaskForm(date, editingEntry, onSubmit, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>{isEditing ? "Edit Task" : "Track Time"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your tracked time entry."
              : "Add a new time entry for your task."}
          </DialogDescription>
        </DialogHeader>

        <div className={styles.formBody}>
          {/* Task Name */}
          <div className={styles.formSection}>
            <Label htmlFor="task-name">
              Task name <span className={styles.required}>*</span>
            </Label>
            <Input
              id="task-name"
              placeholder="e.g. Code review, Sprint planning, Bug fix..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? styles.inputError : undefined}
              autoFocus
            />
            {errors.name && (
              <p className={styles.errorText}>{errors.name}</p>
            )}
          </div>

          {/* Work Type */}
          <div className={styles.formSection}>
            <Label htmlFor="work-type">Work type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value as WorkType })}
            >
              <SelectTrigger id="work-type" style={{ width: "100%" }}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className={styles.typeSelectItem}>
                      <span
                        className={styles.typeDot}
                        style={{ backgroundColor: WORK_TYPE_COLORS[type].dotColor }}
                      />
                      {WORK_TYPE_COLORS[type].label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Description */}
          <div className={styles.formSection}>
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Optional details about this task..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className={styles.textareaNoResize}
            />
          </div>

          {/* Task Date */}
          <div className={styles.formSection}>
            <Label htmlFor="task-date">Date</Label>
            <div className={styles.dateRow}>
              <CalendarDays style={{ height: "1rem", width: "1rem", color: "var(--muted-foreground)", flexShrink: 0 }} />
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
          <div className={styles.periodCheck}>
            <Checkbox
              id="period-check"
              checked={form.isPeriod}
              onCheckedChange={(checked) =>
                setForm({ ...form, isPeriod: checked === true, includeNonWorkingDays: false })
              }
              disabled={isEditing}
            />
            <div className={styles.periodLabelArea}>
              <Label htmlFor="period-check" className={styles.cursorLabel}>
                Track across a period
              </Label>
              <p className={styles.periodHint}>
                Add the same time entry to each day in the date range
              </p>
            </div>
          </div>

          {/* Period options */}
          {form.isPeriod && (
            <div className={styles.periodOptions}>
              {/* End date */}
              <div className={styles.formSection}>
                <Label htmlFor="period-end">
                  Period end date <span className={styles.required}>*</span>
                </Label>
                <Input
                  id="period-end"
                  type="date"
                  value={form.periodEndDate}
                  onChange={(e) => setForm({ ...form, periodEndDate: e.target.value })}
                  min={form.date}
                  className={errors.periodEndDate ? styles.inputError : undefined}
                  disabled={isEditing}
                />
                {errors.periodEndDate && (
                  <p className={styles.errorText}>{errors.periodEndDate}</p>
                )}
              </div>

              {/* Include non-working days */}
              <div className={styles.periodCheck}>
                <Checkbox
                  id="nonworking-check"
                  checked={form.includeNonWorkingDays}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, includeNonWorkingDays: checked === true })
                  }
                  disabled={isEditing}
                />
                <div className={styles.periodLabelArea}>
                  <Label htmlFor="nonworking-check" className={styles.cursorLabel}>
                    Include non-working days
                  </Label>
                  <p className={styles.periodHint}>
                    If unchecked, weekends (Sat &amp; Sun) will be skipped
                  </p>
                </div>
              </div>

              {/* Period preview */}
              {periodPreview && (
                <Alert className={styles.periodAlert}>
                  <AlertCircle style={{ height: "1rem", width: "1rem" }} />
                  <AlertDescription className={styles.periodAlertText}>
                    {periodPreview}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Separator />

          {/* Spent Time */}
          <div className={styles.formSection}>
            <Label htmlFor="spent-time">
              Spent time <span className={styles.required}>*</span>
            </Label>
            <div className={styles.dateRow}>
              <Input
                id="spent-time"
                placeholder='e.g. 30m, 1.5h, .5h, 2h'
                value={form.spentTime}
                onChange={(e) => setForm({ ...form, spentTime: e.target.value })}
                className={errors.spentTime ? styles.inputError : undefined}
              />
              {timePreview && (
                <span className={styles.timePreview}>
                  = {timePreview}
                </span>
              )}
            </div>
            {errors.spentTime && (
              <p className={styles.errorText}>{errors.spentTime}</p>
            )}
            <p className={styles.formatHint}>
              Formats: &quot;30m&quot; = 30 min, &quot;1.5h&quot; = 1h 30min, &quot;.5h&quot; = 30 min
            </p>
          </div>
        </div>

        <DialogFooter className={styles.footer}>
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
