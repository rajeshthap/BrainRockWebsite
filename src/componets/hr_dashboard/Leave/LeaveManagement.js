import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Modal,
  Tabs,
  Tab,
  Form,
  Pagination,
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FaUserCheck, FaUserTimes, FaHourglassHalf, FaTimesCircle, FaCheckCircle, FaSearch, FaFilter } from "react-icons/fa";
import {
  FaChild,
  FaFemale,
  FaMale,
  FaWalking,
  FaCalendarCheck,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";

const LeaveManagement = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [allLeaveBalances, setAllLeaveBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [allLeaveHistory, setAllLeaveHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [activeTab, setActiveTab] = useState("myLeaves");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage] = useState(3); 
  const [employee, setEmployee] = useState({
    first_name: "",
    last_name: "",
    department: "",
    phone: "",
  });
  
  // State for employee gender
  const [employeeGender, setEmployeeGender] = useState("");

  const employee_id = user?.unique_id;
  const empId = user?.unique_id;
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`;
  const ALL_API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/`;
  const EMPLOYEE_API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${employee_id}`;
  const GENDER_API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-gender-salary/?employee_id=${employee_id}`;

  // ========================================
  // NOTIFICATION
  // ========================================
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // ========================================
  // FETCH EMPLOYEE GENDER
  // ========================================
  const fetchEmployeeGender = async () => {
    if (!GENDER_API_URL) return;
    
    try {
      const response = await axios.get(GENDER_API_URL, { withCredentials: true });
      
      if (response.data && response.data.data) {
        setEmployeeGender(response.data.data.gender || "");
      }
    } catch (error) {
      console.error("Error fetching employee gender:", error);
    }
  };

  // ========================================
  // FETCH LEAVE DATA
  // ========================================
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user && employee_id) {
      if (activeTab === "myLeaves") {
        fetchLeaveData();
        fetchEmployeeGender(); // Fetch gender data for my leaves tab
      }
      
      if (isHRorManager && activeTab === "allLeaves") {
        fetchAllLeaveData();
      }
    }
  }, [user, employee_id, activeTab]);

  const fetchLeaveData = async () => {
    if (!API_URL) return;
    
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      
      // Handle API response structure for individual employee
      if (response.data) {
        // Extract leave balance and history directly from response
        setLeaveBalance(response.data.leave_balance);
        setLeaveHistory(response.data.leave_history || []);
        
        // Also set employee name from leave_balance data
        if (response.data.leave_balance && response.data.leave_balance.employee_name) {
          const nameParts = response.data.leave_balance.employee_name.split(' ');
          setEmployee(prev => ({
            ...prev,
            first_name: nameParts[0] || prev.first_name,
            last_name: nameParts.slice(1).join(' ') || prev.last_name,
          }));
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave data:", error);
      setLoading(false);
    }
  };

  const fetchAllLeaveData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ALL_API_URL);
      
      // Process data to extract all leave balances and histories
      if (response.data && response.data.employees) {
        // For all leave balances
        const balances = response.data.employees.map(emp => emp.leave_balance);
        setAllLeaveBalances(balances);
        
        // For all leave histories
        const histories = [];
        response.data.employees.forEach(emp => {
          if (emp.leave_history && emp.leave_history.length > 0) {
            emp.leave_history.forEach(item => {
              histories.push({
                ...item,
                employee_name: emp.leave_balance.employee_name,
                employee_id: emp.employee
              });
            });
          }
        });
        setAllLeaveHistory(histories);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all leave data:", error);
      setLoading(false);
    }
  };

  // ========================================
  // FETCH EMPLOYEE DATA
  // ========================================
  useEffect(() => {
    if (user && employee_id) {
      fetchEmployeeData();
    }
  }, [user, employee_id]);

  const fetchEmployeeData = async () => {
    if (!EMPLOYEE_API_URL) return;
    
    try {
      const res = await axios.get(EMPLOYEE_API_URL, { withCredentials: true });

      const extractedEmployee = {
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        department: res.data.department || "",
        phone: res.data.phone || "",
      };

      setEmployee(extractedEmployee);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const isHRorManager =
    user?.role?.toLowerCase() === "hr" ||
    user?.role?.toLowerCase() === "manager";

  // ========================================
  // FILTERING LOGIC
  // ========================================
  const filterLeaveData = (data) => {
    let filteredData = [...data];
    
    // Filter by status
    if (statusFilter !== "all") {
      filteredData = filteredData.filter(item => 
        item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter by time period
    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filteredData = filteredData.filter(item => {
        if (!item.created_at) return false;
        
        const createdDate = new Date(item.created_at);
        
        switch (timeFilter) {
          case "weekly":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate >= weekAgo;
            
          case "monthly":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return createdDate >= monthAgo;
            
          case "yearly":
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return createdDate >= yearAgo;
            
          default:
            return true;
        }
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => {
        // Check employee name
        if (activeTab === "allLeaves" && item.employee_name) {
          if (item.employee_name.toLowerCase().includes(term)) return true;
        }
        
        // Check leave type
        if (item.leave_type && item.leave_type.toLowerCase().includes(term)) return true;
        
        // Check reason
        if (item.reason && item.reason.toLowerCase().includes(term)) return true;
        
        // Check dates
        if (item.dates && Array.isArray(item.dates)) {
          const datesStr = item.dates.join(", ").toLowerCase();
          if (datesStr.includes(term)) return true;
        }
        
        return false;
      });
    }
    
    return filteredData;
  };

  // ========================================
  // STATUS BADGE
  // ========================================
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();

    if (s === "approved")
      return (
        <Badge bg="success" className="status-badge">
          <FaUserCheck className="" /> Approved
        </Badge>
      );

    if (s === "rejected")
      return (
        <Badge bg="danger" className="status-badge">
          <FaUserTimes className="" /> Rejected
        </Badge>
      );

    return (
      <Badge bg="warning" className="status-badge">
        <FaHourglassHalf className="me-1" /> Pending
      </Badge>
    );
  };

  // ========================================
  // APPROVE / REJECT ACTION
  // ========================================
  const handleAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedLeave) return;

    try {
      setLoading(true);

      // Convert ID to string to match API requirements
      const payload = {
        leave_request_id: String(selectedLeave.id),
        action: actionType,
      };

      await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leaves-approve/",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update the appropriate history based on the active tab
      if (activeTab === "myLeaves") {
        const updatedHistory = leaveHistory.map((item) => {
          if (item.id === selectedLeave.id) {
            return {
              ...item,
              status:
                actionType === "approve"
                  ? "approved"
                  : actionType === "reject"
                  ? "rejected"
                  : "cancelled",
            };
          }
          return item;
        });
        setLeaveHistory(updatedHistory);
      } else {
        const updatedHistory = allLeaveHistory.map((item) => {
          if (item.id === selectedLeave.id) {
            return {
              ...item,
              status:
                actionType === "approve"
                  ? "approved"
                  : actionType === "reject"
                  ? "rejected"
                  : "cancelled",
            };
          }
          return item;
        });
        setAllLeaveHistory(updatedHistory);
      }

      showNotification(
        `Leave request ${
          actionType === "approve"
            ? "approved"
            : actionType === "reject"
            ? "rejected"
            : "cancelled"
        } successfully!`,
        "success"
      );

      setShowModal(false);
      setSelectedLeave(null);
      setActionType("");

      // Refresh data
      if (activeTab === "myLeaves") {
        fetchLeaveData();
      }
      
      if (isHRorManager && activeTab === "allLeaves") {
        fetchAllLeaveData();
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      showNotification("Failed to update leave status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };


  const handlePrint = () => {
  const actionColIndex = 11; // "Actions" column index (0-based)

  const table = document.querySelector(".temp-rwd-table").cloneNode(true);

  // Remove Action column
  table.querySelectorAll("tr").forEach((row) => {
    const cells = row.querySelectorAll("th, td");
    if (cells[actionColIndex]) cells[actionColIndex].remove();
  });

  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
    <html>
      <head>
        <title>Leave Records</title>
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
        <h2>Leave Records</h2>
        ${table.outerHTML}
      </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.print();
};

const handleDownload = () => {
  if (filteredData.length === 0) {
    window.alert("No leave records to download!");
    return;
  }

  const data = filteredData.map((item, index) => ({
    "S.No": index + 1,
    "Employee Name":
      activeTab === "myLeaves"
        ? `${employee.first_name} ${employee.last_name}`.trim()
        : item.employee_name || "N/A",
    "Department": employee.department || "N/A",
    "Phone": employee.phone || "N/A",
    "Leave Type": item.leave_type ? item.leave_type.replace(/_/g, " ").toUpperCase() : "N/A",
    "Dates": item.dates?.join(", ") || "N/A",
    "Days": item.leave_days || "N/A",
    "Reason": item.reason || "N/A",
    "Status": item.status || "N/A",
    "Approved By": item.approved_by || "—",
    "Applied On": item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const range = XLSX.utils.decode_range(ws["!ref"]);

  // Style header row (same as your original)
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
    { wch: 25 },  // Employee Name
    { wch: 20 },  // Department
    { wch: 15 },  // Phone
    { wch: 20 },  // Leave Type
    { wch: 25 },  // Dates
    { wch: 8 },   // Days
    { wch: 30 },  // Reason
    { wch: 15 },  // Status
    { wch: 20 },  // Approved By
    { wch: 22 },  // Applied On
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leave Records");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Leave_Records.xlsx");
};


  const getActionButton = (leave) => {
    // Only show action buttons in the "All Leaves" tab for HR/Manager
    if (leave.status !== "pending" || activeTab !== "allLeaves") return <span>-</span>;

    if (isHRorManager && activeTab === "allLeaves") {
      return (
        <div className="action-buttons">
          <Button
            variant="success"
            className="suc-st-btn"
            size="sm"
            onClick={() => handleAction(leave, "approve")}
          >
            <FaCheckCircle className="" /> Accept
          </Button>

          <div className="mt-3">
            <Button
              variant="danger"
              className="reject-st-btn"
              size="sm"
              onClick={() => handleAction(leave, "reject")}
            >
              <FaTimesCircle className="" /> Reject
            </Button>
          </div>
        </div>
      );
    }

    // For "My Leaves" tab, show only the status badge
    return (
      <Badge bg="warning" className="status-badge leave-app-pending">
        <FaHourglassHalf className="me-1" /> Pending
      </Badge>
    );
  };

  // ========================================
  // PAGINATION
  // ========================================
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  // Get current data based on active tab
  const currentData = activeTab === "myLeaves" ? leaveHistory : allLeaveHistory;
  
  // Apply filters to the data
  const filteredData = filterLeaveData(currentData);
  
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const goToPage = (page) => setCurrentPage(page);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, timeFilter, searchTerm]);

  // If user is not authenticated, show a message
  if (!user || !employee_id) {
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body">
            <div className="br-box-container leave-his">
              <div className="text-center mt-5">
                <h3>Please log in to view leave management</h3>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <Container fluid className="dashboard-body p-4">
          <div className="br-box-container leave-his">
            <div className="d-flex justify-content-between align-items-center mb-4 filter-wrapper mb-4">
              <h4 className="mb-0">Leave Management</h4>
              
              {/* Status Filter Dropdown */}
              <div className="d-flex align-items-center filter-controls">
                <span className="me-2 br-label-heading">Filter by Status:</span>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select br-dropdown"
                  style={{ width: '150px' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
                
                <span className="me-2 br-label-heading ms-3">Time Period:</span>
                <Form.Select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="br-dropdown"
                  style={{ width: '150px' }}
                >
                  <option value="all">All Time</option>
                  <option value="weekly">Last Week</option>
                  <option value="monthly">Last Month</option>
                  <option value="yearly">Last Year</option>
                </Form.Select>
              </div>
            </div>
               <div className="mt-2 vmb-2 text-end">
                          <Button variant="" size="sm" className="mx-2 print-btn" onClick={handlePrint}>
                            <FaPrint /> Print
                          </Button>
            
                          <Button variant="" size="sm" className="download-btn" onClick={handleDownload}>
                            <FaFileExcel />Download
                          </Button>
                        </div>

            {loading ? (
              <div className="text-center mt-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                {/* TABS FOR HR/MANAGER */}
                {isHRorManager && (
                  <Tabs
                    id="leave-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4 mt-4"
                  >
                    <Tab eventKey="myLeaves" title="My Leaves">
                      {/* Content for My Leaves tab */}
                    </Tab>
                    <Tab eventKey="allLeaves" title="All Leaves">
                      {/* Content for All Leaves tab */}
                    </Tab>
                  </Tabs>
                )}

                {/* CARDS - My Leave Balance */}
                {activeTab === "myLeaves" && leaveBalance && (
                  <Row className="mt-4">
                    <Col md={3}>
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Casual Leave</h5>
                            <h2 className="text-primary">{leaveBalance.casual_leave}</h2>
                          </div>
                          <FaCalendarCheck className="leave-icon text-primary" />
                        </div>
                      </Card>
                    </Col>

                    <Col md={3}>
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Earned Leave</h5>
                            <h2 className="text-success">{leaveBalance.earned_leave}</h2>
                          </div>
                          <FaWalking className="leave-icon text-success" />
                        </div>
                      </Card>
                    </Col>

                    <Col md={3}>
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Medical Leave</h5>
                            <h2 className="text-warning">{leaveBalance.paid_leave}</h2>
                          </div>
                          <FaChild className="leave-icon text-warning" />
                        </div>
                      </Card>
                    </Col>

                    {/* Conditional Maternity Leave Card - Only show for female employees */}
                    {employeeGender && employeeGender.toLowerCase() === "female" && (
                      <Col md={3}>
                        <Card className="p-3 shadow-sm leave-card">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="leave-heading">
                              <h5>Maternity Leave</h5>
                              <h2 className="text-danger">{leaveBalance.maternity_leave}</h2>
                            </div>
                            <FaFemale className="leave-icon text-danger" />
                          </div>
                        </Card>
                      </Col>
                    )}

                    {/* Conditional Paternity Leave Card - Only show for male employees */}
                    {employeeGender && employeeGender.toLowerCase() === "male" && (
                      <Col md={3} className="mt-3">
                        <Card className="p-3 shadow-sm leave-card">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="leave-heading">
                              <h5>Paternity Leave</h5>
                              <h2 className="text-secondary">{leaveBalance.paternity_leave}</h2>
                            </div>
                            <FaMale className="leave-icon text-secondary" />
                          </div>
                        </Card>
                      </Col>
                    )}
                  </Row>
                )}

                {/* ALL EMPLOYEES LEAVE BALANCE TABLE - For HR/Manager */}
                {isHRorManager && activeTab === "allLeaves" && (
                  <Row className="mt-4">
                    <div className="col-md-12 leave-his">
                      <h4 className="mb-3">All Employees Leave Balance</h4>
                      <div className="table-responsive">
                        <table className="temp-rwd-table">
                          <tbody>
                            <tr>
                              <th>Employee ID</th>
                              <th>Employee Name</th>
                              <th>Casual Leave</th>
                              <th>Earned Leave</th>
                              <th>Medical Leave</th>
                              <th>Maternity Leave</th>
                              <th>Paternity Leave</th>
                              <th>Without Pay</th>
                            </tr>
                            {allLeaveBalances.length > 0 ? (
                              allLeaveBalances.map((item, index) => (
                                <tr key={item.id || index}>
                                  <td data-th="Employee ID">{item.employee || "N/A"}</td>
                                  <td data-th="Employee Name">{item.employee_name || "N/A"}</td>
                                  <td data-th="Casual Leave">{item.casual_leave || "N/A"}</td>
                                  <td data-th="Earned Leave">{item.earned_leave || "N/A"}</td>
                                  <td data-th="Medical Leave">{item.paid_leave || "N/A"}</td>
                                  <td data-th="Maternity Leave">{item.maternity_leave || "N/A"}</td>
                                  <td data-th="Paternity Leave">{item.paternity_leave || "N/A"}</td>
                                  <td data-th="Without Pay">{item.without_pay || "N/A"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="9" className="text-center">
                                  No leave balance data found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Row>
                )}

                {/* HISTORY TABLE */}
                <Row className="mt-3">
                  <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                      <h4 className="mb-0">
                        {activeTab === "myLeaves" ? "My Leave Request History" : "All Leave Requests"}
                      </h4>
                      <div className=" total-records-box">
                        Total: <span>{filteredData.length} records</span>
                      </div>
                    </div>

                    {/* TABLE WITH MOBILE RESPONSIVE STRUCTURE */}
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          {isHRorManager && activeTab === "allLeaves" && <th>Employee Name</th>}
                          <th>Name</th>
                          <th>Department</th>
                          <th>Phone</th>
                          <th>Leave Type</th>
                          <th>Dates</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Approved By</th>
                          <th>Applied On</th>
                          <th>Actions</th>
                        </tr>

                        {currentRows.length > 0 ? (
                          currentRows.map((item, index) => (
                            <tr key={item.id}>
                              <td data-th="S.No">{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                              
                              {isHRorManager && activeTab === "allLeaves" && (
                                <td data-th="Employee Name">{item.employee_name || "N/A"}</td>
                              )}

                              <td data-th="Name">
                                {activeTab === "myLeaves" 
                                  ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim() || "N/A"
                                  : item.employee_name || "N/A"
                                }
                              </td>

                              <td data-th="Department">{employee.department || "N/A"}</td>
                              <td data-th="Phone">{employee.phone || "N/A"}</td>

                              <td data-th="Leave Type">{item.leave_type ? item.leave_type.replace(/_/g, " ").toUpperCase() : "N/A"}</td>
                              <td data-th="Dates">{item.dates && Array.isArray(item.dates) ? item.dates.join(", ") : "N/A"}</td>
                              <td data-th="Days">{item.leave_days || "N/A"}</td>
                              <td data-th="Reason">{item.reason || "N/A"}</td>

                              <td data-th="Status">
                                <div className="leave-app">
                                  {getStatusBadge(item.status)}
                                </div>
                              </td>

                              <td data-th="Approved By">{item.approved_by || "—"}</td>

                              <td data-th="Applied On">{item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</td>

                              <td data-th="Actions">{getActionButton(item)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isHRorManager && activeTab === "allLeaves" ? "13" : "12"} className="text-center">
                              No leave applications found matching your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {/* PAGINATION CONTROLS - SAME AS EMPLIST */}
                    {filteredData.length > itemsPerPage && (
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
                  </div>
                </Row>
              </>
            )}
          </div>
        </Container>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {actionType} this leave request?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={
              actionType === "approve"
                ? "success"
                : actionType === "reject"
                ? "danger"
                : "secondary"
            }
            onClick={confirmAction}
            disabled={loading}
          >
            {loading ? "Processing..." : `Yes, ${actionType}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* NOTIFICATION */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;