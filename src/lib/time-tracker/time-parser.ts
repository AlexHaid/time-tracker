/**
 * Parse time input string into minutes.
 * Supports formats:
 *  - "30m" -> 30 minutes
 *  - "1.5h" -> 90 minutes
 *  - ".5h" -> 30 minutes
 *  - "1h" -> 60 minutes
 *  - "1h30m" -> 90 minutes
 *  - "90" -> 90 minutes (plain number = minutes)
 * Returns null if invalid.
 */
export function parseTimeInput(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // Try "XhYm" format
  const hmMatch = trimmed.match(/^(\d*\.?\d+)?h(\d*\.?\d+)?m?$/);
  if (hmMatch) {
    const hours = hmMatch[1] ? parseFloat(hmMatch[1]) : 0;
    const mins = hmMatch[2] ? parseFloat(hmMatch[2]) : 0;
    if (isNaN(hours) || isNaN(mins)) return null;
    return Math.round(hours * 60 + mins);
  }

  // Try "Xm" format
  const mMatch = trimmed.match(/^(\d*\.?\d+)m$/);
  if (mMatch) {
    const mins = parseFloat(mMatch[1]);
    if (isNaN(mins)) return null;
    return Math.round(mins);
  }

  // Try "Xh" format
  const hMatch = trimmed.match(/^(\d*\.?\d+)h$/);
  if (hMatch) {
    const hours = parseFloat(hMatch[1]);
    if (isNaN(hours)) return null;
    return Math.round(hours * 60);
  }

  // Try plain number (minutes)
  const numMatch = trimmed.match(/^(\d+)$/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return null;
}

/**
 * Format minutes back to human-readable string.
 * e.g. 90 -> "1h 30m", 30 -> "30m", 60 -> "1h"
 */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Compact format for export — no space between hours and minutes.
 * e.g. 90 -> "1h30m", 30 -> "30m", 60 -> "1h"
 */
export function formatMinutesCompact(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get all dates in a range, optionally excluding weekends
 */
export function getDatesInRange(
    startDate: string,
    endDate: string,
    includeNonWorkingDays: boolean
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  if (end < start) return dates;

  const current = new Date(start);
  while (current <= end) {
    if (includeNonWorkingDays || !isWeekend(current)) {
      dates.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Format a Date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format minutes to a short display string for the calendar cell
 */
export function formatMinutesShort(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

/**
 * Format minutes for total display (e.g. header/footer totals).
 * Same logic as formatMinutes but with a space: "1h 30m"
 */
export function formatTotal(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
