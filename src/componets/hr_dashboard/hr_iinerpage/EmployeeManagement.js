import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
  Card,
  Table,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaTachometerAlt,
  FaChartLine,
  FaUsers,
  FaCog,
  FaFileAlt,
  FaSignOutAlt,
  FaSearch,
  FaShoppingCart,
  FaPlus,
} from "react-icons/fa";

import SideNav from "../SideNav";


const EmployeeManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "New message from John", time: "2 min ago", read: false },
    {
      id: 2,
      text: "Your order has been shipped",
      time: "1 hour ago",
      read: false,
    },
    { id: 3, text: "Weekly report is ready", time: "3 hours ago", read: true },
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  // Check if we're on mobile or tablet
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 768) {
        setSidebarOpen(false); // Close sidebar on mobile
      } else if (width >= 768 && width < 1024) {
        setSidebarOpen(false); // Close sidebar on tablet by default
      } else {
        setSidebarOpen(true); // Open sidebar on desktop
      }
    };

    // Initial check
    checkDevice();

    // Add event listener for window resize
    window.addEventListener("resize", checkDevice);

    // Cleanup
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => prev - 1);
  };

  const statsData = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      icon: <FaChartLine />,
    },
    { title: "New Users", value: "2,350", change: "+8.2%", icon: <FaUsers /> },
    {
      title: "Orders",
      value: "1,234",
      change: "+5.7%",
      icon: <FaShoppingCart />,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "+1.2%",
      icon: <FaTachometerAlt />,
    },
  ];

  const recentOrders = [
    {
      id: "#12345",
      customer: "John Doe",
      amount: "$125.00",
      status: "Delivered",
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      amount: "$89.50",
      status: "Processing",
    },
    {
      id: "#12347",
      customer: "Bob Johnson",
      amount: "$210.00",
      status: "Shipped",
    },
    {
      id: "#12348",
      customer: "Alice Brown",
      amount: "$75.25",
      status: "Pending",
    },
  ];
  
  return (
    <div className="dashboard-container">
      {/* Sidebar - Hidden on mobile and tablet */}
      <SideNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
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
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                  />
                </div>
              </Col>

              <Col xs="auto">
                <div className="header-actions">
                  {/* Notifications */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      className="notification-btn"
                    >
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
                        <Button variant="link" size="sm">
                          Mark all as read
                        </Button>
                      </div>
                      {notifications.map((notif) => (
                        <Dropdown.Item
                          key={notif.id}
                          className={`notification-item ${
                            !notif.read ? "unread" : ""
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="notification-content">
                            <p>{notif.text}</p>
                            <small>{notif.time}</small>
                          </div>
                          {!notif.read && <div className="unread-dot"></div>}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* User Profile */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      className="user-profile-btn"
                    >
                      <Image
                        src="https://picsum.photos/seed/user123/40/40.jpg"
                        roundedCircle
                        className="user-avatar"
                      />
                      <span className="user-name d-none d-md-inline">
                        John Doe
                      </span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href="#">
                        <FaUserCircle className="me-2" /> Profile
                      </Dropdown.Item>
                      <Dropdown.Item href="#">
                        <FaCog className="me-2" /> Settings
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item href="#">
                        <FaSignOutAlt className="me-2" /> Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Col>
            </Row>
          </Container>
        </header>

        {/* Dashboard Content */}
        <Container fluid className="dashboard-body">
         hello
        </Container>
      </div>

      {/* Mobile & Tablet Sidebar (Offcanvas) */}
    </div>
  );
};

export default EmployeeManagement;
