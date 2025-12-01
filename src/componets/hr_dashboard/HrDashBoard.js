import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Table, Modal } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaPlus,
  FaGift,
  FaUserCheck,
  FaTimes,
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
  const [birthdays, setBirthdays] = useState([]);
  const [birthdayLoading, setBirthdayLoading] = useState(true);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
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

  // Fetch birthday data
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-birthday-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.birthdays_today) {
          setBirthdays(data.birthdays_today);
        }
      } catch (error) {
        console.error("Failed to fetch birthday data:", error);
      } finally {
        setBirthdayLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

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

  // Get first 2 birthdays and remaining count
  const displayBirthdays = birthdays.slice(0, 1);
  const remainingCount = birthdays.length > 1 ? birthdays.length - 1 : 0;

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
              {/* Dynamic Birthday Card */}
              {birthdayLoading ? (
                <Card className="birthday-card d-flex justify-content-between">
                  <div className="birthday-left d-flex align-items-center gap-3">
                    <FaGift className="birthday-icon" />
                    <div className="birthday-text">
                      <h6 className="birthday-title">Loading Birthdays...</h6>
                    </div>
                  </div>Kamal Hassan
                </Card>
              ) : birthdays.length > 0 ? (
                <Card className="birthday-card d-flex flex-column">
                  <div className="birthday-left d-flex align-items-center gap-3">
                    <FaGift className="birthday-icon" />
                    <div className="birthday-text">
                      <h6 className="birthday-title">Happy Birthday!</h6>
                      <p className="birthday-subtext mb-0">
                        <FaUsers className="me-1 br-birthday" /> {birthdays.length} {birthdays.length === 1 ? 'person has' : 'people have'} birthday today
                      </p>
                      <small className="birthday-date">Today</small>
                    </div>
                  </div>
                  
                  {/* Display first 2 birthdays */}
                  <div className="birthday-list mt-3">
                    {displayBirthdays.map((birthday, index) => (
                      <div key={index} className="birthday-item d-flex align-items-center gap-2 mb-2">
                        <div className="birthday-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', color: 'white', fontSize: '0.7rem'}}>
                          {birthday.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="birthday-details">
                          <p className="mb-0 fw-bold">{birthday.full_name}</p>
                          <small className="text-muted">{birthday.designation}, {birthday.department}</small>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show +X more link if there are more birthdays */}
                    {remainingCount > 0 && (
                      <Button 
                        variant="link" 
                        className="birthday-more-link p-0 text-primary"
                        onClick={() => setShowBirthdayModal(true)}
                      >
                        +{remainingCount} more
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="birthday-card d-flex justify-content-between">
                  <div className="birthday-left d-flex align-items-center gap-3">
                    <FaGift className="birthday-icon" />
                    <div className="birthday-text">
                      <h6 className="birthday-title">No Birthdays Today</h6>
                      <p className="birthday-subtext mb-0">
                        <FaUsers className="me-1 br-birthday" /> Check back tomorrow
                      </p>
                      <small className="birthday-date">Today</small>
                    </div>
                  </div>
                </Card>
              )}
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

      {/* Birthday Modal */}
      <Modal 
        show={showBirthdayModal} 
        onHide={() => setShowBirthdayModal(false)}
        centered
        size="lg"
        className="birthday-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaGift className="text-primary" />
            Today's Birthdays ({birthdays.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="birthday-modal-list">
            {birthdays.map((birthday, index) => (
              <div key={index} className="birthday-modal-item d-flex align-items-center gap-3 p-3 border-bottom">
                <div className="birthday-modal-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px', color: 'white', fontSize: '1rem'}}>
                  {birthday.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="birthday-modal-details flex-grow-1">
                  <h6 className="mb-1 fw-bold">{birthday.full_name}</h6>
                  <p className="mb-1 text-muted">{birthday.designation}</p>
                  <p className="mb-0 text-muted">{birthday.department}</p>
                </div>
                
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBirthdayModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HrDashBoard;