import { useState } from 'react';
import ProfileScreen from './components/ProfileScreen';
import EditProfilePage from './pages/EditProfile';

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

function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [posts, setPosts] = useState(initialPosts);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <ProfileScreen
      profile={profile}
      posts={posts}
      onEdit={() => setIsEditing(true)}
      onCreatePost={handleCreatePost}
      onDeletePost={handleDeletePost}
      onEditPost={handleEditPost}
    />
  );
}

export default App;