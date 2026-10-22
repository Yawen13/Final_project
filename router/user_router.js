const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { db } = require('../db');

// Firestore Timestamps serialize as {_seconds, _nanoseconds}; send ISO strings
function toIso(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

// 1. create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
//     Use Date.now() to ensure unique filenames and prevent overwriting
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 1. Register 
router.post('/auth/register', async (req, res) => {
  const { username, displayName, email, password, bio } = req.body;
  if (!username || !displayName || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const usersRef = db.collection('users');
    const checkSnapshot = await usersRef.where('username', '==', username).get();
    if (!checkSnapshot.empty) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = {
      username,
      display_name: displayName,
      email,
      password, 
      bio: bio || '',
      created_at: new Date() 
    }

    const docRef = await usersRef.add(newUser);
    res.status(201).json({
      message: 'Registration successful',
      userId: docRef.id,
      username,
      displayName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login 
router.post('/auth/login', async (req, res) => {
  // Express 5 leaves req.body undefined when the request has no JSON body
  const { username, password } = req.body || {};
  // Firestore rejects undefined in where(), so check before querying
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter your username and password' });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('username', '==', username)
      .where('password', '==', password)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    let user;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });

    res.json({
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      createdAt: toIso(user.created_at)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search users by username or display name, for starting a conversation
router.get('/users', async (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const excludeId = String(req.query.excludeId || '');

  if (!query) {
    return res.json([]);
  }

  try {
    const snapshot = await db.collection('users').limit(200).get();
    const users = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.id !== excludeId)
      .filter(user =>
        (user.username || '').toLowerCase().includes(query) ||
        (user.display_name || '').toLowerCase().includes(query)
      )
      .slice(0, 20)
      .map(user => ({
        userId: user.id,
        username: user.username,
        displayName: user.display_name || user.username,
        profileImageUrl: user.profile_image_url || ''
      }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get user by username
router.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    let user;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });

    // Follower/following counts, served with the profile so the client does
    // not need a second request
    const [followers, following] = await Promise.all([
      db.collection('follows').where('following_id', '==', user.id).count().get(),
      db.collection('follows').where('follower_id', '==', user.id).count().get()
    ]);

    res.json({
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      location: user.location || '',
      status: user.status || '',
      profileImageUrl: user.profile_image_url || '',
      followerCount: followers.data().count,
      followingCount: following.data().count,
      createdAt: toIso(user.created_at)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update profile fields (display name, bio, location, status, avatar URL)
router.patch('/users/:username', async (req, res) => {
  const { username } = req.params;
  const { userId, displayName, bio, location, status, profileImageUrl } = req.body || {};

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in request body' });
  }
  if (typeof profileImageUrl === 'string' && profileImageUrl.length > 900000) {
    return res.status(413).json({ message: 'That image is too large. Please choose a smaller one.' });
  }

  try {
    const snapshot = await db.collection('users').where('username', '==', username).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const doc = snapshot.docs[0];
    if (doc.id !== userId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const updates = {};
    if (typeof displayName === 'string' && displayName.trim()) {
      updates.display_name = displayName.trim();
    }
    if (typeof bio === 'string') updates.bio = bio;
    if (typeof location === 'string') updates.location = location;
    if (typeof status === 'string') updates.status = status;
    if (typeof profileImageUrl === 'string') updates.profile_image_url = profileImageUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }
    updates.updated_at = new Date();

    await db.collection('users').doc(doc.id).update(updates);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Follow user
router.post('/users/:username/follow', async (req, res) => {
  const targetUsername = req.params.username;
  const { followerId } = req.body;

  if (!followerId) {
    return res.status(400).json({ message: 'Missing followerId in request body' });
  }

  try {
    const targetUserSnapshot = await db.collection('users').where('username', '==', targetUsername).get();
    if (targetUserSnapshot.empty) {
      return res.status(404).json({ message: 'Target user not found' });
    }
    const targetUserId = targetUserSnapshot.docs[0].id; 

    if (followerId === targetUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const followsRef = db.collection('follows');
    const existingFollow = await followsRef
      .where('follower_id', '==', followerId)
      .where('following_id', '==', targetUserId)
      .get();

    if (!existingFollow.empty) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    await followsRef.add({
      follower_id: followerId,
      following_id: targetUserId,
      created_at: new Date()
    });

    res.status(201).json({ message: `Successfully followed ${targetUsername}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Unfollow user
router.delete('/users/:username/follow', async (req, res) => {
  const targetUsername = req.params.username;
  const { followerId } = req.body;

  if (!followerId) {
    return res.status(400).json({ message: 'Missing followerId in request body' });
  }

  try {
    const targetUserSnapshot = await db.collection('users').where('username', '==', targetUsername).get();
    if (targetUserSnapshot.empty) {
      return res.status(404).json({ message: 'Target user not found' });
    }
    const targetUserId = targetUserSnapshot.docs[0].id;

    const followsRef = db.collection('follows');
    const existingFollow = await followsRef
      .where('follower_id', '==', followerId)
      .where('following_id', '==', targetUserId)
      .get();

    if (existingFollow.empty) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    const batch = db.batch();
    existingFollow.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: `Successfully unfollowed ${targetUsername}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Upload profile image 
router.post('/users/:username/image', upload.single('profileImage'), async (req, res) => {
  const { username } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const userSnapshot = await db.collection('users').where('username', '==', username).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    const docId = userSnapshot.docs[0].id;

    // construct the public URL for the uploaded image
    // Public URL for the uploaded image — built from the live request so it
    // works on Render (localhost:3000 only worked locally)
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // make sure to serve the uploads folder statically in your server.js
    await db.collection('users').doc(docId).update({
      profile_image_url: publicUrl,
      updated_at: new Date() 
    });

    res.json({ 
      message: 'Profile image updated successfully', 
      imageUrl: publicUrl 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;