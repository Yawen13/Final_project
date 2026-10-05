import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/U_logo.png';

export default function Navbar() {
  const location = useLocation();

  function linkClass(path) {
    return location.pathname === path
      ? 'text-sm font-medium text-gray-900'
      : 'text-sm font-medium text-gray-500 hover:text-gray-900';
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur">
      <img src={logoImg} alt="Unfinished Logo" className="h-8 w-auto" />

      <div className="hidden w-full max-w-sm md:block">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
        />
      </div>

      <nav className="flex items-center gap-5">
        <Link to="/home" className={linkClass('/home')}>
          Home
        </Link>
        <Link to="/explore" className={linkClass('/explore')}>
          Explore
        </Link>
        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Sign out
        </Link>
        <div className="h-9 w-9 rounded-full bg-gray-200" />
      </nav>
    </header>
  );
}