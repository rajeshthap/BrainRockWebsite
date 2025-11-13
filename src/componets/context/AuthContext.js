import React, { createContext, useState, useEffect, useRef } from "react";
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

  const logout = async () => {
    try {
      const res = await axiosInstance.post("logout/");
      console.log("Logout response:", res.data);

      Cookies.remove("user_id");
      setUser(null);
      setHasRefreshFailed(false);

      return { success: true, data: res.data }; 
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data || { message: err.message },
      };
    }
  };

  const validateOrRefreshToken = async () => {
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
       await logout();
      return {
        success: false,
        error: err.response?.data || { message: err.message },
      };
    } finally {
      isRefreshing.current = false;
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
          } else {
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [hasRefreshFailed]);

  useEffect(() => {
    if (!hasRefreshFailed) validateOrRefreshToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
