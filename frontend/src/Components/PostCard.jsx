import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/postsStore';

function CommentIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <path
        d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.5-.3-3.6-.8L3 21l1.8-5.4A8.5 8.5 0 1 1 21 11.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RepostIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <path d="M17 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
      {...props}
    >
      <path
        d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ViewsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
      {...props}
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function formatCount(n) {
  if (!n) return '';
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}

function Avatar({ name }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-sm font-semibold text-[#635BFF]">
      {initials}
    </div>
  );
}

export default function PostCard({ post, isOwner = false, linkToPost = false, commentsOpen = false }) {
  const { toggleLike, toggleRepost, toggleBookmark, addComment, deletePost, editPost } = usePosts();
  const [showComments, setShowComments] = useState(commentsOpen);
  const [commentDraft, setCommentDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.text);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleComment(e) {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    addComment(post.id, commentDraft);
    setCommentDraft('');
  }

  function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
  }

  function saveEdit() {
    if (!editDraft.trim()) return;
    editPost(post.id, editDraft.trim());
    setIsEditing(false);
  }

  return (
    <article className="border-b border-gray-100 px-4 py-4">
      <div className="flex gap-3">
        <Avatar name={post.authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-gray-900">{post.authorName}</span>
              <span className="text-sm text-gray-400">{post.authorHandle}</span>
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Post actions"
                >
                  <MoreIcon />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDelete(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {confirmingDelete ? (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">Delete this post?</p>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deletePost(post.id)}
                  className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-full bg-[#635BFF] px-3 py-1 text-xs font-semibold text-white hover:bg-[#5249ea]"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {post.text &&
                (linkToPost ? (
                  <Link
                    to={`/post/${post.id}`}
                    className="mt-1 block text-gray-800 hover:underline"
                  >
                    {post.text}
                  </Link>
                ) : (
                  <p className="mt-1 text-gray-800">{post.text}</p>
                ))}
              {post.image && (
                <img src={post.image} alt="" className="mt-3 max-h-96 w-full rounded-2xl object-cover" />
              )}
              {post.video && <video src={post.video} controls className="mt-3 max-h-96 w-full rounded-2xl" />}
            </>
          )}

          <div className="mt-3 flex max-w-md items-center justify-between text-gray-500">
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1.5 hover:text-[#635BFF]"
            >
              <CommentIcon />
              <span className="text-xs">{formatCount(post.comments.length)}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleRepost(post.id)}
              className={`flex items-center gap-1.5 hover:text-green-600 ${post.repostedByMe ? 'text-green-600' : ''}`}
            >
              <RepostIcon />
              <span className="text-xs">{formatCount(post.repostCount)}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-1.5 hover:text-pink-600 ${post.likedByMe ? 'text-pink-600' : ''}`}
            >
              <HeartIcon filled={post.likedByMe} />
              <span className="text-xs">{formatCount(post.likeCount)}</span>
            </button>

            <span className="flex items-center gap-1.5 text-gray-400">
              <ViewsIcon />
              <span className="text-xs">{formatCount(post.viewCount)}</span>
            </span>

            <button
              type="button"
              onClick={() => toggleBookmark(post.id)}
              className={`hover:text-[#635BFF] ${post.bookmarked ? 'text-[#635BFF]' : ''}`}
            >
              <BookmarkIcon filled={post.bookmarked} />
            </button>

            <button type="button" onClick={handleShare} className="hover:text-[#635BFF]">
              <ShareIcon />
            </button>
          </div>

          {showComments && (
            <div className="mt-3 space-y-2 rounded-xl bg-gray-50 p-3">
              {post.comments.map((comment) => (
                <p key={comment.id} className="text-sm text-gray-700">
                  <span className="font-semibold">{comment.author}</span> {comment.text}
                </p>
              ))}
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-purple-600"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#635BFF] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#5249ea]"
                >
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}