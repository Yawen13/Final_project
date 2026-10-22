const express = require('express');
const { FieldValue } = require('firebase-admin/firestore');
const { db } = require('../db');

const router = express.Router();

// Firestore allows at most 30 values in an `in` filter
const IN_CHUNK = 30;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function clampLimit(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(value), MAX_LIMIT);
}

function chunks(list, size) {
  const result = [];
  for (let i = 0; i < list.length; i += size) result.push(list.slice(i, i + size));
  return result;
}

function toIso(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function toPlain(doc) {
  return { id: doc.id, ...doc.data() };
}

function newestFirst(a, b) {
  return toIso(b.created_at).localeCompare(toIso(a.created_at));
}

// The JSON shape the frontend expects — see src/api/posts.js
function formatPost(post, extra = {}) {
  return {
    id: post.id,
    authorId: post.author_id || '',
    authorName: post.author_display_name || post.author_username || '',
    authorHandle: post.author_username ? `@${post.author_username}` : '',
    text: post.text || '',
    image: post.image || '',
    video: post.video || '',
    createdAt: toIso(post.created_at),
    updatedAt: toIso(post.updated_at),
    likedByMe: Boolean(extra.likedByMe),
    likeCount: post.like_count || 0,
    repostedByMe: Boolean(extra.repostedByMe),
    repostCount: post.repost_count || 0,
    bookmarked: Boolean(extra.bookmarked),
    viewCount: post.view_count || 0,
    comments: extra.comments || [],
  };
}

async function findUserById(userId) {
  if (!userId) return null;
  const snapshot = await db.collection('users').doc(userId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

async function findUserByUsername(username) {
  const snapshot = await db.collection('users').where('username', '==', username).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Which of these posts the viewer has liked / reposted / bookmarked.
// Queries only on user_id (single-field index) and filters ids here, so no
// composite index has to be created in the Firebase console.
async function relationSet(collectionName, viewerId, postIds) {
  const found = new Set();
  if (!viewerId || postIds.length === 0) return found;

  const wanted = new Set(postIds);
  const snapshot = await db.collection(collectionName).where('user_id', '==', viewerId).get();
  snapshot.forEach((doc) => {
    const postId = doc.data().post_id;
    if (wanted.has(postId)) found.add(postId);
  });

  return found;
}

// Comments grouped by post id, oldest first (sorted here so no composite
// index is needed for `post_id == ... order by created_at`)
async function commentsFor(postIds) {
  const byPost = {};
  for (const chunk of chunks(postIds, IN_CHUNK)) {
    const snapshot = await db.collection('comments').where('post_id', 'in', chunk).get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const entry = {
        id: doc.id,
        author: data.author_name || '',
        text: data.text || '',
        createdAt: toIso(data.created_at),
      };
      (byPost[data.post_id] || (byPost[data.post_id] = [])).push(entry);
    });
  }

  Object.values(byPost).forEach((entries) =>
    entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  );

  return byPost;
}

// Adds likedByMe / repostedByMe / bookmarked / comments to a list of posts
async function decorate(posts, viewerId) {
  const ids = posts.map((post) => post.id);
  const [liked, reposted, bookmarked, comments] = await Promise.all([
    relationSet('likes', viewerId, ids),
    relationSet('reposts', viewerId, ids),
    relationSet('bookmarks', viewerId, ids),
    commentsFor(ids),
  ]);

  return posts.map((post) =>
    formatPost(post, {
      likedByMe: liked.has(post.id),
      repostedByMe: reposted.has(post.id),
      bookmarked: bookmarked.has(post.id),
      comments: comments[post.id] || [],
    }),
  );
}

// One relation doc per (post, user), with a deterministic id so the toggle can
// run in a transaction without a query.
async function toggleRelation({ postId, userId, collectionName, countField }) {
  const postRef = db.collection('posts').doc(postId);
  const relationRef = db.collection(collectionName).doc(`${postId}_${userId}`);

  return db.runTransaction(async (transaction) => {
    const postSnapshot = await transaction.get(postRef);
    if (!postSnapshot.exists) {
      const error = new Error('Post not found');
      error.status = 404;
      throw error;
    }

    const relationSnapshot = await transaction.get(relationRef);
    const active = relationSnapshot.exists;
    const currentCount = postSnapshot.data()[countField] || 0;
    const nextCount = Math.max(0, currentCount + (active ? -1 : 1));

    if (active) {
      transaction.delete(relationRef);
    } else {
      transaction.set(relationRef, {
        post_id: postId,
        user_id: userId,
        created_at: new Date(),
      });
    }
    transaction.update(postRef, { [countField]: nextCount });

    return { active: !active, count: nextCount };
  });
}

// 1. Create a post
router.post('/posts', async (req, res) => {
  const { userId, text = '', image = '', video = '' } = req.body || {};

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }
  if (!String(text).trim() && !image && !video) {
    return res.status(400).json({ message: 'Post cannot be empty' });
  }
  // Firestore documents are capped at 1 MB, so keep the Base64 image below it
  if (String(image).length > 900000 || String(video).length > 900000) {
    return res.status(413).json({ message: 'That image is too large. Please choose a smaller one.' });
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = {
      author_id: user.id,
      author_username: user.username,
      author_display_name: user.display_name || user.username,
      text: String(text).trim(),
      image: image || '',
      video: video || '',
      created_at: new Date(),
      updated_at: null,
      like_count: 0,
      repost_count: 0,
      bookmark_count: 0,
      comment_count: 0,
      view_count: 0,
    };

    const ref = await db.collection('posts').add(post);
    res.status(201).json(formatPost({ id: ref.id, ...post }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. The feed, newest first. Pass ?userId= to get liked/bookmarked flags.
router.get('/posts', async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const viewerId = req.query.userId || '';

  try {
    const snapshot = await db
      .collection('posts')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    const posts = snapshot.docs.map(toPlain);
    res.json(await decorate(posts, viewerId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. One user's posts
router.get('/users/:username/posts', async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const viewerId = req.query.userId || '';

  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const snapshot = await db.collection('posts').where('author_id', '==', user.id).get();
    const posts = snapshot.docs.map(toPlain).sort(newestFirst).slice(0, limit);

    res.json(await decorate(posts, viewerId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Edit a post's text (author only)
router.patch('/posts/:id', async (req, res) => {
  const { userId, text } = req.body || {};

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }
  if (!String(text || '').trim()) {
    return res.status(400).json({ message: 'Post text cannot be empty' });
  }

  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const snapshot = await postRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = toPlain(snapshot);
    if (post.author_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    await postRef.update({ text: String(text).trim(), updated_at: new Date() });
    const updated = { ...post, text: String(text).trim() };

    res.json(formatPost(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete a post and everything attached to it (author only)
router.delete('/posts/:id', async (req, res) => {
  const userId = (req.body && req.body.userId) || req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const snapshot = await postRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (snapshot.data().author_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    const batch = db.batch();
    for (const collectionName of ['likes', 'reposts', 'bookmarks', 'comments']) {
      const related = await db.collection(collectionName).where('post_id', '==', req.params.id).get();
      related.forEach((doc) => batch.delete(doc.ref));
    }
    batch.delete(postRef);
    await batch.commit();

    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Toggle like / repost / bookmark
router.post('/posts/:id/like', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const result = await toggleRelation({
      postId: req.params.id,
      userId,
      collectionName: 'likes',
      countField: 'like_count',
    });
    res.json({ liked: result.active, likeCount: result.count });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post('/posts/:id/repost', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const result = await toggleRelation({
      postId: req.params.id,
      userId,
      collectionName: 'reposts',
      countField: 'repost_count',
    });
    res.json({ reposted: result.active, repostCount: result.count });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post('/posts/:id/bookmark', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }

  try {
    const result = await toggleRelation({
      postId: req.params.id,
      userId,
      collectionName: 'bookmarks',
      countField: 'bookmark_count',
    });
    res.json({ bookmarked: result.active });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// 7. Comments
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const snapshot = await db.collection('comments').where('post_id', '==', req.params.id).get();
    const comments = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.author_name || '',
          text: data.text || '',
          createdAt: toIso(data.created_at),
        };
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/posts/:id/comments', async (req, res) => {
  const { userId, text } = req.body || {};

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }
  if (!String(text || '').trim()) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postRef = db.collection('posts').doc(req.params.id);
    const postSnapshot = await postRef.get();
    if (!postSnapshot.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      post_id: req.params.id,
      user_id: user.id,
      author_name: user.display_name || user.username,
      text: String(text).trim(),
      created_at: new Date(),
    };
    const ref = await db.collection('comments').add(comment);
    await postRef.update({ comment_count: FieldValue.increment(1) });

    res.status(201).json({
      id: ref.id,
      author: comment.author_name,
      text: comment.text,
      createdAt: toIso(comment.created_at),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Posts a user bookmarked, most recently saved first
router.get('/users/:username/bookmarks', async (req, res) => {
  const viewerId = req.query.userId || '';

  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const snapshot = await db.collection('bookmarks').where('user_id', '==', user.id).get();
    const savedAt = new Map();
    snapshot.forEach((doc) => savedAt.set(doc.data().post_id, toIso(doc.data().created_at)));

    const ids = [...savedAt.keys()];
    if (ids.length === 0) {
      return res.json([]);
    }

    const docs = await db.getAll(...ids.map((id) => db.collection('posts').doc(id)));
    const posts = docs
      .filter((doc) => doc.exists)
      .map(toPlain)
      .sort((a, b) => (savedAt.get(b.id) || '').localeCompare(savedAt.get(a.id) || ''));

    res.json(await decorate(posts, viewerId || user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
