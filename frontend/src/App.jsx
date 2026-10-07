import { useState } from 'react';
import ProfileScreen from './components/ProfileScreen';
import EditProfilePage from './pages/EditProfile';
import BookmarkPage from './pages/Bookmark';
import CommunityPage from './pages/Community';
import PremiumPage from './pages/Premium';

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

// Owns shared app data and switches between the profile, bookmark, community, and premium pages.
function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [posts, setPosts] = useState(initialPosts);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [isEditing, setIsEditing] = useState(false);
  const [activePage, setActivePage] = useState('Profile');

  const handleNavigate = (label) => {
    if (['Profile', 'Bookmarks', 'Communities', 'Premium'].includes(label)) {
      setActivePage(label);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
  };

  const handleEditPost = (postId, nextText) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, text: nextText } : post,
      ),
    );
  };

  const handleCreatePost = (text, image) => {
    setPosts((currentPosts) => [
      { id: Date.now(), text, image, time: 'now' },
      ...currentPosts,
    ]);
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
    setBookmarks((currentBookmarks) => currentBookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
  };

  if (isEditing) {
    return (
      <EditProfilePage
        profile={profile}
        onSave={(nextProfile) => {
          setProfile(nextProfile);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (activePage === 'Bookmarks') {
    return (
      <BookmarkPage
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onNavigate={handleNavigate}
        onCreatePost={() => setActivePage('Profile')}
        profile={profile}
      />
    );
  }

  if (activePage === 'Communities') {
    return <CommunityPage onNavigate={handleNavigate} onCreatePost={() => setActivePage('Profile')} profile={profile} />;
  }

  if (activePage === 'Premium') {
    return <PremiumPage onNavigate={handleNavigate} onCreatePost={() => setActivePage('Profile')} profile={profile} />;
  }

  return (
    <ProfileScreen
      profile={profile}
      posts={posts}
      bookmarks={bookmarks}
      onNavigate={handleNavigate}
      onEdit={() => setIsEditing(true)}
      onCreatePost={handleCreatePost}
      onDeletePost={handleDeletePost}
      onEditPost={handleEditPost}
      onSaveBookmark={handleSaveBookmark}
    />
  );
}

export default App;