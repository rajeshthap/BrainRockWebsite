import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Badge, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineUser } from 'react-icons/ai'; // Default icon for projects

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageProject = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [projects, setProjects] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firmsLoading, setFirmsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditProject, setCurrentEditProject] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    company_name: "",
    technology_used: [],
    company_logo: null,
    firm_id: "",
    firm_name: "",
    project_budget: ""
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [hasLogoChanged, setHasLogoChanged] = useState(false);
  
  // State for technology input field in edit form
  const [techInput, setTechInput] = useState("");

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

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
        setError(error.message || "Failed to fetch firms");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setFirmsLoading(false);
      }
    };

    fetchFirms();
  }, []);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const result = await response.json();
        const projectsData = result.data || result;

        // Process data to construct full image URLs and format dates
        const processedProjects = projectsData.map(project => {
          const processedProject = { ...project };
          
          // Format logo URL
          if (project.company_logo) {
            processedProject.company_logo = `${API_BASE_URL}${project.company_logo}?t=${Date.now()}`;
          }
          
          // Format created_at date
          if (project.created_at) {
            const createdDate = new Date(project.created_at);
            processedProject.formatted_created_at = createdDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          // Format budget
          if (project.project_budget) {
            processedProject.formatted_budget = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0
            }).format(project.project_budget);
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

  // Filter projects based on search term
  const filteredProjects = searchTerm.trim() === '' 
    ? projects 
    : projects.filter((project) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          project.title?.toLowerCase().includes(lowerSearch) ||
          project.company_name?.toLowerCase().includes(lowerSearch) ||
          project.firm_name?.toLowerCase().includes(lowerSearch) ||
          project.technology_used?.some(tech => tech.toLowerCase().includes(lowerSearch))
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

 // Handle delete
const handleDelete = async (id, project_id) => {
  if (window.confirm("Are you sure you want to delete this project?")) {
    try {
      const dataToSend = new FormData();
      // ONLY send project_id in payload as requested
      dataToSend.append('project_id', project_id);

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
      title: project.title || "",
      description: project.description || "",
      company_name: project.company_name || "",
      technology_used: project.technology_used || [],
      company_logo: null,
      firm_id: project.firm_id || "",
      firm_name: project.firm_name || "",
      project_budget: project.project_budget || ""
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
  } else if (name === 'firm_id') {
    // When firm_id changes, also update firm_name
    const selectedFirm = firms.find(firm => firm.firm_id === value);
    setEditFormData(prev => ({
      ...prev,
      firm_id: value,
      firm_name: selectedFirm ? selectedFirm.firm_name : ""
    }));
  } else {
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  // Handle technology input in edit form
  const handleTechInputChange = (e) => {
    setTechInput(e.target.value);
  };

  // Add technology to array in edit form
  const addTechnology = () => {
    if (techInput.trim() && !editFormData.technology_used.includes(techInput.trim())) {
      setEditFormData(prev => ({
        ...prev,
        technology_used: [...prev.technology_used, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  // Remove technology from the array in edit form
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
            title: editFormData.title,
            description: editFormData.description,
            company_name: editFormData.company_name,
            technology_used: editFormData.technology_used,
            company_logo: hasLogoChanged ? tempLogoUrl : item.company_logo,
            firm_id: editFormData.firm_id,
            firm_name: editFormData.firm_name,
            project_budget: editFormData.project_budget
          } 
        : item
    )
  );
  
  setShowEditModal(false);
  
  const dataToSend = new FormData();
  // MANDATORY: Send project_id in payload
  dataToSend.append('project_id', currentEditProject.project_id); 
  dataToSend.append('title', editFormData.title);
  dataToSend.append('description', editFormData.description);
  dataToSend.append('company_name', editFormData.company_name);
  dataToSend.append('technology_used', JSON.stringify(editFormData.technology_used));
  dataToSend.append('firm_id', editFormData.firm_id);
  dataToSend.append('firm_name', editFormData.firm_name);
  dataToSend.append('project_budget', editFormData.project_budget);
  
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
      // Revert to original data if update fails
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
              title: editFormData.title,
              description: editFormData.description,
              company_name: editFormData.company_name,
              technology_used: editFormData.technology_used,
              company_logo: hasLogoChanged && apiResponseData.data && apiResponseData.data.company_logo
                  ? `${API_BASE_URL}${apiResponseData.data.company_logo}?t=${Date.now()}`
                  : item.company_logo,
              firm_id: editFormData.firm_id,
              firm_name: editFormData.firm_name,
              project_budget: editFormData.project_budget
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Manage Projects</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by project, company, firm, or technology..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            
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
              <>
              <Row>
                {currentItems.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>{searchTerm ? 'No projects match your search.' : 'No projects found.'}</p>
                  </Col>
                ) : (
                  currentItems.map((project) => (
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
                              <Card.Title className="managetitle">{project.title}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">
                                Company: {project.company_name}
                              </Card.Subtitle>
                            </div>
                          </div>
                          <Card.Text className="mb-2">{project.description}</Card.Text>
                          <div className="mb-2">
                            <small className="text-muted">Firm: {project.firm_name}</small>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Budget: {project.formatted_budget || `$${project.project_budget}`}</small>
                          </div>
                          <div className="mb-3">
                            {project.technology_used && project.technology_used.map((tech, index) => (
                              <Badge 
                                key={index} 
                                bg="info" 
                                className="me-1 mb-1"
                              >
                                {tech}
                              </Badge>
                            ))}
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
                                onClick={() => handleDelete(project.id, project.project_id)}
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages).keys()].map(page => (
                      <Pagination.Item 
                        key={page + 1} 
                        active={page + 1 === currentPage}
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
              </>
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
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col lg={6} md={6} sm={12}>
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
              </Col>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Firm</Form.Label>
                  <Form.Select
                    name="firm_id"
                    value={editFormData.firm_id}
                    onChange={handleEditChange}
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
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Project Budget</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="project_budget"
                value={editFormData.project_budget}
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