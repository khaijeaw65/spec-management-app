/** Client-oriented relative labels for activity timestamps (uses viewer clock). */
export function formatRelativeTime(iso: string, nowMs = Date.now()): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((nowMs - then) / 1000);
  if (diffSec < 45) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return diffMin <= 1 ? "1 min ago" : `${diffMin} min ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
  }
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) {
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  }
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) {
    return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;
  }
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
