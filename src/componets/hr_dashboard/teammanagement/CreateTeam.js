import React, { useEffect, useState, useRef, useContext } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../assets/css/Profile.css";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import { AuthContext } from "../../context/AuthContext"; // Adjust the import path as needed

const CreateTeam = () => {
  const { user } = useContext(AuthContext); // Get user from auth context
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // API data states
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonPreview, setJsonPreview] = useState("");
  
  // Search/filter states
  const [searchTerm, setSearchTerm] = useState("");
  
  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Function to check if an employee is a team leader
  const isTeamLeader = (employee) => {
    // Check if role field exists and matches team leader
    if (employee.role === 'Team Leader' || employee.role === 'team_leader') {
      return true;
    }
    
    // Check if designation field contains "Team Leader"
    if (employee.designation && employee.designation.includes('Team Leader')) {
      return true;
    }
    
    // Check if any field contains "Team Leader" string
    for (const key in employee) {
      if (typeof employee[key] === 'string' && employee[key].includes('Team Leader')) {
        return true;
      }
    }
    
    return false;
  };
  
  // Function to clear all form fields
  const clearForm = () => {
    setTeamName("");
    setSelectedTeamLeader("");
    setSelectedProject("");
    setSelectedEmployees([]);
    setSearchTerm("");
    setError(null);
  };
  
  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all employees
        const employeesResponse = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!employeesResponse.ok) {
          throw new Error(`HTTP error! Status: ${employeesResponse.status}`);
        }
        
        const employeesData = await employeesResponse.json();
        let employees = [];
        
        if (Array.isArray(employeesData)) {
          employees = employeesData;
        } else if (employeesData && Array.isArray(employeesData.results)) {
          employees = employeesData.results;
        }
        
        // Filter team leaders using the isTeamLeader function
        const leaders = employees.filter(emp => isTeamLeader(emp));
        console.log("Team Leaders found:", leaders); // Debug log to see the team leaders
        setTeamLeaders(leaders);
        setAllEmployees(employees);
        setFilteredEmployees(employees); // Initialize filtered employees
        
        // Fetch projects
        const projectsResponse = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/project-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! Status: ${projectsResponse.status}`);
        }
        
        const projectsData = await projectsResponse.json();
        
        // Handle the specific project data structure
        if (projectsData.success && Array.isArray(projectsData.data)) {
          setProjects(projectsData.data);
        } else {
          console.error("Unexpected project data format:", projectsData);
          setProjects([]);
        }
        
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Filter employees based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmployees(allEmployees);
      return;
    }
    
    const filtered = allEmployees.filter(emp => {
      const searchLower = searchTerm.toLowerCase();
      return (
        emp.first_name?.toLowerCase().includes(searchLower) ||
        emp.last_name?.toLowerCase().includes(searchLower) ||
        emp.emp_id?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredEmployees(filtered);
  }, [searchTerm, allEmployees]);
  
  // Handle employee selection
  const handleEmployeeSelection = (empId) => {
    if (selectedEmployees.includes(empId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== empId));
    } else {
      setSelectedEmployees([...selectedEmployees, empId]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTeamLeader || !selectedProject || selectedEmployees.length === 0 || !teamName) {
      setError("Please fill all fields and select at least one employee");
      return;
    }
    
    // Get manager ID from auth context
    const managerId = user?.uniqueId || user?.id || user?.emp_id;
    
    // Create team data object
    const teamData = {
      team_name: teamName,
      team_leader_id: selectedTeamLeader,
      project_id: selectedProject,
      employee_ids: selectedEmployees,
      manager_id: managerId
    };
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock/backendbr/api/teams/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Clear form immediately after successful creation
        clearForm();
        // Show success modal
        setShowSuccessModal(true);
      } else {
        setError(result.message || "Failed to create team");
      }
      
    } catch (err) {
      setError(err.message);
      console.error("Failed to create team:", err);
    }
  };
  
  // Preview JSON before submission
  const handlePreviewJson = (e) => {
    e.preventDefault();
    
    if (!selectedTeamLeader || !selectedProject || selectedEmployees.length === 0 || !teamName) {
      setError("Please fill all fields and select at least one employee");
      return;
    }
    
    // Get manager ID from auth context
    const managerId = user?.uniqueId || user?.id || user?.emp_id;
    
    // Create team data object
    const teamData = {
      team_name: teamName,
      team_leader_id: selectedTeamLeader,
      project_id: selectedProject,
      employee_ids: selectedEmployees,
      manager_id: managerId
    };
    
    // Set JSON preview
    setJsonPreview(JSON.stringify(teamData, null, 2));
    setShowJsonModal(true);
  };
  
  // Handle closing success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Ensure form is cleared when modal is closed
    clearForm();
  };
  
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />
        
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <h2>Team Management</h2>
            
            {loading && (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" />
              </div>
            )}
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!loading && (
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="teamName">
                      <Form.Label>Team Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="teamLeader">
                      <Form.Label>Select Team Leader</Form.Label>
                      <Form.Select
                        value={selectedTeamLeader}
                        onChange={(e) => setSelectedTeamLeader(e.target.value)}
                        required
                      >
                        <option value="">Select Team Leader</option>
                        {teamLeaders.map(leader => (
                          <option key={leader.emp_id} value={leader.emp_id}>
                            {leader.first_name} {leader.last_name} ({leader.emp_id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="project">
                      <Form.Label>Select Project</Form.Label>
                      <Form.Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.project_id}>
                            {project.project_name} ({project.project_id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Label>Select Team Members</Form.Label>
                    
                    {/* Search bar for filtering employees */}
                    <InputGroup className="mb-3">
                      <Form.Control
                        placeholder="Search by name or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                        Clear
                      </Button>
                    </InputGroup>
                    
                    <div className="employee-selection-container">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => (
                          <Card key={emp.emp_id} className="employee-card mb-2">
                            <Card.Body className="d-flex justify-content-between align-items-center p-2">
                              <div>
                                <strong>{emp.first_name} {emp.last_name}</strong>
                                <div className="text-muted small">{emp.emp_id} - {emp.designation}</div>
                                {isTeamLeader(emp) && (
                                  <Badge bg="primary" className="ms-2">Team Leader</Badge>
                                )}
                              </div>
                              <Form.Check
                                type="checkbox"
                                checked={selectedEmployees.includes(emp.emp_id)}
                                onChange={() => handleEmployeeSelection(emp.emp_id)}
                                disabled={emp.emp_id === selectedTeamLeader}
                              />
                            </Card.Body>
                          </Card>
                        ))
                      ) : (
                        <Alert variant="info">No employees found matching your search criteria.</Alert>
                      )}
                    </div>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" onClick={clearForm}>
                    Clear Form
                  </Button>
                  <div>
                    <Button variant="outline-secondary" className="me-2" onClick={handlePreviewJson}>
                      Preview JSON
                    </Button>
                    <Button variant="primary" type="submit">
                      Create Team
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </div>
        </Container>
      </div>
      
      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
        <Modal.Header closeButton>
          <Modal.Title>Team Created Successfully</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>The team has been created and assigned to the selected project.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSuccessModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* JSON Preview Modal */}
      <Modal show={showJsonModal} onHide={() => setShowJsonModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>JSON Data Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="bg-light p-3 rounded">
            {jsonPreview}
          </pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJsonModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateTeam;