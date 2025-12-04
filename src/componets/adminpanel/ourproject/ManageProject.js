import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Badge } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineUser } from 'react-icons/ai'; // Default icon for projects

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageProject = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditProject, setCurrentEditProject] = useState(null);
  const [editFormData, setEditFormData] = useState({
    company_name: "",
    technology_used: [],
    company_logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [hasLogoChanged, setHasLogoChanged] = useState(false);
  
  // State for technology input field in the edit form
  const [techInput, setTechInput] = useState("");

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

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const result = await response.json();
        const projectsData = result.data || result;

        // Process the data to construct full image URLs and format dates
        const processedProjects = projectsData.map(project => {
          const processedProject = { ...project };
          
          // Format the logo URL
          if (project.company_logo) {
            processedProject.company_logo = `${API_BASE_URL}${project.company_logo}?t=${Date.now()}`;
          }
          
          // Format the created_at date
          if (project.created_at) {
            const createdDate = new Date(project.created_at);
            processedProject.formatted_created_at = createdDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          return processedProject;
        });

        setProjects(processedProjects);
        console.log("Processed projects:", processedProjects); // Debug log
      } catch (err) {
        setError(err.message);
        console.error("Error fetching projects:", err); // Debug log
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete project');
        }
        
        setProjects(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Project deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting project:', error);
        setMessage(error.message || "Failed to delete project");
        setVariant("danger");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (project) => {
    setCurrentEditProject(project);
    setEditFormData({
      company_name: project.company_name,
      technology_used: project.technology_used || [],
      company_logo: null
    });
    const originalLogoUrl = project.company_logo ? project.company_logo.split('?t=')[0] : null;
    setLogoPreview(originalLogoUrl);
    setHasLogoChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'company_logo') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
        setHasLogoChanged(true);
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

  // Handle technology input in the edit form
  const handleTechInputChange = (e) => {
    setTechInput(e.target.value);
  };

  // Add technology to the array in the edit form
  const addTechnology = () => {
    if (techInput.trim() && !editFormData.technology_used.includes(techInput.trim())) {
      setEditFormData(prev => ({
        ...prev,
        technology_used: [...prev.technology_used, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  // Remove technology from the array in the edit form
  const removeTechnology = (techToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      technology_used: prev.technology_used.filter(tech => tech !== techToRemove)
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    let tempLogoUrl = null;
    if (hasLogoChanged && editFormData.company_logo) {
      tempLogoUrl = URL.createObjectURL(editFormData.company_logo);
    }
    
    const originalProjectData = projects.find(p => p.id === currentEditProject.id);
    
    // Update UI immediately
    setProjects(prevData => 
      prevData.map(item => 
        item.id === currentEditProject.id 
          ? {
              ...item,
              company_name: editFormData.company_name,
              technology_used: editFormData.technology_used,
              company_logo: hasLogoChanged ? tempLogoUrl : item.company_logo
            } 
          : item
      )
    );
    
    setShowEditModal(false);
    
    const dataToSend = new FormData();
    dataToSend.append('id', currentEditProject.id); 
    dataToSend.append('company_name', editFormData.company_name);
    dataToSend.append('technology_used', JSON.stringify(editFormData.technology_used));
    
    if (hasLogoChanged && editFormData.company_logo) {
      dataToSend.append('company_logo', editFormData.company_logo);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        setProjects(prevData => 
          prevData.map(item => 
            item.id === currentEditProject.id ? originalProjectData : item
          )
        );
        throw new Error('Failed to update project');
      }
      
      const apiResponseData = await response.json();
      
      if (tempLogoUrl) {
        URL.revokeObjectURL(tempLogoUrl);
      }
      
      setProjects(prevData => 
        prevData.map(item => 
          item.id === currentEditProject.id 
            ? {
                ...item,
                company_name: editFormData.company_name,
                technology_used: editFormData.technology_used,
                company_logo: hasLogoChanged && apiResponseData.data && apiResponseData.data.company_logo
                    ? `${API_BASE_URL}${apiResponseData.data.company_logo}?t=${Date.now()}`
                    : item.company_logo
              } 
            : item
        )
      );
      
      setMessage("Project updated successfully!");
      setVariant("success");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating project:', error);
      setMessage(error.message || "Failed to update project");
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
            <h2 className="mb-4">Manage Projects</h2>
            
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
                {projects.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>No projects found.</p>
                  </Col>
                ) : (
                  projects.map((project) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={project.id}>
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            {project.company_logo ? (
                              <img 
                                src={project.company_logo} 
                                alt={project.company_name} 
                                style={{ width: '60px', height: '60px', marginRight: '15px', objectFit: 'cover', borderRadius: '50%' }} 
                              />
                            ) : (
                              <AiOutlineUser size={60} style={{ marginRight: '15px' }} />
                            )}
                            <div>
                              <Card.Title className="managetitle">{project.company_name}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">
                                Technologies: {project.technology_used.join(', ')}
                              </Card.Subtitle>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span></span>
                            <div>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleEdit(project)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleDelete(project.id)}
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
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="company_name"
                value={editFormData.company_name}
                onChange={handleEditChange}
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
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
                {editFormData.technology_used.map((tech, index) => (
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
                onChange={handleEditChange}
                accept="image/*"
              />
              {logoPreview && (
                <div className="mt-3">
                  <img 
                    src={logoPreview} 
                    alt="Company Logo Preview" 
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

export default ManageProject;