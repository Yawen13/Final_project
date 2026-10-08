import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import {
  CURRENT_USER_ID,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} from '../api/messages';

const AVATAR_TONES = [
  'bg-[#f0eaff] text-[#6953d7]',
  'bg-[#fff0ed] text-[#e77b6e]',
  'bg-[#e8f3ec] text-[#3f8f63]',
  'bg-[#eef0f7] text-[#4e4c61]',
];

function toneFor(key) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash + key.charCodeAt(index)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash];
}

function initialsFor(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, className = 'h-11 w-11 text-sm' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${toneFor(name)} ${className}`}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </span>
  );
}

// "now", "12m", "3h", "2d" — enough to scan a list without reading dates.
function shortWhen(iso) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / (60 * 24))}d`;
}

function clockTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dayStamp(iso) {
  return new Date(iso).toDateString();
}

function dayLabel(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);

  if (dayStamp(iso) === dayStamp(today.toISOString())) return 'Today';
  if (dayStamp(iso) === dayStamp(yesterday.toISOString())) return 'Yesterday';

  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

function SendIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path d="M4.5 12 20 4.5 12.5 20l-1.6-6.2L4.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConversationSkeleton() {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-100" />
      <span className="min-w-0 flex-1 space-y-2">
        <span className="block h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
        <span className="block h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
      </span>
    </li>
  );
}

