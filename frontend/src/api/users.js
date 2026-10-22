// Account details beyond what login returns: follower counts and the profile
// fields the edit form writes. Backed by GET/PATCH /users/:username.

import { hasBackend, request } from './client';

export async function getUser(username) {
  if (!hasBackend || !username) return null;

  try {
    return await request(`/users/${encodeURIComponent(username)}`);
  } catch (error) {
    // An unknown username is not an error for display purposes
    if (error.status === 404) return null;
    throw error;
  }
}

export async function updateUser(username, { userId, displayName, bio, location, status, profileImageUrl }) {
  if (!hasBackend || !username) {
    throw new Error('No backend configured');
  }

  return request(`/users/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    body: JSON.stringify({ userId, displayName, bio, location, status, profileImageUrl }),
  });
}
