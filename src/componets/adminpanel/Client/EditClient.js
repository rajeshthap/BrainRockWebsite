import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define the base URL as a constant to avoid repetition
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditClient = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    designation: "",
    description: ""
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  
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

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ourclient-items/`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch client data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Construct full image URLs
          const data = result.data.map(item => ({
            ...item,
            image: item.image ? `${API_BASE_URL}${item.image}?t=${Date.now()}` : null
          }));
          setClientData(data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        setMessage(error.message || "Failed to fetch client data");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        const response = await fetch(`${API_BASE_URL}/api/ourclient-items/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete client');
        }
        
        setClientData(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Client deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting client:', error);
        setMessage(error.message || "Failed to delete client");
        setVariant("danger");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditFormData({
      full_name: item.full_name,
      designation: item.designation,
      description: item.description
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = item.image ? item.image.split('?t=')[0] : null;
    setEditImagePreview(originalImageUrl);
    setHasImageChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setEditImagePreview(previewUrl);
        setHasImageChanged(true);
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = new FormData();
    dataToSend.append('id', currentEditItem.id); 
    dataToSend.append('full_name', editFormData.full_name);
    dataToSend.append('designation', editFormData.designation);
    dataToSend.append('description', editFormData.description);
    
    if (hasImageChanged && e.target.image.files[0]) {
      dataToSend.append('image', e.target.image.files[0]);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ourclient-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update client (Status: ${response.status})`);
      }
      
      const apiResponseData = await response.json();

      // Generate a unique timestamp for cache busting
      const timestamp = Date.now();
      
      // Instant UI update with correct path
      setClientData(prevData => 
        prevData.map(item => 
          item.id === currentEditItem.id 
            ? {
                ...item,
                full_name: editFormData.full_name,
                designation: editFormData.designation,
                description: editFormData.description,
                // Always update the image URL with a new timestamp to force refresh
                image: hasImageChanged 
                  ? (editImagePreview && editImagePreview.startsWith('blob:') 
                      ? editImagePreview // Use the blob URL for immediate preview
                      : `${API_BASE_URL}${apiResponseData.data.image || item.image?.split('?t=')[0]}?t=${timestamp}`)
                  : `${item.image?.split('?t=')[0]}?t=${timestamp}` // Add timestamp to existing image
              } 
            : item
        )
      );
      
      setMessage("Client updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating client:', error);
      setMessage(error.message || "Failed to update client");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
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
            <h2 className="mb-4">Manage Clients</h2>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Row>
                {clientData.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>No clients found.</p>
                  </Col>
                ) : (
                  clientData.map((item) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={item.id}>
                      <Card className="h-100">
                        {item.image && (
                          <Card.Img 
                            variant="top" 
                            src={item.image} 
                            alt={item.full_name || "Client image"}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <Card.Body>
                          <Card.Title>{item.full_name}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">{item.designation}</Card.Subtitle>
                          <Card.Text>{item.description}</Card.Text>
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            )}
          </div>
        </Container>
      </div>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Client</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={editFormData.full_name}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                type="text"
                name="designation"
                value={editFormData.designation}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleEditChange}
                accept="image/*"
              />
              {editImagePreview && (
                <div className="mt-3">
                  <img 
                    src={editImagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '150px' }} 
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EditClient;