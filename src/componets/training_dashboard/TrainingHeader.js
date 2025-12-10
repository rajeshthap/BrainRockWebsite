import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { UserProfileContext } from "../context/UserProfileContext";

// Base URL used by the backend for media/API
const BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

// 1. Accept searchTerm and setSearchTerm as props
function TrainingHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
  const { user, logout } = useContext(AuthContext);
  const { userProfile } = useContext(UserProfileContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New employee joined - Rahul Sharma",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      text: "HR meeting scheduled at 4 PM",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      text: "Payroll processed successfully",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(2);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  };

  // Get user display name (prioritize UserProfileContext)
  const getDisplayName = () => {
    // Use context data if available (most current from UserProfile)
    if (userProfile?.candidate_name) return userProfile.candidate_name;
    if (user && (user.first_name || user.last_name)) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
    }
    return "User";
  };

  // Get user photo URL (prioritize UserProfileContext)
  const getUserPhotoUrl = () => {
    if (userProfile?.profile_photo) {
      return `${BASE_URL}${userProfile.profile_photo.startsWith('/') ? userProfile.profile_photo : `/${userProfile.profile_photo}`}`;
    }
    // Fallback to a default avatar with user initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=0d6efd&color=fff&size=40`;
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col>
          
          </Col>

          <Col xs="auto">
            <div className="header-actions">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="notification-btn">
                  <FaBell />
                  {unreadCount > 0 && (
                    <Badge pill bg="danger" className="notification-badge">
                      {unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu className="notification-dropdown">
                  <div className="notification-header">
                    <h6>Notifications</h6>
                  </div>

                  {notifications.map((notif) => (
                    <Dropdown.Item
                      key={notif.id}
                      className={`notification-item ${
                        !notif.read ? "unread" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <p>{notif.text}</p>
                      <small>{notif.time}</small>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="user-profile-btn">
                  <Image
                    src={getUserPhotoUrl()}
                    roundedCircle
                    className="user-avatar"
                    onError={(e) => {
                      // Fallback to UI Avatars if image fails to load
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=0d6efd&color=fff&size=40`;
                    }}
                  />
                  <span className="user-name d-none d-md-inline">{getDisplayName()}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate("/UserProfile")}>
                    <FaUserCircle className="me-2" /> Profile
                  </Dropdown.Item>

                 
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default TrainingHeader;