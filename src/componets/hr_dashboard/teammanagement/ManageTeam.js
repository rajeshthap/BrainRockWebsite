import React, { useEffect, useState, useContext, useMemo } from "react";
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button, Pagination, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../assets/css/Profile.css";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import { AuthContext } from "../../context/AuthContext";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ManageTeam = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for all API data
  const [teams, setTeams] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  
  // State for editing
  const [editingTeam, setEditingTeam] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
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
  
  // Get team leaders (employees with "team leader" designation)
  const getTeamLeaders = () => {
    // Get all employees with team leader designation
    const allTeamLeaders = allEmployees.filter(emp => 
      emp.designation && (
        emp.designation.toLowerCase().includes('team leader') || 
        emp.designation.toLowerCase().includes('team lead')
      )
    );
    
    // Filter out team leaders who are already assigned to other teams
    const assignedLeaderIds = teams
      .filter(team => team.team_leader && team.id !== editingTeam)
      .map(team => team.team_leader);
    
    return allTeamLeaders.filter(leader => !assignedLeaderIds.includes(leader.emp_id));
  };
  
  // Get available projects (projects not assigned to other team leaders)
  const getAvailableProjects = () => {
    // Get all project IDs that are already assigned to team leaders
    const assignedProjectIds = teams
      .filter(team => team.project && team.id !== editingTeam)
      .map(team => team.project);
    
    // Filter out projects that are already assigned
    return projects.filter(project => !assignedProjectIds.includes(project.project_id));
  };
  
  // Get all employee IDs that are already assigned to teams
  const getAssignedEmployeeIds = () => {
    const assignedIds = [];
    
    teams.forEach(team => {
      // Skip the team being edited
      if (team.id === editingTeam) return;
      
      // Add team leader if exists
      if (team.team_leader) {
        assignedIds.push(team.team_leader);
      }
      
      // Add all team members if they exist
      if (team.employee_ids && Array.isArray(team.employee_ids)) {
        assignedIds.push(...team.employee_ids);
      }
    });
    
    return [...new Set(assignedIds)]; // Remove duplicates
  };
  
  // Get non-team-leader employees who are not already assigned to teams
  const getNonTeamLeaderEmployees = () => {
    // Get all assigned employee IDs
    const assignedIds = getAssignedEmployeeIds();
    
    // Get the current team's employee IDs to keep them in the list
    const currentTeamEmployeeIds = editFormData.employee_ids || [];
    
    return allEmployees.filter(emp => {
      // Check if the employee is a team leader
      const isTeamLeader = emp.designation && (
        emp.designation.toLowerCase().includes('team leader') || 
        emp.designation.toLowerCase().includes('team lead')
      );
      
      // Skip team leaders
      if (isTeamLeader) return false;
      
      // Keep employees who are:
      // 1. Not assigned to any team, OR
      // 2. Currently assigned to the team being edited
      return !assignedIds.includes(emp.emp_id) || currentTeamEmployeeIds.includes(emp.emp_id);
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

      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);
  
  // Filter teams based on search term
  const allFilteredTeams = useMemo(() => {
    let filtered = teams;
    
    // Apply search filter
    if (!searchTerm) {
      return filtered;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return filtered.filter(team =>
      team.team_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      team.team_id?.toLowerCase().includes(lowercasedSearchTerm) ||
      getEmployeeNameById(team.team_leader).toLowerCase().includes(lowercasedSearchTerm) ||
      getProjectNameById(team.project).toLowerCase().includes(lowercasedSearchTerm) ||
      (team.employee_ids && team.employee_ids.some(id => 
        id.toLowerCase().includes(lowercasedSearchTerm)
      ))
    );
  }, [teams, searchTerm, allEmployees, projects]);
  
  // Reset page on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Get current page's teams
  const paginatedTeams = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredTeams.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredTeams, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(allFilteredTeams.length / itemsPerPage);
  
  // Handle edit button click
  const handleEditClick = (team) => {
    setEditingTeam(team.id);
    setEditFormData({
      team_id: team.team_id,
      team_name: team.team_name,
      team_leader: team.team_leader || "",
      project: team.project || "",
      employee_ids: team.employee_ids || []
    });
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditFormData({});
    setApiMessage("");
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle employee selection
  const handleEmployeeSelection = (empId) => {
    setEditFormData(prev => {
      const employeeIds = prev.employee_ids || [];
      if (employeeIds.includes(empId)) {
        return {
          ...prev,
          employee_ids: employeeIds.filter(id => id !== empId)
        };
      } else {
        return {
          ...prev,
          employee_ids: [...employeeIds, empId]
        };
      }
    });
  };
  
  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setUpdateLoading(true);
      setApiMessage("");
      
      // Get manager ID from auth context
      const managerId = user?.uniqueId || user?.id || user?.emp_id;
      
      // Create team data object with team_id field
      const teamData = {
        team_id: editFormData.team_id,
        team_name: editFormData.team_name,
        team_leader: editFormData.team_leader,
        project: editFormData.project,
        employee_ids: editFormData.employee_ids,
        updated_by: managerId
      };
      
      // Use the all-teams endpoint for PATCH
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      
      if (!response.ok) {
        // Get detailed error information
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        
        // Extract meaningful error message
        let errorMessage = "Failed to update team";
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        // Set error message to display
        setApiMessage(errorMessage);
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update team in teams list
        setTeams(teams.map(team => 
          team.id === editingTeam 
            ? { ...team, ...teamData }
            : team
        ));
        
        // Set success message
        setApiMessage("Team updated successfully!");
        
        // Reset editing state and show success modal
        setEditingTeam(null);
        setEditFormData({});
        setShowSuccessModal(true);
      } else {
        // Set error message from API response
        const errorMsg = result.message || "Failed to update team";
        setApiMessage(errorMsg);
      }
      
    } catch (err) {
      setError(err.message);
      setApiMessage(err.message);
      console.error("Failed to update team:", err);
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Print functionality
  const handlePrint = () => {
    const columnsToRemove = [7]; // Action column index after removal
    const table = document.querySelector(".temp-rwd-table")?.cloneNode(true);

    if (!table) {
        alert("Table not found for printing.");
        return;
    }

    table.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("th, td");
      [...columnsToRemove].sort((a, b) => b - a).forEach((colIndex) => {
        if (cells[colIndex]) cells[colIndex].remove();
      });
    });

    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
      <head>
        <title>Teams List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
          th { background-color: #f4f4f4; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
        </style>
      </head>
      <body>
        <h2>Teams List</h2>
        ${table.outerHTML}
      </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.print();
  };
  
  // Download functionality
  const handleDownload = () => {
    if (allFilteredTeams.length === 0) {
      window.alert("No team records to download!");
      return;
    }

    const data = allFilteredTeams.map((team, index) => {
      // Convert employee IDs to names for download
      const employeeNames = team.employee_ids 
        ? team.employee_ids.map(id => getEmployeeNameById(id)).join(", ")
        : "No employees";
        
      return {
        "S.No": index + 1,
        "ID": team.id,
        "Team ID": team.team_id,
        "Team Name": team.team_name,
        "Team Leader": getEmployeeNameById(team.team_leader),
        "Project": getProjectNameById(team.project),
        "Employees": employeeNames
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    const range = XLSX.utils.decode_range(ws["!ref"]);

    // Header styling
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill: { fgColor: { rgb: "2B5797" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "999999" } },
          bottom: { style: "thin", color: { rgb: "999999" } },
          left: { style: "thin", color: { rgb: "999999" } },
          right: { style: "thin", color: { rgb: "999999" } }
        }
      };
    }

    // Column widths
    ws["!cols"] = [
      { wch: 6 },   // S.No
      { wch: 6 },   // ID
      { wch: 20 },  // Team ID
      { wch: 25 },  // Team Name
      { wch: 25 },  // Team Leader
      { wch: 25 },  // Project
      { wch: 40 },  // Employees
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teams");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Teams_List.xlsx");
  };
  
  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="main-content" style={{ height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <HrHeader toggleSidebar={toggleSidebar} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <Container fluid className="dashboard-body p-4" style={{ flex: 1, overflow: 'auto' }}>
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Teams Data</h2>
            </div>

            {/* API Message Display */}
            {apiMessage && (
              <Alert variant={apiMessage.includes("success") ? "success" : "danger"}>
                {apiMessage}
              </Alert>
            )}

            <div className="mt-2 mb-2 text-end">
              <Button variant="" size="sm" className="mx-2 print-btn" onClick={handlePrint}>
                <FaPrint /> Print
              </Button>
      
              <Button variant="" size="sm" className="download-btn" onClick={handleDownload}>
                <FaFileExcel /> Download
              </Button>
            </div>
            
            {loading && (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" />
                <span className="ms-2">Loading data...</span>
              </div>
            )}
            
            {error && <Alert variant="danger">Error: {error}</Alert>}
            
            {!loading && !error && (
              <>
                {/* Custom Table Structure */}
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>ID</th>
                          <th>Team ID</th>
                          <th>Team Name</th>
                          <th>Team Leader</th>
                          <th>Project</th>
                          <th>Employees</th>
                          <th>Action</th>
                        </tr>
 
                        {paginatedTeams.length > 0 ? (
                          paginatedTeams.map((team, index) => (
                            <tr key={team.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="ID">{team.id}</td>
                              <td data-th="Team ID">{team.team_id}</td>
                              <td data-th="Team Name">
                                {editingTeam === team.id ? (
                                  <Form.Control
                                    type="text"
                                    name="team_name"
                                    value={editFormData.team_name}
                                    onChange={handleFormChange}
                                  />
                                ) : (
                                  team.team_name
                                )}
                              </td>
                              <td data-th="Team Leader">
                                {editingTeam === team.id ? (
                                  <Form.Select
                                    name="team_leader"
                                    value={editFormData.team_leader}
                                    onChange={handleFormChange}
                                  >
                                    <option value="">Select Team Leader</option>
                                    {getTeamLeaders().map(leader => (
                                      <option key={leader.emp_id} value={leader.emp_id}>
                                        {leader.first_name} {leader.last_name}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  getEmployeeNameById(team.team_leader)
                                )}
                              </td>
                              <td data-th="Project">
                                {editingTeam === team.id ? (
                                  <Form.Select
                                    name="project"
                                    value={editFormData.project}
                                    onChange={handleFormChange}
                                  >
                                    <option value="">Select Project</option>
                                    {getAvailableProjects().map(project => (
                                      <option key={project.project_id} value={project.project_id}>
                                        {project.project_name}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  getProjectNameById(team.project)
                                )}
                              </td>
                              <td data-th="Employees">
                                {editingTeam === team.id ? (
                                  <div className="employee-selection-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {getNonTeamLeaderEmployees().length > 0 ? (
                                      getNonTeamLeaderEmployees().map(emp => (
                                        <Form.Check
                                          key={emp.emp_id}
                                          type="checkbox"
                                          label={`${emp.first_name} ${emp.last_name} (${emp.emp_id})`}
                                          checked={editFormData.employee_ids.includes(emp.emp_id)}
                                          onChange={() => handleEmployeeSelection(emp.emp_id)}
                                        />
                                      ))
                                    ) : (
                                      <div className="text-muted">No available employees</div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    {team.employee_ids && team.employee_ids.length > 0 ? (
                                      <div>
                                        {team.employee_ids.slice(0, 2).map(id => (
                                          <div key={id}>{getEmployeeNameById(id)}</div>
                                        ))}
                                        {team.employee_ids.length > 2 && (
                                          <div className="text-muted">+{team.employee_ids.length - 2} more</div>
                                        )}
                                      </div>
                                    ) : (
                                      "No employees"
                                    )}
                                  </div>
                                )}
                              </td>
                              <td data-th="Action">
                                {editingTeam === team.id ? (
                                  <div>
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="me-2"
                                      onClick={handleSaveChanges}
                                      disabled={updateLoading}
                                    >
                                      {updateLoading ? (
                                        <>
                                          <Spinner as="span" animation="border" size="sm" />
                                          <span className="visually-hidden">Loading...</span>
                                        </>
                                      ) : (
                                        "Save"
                                      )}
                                    </Button>
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={handleCancelEdit}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={() => handleEditClick(team)}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No teams found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>
                
                {/* Pagination Controls */}
                {allFilteredTeams.length > itemsPerPage && (
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <Pagination>
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                      />
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item 
                          key={index + 1} 
                          active={index + 1 === currentPage}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
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
      
      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Team has been updated successfully.
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

export default ManageTeam;