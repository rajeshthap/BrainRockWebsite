import React, { createContext, useState } from 'react';

export const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    candidate_name: "",
    profile_photo: null,
    email: "",
    mobile_no: "",
    // Add other fields as needed
  });

  // Function to update profile - called from UserProfile component
  const updateUserProfile = (newProfileData) => {
    setUserProfile(prev => ({
      ...prev,
      ...newProfileData
    }));
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, updateUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};
