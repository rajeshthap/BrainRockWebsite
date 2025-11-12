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
  
  FaSearch,
  
} from "react-icons/fa";

import "../../../assets/css/emp_dashboard.css";


import SideNav from "../SideNav";

const EmployeeRegistration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, ] = useState(false);
  const [isTablet, ] = useState(false);
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
             
            </Row>
          </Container>
        </header>

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
        helo


       
      

        

          {/* Existing Table + Quick Actions (same layout) */}
        </Container>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
