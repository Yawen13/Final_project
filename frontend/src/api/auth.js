// Accounts and the signed-in session.
//
//   POST {base}/auth/login    { username, password }
//     → { userId, username, displayName, bio, createdAt }
//   POST {base}/auth/register { username, displayName, email, password, bio? }
//     → { message, userId, username, displayName }
//
// The backend issues no token, so the "session" is just the user record it
// returns, kept in localStorage and read back by the navbar. Anything that
// needs to know who is acting (following someone, for instance) passes
// session.id as the user id.

import { hasBackend, request } from './client';

const SESSION_KEY = 'unfinished.session';
const LEGACY_KEY = 'userToken'; // the old placeholder key, cleared on sign out

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The API answers with userId/createdAt and drops fields it does not need to
// echo; the session keeps a stable shape for the rest of the app.
function toSession(user) {
  const username = user.username ?? '';

  return {
    id: user.userId ?? user.id ?? '',
    username,
    displayName: user.displayName ?? username,
    bio: user.bio ?? '',
  };
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

export async function login(username, password) {
  if (!hasBackend) {
    // Placeholder mode — no server configured, so any details open the app.
    // Same trade-off as src/api/messages.js: the UI has to run without a
    // backend, and .env.local is one line away from the real thing.
    await delay(320);
    return { id: `demo-${username}`, username, displayName: username, bio: '' };
  }

  const user = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  return toSession(user);
}

export async function register({ username, displayName, email, password, bio = '' }) {
  if (!hasBackend) {
    await delay(320);
    return { id: `demo-${username}`, username, displayName, bio };
  }

  const created = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, displayName, email, password, bio }),
  });

  return toSession(created);
}
