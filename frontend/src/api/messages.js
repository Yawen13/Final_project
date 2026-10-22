import { messagesUseApi, request } from './client';

// Data access for the Messages page.
//
// The UI only ever calls the functions at the bottom of this file, so wiring up
// the real backend means implementing these four endpoints — nothing in
// Messages.jsx has to change.
//
//   GET  {base}/conversations                        → Conversation[]
//   GET  {base}/conversations/:id/messages?limit=50  → Message[]   (oldest → newest)
//   POST {base}/conversations/:id/messages { text }  → Message     (the created row)
//   POST {base}/conversations/:id/read               → 204
//
// Expected JSON shapes:
//
//   Conversation {
//     id: string,
//     participant: { id: string, name: string, handle: string, avatar: string | '' },
//     lastMessage: { text: string, sentAt: string },   // sentAt is ISO 8601
//     unreadCount: number,
//   }
//
//   Message {
//     id: string,
//     conversationId: string,
//     senderId: string,        // CURRENT_USER_ID for the logged-in user
//     text: string,
//     sentAt: string,          // ISO 8601
//   }
//
// Set VITE_API_BASE_URL in .env.local to talk to a real server — see
// .env.example and src/api/client.js. With it unset every call resolves from
// the placeholder store below, so the page works before the backend exists.

export const CURRENT_USER_ID = 'me';

const USE_PLACEHOLDER = !messagesUseApi;

// ---------------------------------------------------------------------------
// Placeholder store — stands in for the database until the endpoints exist.
// ---------------------------------------------------------------------------

// No seeded conversations: the inbox starts empty until the backend serves
// /conversations, and anything sent in placeholder mode is this session's own.
let placeholderConversations = [];

let placeholderMessages = {};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Conversations for the current user, most recently active first. */
export async function listConversations() {
  if (!USE_PLACEHOLDER) return request('/conversations');

  await delay(260);
  return placeholderConversations.map((conversation) => ({ ...conversation }));
}

/** One conversation's messages, oldest first. */
export async function listMessages(conversationId, { limit = 50 } = {}) {
  if (!USE_PLACEHOLDER) {
    return request(`/conversations/${encodeURIComponent(conversationId)}/messages?limit=${limit}`);
  }

  await delay(200);
  return (placeholderMessages[conversationId] ?? []).slice(-limit).map((message) => ({ ...message }));
}

/** Sends a message and resolves with the stored row. */
export async function sendMessage(conversationId, text) {
  const body = text.trim();

  if (!USE_PLACEHOLDER) {
    return request(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text: body }),
    });
  }

  await delay(180);
  const message = {
    id: `local-${Date.now()}`,
    conversationId,
    senderId: CURRENT_USER_ID,
    text: body,
    sentAt: new Date().toISOString(),
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
export async function markConversationRead(conversationId) {
  if (!USE_PLACEHOLDER) {
    return request(`/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' });
  }

  placeholderConversations = placeholderConversations.map((conversation) =>
    conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
  );
  return null;
}

/** True while the page is running on the placeholder store, not a real server. */
export const usingPlaceholderData = USE_PLACEHOLDER;
