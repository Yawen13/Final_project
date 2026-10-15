import React, { useRef, useState } from 'react';
import Navbar from '../Components/Navbar';
import PostCard from '../Components/PostCard';
import { usePosts } from '../context/PostsContext';

const CURRENT_USER = {
  authorId: 'you',
  authorName: 'You',
  authorHandle: '@you',
};

export default function Home() {
  const { posts, addPost } = usePosts();
  const [draft, setDraft] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState(''); // 'image' | 'video'
  const fileInputRef = useRef(null);

  function handleMediaChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
      setMediaType(isVideo ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  }

  function removeMedia() {
    setMediaPreview('');
    setMediaType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handlePost(e) {
    e.preventDefault();
    if (!draft.trim() && !mediaPreview) return;

    addPost({
      ...CURRENT_USER,
      text: draft.trim(),
      image: mediaType === 'image' ? mediaPreview : '',
      video: mediaType === 'video' ? mediaPreview : '',
    });

    setDraft('');
    removeMedia();
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
              disabled={!draft.trim() && !mediaPreview}
              className="rounded-full bg-[#635BFF] px-6 py-2 font-medium text-white transition-colors hover:bg-[#5249ea] disabled:cursor-default disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>

        <section>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} isOwner={post.authorId === CURRENT_USER.authorId} />
          ))}
        </section>
      </main>
    </div>
  );
}