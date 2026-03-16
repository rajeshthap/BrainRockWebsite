import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button, Card, Form } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate, FaFileInvoice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

import "../../../assets/css/userLeftNav.css"
import UserLeftNav from "../UserLeftNav";
import UserHeader from "../UserHeader";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const UserProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!user || !user.unique_id) {
      console.log("User ID not available yet");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_BASE_URL}/test-winners/?user_id=${user.unique_id}`,
          { withCredentials: true }
        );

        console.log("User profile response:", response.data);

        if (response.data.status) {
          setUserData(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch user profile");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const toCamelLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

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
          <h1 className="page-title">User Profile</h1>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading user profile...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mt-4">
              <h4>Error</h4>
              <p>{error}</p>
            </Alert>
          ) : userData ? (
            <div className="br-box-container mt-4">
              <Row className="br-stats-row">
                {/* Student Profile Section */}
                <Col lg={12} className="mb-4">
                  <Card>
                    <Card.Header className="bg-primary text-white">
                      <h4>Student Profile</h4>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        {Object.entries(userData.student_profile || {}).map(([key, value]) => (
                          <Col lg={6} md={6} sm={12} key={key}>
                            <Form.Group className="mb-3">
                              <Form.Label className="br-label fw-bold">{toCamelLabel(key)}</Form.Label>
                              <Form.Control
                                className="br-form-control"
                                value={value || ""}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Winner Details Section */}
                <Col lg={12} className="mb-4">
                  <Card>
                    <Card.Header className="bg-success text-white">
                      <h4>Winner Details</h4>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        {Object.entries(userData.winner_details || {}).map(([key, value]) => (
                          <Col lg={6} md={6} sm={12} key={key}>
                            <Form.Group className="mb-3">
                              <Form.Label className="br-label fw-bold">{toCamelLabel(key)}</Form.Label>
                              <Form.Control
                                className="br-form-control"
                                value={value || ""}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Alert variant="warning" className="mt-4">
              <h4>No User Data Found</h4>
              <p>No profile data available for this user.</p>
            </Alert>
          )}
        </Container>
      </div>
    </div>
  );
};

export default UserProfile;
