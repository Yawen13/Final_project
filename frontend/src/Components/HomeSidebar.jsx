import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadSession } from '../api/auth';
import { loadCommunities } from '../api/communities';
import { hashtagsFrom } from '../lib/tags';
import { initialsOf } from '../lib/names';

// Wide-screen companion column: the account, tags used in the feed, and the
// communities this account joined.
export default function HomeSidebar({ posts }) {
  const session = useMemo(() => loadSession(), []);
  const communities = useMemo(
    () => loadCommunities().filter((community) => community.joined).slice(0, 3),
    [],
  );
  const trends = useMemo(() => hashtagsFrom(posts).slice(0, 5), [posts]);

  const name = session?.displayName || session?.username || 'You';
  const handle = session?.username ? `@${session.username}` : '';

  return (
    <aside className="hidden lg:sticky lg:top-20 lg:flex lg:max-h-[calc(100vh-6rem)] lg:flex-col lg:gap-4 lg:self-start lg:overflow-y-auto">
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <Link to="/profile" className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-sm font-semibold text-[#635BFF]">
            {initialsOf(name) || 'U'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-gray-900">{name}</span>
            <span className="block truncate text-xs text-gray-400">{handle}</span>
          </span>
        </Link>

        {session?.bio && (
          <p className="mt-3 text-sm leading-6 text-gray-600">{session.bio}</p>
        )}

        <Link
          to="/profile"
          className="mt-3 inline-block text-sm font-medium text-[#635BFF] hover:underline"
        >
          View profile
        </Link>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Trending tags</h2>
          <Link to="/explore" className="text-xs font-medium text-[#635BFF] hover:underline">
            See all
          </Link>
        </div>

        {trends.length > 0 ? (
          <ul className="mt-2">
            {trends.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  to={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-50"
                >
                  <span className="truncate font-medium text-gray-800">{tag}</span>
                  <span className="shrink-0 text-xs text-gray-400">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 px-2 text-sm leading-6 text-gray-400">
            Tags show up here when posts use #hashtags.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Your communities</h2>
          <Link to="/community" className="text-xs font-medium text-[#635BFF] hover:underline">
            Manage
          </Link>
        </div>

        {communities.length > 0 ? (
          <ul className="mt-2">
            {communities.map((community) => (
              <li
                key={community.id}
                className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm"
              >
                <span className="truncate text-gray-800">{community.name}</span>
                <span className="shrink-0 text-xs text-gray-400">{community.members}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 px-2 text-sm leading-6 text-gray-400">No communities yet.</p>
        )}

        <Link
          to="/community"
          className="mt-3 inline-block text-sm font-medium text-[#635BFF] hover:underline"
        >
          Find a community
        </Link>
      </section>

      <p className="px-2 text-xs leading-5 text-gray-400">
        A place for work that is not finished yet.
      </p>
    </aside>
  );
}
