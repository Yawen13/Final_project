import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { usePosts } from '../context/postsStore';
import { useAccount } from '../context/accountStore';
import { relativeTime } from '../lib/time';
import { useAvatar, usernameFromHandle } from '../lib/avatars';
import { hashtagsFrom } from '../lib/tags';

function Avatar({ name = '', src = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#635BFF]/10 text-xs font-semibold text-[#635BFF]">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials || 'U'
      )}
    </div>
  );
}

function PostCard({ post }) {
  const account = useAccount();
  const resolvedAvatar = useAvatar(post.authorHandle);
  const isOwnPost =
    Boolean(account?.username) &&
    usernameFromHandle(post.authorHandle).toLowerCase() === account.username.toLowerCase();
  const avatar = isOwnPost ? account.avatar || resolvedAvatar : resolvedAvatar;

  return (
    <div className="mb-4 flex break-inside-avoid flex-col gap-3 rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-center gap-2">
        <Avatar name={post.authorName} src={avatar} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{post.authorName}</p>
          <p className="truncate text-xs text-gray-400">
            {post.authorHandle} · {relativeTime(post.createdAt)}
          </p>
        </div>
      </div>
      <p className="line-clamp-6 text-sm leading-6 text-gray-700">{post.text}</p>
      {post.image && (
        <img src={post.image} alt="" className="max-h-64 w-full rounded-xl object-cover" />
      )}
    </div>
  );
}

export default function Explore() {
  const { posts, loading, error } = usePosts();
  // The tag lives in the URL so the sidebar can link straight to it
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  const tags = useMemo(
    () => hashtagsFrom(posts).slice(0, 8).map((entry) => entry.tag),
    [posts],
  );
  const visiblePosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((post) => (post.text || '').toLowerCase().includes(activeTag));
  }, [posts, activeTag]);

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
            onClick={() => setSearchParams({})}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              activeTag === null ? 'border-[#635BFF] bg-[#635BFF] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchParams({ tag })}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                activeTag === tag ? 'border-[#635BFF] bg-[#635BFF] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <section className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>

        {!loading && error && (
          <p className="py-12 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && visiblePosts.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            {activeTag ? `Nothing tagged ${activeTag} yet.` : 'No posts yet. Share something on Home first.'}
          </p>
        )}
      </main>
    </div>
  );
}
