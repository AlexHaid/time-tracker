export interface TimeEntry {
  id: string;
  name: string;
  description: string;
  spentMinutes: number;
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
  spentTime: string; // raw input like "30m", "1.5h", ".5h"
  isPeriod: boolean;
  periodEndDate: string; // YYYY-MM-DD
  includeNonWorkingDays: boolean;
}

export interface StorageData {
  entries: EntriesByDate;
  version: number;
}
