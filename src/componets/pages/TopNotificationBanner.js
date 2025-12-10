import React, { useState, useEffect } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { FaBell, FaTimes } from "react-icons/fa";
import "../../assets/css/TopNotificationBanner.css";

const TopNotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-notification-post/",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const result = await response.json();
        console.log("Top notifications response:", result);

        // Handle both array and object responses
        let notificationsList = [];
        if (Array.isArray(result)) {
          notificationsList = result;
        } else if (result.data && Array.isArray(result.data)) {
          notificationsList = result.data;
        } else if (result.success && result.data && Array.isArray(result.data)) {
          notificationsList = result.data;
        } else if (result.success && Array.isArray(result.results)) {
          notificationsList = result.results;
        } else if (Array.isArray(result.results)) {
          notificationsList = result.results;
        }

        if (notificationsList.length > 0) {
          setNotifications(notificationsList);
          setDismissed(false);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Auto-rotate notifications every 6 seconds if multiple exist
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + notifications.length) % notifications.length);
  };

  if (loading) {
    return (
      <div className="top-notification-banner loading-state">
        <Spinner animation="border" size="sm" className="notification-spinner" />
        <span className="ms-2">Loading notifications...</span>
      </div>
    );
  }

  if (error || notifications.length === 0 || dismissed) {
    return null;
  }

  const currentNotification = notifications[currentIndex];

  return (
    <div className="top-notification-banner">
      <div className="notification-banner-container">
        <div className="notification-banner-content">
          <div className="notification-icon-wrapper">
            <FaBell className="notification-bell-icon" />
          </div>
          <div className="notification-banner-text">
            <h6 className="notification-banner-title">
              {currentNotification.title || "New Notification"}
            </h6>
            <p className="notification-banner-message">
              {currentNotification.content || currentNotification.message || currentNotification.description || ""}
            </p>
          </div>
          <div className="notification-banner-controls">
            {notifications.length > 1 && (
              <>
                <button 
                  className="notification-nav-btn prev-btn" 
                  onClick={handlePrevious}
                  title="Previous notification"
                >
                  ‹
                </button>
                <span className="notification-counter">
                  {currentIndex + 1} / {notifications.length}
                </span>
                <button 
                  className="notification-nav-btn next-btn" 
                  onClick={handleNext}
                  title="Next notification"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
        <button 
          className="notification-close-btn" 
          onClick={handleDismiss}
          title="Dismiss notification"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default TopNotificationBanner;
