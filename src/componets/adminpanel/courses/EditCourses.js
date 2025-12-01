import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone } from 'react-icons/ai'; // Default icon

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditCourses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    icon: null
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [hasIconChanged, setHasIconChanged] = useState(false);
  
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

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/course-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const result = await response.json();
        const coursesData = result.data || result;

        // Process the data to construct full icon URLs and format prices
        const processedCourses = coursesData.map(course => ({
          ...course,
          icon: course.icon ? `${API_BASE_URL}${course.icon}?t=${Date.now()}` : null,
          formattedPrice: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
          }).format(course.price)
        }));

        setCourses(processedCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        // Create FormData to send the ID in the payload as requested
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        // Use the base endpoint for DELETE
        const response = await fetch(`${API_BASE_URL}/api/course-items/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete course');
        }
        
        // Update the state to remove the deleted item
        setCourses(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Course deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting course:', error);
        setMessage(error.message || "Failed to delete course");
        setVariant("danger");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (course) => {
    setCurrentEditItem(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      icon: null // We'll handle the icon separately
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = course.icon ? course.icon.split('?t=')[0] : null;
    setIconPreview(originalImageUrl);
    setHasIconChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'icon') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
        setHasIconChanged(true);
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
    // MANDATORY: Send the ID in the payload
    dataToSend.append('id', currentEditItem.id); 
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);
    dataToSend.append('price', editFormData.price);
    dataToSend.append('duration', editFormData.duration);
    
    if (hasIconChanged && editFormData.icon) {
      dataToSend.append('icon', editFormData.icon);
    }
    
    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/course-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update course (Status: ${response.status})`);
      }
      
      const apiResponseData = await response.json();

      // --- INSTANT UI UPDATE WITH CORRECT PATH ---
      setCourses(prevData => 
        prevData.map(item => 
          item.id === currentEditItem.id 
            ? {
                ...item,
                title: editFormData.title,
                description: editFormData.description,
                price: editFormData.price,
                duration: editFormData.duration,
                // Update the icon URL if a new one was uploaded
                icon: hasIconChanged && apiResponseData.data && apiResponseData.data.icon
                    ? `${API_BASE_URL}${apiResponseData.data.icon}?t=${Date.now()}`
                    : item.icon
              } 
            : item
        )
      );
      
      setMessage("Course updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage(error.message || "Failed to update course");
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
            <h2 className="mb-4">Manage Courses</h2>
            
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
            ) : (
              <Row>
                {courses.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>No courses found.</p>
                  </Col>
                ) : (
                  courses.map((course) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={course.id}>
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            {/* Display the icon or a default */}
                            {course.icon ? (
                              <img 
                                src={course.icon} 
                                alt={course.title} 
                                style={{ width: '60px', height: '60px', marginRight: '15px' }} 
                              />
                            ) : (
                              <AiOutlineFileDone size={60} style={{ marginRight: '15px' }} />
                            )}
                            <div>
                              <Card.Title className="managetitle">{course.title}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">Duration: {course.duration}</Card.Subtitle>
                            </div>
                          </div>
                          <Card.Text>{course.description}</Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Price: {course.formattedPrice}</span>
                            <div>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleEdit(course)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleDelete(course.id)}
                              >
                                Delete
                              </Button>
                            </div>
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
          <Modal.Title>Edit Course</Modal.Title>
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
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Course Icon</Form.Label>
              <Form.Control
                type="file"
                name="icon"
                onChange={handleEditChange}
                accept="image/*"
              />
              {iconPreview && (
                <div className="mt-3">
                  <img 
                    src={iconPreview} 
                    alt="Icon Preview" 
                    style={{ maxWidth: '100px', maxHeight: '100px' }} 
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

export default EditCourses;