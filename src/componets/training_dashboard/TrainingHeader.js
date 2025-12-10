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

// Base URL used by the backend for media/API
const BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

// 1. Accept searchTerm and setSearchTerm as props
function TrainingHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
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
    candidate_name: "",
    profile_photo: null,
  });

  // Fetch user details when component mounts or user changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      // First try to fetch course-registration (applicant) data
      try {
        // Use unique_id from AuthContext as applicant_id
        const applicantId = user?.unique_id;
        if (!applicantId) {
          console.warn("No unique_id available in AuthContext");
          throw new Error("No unique_id available");
        }
        
        const resp = await axios.get(`${BASE_URL}/api/course-registration/?applicant_id=${applicantId}`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });

        if (resp.data && resp.data.success && resp.data.data) {
          const d = resp.data.data;
          setUserDetails(prev => ({
            ...prev,
            candidate_name: d.candidate_name || "",
            profile_photo: d.profile_photo || null,
          }));
          return; // got applicant data — no need to continue
        }
      } catch (err) {
        console.warn("Applicant fetch failed, will try employee-details as fallback:", err);
      }

      // Fallback: fetch employee details if user is available
      if (user && user.unique_id) {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/employee-details/?emp_id=${user.unique_id}`,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" }
            }
          );
          
          if (response.data) {
            setUserDetails(prev => ({
              ...prev,
              first_name: response.data.first_name || "",
              last_name: response.data.last_name || "",
              profile_photo: response.data.profile_photo || null,
            }));
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
    // Prefer applicant/candidate name if available
    if (userDetails.candidate_name) return userDetails.candidate_name;
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
      return `${BASE_URL}${userDetails.profile_photo.startsWith('/') ? userDetails.profile_photo : `/${userDetails.profile_photo}`}`;
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