/** Local calendar date keys. Never use raw timestamps for day math. */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeyToUtcMs(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const diff = dateKeyToUtcMs(toKey) - dateKeyToUtcMs(fromKey);
  return Math.round(diff / 86_400_000);
}

export function addDays(key: string, count: number): string {
  const ms = dateKeyToUtcMs(key) + count * 86_400_000;
  const date = new Date(ms);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}
