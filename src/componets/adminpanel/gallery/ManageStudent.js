import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineUser } from 'react-icons/ai'; // Default icon for students

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageStudent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    course_name: "",
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

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // No credentials needed for GET
        const response = await fetch(`${API_BASE_URL}/api/gallery-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const result = await response.json();
        const studentsData = result.data || result;

        // Process the data to construct full image URLs and format dates
        const processedStudents = studentsData.map(student => {
          // Create a new object with all original properties
          const processedStudent = { ...student };
          
          // Format the image URL
          if (student.image) {
            processedStudent.image = `${API_BASE_URL}${student.image}?t=${Date.now()}`;
          }
          
          // Format the created_at date
          if (student.created_at) {
            const createdDate = new Date(student.created_at);
            processedStudent.formatted_created_at = createdDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          return processedStudent;
        });

        setStudents(processedStudents);
        console.log("Processed students:", processedStudents); // Debug log
      } catch (err) {
        setError(err.message);
        console.error("Error fetching students:", err); // Debug log
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        // Create FormData to send the ID in the payload as requested
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        // Use the base endpoint for DELETE
        const response = await fetch(`${API_BASE_URL}/api/gallery-items/`, {
          method: 'DELETE',
          credentials: 'include', // Credentials are necessary for DELETE
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete student');
        }
        
        // Update the state to remove the deleted item
        setStudents(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Student deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting student:', error);
        setMessage(error.message || "Failed to delete student");
        setVariant("danger");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (student) => {
    setCurrentEditItem(student);
    setEditFormData({
      full_name: student.full_name,
      course_name: student.course_name,
      image: null
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = student.image ? student.image.split('?t=')[0] : null;
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

  // Handle edit form submission with instant UI update
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Create a temporary object URL for the new image if it changed
    let tempImageUrl = null;
    if (hasImageChanged && editFormData.image) {
      tempImageUrl = URL.createObjectURL(editFormData.image);
    }
    
    // Store the original student data for potential rollback
    const originalStudentData = students.find(s => s.id === currentEditItem.id);
    
    // Update the UI immediately with the new data
    setStudents(prevData => 
      prevData.map(item => 
        item.id === currentEditItem.id 
          ? {
              ...item,
              full_name: editFormData.full_name,
              course_name: editFormData.course_name,
              image: hasImageChanged ? tempImageUrl : item.image
            } 
          : item
      )
    );
    
    // Close the modal immediately
    setShowEditModal(false);
    
    const dataToSend = new FormData();
    dataToSend.append('id', currentEditItem.id); 
    dataToSend.append('full_name', editFormData.full_name);
    dataToSend.append('course_name', editFormData.course_name);
    
    if (hasImageChanged && editFormData.image) {
      dataToSend.append('image', editFormData.image);
    }
    
    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/gallery-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        // If API fails, revert to the original data
        setStudents(prevData => 
          prevData.map(item => 
            item.id === currentEditItem.id ? originalStudentData : item
          )
        );
        throw new Error('Failed to update student');
      }
      
      const apiResponseData = await response.json();
      
      // Clean up the temporary URL if we created one
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
      
      // Final update with the permanent URL from the API
      setStudents(prevData => 
        prevData.map(item => 
          item.id === currentEditItem.id 
            ? {
                ...item,
                full_name: editFormData.full_name,
                course_name: editFormData.course_name,
                image: hasImageChanged && apiResponseData.data && apiResponseData.data.image
                    ? `${API_BASE_URL}${apiResponseData.data.image}?t=${Date.now()}`
                    : item.image
              } 
            : item
        )
      );
      
      setMessage("Student updated successfully!");
      setVariant("success");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating student:', error);
      setMessage(error.message || "Failed to update student");
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
            <h2 className="mb-4">Manage Students</h2>
            
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
                {students.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>No students found.</p>
                  </Col>
                ) : (
                  students.map((student) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={student.id}>
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            {/* Display the image or a default icon */}
                            {student.image ? (
                              <img 
                                src={student.image} 
                                alt={student.full_name} 
                                style={{ width: '60px', height: '60px', marginRight: '15px', objectFit: 'cover', borderRadius: '50%' }} 
                              />
                            ) : (
                              <AiOutlineUser size={60} style={{ marginRight: '15px' }} />
                            )}
                            <div>
                              <Card.Title className="managetitle">{student.full_name}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">Course: {student.course_name}</Card.Subtitle>
                            </div>
                          </div>
                          <Card.Text className="mb-2">
                            <small className="text-muted">
                              Created: {student.formatted_created_at || 'N/A'}
                            </small>
                          </Card.Text>
                          <Card.Text className="mb-3">
                            <small className="text-muted">
                              By: {student.created_by || 'N/A'}
                            </small>
                          </Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <span></span> {/* Empty span for alignment */}
                            <div>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleEdit(student)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleDelete(student.id)}
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
          <Modal.Title>Edit Student</Modal.Title>
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
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                name="course_name"
                value={editFormData.course_name}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Student Image</Form.Label>
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
                    alt="Student Preview" 
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

export default ManageStudent;