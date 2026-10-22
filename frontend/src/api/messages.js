import { hasBackend, request } from './client';

// Data access for the Messages page.
//
// Backend endpoints:
//
//   GET  {base}/conversations?userId=                  → Conversation[]
//   POST {base}/conversations { userId, participantId } → Conversation
//   GET  {base}/conversations/:id/messages?userId=&limit= → Message[]
//   POST {base}/conversations/:id/messages { userId, text } → Message
//   POST {base}/conversations/:id/read { userId }      → { message }
//
// Expected shapes:
//
//   Conversation {
//     id, participant: { id, name, handle, avatar },
//     lastMessage: { text, sentAt }, unreadCount,
//   }
//
//   Message { id, conversationId, senderId, text, sentAt }
//
// When the backend predates these routes the first request answers 404 and
// this module keeps everything in memory for the rest of the session.

export const CURRENT_USER_ID = 'me';

const backendConfigured = hasBackend;
let apiAvailable = hasBackend;
let warnedAboutMissing = false;

// A 404 means the backend predates these routes. Unlike posts, there is no
// useful local fallback: a message written here would never reach anyone. So
// stop pretending the feature works and let the UI say so.
function markMissing(error) {
  if (error && error.status === 404 && backendConfigured && apiAvailable) {
    apiAvailable = false;
    if (!warnedAboutMissing) {
      warnedAboutMissing = true;
      console.warn('[messages] The messages API is not deployed yet.');
    }
    return true;
  }
  return false;
}

/** True when a backend is configured but its messages routes are missing. */
export function messagesApiMissing() {
  return backendConfigured && !apiAvailable;
}

function unavailable() {
  return new Error('Messaging is not available yet.');
}

// Empty placeholder store, used only when the API is missing.
let placeholderConversations = [];
let placeholderMessages = {};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();

/** Conversations for the current user, most recently active first. */
export async function listConversations(userId) {
  if (apiAvailable) {
    try {
      return await request(`/conversations?userId=${encodeURIComponent(userId || '')}`);
    } catch (error) {
      if (markMissing(error)) return [];
      throw error;
    }
  }

  if (backendConfigured) return [];

  await delay(120);
  return placeholderConversations.map((conversation) => ({ ...conversation }));
}

/** Gets or creates the 1:1 conversation with `participant`. */
export async function startConversation({ userId, participant }) {
  if (apiAvailable) {
    try {
      return await request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ userId, participantId: participant.id }),
      });
    } catch (error) {
      if (markMissing(error)) throw unavailable();
      throw error;
    }
  }

  if (backendConfigured) throw unavailable();

  const existing = placeholderConversations.find(
    (conversation) => conversation.participant.id === participant.id,
  );
  if (existing) return { ...existing };

  const conversation = {
    id: `local-${Date.now()}`,
    participant: {
      id: participant.id,
      name: participant.name,
      handle: participant.handle,
      avatar: participant.avatar || '',
    },
    lastMessage: { text: '', sentAt: nowIso() },
    unreadCount: 0,
  };

  placeholderConversations = [conversation, ...placeholderConversations];
  placeholderMessages = { ...placeholderMessages, [conversation.id]: [] };
  return { ...conversation };
}

/** One conversation's messages, oldest first. */
export async function listMessages(conversationId, { limit = 50, userId } = {}) {
  if (apiAvailable) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (userId) params.set('userId', userId);

    try {
      return await request(
        `/conversations/${encodeURIComponent(conversationId)}/messages?${params.toString()}`,
      );
    } catch (error) {
      if (markMissing(error)) return [];
      throw error;
    }
  }

  if (backendConfigured) return [];

  await delay(120);
  return (placeholderMessages[conversationId] ?? [])
    .slice(-limit)
    .map((message) => ({ ...message }));
}

/** Sends a message and resolves with the stored row. */
export async function sendMessage(conversationId, text, userId) {
  const body = text.trim();

  if (apiAvailable) {
    try {
      return await request(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ userId, text: body }),
      });
    } catch (error) {
      if (markMissing(error)) throw unavailable();
      throw error;
    }
  }

  if (backendConfigured) throw unavailable();

  await delay(120);
  const message = {
    id: `local-${Date.now()}`,
    conversationId,
    senderId: userId || CURRENT_USER_ID,
    text: body,
    sentAt: nowIso(),
  };

  placeholderMessages = {
    ...placeholderMessages,
    [conversationId]: [...(placeholderMessages[conversationId] ?? []), message],
  };
  placeholderConversations = placeholderConversations.map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, lastMessage: { text: body, sentAt: message.sentAt }, unreadCount: 0 }
      : conversation,
  );

  return message;
}

/** Clears the unread badge for a conversation. */
export async function markConversationRead(conversationId, userId) {
  if (apiAvailable) {
    try {
      return await request(`/conversations/${encodeURIComponent(conversationId)}/read`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      if (markMissing(error)) return null;
      throw error;
    }
  }

  if (backendConfigured) return null;

  placeholderConversations = placeholderConversations.map((conversation) =>
    conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
  );
  return null;
}
