import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Table } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaPlus,
  FaGift,
  FaUserCheck,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Tooltip, ResponsiveContainer } from "recharts";
import "../../assets/css/emp_dashboard.css";
import SideNav from "./SideNav";
import LeaveCalendar from "./hr_iinerpage/LeaveCalendar";
import FeedBackPost from "./FeedBackPost";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import TeamMember from "./hr_iinerpage/TeamMember";
import HrHeader from "./HrHeader";
import LeaveBalance from "./hr_iinerpage/LeaveBalance";
import { BsFillFilePostFill } from "react-icons/bs";
import { GiImpactPoint } from "react-icons/gi";
import { LuFileBadge2 } from "react-icons/lu";

const HrDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // HR Stats Data
  const statsData = [
    {
      title: "Employee Overview",
      value: "Total Employees:",
      number: " 250",
      change: "Active",
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
      change: "Present",
      leavnumber: " 230",
      icon: <FaTachometerAlt />,
    },
    {
      title: "Leave Requests",
      value: "Pending:",
      number: " 5",
      change: "Approved",
      leavnumber: " 1",
      resign: "Rejected:",
      resignumber: "5",
      icon: <FaTachometerAlt />,
    },
    {
      title: " Payroll Summary",
      value: "Current Month Processed:",
      number: " ₹24,00,000",
      change: "Processed",

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

        <HrHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <Row className="align-items-center mb-4">
            <Col lg={6} md={12} sm={12}>
              <h1 className="page-title">Dashboard</h1>
              <Col lg={4} md={12} sm={12}>
                <div className="quick-actions">
                  <Button
                    variant="primary"
                    className="w-100 btn-emp mb-2"
                    onClick={() => navigate("/EmployeeRegistration")}
                    style={{ cursor: "pointer" }}
                  >
                    <FaPlus className="me-2" /> Add Employee
                  </Button>
                </div>
              </Col>
            </Col>

            <Col
              lg={6}
              md={12}
              sm={12}
              className="d-flex gap-2 br-post-top-btn align-items-center"
            >
              <span>
                <BsFillFilePostFill className="br-post-top-icon" />
                Post
              </span>
              <span className="border-start ps-2">
                <LuFileBadge2 className="br-post-top-icon" />
                Badge
              </span>
              <span className="border-start ps-2">
                <GiImpactPoint className="br-post-top-icon" />
                Reward points
              </span>
              <span className="border-start ps-2">
                <FaUserCheck className="br-post-top-icon" />
                Endorse
              </span>
            </Col>
          </Row>

          <Row>
            <Col lg={3} md={12} sm={12} xm={12} className="mb-3">
              <Row>
                {" "}
                {statsData.map((stat, index) => (
                  <Col
                    lg={12}
                    md={6}
                    sm={6}
                    xm={6}
                    className="mb-3"
                    key={index}
                  >
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
                          <div className="br-stat-info ">
                            <Button
                              className={`br-stat-btn ${
                                stat.change?.toLowerCase().includes("active")
                                  ? "btn-primary"
                                  : stat.change
                                      ?.toLowerCase()
                                      .includes("approved")
                                  ? "btn-success"
                                  : stat.change
                                      ?.toLowerCase()
                                      .includes("absent")
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
              </Row>
            </Col>
            <Col lg={5} md={12} sm={12} className="mb-3">
              <FeedBackPost />
            </Col>
            <Col lg={4} md={12} sm={12} className="mb-3">
              <Card className="birthday-card d-flex  justify-content-between">
                <div className="birthday-left d-flex align-items-center gap-3">
                  <FaGift className="birthday-icon" />
                  <div className="birthday-text">
                    <h6 className="birthday-title">Happy Birthday!</h6>

                    <p className="birthday-subtext mb-0">
                      <FaUsers className="me-1 br-birthday" /> 15 people wished
                      you
                    </p>
                    <small className="birthday-date">Today</small>
                  </div>
                </div>
              </Card>
              <TeamMember />
              <LeaveCalendar />
              <LeaveBalance />
            </Col>
          </Row>
          {/* Stats Cards */}

          <Row>
            {/* Pie Chart */}

            {/* Leave Announcements */}

            <Col lg={4} md={12} sm={12}></Col>
          </Row>

          {/* Existing Table + Quick Actions (same layout) */}
        </Container>
      </div>
    </div>
  );
};

export default HrDashBoard;
