import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const LeaveHistory = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [employee, setEmployee] = useState({
    first_name: "",
    last_name: "",
    department: "",
    phone: "",
  });

  const employee_id = user?.unique_id;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const API_URL = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`;

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  // Fetch Leave History Only
  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setLeaveHistory(response.data.leave_history);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave history:", error);
      setLoading(false);
    }
  };

  // Fetch Employee Details
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const apiURL =
          `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${employee_id}`;

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

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container leave-his">
            <h4>Leave History</h4>

            {loading ? (
              <div className="text-center mt-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                {/* ================================  
                    LEAVE HISTORY TABLE ONLY  
                ================================= */}

                <Row className="mt-4">
                  <div className="col-md-12 leave-his">
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
                          <th>Approved By</th>
                          <th>Applied On</th>
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

                              <td data-th="Approved By">
                                {item.approved_by || "—"}
                              </td>

                              <td data-th="Applied On">
                                {new Date(item.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="text-center">
                              No leave history found.
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

export default LeaveHistory;
