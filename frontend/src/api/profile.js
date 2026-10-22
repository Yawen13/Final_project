// Local overrides for the fields the edit-profile form can change.
//
// The backend accepts registrations and avatar uploads but has no endpoint for
// updating display name, bio, location, or status yet. Until it does, edits are
// kept per account in localStorage so a signed-in user sees their own values
// instead of the demo profile the app used to ship with.

const KEY_PREFIX = 'unfinished_profile:';

function keyFor(userId) {
  return `${KEY_PREFIX}${userId}`;
}

export function loadProfileOverride(userId) {
  if (!userId) return null;

  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfileOverride(userId, profile) {
  if (!userId) return;

  const { name = '', bio = '', location = '', status = '', avatar = '' } = profile;
  localStorage.setItem(keyFor(userId), JSON.stringify({ name, bio, location, status, avatar }));
}

// Called once the backend accepted the update, so the stale local copy does
// not shadow the server values.
export function clearProfileOverride(userId) {
  if (!userId) return;
  localStorage.removeItem(keyFor(userId));
}
