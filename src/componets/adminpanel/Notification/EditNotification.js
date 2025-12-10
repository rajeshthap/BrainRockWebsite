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
    content: "", // Changed from message to content to match API
    status: "active"
  });

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

  // Fetch notification data
  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/all-notification-post/`, {
          method: 'GET',
          credentials: 'include'
        });
       
        if (!response.ok) {
          throw new Error('Failed to fetch notification data');
        }
       
        const result = await response.json();
       
        if (result.success) {
          // Map API response to component structure
          const data = result.data.map(item => ({
            ...item,
            message: item.content, // Map content to message for display
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
          item.content?.toLowerCase().includes(lowerSearch) ||
          item.status?.toLowerCase().includes(lowerSearch)
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotificationData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotificationData.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id, post_id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/all-notification-post/`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_id: post_id
          }),
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
      content: item.content, // Changed from message to content
      status: item.status || "active"
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
   
    try {
      const response = await fetch(`${API_BASE_URL}/api/all-notification-post/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: currentEditItem.post_id,
          title: editFormData.title,
          content: editFormData.content // Changed from message to content
        }),
      });
     
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update notification (Status: ${response.status})`);
      }
     
      // Update UI with the edited data
      setNotificationData(prevData =>
        prevData.map(item =>
          item.id === currentEditItem.id
            ? {
                ...item,
                title: editFormData.title,
                content: editFormData.content, // Changed from message to content
                message: editFormData.content, // Keep message field for display
                status: editFormData.status,
                updated_at: new Date().toISOString()
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

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      default: return 'primary';
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
                  placeholder="Search by title, content, or status..."
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
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="managetitle">{item.title}</Card.Title>
                            <Badge bg={getStatusBadgeColor(item.status)}>
                              {item.status || 'Active'}
                            </Badge>
                          </div>
                          <Card.Text>{item.message}</Card.Text>
                          <div className="text-muted small mb-3">
                            Post ID: {item.post_id}
                          </div>
                          <div className="text-muted small mb-3">
                            Created: {new Date(item.created_at).toLocaleDateString()}
                          </div>
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
                              onClick={() => handleDelete(item.id, item.post_id)}
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
              <Form.Label>Post ID</Form.Label>
              <Form.Control
                type="text"
                value={currentEditItem?.post_id || ''}
                disabled
              />
            </Form.Group>
            
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
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={editFormData.content}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
           
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editFormData.status}
                onChange={handleEditChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
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