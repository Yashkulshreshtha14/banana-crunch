const windows = new Map<string, { start: number; count: number }>();
export function rateLimit(key: string, max = 12, windowMs = 60_000) {
  const now = Date.now(), item = windows.get(key);
  if (!item || now - item.start >= windowMs) { windows.set(key, { start: now, count: 1 }); return true; }
  item.count += 1;
  return item.count <= max;
}
