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

      // Prefer res.data.user if present, otherwise use res.data itself.
      const newUserSource = res.data.user || res.data || {};
      setUser({
        id: newUserSource.id || newUserSource.user_id || newUserSource.id || null,
        unique_id: newUserSource.unique_id || res.data.unique_id || null,
        email: newUserSource.email || res.data.email || null,
        full_name: newUserSource.full_name || res.data.full_name || null,
        role: newUserSource.role || res.data.role || null,
      });

      setHasRefreshFailed(false);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      setHasRefreshFailed(true);
      setLoading(false);
      await logout({ redirect: false });
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

        // List of pages that should remain on the same URL after a hard reload.
        const allowedReloadPaths = [
          '/', '/home', '/CompanyProfile', '/OurTeam', '/RunningProjects', '/ServicesPage',
          '/Courses', '/Gallery', '/Feedback', '/TrainingRegistration', '/Training',
          '/Contact', '/Login'
        ].map(p => p.toLowerCase());

        const normalizedPath = path.toLowerCase().replace(/\/+$/, '') || '/';

        // If it's a reload and the current path is NOT in allowed list and NOT the login page, redirect to root
        if (isReload && !allowedReloadPaths.includes(normalizedPath) && normalizedPath !== '/login') {
          try {
            if (typeof window !== 'undefined') {
              window.location.replace('/');
            }
          } catch (e) {
            // ignore
          }
          return;
        }

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