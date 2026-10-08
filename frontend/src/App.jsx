import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

const initialProfile = {
  name: 'JQK',
  username: '@JQK567',
  location: 'Chiang Mai, Thailand',
  bio: 'Design student · building Unifinish with my "Excellent 5" team 🎓✨',
  status: 'Open to new ideas',
  avatar: '',
};

const initialPosts = [
  {
    id: 1,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    time: '2h',
  },
  {
    id: 2,
    text: 'Exam  is next week, wish us luck!',
    time: '1d',
  },
];

const initialBookmarks = [
  { id: 'sample-1', initials: 'JL', name: 'Jordan Lee', handle: '@jordanlee', time: '1h', color: 'bg-[#6953D7]', text: 'There was a football match today! ⚽' },
  { id: 'sample-2', initials: 'AC', name: 'Amara Chen', handle: '@amarafields', time: '5h', color: 'bg-[#F06D5F]', text: 'Chasing golden hour through the flower fields 🌾', image: true },
  { id: 'sample-3', initials: 'KP', name: 'Kai Park', handle: '@kaipark', time: '10h', color: 'bg-[#4E4C61]', text: 'Anyone else counting down to the World Cup? 🏆' },
];

// Owns the profile/post/bookmark data the social pages share.
function AppRoutes() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [posts, setPosts] = useState(initialPosts);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  const handleDeletePost = (postId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
  };

  const handleEditPost = (postId, nextText) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? { ...post, text: nextText } : post)),
    );
  };

  const handleCreatePost = (text, image) => {
    setPosts((currentPosts) => [{ id: Date.now(), text, image, time: 'now' }, ...currentPosts]);
  };

  const handleSaveBookmark = (post) => {
    setBookmarks((currentBookmarks) => {
      const bookmarkId = `profile-${post.id}`;
      if (currentBookmarks.some((bookmark) => bookmark.id === bookmarkId)) {
        return currentBookmarks;
      }

      return [
        {
          ...post,
          id: bookmarkId,
          name: profile.name,
          handle: profile.username,
          initials: profile.name.slice(0, 2).toUpperCase(),
          color: 'bg-[#4E4C61]',
        },
        ...currentBookmarks,
      ];
    });
  };

  const handleRemoveBookmark = (bookmarkId) => {
    setBookmarks((currentBookmarks) =>
      currentBookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
    );
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
            posts={posts}
            bookmarks={bookmarks}
            onEdit={() => navigate('/edit-profile')}
            onCreatePost={handleCreatePost}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
            onSaveBookmark={handleSaveBookmark}
          />
        }
      />
      <Route
        path="/edit-profile"
        element={
          <EditProfilePage
            profile={profile}
            onSave={(nextProfile) => {
              setProfile(nextProfile);
              navigate('/profile');
            }}
            onCancel={() => navigate('/profile')}
          />
        }
      />
      <Route
        path="/bookmark"
        element={
          <BookmarkPage bookmarks={bookmarks} onRemoveBookmark={handleRemoveBookmark} />
        }
      />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/premium" element={<PremiumPage />} />
      {/* The open thread lives in the URL so Back returns to the list */}
      <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:conversationId" element={<Messages />} />
      {/* Anything unknown (e.g. a stale link) goes back to the login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
