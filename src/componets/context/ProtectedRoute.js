
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

      // Check if user is in a test session (returned from payment)
      const searchParams = new URLSearchParams(location.search);
      const isPaymentRedirect = searchParams.get("payment_success") !== null;
      const hasTestId = typeof window !== "undefined" && localStorage.getItem("test_user_id") !== null;
      const inTestSession = typeof window !== "undefined" && localStorage.getItem("BR_IN_TEST_SESSION") === "1";
      
      // Allow access for test sessions or payment redirects without full authentication
      if (inTestSession || isPaymentRedirect || hasTestId) {
        setHasCheckedAuth(true);
        return;
      }

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
            // Check again if in test session before redirecting
            const stillInTestSession = typeof window !== "undefined" && localStorage.getItem("BR_IN_TEST_SESSION") === "1";
            if (!stillInTestSession) {
              navigate('/Login', { state: { from: location }, replace: true });
            }
          }
        } catch (e) {
          if (!mounted) return;
          setChecking(false);
          setHasCheckedAuth(true);
          // Check if in test session before redirecting
          const stillInTestSession = typeof window !== "undefined" && localStorage.getItem("BR_IN_TEST_SESSION") === "1";
          if (!stillInTestSession) {
            navigate('/Login', { state: { from: location }, replace: true });
          }
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
    const searchParams = new URLSearchParams(window.location.search);
    const isPaymentRedirect = searchParams.get("payment_success") !== null;
    const inTestSession = typeof window !== "undefined" && localStorage.getItem("BR_IN_TEST_SESSION") === "1";
    
    if (inTestSession || isPaymentRedirect) {
      return children;
    }
    return null;
  }

  // If there is no user object in the context, redirect to the login page.
  // But allow for test sessions
  if (!user) {
    const searchParams = new URLSearchParams(window.location.search);
    const isPaymentRedirect = searchParams.get("payment_success") !== null;
    const inTestSession = typeof window !== "undefined" && localStorage.getItem("BR_IN_TEST_SESSION") === "1";

    if (inTestSession || isPaymentRedirect) {
      return children;
    }
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // If there is a user, render the child components (the protected page).
  return children;
};

export default ProtectedRoute;