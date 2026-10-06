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

function SparkIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
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

function PencilIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeLinecap="round" strokeLinejoin="round" />
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

export default function TopNav({ activeItem = 'Profile', onCreatePost }) {
  const menuItems = [
    { label: 'Home', href: '#home', icon: HomeIcon },
    { label: 'Explore', href: '#explore', icon: CompassIcon },
    { label: 'Notifications', href: '#notifications', icon: BellIcon },
    { label: 'Messages', href: '#messages', icon: MessageIcon },
    { label: 'Assistant', href: '#assistant', icon: SparkIcon },
    { label: 'Bookmarks', href: '#bookmarks', icon: BookmarkIcon },
    { label: 'Communities', href: '#communities', icon: UsersIcon },
    { label: 'Premium', href: '#premium', icon: StarIcon },
    { label: 'Profile', href: '#profile', icon: PencilIcon },
  ];

  return (
    <header className="mx-auto box-border flex w-full max-w-[1280px] items-center justify-between bg-white px-6 py-3 shadow-sm ring-1 ring-slate-100/90">
      <div className="min-w-[88px]" aria-hidden="true" />

      <nav className="hidden items-center gap-1 text-[12px] text-slate-600 md:flex">
        {menuItems.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            aria-current={label === activeItem ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-2 transition ${
              label === activeItem
                ? 'bg-[#F1F3F9] text-slate-900 shadow-sm'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
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
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4E4C61] text-[12px] font-bold text-white shadow-sm">
          MK
        </div>
      </div>
    </header>
  );
}
