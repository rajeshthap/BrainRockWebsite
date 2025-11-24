
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, validateOrRefreshToken } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // When location changes, if there's no user try to refresh token once
  // before redirecting to /Login. This prevents typing a protected URL
  // from showing protected content when a refresh token is available.
  useEffect(() => {
    let mounted = true;

    const tryRefresh = async () => {
      if (user || loading) return; // already authenticated or still validating

      if (typeof validateOrRefreshToken === 'function') {
        setChecking(true);
        try {
          const res = await validateOrRefreshToken();
          if (!mounted) return;
          setChecking(false);
          if (!res || !res.success) {
            navigate('/Login', { state: { from: location }, replace: true });
          }
        } catch (e) {
          if (!mounted) return;
          setChecking(false);
          navigate('/Login', { state: { from: location }, replace: true });
        }
      } else {
        // No refresh function available, redirect immediately
        navigate('/Login', { state: { from: location }, replace: true });
      }
    };

    tryRefresh();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // While auth is loading (validating/refreshing token) or this route is
  // actively checking, don't render the protected children (show nothing).
  if (loading || checking) {
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