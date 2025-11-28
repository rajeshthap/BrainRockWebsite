import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../assets/css/Profile.css";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";

const TeamManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // API data states
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
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
        
        // Filter team leaders (assuming role field exists)
        const leaders = employees.filter(emp => emp.role === 'Team Leader' || emp.role === 'team_leader');
        setTeamLeaders(leaders);
        setAllEmployees(employees);
        
        // Fetch projects
        const projectsResponse = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/projects/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! Status: ${projectsResponse.status}`);
        }
        
        const projectsData = await projectsResponse.json();
        let projectList = [];
        
        if (Array.isArray(projectsData)) {
          projectList = projectsData;
        } else if (projectsData && Array.isArray(projectsData.results)) {
          projectList = projectsData.results;
        }
        
        setProjects(projectList);
        
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
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
    
    try {
      const teamData = {
        team_name: teamName,
        team_leader_id: selectedTeamLeader,
        project_id: selectedProject,
        employee_ids: selectedEmployees
      };
      
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/teams/', {
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
        // Reset form
        setTeamName("");
        setSelectedTeamLeader("");
        setSelectedProject("");
        setSelectedEmployees([]);
        setShowSuccessModal(true);
      } else {
        setError(result.message || "Failed to create team");
      }
      
    } catch (err) {
      setError(err.message);
      console.error("Failed to create team:", err);
    }
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
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Label>Select Team Members</Form.Label>
                    <div className="employee-selection-container">
                      {allEmployees.map(emp => (
                        <Card key={emp.emp_id} className="employee-card mb-2">
                          <Card.Body className="d-flex justify-content-between align-items-center p-2">
                            <div>
                              <strong>{emp.first_name} {emp.last_name}</strong>
                              <div className="text-muted small">{emp.emp_id} - {emp.designation}</div>
                            </div>
                            <Form.Check
                              type="checkbox"
                              checked={selectedEmployees.includes(emp.emp_id)}
                              onChange={() => handleEmployeeSelection(emp.emp_id)}
                              disabled={emp.emp_id === selectedTeamLeader}
                            />
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    Create Team
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </Container>
      </div>
      
      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Team Created Successfully</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>The team has been created and assigned to the selected project.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeamManagement;