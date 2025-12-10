import React, { useState, useEffect } from "react";
import { Carousel, Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { FaBell, FaCalendarAlt, FaClock } from "react-icons/fa";
import "../../assets/css/NotificationCarousel.css";

const NotificationCarousel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log("Notifications response:", result);

        // Handle both array and object responses
        let notificationsList = [];
        if (Array.isArray(result)) {
          notificationsList = result;
        } else if (result.data && Array.isArray(result.data)) {
          notificationsList = result.data;
        } else if (result.success && Array.isArray(result.results)) {
          notificationsList = result.results;
        } else if (Array.isArray(result.results)) {
          notificationsList = result.results;
        }

        setNotifications(notificationsList);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="notification-carousel-section">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading notifications...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-carousel-section">
        <Container>
          <Alert variant="warning" className="mt-4">
            <FaBell className="me-2" />
            Unable to load notifications. Please try again later.
          </Alert>
        </Container>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="notification-carousel-section">
        <Container>
          <div className="text-center py-5">
            <FaBell style={{ fontSize: "3rem", color: "#ccc" }} />
            <p className="mt-3 text-muted">No notifications available</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="notification-carousel-section">
      <Container>
        <div className="notification-header text-center mb-5">
          <h2 className="notification-title">
            <FaBell className="me-2" />
            Latest <span className="br-span-list">Notifications</span>
          </h2>
          <p className="notification-subtitle">
            Stay updated with our latest news and announcements
          </p>
        </div>

        {notifications.length === 1 ? (
          // Single notification - show as card
          <Row className="justify-content-center">
            <Col lg={8} md={10} sm={12}>
              <div className="notification-card">
                <div className="notification-card-header">
                  <h3 className="notification-card-title">
                    {notifications[0].title}
                  </h3>
                  <div className="notification-meta">
                    <span className="notification-date">
                      <FaCalendarAlt className="me-2" />
                      {formatDate(
                        notifications[0].created_at || notifications[0].date
                      )}
                    </span>
                    <span className="notification-time">
                      <FaClock className="me-2" />
                      {formatTime(
                        notifications[0].created_at || notifications[0].date
                      )}
                    </span>
                  </div>
                </div>
                <div className="notification-card-body">
                  <p className="notification-card-content">
                    {notifications[0].content || notifications[0].message}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          // Multiple notifications - show as carousel
          <Carousel
            className="notification-carousel"
            interval={5000}
            pause="hover"
            indicators={true}
            controls={true}
          >
            {notifications.map((notification, index) => (
              <Carousel.Item key={notification.id || index}>
                <Row className="justify-content-center notification-carousel-item">
                  <Col lg={8} md={10} sm={12}>
                    <div className="notification-card">
                      <div className="notification-card-header">
                        <h3 className="notification-card-title">
                          {notification.title}
                        </h3>
                        <div className="notification-meta">
                          <span className="notification-date">
                            <FaCalendarAlt className="me-2" />
                            {formatDate(notification.created_at || notification.date)}
                          </span>
                          <span className="notification-time">
                            <FaClock className="me-2" />
                            {formatTime(notification.created_at || notification.date)}
                          </span>
                        </div>
                      </div>
                      <div className="notification-card-body">
                        <p className="notification-card-content">
                          {notification.content || notification.message}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Container>
    </div>
  );
};

export default NotificationCarousel;
