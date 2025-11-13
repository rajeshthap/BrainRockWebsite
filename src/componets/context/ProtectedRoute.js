
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // If there is no user object in the context, redirect to the login page.
  if (!user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // If there is a user, render the child components (the protected page).
  return children;
};

export default ProtectedRoute;