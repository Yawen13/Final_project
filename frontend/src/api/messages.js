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

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

let placeholderConversations = [
  {
    id: 'c1',
    participant: { id: 'u-maya', name: 'Maya Chen', handle: '@mayachen', avatar: '' },
    lastMessage: { text: "Sent the second half — the ending still isn't landing.", sentAt: minutesAgo(12) },
    unreadCount: 2,
  },
  {
    id: 'c2',
    participant: { id: 'u-daniel', name: 'Daniel Ortiz', handle: '@danielortiz', avatar: '' },
    lastMessage: { text: 'Ha, I knew you would catch the timeline problem.', sentAt: minutesAgo(190) },
    unreadCount: 0,
  },
  {
    id: 'c3',
    participant: { id: 'u-priya', name: 'Priya Nair', handle: '@priyanair', avatar: '' },
    lastMessage: { text: 'Kept the second stanza. Everything after it is negotiable.', sentAt: minutesAgo(1500) },
    unreadCount: 1,
  },
  {
    id: 'c4',
    participant: { id: 'u-leo', name: 'Leo Fischer', handle: '@leofischer', avatar: '' },
    lastMessage: { text: 'Scene 4 rewrite is up. Cutting the voiceover helped.', sentAt: minutesAgo(2900) },
    unreadCount: 0,
  },
];

let placeholderMessages = {
  c1: [
    { id: 'm1', conversationId: 'c1', senderId: 'u-maya', text: 'Okay, the draft is finally out of my head and on the page.', sentAt: minutesAgo(1400) },
    { id: 'm2', conversationId: 'c1', senderId: CURRENT_USER_ID, text: 'Read it twice. The middle section is doing the most work — I would not touch it.', sentAt: minutesAgo(1380) },
    { id: 'm3', conversationId: 'c1', senderId: 'u-maya', text: 'That is the part I was most unsure about, so that helps.', sentAt: minutesAgo(90) },
    { id: 'm4', conversationId: 'c1', senderId: 'u-maya', text: "Sent the second half — the ending still isn't landing.", sentAt: minutesAgo(12) },
  ],
  c2: [
    { id: 'm5', conversationId: 'c2', senderId: 'u-daniel', text: 'Where does chapter three sit for you? I think it jumps.', sentAt: minutesAgo(240) },
    { id: 'm6', conversationId: 'c2', senderId: CURRENT_USER_ID, text: 'It jumps because the letter arrives before we care about the sender.', sentAt: minutesAgo(205) },
    { id: 'm7', conversationId: 'c2', senderId: 'u-daniel', text: 'Ha, I knew you would catch the timeline problem.', sentAt: minutesAgo(190) },
  ],
  c3: [
    { id: 'm8', conversationId: 'c3', senderId: 'u-priya', text: 'the kettle hums / and I forget, for a second, / what I was mourning', sentAt: minutesAgo(1600) },
    { id: 'm9', conversationId: 'c3', senderId: CURRENT_USER_ID, text: 'The turn on "for a second" is the whole poem. Do not explain it.', sentAt: minutesAgo(1560) },
    { id: 'm10', conversationId: 'c3', senderId: 'u-priya', text: 'Kept the second stanza. Everything after it is negotiable.', sentAt: minutesAgo(1500) },
  ],
  c4: [
    { id: 'm11', conversationId: 'c4', senderId: 'u-leo', text: 'Scene 4 rewrite is up. Cutting the voiceover helped.', sentAt: minutesAgo(2900) },
  ],
};

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
