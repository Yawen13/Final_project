import { useState } from 'react';
import TopNav from '../components/TopNav';

const initialCommunities = [
  { id: 'product-design', name: 'Product Design', description: 'Share your process, feedback, and inspiration.', members: '12.4K', joined: true, tone: 'violet' },
  { id: 'football-fans', name: 'Football Fans', description: 'The home for match day conversations.', members: '48.1K', joined: true, tone: 'peach' },
  { id: 'oss', name: 'Open Source Builders', description: 'Ship, review, and talk shop with fellow maintainers.', members: '24.5K', joined: false, tone: 'violet' },
  { id: 'world-cup', name: 'World Cup 2026', description: 'Match threads, predictions, and live reactions.', members: '182K', joined: false, tone: 'peach' },
  { id: 'swimming', name: 'Swimming Championships', description: 'Heats, splits, and podium talk from fans and athletes.', members: '8.2K', joined: false, tone: 'violet' },
  { id: 'film', name: 'Film & TV', description: 'Reviews, trailers, and festival buzz.', members: '36.1K', joined: false, tone: 'peach' },
];

// Lets users discover, join, leave, and create communities.
export default function CommunityPage({ onNavigate, onCreatePost, profile }) {
  const [communities, setCommunities] = useState(initialCommunities);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');

  const toggleMembership = (communityId) => {
    setCommunities((current) => current.map((community) =>
      community.id === communityId ? { ...community, joined: !community.joined } : community,
    ));
  };

  const createCommunity = (event) => {
    event.preventDefault();
    const name = communityName.trim();
    if (!name) return;

    setCommunities((current) => [
      { id: `new-${Date.now()}`, name, description: communityDescription.trim() || 'A new place to share and connect.', members: '1', joined: true, tone: 'violet' },
      ...current,
    ]);
    setCommunityName('');
    setCommunityDescription('');
    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f4fa] text-slate-900">
      <TopNav activeItem="Communities" profile={profile} onNavigate={onNavigate} onCreatePost={onCreatePost} />

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Communities</h1>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="rounded-full bg-[#6355d9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5144c4]">
            <span aria-hidden="true" className="mr-2">＋</span>Create community
          </button>
        </div>

        <section className="mt-7" aria-labelledby="your-communities-heading">
          <h2 id="your-communities-heading" className="mb-3 text-sm font-semibold">Your communities</h2>
          <div className="flex flex-wrap gap-3">
            {communities.filter((community) => community.joined).map((community) => (
              <div key={community.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${community.tone === 'peach' ? 'bg-[#fff0ed] text-[#e77b6e]' : 'bg-[#f0eaff] text-[#6953d7]'}`} aria-hidden="true">
                  {community.tone === 'peach' ? '▥' : '♟'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{community.name}</p>
                  <p className="text-xs text-slate-500">{community.members} members</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMembership(community.id)}
                  aria-label={`Leave ${community.name}`}
                  className="ml-2 shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Leave
                </button>
              </div>
            ))}
            {!communities.some((community) => community.joined) && (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">Join a community to see it here.</p>
            )}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="discover-communities-heading">
          <h2 id="discover-communities-heading" className="mb-3 text-sm font-semibold">Discover new communities</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {communities.filter((community) => !community.joined).map((community) => (
              <article key={community.id} className="overflow-hidden rounded-[22px] bg-white shadow-[0_6px_18px_rgba(31,24,65,0.05)]">
                <div className={`relative h-[145px] overflow-hidden ${community.tone === 'peach' ? 'bg-[#fff0ed]' : 'bg-[#f0eaff]'}`} aria-hidden="true">
                  <span className={`absolute -right-2 -top-8 h-28 w-28 rounded-full ${community.tone === 'peach' ? 'bg-[#ffd9d1]' : 'bg-[#ded2ff]'}`} />
                  <span className={`absolute -bottom-14 left-1/3 h-32 w-32 rounded-full ${community.tone === 'peach' ? 'bg-[#ffe6df]' : 'bg-[#e8defe]'}`} />
                </div>
                <div className="flex items-end justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{community.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{community.description}</p>
                    <p className="mt-4 text-xs text-slate-400">{community.members} members</p>
                  </div>
                  <button type="button" onClick={() => toggleMembership(community.id)} className="shrink-0 rounded-full border border-slate-900 bg-white px-4 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white">
                    Join
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="create-community-title">
          <form onSubmit={createCommunity} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="create-community-title" className="text-lg font-bold">Create a community</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-full px-2 py-1 text-xl text-slate-500 hover:bg-slate-100" aria-label="Close">&times;</button>
            </div>
            <label htmlFor="community-name" className="mb-2 block text-sm font-medium">Name</label>
            <input id="community-name" value={communityName} onChange={(event) => setCommunityName(event.target.value)} maxLength={48} required className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-400" placeholder="e.g. Product Design" />
            <label htmlFor="community-description" className="mb-2 block text-sm font-medium">Description</label>
            <textarea id="community-description" value={communityDescription} onChange={(event) => setCommunityDescription(event.target.value)} rows="3" maxLength={160} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-400" placeholder="What will people talk about?" />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" className="rounded-full bg-[#6355d9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5144c4]">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
