import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Inkling from './pages/Inkling';
import ProfileScreen from './components/ProfileScreen';
import EditProfilePage from './pages/EditProfile';
import BookmarkPage from './pages/Bookmark';
import CommunityPage from './pages/Community';
import PremiumPage from './pages/Premium';
import Messages from './pages/Messages';
import PostDetail from './pages/PostDetail';
import { PostsProvider } from './context/PostsContext';
import { usePosts } from './context/postsStore';
import { relativeTime } from './lib/time';
import { loadSession, saveSession } from './api/auth';
import { clearProfileOverride, loadProfileOverride, saveProfileOverride } from './api/profile';
import { getUser, updateUser } from './api/users';

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// The signed-in account is the profile; GET /users/:username fills in the
// fields login does not carry, and anything the edit form could not save to
// the server is layered on from localStorage.
function buildProfile(session, account) {
  const username = account?.username || session?.username || '';
  const base = {
    name: account?.displayName || session?.displayName || username,
    username: username ? `@${username}` : '',
    bio: account?.bio ?? session?.bio ?? '',
    location: account?.location || '',
    status: account?.status || '',
    avatar: account?.profileImageUrl || '',
    createdAt: account?.createdAt || session?.createdAt || '',
    followerCount: account?.followerCount ?? 0,
    followingCount: account?.followingCount ?? 0,
  };

  const override = loadProfileOverride(session?.id);
  return override ? { ...base, ...override } : base;
}

function AppRoutes({ session }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, addPost, deletePost, editPost, toggleBookmark } = usePosts();

  const [account, setAccount] = useState(null);
  // Ignore a record fetched for a different account (e.g. right after logout)
  const activeAccount = account?.username === session?.username ? account : null;

  useEffect(() => {
    const username = session?.username;
    if (!username) return undefined;

    let cancelled = false;
    getUser(username)
      .then((user) => {
        if (!cancelled) setAccount(user);
      })
      .catch(() => {
        // Keep the session values when the profile lookup fails
      });

    return () => {
      cancelled = true;
    };
  }, [session?.username, location.pathname]);

  const profile = useMemo(() => buildProfile(session, activeAccount), [session, activeAccount]);

  // Profile shows only the posts this account wrote
  const profilePosts = posts
    .filter((post) => session && post.authorId === session.id)
    .map((post) => ({ ...post, time: relativeTime(post.createdAt) }));

  // One bookmark list, shared by the bookmark page and the profile menu
  const bookmarkedPosts = posts.filter((post) => post.bookmarked);
  const bookmarksForPage = bookmarkedPosts.map((post) => ({
    id: post.id,
    name: post.authorName,
    handle: post.authorHandle,
    initials: initialsOf(post.authorName),
    color: 'bg-[#4E4C61]',
    time: relativeTime(post.createdAt),
    text: post.text,
    image: post.image || undefined,
  }));
  const bookmarksForProfile = bookmarkedPosts.map((post) => ({
    ...post,
    id: `profile-${post.id}`,
  }));

  const author = {
    authorId: session?.id || 'local',
    authorName: profile.name || 'You',
    authorHandle: profile.username,
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/inkling" element={<Inkling />} />
      <Route
        path="/profile"
        element={
          <ProfileScreen
            profile={profile}
            posts={profilePosts}
            bookmarks={bookmarksForProfile}
            onEdit={() => navigate('/edit-profile')}
            onCreatePost={(text, image) => addPost({ ...author, text, image })}
            onDeletePost={deletePost}
            onEditPost={editPost}
            onSaveBookmark={(post) => toggleBookmark(post.id)}
          />
        }
      />
      <Route
        path="/edit-profile"
        element={
          <EditProfilePage
            profile={profile}
            onSave={async (nextProfile) => {
              try {
                if (!session?.username || !session?.id) throw new Error('Not signed in');

                await updateUser(session.username, {
                  userId: session.id,
                  displayName: nextProfile.name,
                  bio: nextProfile.bio,
                  location: nextProfile.location,
                  status: nextProfile.status,
                  profileImageUrl: nextProfile.avatar,
                });
                // The server is the source of truth now
                clearProfileOverride(session.id);
              } catch {
                // Older backend without PATCH /users/:username — keep the edit
                // on this device so the form still appears to save
                saveProfileOverride(session?.id, nextProfile);
              }
              // The navbar and composer read the session, so keep it in step
              if (session?.id) {
                saveSession({
                  ...session,
                  displayName: nextProfile.name,
                  bio: nextProfile.bio,
                });
              }
              navigate('/profile');
            }}
            onCancel={() => navigate('/profile')}
          />
        }
      />
      <Route
        path="/bookmark"
        element={
          <BookmarkPage
            bookmarks={bookmarksForPage}
            onRemoveBookmark={(bookmarkId) => toggleBookmark(bookmarkId)}
          />
        }
      />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/premium" element={<PremiumPage />} />
      {/* The open thread lives in the URL so Back returns to the list */}
      <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:conversationId" element={<Messages />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      {/* Anything unknown (e.g. a stale link) goes back to the login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppShell() {
  const location = useLocation();
  // Signing in and out both end in a navigation, so the route is the signal
  // that the stored session may have changed. The dependency is deliberate.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const session = useMemo(() => loadSession(), [location.pathname]);

  return (
    // Keyed by account: each user gets their own feed, bookmarks included
    <PostsProvider
      key={session?.id || 'guest'}
      ownerId={session?.id}
      ownerName={session?.displayName || session?.username || ''}
    >
      <AppRoutes session={session} />
    </PostsProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
