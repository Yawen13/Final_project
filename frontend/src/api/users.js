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

/** Follows a user on the backend; the follower count updates server-side. */
export async function followUser(username, followerId) {
  if (!hasBackend || !username) {
    throw new Error('No backend configured');
  }

  return request(`/users/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
    body: JSON.stringify({ followerId }),
  });
}

export async function unfollowUser(username, followerId) {
  if (!hasBackend || !username) {
    throw new Error('No backend configured');
  }

  return request(`/users/${encodeURIComponent(username)}/follow`, {
    method: 'DELETE',
    body: JSON.stringify({ followerId }),
  });
}

/** Finds people by username or display name, for starting a conversation. */
export async function searchUsers(query, { excludeId = '' } = {}) {
  const text = query.trim();
  if (!hasBackend || !text) return [];

  const params = new URLSearchParams({ q: text });
  if (excludeId) params.set('excludeId', excludeId);

  try {
    return await request(`/users?${params.toString()}`);
  } catch (error) {
    // An older backend without the search route
    if (error.status === 404) return [];
    throw error;
  }
}
