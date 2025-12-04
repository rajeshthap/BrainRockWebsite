import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const AddProject = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    company_name: "",
    technology_used: [],
    company_logo: null // Will hold the file object
  });
  
  // State for logo preview
  const [logoPreview, setLogoPreview] = useState(null);
  
  // State for technology input field
  const [techInput, setTechInput] = useState("");

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
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'company_logo') {
      // Handle file input
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        company_logo: file
      }));
      
      // Create a preview URL for the selected logo
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
      } else {
        setLogoPreview(null);
      }
    } else {
      // Handle text inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle technology input
  const handleTechInputChange = (e) => {
    setTechInput(e.target.value);
  };

  // Add technology to the array
  const addTechnology = () => {
    if (techInput.trim() && !formData.technology_used.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technology_used: [...prev.technology_used, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  // Remove technology from the array
  const removeTechnology = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      technology_used: prev.technology_used.filter(tech => tech !== techToRemove)
    }));
  };

  // Handle Enter key in technology input
  const handleTechInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      company_name: "",
      technology_used: [],
      company_logo: null
    });
    setTechInput("");
    setLogoPreview(null);
    setMessage("");
    setShowAlert(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false); // Hide any previous alerts
    
    // Create a FormData object to send the file
    const dataToSend = new FormData();
    dataToSend.append('company_name', formData.company_name);
    
    // Convert technology array to JSON string
    dataToSend.append('technology_used', JSON.stringify(formData.technology_used));
    
    if (formData.company_logo) {
      dataToSend.append('company_logo', formData.company_logo, formData.company_logo.name);
    }
    
    try {
      // Using the provided API endpoint
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourproject-items/', {
        method: 'POST',
        credentials: 'include', // Include credentials as requested
        body: dataToSend,
      });
      
      // Handle bad API responses (e.g., 400, 404, 500 status codes)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to add project');
      }
      
      // --- SUCCESS PATH ---
      setMessage("Project added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm(); // Clear the form on success
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // --- FAILURE PATH ---
      console.error('Error adding project:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Provide a more specific message for network errors
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
            <h2 className="mb-4">Add New Project</h2>
            
            {/* This alert will show for both success and error */}
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Row>
              <Col lg={6} md={8} sm={12}>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter company name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Technologies Used</Form.Label>
                    <div className="d-flex mb-2">
                      <Form.Control
                        type="text"
                        placeholder="Enter technology (e.g., Django)"
                        value={techInput}
                        onChange={handleTechInputChange}
                        onKeyPress={handleTechInputKeyPress}
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={addTechnology}
                        className="ms-2"
                        type="button"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="mt-2">
                      {formData.technology_used.map((tech, index) => (
                        <Badge 
                          key={index} 
                          bg="info" 
                          className="me-2 mb-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeTechnology(tech)}
                        >
                          {tech} &times;
                        </Badge>
                      ))}
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Company Logo</Form.Label>
                    <Form.Control
                      type="file"
                      name="company_logo"
                      onChange={handleChange}
                      accept="image/*" // Accept only image files
                    />
                    {logoPreview && (
                      <div className="mt-3">
                        <img src={logoPreview} alt="Company Logo Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      </div>
                    )}
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                    className="me-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="visually-hidden">Submitting...</span>
                      </>
                    ) : (
                      'Add Project'
                    )}
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={clearForm}
                    type="button"
                  >
                    Clear
                  </Button>
                </Form>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AddProject;