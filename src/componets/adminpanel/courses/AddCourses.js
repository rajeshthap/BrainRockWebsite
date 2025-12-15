import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { FaPlus, FaTrash } from "react-icons/fa";

const AddCourses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    offer_price: "", // Added offer_price field
    duration: "",
    course_type: "basic", // Added course_type with default value
    icon: null,
    modules: [["", ""]] // Initialize with one empty module by default
  });
  
  // State for icon preview
  const [iconPreview, setIconPreview] = useState(null);

  // State for description validation error
  const [descriptionError, setDescriptionError] = useState("");

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

  // Handle form input changes with validation
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
      const moduleField = name.split('-')[2]; // 'name' or 'description'
      
      setFormData(prev => {
        const newModules = [...prev.modules];
        if (!newModules[moduleIndex]) {
          // Initialize module if it doesn't exist
          newModules[moduleIndex] = ["", ""];
        }
        
        // Update specific field in module
        if (moduleField === 'name') {
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
      // Handle text and number inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate description length
      if (name === 'description') {
        const wordCount = value.trim().split(/\s+/).length;
        if (value.trim() === '') {
          setDescriptionError("Description is required.");
        } else if (wordCount <= 10) {
          setDescriptionError(`Description must be more than 10 words. You have entered ${wordCount} words.`);
        } else {
          setDescriptionError(""); // Clear error if valid
        }
      }
    }
  };

  // Handle module changes - NEW FUNCTION
  const handleModuleChange = (index, field, value) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      if (!newModules[index]) {
        // Initialize module if it doesn't exist
        newModules[index] = ["", ""];
      }
      
      // Update specific field in the module
      if (field === 'name') {
        newModules[index][0] = value;
      } else if (field === 'description') {
        newModules[index][1] = value;
      }
      
      return {
        ...prev,
        modules: newModules
      };
    });
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
      price: "",
      offer_price: "", // Reset offer_price
      duration: "",
      course_type: "basic", // Reset to default value
      icon: null,
      modules: [["", ""]] // Reset to one empty module
    });
    setIconPreview(null);
    setMessage("");
    setShowAlert(false);
    setDescriptionError(""); // Clear description error
  };

  // Handle form submission with validation check
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors before submitting
    if (descriptionError) {
      setMessage("Please fix the validation errors before submitting.");
      setVariant("danger");
      setShowAlert(true);
      return; // Stop the submission
    }
    
    setIsSubmitting(true);
    setShowAlert(false); // Hide any previous alerts
    
    // Create a FormData object to send the file
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('price', formData.price);
    dataToSend.append('offer_price', formData.offer_price); // Added offer_price to form data
    dataToSend.append('duration', formData.duration);
    dataToSend.append('course_type', formData.course_type); // Added course_type to form data
    
    // Add icon if it exists
    if (formData.icon) {
      dataToSend.append('icon', formData.icon, formData.icon.name);
    }
    
    // Add modules as JSON string
    dataToSend.append('modules', JSON.stringify(formData.modules));
    
    try {
      // Using the provided API endpoint for courses
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-items/', {
        method: 'POST',
        credentials: 'include', // Include credentials as requested
        body: dataToSend,
      });
      
      // Handle bad API responses (e.g., 400, 404, 500 status codes)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to add course');
      }
      
      // SUCCESS PATH
      alert('Course added successfully!');
      setMessage("Course added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm(); // Clear the form on success
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // FAILURE PATH
      console.error('Error adding course:', error);
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
            <h2 className="mb-4">Add New Course</h2>
            
            {/* This alert will show for both success and error */}
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Course Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter course title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description (must be more than 10 words)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter course description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  isInvalid={!!descriptionError} // Bootstrap class for invalid state
                />
                {/* Display validation error for description */}
                <Form.Control.Feedback type="invalid">
                  {descriptionError}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Row>
                <Col lg={4} md={6} sm={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="Enter course price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col lg={4} md={6} sm={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Offer Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="Enter offer price"
                      name="offer_price"
                      value={formData.offer_price}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col lg={4} md={6} sm={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., 30 Days"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col lg={4} md={6} sm={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Type</Form.Label>
                    <Form.Select
                      name="course_type"
                      value={formData.course_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="basic">Basic</option>
                      <option value="medium">Medium</option>
                      <option value="advance">Advance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              

               <Col lg={4} md={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label>Course Icon</Form.Label>
                <Form.Control
                  type="file"
                  name="icon"
                  onChange={handleChange}
                  accept="image/*" // Accept only image files
                />
                 {iconPreview && (
                  <div className="mt-3">
                    <img src={iconPreview} alt="Icon Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  </div>
                )}
              </Form.Group>
               </Col>
               </Row>
              
              {/* Modules Section */}
              <Form.Group className="mb-3">
                <Form.Label>Course Modules</Form.Label>
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
                        <Form.Label>Module Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={`Enter module ${index + 1} name`}
                          name={`module-${index}-name`}
                          value={module[0]}
                          onChange={(e) => handleModuleChange(index, 'name', e.target.value)}
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
                          onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
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
                {isSubmitting ? 'Submitting...' : 'Add Course'}
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

export default AddCourses;