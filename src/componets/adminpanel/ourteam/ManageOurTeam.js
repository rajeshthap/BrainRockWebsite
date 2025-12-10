import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Modal, Pagination, Table } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const ManageOurTeam = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh images
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to show per page
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    id: "",
    full_name: "",
    designation: "",
    facebook_profile_link: "",
    instagram_profile_link: "",
    linkedinn_profile_link: "",
    x_profile_link: "",
    image: null
  });
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null); // To hold current image URL

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

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

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // --- Filter Team Members ---
  const filteredTeamMembers = searchTerm.trim() === '' 
    ? teamMembers 
    : teamMembers.filter((member) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          member.full_name?.toLowerCase().includes(lowerSearch) ||
          member.designation?.toLowerCase().includes(lowerSearch)
        );
      });

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourteam-items/', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const apiResponse = await response.json();
      
      // Extract the data array from the response
      if (apiResponse.success && apiResponse.data) {
        // Prepend base URL to image paths with cache-busting
        const membersWithFullImageUrl = apiResponse.data.map(member => ({
          ...member,
          image: member.image ? `${BASE_URL}${member.image}?v=${refreshKey}` : null
        }));
        setTeamMembers(membersWithFullImageUrl);
      } else {
        throw new Error('Invalid API response structure');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMessage("Failed to fetch team members. Please try again.");
      setVariant("danger");
      setShowAlert(true);
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeamMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeamMembers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Open edit modal with member data
  const handleEdit = (member) => {
    setCurrentMember(member);
    setFormData({
      id: member.id,
      full_name: member.full_name,
      designation: member.designation,
      facebook_profile_link: member.facebook_profile_link || "",
      instagram_profile_link: member.instagram_profile_link || "",
      linkedinn_profile_link: member.linkedinn_profile_link || "",
      x_profile_link: member.x_profile_link || "",
      image: null
    });
    // Store the original image URL without cache-busting parameter
    const originalImageUrl = member.image ? member.image.split('?')[0] : null;
    setCurrentImage(originalImageUrl);
    setImagePreview(null);
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission for updating team member
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);
    
    const dataToSend = new FormData();
    dataToSend.append('id', formData.id);
    dataToSend.append('full_name', formData.full_name);
    dataToSend.append('designation', formData.designation);
    dataToSend.append('facebook_profile_link', formData.facebook_profile_link);
    dataToSend.append('instagram_profile_link', formData.instagram_profile_link);
    dataToSend.append('linkedinn_profile_link', formData.linkedinn_profile_link);
    dataToSend.append('x_profile_link', formData.x_profile_link);
    if (formData.image) {
      dataToSend.append('image', formData.image, formData.image.name);
    }
    
    try {
      // Modified to send ID in payload, not in URL path
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourteam-items/', {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to update team member');
      }
      
      setMessage("Team member updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      // Increment refreshKey to force image refresh
      setRefreshKey(prev => prev + 1);
      
      // Clear form data and image preview
      setFormData({
        id: "",
        full_name: "",
        designation: "",
        facebook_profile_link: "",
        instagram_profile_link: "",
        linkedinn_profile_link: "",
        x_profile_link: "",
        image: null
      });
      setImagePreview(null);
      setCurrentImage(null);
      
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error updating team member:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Could not connect to the server.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete team member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) {
      return;
    }
    
    try {
      // Modified to send ID in payload, not in URL path
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourteam-items/', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }
      
      setMessage("Team member deleted successfully!");
      setVariant("success");
      setShowAlert(true);
      
      // Increment refreshKey to force refresh
      setRefreshKey(prev => prev + 1);
      
      // Check if the current page will become empty after deletion
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error deleting team member:', error);
      setMessage("Failed to delete team member. Please try again.");
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Clean up when modal is closed
  const handleCloseModal = () => {
    setShowEditModal(false);
    setImagePreview(null);
    setCurrentImage(null);
  };

  // --- Render Pagination Component ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

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
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Manage Team Members</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by name or designation..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            {loading ? (
              <p>Loading team members...</p>
            ) : teamMembers.length === 0 ? (
              <p>No team members found.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Social Links</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">
                            {searchTerm ? 'No team members match your search.' : 'No team members found.'}
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((member) => (
                          <tr key={member.id}>
                            <td className="text-center">
                              {member.image ? (
                                <img 
                                  src={member.image} 
                                  alt={member.full_name} 
                                  className="team-image-list"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                                />
                              ) : (
                                <div className="team-placeholder" style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e9ecef' }}></div>
                              )}
                            </td>
                            <td>{member.full_name}</td>
                            <td>{member.designation}</td>
                            <td>
                              <div className="social-links">
                                {member.facebook_profile_link && <a href={member.facebook_profile_link} target="_blank" rel="noopener noreferrer" className="me-2"><i className="fab fa-facebook"></i></a>}
                                {member.instagram_profile_link && <a href={member.instagram_profile_link} target="_blank" rel="noopener noreferrer" className="me-2"><i className="fab fa-instagram"></i></a>}
                                {member.linkedinn_profile_link && <a href={member.linkedinn_profile_link} target="_blank" rel="noopener noreferrer" className="me-2"><i className="fab fa-linkedin"></i></a>}
                                {member.x_profile_link && <a href={member.x_profile_link} target="_blank" rel="noopener noreferrer" className="me-2"><i className="fab fa-x-twitter"></i></a>}
                              </div>
                            </td>
                            <td>
                              <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(member)}>Edit</Button>
                              <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>Delete</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control type="text" name="designation" value={formData.designation} onChange={handleChange} required />
            </Form.Group>
            <Row>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook Profile Link</Form.Label>
                  <Form.Control type="url" name="facebook_profile_link" value={formData.facebook_profile_link} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Instagram Profile Link</Form.Label>
                  <Form.Control type="url" name="instagram_profile_link" value={formData.instagram_profile_link} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>LinkedIn Profile Link</Form.Label>
                  <Form.Control type="url" name="linkedinn_profile_link" value={formData.linkedinn_profile_link} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>X (Twitter) Profile Link</Form.Label>
                  <Form.Control type="url" name="x_profile_link" value={formData.x_profile_link} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control type="file" name="image" onChange={handleChange} accept="image/*" />
              <div className="mt-3">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                ) : currentImage ? (
                  <div>
                    <p>Current Image:</p>
                    <img src={currentImage} alt="Current Profile" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                ) : null}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2" type="button">Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Team Member'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageOurTeam;