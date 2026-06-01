/** Work type constants and helpers */
export const WORK_TYPES = ["development", "meeting"] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const DEFAULT_WORK_TYPE: WorkType = "development";

/** Color mapping for each work type — stores actual CSS color values for inline styles */
export const WORK_TYPE_COLORS: Record<WorkType, {
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  text: string;
  label: string;
}> = {
  development: {
    dotColor: "#10b981",     /* emerald-500 */
    badgeBg: "#d1fae5",      /* emerald-100 */
    badgeText: "#065f46",    /* emerald-800 */
    badgeBorder: "#a7f3d0",  /* emerald-200 */
    text: "#047857",         /* emerald-700 */
    label: "Development",
  },
  meeting: {
    dotColor: "#f59e0b",     /* amber-500 */
    badgeBg: "#fef3c7",      /* amber-100 */
    badgeText: "#92400e",    /* amber-800 */
    badgeBorder: "#fde68a",  /* amber-200 */
    text: "#b45309",         /* amber-700 */
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

/** TimeEntry augmented with date context (date comes from the key in EntriesByDate) */
export type TimeEntryWithDate = TimeEntry & { date: string };

export interface StorageData {
  entries: EntriesByDate;
  version: number;
}
