import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const AddCertification = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    father_name: "",
    from_date: "",
    to_date: "",
    program: "", // Will store course ID
  });
  
  // Courses state for dropdown
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-list/', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch courses (Status: ${response.status})`);
        }
        
        const data = await response.json();
        if (data.success && data.courses) {
          setCourses(data.courses);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setMessage("Failed to load courses. Please refresh the page.");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setLoadingCourses(false);
      }
    };
    
    fetchCourses();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      full_name: "",
      father_name: "",
      from_date: "",
      to_date: "",
      program: "",
    });
    setMessage("");
    setShowAlert(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/certificate/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to add certification (Status: ${response.status})`);
      }
      
      // Success path
      setMessage("Certification added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm();
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error adding certification:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      
      // Hide error alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
      
    } finally {
      setIsSubmitting(false);
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
            <h2 className="mb-4">Add New Certification</h2>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Father's Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Father's Name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="from_date"
                      value={formData.from_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>To Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="to_date"
                      value={formData.to_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Program</Form.Label>
                {loadingCourses ? (
                  <Form.Control as="select" disabled>
                    <option>Loading courses...</option>
                  </Form.Control>
                ) : (
                  <Form.Control
                    as="select"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a program</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </Form.Control>
                )}
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  onClick={clearForm}
                  type="button"
                  className="me-2"
                >
                  Clear
                </Button>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting || loadingCourses}
                >
                  {isSubmitting ? 'Submitting...' : 'Add Certification'}
                </Button>
              </div>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AddCertification;