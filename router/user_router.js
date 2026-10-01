const express = require('express');
const router = express.Router();

const { db, admin } = require('../db'); 

// 1. Register 
router.post('/auth/register', async (req, res) => {
  const { username, displayName, email, password, bio } = req.body;
  if (!username || !displayName || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const usersRef = db.collection('users');
    
    // check if username already exists
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
      created_at: admin.firestore.FieldValue.serverTimestamp() }

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

module.exports = router;