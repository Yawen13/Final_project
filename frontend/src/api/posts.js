// Data access for posts, likes, reposts, bookmarks and comments.
//
// The backend has these endpoints on the `backend-posts-api` branch (see
// router/post_router.js there):
//
//   POST   {base}/posts
//   GET    {base}/posts?userId=&limit=
//   GET    {base}/users/:username/posts
//   PATCH  {base}/posts/:id
//   DELETE {base}/posts/:id
//   POST   {base}/posts/:id/like
//   POST   {base}/posts/:id/repost
//   POST   {base}/posts/:id/bookmark
//   GET    {base}/users/:username/bookmarks
//   GET    {base}/posts/:id/comments
//   POST   {base}/posts/:id/comments
//
// Until that is deployed, the first feed request answers 404 and this module
// falls back to localStorage for the rest of the session, so the app keeps
// working on a backend that only serves auth/users.

import { hasBackend, request } from './client';

let apiAvailable = hasBackend;
let warnedAboutFallback = false;

const LEGACY_KEY = 'unfinished_posts';

function localKey(userId) {
  return `unfinished_posts:${userId || 'guest'}`;
}

function readLocal(userId) {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(userId, posts) {
  localStorage.setItem(localKey(userId), JSON.stringify(posts));
}

function updateLocal(userId, postId, updater) {
  const posts = readLocal(userId);
  let result = null;

  const next = posts.map((post) => {
    if (post.id !== postId) return post;
    result = updater(post);
    return result;
  });
  writeLocal(userId, next);
  return result;
}

// A 404 on the posts path means the backend predates this API: stay local.
function shouldUseLocal(error) {
  if (error && error.status === 404 && apiAvailable) {
    apiAvailable = false;
    if (!warnedAboutFallback) {
      warnedAboutFallback = true;
      console.warn(
        '[posts] The posts API is not deployed yet — using posts stored in this browser.',
      );
    }
    return true;
  }
  return !apiAvailable;
}

/** The feed, newest first. `userId` fills in likedByMe/bookmarked flags. */
export async function listPosts({ userId } = {}) {
  if (apiAvailable) {
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return await request(`/posts${query}`);
    } catch (error) {
      if (!shouldUseLocal(error)) throw error;
    }
  }

  // Drop the old shared key that held the demo posts
  localStorage.removeItem(LEGACY_KEY);
  return readLocal(userId);
}

/** Creates a post. Author fields are only used by the local fallback. */
export async function createPost({ userId, authorName, authorHandle, text, image, video }) {
  if (apiAvailable) {
    return request('/posts', {
      method: 'POST',
      body: JSON.stringify({ userId, text, image, video }),
    });
  }

  const post = {
    id: `local-${Date.now()}`,
    authorId: userId || 'local',
    authorName: authorName || 'You',
    authorHandle: authorHandle || '',
    text: text || '',
    image: image || '',
    video: video || '',
    createdAt: new Date().toISOString(),
    updatedAt: '',
    likedByMe: false,
    likeCount: 0,
    repostedByMe: false,
    repostCount: 0,
    bookmarked: false,
    viewCount: 0,
    comments: [],
  };
  writeLocal(userId, [post, ...readLocal(userId)]);
  return post;
}

/** Edits a post's text (author only). */
export async function updatePost(postId, { userId, text }) {
  if (apiAvailable) {
    return request(`/posts/${encodeURIComponent(postId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, text }),
    });
  }

  return updateLocal(userId, postId, (post) => ({ ...post, text }));
}

/** Deletes a post and its likes/bookmarks/comments (author only). */
export async function deletePost(postId, { userId }) {
  if (apiAvailable) {
    return request(`/posts/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  writeLocal(
    userId,
    readLocal(userId).filter((post) => post.id !== postId),
  );
  return null;
}

/** Toggles a like; resolves {liked, likeCount}. */
export async function toggleLike(postId, userId) {
  if (apiAvailable) {
    return request(`/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  let result = { liked: false, likeCount: 0 };
  updateLocal(userId, postId, (post) => {
    const likedByMe = !post.likedByMe;
    const likeCount = Math.max(0, post.likeCount + (likedByMe ? 1 : -1));
    result = { liked: likedByMe, likeCount };
    return { ...post, likedByMe, likeCount };
  });
  return result;
}

/** Toggles a repost; resolves {reposted, repostCount}. */
export async function toggleRepost(postId, userId) {
  if (apiAvailable) {
    return request(`/posts/${encodeURIComponent(postId)}/repost`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  let result = { reposted: false, repostCount: 0 };
  updateLocal(userId, postId, (post) => {
    const repostedByMe = !post.repostedByMe;
    const repostCount = Math.max(0, post.repostCount + (repostedByMe ? 1 : -1));
    result = { reposted: repostedByMe, repostCount };
    return { ...post, repostedByMe, repostCount };
  });
  return result;
}

/** Toggles a bookmark; resolves {bookmarked}. */
export async function toggleBookmark(postId, userId) {
  if (apiAvailable) {
    return request(`/posts/${encodeURIComponent(postId)}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  let result = { bookmarked: false };
  updateLocal(userId, postId, (post) => {
    const bookmarked = !post.bookmarked;
    result = { bookmarked };
    return { ...post, bookmarked };
  });
  return result;
}

/** Adds a comment; resolves the stored comment. */
export async function addComment(postId, { userId, authorName, text }) {
  if (apiAvailable) {
    return request(`/posts/${encodeURIComponent(postId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ userId, text }),
    });
  }

  const comment = {
    id: `local-${Date.now()}`,
    author: authorName || 'You',
    text,
    createdAt: new Date().toISOString(),
  };
  updateLocal(userId, postId, (post) => ({
    ...post,
    comments: [...(post.comments || []), comment],
  }));
  return comment;
}
