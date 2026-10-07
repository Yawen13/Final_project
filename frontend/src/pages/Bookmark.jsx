import TopNav from '../Components/TopNav';

// Lists saved posts and lets the user remove them from bookmarks.
export default function BookmarkPage({ bookmarks, onRemoveBookmark, onNavigate, onCreatePost, profile }) {
  return (
    <div className="min-h-screen bg-[#f5f4fa] text-slate-900">
      <TopNav activeItem="Bookmarks" profile={profile} onNavigate={onNavigate} onCreatePost={onCreatePost} />

      <main className="mx-auto w-full max-w-[640px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Bookmarks</h1>
            <p className="mt-1 text-sm text-slate-500">@JQK567</p>
          </div>
        </div>

        {bookmarks.length ? (
          <div className="space-y-3">
            {bookmarks.map((post) => (
              <article key={post.id} className="rounded-[22px] bg-white p-4 shadow-[0_6px_18px_rgba(31,24,65,0.05)] sm:p-5">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${post.color} text-xs font-bold text-white`}>
                    {post.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm">
                        <span className="font-semibold">{post.name}</span>{' '}
                        <span className="text-slate-500">{post.handle} · {post.time}</span>
                      </p>
                      <button type="button" onClick={() => onRemoveBookmark(post.id)} aria-label={`Remove ${post.name}'s post from bookmarks`} className="shrink-0 p-1 text-[#6953D7] transition hover:text-violet-900">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                          <path d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v14l-6.5-4-6.5 4V6A1.5 1.5 0 0 1 7 4.5Z" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-[15px] leading-6 text-slate-800">{post.text}</p>
                    {typeof post.image === 'string' ? (
                      <img src={post.image} alt="Post attachment" className="mt-3 max-h-[360px] w-full rounded-xl object-cover" />
                    ) : post.image && (
                      <div role="img" aria-label="Pastel illustration of a sunset over a flower field" className="relative mt-3 h-[190px] overflow-hidden rounded-xl bg-[#eee8ff] sm:h-[200px]">
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#d9cff7]" />
                        <div className="absolute bottom-[7%] left-[4%] right-[4%] h-[45%] bg-[#ffc8b7]" />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-semibold">No bookmarks yet</h2>
            <p className="mt-2 text-sm text-slate-500">Save posts you want to come back to and they’ll show up here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
