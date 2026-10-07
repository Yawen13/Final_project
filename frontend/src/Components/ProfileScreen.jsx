import { useState } from 'react';
import TopNav from './TopNav';

function MoreIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function LocationIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

// Shows the user's profile and supports creating, editing, deleting, and bookmarking posts.
export default function ProfileScreen({ profile, posts, bookmarks, onNavigate, onEdit, onCreatePost, onDeletePost, onEditPost, onSaveBookmark }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  const startEdit = (post) => {
    setEditingId(post.id);
    setDraftText(post.text);
    setOpenMenuId(null);
  };

  const saveEdit = (postId) => {
    const trimmed = draftText.trim();
    if (!trimmed) return;

    onEditPost(postId, trimmed);
    setEditingId(null);
    setDraftText('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setNewPostImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const publishPost = (event) => {
    event.preventDefault();
    const text = newPostText.trim();
    if (!text && !newPostImage) return;

    onCreatePost(text, newPostImage);
    setNewPostText('');
    setNewPostImage('');
    setIsComposerOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f2f5] text-slate-900">
      <TopNav activeItem="Profile" profile={profile} onNavigate={onNavigate} onCreatePost={() => setIsComposerOpen(true)} />

      <div className="mx-auto mt-8 box-border w-full max-w-[760px]">
        <div className="overflow-hidden rounded-t-[28px] border border-violet-100 bg-[linear-gradient(135deg,_#f3eaff_0%,_#f7effa_52%,_#faeeee_100%)] shadow-[0_18px_40px_rgba(109,40,217,0.08)]">
          <div className="h-[190px] sm:h-[210px]" />
        </div>
      </div>

      <main id="profile" className="relative z-10 mx-auto mt-0 box-border w-full max-w-[760px] overflow-visible rounded-b-[28px] rounded-t-none bg-white px-5 pb-8 pt-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative z-20 -mt-24 overflow-hidden rounded-full border-[5px] border-white bg-[#4E4C61] shadow-[0_8px_20px_rgba(15,23,42,0.16)]">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-[96px] w-[96px] object-cover sm:h-[108px] sm:w-[108px]" />
              ) : (
                <div className="flex h-[96px] w-[96px] items-center justify-center text-3xl font-bold text-white sm:h-[108px] sm:w-[108px]">
                  {profile.name?.slice(0, 2).toUpperCase() || 'JD'}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-slate-900 bg-white px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white hover:shadow-lg"
          >
            Edit profile
          </button>
        </div>

        <div className="mt-5">
          <h1 className="text-[29px] font-bold tracking-[-0.04em] text-slate-900">{profile.name}</h1>
          <p className="mt-1 text-base text-slate-500">{profile.username}</p>

          <p className="mt-4 max-w-xl text-[15px] leading-6 text-slate-700">{profile.bio}</p>

          {profile.status && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EFE7F4] px-3 py-1.5 text-xs font-medium text-[#4C2D84] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              {profile.status}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1.5">
              <LocationIcon className="h-4 w-4 text-slate-500" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1.5">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <span>Joined October 2026</span>
            </div>
          </div>

          <div className="mt-6 flex gap-8">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="text-lg font-bold text-slate-900">0</div>
              <div className="text-slate-500">Following</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="text-lg font-bold text-slate-900">99M</div>
              <div className="text-slate-500">Followers</div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2 rounded-full bg-[#F3F3F7] p-1.5 shadow-inner shadow-slate-200/60">
            {['Posts', 'Replies', 'Media', 'Likes'].map((tab, index) => (
              <button
                type="button"
                key={tab}
                className={
                  index === 0
                    ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
                    : 'rounded-full px-4 py-2 text-sm text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className={
                  index === 0
                    ? 'rounded-t-none rounded-[22px] bg-[#F7F7FB] px-4 pb-4 pt-4 shadow-sm ring-1 ring-slate-100 ring-offset-0'
                    : 'rounded-[22px] bg-[#F7F7FB] p-4 shadow-sm ring-1 ring-slate-100'
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4E4C61] text-xs font-bold text-white">
                    MK
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{profile.name}</span>{' '}
                        <span className="text-slate-500">{profile.username} · {post.time}</span>
                      </p>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId((current) => (current === post.id ? null : post.id))}
                          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                          aria-label="Post actions"
                        >
                          <MoreIcon className="h-4 w-4" />
                        </button>

                        {openMenuId === post.id && (
                          <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                onSaveBookmark(post);
                                setOpenMenuId(null);
                              }}
                              disabled={bookmarks.some((bookmark) => bookmark.id === `profile-${post.id}`)}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-default disabled:text-violet-700"
                            >
                              {bookmarks.some((bookmark) => bookmark.id === `profile-${post.id}`) ? 'Saved to bookmarks' : 'Save to bookmarks'}
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(post)}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmId(post.id);
                                setOpenMenuId(null);
                              }}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {deleteConfirmId === post.id ? (
                      <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-700">Delete this post?</p>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeletePost(post.id);
                              setDeleteConfirmId(null);
                            }}
                            className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
                          >
                            Yes, delete
                          </button>
                        </div>
                      </div>
                    ) : editingId === post.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={draftText}
                          onChange={(event) => setDraftText(event.target.value)}
                          rows="3"
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[15px] leading-6 text-slate-700 outline-none focus:border-[#635BFF]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setDraftText('');
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(post.id)}
                            className="rounded-full bg-[#635BFF] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#5249ea]"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-3">
                        {post.text && <p className="text-[15px] leading-6 text-slate-700">{post.text}</p>}
                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post attachment"
                            className="max-h-[480px] w-full rounded-2xl object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {isComposerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-post-title"
        >
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="compose-post-title" className="text-lg font-bold text-slate-900">Create a post</h2>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="rounded-full p-2 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close post composer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={publishPost}>
              <textarea
                value={newPostText}
                onChange={(event) => setNewPostText(event.target.value)}
                rows="5"
                maxLength={500}
                placeholder="What would you like to share?"
                className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#635BFF]"
              />

              {newPostImage && (
                <div className="relative mt-3">
                  <img src={newPostImage} alt="Selected post attachment" className="max-h-64 w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewPostImage('')}
                    className="absolute right-2 top-2 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-950"
                  >
                    Remove image
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <input
                    id="post-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="post-image-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="8.5" cy="9" r="1.5" />
                      <path d="m21 15-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Add image
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPostText.trim() && !newPostImage}
                    className="rounded-full bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}