import { loadSession } from './auth';

// Communities are stored per account until the backend serves them.
function storageKey() {
  return `unfinished_communities:${loadSession()?.id || 'guest'}`;
}

export function loadCommunities() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCommunities(communities) {
  localStorage.setItem(storageKey(), JSON.stringify(communities));
}
