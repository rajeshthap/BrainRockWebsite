import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const AddClient = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    designation: "",
    description: "",
    image: null, // Will hold the file object
    alt: ""
  });
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

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

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      full_name: "",
      designation: "",
      description: "",
      image: null,
      alt: ""
    });
    setImagePreview(null);
    setMessage("");
    setShowAlert(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false); // Hide any previous alerts
    
    const dataToSend = new FormData();
    dataToSend.append('full_name', formData.full_name);
    dataToSend.append('designation', formData.designation);
    dataToSend.append('description', formData.description);
    if (formData.image) {
      dataToSend.append('image', formData.image, formData.image.name);
    }
    dataToSend.append('alt', formData.alt);
    
    try {
      // Client API endpoint
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourclient-items/', {
        method: 'POST',
        headers: {
          // 'Content-Type' should be omitted when sending FormData
        },
        credentials: 'include',
        body: dataToSend,
      });
      
      // Handle bad API responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to add client (Status: ${response.status})`);
      }
      
      // --- SUCCESS PATH ---
      setMessage("Client added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm(); // Clear the form on success
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // --- FAILURE PATH ---
      console.error('Error adding client:', error);
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
            <h2 className="mb-4">Add New Client</h2>
            
            {/* This alert will show for both success and error */}
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
                  placeholder="Enter client's full name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter client's designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter client description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                />
                 {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px' }} />
                  </div>
                )}
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Alt Text</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter alt text for image"
                  name="alt"
                  value={formData.alt}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                className="me-2"
              >
                {isSubmitting ? 'Submitting...' : 'Add Client'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={clearForm}
                type="button"
              >
                Clear
              </Button>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AddClient;