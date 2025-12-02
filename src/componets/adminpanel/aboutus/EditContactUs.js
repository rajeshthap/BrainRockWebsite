import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone } from 'react-icons/ai'; // Default icon

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditContactUs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [companyDetails, setCompanyDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    address: "",
    email: "",
    phone: ""
  });
  const [updating, setUpdating] = useState(false); // Add updating state
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

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

  // Fetch company details on component mount
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/company-details/`);
        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }
        const result = await response.json();
        
        // Check if data exists and has items
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the data array
          const item = result.data[0];
          
          setCompanyDetails({
            id: item.id,
            address: item.address,
            email: item.email,
            phone: item.phone
          });
        } else {
          throw new Error('No company details found');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching company details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle edit
  const handleEdit = () => {
    setEditFormData({
      address: companyDetails.address,
      email: companyDetails.email,
      phone: companyDetails.phone
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const dataToSend = new FormData();
    // Send the ID in the payload as requested
    dataToSend.append('id', companyDetails.id);
    dataToSend.append('address', editFormData.address);
    dataToSend.append('email', editFormData.email);
    dataToSend.append('phone', editFormData.phone);
    
    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/company-details/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update company details (Status: ${response.status})`);
      }
      
      const apiResponseData = await response.json();

      // Update the state with the new data
      setCompanyDetails({
        ...companyDetails,
        address: editFormData.address,
        email: editFormData.email,
        phone: editFormData.phone
      });
      
      setMessage("Company details updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating company details:', error);
      setMessage(error.message || "Failed to update company details");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setUpdating(false);
    }
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
            <h2 className="mb-4">Manage Contact Information</h2>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : error ? (
              <Col xs={12} className="text-center my-5">
                <Alert variant="danger">{error}</Alert>
              </Col>
            ) : (
              <Row>
                {Object.keys(companyDetails).length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>No company details found.</p>
                  </Col>
                ) : (
                  <Col lg={12} md={12} sm={12} className="mb-4">
                    <Card>
                      <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                          <div className="flex-grow-1">
                            <Card.Title className="managetitle">Company Information</Card.Title>
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleEdit}
                            disabled={updating}
                          >
                            {updating ? 'Updating...' : 'Edit'}
                          </Button>
                        </div>
                        
                        <div className="info-boxes mt-3">
                          <div className="info-box">
                            <div className="icon">📍</div>
                            <h4>Address</h4>
                            <p>{companyDetails.address}</p>
                          </div>

                          <div className="info-box">
                            <div className="icon">📞</div>
                            <h4>Phone</h4>
                            <p>{companyDetails.phone}</p>
                          </div>

                          <div className="info-box">
                            <div className="icon">📧</div>
                            <h4>Email</h4>
                            <p>{companyDetails.email}</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            )}
          </div>
        </Container>
      </div>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Company Information</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={editFormData.address}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={updating}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EditContactUs;