import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Badge,
  Alert,
  Spinner,
  Image,
  Button, 
  Pagination,
  Form
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AiFillEdit } from "react-icons/ai";
import SalaryCalculation from "./SalaryCalculation"; 

const EmpList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for API data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 
  
  // State for selected employee and salary view
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSalaryView, setShowSalaryView] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
            setEmployees(data);
        } else if (data && Array.isArray(data.results)) {
            setEmployees(data.results);
        } else {
            setError("Received unexpected data format from server.");
        }
        
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch employees:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Function to handle viewing salary
  const handleViewSalary = (employee) => {
    setSelectedEmployee(employee);
    setShowSalaryView(true);
  };
  
  // Function to go back to employee list
  const handleBackToList = () => {
    setSelectedEmployee(null);
    setShowSalaryView(false);
  };

  // Filter employees based on search term and status
  const allFilteredEmployees = useMemo(() => {
    let filtered = employees;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => {
        if (statusFilter === 'active') {
          return emp.is_active === true;
        } else if (statusFilter === 'inactive') {
          return emp.is_active === false;
        }
        return true;
      });
    }
    
    // Apply search filter
    if (!searchTerm) {
      return filtered;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return filtered.filter(emp =>
      emp.first_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.last_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.email?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.emp_id?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.phone?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [employees, searchTerm, statusFilter]);

  // Reset page on search or status filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Get current page's employees
  const paginatedEmployees = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredEmployees, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(allFilteredEmployees.length / itemsPerPage);

  const baseUrl = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

  // If showing salary view, render the SalaryCalculation component
  if (showSalaryView && selectedEmployee) {
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Salary Details</h2>
              <Button variant="secondary" onClick={handleBackToList}>
                Back to Employee List
              </Button>
            </div>
            
            <SalaryCalculation employee={selectedEmployee} />
          </Container>
        </div>
      </div>
    );
  }

  // Otherwise, render the employee list
  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <Container fluid className="dashboard-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Employee List</h2>
            
            {/* Status Filter Dropdown */}
            <div className="d-flex align-items-center">
              <span className="me-2">Filter by Status:</span>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: '150px' }}
              >
                <option value="all">All Employees</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </div>
          </div>
          
          {loading && <div className="d-flex justify-content-center"><Spinner animation="border" /></div>}
          {error && <Alert variant="danger">Failed to load employees: {error}</Alert>}

          {!loading && !error && (
            <>
              {/* --- YOUR CUSTOM TABLE STRUCTURE --- */}
              <Row className="mt-3">
                <div className="col-md-12">
                  <table className="temp-rwd-table">
                    <tbody>
                      <tr>
                        <th>S.No</th>
                        <th>Photo</th>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
 
                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((emp, index) => (
                          <tr key={emp.id}>
                            <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td data-th="Photo">
                               {emp.profile_photo ? (
                                    <Image src={`${baseUrl}${emp.profile_photo}`} roundedCircle width={40} height={40} />
                                ) : (
                                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', color: 'white', fontSize: '0.8rem'}}>
                                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                                    </div>
                                )}
                            </td>
                            <td data-th="Employee ID">{emp.emp_id || "N/A"}</td>
                            <td data-th="Employee Name">{emp.first_name} {emp.last_name}</td>
                            <td data-th="Department">{emp.department || "N/A"}</td>
                            <td data-th="Designation">{emp.designation || "N/A"}</td>
                            <td data-th="Email">{emp.email || "N/A"}</td>
                            <td data-th="Mobile">{emp.phone || "N/A"}</td>
                            <td data-th="Status">
                              <Badge bg={emp.is_active ? "success" : "secondary"}>
                                {emp.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td data-th="Action">
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => handleViewSalary(emp)}
                              >
                                <AiFillEdit /> View Salary
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" className="text-center">
                            No employees found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Row>
              
              {/* --- Pagination Controls --- */}
              {allFilteredEmployees.length > itemsPerPage && (
                 <div className="d-flex justify-content-center mt-4">
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
        </Container>
      </div>
    </div>
  );
};

export default EmpList;