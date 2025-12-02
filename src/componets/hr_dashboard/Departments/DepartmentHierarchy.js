import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
import "../../../assets/css/DepartmentHierarchy.css";

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
      return;
    }

    // Collect all employee IDs in the reporting chains of matched employees
    const employeeIdsToInclude = new Set();
    matchedEmployees.forEach(emp => {
      const chain = getReportingChain(emp.emp_id, employees);
      chain.forEach(employee => {
        employeeIdsToInclude.add(employee.emp_id);
      });
    });

    // Create the filtered employee array with all employees in the reporting chains
    const newFilteredEmployees = employees.filter(emp => 
      employeeIdsToInclude.has(emp.emp_id)
    );

    setFilteredEmployees(newFilteredEmployees);
  }, [searchTerm, searchField, employees]);

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
                  <Tree data={treeData} onEmployeeClick={handleEmployeeClick} baseUrl={baseUrl} handleImageError={handleImageError} />
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
const Tree = ({ data, onEmployeeClick, baseUrl, handleImageError }) => {
  return (
    <div className="tree">
      {data.map((node) => (
        <TreeNodeItem 
          key={node.id} 
          node={node} 
          onEmployeeClick={onEmployeeClick}
          baseUrl={baseUrl}
          handleImageError={handleImageError}
        />
      ))}
    </div>
  );
};

// TreeNodeItem component that matches the provided structure
const TreeNodeItem = ({ node, onEmployeeClick, baseUrl, handleImageError }) => {
  const [expanded, setExpanded] = React.useState(false);

  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    // Call the employee click handler with the employee data
    if (node.employee) {
      onEmployeeClick(node.employee);
    }
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-label ${hasChildren ? "clickable" : ""}`}
        onClick={handleClick}
      >
        {hasChildren && (
          <span className={`toggle ${expanded ? "expanded" : ""}`}>▸</span>
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

      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeItem 
              key={child.id} 
              node={child} 
              onEmployeeClick={onEmployeeClick}
              baseUrl={baseUrl}
              handleImageError={handleImageError}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component for displaying employee details (without financial information)
const EmployeeDetails = ({ employee, handleImageError, baseUrl }) => {
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
      </div>
    </div>
  );
};

export default DepartmentHierarchy;