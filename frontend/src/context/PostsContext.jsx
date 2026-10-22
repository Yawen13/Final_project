import { useCallback, useEffect, useRef, useState } from 'react';
import { PostsContext } from './postsStore';
import * as postsApi from '../api/posts';

/**
 * Owns the feed. Reads and writes go through src/api/posts.js, which talks to
 * the backend and falls back to this browser's localStorage when the posts
 * API is not deployed yet.
 */
export function PostsProvider({ ownerId, ownerName = '', children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read by countNewPosts, which runs from a timer and must see the latest list
  const postsRef = useRef(posts);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    let cancelled = false;

    postsApi
      .listPosts({ userId: ownerId })
      .then((rows) => {
        if (cancelled) return;
        setPosts(rows);
        setLoading(false);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError.message || 'Could not load the feed.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  /** Reloads the feed and returns the fresh rows. */
  const refresh = useCallback(async () => {
    const rows = await postsApi.listPosts({ userId: ownerId });
    setPosts(rows);
    setError('');
    return rows;
  }, [ownerId]);

  /** How many posts on the server are not in the feed yet. */
  const countNewPosts = useCallback(async () => {
    const rows = await postsApi.listPosts({ userId: ownerId });
    const known = new Set(postsRef.current.map((post) => String(post.id)));
    return rows.filter((post) => !known.has(String(post.id))).length;
  }, [ownerId]);


  async function addPost(input) {
    try {
      const created = await postsApi.createPost({ userId: ownerId, ...input });
      setPosts((prev) => [created, ...prev]);
      return created;
    } catch (createError) {
      console.error('[posts] Could not publish the post', createError);
      return null;
    }
  }

  async function deletePost(postId) {
    try {
      await postsApi.deletePost(postId, { userId: ownerId });
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (deleteError) {
      console.error('[posts] Could not delete the post', deleteError);
    }
  }

  async function editPost(postId, text) {
    try {
      await postsApi.updatePost(postId, { userId: ownerId, text });
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, text } : post)));
    } catch (editError) {
      console.error('[posts] Could not edit the post', editError);
    }
  }

  async function toggleLike(postId) {
    try {
      const { liked, likeCount } = await postsApi.toggleLike(postId, ownerId);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likedByMe: liked, likeCount } : post)),
      );
    } catch (likeError) {
      console.error('[posts] Could not update the like', likeError);
    }
  }

  async function toggleRepost(postId) {
    try {
      const { reposted, repostCount } = await postsApi.toggleRepost(postId, ownerId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, repostedByMe: reposted, repostCount } : post,
        ),
      );
    } catch (repostError) {
      console.error('[posts] Could not update the repost', repostError);
    }
  }

  async function toggleBookmark(postId) {
    try {
      const { bookmarked } = await postsApi.toggleBookmark(postId, ownerId);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, bookmarked } : post)),
      );
    } catch (bookmarkError) {
      console.error('[posts] Could not update the bookmark', bookmarkError);
    }
  }

  async function addComment(postId, text) {
    const body = text.trim();
    if (!body) return;

    try {
      const comment = await postsApi.addComment(postId, {
        userId: ownerId,
        authorName: ownerName,
        text: body,
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: [...(post.comments || []), comment] } : post,
        ),
      );
    } catch (commentError) {
      console.error('[posts] Could not add the comment', commentError);
    }
  }

  const value = {
    posts,
    loading,
    error,
    refresh,
    countNewPosts,
    addPost,
    deletePost,
    editPost,
    toggleLike,
    toggleRepost,
    toggleBookmark,
    addComment,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}
