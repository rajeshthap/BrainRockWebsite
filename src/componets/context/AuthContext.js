import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from "axios";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRefreshFailed, setHasRefreshFailed] = useState(false);
  const isRefreshing = useRef(false);

  const axiosInstance = axios.create({
    baseURL: "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/",
    withCredentials: true,
  });

  const login = async (email_or_phone, password) => {
    try {
      const res = await axiosInstance.post("login/", { email_or_phone, password });

      setUser({
        id: res.data.user?.id || res.data.user_id || res.data.id,
        unique_id: res.data.user?.unique_id || res.data.unique_id || null,
        email: res.data.user?.email || res.data.email || null,
        full_name: res.data.user?.full_name || res.data.full_name || null,
        role: res.data.user?.role || res.data.role || null,
      });

      // Clear any client-side 'logged out' marker when login succeeds
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('BR_LOGGED_OUT');
        }
      } catch (e) {
        // ignore
      }

      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || { message: err.message },
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (options = { redirect: true }) => {
    try {
      const res = await axiosInstance.post("logout/");
      console.log("Logout response:", res.data);

      // Clear all cookies when logging out
      clearAllCookies();
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('BR_LOGGED_OUT', '1');
        }
      } catch (e) {
        // ignore
      }
      setUser(null);
      setLoading(false);
      setHasRefreshFailed(false);

      // Navigate to login page to ensure user lands on the login screen.
      if (options && options.redirect !== false) {
        try {
          if (typeof window !== 'undefined') {
            window.location.replace('/Login');
          }
        } catch (e) {
          // ignore
        }
      }

      return { success: true, data: res.data };
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);

      // Even if logout API fails, clear local state and navigate to login.
      clearAllCookies();
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('BR_LOGGED_OUT', '1');
        }
      } catch (e) {
        // ignore
      }
      setUser(null);
      setLoading(false);
      setHasRefreshFailed(true);
      if (options && options.redirect !== false) {
        try {
          if (typeof window !== 'undefined') {
            window.location.replace('/Login');
          }
        } catch (e) {
          // ignore
        }
      }

      return {
        success: false,
        error: err.response?.data || { message: err.message },
      };
    }
  };

  const validateOrRefreshToken = async () => {
    // If client recorded a logout, don't attempt refresh (prevents auto-login)
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('BR_LOGGED_OUT') === '1') {
        setHasRefreshFailed(true);
        setLoading(false);
        return { success: false, error: 'Client logged out' };
      }
    } catch (e) {
      // ignore
    }

    if (hasRefreshFailed || isRefreshing.current) {
      return { success: false, error: "Refresh already failed or in progress." };
    }

    try {
      isRefreshing.current = true;

      const res = await axiosInstance.post("token/refresh/");

      setUser({
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
        role: res.data.role,
      });

      setHasRefreshFailed(false);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      setHasRefreshFailed(true);
      setLoading(false);
      // Clear local auth state but avoid forcing another redirect from logout
      // (this prevents a reload loop if we're already on /Login).
      await logout({ redirect: false });
      // Only replace the location if we're not already on the login page.
      try {
        if (typeof window !== 'undefined' && window.location.pathname !== '/Login') {
          window.location.replace('/Login');
        }
      } catch (e) {
        // ignore
      }
      return {
        success: false,
        error: err.response?.data || { message: err.message },
      };
    } finally {
      isRefreshing.current = false;
    }
  };

  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  };

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || !error.response) {
          return Promise.reject(error);
        }

        if (
          originalRequest.url.includes("login")
          ||
          originalRequest.url.includes("logout")
        ) {
          return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalRequest._retry) {
          if (!isRefreshing.current && !hasRefreshFailed) {
            originalRequest._retry = true;
            const refreshed = await validateOrRefreshToken();
            if (refreshed.success) {
              return axiosInstance(originalRequest);
            }
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [hasRefreshFailed]);

  useEffect(() => {
    // On mount:
    // - If this was a full page reload and the current path is a protected path
    //   (not '/' or '/Login'), force a logout and redirect to '/Login'.
    // - Otherwise, attempt a token refresh (unless already failed) as before.
    const doInit = async () => {
      try {
        const perf = typeof performance !== 'undefined' ? performance : null;
        let navType = null;
        if (perf && perf.getEntriesByType) {
          const entries = perf.getEntriesByType('navigation');
          navType = entries && entries.length ? entries[0].type : null;
        }

        // Fallback for older browsers
        if (!navType && perf && perf.navigation) {
          navType = perf.navigation.type === 1 ? 'reload' : 'navigate';
        }

        const isReload = navType === 'reload';
        const path = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/';

        // If the page was reloaded and it's not the public landing or login page,
        // force a logout so the user is sent to Login.
        if (isReload && path !== '/' && path !== '/Login') {
          await logout();
          return;
        }

        // Otherwise, attempt refresh as before (skip if already failed or on /Login).
        if (!hasRefreshFailed) {
          if (typeof window === 'undefined' || window.location.pathname !== '/Login') {
            validateOrRefreshToken();
          }
        }
      } catch (e) {
        // ignore
      }
    };

    doInit();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, validateOrRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};