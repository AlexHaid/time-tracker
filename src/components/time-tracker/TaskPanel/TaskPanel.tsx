"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMinutes } from "@/lib/time-tracker/time-parser";
import type { TimeEntryWithDate } from "@/lib/time-tracker/types";
import TaskItem from "./TaskItem";
import styles from "./TaskPanel.module.css";

interface TaskPanelProps {
  selectedDate: string | null;
  entries: TimeEntryWithDate[];
  onEdit: (entry: TimeEntryWithDate) => void;
  onDelete: (entry: TimeEntryWithDate) => void;
}

export default function TaskPanel({
  selectedDate,
  entries,
  onEdit,
  onDelete,
}: TaskPanelProps) {
  if (!selectedDate) {
    return (
      <Card className={styles.emptyCard}>
        <CardContent className={styles.emptyContent}>
          <div className={styles.emptyIcon}>
            <Clock style={{ height: "1.5rem", width: "1.5rem", color: "var(--muted-foreground)" }} />
          </div>
          <p className={styles.emptyText}>
            Select a day on the calendar to view tracked time
          </p>
        </CardContent>
      </Card>
    );
  }

  const dateObj = parseISO(selectedDate + "T00:00:00");
  const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy");
  const totalMinutes = entries.reduce((s, e) => s + e.spentMinutes, 0);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerRow}>
          <CardTitle className={styles.cardTitle}>{formattedDate}</CardTitle>
          {isWeekend && (
            <Badge variant="secondary" style={{ fontSize: "0.75rem" }}>
              Weekend
            </Badge>
          )}
        </div>
        <div className={styles.metaRow}>
          <Clock style={{ height: "0.875rem", width: "0.875rem" }} />
          <span>
            {entries.length} task{entries.length !== 1 ? "s" : ""} &middot;{" "}
            {formatMinutes(totalMinutes)}
          </span>
        </div>
      </CardHeader>
      <Separator />
      <CardContent style={{ flex: 1, padding: 0, overflow: "hidden" }}>
        {entries.length === 0 ? (
          <div className={styles.emptyEntries}>
            <div className={styles.emptyEntriesIcon}>
              <FileText style={{ height: "1.25rem", width: "1.25rem", color: "var(--muted-foreground)" }} />
            </div>
            <p className={styles.emptyEntriesText}>
              No tasks tracked on this day
            </p>
            <p className={styles.emptyEntriesHint}>
              Hover over the day cell and click the + button to add one
            </p>
          </div>
        ) : (
          <ScrollArea style={{ height: "100%", maxHeight: "calc(100vh - 360px)" }}>
            <div className={styles.taskList}>
              {entries.map((entry) => (
                <TaskItem
                  key={entry.id}
                  entry={entry}
                  onEdit={() => onEdit(entry)}
                  onDelete={() => onDelete(entry)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
