
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, validateOrRefreshToken } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // When location changes, if there's no user try to refresh token once
  // before redirecting to /Login. This prevents typing a protected URL
  // from showing protected content when a refresh token is available.
  useEffect(() => {
    let mounted = true;

    const tryRefresh = async () => {
      // If we already have a user, no need to refresh
      if (user) {
        setHasCheckedAuth(true);
        return;
      }
      
      // If still loading, wait for it to complete
      if (loading) return;

      // If we've already checked and there's no user, redirect
      if (hasCheckedAuth && !user) {
        navigate('/Login', { state: { from: location }, replace: true });
        return;
      }

      if (typeof validateOrRefreshToken === 'function') {
        setChecking(true);
        try {
          const res = await validateOrRefreshToken();
          if (!mounted) return;
          setChecking(false);
          setHasCheckedAuth(true);
          if (!res || !res.success) {
            navigate('/Login', { state: { from: location }, replace: true });
          }
        } catch (e) {
          if (!mounted) return;
          setChecking(false);
          setHasCheckedAuth(true);
          navigate('/Login', { state: { from: location }, replace: true });
        }
      } else {
        // No refresh function available, redirect immediately
        setHasCheckedAuth(true);
        navigate('/Login', { state: { from: location }, replace: true });
      }
    };

    tryRefresh();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user, loading]);

  // While auth is loading (validating/refreshing token) or this route is
  // actively checking, don't render the protected children (show nothing).
  // Also show nothing if we haven't checked auth yet and there's no user
  if (loading || checking || (!hasCheckedAuth && !user)) {
    return null;
  }

  // If there is no user object in the context, redirect to the login page.
  if (!user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // If there is a user, render the child components (the protected page).
  return children;
};

export default ProtectedRoute;