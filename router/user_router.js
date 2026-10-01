const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { db } = require('../db'); 

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
    // ตั้งชื่อไฟล์ใหม่ไม่ให้ซ้ำกัน
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
  const { username, password } = req.body;
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
      createdAt: user.created_at
    });
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

    res.json({
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      createdAt: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Follow user
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

// 5. Unfollow user
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

// 6. Upload profile image 
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
    const publicUrl = `http://localhost:3000/uploads/${file.filename}`;

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