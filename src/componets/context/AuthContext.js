import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const axiosInstance = axios.create({
    baseURL: "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/registration/",
    withCredentials: true, 
  });

  // ---------------------------------------------
  const login = async (email_or_phone, password) => {
    try {
      const res = await axiosInstance.post("login/", { email_or_phone, password });
      console.log(" Login response:", res.data);

      Cookies.set("user_id", res.data.user_id, {
        secure: true,
        sameSite: "None",
        expires: 7,
      });

      setUser({
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
      });

      return true;
    } catch (err) {
      console.error(" Login failed:", err.response?.data || err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("logout/");
    } catch (err) {
      console.error(" Logout failed:", err.response?.data || err.message);
    } finally {
      Cookies.remove("user_id");
      setUser(null);
    }
  };

  const checkSession = async () => {
    try {
      const res = await axiosInstance.get("check-session/");
      console.log(" Session check:", res.data);
      setUser(res.data);
    } catch (err) {
      console.warn(" Session invalid or expired:", err.response?.data || err.message);
      Cookies.remove("user_id");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  const refreshAccessToken = async () => {
    if (isRefreshing) {
      console.log("⏳ Already refreshing... skipping duplicate");
      return false;
    }

    setIsRefreshing(true);
    try {
      console.log(" Refreshing access token...");
      await axiosInstance.post("refresh-token/");
      console.log(" Access token refreshed");
      setIsRefreshing(false);
      return true;
    } catch (err) {
      console.error(" Token refresh failed:", err.response?.data || err.message);
      setIsRefreshing(false);
      await logout();
      return false;
    }
  };

  // ---------------------------------------------
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        //  If no response or already retried, reject immediately
        if (!error.response || originalRequest._retry) {
          return Promise.reject(error);
        }

        //  Handle only 401 errors for access token expiry
        if (error.response.status === 401 && !isRefreshing) {
          originalRequest._retry = true;
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            return axiosInstance(originalRequest);
          }
        }

        //  If still 401 after refresh or refresh failed, end session
        if (error.response.status === 401) {
          console.warn(" Unauthorized. Logging out...");
          await logout();
        }

        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [isRefreshing]);

  // ---------------------------------------------
  useEffect(() => {
    checkSession();
  }, []);

  // ---------------------------------------------
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
