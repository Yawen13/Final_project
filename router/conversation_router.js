const express = require('express');
const { db } = require('../db');

const router = express.Router();

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

async function findUserById(userId) {
  if (!userId) return null;
  const snapshot = await db.collection('users').doc(userId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

async function usersByIds(ids) {
  if (ids.length === 0) return new Map();

  const docs = await db.getAll(...ids.map((id) => db.collection('users').doc(id)));
  const users = new Map();
  docs.forEach((doc) => {
    if (doc.exists) users.set(doc.id, { id: doc.id, ...doc.data() });
  });
  return users;
}

// One document per pair, so get-or-create needs no query and cannot duplicate
function conversationIdFor(a, b) {
  return [a, b].sort().join('_');
}

function formatMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversation_id || '',
    senderId: message.sender_id || '',
    text: message.text || '',
    sentAt: toIso(message.created_at),
  };
}

function formatConversation({ id, otherId, otherUser, lastMessage, fallbackAt, unreadCount }) {
  return {
    id,
    participant: {
      id: otherId,
      name: otherUser ? otherUser.display_name || otherUser.username : 'Unknown',
      handle: otherUser && otherUser.username ? `@${otherUser.username}` : '',
      avatar: otherUser ? otherUser.profile_image_url || '' : '',
    },
    lastMessage: {
      text: lastMessage && lastMessage.text ? lastMessage.text : '',
      sentAt: toIso(lastMessage && lastMessage.sent_at) || toIso(fallbackAt),
    },
    unreadCount: unreadCount || 0,
  };
}

// Loads a conversation and checks that userId is one of its participants.
async function loadConversation(conversationId, userId) {
  const snapshot = await db.collection('conversations').doc(conversationId).get();
  if (!snapshot.exists) {
    return { status: 404, message: 'Conversation not found' };
  }

  const conversation = { id: snapshot.id, ...snapshot.data() };
  if (!(conversation.participant_ids || []).includes(userId)) {
    return { status: 403, message: 'You are not part of this conversation' };
  }

  return { conversation };
}

