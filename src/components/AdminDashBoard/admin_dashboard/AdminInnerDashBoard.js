import React, { useEffect, useState } from "react";
import {
  Accordion,
  Form,
  Badge,
  Row,
  Col,
  Table,
  Container,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/AdminLeftNav.css";
import axios from "axios";
// import "../../../assets/CSS/DashBoard.css";


import AdminLeftNav from "./AdminLeftNav";


const AdminInnerDashBoard = () => {

    const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

   //  Logout handler
  const handleLogout = () => {
    localStorage.clear(); // clear session storage
    sessionStorage.clear();
    navigate("/UserLogin"); // redirect to login
  };


  // Fetch attendance logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://brjobsedu.com/Attendence_portal/api/All_login/"
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Error fetching attendance logs:", error);
      }
    };

    fetchData();
  }, []);

  //  Convert backend UTC string into IST Date object
  const toISTDate = (dateString) => {
    if (!dateString) return null;

    const strDate = String(dateString);
    const cleanDateString = strDate.endsWith("Z")
      ? strDate.slice(0, -1)
      : strDate;

    return new Date(
      new Date(cleanDateString).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );
  };

  //  Format for displaying IST date/time in UI
  const formatIndianDateTime = (dateString) => {
    if (!dateString) return "-";
    const istDate = toISTDate(dateString);
    if (!istDate) return "-";

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

  //  Filter logs by IST time
  const filterByDate = (logs) => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    return logs.filter((log) => {
      const logDate = toISTDate(log.login_time); // IST date
      if (!logDate) return false;

      if (filter === "week") {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return logDate >= oneWeekAgo && logDate <= now;
      }

      if (filter === "month") {
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      }

      if (filter === "year") {
        return logDate.getFullYear() === now.getFullYear();
      }

      return true; // all
    });
  };

  // Group logs by user name
  const groupedByUser = attendanceData.reduce((acc, log) => {
    if (!acc[log.name]) acc[log.name] = [];
    acc[log.name].push(log);
    return acc;
  }, {});

  const getRowColor = (dateString) => {
    if (!dateString) return "";

    const date = new Date(
      new Date(dateString).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );
    const totalMinutes = date.getHours() * 60 + date.getMinutes();

    const startGreen = 10 * 60; // 10:00
    const endGreen = 10 * 60 + 10; // 10:10
    const endOrange = 10 * 60 + 15; // 10:15

    if (totalMinutes >= startGreen && totalMinutes <= endGreen) {
      return "green";
    } else if (totalMinutes > endGreen && totalMinutes <= endOrange) {
      return "orange";
    } else if (totalMinutes > endOrange) {
      return "red";
    }
    return "";
  };

  //  Count logs by color
  const getLogColorCounts = (logs) => {
    let counts = { green: 0, orange: 0, red: 0 };
    logs.forEach((log) => {
      const color = getRowColor(log.login_time);
      if (color && counts[color] !== undefined) {
        counts[color] += 1;
      }
    });
    return counts;
  };

  // Filter employees by name
  const filteredUsers = Object.keys(groupedByUser).filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
        <>
            {/* Main Wrapper */}
            <div className="dashboard-wrapper">
                {/* Sidebar */}
                <aside className="sidebar">
                    <AdminLeftNav />
                </aside>

                {/* Right-hand Main Container */}
                <main className="main-container">
                    <div className="content-box">

 
                       <Container fluid className="px-4" style={{ maxWidth: "100%" }}>
        <Row className="align-items-center mb-4 mt-3">
    <Col>
      <h2 className="fw-bold text-center">👨‍💼 Admin Dashboard</h2>
    </Col>
    <Col xs="auto">
      <Button
        className="btn btn-danger px-4 py-2 shadow-sm"
        onClick={handleLogout}
      >
        🚪 Logout
      </Button>
    </Col>
  </Row>

      <Row className="mb-4">
        {/* Search Bar */}
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Search employee by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 rounded-pill shadow-sm"
          />
        </Col>

        {/* Filter Dropdown */}
        <Col md={6}>
          <Form.Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 rounded-pill shadow-sm"
          >
            <option value="all">All Records</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Accordion per User */}
      <Accordion alwaysOpen className="w-100">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((userName, index) => {
            const filteredLogs = filterByDate(groupedByUser[userName]);
            const { green, orange, red } = getLogColorCounts(filteredLogs);

            return (
              <Accordion.Item
                eventKey={index.toString()}
                key={userName}
                className="w-100"
              >
                <Accordion.Header>
                  <span className="fw-bold">{userName}</span>{" "}
                  <Badge bg="secondary" className="ms-2">
                    {filteredLogs.length} Logs
                  </Badge>
                  {/* Color badges */}
                  <Badge bg="success" className="ms-2">
                    Green: {green}
                  </Badge>
                  <Badge bg="warning" className="ms-2 text-dark">
                    Orange: {orange}
                  </Badge>
                  <Badge bg="danger" className="ms-2">
                    Red: {red}
                  </Badge>
                </Accordion.Header>
                <Accordion.Body className="w-100">
                  {filteredLogs.length > 0 ? (
                    <Table striped bordered hover className="shadow-sm w-100">
                      <thead>
                        <tr>
                          <th>🕒 Date/Time</th>
                          <th>📌 Mode</th>
                          <th>📝 Reason</th>
                          <th>📍 Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log) => (
                          <tr key={log.id}>
                            <td>{formatIndianDateTime(log.login_time)}</td>
                            <td>
                              <Badge bg="primary">{log.Mode}</Badge>
                            </td>
                            <td>{log.Reason_query || "N/A"}</td>
                            <td>{log.live_location || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No logs found for this filter.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            );
          })
        ) : (
          <p className="text-muted text-center">No employees found.</p>
        )}
      </Accordion>
    </Container>
     

                      
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminInnerDashBoard;
