import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
import "../../../assets/css/DepartmentHierarchy.css";
import { Table, Badge, Spinner, Alert, Form, Button, DatePicker, InputGroup, FormControl,Row } from 'react-bootstrap';
import { FaCalendar } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';

const DepartmentHierarchy = () => {
  const baseUrl = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile] = useState(false);
  const [isTablet] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // New state for project and team data
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Fetch employee data from API with authentication
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/employee-list/`,
          {
            withCredentials: true // This includes cookies in the request
          }
        );
        
        if (response.data) {
          setEmployees(response.data);
          setFilteredEmployees(response.data);
        } else {
          throw new Error('No data received from API');
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [baseUrl]);

  // Fetch projects and teams data
  useEffect(() => {
    const fetchProjectsAndTeams = async () => {
      try {
        const [projectsResponse, teamsResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/project-list/`, {
            withCredentials: true
          }),
          axios.get(`${baseUrl}/api/all-teams/`, {
            withCredentials: true
          })
        ]);

        if (projectsResponse.data && projectsResponse.data.success) {
          setProjects(projectsResponse.data.data);
        }

        if (teamsResponse.data && teamsResponse.data.success) {
          setTeams(teamsResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching projects and teams:", err);
      }
    };

    fetchProjectsAndTeams();
  }, [baseUrl]);

  // Function to get the reporting chain for an employee (from employee up to CEO)
  const getReportingChain = (employeeId, allEmployees) => {
    const chain = [];
    let currentId = employeeId;
    const visited = new Set(); // To prevent infinite loops in case of circular references
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const currentEmployee = allEmployees.find(emp => emp.emp_id === currentId);
      
      if (!currentEmployee) {
        break;
      }
      
      chain.push(currentEmployee);
      
      if (!currentEmployee.reporting_manager_id) {
        break; // Reached the top of the hierarchy
      }
      
      currentId = currentEmployee.reporting_manager_id;
    }
    
    return chain;
  };

  // Function to get all subordinates of an employee (direct and indirect reports)
  const getAllSubordinates = (employeeId, allEmployees, result = []) => {
    // Find direct reports
    const directReports = allEmployees.filter(emp => emp.reporting_manager_id === employeeId);
    
    // Add direct reports to result
    directReports.forEach(emp => {
      if (!result.find(e => e.emp_id === emp.emp_id)) {
        result.push(emp);
      }
      
      // Recursively get subordinates of each direct report
      getAllSubordinates(emp.emp_id, allEmployees, result);
    });
    
    return result;
  };

  // Convert employee data to tree structure
  const convertToTreeData = (employeeList) => {
    // Create a map for quick lookup
    const employeeMap = {};
    employeeList.forEach(emp => {
      employeeMap[emp.emp_id] = {
        id: emp.emp_id,
        title: `${emp.first_name} ${emp.last_name}`,
        subtitle: emp.designation,
        employee: emp,
        children: []
      };
    });

    // Find root nodes (employees with no reporting manager in the filtered list)
    const roots = employeeList.filter(emp => {
      // If the employee has a reporting manager, check if that manager is in the filtered list
      if (emp.reporting_manager_id) {
        return !employeeList.some(e => e.emp_id === emp.reporting_manager_id);
      }
      return true; // No reporting manager, so it's a root
    });
    
    // Build tree structure
    const trees = roots.map(root => {
      const node = employeeMap[root.emp_id];
      
      // Recursive function to build children
      const buildChildren = (parentNode) => {
        employeeList.forEach(emp => {
          if (emp.reporting_manager_id === parentNode.employee.emp_id) {
            const child = employeeMap[emp.emp_id];
            parentNode.children.push(child);
            buildChildren(child);
          }
        });
      };

      buildChildren(node);
      return node;
    });

    return trees;
  };

  // Build tree data from employee data
  useEffect(() => {
    if (filteredEmployees.length === 0) {
      setTreeData([]);
      return;
    }

    const treeStructure = convertToTreeData(filteredEmployees);
    setTreeData(treeStructure);
  }, [filteredEmployees]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      setExpandedNodes(new Set());
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Find employees that match the search criteria
    const matchedEmployees = employees.filter(emp => {
      if (searchField === 'all') {
        return (
          (emp.first_name && emp.first_name.toLowerCase().includes(term)) ||
          (emp.last_name && emp.last_name.toLowerCase().includes(term)) ||
          (emp.department && emp.department.toLowerCase().includes(term)) ||
          (emp.designation && emp.designation.toLowerCase().includes(term))
        );
      } else if (searchField === 'name') {
        return (
          (emp.first_name && emp.first_name.toLowerCase().includes(term)) ||
          (emp.last_name && emp.last_name.toLowerCase().includes(term))
        );
      } else if (searchField === 'department') {
        return emp.department && emp.department.toLowerCase().includes(term);
      } else if (searchField === 'designation') {
        return emp.designation && emp.designation.toLowerCase().includes(term);
      }
      return false;
    });

    // If no matches, set filteredEmployees to empty array
    if (matchedEmployees.length === 0) {
      setFilteredEmployees([]);
      setExpandedNodes(new Set());
      return;
    }

    // Collect all employee IDs in the reporting chains and subordinates of matched employees
    const employeeIdsToInclude = new Set();
    const newExpandedNodes = new Set();
    
    matchedEmployees.forEach(emp => {
      // Get the reporting chain (from employee up to CEO)
      const chain = getReportingChain(emp.emp_id, employees);
      chain.forEach(employee => {
        employeeIdsToInclude.add(employee.emp_id);
        newExpandedNodes.add(employee.emp_id);
      });
      
      // Get all subordinates (from employee down to lowest level)
      const subordinates = getAllSubordinates(emp.emp_id, employees);
      subordinates.forEach(employee => {
        employeeIdsToInclude.add(employee.emp_id);
        newExpandedNodes.add(employee.emp_id);
      });
    });

    // Create the filtered employee array with all employees in the reporting chains and subordinates
    const newFilteredEmployees = employees.filter(emp => 
      employeeIdsToInclude.has(emp.emp_id)
    );

    setFilteredEmployees(newFilteredEmployees);
    setExpandedNodes(newExpandedNodes);
  }, [searchTerm, searchField, employees]);

  // Fetch employee projects when an employee is selected
  useEffect(() => {
    if (!selectedEmployee) {
      setEmployeeProjects([]);
      return;
    }

    const fetchEmployeeProjects = async () => {
      setProjectsLoading(true);
      try {
        // Find teams that include the selected employee
        const employeeTeams = teams.filter(team => 
          team.employee_ids && team.employee_ids.includes(selectedEmployee.emp_id)
        );

        // Find teams led by the selected employee
        const ledTeams = teams.filter(team => 
          team.team_leader === selectedEmployee.emp_id
        );

        // Combine both types of teams
        const allRelevantTeams = [...employeeTeams, ...ledTeams];

        // Get project details for each team
        const projectsData = allRelevantTeams.map(team => {
          const project = projects.find(p => p.project_id === team.project);
          return {
            team_id: team.team_id,
            team_name: team.team_name,
            project_id: team.project,
            project_name: project ? project.project_name : 'Not assigned',
            start_date: team.start_date,
            end_date: team.end_date,
            team_leader: team.team_leader,
            role: team.team_leader === selectedEmployee.emp_id ? 'Team Leader' : 'Team Member'
          };
        });

        setEmployeeProjects(projectsData);
      } catch (err) {
        console.error("Error fetching employee projects:", err);
        setEmployeeProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchEmployeeProjects();
  }, [selectedEmployee, teams, projects]);

  // Handle employee selection
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  // Handle retry on error
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // The useEffect will run again because of the state change
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.style.display = 'none'; // Hide the broken image
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = 'flex'; // Show the placeholder
    }
  };

  // Toggle node expansion
  const toggleNodeExpansion = (employeeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  // Helper function to get employee name by ID
  const getEmployeeNameById = (empId) => {
    const employee = employees.find(emp => emp.emp_id === empId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Not assigned';
  };

  // Helper function to get project name by ID
  const getProjectNameById = (projectId) => {
    const project = projects.find(proj => proj.project_id === projectId);
    return project ? project.project_name : 'Not assigned';
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Custom DatePicker Input Component
  const CustomDatePickerInput = ({ value, onClick, placeholder }) => (
    <InputGroup>
      <Form.Control
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        className="temp-form-control-option"
        readOnly
      />
      <InputGroup.Text onClick={onClick} style={{ cursor: "pointer" }}>
        <FaCalendar />
      </InputGroup.Text>
    </InputGroup>
  );

  if (loading) return <div className="loading">Loading organization chart...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error">Error: {error}</div>
      <button className="retry-button" onClick={handleRetry}>Retry</button>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <SideNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <HrHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <div className="dashboard-body">
          <div className="org-chart-container">
            <h1>Hierarchy Chart</h1>
            
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ color: '#333' }} // Inline style to ensure text is visible
                />
                <select
                  className="search-select"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                >
                  <option value="all">All Fields</option>
                  <option value="name">Name</option>
                  <option value="department">Department</option>
                  <option value="designation">Designation</option>
                </select>
              </div>
              {searchTerm && (
                <div className="search-results">
                  Showing reporting hierarchy for {filteredEmployees.length} employee(s)
                </div>
              )}
            </div>
            
            <div className="org-chart-wrapper">
              {/* Hierarchy Structure - 4 columns on large and medium screens */}
              <div className="org-chart org-chart-lg-4 org-chart-md-4 org-chart-sm-12">
                {treeData.length > 0 ? (
                  <Tree 
                    data={treeData} 
                    onEmployeeClick={handleEmployeeClick} 
                    baseUrl={baseUrl} 
                    handleImageError={handleImageError}
                    expandedNodes={expandedNodes}
                    toggleNodeExpansion={toggleNodeExpansion}
                  />
                ) : (
                  <div className="no-results">
                    {searchTerm ? "No employees found matching your search." : "No employee data available."}
                  </div>
                )}
              </div>
              
              {/* Employee Details - 8 columns on large and medium screens */}
              {selectedEmployee && (
                <div className="employee-details employee-details-lg-8 employee-details-md-8 employee-details-sm-12">
                  <EmployeeDetails 
                    employee={selectedEmployee} 
                    handleImageError={handleImageError}
                    baseUrl={baseUrl}
                    employeeProjects={employeeProjects}
                    projectsLoading={projectsLoading}
                    getEmployeeNameById={getEmployeeNameById}
                    getProjectNameById={getProjectNameById}
                    formatDateForDisplay={formatDateForDisplay}
                    CustomDatePickerInput={CustomDatePickerInput}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tree component that matches the provided structure
const Tree = ({ data, onEmployeeClick, baseUrl, handleImageError, expandedNodes, toggleNodeExpansion }) => {
  return (
    <div className="tree">
      {data.map((node) => (
        <TreeNodeItem 
          key={node.id} 
          node={node} 
          onEmployeeClick={onEmployeeClick}
          baseUrl={baseUrl}
          handleImageError={handleImageError}
          expandedNodes={expandedNodes}
          toggleNodeExpansion={toggleNodeExpansion}
        />
      ))}
    </div>
  );
};

// TreeNodeItem component that matches the provided structure
const TreeNodeItem = ({ node, onEmployeeClick, baseUrl, handleImageError, expandedNodes, toggleNodeExpansion }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  const handleClick = () => {
    // Call the employee click handler with the employee data
    if (node.employee) {
      onEmployeeClick(node.employee);
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    toggleNodeExpansion(node.id);
  };

  return (
    <div className="tree-node">
      <div className={`tree-label ${hasChildren ? "clickable" : ""}`} onClick={handleClick}>
        {hasChildren && (
          <span 
            className={`toggle ${isExpanded ? "expanded" : ""}`} 
            onClick={handleToggleClick}
          >
            ▸
          </span>
        )}
        <div className="employee-card">
          <div className="employee-photo-container">
            {node.employee?.profile_photo ? (
              <>
                <img 
                  src={`${baseUrl}${node.employee.profile_photo}`} 
                  alt={`${node.employee.first_name} ${node.employee.last_name}`}
                  className="employee-photo"
                  onError={handleImageError}
                />
                <div className="employee-photo-placeholder" style={{ display: 'none' }}>
                  {node.employee.first_name.charAt(0)}{node.employee.last_name.charAt(0)}
                </div>
              </>
            ) : (
              <div className="employee-photo-placeholder">
                {node.employee?.first_name?.charAt(0)}{node.employee?.last_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="employee-info">
            <div className="employee-name">{node.title}</div>
            <div className="employee-title">{node.subtitle}</div>
            <div className="employee-dept">{node.employee?.department}</div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeItem 
              key={child.id} 
              node={child} 
              onEmployeeClick={onEmployeeClick}
              baseUrl={baseUrl}
              handleImageError={handleImageError}
              expandedNodes={expandedNodes}
              toggleNodeExpansion={toggleNodeExpansion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component for displaying employee details (without financial information)
const EmployeeDetails = ({ 
  employee, 
  handleImageError, 
  baseUrl, 
  employeeProjects, 
  projectsLoading,
  getEmployeeNameById,
  getProjectNameById,
  formatDateForDisplay,
  CustomDatePickerInput
}) => {
  return (
    <div className="employee-details-content">
      <h2>Employee Details</h2>
      <div className="details-card">
        <div className="details-header">
          <div className="details-photo-container">
            {employee.profile_photo ? (
              <>
                <img 
                  src={`${baseUrl}${employee.profile_photo}`} 
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="details-photo"
                  onError={handleImageError}
                />
                <div className="details-photo-placeholder" style={{ display: 'none' }}>
                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                </div>
              </>
            ) : (
              <div className="details-photo-placeholder">
                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3>{employee.first_name} {employee.last_name}</h3>
            <p>{employee.designation}</p>
          </div>
        </div>
        
        <div className="details-section">
          <h4>Personal Information</h4>
          <p><strong>Employee ID:</strong> {employee.emp_id}</p>
          <p><strong>Gender:</strong> {employee.gender}</p>
          <p><strong>Date of Birth:</strong> {new Date(employee.date_of_birth).toLocaleDateString()}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phone:</strong> {employee.phone}</p>
          <p><strong>Address:</strong> {employee.address}</p>
        </div>
        
        <div className="details-section">
          <h4>Professional Information</h4>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Designation:</strong> {employee.designation}</p>
          <p><strong>Experience:</strong> {employee.experience || 'Not specified'}</p>
          <p><strong>Skills:</strong> {employee.skills_set && employee.skills_set.length > 0 ? employee.skills_set.join(', ') : 'Not specified'}</p>
          <p><strong>Reporting Manager:</strong> {employee.reporting_manager || 'None'}</p>
          <p><strong>Work Location:</strong> {employee.work_location}</p>
          <p><strong>Joining Date:</strong> {new Date(employee.joining_date).toLocaleDateString()}</p>
          <p><strong>Branch:</strong> {employee.branch_name}</p>
        </div>
        
        {/* Projects and Teams Section */}
        <div className="details-section">
          <h4>Projects & Teams</h4>
          {projectsLoading ? (
            <div className="d-flex justify-content-center my-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Loading projects...</span>
            </div>
          ) : employeeProjects.length > 0 ? (
            <Row className="mt-3">
              <div className="col-md-12">
                <table className="temp-rwd-table">
                  <tbody>
                    <tr>
                      <th>S.No</th>
                      <th>Team ID</th>
                      <th>Team Name</th>
                      <th>Team Leader</th>
                      <th>Project</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      
                    </tr>
                    {employeeProjects.map((project, index) => (
                      <tr key={index}>
                        <td data-th="S.No">{index + 1}</td>
                        <td data-th="Team ID">{project.team_id}</td>
                        <td data-th="Team Name">{project.team_name}</td>
                        <td data-th="Team Leader">{getEmployeeNameById(project.team_leader)}</td>
                        <td data-th="Project">{project.project_name}</td>
                        <td data-th="Start Date">{formatDateForDisplay(project.start_date)}</td>
                        <td data-th="End Date">{formatDateForDisplay(project.end_date)}</td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Row>
          ) : (
            <Alert variant="info">
              This employee is not currently assigned to any projects or teams.
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentHierarchy;