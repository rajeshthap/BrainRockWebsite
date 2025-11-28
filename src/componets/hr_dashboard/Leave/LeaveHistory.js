import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Pagination,
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // ⭐ ADDED (Pagination Logic)
  const totalPages = Math.ceil(leaveHistory.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return leaveHistory.slice(start, start + itemsPerPage);
  }, [currentPage, leaveHistory]);


  const handlePrint = () => {
    const table = document.querySelector(".temp-rwd-table")?.cloneNode(true);

    if (!table) {
      window.alert("Leave history table not found!");
      return;
    }

    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
    <html>
      <head>
        <title>Leave History</title>
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
        <h2>Leave History</h2>
        ${table.outerHTML}
      </body>
    </html>
  `);

    newWindow.document.close();
    newWindow.print();
  };

  const handleDownload = () => {
    if (leaveHistory.length === 0) {
      window.alert("No leave history records to download!");
      return;
    }

    const data = leaveHistory.map((item, index) => ({
      "S.No": index + 1,
      "Name": `${employee.first_name} ${employee.last_name}`,
      "Department": employee.department || "N/A",
      "Phone": employee.phone || "N/A",
      "Leave Type": item.leave_type.replace("_", " ").toUpperCase(),
      "Dates": item.dates.join(", "),
      "Days": item.leave_days,
      "Reason": item.reason,
      "Approved By": item.approved_by || "—",
      "Applied On": new Date(item.created_at).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const range = XLSX.utils.decode_range(ws["!ref"]);

    // Header style (same as your original)
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
          right: { style: "thin", color: { rgb: "999999" } },
        },
      };
    }

    // Column widths (tuned for your Leave History table)
    ws["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 25 }, // Name
      { wch: 20 }, // Department
      { wch: 15 }, // Phone
      { wch: 18 }, // Leave Type
      { wch: 30 }, // Dates
      { wch: 10 }, // Days
      { wch: 30 }, // Reason
      { wch: 20 }, // Approved By
      { wch: 22 }, // Applied On
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave History");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Leave_History.xlsx");
  };


  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container leave-his">
            <h4>Leave History</h4>
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
                          currentItems.map((item, index) => (
                            <tr key={item.id}>
                              <td data-th="S.No">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>

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
                {/* ⭐ ADDED PAGINATION UI */}
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    />

                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    />
                  </Pagination>
                </div>

              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LeaveHistory;
