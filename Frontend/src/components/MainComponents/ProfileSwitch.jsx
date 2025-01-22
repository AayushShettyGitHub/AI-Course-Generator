import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ProfilePage from './ProfilePage';  // Import ProfilePage correctly
import ProfileEdit from './ProfileEdit';  // Import ProfileEdit correctly

const ProfileSwitch = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeJWT = (token) => {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  };

  useEffect(() => {
    const token = Cookies.get("jwt");

    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        const userId = decodedToken?.userId;

        if (userId) {
          fetch(`http://localhost:8082/api/auth/getUser?id=${userId}`)
            .then((response) => response.json())
            .then((data) => {
              if (data) {
                setUpdatedUser(data);
                setIsLoading(false);
              } else {
                setIsLoading(false);
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              setIsLoading(false);
            });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoading(false);
      }
    }
  }, [isEditing]);

  // Show loading state until data is fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isEditing ? (
    <ProfileEdit
      user={updatedUser}
      onCancel={() => setIsEditing(false)}  // Just stop editing without passing anything back
    />
  ) : (
    <ProfilePage
      user={updatedUser}
      onEdit={() => setIsEditing(true)}  // Switch to editing mode
    />
  );
};

export default ProfileSwitch;
