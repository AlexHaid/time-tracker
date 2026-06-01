import { type TimeEntry, type StorageData } from "./types";

const STORAGE_KEY = "time-tracker-data";
const CURRENT_VERSION = 1;

function getEmptyData(): StorageData {
  return {
    entries: [],
    version: CURRENT_VERSION,
  };
}

export function loadData(): StorageData {
  if (typeof window === "undefined") return getEmptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyData();
    const data = JSON.parse(raw) as StorageData;
    if (!data.entries || !Array.isArray(data.entries)) return getEmptyData();
    return data;
  } catch {
    return getEmptyData();
  }
}

export function saveData(data: StorageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getEntries(): TimeEntry[] {
  return loadData().entries;
}

export function addEntry(entry: TimeEntry): void {
  const data = loadData();
  data.entries.push(entry);
  saveData(data);
}

export function addEntries(entries: TimeEntry[]): void {
  const data = loadData();
  data.entries.push(...entries);
  saveData(data);
}

export function updateEntry(id: string, updates: Partial<Omit<TimeEntry, "id">>): void {
  const data = loadData();
  const idx = data.entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    data.entries[idx] = { ...data.entries[idx], ...updates };
    saveData(data);
  }
}

export function deleteEntry(id: string): void {
  const data = loadData();
  data.entries = data.entries.filter((e) => e.id !== id);
  saveData(data);
}

export function getEntriesForDate(date: string): TimeEntry[] {
  return loadData().entries.filter((e) => e.date === date);
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as StorageData;
    if (!data.entries || !Array.isArray(data.entries)) return false;
    // Validate entries
    for (const entry of data.entries) {
      if (!entry.id || !entry.name || !entry.date || typeof entry.spentMinutes !== "number") {
        return false;
      }
    }
    saveData(data);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
