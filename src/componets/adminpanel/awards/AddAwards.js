import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const AddAwards = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state adapted for Awards
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    modules: [[""]] // Initialize with one empty module [title only]
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
      // Handle file input for image
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create a preview URL for selected image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else if (name.startsWith('moduletitle')) {
      // Handle module title - updates first element of module array
      const moduleIndex = parseInt(name.split('-')[1]);
      setFormData(prev => {
        const newModules = [...prev.modules];
        newModules[moduleIndex][0] = value;
        return { ...prev, modules: newModules };
      });
    } else if (name.startsWith('moduledesc')) {
      // Handle module description - updates subsequent array elements
      const [_, moduleIndex, descIndex] = name.split('-');
      const mIndex = parseInt(moduleIndex);
      const dIndex = parseInt(descIndex);
      setFormData(prev => {
        const newModules = [...prev.modules];
        newModules[mIndex][dIndex + 1] = value; // dIndex + 1 because index 0 is title
        return { ...prev, modules: newModules };
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
      modules: [...prev.modules, [""]]
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  // Add a description to a module
  const addDescriptionToModule = (moduleIndex) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].push("");
      return { ...prev, modules: newModules };
    });
  };

  // Remove a description from a module
  const removeDescriptionFromModule = (moduleIndex, descIndex) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].splice(descIndex + 1, 1); // descIndex + 1 because index 0 is title
      return { ...prev, modules: newModules };
    });
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      modules: [[""]]
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
    
    // Create a FormData object to send the file
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    
    // Add image if it exists
    if (formData.image) {
      dataToSend.append('image', formData.image, formData.image.name);
    }
    
    // Add modules as JSON string (array where first element is title, rest are descriptions)
    dataToSend.append('modules', JSON.stringify(formData.modules));
    
    try {
      // Using the provided API endpoint for awards
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/award-items/', {
        method: 'POST',
        credentials: 'include', // Include credentials for authentication
        body: dataToSend,
      });
      
      // Handle bad API responses (e.g., 400, 404, 500 status codes)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to add award');
      }
      
      // SUCCESS PATH
      alert('Award added successfully!');
      setMessage("Award added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm(); // Clear the form on success
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // FAILURE PATH
      console.error('Error adding award:', error);
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
            <h2 className="mb-4">Add New Award</h2>
            
            {/* This alert will show for both success and error */}
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Award Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter award title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Award Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter award description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Award Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*" // Accept only image files
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Image Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                )}
              </Form.Group>
              
              {/* Modules Section */}
              <Form.Group className="mb-3">
                <Form.Label>Award Modules/Details</Form.Label>
                <div className="modules-container">
                  {formData.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="mb-3 p-3 border rounded" style={{ backgroundColor: '#f9f9f9' }}>
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div style={{ flex: 1 }}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small"><strong>Module {moduleIndex + 1} Title</strong></Form.Label>
                            <Form.Control
                              type="text"
                              placeholder={`Enter module ${moduleIndex + 1} title`}
                              name={`moduletitle-${moduleIndex}`}
                              value={module[0] || ""}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>

                          {/* Descriptions for this module */}
                          {module.map((description, descIndex) => (
                            descIndex > 0 && (
                              <div key={descIndex} className="mb-2 p-2 bg-white border rounded">
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                  <div style={{ flex: 1 }}>
                                    <Form.Label className="small"><strong>Description {descIndex}</strong></Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      placeholder={`Enter description ${descIndex}`}
                                      name={`moduledesc-${moduleIndex}-${descIndex - 1}`}
                                      value={description}
                                      onChange={handleChange}
                                    />
                                  </div>
                                  {module.length > 1 && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => removeDescriptionFromModule(moduleIndex, descIndex - 1)}
                                      className="align-self-start"
                                    >
                                      Remove
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          ))}

                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => addDescriptionToModule(moduleIndex)}
                            className="mt-2"
                          >
                            Add Description
                          </Button>
                        </div>
                        {formData.modules.length > 1 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => removeModule(moduleIndex)}
                            className="align-self-start"
                          >
                            Remove Module
                          </Button>
                        )}
                      </div>
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
                {isSubmitting ? 'Submitting...' : 'Add Award'}
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

export default AddAwards;
