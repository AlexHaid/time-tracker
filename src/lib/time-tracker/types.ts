/** Work type constants and helpers */
export const WORK_TYPES = ["development", "meeting"] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const DEFAULT_WORK_TYPE: WorkType = "development";

/** Color mapping for each work type */
export const WORK_TYPE_COLORS: Record<WorkType, { dot: string; badge: string; badgeText: string; label: string }> = {
  development: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    badgeText: "text-emerald-700",
    label: "Development",
  },
  meeting: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    badgeText: "text-amber-700",
    label: "Meeting",
  },
};

export function getWorkTypeLabel(type: WorkType): string {
  return WORK_TYPE_COLORS[type]?.label ?? type;
}

export interface TimeEntry {
  id: string;
  name: string;
  description: string;
  spentMinutes: number;
  type: WorkType;
}

/**
 * Date-keyed entries map.
 * Key is YYYY-MM-DD, value is array of tasks for that date.
 */
export type EntriesByDate = Record<string, TimeEntry[]>;

export interface TaskFormData {
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: WorkType;
  spentTime: string; // raw input like "30m", "1.5h", ".5h"
  isPeriod: boolean;
  periodEndDate: string; // YYYY-MM-DD
  includeNonWorkingDays: boolean;
}

export interface StorageData {
  entries: EntriesByDate;
  version: number;
}
