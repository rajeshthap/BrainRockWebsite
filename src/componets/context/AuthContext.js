import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
 
export const AuthContext = createContext();
 
// Helper to safely get/set localStorage
const getStoredUser = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("BR_USER_DATA");
      return stored ? JSON.parse(stored) : null;
    }
  } catch (e) {
    console.error("Error reading user from localStorage:", e);
  }
  return null;
};
 
const setStoredUser = (user) => {
  try {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("BR_USER_DATA", JSON.stringify(user));
      } else {
        localStorage.removeItem("BR_USER_DATA");
      }
    }
  } catch (e) {
    console.error("Error saving user to localStorage:", e);
  }
};
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRefreshFailed, setHasRefreshFailed] = useState(false);
  const isRefreshing = useRef(false);
  const isInitialized = useRef(false);
 
  const axiosInstance = axios.create({
    baseURL: "https://brainrock.in/brainrock/backend/api/",
    withCredentials: true,
  });
 
  const login = async (email_or_phone, password, role = null) => {
    try {
      const loginData = {
        email_or_phone,
        password,
        ...(role && { role }),
      };
      const res = await axiosInstance.post("login/", loginData);
 
      const userData = {
        id: res.data.user?.id || res.data.user_id || res.data.id,
        unique_id: res.data.user?.unique_id || res.data.unique_id || null,
        email: res.data.user?.email || res.data.email || null,
        full_name: res.data.user?.full_name || res.data.full_name || null,
        role: res.data.user?.role || res.data.role || null,
      };
 
      setUser(userData);
      setStoredUser(userData);
 
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("BR_LOGGED_OUT");
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
    // Clear user data immediately and set logout flag synchronously
    setUser(null);
    setStoredUser(null);
    setLoading(false);
    setHasRefreshFailed(false);
    
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("BR_LOGGED_OUT", "1");
      }
    } catch (e) {
      // ignore
    }
    
    try {
      const res = await axiosInstance.post("logout/");
      console.log("Logout response:", res.data);

      clearAllCookies();
 
      if (options && options.redirect !== false) {
        try {
          if (typeof window !== "undefined") {
            window.location.replace("/Login");
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
        if (typeof window !== "undefined") {
          localStorage.setItem("BR_LOGGED_OUT", "1");
        }
      } catch (e) {
        // ignore
      }
      setUser(null);
      setStoredUser(null);
      setLoading(false);
      setHasRefreshFailed(true);
      if (options && options.redirect !== false) {
        try {
          if (typeof window !== "undefined") {
            window.location.replace("/Login");
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
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("BR_LOGGED_OUT") === "1"
      ) {
        setHasRefreshFailed(true);
        setLoading(false);
        return { success: false, error: "Client logged out" };
      }
    } catch (e) {
      // ignore
    }
 
    if (hasRefreshFailed || isRefreshing.current) {
      return {
        success: false,
        error: "Refresh already failed or in progress.",
      };
    }
 
    try {
      isRefreshing.current = true;
 
      const res = await axiosInstance.post("token/refresh/");
 
      // Prefer res.data.user if present, otherwise use res.data itself.
      const newUserSource = res.data.user || res.data || {};
      const userData = {
        id:
          newUserSource.id || newUserSource.user_id || newUserSource.id || null,
        unique_id: newUserSource.unique_id || res.data.unique_id || null,
        email: newUserSource.email || res.data.email || null,
        full_name: newUserSource.full_name || res.data.full_name || null,
        role: newUserSource.role || res.data.role || null,
      };
 
      setUser(userData);
      setStoredUser(userData);
 
      setHasRefreshFailed(false);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      setHasRefreshFailed(true);
      setLoading(false);
      
      // Check if we have stored user data - if so, don't logout completely
      const storedUser = getStoredUser();
      if (storedUser) {
        // Keep user logged in with stored data, just log a warning
        console.log("Token refresh failed, but user session restored from localStorage");
        return { success: true, data: null, fromStorage: true };
      }
      
      await logout({ redirect: false });
      try {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/Login"
        ) {
          window.location.replace("/Login");
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
          originalRequest.url.includes("login") ||
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
      // Check if this is a fresh page load or navigation after logout
      // We need to run initialization on every mount to check logout status
      // Only skip if we're already initialized AND not on a protected route that needs re-validation
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
      const publicPaths = [
        "/", "/home", "/companyprofile", "/ourteam", "/runningprojects",
        "/servicespage", "/courses", "/gallery", "/feedback", "/trainingregistration",
        "/training", "/contact", "/servicesdetails", "/certificate", "/career",
        "/login", "/ProjectDetail", "/Terms"
      ].map(p => p.toLowerCase());
      
      const isPublicPath = publicPaths.includes(currentPath.toLowerCase().replace(/\/+$/, "") || "/");
      
      // For protected routes, always run initialization to check logout status
      // For public routes, only run if not initialized
      if (isInitialized.current && !isPublicPath) {
        // Re-check logout status for protected routes
        const wasLoggedOut = typeof window !== "undefined" && localStorage.getItem("BR_LOGGED_OUT") === "1";
        const storedUser = getStoredUser();
        
        if (wasLoggedOut || !storedUser) {
          // User was logged out or no stored user - don't restore
          setUser(null);
          setStoredUser(null);
        } else if (!user) {
          // User exists in storage but not in state - restore it
          setUser(storedUser);
        }
        return;
      }
      
      if (isInitialized.current && isPublicPath) {
        return;
      }
      
      isInitialized.current = true;
 
      try {
        const perf = typeof performance !== "undefined" ? performance : null;
        let navType = null;
        if (perf && perf.getEntriesByType) {
          const entries = perf.getEntriesByType("navigation");
          navType = entries && entries.length ? entries[0].type : null;
        }
 
        // Fallback for older browsers
        if (!navType && perf && perf.navigation) {
          navType = perf.navigation.type === 1 ? "reload" : "navigate";
        }
 
        const isReload = navType === "reload";
        const path =
          typeof window !== "undefined" && window.location.pathname
            ? window.location.pathname
            : "/";
 
        // List of pages that should remain on the same URL after a hard reload and are public (no auth required).
        const publicPaths = [
          "/",
          "/home",
          "/companyprofile",
          "/ourteam",
          "/runningprojects",
          "/servicespage",
          "/courses",
          "/gallery",
          "/feedback",
          "/trainingregistration",
          "/training",
          "/contact",
          "/servicesdetails",
          "/certificate",
          "/career",
          "/login",
          "/ProjectDetail",
          "/Terms"
        ].map((p) => p.toLowerCase());
 
        const normalizedPath = path.toLowerCase().replace(/\/+$/, "") || "/";
 
        // Check if user was logged out by BR_LOGGED_OUT flag
        const wasLoggedOut =
          typeof window !== "undefined" &&
          localStorage.getItem("BR_LOGGED_OUT") === "1";
 
        // Try to restore user from localStorage first
        const storedUser = getStoredUser();
        if (storedUser && !wasLoggedOut) {
          setUser(storedUser);
        }
 
        // If it's a reload and the current path is NOT in allowed public list and no stored user, redirect to root
        if (
          isReload &&
          !publicPaths.includes(normalizedPath) &&
          normalizedPath !== "/login" &&
          !storedUser
        ) {
          try {
            if (typeof window !== "undefined") {
              window.location.replace("/");
            }
          } catch (e) {
            // ignore
          }
          return;
        }
 
        // Only attempt to validate/refresh token for non-public (protected) routes.
        if (!hasRefreshFailed) {
          try {
            if (typeof window !== "undefined") {
              const current =
                window.location.pathname.toLowerCase().replace(/\/+$/, "") ||
                "/";
 
              // If we have a stored user and it's not a public path, validate token in background
              if (storedUser && !publicPaths.includes(current)) {
                // Validate token but don't block UI - restore immediately
                validateOrRefreshToken().then((result) => {
                  if (!result.success && !result.fromStorage) {
                    // Token refresh failed but we still have stored user
                    console.log("Token refresh failed, but user session restored from localStorage");
                  } else if (result.fromStorage) {
                    // Successfully using stored data
                    setLoading(false);
                  }
                });
              } else if (!publicPaths.includes(current)) {
                validateOrRefreshToken();
              } else {
                // On public pages ensure loading is cleared
                setLoading(false);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ignore
      }
    };
 
    doInit();
  }, []);
 
  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, validateOrRefreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
