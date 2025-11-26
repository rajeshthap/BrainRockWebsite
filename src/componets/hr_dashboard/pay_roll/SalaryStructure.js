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
  Form,
  Card,
  Col,
  InputGroup,
  Table
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AiFillEdit } from "react-icons/ai";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // Adjust path as needed

// Salary structure percentages - same for all employees
const SALARY_STRUCTURE = {
  earnings: {
    basic: 40,      // 40% of gross salary
    hra: 20,        // Default 20% of gross salary (will be adjusted based on metro/non-metro)
    da: 10,         // 10% of gross salary
    ta: 5,          // 5% of gross salary
    medical: 5,     // 5% of gross salary
    special: 20     // 20% of gross salary
  },
  deductions: {
    pf: 12,         // 12% of basic salary
    esi: 0.75,      // 0.75% of gross salary
    tds: 0,         // Default 0% (will be adjusted based on salary)
    other_deductions: 0
  }
};

// Metro vs Non-Metro HRA percentages
const HRA_PERCENTAGES = {
  metro: 50,       // 50% of basic salary for metro cities
  nonMetro: 40     // 40% of basic salary for non-metro cities
};

// Helper function to format currency values with 2 decimal places and max 12 digits
const formatCurrencyValue = (value) => {
  // Convert to string and check if it has more than 12 digits (excluding decimal point)
  const strValue = value.toString();
  const digitsOnly = strValue.replace('.', '');
  
  if (digitsOnly.length > 12) {
    // If more than 12 digits, truncate to fit
    const integerPart = Math.floor(value).toString().substring(0, 10);
    const decimalPart = value.toFixed(2).split('.')[1];
    return parseFloat(`${integerPart}.${decimalPart}`).toFixed(2);
  }
  
  return parseFloat(value).toFixed(2);
};

