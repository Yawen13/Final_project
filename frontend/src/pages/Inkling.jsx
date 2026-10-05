import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../Components/Navbar';
import InklingMark from '../Components/InklingMark';
import './Inkling.css';

const GREETING =
  "I'm Inkling. I read what you've started and help you find the next line — not the finished thing, just the next step. What are you working on?";

// The persona is the product's own position: this site is for work that isn't
// finished, so an assistant that finishes people's work would undermine it.
// Inkling gives traction, never the ending. The form rules (plain prose, no
// markdown, short) come from how the interface renders replies: paragraphs are
// split on blank lines and printed literally, so markup would show up as noise.
const SYSTEM_PROMPT = `You are Inkling, a member of the Unfinished community — a social platform where people share creative work they haven't finished yet: short stories, worldbuilding, poetry, screenwriting, and lyrics.

You are the quiet voice in the margin. You are not the author and you are not a customer-service chatbot. You read what someone has started and help them find the next step. This platform exists because unfinished work is worth sharing, so never write the ending for someone. Give them the traction to continue it themselves.

What you do:

- Polish. Tighten rhythm, cut what is doing no work, find a stronger verb, move a line break. Write the revised lines so they can read them as writing. Do not explain what you would change before changing it.
- Unstick. When someone is blocked, offer one or two concrete directions, not a menu of ten. Ask what they want the piece to do before offering more.
- Name and title. Give a small set of options and say what each one signals. Three that are too obvious and one that might work is a good shape.
- Read and respond. When someone shares a draft, respond to what is actually on the page — the specific image, the odd line, the gap. Never answer with generic praise.
- Answer questions about how Unfinished works. It has a home feed where you write something unfinished and post it, and an Explore page showing other people's pieces with a filter by tag. The tags are #shortstories, #worldbuilding, #poetry, #screenwriting, and #lyrics. That is the entire product. There are no drafts, no private or saved posts, no profiles, no follows, no DMs, no notifications, and no editing or deleting a post after it goes up. If you are asked about anything else, say plainly that Unfinished doesn't have it, and never describe how such a feature might work — not even as a suggestion, unless the person explicitly asks you to brainstorm product ideas.

Voice:

- Plain, warm, specific. You sound like a good editor who has read widely and is not in a hurry.
- Never open with praise. "Great start", "what a beautiful piece", and "I love this" are all forbidden openings. Respond to the work itself.
- One good question is worth more than three suggestions.
- Never say "as an AI", and never describe yourself as an assistant or a language model.
- Do not pad. If the honest answer is one line, write one line.

Form — this matters, the interface renders your text literally:

- Write plain prose. Markdown does not render here: no asterisks for bold or italics, no hash headings, no bullet or numbered lists.
- Separate paragraphs with a blank line.
- Keep most replies to one to three short paragraphs.
- When you show revised writing, put it on its own paragraph so it reads as the work rather than as commentary about it.
- Reply in whichever language the person wrote to you in.`;

const SUGGESTIONS = [
  'I have a first line and nothing else',
  'Help me name this character',
  'Where could this story go next?',
  'Is this poem finished?',
];

const REQUEST_TIMEOUT_MS = 120000;

function toApiMessages(history) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((message) => ({
      role: message.from === 'user' ? 'user' : 'assistant',
      content: message.body,
    })),
  ];
}

