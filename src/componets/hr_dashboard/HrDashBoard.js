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
  FaSignOutAlt,
  FaSearch,
  FaPlus,
  FaCalendarAlt,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Tooltip, ResponsiveContainer } from "recharts";
import "../../assets/css/emp_dashboard.css";
import SideNav from "./SideNav";
import LeaveCalendar from "./hr_iinerpage/LeaveCalendar";

const HrDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  // HR Stats Data
  const statsData = [
    {
      title: "Employee Overview",
      value: "Total Employees:",
      number: " 250",
      change: "Active:",
      leavnumber: " 230",
      Leavechange: "On Leave:",
      onleave: "15",
      resign: "Resigned:",
      resignumber: "5",
      icon: <FaUsers />,
    },

    {
      title: " Attendance Summary",
      value: "Absent:",
      number: " 250",
      change: "Present:",
      leavnumber: " 230",
      icon: <FaTachometerAlt />,
    },
    {
      title: "Leave Requests",
      value: "Pending:",
      number: " 5",
      change: "Approved:",
      leavnumber: " 1",
      resign: "Rejected:",
      resignumber: "5",
      icon: <FaTachometerAlt />,
    },
    {
      title: " Payroll Summary",
      value: "Current Month Processed:",
      number: " ₹24,00,000",
      change: "Processed:",

      icon: <FaTachometerAlt />,
    },


  ];

  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => prev - 1);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
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
                          className={`notification-item ${!notif.read ? "unread" : ""
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

                  {/* Profile */}
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

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <Row className="mb-4">
            <Col clas>
              <h1 className="page-title">HR Dashboard</h1>
            </Col>
          </Row>
          <Row>
            <Col lg={3} md={3} sm={12} className="mb-3">
              {" "}
              {statsData.map((stat, index) => (
                <Col lg={12} md={12} sm={12} className="mb-3" key={index}>
                  <Card className="stat-card">
                    <Card.Body>
                      <div className="stat-content">
                        <div className="stat-icon">{stat.icon}</div>

                        <div className="stat-info">
                          <h6 className="stat-title">{stat.title}</h6>
                          <h3 className="stat-value">
                            {stat.value}
                            <span className="stat-number">{stat.number}</span>
                          </h3>

                          <h3 className="stat-value">
                            {stat.Leavechange}
                            <span className="stat-leave-num">
                              {stat.onleave}
                            </span>
                          </h3>
                          <h3 className="stat-value">
                            {stat.change}
                            <span className="stat-change-num">
                              {stat.leavnumber}
                            </span>
                          </h3>
                          <h3 className="stat-value">
                            {stat.resign}
                            <span className="stat-resign-num">
                              {stat.resignumber}
                            </span>
                          </h3>
                        </div>
                        <div className="br-stat-info mt-3">
                          <Button
                            className={`br-stat-btn ${stat.change?.toLowerCase().includes("active")
                                ? "btn-primary"
                                : stat.change?.toLowerCase().includes("approved")
                                  ? "btn-success"
                                  : stat.change?.toLowerCase().includes("absent")
                                    ? "btn-danger btn-br-dgr"
                                    : "btn-secondary"
                              }`}
                          >
                            {stat.change}
                          </Button>
                        </div>




                      </div>

                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Col>
            <Col lg={5} md={5} sm={12} className="mb-3">
              Feed
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-info">
                      <h6 className="stat-title"></h6>
                      <h3 className="stat-value"></h3>
                      <span className="stat-change positive"></span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={4} sm={12} className="mb-3">
              <LeaveCalendar />
            </Col>
          </Row>
          {/* Stats Cards */}


          <Row>
            {/* Pie Chart */}
            <Col lg={8} md={8} sm={12}>
              {/*  Attendance Summary Pie Chart */}

              {/*  Attendance Line Chart */}
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="card-title mb-0">Attendance (Last 6 Days)</h5>
                </Card.Header>
                <Card.Body style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { day: "Mon", present: 50, absent: 10 },
                        { day: "Tue", present: 45, absent: 15 },
                        { day: "Wed", present: 48, absent: 12 },
                        { day: "Thu", present: 52, absent: 8 },
                        { day: "Fri", present: 46, absent: 14 },
                        { day: "Sat", present: 40, absent: 20 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="present"
                        stroke="#0d6efd"
                        name="Present"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="absent"
                        stroke="#dc3545"
                        name="Absent"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>

              {/*  Recent Joinees Table */}
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="card-title mb-0">Recent Joinees</h5>
                </Card.Header>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Amit Sharma",
                        dept: "HR",
                        role: "Manager",
                        joined: "Nov 1",
                      },
                      {
                        name: "Sneha Patel",
                        dept: "Tech",
                        role: "Developer",
                        joined: "Nov 3",
                      },
                      {
                        name: "Raj Mehta",
                        dept: "Sales",
                        role: "Executive",
                        joined: "Nov 5",
                      },
                    ].map((j, i) => (
                      <tr key={i}>
                        <td>{j.name}</td>
                        <td>{j.dept}</td>
                        <td>{j.role}</td>
                        <td>{j.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>

            {/* Leave Announcements */}

            <Col lg={4} md={12} sm={12}>
              <Row>
                <Col lg={12} md={12} sm={12}>
                  <Card className="quick-actions-card">
                    <Card.Header>
                      <h5 className="card-title">Quick Actions</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="quick-actions">
                        <Button variant="primary" className="w-100 mb-2">
                          <FaPlus className="me-2" /> Add Employee
                        </Button>
                        <Button
                          variant="outline-primary"
                          className="w-100 mb-2"
                        >
                          <FaUsers className="me-2" /> Applay Leave
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Existing Table + Quick Actions (same layout) */}
        </Container>
      </div>
    </div>
  );
};

export default HrDashBoard;
