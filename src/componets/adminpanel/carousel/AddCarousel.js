import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const AddCarousel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: null, // Will hold the file object
    alt: ""
  });
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

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
      // Handle file input
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create a preview URL for the selected image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      // Handle text inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(""); // Clear previous messages
    
    // Create a FormData object to send the file
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('subtitle', formData.subtitle);
    dataToSend.append('description', formData.description);
    if (formData.image) {
      dataToSend.append('image', formData.image, formData.image.name);
    }
    dataToSend.append('alt', formData.alt);
    
    try {
      // Replace with your actual API endpoint for file upload
      const response = await fetch('https://api.example.com/carousel-items/upload', {
        method: 'POST',
        // Do NOT set the 'Content-Type' header. The browser will set it to 'multipart/form-data' with the correct boundary.
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add carousel item');
      }
      
      setMessage("Carousel item added successfully!");
      setVariant("success");
      
      // Reset form after successful submission
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        image: null,
        alt: ""
      });
      setImagePreview(null);
      
      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/admin/website-management');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding carousel item:', error);
      setMessage(error.message || "Failed to add carousel item. Please try again.");
      setVariant("danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <h2 className="mb-4">Add New Carousel Item</h2>
            
            {message && (
              <Alert variant={variant} className="mb-4">
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter carousel title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Subtitle</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter carousel subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter carousel description"
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
                  accept="image/*" // Accept only image files
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
                {isSubmitting ? 'Submitting...' : 'Add Carousel Item'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => navigate('/admin/website-management')}
              >
                Cancel
              </Button>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AddCarousel;