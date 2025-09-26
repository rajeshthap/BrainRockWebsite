import React, { useEffect, useState } from "react";
import "../../assets/css/LeftNav.css";
import axios from "axios";
// import "../../../assets/CSS/DashBoard.css";
import { useNavigate } from "react-router-dom";

import {
  Card,
  Spinner,
  Container,
  Row,
  Col,
  Button,
  Table,
  Form,
  Alert,
} from "react-bootstrap";
import { FaHandsPraying } from "react-icons/fa6";
import { Link } from "react-router-dom";
import LeftNav from "./LeftNav";

const InnerDashBoard = () => {
      const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterType, setFilterType] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
 
 
 
 
 
 
  const formatIndianDateTime = (dateString) => {
    if (!dateString) return "-";
 
    // Ensure it's a string
    const strDate = String(dateString);
 
    // Remove trailing "Z" if present
    const cleanDateString = strDate.endsWith("Z")
      ? strDate.slice(0, -1)
      : strDate;
 
    const istDate = new Date(cleanDateString);
 
    return istDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
 
 
 
  //  Function to set row background color based on login time
  const getRowColor = (dateString) => {
    if (!dateString) return "";
 
    const date = new Date(
      new Date(dateString).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const totalMinutes = date.getHours() * 60 + date.getMinutes();
 
    const startGreen = 10 * 60; // 10:00
    const endGreen = 10 * 60 + 10; // 10:10
    const endOrange = 10 * 60 + 15; // 10:15
 
    if (totalMinutes >= startGreen && totalMinutes <= endGreen) {
      return "table-success"; //  green row
    } else if (totalMinutes > endGreen && totalMinutes <= endOrange) {
      return "table-warning"; //  orange row
    } else if (totalMinutes > endOrange) {
      return "table-danger"; //  red row
    }
    return "";
  };
  // Count colored logs
const getLogColorCounts = (logs) => {
  let counts = { green: 0, orange: 0, red: 0 };
 
  logs.forEach((log) => {
    const color = getRowColor(log.login_time || log.date || log.created_at);
    if (color === "table-success") counts.green++;
    else if (color === "table-warning") counts.orange++;
    else if (color === "table-danger") counts.red++;
  });
 
  return counts;
};
 
 
 
 
 
  //  Current IST time
  const getCurrentTime = () => {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };
 
  //  Filter logs by Weekly / Monthly / Yearly
  const filterLogs = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
 
    const now = new Date();
 
    return data.filter((log) => {
      //  Use the correct field name from your API
      const logDate = new Date(log.login_time || log.date || log.created_at);
 
      console.log("Processing log date:", log.login_time, "Parsed (IST):", formatIndianDateTime(log.login_time || log.date || log.created_at));
 
      if (type === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        console.log("Week filter - Log date (IST):", formatIndianDateTime(log.login_time), "Week ago (IST):", formatIndianDateTime(weekAgo), "Passes:", logDate >= weekAgo);
        return logDate >= weekAgo;
      } else if (type === "monthly") {
        const passes = logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear();
        console.log("Month filter - Log (IST):", formatIndianDateTime(log.login_time), "Current Month:", now.getMonth() + 1, "Passes:", passes);
        return passes;
      } else if (type === "yearly") {
        const passes = logDate.getFullYear() === now.getFullYear();
        console.log("Year filter - Log (IST):", formatIndianDateTime(log.login_time), "Current Year:", now.getFullYear(), "Passes:", passes);
        return passes;
      }
      return true;
    });
  };
 
  useEffect(() => {
    const userId = localStorage.getItem("autoId");
 
    if (!userId) {
      setError("No User ID found. Please login again.");
      alert("No User ID found");
      setLoading(false);
      navigate("/");
      return;
    }
 
    const fetchUserData = async () => {
      try {
     
 
        //  Fetch Attendance Logs
        const logRes = await axios.get(
          `https://brjobsedu.com/Attendence_portal/api/login/${userId}/`
        );
 
        const logsData = logRes.data;
 
        // Debug information
        console.log("API Response:", logsData);
        console.log("Type of response:", typeof logsData);
        console.log("Is array:", Array.isArray(logsData));
 
        // Check if the response is an array or if data is nested
        let processedLogs = [];
        if (Array.isArray(logsData)) {
          processedLogs = logsData;
        } else if (logsData && typeof logsData === 'object') {
          // Check common nested structures
          if (logsData.data && Array.isArray(logsData.data)) {
            processedLogs = logsData.data;
          } else if (logsData.results && Array.isArray(logsData.results)) {
            processedLogs = logsData.results;
          } else if (logsData.logs && Array.isArray(logsData.logs)) {
            processedLogs = logsData.logs;
          } else {
            console.warn("Unexpected API response structure:", logsData);
            processedLogs = [];
          }
        } else {
          console.warn("API returned non-object/non-array:", logsData);
          processedLogs = [];
        }
 
        setLogs(processedLogs);
 
        //  Initialize filtered logs with default filter
        const initialFilteredLogs = filterLogs(processedLogs, filterType);
        setFilteredLogs(initialFilteredLogs);
 
        console.log("Processed logs:", processedLogs);
        console.log("Filtered logs:", initialFilteredLogs);
 
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
 
    fetchUserData();
  }, [navigate]);
 
  //  Separate useEffect to handle logs state changes
  useEffect(() => {
    if (logs.length > 0) {
      const filtered = filterLogs(logs, filterType);
      setFilteredLogs(filtered);
      console.log("Filter applied:", filterType);
      console.log("Filtered results:", filtered);
    }
  }, [logs, filterType]);
 
  //  Handle Filter Change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterType(value);
  };
    const colorCounts = getLogColorCounts(filteredLogs);
 
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
 
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading Dashboard...</span>
      </div>
    );
  }
 
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }
    return (
        <>
            {/* Main Wrapper */}
            <div className="dashboard-wrapper">
                {/* Sidebar */}
                <aside className="sidebar">
                    <LeftNav />
                </aside>

                {/* Right-hand Main Container */}
                <main className="main-container">
                    <div className="content-box">

 
      {/*  Attendance / Log History */}
     
        <Row className="mb-3">
          <Col>
            <h4 className="fw-bold">
              Attendance / Log History
              <small className="text-muted">({filteredLogs.length} records)</small>
            </h4>
            <p className="text-muted mb-0">
              <strong>Current Time (IST):</strong> {getCurrentTime()}
            </p>
          </Col>
          <Col className="text-end">
            <Form.Select
              value={filterType}
              onChange={handleFilterChange}
              style={{ width: "200px", display: "inline-block" }}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </Form.Select>
             <span className="badge bg-success me-2">
              Green: {colorCounts.green}
            </span>
            <span className="badge bg-warning text-dark me-2">
              Orange: {colorCounts.orange}
            </span>
            <span className="badge bg-danger">
              Red: {colorCounts.red}
            </span>
          </Col>
        </Row>
 
        {filteredLogs.length > 0 ? (
          <Table bordered hover responsive striped>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Login Date & Time (IST)</th>
                <th>Mode</th>
                <th>Reason</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log.id || index}
                  className={getRowColor(log.login_time || log.date || log.created_at)} //  Apply row color
 
                >
                  <td>{index + 1}</td>
                  <td>
                    <div>
                      <strong>{formatIndianDateTime(log.login_time || log.date || log.created_at)}</strong>
                    </div>
                  </td>
 
                  <td>
                    <span className={`badge ${log.Mode === 'On-office' ? 'bg-success' :
                        log.Mode === 'WCD' ? 'bg-primary' :
                          log.Mode === 'WFH' ? 'bg-info' :
                            log.Mode === 'Break' ? 'bg-warning' :
                              log.Mode === 'Check Out' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                      {log.Mode}
                    </span>
                  </td>
                  <td>{log.Reason_query || "-"}</td>
                  <td>
                    <small className="text-muted">
                      📍 {log.live_location || "Not specified"}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            </div>
            <h5 className="text-muted">No logs available for this period</h5>
            <p className="text-muted">
              Try selecting a different time period or check back later.
            </p>
          </div>
        )}
     

                      
                    </div>
                </main>
            </div>
        </>
    );
};

export default InnerDashBoard;
