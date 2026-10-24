import { useEffect, useSyncExternalStore } from 'react';
import { getUser } from '../api/users';

// Posts carry the author's name and handle but not their avatar, so the avatar
// is looked up from GET /users/:username. A feed usually repeats the same few
// authors, so resolved avatars are cached for the life of the page.
const cache = new Map(); // username -> avatar URL ('' when there is none)
const inFlight = new Map(); // username -> Promise
const listeners = new Set();

/** "@name" (the post handle) -> "name" (the API username). */
export function usernameFromHandle(handle) {
  return String(handle || '').replace(/^@/, '');
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function store(username, avatar) {
  cache.set(username, avatar);
  listeners.forEach((listener) => listener());
}

function load(username) {
  if (cache.has(username) || inFlight.has(username)) return;

  inFlight.set(
    username,
    getUser(username)
      .then((user) => user?.profileImageUrl || '')
      .catch(() => '')
      .then((avatar) => {
        inFlight.delete(username);
        store(username, avatar);
      }),
  );
}

/** Resolves a post author's avatar; '' renders the initials fallback. */
export function useAvatar(handle) {
  const username = usernameFromHandle(handle);

  const avatar = useSyncExternalStore(subscribe, () =>
    username ? cache.get(username) || '' : '',
  );

  useEffect(() => {
    if (username) load(username);
  }, [username]);

  return avatar;
}
