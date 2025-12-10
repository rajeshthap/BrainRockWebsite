import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { FaProjectDiagram, FaUsers, FaArrowLeft, FaBuilding, FaUserTie, FaCalendarAlt, FaUser } from "react-icons/fa";
import "../../../assets/css/Teammember.css";

const TeamMember = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorProjects, setErrorProjects] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errorTeams, setErrorTeams] = useState(null);
  const [employeeNames, setEmployeeNames] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Fetch employee names
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-names-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Create a mapping of emp_id to full_name
        const namesMap = {};
        data.forEach(emp => {
          namesMap[emp.emp_id] = emp.full_name;
        });
        
        setEmployeeNames(namesMap);
      } catch (error) {
        console.error("Failed to fetch employee names:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployeeNames();
  }, []);

  // Fetch projects where HR is reporting manager
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourproject-items/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
        } else {
          setErrorProjects(data.message || 'Failed to fetch projects');
        }
      } catch (error) {
        setErrorProjects(error.message);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch teams for a specific project
  const fetchTeamsForProject = async (projectId) => {
    setLoadingTeams(true);
    setErrorTeams(null);
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Filter teams by the selected project
        const filteredTeams = data.data.filter(team => team.project === projectId);
        setTeams(filteredTeams);
      } else {
        setErrorTeams(data.message || 'Failed to fetch teams');
      }
    } catch (error) {
      setErrorTeams(error.message);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    fetchTeamsForProject(project.project_id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setTeams([]);
  };

  // Helper function to get employee name by ID
  const getEmployeeName = (empId) => {
    return employeeNames[empId] || empId;
  };

  if (loadingProjects || loadingEmployees) {
    return (
      <Card className="team-card">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-0">Loading projects and employee data...</p>
        </Card.Body>
      </Card>
    );
  }

  if (errorProjects) {
    return (
      <Card className="team-card">
        <Card.Body>
          <Alert variant="danger">
            Error loading projects: {errorProjects}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (selectedProject) {
    return (
      <Card className="team-card-member">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center">
            <FaProjectDiagram className="me-2" />
            {selectedProject.title}
          </h5>
          <Button variant="outline-primary" size="sm" onClick={handleBackToProjects}>
            <FaArrowLeft className="me-1" /> Back to Projects
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="project-details mb-4">
            <div className="d-flex align-items-center mb-2">
              <FaBuilding className="me-2 text-primary" />
              <span><strong>Company:</strong> {selectedProject.company_name}</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <FaCalendarAlt className="me-2 text-primary" />
              <span><strong>Budget:</strong> ₹{parseFloat(selectedProject.project_budget).toLocaleString()}</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <span className={`badge ${selectedProject.status === 'ongoing' ? 'bg-success' : 'bg-secondary'}`}>
                {selectedProject.status}
              </span>
            </div>
          </div>

          <h6 className="d-flex align-items-center mb-3">
            <FaUsers className="me-2" />
            Team Members
          </h6>

          {loadingTeams ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 mb-0">Loading team members...</p>
            </div>
          ) : errorTeams ? (
            <Alert variant="danger">
              Error loading team members: {errorTeams}
            </Alert>
          ) : teams.length === 0 ? (
            <Alert variant="info">
              No team members found for this project.
            </Alert>
          ) : (
            <div className="teams-list">
              {teams.map(team => (
                <div key={team.team_id} className="team-item mb-4 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-0">{team.team_name}</h6>
                    <Badge bg="primary">Team ID: {team.team_id}</Badge>
                  </div>
                  
                  <div className="mb-3 d-flex align-items-center">
                    <FaUserTie className="me-2 text-primary" />
                    <div>
                      <strong>Team Leader:</strong> {getEmployeeName(team.team_leader)}
                    </div>
                  </div>
                  
                  <div className="mb-3 d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-primary" />
                    <div>
                      <strong>Duration:</strong> {team.start_date} to {team.end_date}
                    </div>
                  </div>
                  
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUsers className="me-2 text-primary" />
                      <strong>Team Members ({team.employee_ids.length}):</strong>
                    </div>
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {team.employee_ids.map(empId => (
                        <Badge key={empId} bg="light" text="dark" className="d-flex align-items-center">
                          <FaUser className="me-1" size={12} />
                          {getEmployeeName(empId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="team-card-member">
      <Card.Header>
        <h5 className="mb-0 d-flex align-items-center">
          <FaProjectDiagram className="me-2" />
          Your Projects
        </h5>
      </Card.Header>
      <Card.Body>
        {projects.length === 0 ? (
          <Alert variant="info">
            No projects found where you are assigned as reporting manager.
          </Alert>
        ) : (
          <div className="projects-list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="project-item p-3 border rounded mb-3"
                onClick={() => handleProjectClick(project)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-start">
                  <div className="project-logo me-3">
                    {project.company_logo ? (
                      <img 
                        src={`https://mahadevaaya.com/brainrock.in/brainrock/backendbr${project.company_logo}`} 
                        alt={project.company_name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center" 
                           style={{ width: '50px', height: '50px', borderRadius: '4px' }}>
                        <FaBuilding className="text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1">{project.title}</h6>
                      <Badge bg={project.status === 'ongoing' ? 'success' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="mb-1 text-muted">{project.company_name}</p>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {project.technology_used.map(tech => (
                        <Badge key={tech} bg="light" text="dark">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-end">
                  <small className="text-muted">Click to view team</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TeamMember;