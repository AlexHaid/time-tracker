import { type TimeEntry, type EntriesByDate, type StorageData } from "./types";

const STORAGE_KEY = "time-tracker-data";
const CURRENT_VERSION = 2;

function getEmptyData(): StorageData {
  return {
    entries: {},
    version: CURRENT_VERSION,
  };
}

/**
 * Migrate v1 format (flat array) to v2 (grouped by date).
 * V1: { entries: TimeEntry[] & { date: string }, version: 1 }
 * V2: { entries: { "YYYY-MM-DD": TimeEntry[] }, version: 2 }
 */
function migrateV1toV2(data: Record<string, unknown>): StorageData {
  const oldEntries = data.entries as Array<TimeEntry & { date: string }>;
  const entries: EntriesByDate = {};

  for (const entry of oldEntries) {
    const dateKey = entry.date;
    const { date: _, ...entryWithoutDate } = entry;
    if (!entries[dateKey]) entries[dateKey] = [];
    entries[dateKey].push(entryWithoutDate);
  }

  return { entries, version: CURRENT_VERSION };
}

export function loadData(): StorageData {
  if (typeof window === "undefined") return getEmptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyData();
    const data = JSON.parse(raw) as Record<string, unknown>;

    // V1 migration: entries was a flat array
    if (data.version === 1 && Array.isArray(data.entries)) {
      const migrated = migrateV1toV2(data);
      saveData(migrated);
      return migrated;
    }

    // V2+: entries is a date-keyed map
    if (!data.entries || typeof data.entries !== "object" || Array.isArray(data.entries)) {
      return getEmptyData();
    }

    return data as unknown as StorageData;
  } catch {
    return getEmptyData();
  }
}

export function saveData(data: StorageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getEntriesByDate(): EntriesByDate {
  return loadData().entries;
}

/** Get all entries as a flat array (for compatibility) */
export function getAllEntries(): Array<TimeEntry & { date: string }> {
  const entries = loadData().entries;
  const result: Array<TimeEntry & { date: string }> = [];
  for (const [date, list] of Object.entries(entries)) {
    for (const entry of list) {
      result.push({ ...entry, date });
    }
  }
  return result;
}

/** Get entries for a specific date */
export function getEntriesForDate(date: string): TimeEntry[] {
  return loadData().entries[date] || [];
}

/** Add a single entry to a date */
export function addEntry(date: string, entry: TimeEntry): void {
  const data = loadData();
  if (!data.entries[date]) data.entries[date] = [];
  data.entries[date].push(entry);
  saveData(data);
}

/** Add multiple entries, potentially across different dates */
export function addEntries(newEntries: Array<{ date: string; entry: TimeEntry }>): void {
  const data = loadData();
  for (const { date, entry } of newEntries) {
    if (!data.entries[date]) data.entries[date] = [];
    data.entries[date].push(entry);
  }
  saveData(data);
}

/** Update an entry by ID. Returns the old date so caller can handle date changes. */
export function updateEntry(
  id: string,
  oldDate: string,
  updates: Partial<Omit<TimeEntry, "id">> & { date?: string }
): void {
  const data = loadData();
  const newDate = updates.date || oldDate;

  // If date changed, remove from old date bucket and add to new
  if (updates.date && updates.date !== oldDate) {
    const oldList = data.entries[oldDate] || [];
    const entryIndex = oldList.findIndex((e) => e.id === id);
    if (entryIndex === -1) return;

    const entry = { ...oldList[entryIndex] };
    // Remove date from updates since it's the key, not a field on TimeEntry
    const { date: _, ...restUpdates } = updates;
    const updatedEntry = { ...entry, ...restUpdates };

    // Remove from old date
    data.entries[oldDate] = oldList.filter((e) => e.id !== id);
    if (data.entries[oldDate].length === 0) delete data.entries[oldDate];

    // Add to new date
    if (!data.entries[newDate]) data.entries[newDate] = [];
    data.entries[newDate].push(updatedEntry);
  } else {
    // Same date, just update in place
    const list = data.entries[oldDate] || [];
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const { date: _, ...restUpdates } = updates;
      list[idx] = { ...list[idx], ...restUpdates };
    }
  }

  saveData(data);
}

/** Delete an entry by ID from a specific date */
export function deleteEntry(date: string, id: string): void {
  const data = loadData();
  const list = data.entries[date];
  if (!list) return;

  data.entries[date] = list.filter((e) => e.id !== id);
  if (data.entries[date].length === 0) delete data.entries[date];
  saveData(data);
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>;

    // Handle V1 import (flat array)
    if (data.version === 1 && Array.isArray(data.entries)) {
      const migrated = migrateV1toV2(data);
      saveData(migrated);
      return true;
    }

    // V2+ validation: entries must be a date-keyed object
    if (!data.entries || typeof data.entries !== "object" || Array.isArray(data.entries)) {
      return false;
    }

    const entries = data.entries as Record<string, unknown[]>;
    for (const [date, list] of Object.entries(entries)) {
      if (!Array.isArray(list)) return false;
      // Validate date key format (basic check)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      for (const entry of list) {
        const e = entry as Record<string, unknown>;
        if (!e.id || !e.name || typeof e.spentMinutes !== "number") {
          return false;
        }
      }
    }

    saveData(data as unknown as StorageData);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