// 1. Conversations for a user, most recently active first
router.get('/conversations', async (req, res) => {
  const userId = req.query.userId || '';
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    const snapshot = await db
      .collection('conversations')
      .where('participant_ids', 'array-contains', userId)
      .get();

    const conversations = snapshot.docs
      .map(toPlain)
      .sort((a, b) => toIso(b.last_at).localeCompare(toIso(a.last_at)));

    if (conversations.length === 0) {
      return res.json([]);
    }

    const otherIds = [
      ...new Set(
        conversations
          .map((conversation) =>
            (conversation.participant_ids || []).find((id) => id !== userId),
          )
          .filter(Boolean),
      ),
    ];
    const users = await usersByIds(otherIds);

    // Read markers, one per conversation for this user
    const readDocs = await Promise.all(
      conversations.map((conversation) =>
        db.collection('reads').doc(`${conversation.id}_${userId}`).get(),
      ),
    );
    const readAt = new Map();
    readDocs.forEach((doc, index) => {
      readAt.set(conversations[index].id, doc.exists ? toIso(doc.data().last_read_at) : '');
    });

    // All messages in these conversations, for unread counts
    const messagesByConversation = new Map();
    for (const chunk of chunks(conversations.map((conversation) => conversation.id), IN_CHUNK)) {
      const messageSnapshot = await db
        .collection('messages')
        .where('conversation_id', 'in', chunk)
        .get();

      messageSnapshot.forEach((doc) => {
        const message = doc.data();
        const list = messagesByConversation.get(message.conversation_id) || [];
        list.push(message);
        messagesByConversation.set(message.conversation_id, list);
      });
    }

    const result = conversations.map((conversation) => {
      const otherId = (conversation.participant_ids || []).find((id) => id !== userId);
      const marker = readAt.get(conversation.id) || '';
      const unreadCount = (messagesByConversation.get(conversation.id) || []).filter(
        (message) =>
          message.sender_id !== userId &&
          (!marker || toIso(message.created_at) > marker),
      ).length;

      return formatConversation({
        id: conversation.id,
        otherId,
        otherUser: users.get(otherId),
        lastMessage: conversation.last_message,
        fallbackAt: conversation.last_at || conversation.created_at,
        unreadCount,
      });
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get or create the 1:1 conversation between two users
router.post('/conversations', async (req, res) => {
  const { userId, participantId } = req.body || {};

  if (!userId || !participantId) {
    return res.status(400).json({ message: 'Missing userId or participantId' });
  }
  if (userId === participantId) {
    return res.status(400).json({ message: 'You cannot message yourself' });
  }

  try {
    const [me, other] = await Promise.all([findUserById(userId), findUserById(participantId)]);
    if (!me || !other) {
      return res.status(404).json({ message: 'User not found' });
    }

    const id = conversationIdFor(userId, participantId);
    const ref = db.collection('conversations').doc(id);
    const snapshot = await ref.get();

    let conversation;
    if (snapshot.exists) {
      conversation = { id: snapshot.id, ...snapshot.data() };
    } else {
      const now = new Date();
      conversation = {
        id,
        participant_ids: [userId, participantId],
        created_at: now,
        last_at: now,
        last_message: null,
      };

      await ref.set(conversation);
      await db.collection('reads').doc(`${id}_${userId}`).set({
        conversation_id: id,
        user_id: userId,
        last_read_at: now,
      });
    }

    const otherId = (conversation.participant_ids || []).find((idValue) => idValue !== userId);
    res.status(snapshot.exists ? 200 : 201).json(
      formatConversation({
        id,
        otherId,
        otherUser: other,
        lastMessage: conversation.last_message,
        fallbackAt: conversation.last_at || conversation.created_at,
        unreadCount: 0,
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Messages in a conversation, oldest first
router.get('/conversations/:id/messages', async (req, res) => {
  const userId = req.query.userId || '';
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    const access = await loadConversation(req.params.id, userId);
    if (access.status) {
      return res.status(access.status).json({ message: access.message });
    }

    const limit = clampLimit(req.query.limit);
    const snapshot = await db
      .collection('messages')
      .where('conversation_id', '==', req.params.id)
      .get();

    const messages = snapshot.docs
      .map(toPlain)
      .sort((a, b) => toIso(a.created_at).localeCompare(toIso(b.created_at)))
      .slice(-limit);

    res.json(messages.map(formatMessage));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Send a message
router.post('/conversations/:id/messages', async (req, res) => {
  const { userId, text } = req.body || {};

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }
  if (!String(text || '').trim()) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    const access = await loadConversation(req.params.id, userId);
    if (access.status) {
      return res.status(access.status).json({ message: access.message });
    }

    const now = new Date();
    const message = {
      conversation_id: req.params.id,
      sender_id: userId,
      text: String(text).trim(),
      created_at: now,
    };

    const ref = await db.collection('messages').add(message);
    await db.collection('conversations').doc(req.params.id).update({
      last_message: { text: message.text, sent_at: now, sender_id: userId },
      last_at: now,
    });
    await db.collection('reads').doc(`${req.params.id}_${userId}`).set({
      conversation_id: req.params.id,
      user_id: userId,
      last_read_at: now,
    });

    res.status(201).json(formatMessage({ id: ref.id, ...message }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Clear the unread badge for a conversation
router.post('/conversations/:id/read', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    const access = await loadConversation(req.params.id, userId);
    if (access.status) {
      return res.status(access.status).json({ message: access.message });
    }

    await db.collection('reads').doc(`${req.params.id}_${userId}`).set({
      conversation_id: req.params.id,
      user_id: userId,
      last_read_at: new Date(),
    });

    res.json({ message: 'Conversation marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
