import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate, FaFileInvoice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";


import "../../assets/css/websitemanagement.css";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import Test from "../Play_and_Win/Test";
const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const UserDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedCardType, setSelectedCardType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [coursesData, setCoursesData] = useState([]);
  const navigate = useNavigate();

  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);


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

  
 
  const handleCardClick = (cardType) => {
    setSelectedCardType(cardType);
    setCurrentPage(1);
    setSearchTerm("");
  };
 






 


  

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <h1 className="page-title">User DashBoard</h1>
          <div className="br-box-container mt-4">
            <Row className="br-stats-row">
                <Col lg={4} md={6} sm={12} className="mb-3">
                              <div
                                className="br-stat-card card-blue"
                                onClick={() => handleCardClick("courses")}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="br-stat-icon">
                                  <FaBook />
                                </div>
                                <div className="br-stat-details">
                                  <h5>Khelo and Jito</h5>
                                  <h2>{coursesData.length}</h2>
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

export default UserDashBoard;
