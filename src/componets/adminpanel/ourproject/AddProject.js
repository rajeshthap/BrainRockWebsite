import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const AddProject = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state - Updated to match the required fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_logo: null, // Will hold file object
    firm_id: "",
    project_link: "",
    status: "ongoing" // Default status
  });
  
  // State for firm data
  const [firms, setFirms] = useState([]);
  const [firmsLoading, setFirmsLoading] = useState(true);
  
  // State for logo preview
  const [logoPreview, setLogoPreview] = useState(null);

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

  // Fetch firms on component mount
  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/firm/`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch firms');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setFirms(result.data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error fetching firms:', error);
        setMessage(error.message || "Failed to fetch firms");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setFirmsLoading(false);
      }
    };

    fetchFirms();
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
      
      // Create a preview URL for selected logo
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

  // Clear form function - Updated to match new form state
  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      company_logo: null,
      firm_id: "",
      project_link: "",
      status: "ongoing"
    });
    setLogoPreview(null);
    setMessage("");
    setShowAlert(false);
  };

  // Handle form submission - Updated to send only the required fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false); // Hide any previous alerts
    
    // Create a FormData object to send file
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('firm_id', formData.firm_id);
    dataToSend.append('project_link', formData.project_link);
    dataToSend.append('status', formData.status);
    
    if (formData.company_logo) {
      dataToSend.append('company_logo', formData.company_logo, formData.company_logo.name);
    }
    
    try {
      // Using provided API endpoint
      const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`, {
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
      alert('Project added successfully!');
      setMessage("Project added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm(); // Clear form on success
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // --- FAILURE PATH ---
      console.error('Error adding project:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Provide a more specific message for network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Could not connect to the server. Please check API endpoint.";
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
              <Col lg={12} md={12} sm={12}>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Project Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter project title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter project description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col lg={6} md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Firm</Form.Label>
                        <Form.Select
                          name="firm_id"
                          value={formData.firm_id}
                          onChange={handleChange}
                          required
                          disabled={firmsLoading}
                        >
                          <option value="">Select a firm</option>
                          {firms.map(firm => (
                            <option key={firm.id} value={firm.firm_id}>
                              {firm.firm_name}
                            </option>
                          ))}
                        </Form.Select>
                        {firmsLoading && (
                          <Form.Text className="text-muted">
                            Loading firms...
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col lg={6} md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Project Link</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="Enter project link (e.g., https://example.com)"
                      name="project_link"
                      value={formData.project_link}
                      onChange={handleChange}
                    />
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