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
  Col
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AiFillEdit } from "react-icons/ai";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const PayslipGenerator = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); 
  
  // State for selected employee and payslip view
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPayslipView, setShowPayslipView] = useState(false);
  const [payslipData, setPayslipData] = useState(null);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [payslipError, setPayslipError] = useState(null);

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

  // Function to handle generating payslip
  const handleGeneratePayslip = async (employee) => {
    setSelectedEmployee(employee);
    setShowPayslipView(true);
    setPayslipLoading(true);
    setPayslipError(null);
    
    try {
      const response = await fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-calculation/?employee_id=${employee.emp_id}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setPayslipData(data.data[0]);
      } else {
        setPayslipError("No salary calculation data found for this employee.");
      }
    } catch (e) {
      setPayslipError(e.message);
      console.error("Failed to fetch payslip data:", e);
    } finally {
      setPayslipLoading(false);
    }
  };
  
  // Function to go back to employee list
  const handleBackToList = () => {
    setSelectedEmployee(null);
    setShowPayslipView(false);
    setPayslipData(null);
  };

  // Function to print payslip
  const handlePrintPayslip = () => {
    const printContent = document.getElementById('payslip-content');
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
      <head>
        <title>Payslip</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .payslip-header { text-align: center; margin-bottom: 20px; }
          .payslip-header h2 { margin-bottom: 5px; }
          .payslip-info { margin-bottom: 20px; }
          .payslip-section { margin-bottom: 20px; }
          .payslip-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .payslip-table th, .payslip-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .payslip-table th { background-color: #f2f2f2; }
          .payslip-summary { display: flex; justify-content: space-between; margin-top: 20px; }
          .payslip-signature { margin-top: 50px; text-align: right; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
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

  // If showing payslip view, render the Payslip component
  if (showPayslipView && selectedEmployee) {
    return (
      <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content" style={{ height: '100vh', overflow: 'auto' }}>
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Employee Payslip</h2>
              <div>
                <Button variant="secondary" className="me-2" onClick={handleBackToList}>
                  Back to Employee List
                </Button>
                {payslipData && (
                  <Button variant="primary" onClick={handlePrintPayslip}>
                    <FaPrint /> Print Payslip
                  </Button>
                )}
              </div>
            </div>
            
            {payslipLoading && (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" />
              </div>
            )}
            
            {payslipError && (
              <Alert variant="danger">
                Failed to load payslip data: {payslipError}
              </Alert>
            )}
            
            {payslipData && (
              <div id="payslip-content">
                <Card className="mb-4">
                  <Card.Header className="payslip-header">
                    <h2>PAYSLIP</h2>
                    <p>For the month of {new Date(payslipData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </Card.Header>
                  <Card.Body>
                    <Row className="payslip-info">
                      <Col md={6}>
                        <p><strong>Employee ID:</strong> {selectedEmployee.emp_id}</p>
                        <p><strong>Employee Name:</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                        <p><strong>Department:</strong> {selectedEmployee.department || "N/A"}</p>
                        <p><strong>Designation:</strong> {selectedEmployee.designation || "N/A"}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Email:</strong> {selectedEmployee.email || "N/A"}</p>
                        <p><strong>Mobile:</strong> {selectedEmployee.phone || "N/A"}</p>
                        <p><strong>Payslip Status:</strong> 
                          <Badge bg={payslipData.status === 'confirmed' ? "success" : "warning"} className="ms-2">
                            {payslipData.status === 'confirmed' ? 'Confirmed' : 'Unconfirmed'}
                          </Badge>
                        </p>
                        <p><strong>Prorated:</strong> {payslipData.is_prorated ? 'Yes' : 'No'}</p>
                      </Col>
                    </Row>
                    
                    <div className="payslip-section">
                      <h4>Earnings</h4>
                      <table className="payslip-table">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Basic Salary</td>
                            <td>₹{parseFloat(payslipData.basic_salary).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>HRA</td>
                            <td>₹{parseFloat(payslipData.hra).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>DA</td>
                            <td>₹{parseFloat(payslipData.da).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>TA</td>
                            <td>₹{parseFloat(payslipData.ta).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Medical Allowance</td>
                            <td>₹{parseFloat(payslipData.medical_allowance).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Special Allowance</td>
                            <td>₹{parseFloat(payslipData.special_allowance).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Marketing Perks</td>
                            <td>₹{parseFloat(payslipData.marketing_perks).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Performance Bonus</td>
                            <td>₹{parseFloat(payslipData.performance_bonus).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Client Bonus</td>
                            <td>₹{parseFloat(payslipData.client_bonus).toFixed(2)}</td>
                          </tr>
                          <tr className="table-active">
                            <td><strong>Total Earnings</strong></td>
                            <td><strong>₹{parseFloat(payslipData.total_earnings).toFixed(2)}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="payslip-section">
                      <h4>Deductions</h4>
                      <table className="payslip-table">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>PF</td>
                            <td>₹{parseFloat(payslipData.pf).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>ESI</td>
                            <td>₹{parseFloat(payslipData.esi).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>TDS</td>
                            <td>₹{parseFloat(payslipData.tds).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Other Deductions</td>
                            <td>₹{parseFloat(payslipData.other_deductions).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Unpaid Leave Deduction</td>
                            <td>₹{parseFloat(payslipData.unpaid_leave_deduction).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Maternity Leave Deduction</td>
                            <td>₹{parseFloat(payslipData.maternity_leave_deduction).toFixed(2)}</td>
                          </tr>
                          <tr className="table-active">
                            <td><strong>Total Deductions</strong></td>
                            <td><strong>₹{parseFloat(payslipData.total_deductions).toFixed(2)}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="payslip-summary">
                      <div>
                        <h4>Summary</h4>
                        <p><strong>Monthly Salary:</strong> ₹{parseFloat(payslipData.monthly_salary).toFixed(2)}</p>
                        <p><strong>Net Salary:</strong> ₹{parseFloat(payslipData.net_salary).toFixed(2)}</p>
                        <p><strong>Earned Leave Balance:</strong> {payslipData.earned_leave_balance} days</p>
                        <p><strong>EL Value:</strong> ₹{parseFloat(payslipData.el_value).toFixed(2)}</p>
                      </div>
                      <div>
                        <h4>Additional Information</h4>
                        <p><strong>Prorated Days:</strong> {payslipData.prorated_days}</p>
                        <p><strong>Prorated Explanation:</strong> {payslipData.prorated_explanation}</p>
                        <p><strong>EL Value at Year End:</strong> ₹{parseFloat(payslipData.el_value_at_year_end).toFixed(2)}</p>
                        <p><strong>Total Payout Including EL:</strong> ₹{parseFloat(payslipData.total_payout_including_el).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="payslip-signature">
                      <p>_________________________</p>
                      <p>Authorized Signature</p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Container>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    const columnsToRemove = [1, 9]; // Photo (1), Action (9)
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
      return {
        "S.No": index + 1,
        "Employee ID": emp.emp_id,
        "Employee Name": `${emp.first_name} ${emp.last_name}`,
        "Department": emp.department,
        "Designation": emp.designation,
        "Email": emp.email,
        "Mobile": emp.phone,
        "Status": emp.is_active ? "Active" : "Inactive"
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
                        <th>Action</th>
                      </tr>
 
                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((emp, index) => {
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
                              <td data-th="Action">
                                <Button 
                                  className="big-edit-btn"
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleGeneratePayslip(emp)}
                                >
                                  <AiFillEdit /> Generate Payslip
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center">
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

export default PayslipGenerator;