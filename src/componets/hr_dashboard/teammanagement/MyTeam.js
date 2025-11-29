import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Alert, Spinner, Card, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../assets/css/Profile.css";
import "../../../assets/css/myteams.css";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import { AuthContext } from "../../context/AuthContext";
import { FaUsers, FaProjectDiagram, FaCalendarAlt, FaUserTie } from "react-icons/fa";

const MyTeam = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for API data
  const [teams, setTeams] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for current user's team
  const [userTeam, setUserTeam] = useState(null);
  
  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // --- Helper Functions to get Names by ID ---
  const getEmployeeNameById = (id) => {
    if (!id) return "Not assigned";
    const employee = allEmployees.find(emp => emp.emp_id === id);
    return employee ? `${employee.first_name} ${employee.last_name}` : id;
  };

  const getProjectNameById = (id) => {
    if (!id) return "Not assigned";
    const project = projects.find(proj => proj.project_id === id);
    return project ? project.project_name : id;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use Promise.all to fetch all data concurrently
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

        // Process and set projects data
        if (projectsData.success && Array.isArray(projectsData.data)) {
          setProjects(projectsData.data);
        } else {
          console.warn("Unexpected project data format:", projectsData);
          setProjects([]);
        }

        // Find the team where current user is either a team leader or a team member
        const userTeam = teamsList.find(team => {
          // Check if user is the team leader
          if (team.team_leader === user?.unique_id) {
            return true;
          }
          
          // Check if user is in the employee_ids array
          if (team.employee_ids && team.employee_ids.includes(user?.unique_id)) {
            return true;
          }
          
          return false;
        });
        
        setUserTeam(userTeam);

      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.unique_id]);
  
  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="main-content" style={{ height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <HrHeader toggleSidebar={toggleSidebar} />
        
        <Container fluid className="dashboard-body p-4" style={{ flex: 1, overflow: 'auto' }}>
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">My Team</h2>
            </div>
            
            {loading && (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" />
                <span className="ms-2">Loading your team details...</span>
              </div>
            )}
            
            {error && <Alert variant="danger">Error: {error}</Alert>}
            
            {!loading && !error && (
              <>
                {userTeam ? (
                  <Row className="team-details-container">
                    <Col md={12}>
                      <Card className="team-details-card">
                        <Card.Header className="team-details-header">
                          <Card.Title className="mb-0">{userTeam.team_name}</Card.Title>
                          <Badge bg="primary" className="team-id-badge">ID: {userTeam.team_id}</Badge>
                        </Card.Header>
                        <Card.Body className="team-details-body">
                          <Row>
                            <Col md={6} className="mb-4">
                              <div className="team-detail-item">
                                <FaUserTie className="team-detail-icon" />
                                <div className="team-detail-content">
                                  <span className="team-detail-label">Team Leader</span>
                                  <span className="team-detail-value">{getEmployeeNameById(userTeam.team_leader)}</span>
                                </div>
                              </div>
                            </Col>
                            
                            <Col md={6} className="mb-4">
                              <div className="team-detail-item">
                                <FaProjectDiagram className="team-detail-icon" />
                                <div className="team-detail-content">
                                  <span className="team-detail-label">Project</span>
                                  <span className="team-detail-value">{getProjectNameById(userTeam.project)}</span>
                                </div>
                              </div>
                            </Col>
                            
                            <Col md={6} className="mb-4">
                              <div className="team-detail-item">
                                <FaCalendarAlt className="team-detail-icon" />
                                <div className="team-detail-content">
                                  <span className="team-detail-label">Start Date</span>
                                  <span className="team-detail-value">{formatDateForDisplay(userTeam.start_date)}</span>
                                </div>
                              </div>
                            </Col>
                            
                            <Col md={6} className="mb-4">
                              <div className="team-detail-item">
                                <FaCalendarAlt className="team-detail-icon" />
                                <div className="team-detail-content">
                                  <span className="team-detail-label">End Date</span>
                                  <span className="team-detail-value">{formatDateForDisplay(userTeam.end_date)}</span>
                                </div>
                              </div>
                            </Col>
                            
                            <Col md={12} className="mb-4">
                              <div className="team-detail-item">
                                <FaUsers className="team-detail-icon" />
                                <div className="team-detail-content">
                                  <span className="team-detail-label">Team Members</span>
                                  <div className="team-members-list">
                                    {userTeam.employee_ids && userTeam.employee_ids.length > 0 ? (
                                      userTeam.employee_ids.map(id => (
                                        <Badge bg="light" text="dark" className="team-member-badge me-2 mb-2" key={id}>
                                          {getEmployeeNameById(id)}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-muted">No team members</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <div className="no-team-container">
                    <div className="no-team-icon">
                      <FaUsers size={64} />
                    </div>
                    <h3>You are not assigned to any team</h3>
                    <p>Currently, you are not assigned to any team. Contact your administrator if you think this is an error.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default MyTeam;