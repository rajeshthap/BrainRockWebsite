import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Modal, Card, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const ViewServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh images
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of cards to show per page
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    icon: null
  });
  
  // State for icon preview
  const [iconPreview, setIconPreview] = useState(null);
  const [currentIcon, setCurrentIcon] = useState(null); // To hold current icon URL

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

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/innovative-service-items/', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const apiResponse = await response.json();
      
      // Extract the data array from the response
      if (apiResponse.success && apiResponse.data) {
        // Prepend base URL to icon paths with cache-busting
        const servicesWithFullIconUrl = apiResponse.data.map(service => ({
          ...service,
          icon: service.icon ? `${BASE_URL}${service.icon}?v=${refreshKey}` : null
        }));
        setServices(servicesWithFullIconUrl);
      } else {
        throw new Error('Invalid API response structure');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setMessage("Failed to fetch services. Please try again.");
      setVariant("danger");
      setShowAlert(true);
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Open edit modal with service data
  const handleEdit = (service) => {
    setCurrentService(service);
    setFormData({
      id: service.id,
      title: service.title,
      icon: null
    });
    // Store the original icon URL without cache-busting parameter
    const originalIconUrl = service.icon ? service.icon.split('?')[0] : null;
    setCurrentIcon(originalIconUrl);
    setIconPreview(null);
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'icon') {
      const file = files[0];
      setFormData(prev => ({ ...prev, icon: file }));
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
      } else {
        setIconPreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission for updating service
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);
    
    const dataToSend = new FormData();
    dataToSend.append('id', formData.id);
    dataToSend.append('title', formData.title);
    if (formData.icon) {
      dataToSend.append('icon', formData.icon, formData.icon.name);
    }
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/innovative-service-items/', {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to update service');
      }
      
      setMessage("Service updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      // Increment refreshKey to force icon refresh
      setRefreshKey(prev => prev + 1);
      
      // Clear form data and icon preview
      setFormData({
        id: "",
        title: "",
        icon: null
      });
      setIconPreview(null);
      setCurrentIcon(null);
      
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error updating service:', error);
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

  // Handle delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/innovative-service-items/', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      
      setMessage("Service deleted successfully!");
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
      console.error('Error deleting service:', error);
      setMessage("Failed to delete service. Please try again.");
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Clean up when modal is closed
  const handleCloseModal = () => {
    setShowEditModal(false);
    setIconPreview(null);
    setCurrentIcon(null);
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
            <h2 className="mb-4">Manage Services</h2>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            {loading ? (
              <p>Loading services...</p>
            ) : services.length === 0 ? (
              <p>No services found.</p>
            ) : (
              <>
                <Row>
                  {currentItems.map((service) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={service.id}>
                      <Card className="h-100 service-card">
                        {service.icon && (
                          <Card.Img 
                            variant="top" 
                            src={service.icon} 
                            alt={service.title}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <Card.Body className="text-center">
                          <Card.Title className="managetitle">{service.title}</Card.Title>
                        </Card.Body>
                        <Card.Footer className="bg-white border-top-0 text-center">
                          <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(service)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>Delete</Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
                {renderPagination()}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Service Title</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Icon</Form.Label>
              <Form.Control type="file" name="icon" onChange={handleChange} accept="image/*" />
              <div className="mt-3">
                {iconPreview ? (
                  <img src={iconPreview} alt="Icon Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                ) : currentIcon ? (
                  <div>
                    <p>Current Icon:</p>
                    <img src={currentIcon} alt="Current Icon" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                ) : null}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2" type="button">Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Service'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewServices;