import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/U_logo.png';
import InklingMark from './InklingMark';
import { clearSession, loadSession } from '../api/auth';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // Read once on mount: signing in navigates, which remounts the bar
  const [session] = useState(() => loadSession());

  function linkClass(path) {
    const base = 'shrink-0 whitespace-nowrap text-sm font-medium';
    return location.pathname === path
      ? `${base} text-gray-900`
      : `${base} text-gray-500 hover:text-gray-900`;
  }

  function menuItemClass(path) {
    return location.pathname === path
      ? 'block px-4 py-2.5 text-sm font-medium text-[#635BFF] hover:bg-gray-50'
      : 'block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50';
  }

  // Dismiss the account menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handleMouseDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleLogout() {
    setMenuOpen(false);
    clearSession();
    // replace: the logged-in page shouldn't come back on the browser Back button
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-y-1 border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur">
      <img src={logoImg} alt="Unfinished Logo" className="h-8 w-auto shrink-0" />

      {/* Below md the links drop onto their own scrollable row; from md up they
          sit out of the flex flow so they land in the true center of the bar */}
      <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto md:absolute md:inset-y-0 md:left-1/2 md:order-none md:w-auto md:-translate-x-1/2 md:overflow-visible">
        <Link to="/home" className={linkClass('/home')}>
          Home
        </Link>
        <Link to="/explore" className={linkClass('/explore')}>
          Explore
        </Link>
        <Link to="/inkling" className={`${linkClass('/inkling')} flex items-center gap-1.5`}>
          <InklingMark className="h-4 w-4" strokeWidth={2.6} />
          Inkling
        </Link>
        <Link to="/community" className={linkClass('/community')}>
          Communities
        </Link>
        <Link to="/premium" className={linkClass('/premium')}>
          Premium
        </Link>
        <Link to="/messages" className={linkClass('/messages')}>
          Messages
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {/* Held back to xl: six centred links need the room before that, and the
            field is inert anyway */}
        <div className="hidden xl:block xl:w-56">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
            className="block h-9 w-9 rounded-full bg-gray-200 hover:ring-2 hover:ring-[#635BFF]/30"
          />

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-sm font-semibold text-[#635BFF]">
                  {(session?.displayName || 'You').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {session?.displayName || 'You'}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    @{session?.username || 'you'}
                  </p>
                </div>
              </div>

              {/* The personal pages live here rather than in the centre of the
                  bar, so the links there stay to five */}
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className={menuItemClass('/profile')}
              >
                Profile
              </Link>
              <Link
                to="/bookmark"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className={menuItemClass('/bookmark')}
              >
                Bookmarks
              </Link>

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
