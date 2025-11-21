import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

import { FaUserCheck, FaUserTimes, FaHourglassHalf } from "react-icons/fa";
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
  const [leaveHistory, setLeaveHistory] = useState([]);
 
 

  const employee_id = user?.unique_id;
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const API_URL =
    `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`;

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

  const getStatusBadge = (status) => {
    if (status === "approved")
      return (
        <Badge bg="success" className="status-badge">
          <FaUserCheck className="me-1" />
          Approved
        </Badge>
      );

    if (status === "rejected")
      return (
        <Badge bg="danger" className="status-badge">
          <FaUserTimes className="me-1" />
          Rejected
        </Badge>
      );

    return (
      <Badge bg="warning" className="status-badge">
        <FaHourglassHalf className="me-1" />
        Pending
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
            <h4>Leave Belance</h4>
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
    <h4 className="mb-3">Leave History</h4>

    <table className="temp-rwd-table">
      <tbody>
        <tr>
          <th>S.No</th>
          <th>Leave Type</th>
          <th>Dates</th>
          <th>Days</th>
          <th>Reason</th>
          <th>Status</th>
          <th>Approved By</th>
          <th>Applied On</th>
        </tr>

        {leaveHistory.length > 0 ? (
          leaveHistory.map((item, index) => (
            <tr key={item.id}>
              <td data-th="S.No">{index + 1}</td>
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
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="text-center">
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
    </div>
  );
};

export default LeaveManagement;
