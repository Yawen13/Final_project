function HomeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.7 9.3-2.2 6.4-6.4 2.2 2.2-6.4 6.4-2.2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function MessageIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M5 18V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H9l-4 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AssistantIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="7" width="16" height="13" rx="4" />
      <path d="M12 4v3M9 12h.01M15 12h.01M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v14l-6.5-4-6.5 4V6A1.5 1.5 0 0 1 7 4.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M16 19a4 4 0 0 0-8 0" strokeLinecap="round" />
      <circle cx="12" cy="8" r="3.2" />
      <path d="M19 19a4 4 0 0 0-2.5-3.6M5 19a4 4 0 0 1 2.5-3.6" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L3.2 9.2l6.1-.9L12 2.8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

// Displays shared page navigation and the current user's account avatar.
export default function TopNav({ activeItem = 'Profile', onCreatePost, onNavigate, profile }) {
  const menuItems = [
    { label: 'Home', href: '#home', icon: HomeIcon },
    { label: 'Explore', href: '#explore', icon: CompassIcon },
    { label: 'Notifications', href: '#notifications', icon: BellIcon },
    { label: 'Messages', href: '#messages', icon: MessageIcon },
    { label: 'Assistant', href: '#assistant', icon: AssistantIcon },
    { label: 'Bookmarks', href: '#bookmarks', icon: BookmarkIcon },
    { label: 'Communities', href: '#communities', icon: UsersIcon },
    { label: 'Premium', href: '#premium', icon: StarIcon },
    { label: 'Profile', href: '#profile', icon: UserIcon },
  ];

  return (
    <header className="sticky top-0 z-30 mx-auto box-border flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100/90 sm:px-6 md:flex-nowrap md:gap-4">
      <nav aria-label="Main navigation" className="order-2 flex w-full items-center justify-between gap-0 overflow-visible text-[12px] text-slate-600 md:order-1 md:min-w-0 md:flex-1 md:justify-center md:gap-1 md:overflow-x-auto">
        {menuItems.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            onClick={(event) => {
              event.preventDefault();
              onNavigate?.(label);
            }}
            aria-current={label === activeItem ? 'page' : undefined}
            aria-label={label}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-2 transition md:gap-2 md:px-2.5 ${
              label === activeItem
                ? 'bg-[#F1ECFF] text-[#5B45B5] shadow-sm'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{label}</span>
          </a>
        ))}
      </nav>

      <div className="order-1 ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:order-2 md:ml-0">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-slate-700 transition hover:bg-slate-200"
          aria-label="Search"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCreatePost}
          className="rounded-full bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
        >
          Post
        </button>
        <button
          type="button"
          onClick={() => onNavigate?.('Profile')}
          aria-label={`Your account: ${profile?.name || 'Profile'}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4E4C61] text-[12px] font-bold text-white shadow-sm"
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            profile?.name?.slice(0, 2).toUpperCase() || 'JD'
          )}
        </button>
      </div>
    </header>
  );
}
