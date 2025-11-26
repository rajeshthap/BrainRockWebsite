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
    fetchLeaveData();
    if (isHRorManager) {
      fetchAllLeaveData();
    }
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setLeaveBalance(response.data.leave_balance);
      setLeaveHistory(response.data.leave_history);
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
      
      // Process the data to extract all leave balances and histories
      if (response.data.employees) {
        // For all leave balances
        setAllLeaveBalances(response.data.employees);
        
        // For all leave histories, we need to fetch each employee's history
        const histories = [];
        for (const emp of response.data.employees) {
          try {
            const empHistoryResponse = await axios.get(
              `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${emp.employee_id}`
            );
            if (empHistoryResponse.data.leave_history) {
              histories.push(...empHistoryResponse.data.leave_history.map(item => ({
                ...item,
                employee_name: emp.employee_name,
                employee_id: emp.employee_id
              })));
            }
          } catch (err) {
            console.error(`Error fetching history for ${emp.employee_id}:`, err);
          }
        }
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
    const fetchEmployeeData = async () => {
      try {
        const apiURL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${employee_id}`;
        const res = await axios.get(apiURL, { withCredentials: true });

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

    fetchEmployeeData();
  }, [employee_id]);

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

      const payload = {
       leave_request_id: selectedLeave.id,
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
                              <th>Status</th>
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
                                  <td>{item.employee_id}</td>
                                  <td>{item.employee_name}</td>
                                  <td>
                                    <Badge 
                                      bg={item.status === "approved" ? "success" : "warning"}
                                      className="status-badge"
                                    >
                                      {item.status.replace("_", " ").toUpperCase()}
                                    </Badge>
                                  </td>
                                  <td>{item.casual_leave}</td>
                                  <td>{item.earned_leave}</td>
                                  <td>{item.paid_leave}</td>
                                  <td>{item.maternity_leave}</td>
                                  <td>{item.paternity_leave}</td>
                                  <td>{item.without_pay}</td>
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
                                <td>{item.employee_name}</td>
                              )}

                              <td>
                                {activeTab === "myLeaves" 
                                  ? `${employee.first_name} ${employee.last_name}`
                                  : item.employee_name
                                }
                              </td>

                              <td>{employee.department || "N/A"}</td>
                              <td>{employee.phone || "N/A"}</td>

                              <td>{item.leave_type.replace("_", " ").toUpperCase()}</td>
                              <td>{item.dates.join(", ")}</td>
                              <td>{item.leave_days}</td>
                              <td>{item.reason}</td>

                              <td>
                                <div className="leave-app">
                                  {getStatusBadge(item.status)}
                                </div>
                              </td>

                              <td>{item.approved_by || "—"}</td>

                              <td>{new Date(item.created_at).toLocaleString()}</td>

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