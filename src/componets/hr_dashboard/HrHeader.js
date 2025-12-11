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

// Removed searchTerm and setSearchTerm from props
function HrHeader({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
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
  
  // State for user details
  const [userDetails, setUserDetails] = useState({
    first_name: "",
    last_name: "",
    profile_photo: null,
  });

  // Fetch user details when component mounts or user changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.unique_id) {
        try {
          const response = await axios.get(
            `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${user.unique_id}`,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" }
            }
          );
          
          if (response.data) {
            setUserDetails({
              first_name: response.data.first_name || "",
              last_name: response.data.last_name || "",
              profile_photo: response.data.profile_photo || null,
            });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  };

  // Get user display name
  const getDisplayName = () => {
    if (userDetails.first_name && userDetails.last_name) {
      return `${userDetails.first_name} ${userDetails.last_name}`;
    } else if (userDetails.first_name) {
      return userDetails.first_name;
    } else if (user && (user.first_name || user.last_name)) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
    }
    return "User";
  };

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (userDetails.profile_photo) {
      return `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${userDetails.profile_photo}`;
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

          {/* Removed the search bar column */}

          <Col xs="auto" className="ms-auto">
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
                  <Dropdown.Item onClick={() => navigate("/HrProfile")}>
                    <FaUserCircle className="me-2" /> Profile
                  </Dropdown.Item>

                  <Dropdown.Item>
                    <FaCog className="me-2" /> Settings
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

export default HrHeader;