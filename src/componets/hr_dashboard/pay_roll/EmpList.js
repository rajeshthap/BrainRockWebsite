import React, { useState, useEffect, useMemo, useContext } from "react";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const EmpList = () => {
  // Get user data from AuthContext
  const { user } = useContext(AuthContext);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for API data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salaryCalcFilter, setSalaryCalcFilter] = useState('all'); // Filter for salary calculation status
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); 
  
  // State for selected employee and salary view
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSalaryView, setShowSalaryView] = useState(false);
  
  // State for salary structure status
  const [salaryStatuses, setSalaryStatuses] = useState({});
  
  // State for salary calculation status
  const [salaryCalculationStatuses, setSalaryCalculationStatuses] = useState({});

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Function to check salary structure status for all employees
  const checkAllSalaryStatuses = async () => {
    try {
      // Create an array of promises to fetch salary status for all employees
      const statusPromises = employees.map(emp => 
        fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-structure/?employee_id=${emp.emp_id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).then(data => {
          if (data.success && data.data && data.data.length > 0) {
            // Check if any salary structure is confirmed
            const confirmedStructure = data.data.find(item => item.status === 'confirmed');
            return {
              employeeId: emp.emp_id,
              status: confirmedStructure ? 'confirmed' : 'unconfirmed'
            };
          } else {
            return {
              employeeId: emp.emp_id,
              status: 'unconfirmed'
            };
          }
        }).catch(err => {
          console.error(`Error checking salary status for ${emp.emp_id}:`, err);
          return {
            employeeId: emp.emp_id,
            status: 'unconfirmed'
          };
        })
      );
      
      // Wait for all promises to resolve
      const statusResults = await Promise.all(statusPromises);
      
      // Convert array to object for easier lookup
      const statusMap = statusResults.reduce((acc, result) => {
        acc[result.employeeId] = result.status;
        return acc;
      }, {});
      
      setSalaryStatuses(statusMap);
    } catch (err) {
      console.error("Failed to fetch salary statuses:", err);
    }
  };
  
  // Function to check salary calculation status for all employees
  const checkAllSalaryCalculationStatuses = async () => {
    try {
      // Create an array of promises to fetch salary calculation status for all employees
      const statusPromises = employees.map(emp => 
        fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-calculation/?employee_id=${emp.emp_id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).then(data => {
          // Check if there's any salary calculation data for this employee
          if (data.success && data.data && data.data.length > 0) {
            // Check if any salary calculation is confirmed
            const confirmedCalculation = data.data.find(item => item.status === 'confirmed');
            return {
              employeeId: emp.emp_id,
              status: confirmedCalculation ? 'confirmed' : 'unconfirmed'
            };
          } else {
            return {
              employeeId: emp.emp_id,
              status: 'unconfirmed'
            };
          }
        }).catch(err => {
          console.error(`Error checking salary calculation status for ${emp.emp_id}:`, err);
          return {
            employeeId: emp.emp_id,
            status: 'unconfirmed'
          };
        })
      );
      
      // Wait for all promises to resolve
      const statusResults = await Promise.all(statusPromises);
      
      // Convert array to object for easier lookup
      const statusMap = statusResults.reduce((acc, result) => {
        acc[result.employeeId] = result.status;
        return acc;
      }, {});
      
      setSalaryCalculationStatuses(statusMap);
    } catch (err) {
      console.error("Failed to fetch salary calculation statuses:", err);
    }
  };

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

  // Check salary status for all employees when employees data is loaded
  useEffect(() => {
    if (employees.length > 0) {
      checkAllSalaryStatuses();
      checkAllSalaryCalculationStatuses();
    }
  }, [employees]);

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

  // Filter employees based on search term, status, and ONLY confirmed salary status
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
    
    // Apply salary status filter - ONLY SHOW CONFIRMED
    filtered = filtered.filter(emp => {
      const empSalaryStatus = salaryStatuses[emp.emp_id];
      return empSalaryStatus === 'confirmed'; // Only show confirmed employees
    });
    
    // Apply salary calculation status filter
    if (salaryCalcFilter !== 'all') {
      filtered = filtered.filter(emp => {
        const empSalaryCalcStatus = salaryCalculationStatuses[emp.emp_id];
        if (salaryCalcFilter === 'confirmed') {
          return empSalaryCalcStatus === 'confirmed';
        } else if (salaryCalcFilter === 'unconfirmed') {
          return empSalaryCalcStatus === 'unconfirmed';
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
  }, [employees, searchTerm, statusFilter, salaryCalcFilter, salaryStatuses, salaryCalculationStatuses]);

  // Reset page on search or status filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, salaryCalcFilter]);

  // Get current page's employees
  const paginatedEmployees = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredEmployees, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(allFilteredEmployees.length / itemsPerPage);

  const baseUrl = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

  // Check if user is an employee (not admin)
  const isEmployee = user && user.role !== 'admin';
  
  // If user is an employee, find their own data from the employees list
  const employeeData = useMemo(() => {
    if (isEmployee && employees.length > 0) {
      return employees.find(emp => emp.emp_id === user.unique_id);
    }
    return null;
  }, [isEmployee, employees, user]);

  // If showing salary view, render the SalaryCalculation component
  if (showSalaryView && selectedEmployee) {
    return (
      <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content" style={{ height: '100vh', overflow: 'auto' }}>
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

  // If user is an employee and we have their data, show only their salary calculation
  if (isEmployee && employeeData) {
    return (
      <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content" style={{ height: '100vh', overflow: 'auto' }}>
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <h2 className="mb-4">My Salary Details</h2>
            <SalaryCalculation employee={employeeData} />
          </Container>
        </div>
      </div>
    );
  }

  // If user is an employee but we don't have their data yet, show loading
  if (isEmployee && !employeeData) {
    return (
      <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content" style={{ height: '100vh', overflow: 'auto' }}>
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          </Container>
        </div>
      </div>
    );
  }

 const handlePrint = () => {
  const columnsToRemove = [1, 11]; // Photo (1), Action (11)
  const table = document.querySelector(".temp-rwd-table").cloneNode(true);

  // Remove columns
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
      <title>Employee List</title>
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
      <h2>Employee List</h2>
      ${table.outerHTML}
    </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.print();
};

const handleDownload = () => {
  if (allFilteredEmployees.length === 0) {
    window.alert("No employee records to download!");
    return;
  }

  const data = allFilteredEmployees.map((emp, index) => {
    const salaryStatus = salaryStatuses[emp.emp_id] || 'unconfirmed';
    const salaryCalcStatus = salaryCalculationStatuses[emp.emp_id] || 'unconfirmed';
    return {
      "S.No": index + 1,
      "Employee ID": emp.emp_id,
      "Employee Name": `${emp.first_name} ${emp.last_name}`,
      "Department": emp.department,
      "Designation": emp.designation,
      "Email": emp.email,
      "Mobile": emp.phone,
      "Status": emp.is_active ? "Active" : "Inactive",
      "Salary Structure Status": salaryStatus === 'confirmed' ? 'Confirmed' : 'Unconfirmed',
      "Salary Calculation Status": salaryCalcStatus === 'confirmed' ? 'Confirmed' : 'Unconfirmed'
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
    { wch: 20 },  // Employee ID
    { wch: 28 },  // Employee Name
    { wch: 20 },  // Department
    { wch: 20 },  // Designation
    { wch: 30 },  // Email
    { wch: 15 },  // Mobile
    { wch: 12 },  // Status
    { wch: 20 },  // Salary Structure Status
    { wch: 25 },  // Salary Calculation Status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Employee_List.xlsx");
};


  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content" style={{ height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <HrHeader toggleSidebar={toggleSidebar} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <Container fluid className="dashboard-body p-4" style={{ flex: 1, overflow: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Employee List (Confirmed Salary Structure Only)</h2>

            {/* Status Filter Dropdowns */}
            <div className="d-flex align-items-center">
              <span className="me-2">Filter by Status:</span>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select me-3"
                style={{ width: '150px' }}
              >
                <option value="all">All Employees</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
              
              <span className="me-2">Salary Calculation:</span>
              <Form.Select 
                value={salaryCalcFilter} 
                onChange={(e) => setSalaryCalcFilter(e.target.value)}
                className="form-select"
                style={{ width: '150px' }}
              >
                <option value="all">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="unconfirmed">Unconfirmed</option>
              </Form.Select>
            </div>
          </div>

          <div className="mt-2 vmb-2 text-end">
            <Button variant="" size="sm" className="mx-2 print-btn" onClick={handlePrint}>
              <FaPrint /> Print
            </Button>
  
            <Button variant="" size="sm" className="download-btn" onClick={handleDownload}>
              <FaFileExcel /> Download
            </Button>
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
                        <th>Salary Structure Status</th>
                        <th>Salary Calculation Status</th>
                        <th>Action</th>
                      </tr>
 
                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((emp, index) => {
                          const salaryStatus = salaryStatuses[emp.emp_id] || 'unconfirmed';
                          const salaryCalcStatus = salaryCalculationStatuses[emp.emp_id] || 'unconfirmed';
                          const isSalaryCalcConfirmed = salaryCalcStatus === 'confirmed';
                          
                          return (
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
                              <td data-th="Salary Structure Status">
                                <Badge bg="success">
                                  Confirmed
                                </Badge>
                              </td>
                              <td data-th="Salary Calculation Status">
                                <Badge bg={salaryCalcStatus === 'confirmed' ? "success" : "warning"}>
                                  {salaryCalcStatus === 'confirmed' ? 'Confirmed' : 'Unconfirmed'}
                                </Badge>
                              </td>
                              <td data-th="Action">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleViewSalary(emp)}
                                  disabled={isSalaryCalcConfirmed}
                                  title={isSalaryCalcConfirmed ? "Salary calculation is already confirmed" : "View salary calculation"}
                                >
                                  <AiFillEdit /> View Salary
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="12" className="text-center">
                            No employees with confirmed salary structure found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Row>
              
              {/* --- Pagination Controls --- */}
              {allFilteredEmployees.length > itemsPerPage && (
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
        </Container>
      </div>
    </div>
  );
};

export default EmpList;