const SalaryStructure = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Get user data from AuthContext
  const { user } = useContext(AuthContext);
  
  // State for API data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 
  
  // State for selected employee and salary structure form
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  
  // State for metro/non-metro selection
  const [cityType, setCityType] = useState('metro'); // 'metro' or 'nonMetro'
  
  // State for salary structure form
  const [salaryStructure, setSalaryStructure] = useState({
    basic: '',
    hra: '',
    da: '',
    ta: '',
    medical: '',
    special: '',
    pf: '',
    esi: '',
    tds: '',
    other_deductions: ''
  });

  // State for fetched salary data
  const [employeeSalaryData, setEmployeeSalaryData] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState(null);
  
  // State for save operation
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

  // Function to calculate salary structure based on percentages
  const calculateSalaryStructure = (monthlySalary) => {
    // Calculate basic salary
    const basic = monthlySalary * SALARY_STRUCTURE.earnings.basic / 100;
    
    // Calculate earnings
    const earnings = {};
    Object.entries(SALARY_STRUCTURE.earnings).forEach(([key, percentage]) => {
      if (key === 'hra') {
        // HRA is calculated based on basic salary and city type
        earnings[key] = formatCurrencyValue(basic * HRA_PERCENTAGES[cityType] / 100);
      } else {
        earnings[key] = formatCurrencyValue(monthlySalary * percentage / 100);
      }
    });
    
    // Calculate deductions
    const deductions = {};
    Object.entries(SALARY_STRUCTURE.deductions).forEach(([key, percentage]) => {
      if (key === 'pf') {
        // PF is calculated on basic salary
        let pfValue = basic * percentage / 100;
        // Cap PF at 1800/month as per current regulations
        if (pfValue > 1800) {
          pfValue = 1800;
        }
        deductions[key] = formatCurrencyValue(pfValue);
      } else if (key === 'tds') {
        // TDS calculation based on annual salary
        const annualSalary = monthlySalary * 12;
        let tdsPercentage = 0;
        
        if (annualSalary > 1000000) {
          tdsPercentage = 20;
        } else if (annualSalary > 500000) {
          tdsPercentage = 10;
        } else if (annualSalary > 250000) {
          tdsPercentage = 5;
        }
        
        deductions[key] = formatCurrencyValue(monthlySalary * tdsPercentage / 100);
      } else {
        // Other deductions are calculated on gross salary
        deductions[key] = formatCurrencyValue(monthlySalary * percentage / 100);
      }
    });
    
    // Set calculated values
    setSalaryStructure({
      ...earnings,
      ...deductions
    });
  };

  // Function to fetch employee salary data
  const fetchEmployeeSalary = async (employeeId) => {
    setSalaryLoading(true);
    setSalaryError(null);
    
    try {
      const response = await axios.get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-gender-salary/?employee_id=${employeeId}`,
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        setEmployeeSalaryData(response.data.data);
        
        // Calculate salary structure based on the fetched salary
        if (response.data.data && response.data.data.salary) {
          const monthlySalary = parseFloat(response.data.data.salary) / 12;
          calculateSalaryStructure(monthlySalary);
        }
      } else {
        setSalaryError("Failed to fetch employee salary data");
      }
    } catch (err) {
      setSalaryError(err.message || "Failed to fetch employee salary data");
      console.error("Error fetching employee salary:", err);
    } finally {
      setSalaryLoading(false);
    }
  };

  // Function to handle setting salary structure
  const handleSetSalaryStructure = (employee) => {
    setSelectedEmployee(employee);
    setShowSalaryForm(true);
    
    // Fetch employee salary data
    fetchEmployeeSalary(employee.emp_id);
  };
  
  // Function to go back to employee list
  const handleBackToList = () => {
    setSelectedEmployee(null);
    setShowSalaryForm(false);
    setEmployeeSalaryData(null);
    setSaveError(null);
    setCityType('metro'); // Reset to default
  };

  // Calculate total earnings and deductions
  const totalEarnings = useMemo(() => {
    return Object.entries(salaryStructure)
      .filter(([key]) => ['basic', 'hra', 'da', 'ta', 'medical', 'special'].includes(key))
      .reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0);
  }, [salaryStructure]);

  const totalDeductions = useMemo(() => {
    return Object.entries(salaryStructure)
      .filter(([key]) => ['pf', 'esi', 'tds', 'other_deductions'].includes(key))
      .reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0);
  }, [salaryStructure]);

  const calculatedNetSalary = useMemo(() => {
    return totalEarnings - totalDeductions;
  }, [totalEarnings, totalDeductions]);

  // Function to save salary structure
  const handleSaveSalaryStructure = async () => {
    setSaveLoading(true);
    setSaveError(null);
    
    try {
      // Get user unique_id from AuthContext
      const userUniqueId = user?.unique_id || null;
      
      if (!userUniqueId) {
        setSaveError("User authentication error. Please log in again.");
        setSaveLoading(false);
        return;
      }
      
      // Get selected employee ID - using multiple possible field names
      const employeeId = selectedEmployee?.emp_id || selectedEmployee?.employee_id || selectedEmployee?.id || null;
      
      if (!employeeId) {
        setSaveError("Employee ID not found. Please select an employee again.");
        setSaveLoading(false);
        return;
      }
      
      // Format totals to ensure they meet requirements
      const formattedTotalEarnings = formatCurrencyValue(totalEarnings);
      const formattedTotalDeductions = formatCurrencyValue(totalDeductions);
      const formattedNetSalary = formatCurrencyValue(calculatedNetSalary);
      
      // Prepare data for API
      const salaryData = {
        // Employee information
        employee_id: employeeId, // Selected employee's ID
        city_type: cityType, // Metro or Non-Metro
        // Earnings
        basic_salary: parseFloat(salaryStructure.basic),
        hra: parseFloat(salaryStructure.hra),
        da: parseFloat(salaryStructure.da),
        ta: parseFloat(salaryStructure.ta),
        medical_allowance: parseFloat(salaryStructure.medical),
        special_allowance: parseFloat(salaryStructure.special),
        // Deductions
        pf: parseFloat(salaryStructure.pf),
        esi: parseFloat(salaryStructure.esi),
        tds: parseFloat(salaryStructure.tds),
        other_deductions: parseFloat(salaryStructure.other_deductions),
        // Totals - using formatted values
        total_earnings: parseFloat(formattedTotalEarnings),
        total_deductions: parseFloat(formattedTotalDeductions),
        net_salary: parseFloat(formattedNetSalary),
        created_by: userUniqueId // Use user's unique_id from AuthContext
      };
      
      console.log('Sending salary data:', salaryData); // For debugging
      
      // Make API call to save salary structure
      const response = await axios.post(
        'https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-structure/',
        salaryData,
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        alert('Salary structure saved successfully!');
        handleBackToList();
      } else {
        setSaveError(response.data.message || "Failed to save salary structure");
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Failed to save salary structure");
      console.error("Error saving salary structure:", err);
    } finally {
      setSaveLoading(false);
    }
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

  // If showing salary form, render the salary structure form
  if (showSalaryForm && selectedEmployee) {
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">View Salary Structure</h2>
              <Button variant="secondary" onClick={handleBackToList}>
                Back to Employee List
              </Button>
            </div>
            
            <Card className="p-4">
              <h4 className="mb-4">
                Employee: {selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.emp_id})
              </h4>
              
              {salaryLoading && <div className="d-flex justify-content-center mb-3"><Spinner animation="border" /></div>}
              {salaryError && <Alert variant="danger">{salaryError}</Alert>}
              
              {saveError && <Alert variant="danger">{saveError}</Alert>}
              
              {employeeSalaryData && (
                <>
                  <Row className="mb-4">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Employee Total Monthly Salary (from System)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>₹</InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={formatCurrencyValue(employeeSalaryData.salary / 12)}
                            disabled
                            style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>City Type</Form.Label>
                        <Form.Select 
                          value={cityType} 
                          onChange={(e) => {
                            setCityType(e.target.value);
                            // Recalculate salary structure when city type changes
                            if (employeeSalaryData && employeeSalaryData.salary) {
                              const monthlySalary = parseFloat(employeeSalaryData.salary) / 12;
                              calculateSalaryStructure(monthlySalary);
                            }
                          }}
                        >
                          <option value="metro">Metro City</option>
                          <option value="nonMetro">Non-Metro City</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Net Salary</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>₹</InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={formatCurrencyValue(calculatedNetSalary)}
                            disabled
                            style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', fontWeight: 'bold' }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <h5 className="mb-3">Earnings</h5>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Basic Salary ({SALARY_STRUCTURE.earnings.basic}% of Gross)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="basic"
                              value={salaryStructure.basic}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>HRA ({HRA_PERCENTAGES[cityType]}% of Basic)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="hra"
                              value={salaryStructure.hra}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>DA ({SALARY_STRUCTURE.earnings.da}% of Gross)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="da"
                              value={salaryStructure.da}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>TA ({SALARY_STRUCTURE.earnings.ta}% of Gross)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="ta"
                              value={salaryStructure.ta}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Medical Allowance ({SALARY_STRUCTURE.earnings.medical}% of Gross)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="medical"
                              value={salaryStructure.medical}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Special Allowance ({SALARY_STRUCTURE.earnings.special}% of Gross)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="special"
                              value={salaryStructure.special}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Form>
                    </Col>
                    
                    <Col md={6}>
                      <h5 className="mb-3">Deductions</h5>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>PF ({SALARY_STRUCTURE.deductions.pf}% of Basic)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="pf"
                              value={salaryStructure.pf}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>ESI ({SALARY_STRUCTURE.deductions.esi}% of Gross)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="esi"
                              value={salaryStructure.esi}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>TDS (Based on Annual Salary)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="tds"
                              value={salaryStructure.tds}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Other Deductions</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="other_deductions"
                              value={salaryStructure.other_deductions}
                              disabled
                              style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Form>
                      
                      <div className="mt-4">
                        <h5 className="mb-3">Summary</h5>
                        <Table striped bordered>
                          <tbody>
                            <tr>
                              <td><strong>Total Earnings:</strong></td>
                              <td>₹{formatCurrencyValue(totalEarnings)}</td>
                            </tr>
                            <tr>
                              <td><strong>Total Deductions:</strong></td>
                              <td>₹{formatCurrencyValue(totalDeductions)}</td>
                            </tr>
                            <tr className="table-info">
                              <td><strong>Net Salary:</strong></td>
                              <td><strong>₹{formatCurrencyValue(calculatedNetSalary)}</strong></td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                </>
              )}
              
              <div className="d-flex justify-content-center mt-4">
                <Button 
                  variant="primary" 
                  onClick={handleSaveSalaryStructure}
                  disabled={salaryLoading || saveLoading}
                >
                  {saveLoading ? <Spinner as="span" animation="border" size="sm" /> : null}
                  Save Salary Structure
                </Button>
              </div>
            </Card>
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
                                onClick={() => handleSetSalaryStructure(emp)}
                              >
                                <AiFillEdit /> View Salary Structure
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

export default SalaryStructure;