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

const LeaveStatus = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  
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

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchLeaveData();
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

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        console.log("Fetching employee details for ID:", employee_id);

        const apiURL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${employee_id}`;
        console.log("API URL:", apiURL);

        const res = await axios.get(apiURL, { withCredentials: true });

        console.log("Full API Response:", res.data);

        // FIXED: API returns fields directly, not inside res.data.employee
        const extractedEmployee = {
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          department: res.data.department || "",
          phone: res.data.phone || "",
        };

        console.log("Extracted Employee Data:", extractedEmployee);

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
        leave_id: selectedLeave.id,
        action: actionType, // "approve", "reject", or "cancel"
        employee_id: employee_id,
      };

      await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-action/",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update the leave status in the local state
      const updatedHistory = leaveHistory.map((item) => {
        if (item.id === selectedLeave.id) {
          return {
            ...item,
            status: actionType === "approve" ? "approved" : 
                   actionType === "reject" ? "rejected" : "cancelled"
          };
        }
        return item;
      });

      setLeaveHistory(updatedHistory);
      
      // Show success notification
      showNotification(
        `Leave request ${actionType === "approve" ? "approved" : 
                        actionType === "reject" ? "rejected" : "cancelled"} successfully!`,
        "success"
      );
      
      // Close modal
      setShowModal(false);
      setSelectedLeave(null);
      setActionType("");
      
      // Refresh data
      fetchLeaveData();
    } catch (error) {
      console.error("Error updating leave status:", error);
      showNotification("Failed to update leave status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (leave) => {
    // If the leave is not pending, don't show any action buttons
    if (leave.status !== "pending") {
      return <span>-</span>;
    }
    
    // If HR or Manager is logged in, show Accept and Reject buttons
    if (isHRorManager) {
      return (
        <div className="action-buttons">
          <Button
            variant="success"  className="suc-st-btn me-2"
            size="sm"
            onClick={() => handleAction(leave, "approve")}
            
          >
            <FaCheckCircle className="me-1" />  Accept
          </Button>
          <div className="mt-3">
          <Button
            variant="danger" className="reject-st-btn"
            size="sm"
            onClick={() => handleAction(leave, "reject")}
          >
           <FaTimesCircle className="me-1" />  Reject
          </Button>
          </div>
        </div>
      );
    }
    
    // If employee is logged in, show "Pending" status
    return (
      <Badge bg="warning" className="status-badge leave-app-pending">
        <FaHourglassHalf className="me-1  " />Pending
      </Badge>
    );
  };

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container leave-his">
            <h4>Leave Balance</h4>
            {loading ? (
              <div className="text-center mt-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                {/* ================================  
                    LEAVE BALANCE CARDS  
                ================================= */}
                {leaveBalance && (
                  <Row className="mt-4">
                    <Col md={3} className="">
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Casual Leave</h5>
                            <h2 className="text-primary">
                              {leaveBalance.casual_leave}
                            </h2>
                          </div>

                          <FaCalendarCheck className="leave-icon text-primary" />
                        </div>
                      </Card>
                    </Col>

                    <Col md={3} className="leave-mob">
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Earned Leave</h5>
                            <h2 className="text-success">
                              {leaveBalance.earned_leave}
                            </h2>
                          </div>

                          <FaWalking className="leave-icon text-success" />
                        </div>
                      </Card>
                    </Col>

                    <Col md={3} className="leave-mob">
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Paid Leave</h5>
                            <h2 className="text-warning">
                              {leaveBalance.paid_leave}
                            </h2>
                          </div>

                          <FaChild className="leave-icon text-warning" />
                        </div>
                      </Card>
                    </Col>

                    <Col md={3} className="leave-mob">
                      <Card className="p-3 shadow-sm leave-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="leave-heading">
                            <h5>Maternity Leave</h5>
                            <h2 className="text-danger">
                              {leaveBalance.maternity_leave}
                            </h2>
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
                            <h2 className="text-secondary">
                              {leaveBalance.paternity_leave}
                            </h2>
                          </div>

                          <FaMale className="leave-icon text-secondary" />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* ================================  
                    LEAVE HISTORY TABLE  
                ================================= */}
                <Row className="mt-5">
                  <div className="col-md-12 leave-his">
                    <h4 className="mb-3">Leave Request History</h4>

                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
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

                        {leaveHistory.length > 0 ? (
                          leaveHistory.map((item, index) => (
                            <tr key={item.id}>
                              <td data-th="S.No">{index + 1}</td>

                              <td data-th="Name">
                                {employee.first_name} {employee.last_name}
                              </td>

                              <td data-th="Department">
                                {employee.department || "N/A"}
                              </td>

                              <td data-th="Phone">
                                {employee.phone || "N/A"}
                              </td>

                              <td data-th="Leave Type">
                                {item.leave_type.replace("_", " ").toUpperCase()}
                              </td>
                              <td data-th="Dates">{item.dates.join(", ")}</td>
                              <td data-th="Days">{item.leave_days}</td>
                              <td data-th="Reason">{item.reason}</td>
                              <td data-th="Status">
                                <div className="leave-app">
                                  <span>{getStatusBadge(item.status)}</span>
                                </div>
                              </td>
                              <td data-th="Approved By">{item.approved_by || "—"}</td>
                              <td data-th="Applied On">
                                {new Date(item.created_at).toLocaleString()}
                              </td>
                              <td data-th="Actions">
                                {getActionButton(item)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="12" className="text-center">
                              No leave applications found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Confirmation Modal */}
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
            variant={actionType === "approve" ? "success" : actionType === "reject" ? "danger" : "secondary"} 
            onClick={confirmAction}
            disabled={loading}
          >
            {loading ? "Processing..." : `Yes, ${actionType}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default LeaveStatus;