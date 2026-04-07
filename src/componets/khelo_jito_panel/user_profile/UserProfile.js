import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button, Card, Form, ProgressBar } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate, FaFileInvoice, FaEdit, FaUser, FaIdCard, FaEnvelope, FaPhone, FaUniversity, FaMapMarkerAlt, FaCalendar, FaTrophy, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

import "../../../assets/css/userLeftNav.css"
import UserLeftNav from "../UserLeftNav";
import UserHeader from "../UserHeader";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const STORAGE_KEY = 'BR_USER_PROFILE_DATA';

// Helper to safely get/set localStorage for user profile
const getStoredUserProfile = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (e) {
    console.error("Error reading user profile from localStorage:", e);
  }
  return null;
};

const setStoredUserProfile = (profileData) => {
  try {
    if (typeof window !== "undefined") {
      if (profileData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error("Error saving user profile to localStorage:", e);
  }
};

const UserProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quiz performance state
  const [participationData, setParticipationData] = useState({});
  const [overallPerformance, setOverallPerformance] = useState(0);
  const [quizzesAttempted, setQuizzesAttempted] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

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

  // Load stored user profile data immediately on mount
  useEffect(() => {
    const storedProfile = getStoredUserProfile();
    if (storedProfile) {
      setUserData(storedProfile);
      setLoading(false);
    }
  }, []);

  // Fetch fresh data from API when user is available
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If no user after auth loaded, clear data and stop loading
    if (!user || !user.unique_id) {
      console.log("User ID not available");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Only show loading if we don't have stored data
        const storedProfile = getStoredUserProfile();
        if (!storedProfile) {
          setLoading(true);
        }
        setError(null);
        
        const response = await axios.get(
          `${API_BASE_URL}/test-winners/?user_id=${user.unique_id}`,
          { withCredentials: true }
        );

        if (response.data.status) {
          const profileData = response.data.data;
          setUserData(profileData);
          // Store in localStorage for persistence
          setStoredUserProfile(profileData);
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

    const fetchParticipatedQuizzes = async () => {
      if (user && user.unique_id) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/quiz-participants/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (response.data.status && response.data.data) {
            const participationMap = {};
            let completedQuizzes = 0;
            let sumPercentage = 0;
            
            response.data.data.forEach(item => {
              participationMap[item.quiz] = {
                score: item.attempt?.score,
                totalQuestions: item.attempt?.total_questions,
                status: item.attempt?.status,
                paymentStatus: item.payment_status
              };
              
              // Calculate performance for completed quizzes
              if (item.attempt?.score !== undefined && item.attempt?.total_questions) {
                const percentage = (item.attempt.score / item.attempt.total_questions) * 100;
                sumPercentage += percentage;
                completedQuizzes++;
              }
            });
            
            setParticipationData(participationMap);
            setQuizzesAttempted(completedQuizzes);
            
            // Calculate overall average percentage
            const avgPercentage = completedQuizzes > 0 ? Math.round(sumPercentage / completedQuizzes) : 0;
            setOverallPerformance(avgPercentage);
            setTotalScore(sumPercentage);
          }
        } catch (error) {
          console.error("Error fetching participated quizzes:", error);
          setParticipationData({});
        }
      }
    };

    fetchUserProfile();
    fetchParticipatedQuizzes();
  }, [user, authLoading]);

  const toCamelLabel = (str) => {
    const label = str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    return label === "Cashback" ? "Wallet" : label;
  };

  const getIconForField = (fieldName) => {
    const lowerField = fieldName.toLowerCase();
    if (lowerField.includes('name')) return <FaUser className="me-2" />;
    if (lowerField.includes('email')) return <FaEnvelope className="me-2" />;
    if (lowerField.includes('phone')) return <FaPhone className="me-2" />;
    if (lowerField.includes('bank') || lowerField.includes('account') || lowerField.includes('ifsc')) return <FaUniversity className="me-2" />;
    if (lowerField.includes('user') || lowerField.includes('id')) return <FaIdCard className="me-2" />;
    if (lowerField.includes('address') || lowerField.includes('location')) return <FaMapMarkerAlt className="me-2" />;
    if (lowerField.includes('date') || lowerField.includes('dob')) return <FaCalendar className="me-2" />;
    return null;
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
            <div className=" mt-4">
              <Row className="br-stats-row">
                {/* Profile Header Card */}
                <Col lg={12} className="mb-4">
                  <Card className="shadow-lg border-0 rounded-3">
                    <Card.Body className="p-4">
                      <Row className="align-items-start">
                        {/* Profile Photo */}
                        <Col lg={3} md={4} sm={12} className="text-center mb-4 mb-md-0">
                          <div className="position-relative d-inline-block">
                            <div className="profile-photo-circle" style={{ 
                              width: '150px', 
                              height: '150px', 
                              borderRadius: '50%', 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              border: '4px solid #ffffff',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                              overflow: 'hidden'
                            }}>
                              <FaUser size={70} className="text-white" />
                            </div>
                          </div>
                          <h4 className="mt-3 fw-bold text-primary">{userData.student_profile?.full_name || "User"}</h4>
                          <p className="text-muted">{userData.student_profile?.email || "email@example.com"}</p>
                        </Col>

                        {/* Personal Information - Right Side */}
                        <Col lg={9} md={8} sm={12}>
                          {/* Overall Performance Card */}
                          <div className="rounded-2 p-4 mb-3" style={{
                            background: overallPerformance >= 75 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : overallPerformance >= 50
                              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: '#fff'
                          }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <h6 className="mb-1 fw-bold" style={{ fontSize: '12px', opacity: 0.9 }}>OVERALL PERFORMANCE</h6>
                                <h2 className="mb-0" style={{ fontSize: '42px', fontWeight: '700' }}>{overallPerformance}%</h2>
                              </div>
                              <div style={{ fontSize: '48px', opacity: 0.3 }}>
                                <FaChartLine />
                              </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', overflow: 'hidden', height: '8px' }}>
                              <div style={{
                                background: '#fff',
                                height: '100%',
                                width: `${overallPerformance}%`,
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                            <div className="d-flex justify-content-between mt-2" style={{ fontSize: '11px', opacity: 0.85 }}>
                              <span>📊 Quizzes Attempted: <strong>{quizzesAttempted}</strong></span>
                              <span>⭐ Average Score: <strong>{Math.round(totalScore / (quizzesAttempted || 1))}%</strong></span>
                            </div>
                          </div>

                          <div className="bg-light rounded-2 p-4">
                            <h5 className="fw-bold text-primary mb-3"><FaUser className="me-2" />Personal Information</h5>
                            <Row>
                              {Object.entries({
                                ...(userData.student_profile || {})
                              }).filter(([key]) => !['payment_status', 'transaction_id', 'created_at', 'score'].includes(key)).map(([key, value]) => (
                                <Col lg={6} md={6} sm={12} key={key} className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="text-primary">{getIconForField(key)}</span>
                                    <h6 className="fw-bold mb-0 me-2">{toCamelLabel(key)}:</h6>
                                    <span className="text-muted">{value || "N/A"}</span>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        </Col>
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
