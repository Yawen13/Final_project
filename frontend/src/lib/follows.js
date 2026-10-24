import { useSyncExternalStore } from 'react';

// Who this account has followed, remembered on this device. The backend stores
// the actual relationship (and the follower counts); this only lets the
// Follow / Following button come back in the right state on the next visit.
const KEY_PREFIX = 'unfinished.following:';
const listeners = new Set();

function keyFor(userId) {
  return `${KEY_PREFIX}${userId}`;
}

function read(userId) {
  if (!userId) return new Set();

  try {
    const raw = localStorage.getItem(keyFor(userId));
    const list = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(list) ? list.map((name) => String(name).toLowerCase()) : [],
    );
  } catch {
    return new Set();
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Records the result of a follow/unfollow for this account on this device. */
export function rememberFollowing(userId, username, following) {
  if (!userId || !username) return;

  const names = read(userId);
  const name = username.toLowerCase();

  if (following) names.add(name);
  else names.delete(name);

  try {
    localStorage.setItem(keyFor(userId), JSON.stringify([...names]));
  } catch {
    // Private mode or full storage — the follow itself still happened
  }

  listeners.forEach((listener) => listener());
}

/** Whether the signed-in account follows `username` according to this device. */
export function useFollowing(userId, username) {
  return useSyncExternalStore(subscribe, () => {
    if (!userId || !username) return false;
    return read(userId).has(String(username).toLowerCase());
  });
}
