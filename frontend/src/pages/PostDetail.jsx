import { Link, useParams } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';
import PostSkeleton from '../Components/PostSkeleton';
import { usePosts } from '../context/postsStore';
import { loadSession } from '../api/auth';

// A single post at /post/:postId, with its comments open. The post comes from
// the loaded feed, so a very old link can land on "not here" if it fell outside
// the feed's limit.
export default function PostDetail() {
  const { postId } = useParams();
  const { posts, loading } = usePosts();
  const session = loadSession();

  const post = posts.find((item) => String(item.id) === String(postId));

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Link
            to="/home"
            className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Post</h1>
        </div>

        {loading && <PostSkeleton />}

        {!loading && post && (
          <PostCard
            post={post}
            isOwner={post.authorId === session?.id}
            commentsOpen
          />
        )}

        {!loading && !post && (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-900">This post is not here</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              It may have been deleted, or it is older than the posts loaded in your feed.
            </p>
            <Link
              to="/home"
              className="mt-5 inline-block rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5249ea]"
            >
              Back to Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
