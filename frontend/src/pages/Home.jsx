import React, { useState } from 'react';
import Navbar from '../Components/Navbar';

const PLACEHOLDER_CONVERSATIONS = [
  {
    id: 1,
    author: 'Maya Chen',
    handle: '@mayachen',
    preview: "Still figuring out the ending, but here's where it's going so far...",
    timestamp: '2h',
  },
  {
    id: 2,
    author: 'Daniel Ortiz',
    handle: '@danielortiz',
    preview: 'Left this one open on purpose. Curious what you all think happens next.',
    timestamp: '5h',
  },
  {
    id: 3,
    author: 'Priya Nair',
    handle: '@priyanair',
    preview: "Rough draft, don't judge too hard. Just wanted to get it out there.",
    timestamp: '1d',
  },
];

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-sm font-semibold text-[#635BFF]">
      {initials}
    </div>
  );
}

function ConversationCard({ conversation }) {
  return (
    <div className="flex gap-3 border-b border-gray-100 px-4 py-4 hover:bg-gray-50">
      <Avatar name={conversation.author} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900">{conversation.author}</span>
          <span className="text-sm text-gray-400">{conversation.handle}</span>
          <span className="text-sm text-gray-400">· {conversation.timestamp}</span>
        </div>
        <p className="mt-1 truncate text-gray-700">{conversation.preview}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [draft, setDraft] = useState('');
  const [conversations, setConversations] = useState(PLACEHOLDER_CONVERSATIONS);

  function handlePost(e) {
    e.preventDefault();
    if (!draft.trim()) return;

    const newPost = {
      id: conversations.length + 1,
      author: 'You',
      handle: '@you',
      preview: draft.trim(),
      timestamp: 'now',
    };

    setConversations([newPost, ...conversations]);
    setDraft('');
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />

      <main className="mx-auto flex w-full max-w-2xl flex-col">
        <form onSubmit={handlePost} className="border-b border-gray-100 px-4 py-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's left unfinished today?"
            rows={3}
            className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-full bg-[#635BFF] px-6 py-2 font-medium text-white transition-colors hover:bg-[#5249ea] disabled:cursor-default disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>

        <section>
          {conversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </section>
      </main>
    </div>
  );
}