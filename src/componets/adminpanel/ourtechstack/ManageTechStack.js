import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone } from 'react-icons/ai'; // Default icon

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageTechStack = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [techStackData, setTechStackData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now()); // Add timestamp for cache busting
  const [forceRefresh, setForceRefresh] = useState(false); // Add force refresh flag
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
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

  // Fetch tech stack data on component mount
  useEffect(() => {
    const fetchTechStackData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ourtechstack-item/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tech stack data');
        }
        
        const result = await response.json();
        
        // The API returns data in the format {success: true, data: [{...}]}
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the array
          const item = result.data[0];
          
          // Process the data - construct full image URL if image path is provided
          const processedData = {
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.image ? `${API_BASE_URL}${item.image}` : null
          };
          
          setTechStackData(processedData);
          // Update timestamp to force image refresh
          setImageTimestamp(Date.now());
        } else {
          throw new Error('No tech stack data found');
        }
      } catch (err) {
        console.error('Error fetching tech stack data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTechStackData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle edit
  const handleEdit = () => {
    setEditFormData({
      title: techStackData.title,
      description: techStackData.description,
      image: null
    });
    // Use the original image without timestamp for preview
    const originalImageUrl = techStackData.image ? techStackData.image.split('?t=')[0] : null;
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
    setUpdating(true);
    
    const dataToSend = new FormData();
    // Send the ID in the payload as requested
    dataToSend.append('id', techStackData.id);
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);
    
    if (hasImageChanged && editFormData.image) {
      dataToSend.append('image', editFormData.image);
    }
    
    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/ourtechstack-item/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to update tech stack');
      }
      
      const apiResponseData = await response.json();
      
      // Create a unique timestamp to force image refresh
      const newTimestamp = Date.now();
      setImageTimestamp(newTimestamp);
      
      // Force a refresh
      setForceRefresh(prev => !prev);

      // Update state with the new data
      setTechStackData({
        ...techStackData,
        title: editFormData.title,
        description: editFormData.description,
        image: hasImageChanged && apiResponseData.data && apiResponseData.data.image
            ? `${API_BASE_URL}${apiResponseData.data.image}`
            : techStackData.image
      });
      
      // If the image was updated, also update the preview in the modal
      if (hasImageChanged && apiResponseData.data && apiResponseData.data.image) {
        setImagePreview(`${API_BASE_URL}${apiResponseData.data.image}?t=${newTimestamp}`);
      }
      
      setMessage("Tech Stack updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating tech stack:', error);
      setMessage(error.message || "Failed to update tech stack");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setUpdating(false);
    }
  };

  // Create image URL with timestamp for cache busting
  const imageUrl = techStackData.image ? `${techStackData.image}?t=${imageTimestamp}&r=${forceRefresh ? '1' : '0'}` : null;

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
            <h2 className="mb-4">Manage Tech Stack</h2>
            
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
            ) : Object.keys(techStackData).length === 0 ? (
              <Col xs={12} className="text-center my-5">
                <p>No tech stack data found.</p>
              </Col>
            ) : (
              <Row>
                <Col lg={12} md={12} sm={12} className="mb-4">
                  <Card>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        {/* Display the image or a default icon */}
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt="Tech Stack" 
                            style={{ width: '120px', height: '120px', marginRight: '15px', objectFit: 'cover' }}
                            key={`${imageUrl}-${forceRefresh}`} // Add key to force re-render
                          />
                        ) : (
                          <AiOutlineFileDone size={120} style={{ marginRight: '15px' }} />
                        )}
                        <div className="flex-grow-1">
                          <Card.Title className="managetitle">{techStackData.title}</Card.Title>
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
                      <Card.Text>{techStackData.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </Container>
      </div>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Tech Stack</Modal.Title>
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
              <Form.Label>Tech Stack Image</Form.Label>
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

export default ManageTechStack;