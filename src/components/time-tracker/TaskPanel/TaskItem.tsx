"use client";

import React from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/time-tracker/time-parser";
import { WORK_TYPE_COLORS } from "@/lib/time-tracker/types";
import type { TimeEntryWithDate } from "@/lib/time-tracker/types";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
  entry: TimeEntryWithDate;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskItem({ entry, onEdit, onDelete }: TaskItemProps) {
  const typeInfo = WORK_TYPE_COLORS[entry.type || "development"];

  return (
    <div className={styles.taskItem}>
      <div className={styles.taskContent}>
        <div className={styles.taskNameRow}>
          <div
            className={styles.typeDot}
            style={{ backgroundColor: typeInfo.dotColor }}
          />
          <h4 className={styles.taskName}>{entry.name}</h4>
          <span
            className={styles.typeBadge}
            style={{
              backgroundColor: typeInfo.badgeBg,
              color: typeInfo.badgeText,
              borderColor: typeInfo.badgeBorder,
            }}
          >
            {typeInfo.label}
          </span>
        </div>
        {entry.description && (
          <p className={styles.taskDescription}>
            {entry.description}
          </p>
        )}
        <div className={styles.taskTimeRow}>
          <Clock style={{ height: "0.75rem", width: "0.75rem", color: "var(--muted-foreground)" }} />
          <span className={styles.taskTimeText} style={{ color: typeInfo.text }}>
            {formatMinutes(entry.spentMinutes)}
          </span>
        </div>
      </div>
      <div className={styles.taskActions}>
        <Button
          variant="ghost"
          size="icon"
          className={styles.actionBtn}
          onClick={onEdit}
          aria-label={`Edit task ${entry.name}`}
        >
          <Pencil style={{ height: "0.875rem", width: "0.875rem" }} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={styles.deleteBtn}
          onClick={onDelete}
          aria-label={`Delete task ${entry.name}`}
        >
          <Trash2 style={{ height: "0.875rem", width: "0.875rem" }} />
        </Button>
      </div>
    </div>
  );
}
