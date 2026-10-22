/** Milliseconds for sorting; 0 when the value is missing or invalid. */
export function timeValue(iso) {
  const time = Date.parse(iso);
  return Number.isFinite(time) ? time : 0;
}

/** "now" / "5m" / "2h" / "3d" / a date, from an ISO timestamp. */
export function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';

  const minutes = Math.floor(Math.max(0, Date.now() - then) / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(iso).toLocaleDateString();
}
