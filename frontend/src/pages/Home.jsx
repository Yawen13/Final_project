import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';
import PostSkeleton from '../Components/PostSkeleton';
import HomeSidebar from '../Components/HomeSidebar';
import { usePosts } from '../context/postsStore';
import { loadSession } from '../api/auth';
import { uploadMedia } from '../api/uploads';
import { timeValue } from '../lib/time';

const SORTS = [
  { id: 'latest', label: 'Latest' },
  { id: 'top', label: 'Top' },
];

// The signed-in account, read when the page mounts (it remounts on navigation)
function currentUser() {
  const session = loadSession();

  return {
    authorId: session?.id || 'local',
    authorName: session?.displayName || session?.username || 'You',
    authorHandle: session?.username ? `@${session.username}` : '',
  };
}

function engagementScore(post) {
  return (
    (post.likeCount || 0) * 2 +
    (post.repostCount || 0) * 2 +
    (post.comments?.length || 0) * 3
  );
}

export default function Home() {
  const { posts, addPost, loading, error, refresh, countNewPosts } = usePosts();
  const [user] = useState(currentUser);
  const [draft, setDraft] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState(''); // 'image' | 'video'
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [sort, setSort] = useState('latest');
  const [pendingCount, setPendingCount] = useState(0);
  const fileInputRef = useRef(null);
  const composerRef = useRef(null);

  // Poll for posts other people added, so the "new posts" pill can appear
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      countNewPosts()
        .then((count) => setPendingCount(count))
        .catch(() => {
          // Offline or backend asleep — try again on the next tick
        });
    }, 60_000);

    return () => clearInterval(timer);
  }, [countNewPosts]);

  const visiblePosts = useMemo(() => {
    const list = [...posts];

    if (sort === 'top') {
      list.sort(
        (a, b) =>
          engagementScore(b) - engagementScore(a) ||
          timeValue(b.createdAt) - timeValue(a.createdAt),
      );
    } else {
      list.sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));
    }

    return list;
  }, [posts, sort]);

  function handleMediaChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPostError('');
    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  }

  function removeMedia() {
    if (mediaPreview.startsWith('blob:')) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handlePost(e) {
    e.preventDefault();
    if ((!draft.trim() && !mediaFile) || posting) return;

    setPosting(true);
    setPostError('');

    try {
      // Files go to storage first; the post itself only carries the URL
      const mediaUrl = mediaFile ? await uploadMedia(mediaFile) : '';

      const created = await addPost({
        ...user,
        text: draft.trim(),
        image: mediaType === 'image' ? mediaUrl : '',
        video: mediaType === 'video' ? mediaUrl : '',
      });

      if (!created) {
        setPostError('Could not publish the post. Try again.');
        return;
      }

      setDraft('');
      setPendingCount(0);
      removeMedia();
    } catch (error) {
      setPostError(error.message || 'Could not upload that file.');
    } finally {
      setPosting(false);
    }
  }

  async function showNewPosts() {
    try {
      await refresh();
    } catch {
      // Keep the pill so the user can try again
      return;
    }

    setPendingCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />

      {pendingCount > 0 && (
        <button
          type="button"
          onClick={showNewPosts}
          className="fixed left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#635BFF]/30 transition-colors hover:bg-[#5249ea]"
        >
          {pendingCount} new {pendingCount === 1 ? 'post' : 'posts'} · Show
        </button>
      )}

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="mx-auto w-full max-w-2xl">
          <form onSubmit={handlePost} className="border-b border-gray-100 px-4 py-4">
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's left unfinished today?"
              rows={3}
              className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />

            {mediaPreview && (
              <div className="relative mt-3">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} controls className="max-h-72 w-full rounded-2xl" />
                ) : (
                  <img src={mediaPreview} alt="" className="max-h-72 w-full rounded-2xl object-cover" />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                >
                  Remove
                </button>
              </div>
            )}

            {postError && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                {postError}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
                Add photo / video
              </label>

              <button
                type="submit"
                disabled={(!draft.trim() && !mediaFile) || posting}
                className="rounded-full bg-[#635BFF] px-6 py-2 font-medium text-white transition-colors hover:bg-[#5249ea] disabled:cursor-default disabled:opacity-50"
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex rounded-full bg-gray-100 p-1" role="tablist" aria-label="Feed order">
              {SORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={sort === option.id}
                  onClick={() => setSort(option.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    sort === option.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {!loading && (
              <span className="ml-auto text-xs text-gray-400">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            )}
          </div>

          <section aria-label="Feed">
            {loading &&
              [0, 1, 2].map((row) => <PostSkeleton key={row} />)}

            {!loading && error && (
              <p className="px-4 py-16 text-center text-sm text-red-500">{error}</p>
            )}

            {!loading && !error && visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwner={post.authorId === user.authorId}
                linkToPost
              />
            ))}

            {!loading && !error && posts.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-gray-900">Your feed is empty</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Write the first post, or look at what other people are working on in Explore.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => composerRef.current?.focus()}
                    className="rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5249ea]"
                  >
                    Write a post
                  </button>
                  <Link
                    to="/explore"
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        <HomeSidebar posts={posts} />
      </main>
    </div>
  );
}
