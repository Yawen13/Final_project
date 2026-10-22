import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';
import PostSkeleton from '../Components/PostSkeleton';
import { getUser } from '../api/users';
import { listUserPosts } from '../api/posts';
import { startConversation } from '../api/messages';
import { loadSession } from '../api/auth';
import { initialsOf } from '../lib/names';

function joinedLabel(createdAt) {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

// Another person's public profile, with the entry point for starting a chat.
export default function UserProfile() {
  const { username = '' } = useParams();
  const navigate = useNavigate();
  const session = loadSession();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [state, setState] = useState('loading');
  const [starting, setStarting] = useState(false);

  const isMe =
    Boolean(session?.username) &&
    session.username.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    let cancelled = false;

    getUser(username)
      .then((profile) => {
        if (cancelled) return;
        if (!profile) {
          setState('missing');
          return null;
        }

        setUser(profile);
        return listUserPosts(username, { userId: session?.id }).then((rows) => {
          if (cancelled) return;
          setPosts(rows);
          setState('ready');
        });
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [username, session?.id]);

  async function handleMessage() {
    if (!session?.id) {
      navigate('/');
      return;
    }
    if (!user) return;

    setStarting(true);
    try {
      const conversation = await startConversation({
        userId: session.id,
        participant: {
          id: user.userId,
          name: user.displayName,
          handle: `@${user.username}`,
          avatar: user.profileImageUrl || '',
        },
      });
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('[messages] Could not start the conversation', error);
    } finally {
      setStarting(false);
    }
  }

  const displayName = user?.displayName || username;

  return (
    <div className="min-h-screen bg-[#f5f4fa] text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {state === 'loading' && (
          <div className="overflow-hidden rounded-[22px] bg-white shadow-sm">
            <div className="h-28 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-6">
              <div className="h-6 w-40 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-56 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        )}

        {state === 'missing' && (
          <div className="rounded-[22px] bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-base font-semibold">This account is not here</p>
            <p className="mt-2 text-sm text-slate-500">
              Nobody on Unfinished uses @{username}.
            </p>
            <Link
              to="/home"
              className="mt-5 inline-block rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5249ea]"
            >
              Back to Home
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className="rounded-[22px] bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-base font-semibold">Could not load this profile</p>
            <p className="mt-2 text-sm text-slate-500">Check your connection and try again.</p>
          </div>
        )}

        {state === 'ready' && user && (
          <>
            <section className="overflow-hidden rounded-[22px] bg-white shadow-sm">
              <div className="h-24 bg-[linear-gradient(135deg,_#f3eaff_0%,_#f7effa_52%,_#faeeee_100%)]" />

              <div className="px-5 pb-5 sm:px-6">
                <div className="-mt-10 flex items-end justify-between gap-4">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="h-20 w-20 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#4E4C61] text-2xl font-bold text-white">
                      {initialsOf(displayName) || 'U'}
                    </span>
                  )}

                  {isMe ? (
                    <Link
                      to="/profile"
                      className="rounded-full border border-slate-900 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-900 hover:text-white"
                    >
                      Your profile
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMessage}
                      disabled={starting}
                      className="rounded-full bg-[#635BFF] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5249ea] disabled:cursor-default disabled:opacity-60"
                    >
                      {starting ? 'Opening…' : 'Message'}
                    </button>
                  )}
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight">{displayName}</h1>
                <p className="text-sm text-slate-500">@{user.username}</p>

                {user.bio && <p className="mt-3 text-[15px] leading-6 text-slate-700">{user.bio}</p>}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  {user.location && (
                    <span className="rounded-full bg-slate-50 px-3 py-1.5">{user.location}</span>
                  )}
                  {user.status && (
                    <span className="rounded-full bg-[#EFE7F4] px-3 py-1.5 text-[#4C2D84]">
                      {user.status}
                    </span>
                  )}
                  {joinedLabel(user.createdAt) && (
                    <span className="rounded-full bg-slate-50 px-3 py-1.5">
                      Joined {joinedLabel(user.createdAt)}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex gap-8 text-sm text-slate-500">
                  <span>
                    <strong className="mr-1 text-slate-900">{user.followingCount ?? 0}</strong>
                    Following
                  </span>
                  <span>
                    <strong className="mr-1 text-slate-900">{user.followerCount ?? 0}</strong>
                    Followers
                  </span>
                </div>
              </div>
            </section>

            <h2 className="mb-3 mt-7 text-sm font-semibold text-slate-600">Posts</h2>

            <section className="overflow-hidden rounded-[22px] bg-white shadow-sm">
              {posts.length === 0 && (
                <p className="px-6 py-12 text-center text-sm text-slate-500">
                  No posts yet.
                </p>
              )}
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwner={isMe && post.authorId === session?.id}
                  linkToPost
                />
              ))}
            </section>
          </>
        )}

        {state === 'loading' && (
          <div className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-sm">
            <PostSkeleton />
          </div>
        )}
      </main>
    </div>
  );
}
