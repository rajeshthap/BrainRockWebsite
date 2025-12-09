import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Modal } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaCalendarAlt, FaIdCard, FaEdit } from "react-icons/fa";
import "../../../assets/css/emp_dashboard.css";
import TrainingHeader from "../TrainingHeader";
import TrainingLeftnav from "../TrainingLeftnav";

const UserProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/?applicant_id=APP/2025/161006', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          setProfileData(result.data);
          setEditForm(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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

  // Function to determine button color based on status
  const getButtonColor = (status) => {
    if (!status) return "btn-secondary";
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes("active")) return "btn-primary";
    if (statusLower.includes("approved")) return "btn-success";
    if (statusLower.includes("processed")) return "btn-info";
    if (statusLower.includes("pending")) return "btn-warning";
    if (statusLower.includes("rejected")) return "btn-danger";
    
    return "btn-secondary";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/${profileData.id}/`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setProfileData(result.data);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <TrainingLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <TrainingHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <Row className="align-items-center mb-4">
            <Col lg={6} md={12} sm={12}>
              <h1 className="page-title">User Profile</h1>
            </Col>
            <Col
              lg={6}
              md={12}
              sm={12}
              className="d-flex justify-content-end gap-2"
            >
              <Button
                variant="primary"
                onClick={() => setShowEditModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </Button>
            </Col>
          </Row>

          <Row>
            <Col lg={12} md={12} sm={12}>
              {loading ? (
                <Card className="stat-card">
                  <Card.Body>
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading profile data...</p>
                    </div>
                  </Card.Body>
                </Card>
              ) : profileData ? (
                <Card className="stat-card">
                  <Card.Body>
                    <div className="profile-container">
                      <div className="profile-header d-flex align-items-center gap-4 mb-4">
                        <div className="profile-photo">
                          {profileData.profile_photo ? (
                            <img 
                              src={`https://mahadevaaya.com${profileData.profile_photo}`} 
                              alt="Profile" 
                              className="rounded-circle"
                              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                                 style={{ width: '120px', height: '120px', color: 'white', fontSize: '2rem' }}>
                              <FaUser />
                            </div>
                          )}
                        </div>
                        <div className="profile-info">
                          <h2 className="profile-name">{profileData.candidate_name}</h2>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <FaIdCard className="text-muted" />
                            <span className="text-muted">ID: {profileData.applicant_id}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="me-2">Status:</span>
                            <Button 
                              className={`btn-sm ${getButtonColor(profileData.course_status)}`}
                              disabled
                            >
                              {profileData.course_status}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="profile-details">
                        <Row>
                          <Col lg={6} md={12} sm={12} className="mb-3">
                            <h5 className="section-title">Personal Information</h5>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaUser />
                              </div>
                              <div>
                                <div className="detail-label">Full Name</div>
                                <div className="detail-value">{profileData.candidate_name}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaCalendarAlt />
                              </div>
                              <div>
                                <div className="detail-label">Date of Birth</div>
                                <div className="detail-value">{formatDate(profileData.date_of_birth)}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaMapMarkerAlt />
                              </div>
                              <div>
                                <div className="detail-label">Address</div>
                                <div className="detail-value">{profileData.address}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaUser />
                              </div>
                              <div>
                                <div className="detail-label">Guardian Name</div>
                                <div className="detail-value">{profileData.guardian_name}</div>
                              </div>
                            </div>
                          </Col>
                          
                          <Col lg={6} md={12} sm={12} className="mb-3">
                            <h5 className="section-title">Contact & Education</h5>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaEnvelope />
                              </div>
                              <div>
                                <div className="detail-label">Email</div>
                                <div className="detail-value">{profileData.email}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaPhone />
                              </div>
                              <div>
                                <div className="detail-label">Mobile Number</div>
                                <div className="detail-value">{profileData.mobile_no}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaGraduationCap />
                              </div>
                              <div>
                                <div className="detail-label">School/College</div>
                                <div className="detail-value">{profileData.school_college_name}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaGraduationCap />
                              </div>
                              <div>
                                <div className="detail-label">Highest Education</div>
                                <div className="detail-value">{profileData.highest_education}</div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col lg={12} md={12} sm={12}>
                            <h5 className="section-title">Course Information</h5>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaGraduationCap />
                              </div>
                              <div>
                                <div className="detail-label">Applied Course</div>
                                <div className="detail-value">{profileData.application_for_course}</div>
                              </div>
                            </div>
                            <div className="detail-item d-flex align-items-start gap-3 mb-3">
                              <div className="detail-icon">
                                <FaCalendarAlt />
                              </div>
                              <div>
                                <div className="detail-label">Application Date</div>
                                <div className="detail-value">{formatDate(profileData.created_at)}</div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="stat-card">
                  <Card.Body>
                    <div className="text-center py-4">
                      <h4>No profile data found</h4>
                      <p className="text-muted">Please check your applicant ID or try again later.</p>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Edit Profile Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
        className="edit-profile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Row>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="candidate_name"
                  value={editForm.candidate_name || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Guardian Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="guardian_name"
                  value={editForm.guardian_name || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="mobile_no"
                  value={editForm.mobile_no || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={12} md={12} sm={12} className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  name="address"
                  value={editForm.address || ''}
                  onChange={handleInputChange}
                  rows="2"
                ></textarea>
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  name="date_of_birth"
                  value={editForm.date_of_birth || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">School/College Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="school_college_name"
                  value={editForm.school_college_name || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Highest Education</label>
                <input
                  type="text"
                  className="form-control"
                  name="highest_education"
                  value={editForm.highest_education || ''}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={6} md={12} sm={12} className="mb-3">
                <label className="form-label">Applied Course</label>
                <input
                  type="text"
                  className="form-control"
                  name="application_for_course"
                  value={editForm.application_for_course || ''}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;