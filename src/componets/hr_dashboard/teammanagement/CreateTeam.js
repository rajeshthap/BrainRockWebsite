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
  const [teams, setTeams] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredTeamLeaders, setFilteredTeamLeaders] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
        setError(null);
        
        // Fetch all data
        const [teamsResponse, employeesResponse, projectsResponse] = await Promise.all([
          fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/project-list/', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ]);
        
        // Check if all responses are OK
        if (!teamsResponse.ok || !employeesResponse.ok || !projectsResponse.ok) {
          throw new Error("One or more API requests failed");
        }
        
        const teamsData = await teamsResponse.json();
        const employeesData = await employeesResponse.json();
        const projectsData = await projectsResponse.json();
        
        // Process and set teams data
        let teamsList = [];
        if (teamsData.success && Array.isArray(teamsData.data)) {
          teamsList = teamsData.data;
        } else if (Array.isArray(teamsData)) {
          teamsList = teamsData;
        }
        setTeams(teamsList);
        
        // Process and set employees data
        let employeesList = [];
        if (Array.isArray(employeesData)) {
          employeesList = employeesData;
        } else if (employeesData && Array.isArray(employeesData.results)) {
          employeesList = employeesData.results;
        }
        setAllEmployees(employeesList);
        
        // Filter team leaders using isTeamLeader function
        const leaders = employeesList.filter(emp => isTeamLeader(emp));
        setTeamLeaders(leaders);
        
        // Process and set projects data
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
  
  // Filter team leaders, projects, and employees based on existing assignments
  useEffect(() => {
    if (teams.length > 0 && teamLeaders.length > 0 && projects.length > 0 && allEmployees.length > 0) {
      // Get all team leader IDs that are already assigned
      const assignedLeaderIds = teams.map(team => team.team_leader).filter(Boolean);
      
      // Get all project IDs that are already assigned
      const assignedProjectIds = teams.map(team => team.project).filter(Boolean);
      
      // Get all employee IDs that are already assigned to teams
      const assignedEmployeeIds = [];
      teams.forEach(team => {
        // Add team leader if exists
        if (team.team_leader) {
          assignedEmployeeIds.push(team.team_leader);
        }
        
        // Add all team members if they exist
        if (team.employee_ids && Array.isArray(team.employee_ids)) {
          assignedEmployeeIds.push(...team.employee_ids);
        }
      });
      
      // Filter out team leaders who are already assigned
      const availableTeamLeaders = teamLeaders.filter(leader => !assignedLeaderIds.includes(leader.emp_id));
      setFilteredTeamLeaders(availableTeamLeaders);
      
      // Filter out projects that are already assigned
      const availableProjects = projects.filter(project => !assignedProjectIds.includes(project.project_id));
      setFilteredProjects(availableProjects);
      
      // Filter out employees who are team leaders or already assigned to teams
      const availableEmployees = allEmployees.filter(emp => {
        // Skip team leaders
        if (isTeamLeader(emp)) return false;
        
        // Skip employees already assigned to teams
        return !assignedEmployeeIds.includes(emp.emp_id);
      });
      
      setAvailableEmployees(availableEmployees);
    }
  }, [teams, teamLeaders, projects, allEmployees]);
  
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
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/', {
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
        // Clear form and show success modal
        clearForm();
        setShowSuccessModal(true);
      } else {
        setError(result.message || "Failed to create team");
      }
      
    } catch (err) {
      setError(err.message);
      console.error("Failed to create team:", err);
    }
  };
  
  // Handle closing success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
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
            <h2>Create Team</h2>
            
            {loading && (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" />
              </div>
            )}
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!loading && !error && (
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
                        {filteredTeamLeaders.map(leader => (
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
                        {filteredProjects.map(project => (
                          <option key={project.project_id} value={project.project_id}>
                            {project.project_name}
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
                      {availableEmployees.length > 0 ? (
                        availableEmployees
                          .filter(emp => {
                            // Apply search filter if there's a search term
                            if (!searchTerm) return true;
                            const searchLower = searchTerm.toLowerCase();
                            return (
                              emp.first_name?.toLowerCase().includes(searchLower) ||
                              emp.last_name?.toLowerCase().includes(searchLower) ||
                              emp.emp_id?.toLowerCase().includes(searchLower)
                            );
                          })
                          .map(emp => (
                            <Card key={emp.emp_id} className="employee-card mb-2">
                              <Card.Body className="d-flex justify-content-between align-items-center p-2">
                                <div>
                                  <strong>{emp.first_name} {emp.last_name}</strong>
                                  <div className="text-muted small">{emp.emp_id} - {emp.designation}</div>
                                </div>
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedEmployees.includes(emp.emp_id)}
                                  onChange={() => {
                                    if (selectedEmployees.includes(emp.emp_id)) {
                                      setSelectedEmployees(selectedEmployees.filter(id => id !== emp.emp_id));
                                    } else {
                                      setSelectedEmployees([...selectedEmployees, emp.emp_id]);
                                    }
                                  }}
                                />
                              </Card.Body>
                            </Card>
                          ))
                      ) : (
                        <Alert variant="info">
                          No available employees found. All employees are either team leaders or already assigned to teams.
                        </Alert>
                      )}
                    </div>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" onClick={clearForm}>
                    Clear Form
                  </Button>
                  <div>
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
    </div>
  );
};

export default CreateTeam;