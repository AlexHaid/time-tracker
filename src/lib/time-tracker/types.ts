export interface TimeEntry {
  id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  spentMinutes: number;
}

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
  entries: TimeEntry[];
  version: number;
}
