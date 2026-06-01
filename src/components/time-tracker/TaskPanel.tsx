"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/time-tracker/time-parser";
import { WORK_TYPE_COLORS } from "@/lib/time-tracker/types";
import type { TimeEntry, WorkType } from "@/lib/time-tracker/types";

/** TimeEntry augmented with date context (date comes from the key in EntriesByDate) */
export type TimeEntryWithDate = TimeEntry & { date: string };

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
      <Card className="h-full flex items-center justify-center border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{formattedDate}</CardTitle>
          {isWeekend && (
            <Badge variant="secondary" className="text-xs">
              Weekend
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {entries.length} task{entries.length !== 1 ? "s" : ""} &middot;{" "}
            {formatMinutes(totalMinutes)}
          </span>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0 overflow-hidden">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No tasks tracked on this day
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hover over the day cell and click the + button to add one
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[calc(100vh-360px)]">
            <div className="p-3 space-y-2">
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

interface TaskItemProps {
  entry: TimeEntryWithDate;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskItem({ entry, onEdit, onDelete }: TaskItemProps) {
  const typeInfo = WORK_TYPE_COLORS[entry.type || "development"];

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-3",
        "bg-card hover:bg-accent/30 transition-colors"
      )}
    >
      {/* Type color indicator */}
      <div className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", typeInfo.dot)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium truncate">{entry.name}</h4>
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", typeInfo.badge)}
          >
            {typeInfo.label}
          </Badge>
        </div>
        {entry.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {entry.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className={cn("text-xs font-medium", typeInfo.badgeText)}>
            {formatMinutes(entry.spentMinutes)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
          aria-label={`Edit task ${entry.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={`Delete task ${entry.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
