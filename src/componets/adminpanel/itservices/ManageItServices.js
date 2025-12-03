import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone, AiOutlineDelete } from 'react-icons/ai';

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageItServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [itServicesData, setItServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iconTimestamps, setIconTimestamps] = useState({}); // Changed from imageTimestamps to iconTimestamps
  const [forceRefresh, setForceRefresh] = useState(false);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    icon: null // Changed from image to icon
  });
  const [iconPreview, setIconPreview] = useState(null); // Changed from imagePreview to iconPreview
  const [hasIconChanged, setHasIconChanged] = useState(false); // Changed from hasImageChanged to hasIconChanged
  const [updating, setUpdating] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
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

  // Fetch IT services data on component mount
  useEffect(() => {
    const fetchItServicesData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/itservice-items/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch IT services data');
        }
        
        const result = await response.json();
        
        // The API returns data in the format {success: true, data: [{...}]}
        if (result.success && result.data && result.data.length > 0) {
          // Process the data - construct full icon URL if icon path is provided
          const processedData = result.data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            icon: item.icon ? `${API_BASE_URL}${item.icon}` : null // Changed from image to icon
          }));
          
          setItServicesData(processedData);
          
          // Create timestamps for each item to force icon refresh
          const timestamps = {};
          processedData.forEach(item => {
            timestamps[item.id] = Date.now();
          });
          setIconTimestamps(timestamps); // Changed from setImageTimestamps to setIconTimestamps
        } else {
          throw new Error('No IT services data found');
        }
      } catch (err) {
        console.error('Error fetching IT services data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItServicesData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle edit
  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      icon: null // Changed from image to icon
    });
    // Use the original icon without timestamp for preview
    const originalIconUrl = item.icon ? item.icon.split('?t=')[0] : null; // Changed from image to icon
    setIconPreview(originalIconUrl); // Changed from setImagePreview to setIconPreview
    setHasIconChanged(false); // Changed from setHasImageChanged to setHasIconChanged
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/itservice-items/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemToDelete.id }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to delete IT service');
      }
      
      // Update state by removing the deleted item
      setItServicesData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      
      setMessage("IT Service deleted successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowDeleteModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error deleting IT service:', error);
      setMessage(error.message || "Failed to delete IT service");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'icon') { // Changed from image to icon
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl); // Changed from setImagePreview to setIconPreview
        setHasIconChanged(true); // Changed from setHasImageChanged to setHasIconChanged
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
    dataToSend.append('id', currentEditItem.id);
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);
    
    if (hasIconChanged && editFormData.icon) { // Changed from hasImageChanged to hasIconChanged
      dataToSend.append('icon', editFormData.icon); // Changed from image to icon
    }
    
    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/itservice-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to update IT service');
      }
      
      const apiResponseData = await response.json();
      
      // Create a unique timestamp to force icon refresh
      const newTimestamp = Date.now();
      
      // Update the timestamp for the specific item
      setIconTimestamps(prev => ({ // Changed from setImageTimestamps to setIconTimestamps
        ...prev,
        [currentEditItem.id]: newTimestamp
      }));
      
      // Force a refresh
      setForceRefresh(prev => !prev);

      // Update state with the new data
      setItServicesData(prevData => 
        prevData.map(item => 
          item.id === currentEditItem.id 
            ? {
                ...item,
                title: editFormData.title,
                description: editFormData.description,
                icon: hasIconChanged && apiResponseData.data && apiResponseData.data.icon // Changed from image to icon
                    ? `${API_BASE_URL}${apiResponseData.data.icon}` // Changed from image to icon
                    : item.icon // Changed from image to icon
              }
            : item
        )
      );
      
      // If the icon was updated, also update the preview in the modal
      if (hasIconChanged && apiResponseData.data && apiResponseData.data.icon) { // Changed from image to icon
        setIconPreview(`${API_BASE_URL}${apiResponseData.data.icon}?t=${newTimestamp}`); // Changed from setImagePreview to setIconPreview
      }
      
      setMessage("IT Service updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating IT service:', error);
      setMessage(error.message || "Failed to update IT service");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setUpdating(false);
    }
  };

  // Create icon URL with timestamp for cache busting
  const getIconUrl = (item) => { // Changed from getImageUrl to getIconUrl
    if (!item.icon) return null; // Changed from image to icon
    const timestamp = iconTimestamps[item.id] || Date.now(); // Changed from imageTimestamps to iconTimestamps
    return `${item.icon}?t=${timestamp}&r=${forceRefresh ? '1' : '0'}`; // Changed from image to icon
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
            <h2 className="mb-4">Manage IT Services</h2>
            
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
            ) : itServicesData.length === 0 ? (
              <Col xs={12} className="text-center my-5">
                <p>No IT services data found.</p>
              </Col>
            ) : (
              <Row>
                {itServicesData.map((item) => (
                  <Col lg={6} md={12} sm={12} className="mb-4" key={item.id}>
                    <Card>
                      <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                          {/* Display the icon or a default icon */}
                          {getIconUrl(item) ? ( // Changed from getImageUrl to getIconUrl
                            <img 
                              src={getIconUrl(item)} // Changed from getImageUrl to getIconUrl
                              alt={item.title} 
                              style={{ width: '120px', height: '120px', marginRight: '15px', objectFit: 'cover' }}
                              key={`${getIconUrl(item)}-${forceRefresh}`} // Changed from getImageUrl to getIconUrl
                            />
                          ) : (
                            <AiOutlineFileDone size={120} style={{ marginRight: '15px' }} />
                          )}
                          <div className="flex-grow-1">
                            <Card.Title className="managetitle">{item.title}</Card.Title>
                          </div>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => handleEdit(item)}
                              disabled={updating}
                            >
                              {updating ? 'Updating...' : 'Edit'}
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDelete(item)}
                              disabled={deleting}
                            >
                              <AiOutlineDelete />
                            </Button>
                          </div>
                        </div>
                        <Card.Text>{item.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Container>
      </div>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit IT Service</Modal.Title>
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
              <Form.Label>Service Icon</Form.Label> {/* Changed from Service Image to Service Icon */}
              <Form.Control
                type="file"
                name="icon" // Changed from image to icon
                onChange={handleEditChange}
                accept="image/*"
              />
              {iconPreview && ( // Changed from imagePreview to iconPreview
                <div className="mt-3">
                  <img 
                    src={iconPreview} // Changed from imagePreview to iconPreview
                    alt="Icon Preview" // Changed from Image Preview to Icon Preview
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
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageItServices;