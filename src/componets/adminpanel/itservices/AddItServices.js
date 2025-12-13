import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const AddItServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state adapted for IT services
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: null,
    modules: [ // Initialize with one empty module
      ["", ""]
    ]
  });
  
  // State for icon preview
  const [iconPreview, setIconPreview] = useState(null);

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
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'icon') {
      // Handle file input for icon
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        icon: file
      }));
      
      // Create a preview URL for selected icon
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
      } else {
        setIconPreview(null);
      }
    } else if (name.startsWith('module')) {
      // Handle module inputs
      const moduleIndex = parseInt(name.split('-')[1]);
      const moduleField = name.split('-')[2]; // 'title' or 'description'
      
      setFormData(prev => {
        const newModules = [...prev.modules];
        if (!newModules[moduleIndex]) {
          // Initialize module if it doesn't exist
          newModules[moduleIndex] = ["", ""];
        }
        
        // Update the specific field in the module
        if (moduleField === 'title') {
          newModules[moduleIndex][0] = value;
        } else if (moduleField === 'description') {
          newModules[moduleIndex][1] = value;
        }
        
        return {
          ...prev,
          modules: newModules
        };
      });
    } else {
      // Handle text inputs (title and description)
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add a new module
  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, ["", ""]]
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: null,
      modules: [["", ""]] // Reset to one empty module
    });
    setIconPreview(null);
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
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    
    // Add icon if it exists
    if (formData.icon) {
      dataToSend.append('icon', formData.icon, formData.icon.name);
    }
    
    // Add modules as JSON string
    dataToSend.append('modules', JSON.stringify(formData.modules));
    
    try {
      // Using the provided API endpoint for IT services
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/itservice-items/', {
        method: 'POST',
        credentials: 'include', // Include credentials as requested
        body: dataToSend,
      });
      
      // Handle bad API responses (e.g., 400, 404, 500 status codes)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to add IT service');
      }
      
      // SUCCESS PATH
      alert('IT service added successfully!');
      setMessage("IT service added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm(); // Clear the form on success
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // FAILURE PATH
      console.error('Error adding IT service:', error);
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
            <h2 className="mb-4">Add New IT Service</h2>
            
            {/* This alert will show for both success and error */}
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Service Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter IT service title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Service Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter service description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Service Icon</Form.Label>
                <Form.Control
                  type="file"
                  name="icon"
                  onChange={handleChange}
                  accept="image/*" // Accept only image files
                />
                 {iconPreview && (
                  <div className="mt-3">
                    <img src={iconPreview} alt="Icon Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                )}
              </Form.Group>
              
              {/* Modules Section */}
              <Form.Group className="mb-3">
                <Form.Label>Service Modules</Form.Label>
                <div className="modules-container">
                  {formData.modules.map((module, index) => (
                    <div key={index} className="module-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5>Module {index + 1}</h5>
                        {formData.modules.length > 1 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => removeModule(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <Form.Group className="mb-2">
                        <Form.Label>Module Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={`Enter module ${index + 1} title`}
                          name={`module-${index}-title`}
                          value={module[0]}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group>
                        <Form.Label>Module Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder={`Enter module ${index + 1} description`}
                          name={`module-${index}-description`}
                          value={module[1]}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline-primary" 
                    onClick={addModule}
                    className="mt-2"
                  >
                    Add Another Module
                  </Button>
                </div>
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                className="me-2"
              >
                {isSubmitting ? 'Submitting...' : 'Add IT Service'}
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

export default AddItServices;