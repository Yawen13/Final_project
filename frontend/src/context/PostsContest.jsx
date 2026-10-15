import React, { createContext, useContext, useEffect, useState } from 'react';

const PostsContext = createContext(null);
const STORAGE_KEY = 'unfinished_posts';

const SEED_POSTS = [
  {
    id: 1,
    authorId: 'mayachen',
    authorName: 'Maya Chen',
    authorHandle: '@mayachen',
    text: "Still figuring out the ending, but here's where it's going so far...",
    image: '',
    video: '',
    createdAt: '2026-10-11T10:00:00.000Z',
    likedByMe: false,
    likeCount: 7,
    repostedByMe: false,
    repostCount: 2,
    bookmarked: false,
    viewCount: 1300,
    comments: [],
  },
  {
    id: 2,
    authorId: 'danielortiz',
    authorName: 'Daniel Ortiz',
    authorHandle: '@danielortiz',
    text: 'Left this one open on purpose. Curious what you all think happens next.',
    image: '',
    video: '',
    createdAt: '2026-10-11T05:00:00.000Z',
    likedByMe: false,
    likeCount: 3,
    repostedByMe: false,
    repostCount: 0,
    bookmarked: false,
    viewCount: 410,
    comments: [],
  },
];

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(loadPosts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  function addPost({ authorId, authorName, authorHandle, text, image, video }) {
    const newPost = {
      id: Date.now(),
      authorId,
      authorName,
      authorHandle,
      text: text || '',
      image: image || '',
      video: video || '',
      createdAt: new Date().toISOString(),
      likedByMe: false,
      likeCount: 0,
      repostedByMe: false,
      repostCount: 0,
      bookmarked: false,
      viewCount: 0,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  }

  function deletePost(id) {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }

  function editPost(id, text) {
    setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, text } : post)));
  }

  function toggleLike(id) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, likedByMe: !post.likedByMe, likeCount: post.likeCount + (post.likedByMe ? -1 : 1) }
          : post
      )
    );
  }

  function toggleRepost(id) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, repostedByMe: !post.repostedByMe, repostCount: post.repostCount + (post.repostedByMe ? -1 : 1) }
          : post
      )
    );
  }

  function toggleBookmark(id) {
    setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, bookmarked: !post.bookmarked } : post)));
  }

  function addComment(id, text) {
    if (!text.trim()) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, comments: [...post.comments, { id: Date.now(), author: 'You', text: text.trim() }] }
          : post
      )
    );
  }

  const value = {
    posts,
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

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used inside <PostsProvider>');
  return ctx;
}