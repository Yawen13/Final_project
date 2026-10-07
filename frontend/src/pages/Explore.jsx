import React, { useMemo, useState } from 'react';
import Navbar from '../Components/Navbar';

const TRENDING_TAGS = ['#shortstories', '#worldbuilding', '#poetry', '#screenwriting', '#lyrics'];

const PLACEHOLDER_POSTS = [
  { id: 1, author: 'Maya Chen', handle: '@mayachen', preview: "The door was ajar when she got home, and she'd sworn she locked it...", tag: '#shortstories' },
  { id: 2, author: 'Daniel Ortiz', handle: '@danielortiz', preview: 'A kingdom held together by a single unspoken promise.', tag: '#worldbuilding' },
  { id: 3, author: 'Priya Nair', handle: '@priyanair', preview: 'the kettle hums / and I forget, for a second, / what I was mourning', tag: '#poetry' },
  { id: 4, author: 'Leo Fischer', handle: '@leofischer', preview: 'INT. DINER - NIGHT. Two strangers, one booth, and a secret neither will say first.', tag: '#screenwriting' },
  { id: 5, author: 'Ava Whitman', handle: '@avawhitman', preview: 'Verse one is done. Chorus keeps changing every time I sing it.', tag: '#lyrics' },
  { id: 6, author: 'Noah Kim', handle: '@noahkim', preview: 'She kept the map, even after the country on it stopped existing.', tag: '#shortstories' },
];

function Avatar({ name }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-xs font-semibold text-[#635BFF]">
      {initials}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-center gap-2">
        <Avatar name={post.author} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{post.author}</p>
          <p className="truncate text-xs text-gray-400">{post.handle}</p>
        </div>
      </div>
      <p className="text-sm text-gray-700">{post.preview}</p>
      <span className="text-xs font-medium text-[#635BFF]">{post.tag}</span>
    </div>
  );
}

export default function Explore() {
  const [activeTag, setActiveTag] = useState(null);

  const visiblePosts = useMemo(() => {
    if (!activeTag) return PLACEHOLDER_POSTS;
    return PLACEHOLDER_POSTS.filter((post) => post.tag === activeTag);
  }, [activeTag]);

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Explore</h1>
          <p className="mt-1 text-sm text-gray-500">Unfinished pieces worth picking up.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              activeTag === null ? 'border-[#635BFF] bg-[#635BFF] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                activeTag === tag ? 'border-[#635BFF] bg-[#635BFF] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>

        {visiblePosts.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">Nothing tagged {activeTag} yet.</p>
        )}
      </main>
    </div>
  );
}