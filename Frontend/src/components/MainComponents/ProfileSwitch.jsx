import { useState } from 'react';
import ProfilePage from './ProfilePage';
import ProfileEdit from './ProfileEdit';
import NavBar from './NavBar';
import { useUser } from '../../context/UserContext';

const ProfileSwitch = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user: updatedUser, isLoading, refreshUser } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEditComplete = () => {
    refreshUser();
    setIsEditing(false);
  };

  return isEditing ? (
    <ProfileEdit
      user={updatedUser}
      onCancel={() => setIsEditing(false)}
      onSave={handleEditComplete}
    />
  ) : (
    <>
      <NavBar />
      <ProfilePage
        user={updatedUser}
        onEdit={() => setIsEditing(true)}
      />
    </>
  );
};

export default ProfileSwitch;