function BubbleSkeleton({ mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <span className="h-10 w-1/2 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [listState, setListState] = useState('loading');
  const [thread, setThread] = useState({ conversationId: null, messages: [], state: 'idle' });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const threadRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    listConversations()
      .then((rows) => {
        if (cancelled) return;
        setConversations(rows);
        setListState('ready');
      })
      .catch(() => {
        if (!cancelled) setListState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (!conversationId) return undefined;

    let cancelled = false;

    // Opening a thread is what clears its badge, so do both in one pass.
    markConversationRead(conversationId)
      .then(() => {
        if (cancelled) return;
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
          ),
        );
      })
      .catch(() => {});

    listMessages(conversationId)
      .then((rows) => {
        if (!cancelled) setThread({ conversationId, messages: rows, state: 'ready' });
      })
      .catch(() => {
        if (!cancelled) setThread({ conversationId, messages: [], state: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, reloadToken]);

  // A thread that has not resolved yet reads as loading, so nothing has to be
  // written to state when the URL changes.
  const loadedThread = thread.conversationId === conversationId ? thread : null;
  const threadState = !conversationId ? 'idle' : (loadedThread?.state ?? 'loading');
  // Memoised so the scroll effect below keys off the contents, not the render.
  const messages = useMemo(() => loadedThread?.messages ?? [], [loadedThread]);

  // Keep the newest message in view whenever the thread grows.
  useEffect(() => {
    const node = threadRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, threadState]);

  async function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();

    if (!text || !conversationId || sending) return;

    const optimistic = {
      id: `pending-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      text,
      sentAt: new Date().toISOString(),
      pending: true,
    };

    setThread((current) => ({ ...current, messages: [...current.messages, optimistic] }));
    setDraft('');
    setSending(true);
    setSendError(null);

    try {
      const stored = await sendMessage(conversationId, text);
      setThread((current) => ({
        ...current,
        messages: current.messages.map((message) => (message.id === optimistic.id ? stored : message)),
      }));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastMessage: { text, sentAt: stored.sentAt }, unreadCount: 0 }
            : conversation,
        ),
      );
    } catch {
      // Hand the words back rather than losing them.
      setThread((current) => ({
        ...current,
        messages: current.messages.filter((message) => message.id !== optimistic.id),
      }));
      setDraft(text);
      setSendError({ conversationId, message: 'That message did not send.' });
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  }

  // Both panes refetch together, so both go back to their skeletons.
  function retry() {
    setListState('loading');
    if (conversationId) setThread({ conversationId, messages: [], state: 'loading' });
    setReloadToken((token) => token + 1);
  }

  const activeConversation = conversations.find((conversation) => conversation.id === conversationId) ?? null;
  const conversationMissing = listState === 'ready' && conversationId && !activeConversation;

  return (
    <div className="min-h-screen bg-[#f5f4fa] text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">Conversations about work that is not finished yet.</p>

        <div className="mt-6 grid gap-4 lg:h-[calc(100vh-15rem)] lg:grid-cols-[minmax(280px,340px)_1fr]">
          <section
            aria-label="Conversations"
            className={`flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_6px_18px_rgba(31,24,65,0.05)] ${
              conversationId ? 'hidden lg:flex' : ''
            }`}
          >
            {listState === 'error' ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">Could not load your conversations.</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Try again
                </button>
              </div>
            ) : listState === 'loading' ? (
              <ul className="divide-y divide-slate-100">
                {[0, 1, 2, 3].map((row) => (
                  <ConversationSkeleton key={row} />
                ))}
              </ul>
            ) : (
              <ul className="max-h-[60vh] min-h-[260px] flex-1 divide-y divide-slate-100 overflow-y-auto lg:max-h-none lg:min-h-0">
                {conversations.map((conversation) => {
                  const isActive = conversation.id === conversationId;
                  const { participant, lastMessage, unreadCount } = conversation;

                  return (
                    <li key={conversation.id}>
                      <Link
                        to={`/messages/${conversation.id}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex items-start gap-3 px-4 py-3.5 transition ${
                          isActive ? 'bg-[#f7f5ff]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <Avatar name={participant.name} />

                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className={`truncate text-sm text-slate-900 ${unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                              {participant.name}
                            </span>
                            <span className="shrink-0 text-[11px] text-slate-400">{shortWhen(lastMessage.sentAt)}</span>
                          </span>
                          <span className={`mt-0.5 block truncate text-sm ${unreadCount > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                            {lastMessage.text}
                          </span>
                        </span>

                        {unreadCount > 0 && (
                          <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#635BFF] px-1.5 text-[11px] font-semibold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section
            aria-label={activeConversation ? `Conversation with ${activeConversation.participant.name}` : 'Conversation'}
            className={`flex min-h-[520px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_6px_18px_rgba(31,24,65,0.05)] ${
              conversationId ? '' : 'hidden lg:flex'
            }`}
          >
            {!conversationId ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <Avatar name="Unfinished" className="h-14 w-14 text-base" />
                <h2 className="mt-4 text-lg font-semibold">Pick a conversation</h2>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Your threads with other makers live here. Choose one on the left to pick up where you left off.
                </p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => navigate('/messages')}
                    className="-ml-1 rounded-full p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <BackIcon />
                  </button>

                  {activeConversation && (
                    <>
                      <Avatar name={activeConversation.participant.name} className="h-9 w-9 text-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{activeConversation.participant.name}</p>
                        <p className="truncate text-xs text-slate-400">{activeConversation.participant.handle}</p>
                      </div>
                    </>
                  )}
                </header>

                <div ref={threadRef} role="log" aria-live="polite" className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                  {threadState === 'loading' && (
                    <div className="space-y-3">
                      <BubbleSkeleton />
                      <BubbleSkeleton mine />
                      <BubbleSkeleton />
                    </div>
                  )}

                  {threadState === 'error' && (
                    <div className="py-10 text-center">
                      <p className="text-sm font-medium text-slate-700">Could not load this conversation.</p>
                      <button
                        type="button"
                        onClick={retry}
                        className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {conversationMissing && threadState === 'ready' && (
                    <div className="py-10 text-center">
                      <p className="text-sm font-medium text-slate-700">That conversation is not in your inbox.</p>
                      <Link to="/messages" className="mt-4 inline-block text-sm font-semibold text-[#635BFF] hover:underline">
                        Back to messages
                      </Link>
                    </div>
                  )}

                  {threadState === 'ready' &&
                    !conversationMissing &&
                    messages.map((message, index) => {
                      const mine = message.senderId === CURRENT_USER_ID;
                      const startsDay = index === 0 || dayStamp(messages[index - 1].sentAt) !== dayStamp(message.sentAt);

                      return (
                        <div key={message.id}>
                          {startsDay && (
                            <p className="py-3 text-center text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                              {dayLabel(message.sentAt)}
                            </p>
                          )}

                          <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[min(80%,36rem)]">
                              <p
                                className={`message-in rounded-2xl px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap ${
                                  mine
                                    ? 'rounded-br-md bg-[#635BFF] text-white'
                                    : 'rounded-bl-md bg-[#f3f3f7] text-slate-800'
                                } ${message.pending ? 'opacity-60' : ''}`}
                              >
                                {message.text}
                              </p>
                              <p className={`mt-1 text-[11px] text-slate-400 ${mine ? 'text-right' : ''}`}>
                                {clockTime(message.sentAt)}
                                {message.pending ? ' · sending' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {threadState === 'ready' && !conversationMissing && (
                  <form onSubmit={handleSend} className="border-t border-slate-100 px-3 py-3">
                    {sendError?.conversationId === conversationId && (
                      <p role="alert" className="mb-2 px-1 text-xs font-medium text-red-600">
                        {sendError.message}
                      </p>
                    )}

                    <div className="flex items-end gap-2">
                      <label htmlFor="message-draft" className="sr-only">
                        Message {activeConversation?.participant.name ?? ''}
                      </label>
                      <textarea
                        id="message-draft"
                        rows={1}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder="Write a message…"
                        className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-slate-200 bg-[#f7f7fb] px-4 py-3 text-[15px] leading-5 text-slate-900 outline-none transition focus:border-[#635BFF] focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!draft.trim() || sending}
                        aria-label="Send message"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-white transition hover:bg-[#5249ea] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
