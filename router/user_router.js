const express = require('express');
const router = express.Router();
const db = require('../db');

//register
router.post('/auth/register', async (req, res) => {
  const { username, displayName, email, password, bio } = req.body;
  if (!username || !displayName || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO users (username, display_name, email, password, bio) VALUES (?, ?, ?, ?, ?)',
      [username, displayName, email, password, bio || '']
    );
    res.status(201).json({
      message: 'Registration successful',
      userId: result.insertId,
      username,
      displayName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT id, username, display_name, bio, created_at FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];
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

// Get user by username
router.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id, username, display_name, bio, created_at FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
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