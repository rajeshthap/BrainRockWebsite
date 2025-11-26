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
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FaUserCheck, FaUserTimes, FaHourglassHalf, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import {
  FaChild,
  FaFemale,
  FaMale,
  FaWalking,
  FaCalendarCheck,
} from "react-icons/fa";

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

  const [employee, setEmployee] = useState({
    first_name: "",
    last_name: "",
    department: "",
    phone: "",
  });

  const employee_id = user?.unique_id;
  const empId = user?.unique_id;
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`;
  const ALL_API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/`;
  const EMPLOYEE_API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${employee_id}`;

  // ========================================
  // NOTIFICATION
  // ========================================
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // ========================================
  // FETCH LEAVE DATA
  // ========================================
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user && employee_id) {
      fetchLeaveData();
      if (isHRorManager) {
        fetchAllLeaveData();
      }
    }
  }, [user, employee_id]);

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
  // STATUS BADGE
  // ========================================
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();

    if (s === "approved")
      return (
        <Badge bg="success" className="status-badge">
          <FaUserCheck className="me-1" /> Approved
        </Badge>
      );

    if (s === "rejected")
      return (
        <Badge bg="danger" className="status-badge">
          <FaUserTimes className="me-1" /> Rejected
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

      alert(
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
      fetchLeaveData();
      if (isHRorManager) {
        fetchAllLeaveData();
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      showNotification("Failed to update leave status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (leave) => {
    if (leave.status !== "pending") return <span>-</span>;

    if (isHRorManager) {
      return (
        <div className="action-buttons">
          <Button
            variant="success"
            className="suc-st-btn me-2"
            size="sm"
            onClick={() => handleAction(leave, "approve")}
          >
            <FaCheckCircle className="me-1" /> Accept
          </Button>

          <div className="mt-3">
            <Button
              variant="danger"
              className="reject-st-btn"
              size="sm"
              onClick={() => handleAction(leave, "reject")}
            >
              <FaTimesCircle className="me-1" /> Reject
            </Button>
          </div>
        </div>
      );
    }

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
  const rowsPerPage = 5;

  // Get current data based on active tab
  const currentData = activeTab === "myLeaves" ? leaveHistory : allLeaveHistory;
  
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = currentData.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(currentData.length / rowsPerPage);

  const goToPage = (page) => setCurrentPage(page);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container leave-his">
            <h4>Leave Management</h4>

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
                            <h5>Paid Leave</h5>
                            <h2 className="text-warning">{leaveBalance.paid_leave}</h2>
                          </div>
                          <FaChild className="leave-icon text-warning" />
                        </div>
                      </Card>
                    </Col>

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
                              <th>Paid Leave</th>
                              <th>Maternity Leave</th>
                              <th>Paternity Leave</th>
                              <th>Without Pay</th>
                            </tr>
                            {allLeaveBalances.length > 0 ? (
                              allLeaveBalances.map((item, index) => (
                                <tr key={item.id || index}>
                                  <td>{item.employee || "N/A"}</td>
                                  <td>{item.employee_name || "N/A"}</td>
                                  <td>{item.casual_leave || "N/A"}</td>
                                  <td>{item.earned_leave || "N/A"}</td>
                                  <td>{item.paid_leave || "N/A"}</td>
                                  <td>{item.maternity_leave || "N/A"}</td>
                                  <td>{item.paternity_leave || "N/A"}</td>
                                  <td>{item.without_pay || "N/A"}</td>
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
                <Row className="mt-5">
                  <div className="col-md-12 leave-his">
                    <h4 className="mb-3">
                      {activeTab === "myLeaves" ? "My Leave Request History" : "All Leave Requests"}
                    </h4>

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
                              <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                              
                              {isHRorManager && activeTab === "allLeaves" && (
                                <td>{item.employee_name || "N/A"}</td>
                              )}

                              <td>
                                {activeTab === "myLeaves" 
                                  ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim() || "N/A"
                                  : item.employee_name || "N/A"
                                }
                              </td>

                              <td>{employee.department || "N/A"}</td>
                              <td>{employee.phone || "N/A"}</td>

                              <td>{item.leave_type ? item.leave_type.replace(/_/g, " ").toUpperCase() : "N/A"}</td>
                              <td>{item.dates && Array.isArray(item.dates) ? item.dates.join(", ") : "N/A"}</td>
                              <td>{item.leave_days || "N/A"}</td>
                              <td>{item.reason || "N/A"}</td>

                              <td>
                                <div className="leave-app">
                                  {getStatusBadge(item.status)}
                                </div>
                              </td>

                              <td>{item.approved_by || "—"}</td>

                              <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</td>

                              <td>{getActionButton(item)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isHRorManager && activeTab === "allLeaves" ? "13" : "12"} className="text-center">
                              No leave applications found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="m-0 pagination-title">Pages</h5>
                          <div className="pagination-container d-flex justify-content-end">
                            {[...Array(totalPages)].map((_, i) => (
                              <Button
                                key={i}
                                className={currentPage === i + 1 ? "br-page-no-active" : "br-page-no"}
                                onClick={() => goToPage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
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