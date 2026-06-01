import type { EntriesByDate, WorkType } from "./types";

/** Fetch all entries from the backend, optionally filtered by month */
export async function fetchEntries(month?: string): Promise<EntriesByDate> {
  const params = month ? `?month=${month}` : "";
  const res = await fetch(`/api/entries${params}`);
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch entries");
  }
  const data = await res.json();
  return data.entries as EntriesByDate;
}

/** Create one or more entries */
export async function createEntries(
  entries: Array<{
    name: string;
    description: string;
    date: string;
    spentMinutes: number;
    type: WorkType;
  }>
): Promise<void> {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to create entries");
  }
}

/** Update an entry */
export async function updateEntryAPI(
  id: string,
  updates: {
    name?: string;
    description?: string;
    date?: string;
    spentMinutes?: number;
    type?: WorkType;
  }
): Promise<void> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to update entry");
  }
}

/** Delete an entry */
export async function deleteEntryAPI(id: string): Promise<void> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to delete entry");
  }
}

/** Export all entries as JSON string */
export async function exportEntries(): Promise<string> {
  const res = await fetch("/api/entries/export");
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to export entries");
  }
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

/** Import entries from JSON string */
export async function importEntries(jsonString: string): Promise<number> {
  const data = JSON.parse(jsonString);
  const res = await fetch("/api/entries/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to import entries");
  }
  const result = await res.json();
  return result.imported;
}

/** Clear all entries */
export async function clearAllEntries(): Promise<number> {
  const res = await fetch("/api/entries/clear", {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to clear entries");
  }
  const result = await res.json();
  return result.deleted;
}
