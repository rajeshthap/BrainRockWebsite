import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import LeftNavManagement from "./LeftNavManagement";
import AdminHeader from "./AdminHeader";
import "../../assets/css/websitemanagement.css";

const WebsiteManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

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
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
            <h1 className="page-title">Dashboard</h1>
          <div className="br-box-container mt-4">

        
            <Row className=" br-stats-row">
              
     
              <Col lg={4} md={6} sm={12} className="mb-3">
                <div className="br-stat-card card-blue">
                  <div className="br-stat-icon">
                    <FaBook />
                  </div>
                  <div className="br-stat-details">
                    <h5>Total Courses</h5>
                    <h2>120</h2>
                  </div>
                </div>
              </Col>

              {/* Card 2 */}
              <Col lg={4} md={6} sm={12} className="mb-3">
                <div className="br-stat-card card-green">
                  <div className="br-stat-icon">
                    <FaUsers />
                  </div>
                  <div className="br-stat-details">
                    <h5>Total Employees</h5>
                    <h2>48</h2>
                  </div>
                </div>
              </Col>

              {/* Card 3 */}
              <Col lg={4} md={6} sm={12} className="mb-3">
                <div className="br-stat-card card-orange">
                  <div className="br-stat-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="br-stat-details">
                    <h5>Total Students</h5>
                    <h2>300</h2>
                  </div>
                </div>
              </Col>

            </Row>

          </div>
        </Container>
      </div>
    </div>
  );
};

export default WebsiteManagement;