async function streamReply(history, onDelta, signal) {
  const response = await fetch('/api/deepseek/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: 'deepseek-flash',
      stream: true,
      messages: toApiMessages(history),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `DeepSeek returned ${response.status}${detail ? ` — ${detail.slice(0, 160)}` : ''}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the trailing fragment; it is completed by the next read.
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;

      let chunk;
      try {
        chunk = JSON.parse(payload);
      } catch {
        continue; // split across reads
      }

      // deepseek-flash is a reasoning model: it streams its chain of thought in
      // `reasoning_content` before the answer arrives in `content`. Only
      // `content` belongs in the conversation.
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        onDelta(full);
      }
    }
  }

  if (!full.trim()) throw new Error('DeepSeek returned an empty reply.');
  return full;
}

let nextId = 0;

function YourLine({ message }) {
  return (
    <div className="inkling-post flex justify-end">
      <p className="max-w-[80%] rounded-2xl rounded-br-md bg-[#635BFF] px-4 py-2.5 text-[15px] leading-relaxed text-white sm:max-w-[70%]">
        {message.body}
      </p>
    </div>
  );
}

// Your words are the work; Inkling is the quiet voice in the margin. The
// speaker is carried by the mark and the serif voice, not a label or a rule.
function InklingLine({ message, onRetry }) {
  if (message.error) {
    return (
      <div className="flex gap-3.5">
        <InklingMark className="mt-[7px] h-4 w-4 shrink-0 text-gray-300" strokeWidth={2.6} />
        <div className="max-w-[68ch] space-y-3 font-serif text-[17px] leading-[1.75] text-gray-800">
          <p>I couldn't reach the page just now. Nothing you wrote was lost.</p>
          {message.detail && <p className="text-sm text-gray-500">{message.detail}</p>}
          <button
            type="button"
            onClick={() => onRetry(message)}
            className="rounded-full border border-gray-300 px-4 py-1.5 font-sans text-sm font-medium text-gray-700 transition-colors duration-150 hover:border-[#635BFF] hover:text-[#635BFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635BFF]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inkling-settle flex gap-3.5">
      <InklingMark className="mt-[7px] h-4 w-4 shrink-0 text-gray-300" strokeWidth={2.6} />
      <span className="sr-only">Inkling said:</span>
      <div className="max-w-[68ch] space-y-3 font-serif text-[17px] leading-[1.75] text-gray-800">
        {message.body.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default function Inkling() {
  const [messages, setMessages] = useState([{ id: nextId++, from: 'inkling', body: GREETING }]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false); // sent, no tokens back yet
  const [streaming, setStreaming] = useState(false); // tokens arriving

  const draftRef = useRef(null);
  const bottomRef = useRef(null);
  const controllerRef = useRef(null);
  const streamIdRef = useRef(null);
  const unmountedRef = useRef(false);

  const busy = thinking || streaming;

  // Grow the composer with its content, up to a ceiling
  useEffect(() => {
    const el = draftRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // scrollHeight measures the content box, but box-sizing is border-box, so
    // the border has to be added back. Without it the box lands 2px short,
    // the text overflows, and a scrollbar shows even when nothing is clipped.
    const border = el.offsetHeight - el.clientHeight;
    el.style.height = `${Math.min(el.scrollHeight + border, 160)}px`;
  }, [draft]);

  // Keep the newest line in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, thinking]);

  useEffect(() => {
    // StrictMode runs mount -> cleanup -> mount in dev, so the flag has to be
    // reset on mount. Setting it only in the cleanup leaves it stuck at true
    // after the first simulated unmount, which would freeze `busy` forever.
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      controllerRef.current?.abort();
    };
  }, []);

  async function request(history) {
    const controller = new AbortController();
    controllerRef.current = controller;
    streamIdRef.current = null;

    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    setThinking(true);

    try {
      await streamReply(
        history,
        (partial) => {
          // First token: swap the waiting mark for the reply and let it grow.
          if (streamIdRef.current === null) {
            streamIdRef.current = nextId++;
            const id = streamIdRef.current;
            setThinking(false);
            setStreaming(true);
            setMessages((prev) => [...prev, { id, from: 'inkling', body: partial }]);
            return;
          }
          const id = streamIdRef.current;
          setMessages((prev) =>
            prev.map((message) => (message.id === id ? { ...message, body: partial } : message)),
          );
        },
        controller.signal,
      );
    } catch (error) {
      if (unmountedRef.current) return;

      const timedOut = error.name === 'AbortError';
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          from: 'inkling',
          body: '',
          error: true,
          detail: timedOut
            ? 'The request took too long and was stopped.'
            : String(error.message || error),
          history,
        },
      ]);
    } finally {
      window.clearTimeout(timeout);
      if (!unmountedRef.current) {
        setThinking(false);
        setStreaming(false);
      }
    }
  }

  function send(text) {
    const body = text.trim();
    if (!body || busy) return;

    const history = [...messages, { id: nextId++, from: 'user', body }];
    setMessages(history);
    setDraft('');
    request(history);
  }

  function retry(errorMessage) {
    setMessages((prev) => prev.filter((message) => message.id !== errorMessage.id));
    request(errorMessage.history);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send(draft);
    }
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="inkling flex h-dvh w-full flex-col bg-white">
      <Navbar />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-5 sm:px-6">
        <header className="shrink-0 pt-10 pb-8">
          <div className="flex items-center gap-3">
            <InklingMark className="h-8 w-8 shrink-0 text-[#635BFF]" strokeWidth={1.8} />
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-[26px] font-bold tracking-tight text-gray-900">Inkling</h1>
              <span className="text-sm text-gray-500">@inkling</span>
            </div>
          </div>
          {/* Hangs under the name, not under the mark */}
          <p className="mt-3 max-w-[46ch] pl-11 font-serif text-[17px] leading-[1.7] text-gray-600">
            Reads what you've started. Helps you find the next line.
          </p>
        </header>

        {/* min-h-0 lets this shrink so only the thread scrolls, not the page */}
        <section className="inkling-thread flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto pb-8">
          {messages.map((message) =>
            message.from === 'user' ? (
              <YourLine key={message.id} message={message} />
            ) : (
              <InklingLine key={message.id} message={message} onRetry={retry} />
            ),
          )}

          {thinking && (
            <div className="flex gap-3.5">
              <InklingMark
                drawing
                className="mt-[5px] h-5 w-5 shrink-0 text-[#635BFF]"
                strokeWidth={2.6}
              />
              <p className="sr-only">Inkling is thinking</p>
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
          className="shrink-0 border-t border-gray-100 pt-4 pb-5"
        >
          {showSuggestions && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm text-gray-600 transition-colors duration-150 hover:border-[#635BFF] hover:text-[#635BFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635BFF]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={draftRef}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bring me something unfinished..."
              className="inkling-composer max-h-40 w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-[15px] leading-relaxed text-gray-900 outline-none transition-colors duration-150 placeholder:text-gray-500 focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF]"
            />

            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-white transition-colors duration-150 hover:bg-[#5249ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635BFF] disabled:bg-gray-100 disabled:text-gray-400"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M5 12h13M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="mt-2 pl-1 text-xs text-gray-500">
            Enter to send · Shift + Enter for a new line
          </p>
        </form>
      </main>
    </div>
  );
}
