/**
 * Client-side data layer using localStorage.
 * All operations are synchronous and instant.
 * Import/export works with the same JSON format as before.
 */
import type { EntriesByDate, WorkType } from "./types";
import {
  loadData,
  saveData,
  addEntries,
  updateEntry,
  deleteEntry,
  generateId,
  exportData,
  importData,
} from "./storage";

/** Fetch all entries from localStorage */
export function fetchEntries(): EntriesByDate {
  return loadData().entries;
}

/** Create one or more entries */
export function createEntries(
  entries: Array<{
    name: string;
    description: string;
    date: string;
    spentMinutes: number;
    type: WorkType;
  }>
): void {
  const wrapped = entries.map((e) => ({
    date: e.date,
    entry: {
      id: generateId(),
      name: e.name,
      description: e.description,
      spentMinutes: e.spentMinutes,
      type: e.type,
    },
  }));
  addEntries(wrapped);
}

/** Update an entry */
export function updateEntryAPI(
  id: string,
  oldDate: string,
  updates: {
    name?: string;
    description?: string;
    date?: string;
    spentMinutes?: number;
    type?: WorkType;
  }
): void {
  updateEntry(id, oldDate, updates);
}

/** Delete an entry */
export function deleteEntryAPI(id: string, date: string): void {
  deleteEntry(date, id);
}

/** Export all entries as JSON string */
export function exportEntries(): string {
  return exportData();
}

/** Import entries from JSON string. Returns number of entries imported. */
export function importEntries(jsonString: string): number {
  const before = loadData().entries;
  const beforeCount = Object.values(before).reduce((s, l) => s + l.length, 0);

  const success = importData(jsonString);
  if (!success) throw new Error("Invalid import file format");

  const after = loadData().entries;
  const afterCount = Object.values(after).reduce((s, l) => s + l.length, 0);

  return afterCount - beforeCount;
}

/** Clear all entries. Returns number of entries deleted. */
export function clearAllEntries(): number {
  const data = loadData();
  const count = Object.values(data.entries).reduce((s, l) => s + l.length, 0);
  saveData({ entries: {}, version: data.version });
  return count;
}
