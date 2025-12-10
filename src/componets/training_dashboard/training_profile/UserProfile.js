// UserProfile.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Modal, Badge, Alert } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaCalendarAlt, FaIdCard, FaEdit, FaCheck, FaTimes, FaCamera, FaSave, FaArrowLeft } from "react-icons/fa";
import "../../../assets/css/emp_dashboard.css";
import TrainingHeader from "../TrainingHeader";
import TrainingLeftnav from "../TrainingLeftnav";
import "../../../assets/css/trainingprofile.css";
import { AuthContext } from "../../context/AuthContext";
import { UserProfileContext } from "../../context/UserProfileContext";

// Base URL for media and API resources
const BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const { updateUserProfile } = useContext(UserProfileContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Function to format the application_for_course field
  const formatCourseList = (courses) => {
    if (!courses) return 'N/A';
    
    // If it's already a string, return it
    if (typeof courses === 'string') {
      return courses;
    }
    
    // If it's an array of objects with a name property
    if (Array.isArray(courses)) {
      if (courses.length > 0) {
        // Check if each item is an object with a name property
        if (typeof courses[0] === 'object' && courses[0] !== null) {
          // Extract the name from each object
          const courseNames = courses.map(course => 
            course.name || course.course_name || course.title || JSON.stringify(course)
          );
          return courseNames.join(', ');
        } else {
          // If it's an array of strings, join them
          return courses.join(', ');
        }
      } else {
        return 'N/A';
      }
    }
    
    // If it's an object, try to extract a meaningful property
    if (typeof courses === 'object' && courses !== null) {
      return courses.name || courses.course_name || courses.title || JSON.stringify(courses);
    }

    // Fallback
    return String(courses);
  };

  // Function to fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Use unique_id from AuthContext as applicant_id
      const applicantId = user?.unique_id;
      if (!applicantId) {
        console.warn("No unique_id available in AuthContext");
        throw new Error("No unique_id available");
      }
      
      const response = await fetch(`${BASE_URL}/api/course-registration/?applicant_id=${applicantId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log("Profile data response:", result); // Debug log
      
      if (result.success) {
        setProfileData(result.data);
        setEditForm(result.data);
        // Update shared profile context immediately
        updateUserProfile({
          candidate_name: result.data.candidate_name,
          profile_photo: result.data.profile_photo,
          email: result.data.email,
          mobile_no: result.data.mobile_no,
        });
      } else {
        console.error("API returned success=false:", result.message);
        // Even if success is false, try to use the data if available
        if (result.data) {
          setProfileData(result.data);
          setEditForm(result.data);
          // Still update context with available data
          updateUserProfile({
            candidate_name: result.data.candidate_name,
            profile_photo: result.data.profile_photo,
            email: result.data.email,
            mobile_no: result.data.mobile_no,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [user]);

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

  // Function to determine status badge color
  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary"></Badge>;
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes("active")) return <Badge bg="success">Active</Badge>;
    if (statusLower.includes("approved")) return <Badge bg="success">Approved</Badge>;
    if (statusLower.includes("processed")) return <Badge bg="info">Processed</Badge>;
    if (statusLower.includes("pending")) return <Badge bg="warning">Pending</Badge>;
    if (statusLower.includes("rejected")) return <Badge bg="danger">Rejected</Badge>;
    
    return <Badge bg="secondary">{status}</Badge>;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Build absolute URL for profile photos returned by API
  const buildPhotoUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profile_photo', file);
      formData.append('applicant_id', user?.unique_id);
      
      const response = await fetch(`${BASE_URL}/api/course-registration/`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
        // Don't set Content-Type header when using FormData
      });
      
      console.log("Image upload response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Image upload response:", result);
      
      // Show success message immediately
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      
      // Refetch profile data to get the updated image
      await fetchProfileData();
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle camera icon click
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a clean payload with only editable fields
      // Filter out read-only fields like id, password, created_at, updated_at, etc.
      const payload = {
        applicant_id: user?.unique_id,
        candidate_name: editForm.candidate_name,
        guardian_name: editForm.guardian_name,
        address: editForm.address,
        date_of_birth: editForm.date_of_birth,
        school_college_name: editForm.school_college_name,
        highest_education: editForm.highest_education,
      };
      
      console.log("Submitting update with payload:", payload); // Debug log
      
      // Changed API path to not include profile ID
      const response = await fetch(`${BASE_URL}/api/course-registration/`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log("Response status:", response.status); // Debug log
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Update response:", result); // Debug log
      
      // Update local state with edited data (merge with original to keep read-only fields)
      const updatedData = { ...profileData, ...payload };
      setProfileData(updatedData);
      setEditForm(updatedData);
      
      // Update shared profile context immediately
      updateUserProfile({
        candidate_name: payload.candidate_name,
        profile_photo: profileData.profile_photo, // Keep existing photo
        email: profileData.email,
        mobile_no: profileData.mobile_no,
      });
      
      // Close the modal and show success message
      setShowEditModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(`Error updating profile: ${error.message}`);
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

        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert variant="success" className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
            <FaCheck className="me-2" />
            Profile updated successfully!
          </Alert>
        )}

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body profile-page">
          <Row className="align-items-center mb-4">
            <Col lg={6} md={12} sm={12}>
              <Button 
                variant="outline-secondary" 
                className="mb-3 d-flex align-items-center gap-2"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft /> Back
              </Button>
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
                <Card className="stat-card profile-loading-card">
                  <Card.Body>
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading profile data...</p>
                    </div>
                  </Card.Body>
                </Card>
              ) : profileData ? (
                <>
                  {/* Profile Header Card */}
                  <Card className="profile-header-card mb-4">
                    <Card.Body className="p-4">
                      <div className="profile-header d-flex flex-column flex-md-row align-items-center gap-4">
                        <div className="profile-photo-container position-relative">
                          {profileData.profile_photo ? (
                            <img
                              src={buildPhotoUrl(profileData.profile_photo)}
                              alt="Profile"
                              className="profile-photo"
                            />
                          ) : (
                            <div className="profile-photo-placeholder">
                              <FaUser />
                            </div>
                          )}
                          <div 
                            className="profile-photo-overlay"
                            onClick={handleCameraClick}
                            style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer' }}
                          >
                            {uploadingImage ? (
                              <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="visually-hidden">Uploading...</span>
                              </div>
                            ) : (
                              <FaCamera />
                            )}
                          </div>
                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </div>
                        <div className="profile-info flex-grow-1 text-center text-md-start">
                          <h2 className="profile-name">{profileData.candidate_name}</h2>
                          <div className="d-flex flex-column flex-md-row align-items-center gap-2 mb-2">
                           
                            <div className="d-flex align-items-center gap-2">
                              {/* <span className="text-muted">Status:</span> */}
                              {getStatusBadge(profileData.status)}
                            </div>
                          </div>
                          <p className="profile-bio">
                            Student at {profileData.school_college_name || "BrainRock Institute"}
                          </p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Profile Details Tabs */}
                  <Card className="profile-details-card">
                    <Card.Header className="bg-white border-bottom-0 p-0">
                      <ul className="nav nav-tabs profile-tabs">
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                          >
                            Personal Information
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                          >
                            Contact Details
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                            onClick={() => setActiveTab('education')}
                          >
                            Education
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'course' ? 'active' : ''}`}
                            onClick={() => setActiveTab('course')}
                          >
                            Course Information
                          </button>
                        </li>
                      </ul>
                    </Card.Header>
                    <Card.Body className="p-4">
                      {/* Personal Information Tab */}
                      {activeTab === 'personal' && (
                        <div className="tab-content">
                          <Row>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaUser />
                                </div>
                                <div className="info-content">
                                  <h6>Full Name</h6>
                                  <p>{profileData.candidate_name}</p>
                                </div>
                              </div>
                            </Col>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaCalendarAlt />
                                </div>
                                <div className="info-content">
                                  <h6>Date of Birth</h6>
                                  <p>{formatDate(profileData.date_of_birth)}</p>
                                </div>
                              </div>
                            </Col>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaMapMarkerAlt />
                                </div>
                                <div className="info-content">
                                  <h6>Address</h6>
                                  <p>{profileData.address}</p>
                                </div>
                              </div>
                            </Col>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaUser />
                                </div>
                                <div className="info-content">
                                  <h6>Guardian Name</h6>
                                  <p>{profileData.guardian_name}</p>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Contact Details Tab */}
                      {activeTab === 'contact' && (
                        <div className="tab-content">
                          <Row>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaEnvelope />
                                </div>
                                <div className="info-content">
                                  <h6>Email</h6>
                                  <p>{profileData.email}</p>
                                </div>
                              </div>
                            </Col>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaPhone />
                                </div>
                                <div className="info-content">
                                  <h6>Mobile Number</h6>
                                  <p>{profileData.mobile_no}</p>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Education Tab */}
                      {activeTab === 'education' && (
                        <div className="tab-content">
                          <Row>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaGraduationCap />
                                </div>
                                <div className="info-content">
                                  <h6>School/College</h6>
                                  <p>{profileData.school_college_name}</p>
                                </div>
                              </div>
                            </Col>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaGraduationCap />
                                </div>
                                <div className="info-content">
                                  <h6>Highest Education</h6>
                                  <p>{profileData.highest_education}</p>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Course Information Tab */}
                      {activeTab === 'course' && (
                        <div className="tab-content">
                          <Row>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaGraduationCap />
                                </div>
                                <div className="info-content">
                                  <h6>Applied Course</h6>
                                  <p>{formatCourseList(profileData.application_for_course)}</p>
                                </div>
                              </div>
                            </Col>
                            <Col lg={6} md={12} sm={12} className="mb-4">
                              <div className="info-item">
                                <div className="info-icon">
                                  <FaCalendarAlt />
                                </div>
                                <div className="info-content">
                                  <h6>Application Date</h6>
                                  <p>{formatDate(profileData.created_at)}</p>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </>
              ) : (
                <Card className="stat-card">
                  <Card.Body>
                    <div className="text-center py-5">
                      <FaTimes className="text-danger mb-3" style={{ fontSize: '3rem' }} />
                      <h4>No profile data found</h4>
                      <p className="text-muted">Please check your applicant ID or try again later.</p>
                      <Button variant="primary" onClick={fetchProfileData}>
                        Refresh Data
                      </Button>
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
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaEdit /> Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
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
                  disabled // Email field is disabled
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
                  disabled // Phone field is disabled
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
                  value={formatCourseList(editForm.application_for_course)}
                  onChange={handleInputChange}
                  disabled // Course field is disabled
                />
              </Col>
            </Row>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <FaTimes className="me-2" /> Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <FaSave className="me-2" /> Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;