import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Table } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaPlus,
  FaGift,
  FaUserCheck,
} from "react-icons/fa";

import "../../../assets/css/emp_dashboard.css";

import { useNavigate } from "react-router-dom";

import AdminHeader from "../AdminHeader";
import LeftNavManagement from "../LeftNavManagement";


const ViewServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();



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
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}

        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
       <div className="br-box-container"> View Services </div> 

          
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

export default ViewServices;
