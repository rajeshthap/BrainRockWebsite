import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone } from 'react-icons/ai'; // Default icon

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditAboutUs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [aboutUsData, setAboutUsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
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

  // Fetch About Us data on component mount
  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/aboutus-item/`);
        if (!response.ok) {
          throw new Error('Failed to fetch About Us data');
        }
        const result = await response.json();
        
        // Check if data exists and has items
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the array
          const item = result.data[0];
          
          // Process the data to construct full image URL if exists
          const processedData = {
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.image ? `${API_BASE_URL}${item.image}?t=${Date.now()}` : null
          };

          setAboutUsData(processedData);
        } else {
          throw new Error('No About Us data found');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching About Us data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUsData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle edit
  const handleEdit = () => {
    setEditFormData({
      title: aboutUsData.title,
      description: aboutUsData.description,
      image: null // We'll handle the image separately
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = aboutUsData.image ? aboutUsData.image.split('?t=')[0] : null;
    setImagePreview(originalImageUrl);
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
        setImagePreview(previewUrl);
        setHasImageChanged(true);
        setEditFormData(prev => ({
          ...prev,
          [name]: file
        }));
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
    // Send the ID in the payload as requested
    dataToSend.append('id', aboutUsData.id);
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);
    
    if (hasImageChanged && editFormData.image) {
      dataToSend.append('image', editFormData.image);
    }
    
    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/aboutus-item/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update About Us (Status: ${response.status})`);
      }
      
      const apiResponseData = await response.json();

      // Update the state with the new data
      setAboutUsData({
        ...aboutUsData,
        title: editFormData.title,
        description: editFormData.description,
        image: hasImageChanged && apiResponseData.data && apiResponseData.data.image
            ? `${API_BASE_URL}${apiResponseData.data.image}?t=${Date.now()}`
            : aboutUsData.image
      });
      
      setMessage("About Us updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating About Us:', error);
      setMessage(error.message || "Failed to update About Us");
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
            <h2 className="mb-4">Manage About Us</h2>
            
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
                {Object.keys(aboutUsData).length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>No About Us data found.</p>
                  </Col>
                ) : (
                  <Col lg={12} md={12} sm={12} className="mb-4">
                    <Card>
                      <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                          {/* Display the image or a default */}
                          {aboutUsData.image ? (
                            <img 
                              src={aboutUsData.image} 
                              alt="About Us" 
                              style={{ width: '120px', height: '120px', marginRight: '15px', objectFit: 'cover' }} 
                            />
                          ) : (
                            <AiOutlineFileDone size={120} style={{ marginRight: '15px' }} />
                          )}
                          <div className="flex-grow-1">
                            <Card.Title className="managetitle">{aboutUsData.title}</Card.Title>
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleEdit}
                          >
                            Edit
                          </Button>
                        </div>
                        <Card.Text>{aboutUsData.description}</Card.Text>
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
          <Modal.Title>Edit About Us</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>About Us Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleEditChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img 
                    src={imagePreview} 
                    alt="Image Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
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

export default EditAboutUs;