import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Pagination, Badge} from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define the base URL as a constant to avoid repetition
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditNotification = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Data state
  const [notificationData, setNotificationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    message: "",
    priority: "medium",
    expiry_date: ""
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch notification data (placeholder - will be replaced with actual API)
  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        // Placeholder API call - replace with actual endpoint
        const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
          credentials: 'include'
        });
       
        if (!response.ok) {
          throw new Error('Failed to fetch notification data');
        }
       
        const result = await response.json();
       
        if (result.success) {
          // Construct full image URLs
          const data = result.data.map(item => ({
            ...item,
            image: item.image ? `${API_BASE_URL}${item.image}?t=${Date.now()}` : null
          }));
          setNotificationData(data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error fetching notification data:', error);
        setMessage(error.message || "Failed to fetch notification data");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter notification data based on search term
  const filteredNotificationData = searchTerm.trim() === '' 
    ? notificationData 
    : notificationData.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.message?.toLowerCase().includes(lowerSearch) ||
          item.priority?.toLowerCase().includes(lowerSearch)
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotificationData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotificationData.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete (placeholder - will be replaced with actual API)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        // Placeholder API call - replace with actual endpoint
        const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });
       
        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }
       
        setNotificationData(prevData => prevData.filter(item => item.id !== id));
       
        setMessage("Notification deleted successfully!");
        setVariant("success");
        setShowAlert(true);
       
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting notification:', error);
        setMessage(error.message || "Failed to delete notification");
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
      title: item.title,
      message: item.message,
      priority: item.priority || "medium",
      expiry_date: item.expiry_date || ""
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

  // Handle edit form submission (placeholder - will be replaced with actual API)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
   
    const dataToSend = new FormData();
    dataToSend.append('id', currentEditItem.id);
    dataToSend.append('title', editFormData.title);
    dataToSend.append('message', editFormData.message);
    dataToSend.append('priority', editFormData.priority);
    dataToSend.append('expiry_date', editFormData.expiry_date);
   
    if (hasImageChanged && e.target.image.files[0]) {
      dataToSend.append('image', e.target.image.files[0]);
    }
   
    try {
      // Placeholder API call - replace with actual endpoint
      const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
     
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update notification (Status: ${response.status})`);
      }
     
      const apiResponseData = await response.json();
 
      // Generate a unique timestamp for cache busting
      const timestamp = Date.now();
     
      // Instant UI update with correct path
      setNotificationData(prevData =>
        prevData.map(item =>
          item.id === currentEditItem.id
            ? {
                ...item,
                title: editFormData.title,
                message: editFormData.message,
                priority: editFormData.priority,
                expiry_date: editFormData.expiry_date,
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
     
      setMessage("Notification updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
     
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating notification:', error);
      setMessage(error.message || "Failed to update notification");
      setVariant("danger");
      setShowAlert(true);
     
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Manage Notifications</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by title, message, or priority..."
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
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
              <Row>
                {currentItems.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>{searchTerm ? 'No notifications match your search.' : 'No notifications found.'}</p>
                  </Col>
                ) : (
                  currentItems.map((item) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={item.id}>
                      <Card className="h-100">
                        {item.image && (
                          <Card.Img
                            variant="top"
                            src={item.image}
                            alt={item.title || "Notification image"}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="managetitle">{item.title}</Card.Title>
                            <Badge bg={getPriorityBadgeColor(item.priority)}>
                              {item.priority || 'Medium'}
                            </Badge>
                          </div>
                          <Card.Text>{item.message}</Card.Text>
                          {item.expiry_date && (
                            <div className="text-muted small mb-3">
                              Expires: {new Date(item.expiry_date).toLocaleDateString()}
                            </div>
                          )}
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages).keys()].map(page => (
                      <Pagination.Item 
                        key={page + 1} 
                        active={page + 1 === currentPage}
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
              </>
            )}
          </div>
        </Container>
      </div>
     
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Notification</Modal.Title>
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
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="message"
                value={editFormData.message}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
           
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={editFormData.priority}
                    onChange={handleEditChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expiry_date"
                    value={editFormData.expiry_date}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
            </Row>
           
            <Form.Group className="mb-3">
              <Form.Label>Image (Optional)</Form.Label>
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

export default EditNotification;