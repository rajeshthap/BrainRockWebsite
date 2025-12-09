import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Pagination,
  Form,
  Modal,
  Image,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
import axios from "axios";
import "../../../assets/css/attendance.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint, FaFileExcel } from "react-icons/fa";

const EmployeeTransfer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [transferring, setTransferring] = useState({});

  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });

  // Employee list states
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Branch transfer modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState(null);

  const baseUrl = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

  const axiosInstance = axios.create({
    baseURL: `${baseUrl}/api/`,
    withCredentials: true,
  });

  // Check if we're on mobile or tablet
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 768) {
        setSidebarOpen(false);
      } else if (width >= 768 && width < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/employee-list/`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

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

  // Fetch branches
  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const response = await axiosInstance.get("branch-names/");
      
      let branchList = [];
      if (response.data && Array.isArray(response.data)) {
        branchList = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        branchList = response.data.data;
      }
      
      setBranches(branchList);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setTransferError("Failed to load branches");
    } finally {
      setBranchesLoading(false);
    }
  };

  // Filter and paginate employees
  const allFilteredEmployees = useMemo(() => {
    let filtered = employees;

    if (statusFilter !== "all") {
      filtered = filtered.filter((emp) =>
        statusFilter === "active" ? emp.is_active === true : emp.is_active === false
      );
    }

    if (!searchTerm) return filtered;
    const lower = searchTerm.toLowerCase();

    return filtered.filter((emp) =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(lower) ||
      emp.emp_id?.toLowerCase().includes(lower) ||
      emp.phone?.toLowerCase().includes(lower) ||
      emp.branch_name?.toLowerCase().includes(lower)
    );
  }, [employees, searchTerm, statusFilter]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const paginatedEmployees = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(allFilteredEmployees.length / itemsPerPage);

  // Handle transfer button click
  const handleTransferClick = (emp) => {
    setSelectedEmployee(emp);
    setSelectedBranch(emp.branch_name || "");
    setTransferError(null);
    fetchBranches();
    setShowTransferModal(true);
  };

  // Handle transfer submission
  const handleTransferSubmit = async () => {
    if (!selectedBranch) {
      setTransferError("Please select a branch");
      return;
    }

    if (selectedBranch === selectedEmployee.branch_name) {
      setTransferError("Please select a different branch");
      return;
    }

    setTransferLoading(true);
    setTransferError(null);

    try {
      const formData = new FormData();
      formData.append("emp_id", selectedEmployee.emp_id);
      formData.append("branch_name", selectedBranch);

      const response = await axiosInstance.patch("employee-details/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update employee in list
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.emp_id === selectedEmployee.emp_id
            ? { ...emp, branch_name: selectedBranch }
            : emp
        )
      );

      setToast({
        show: true,
        message: `Employee transferred to ${selectedBranch} successfully`,
        bg: "success",
      });

      setShowTransferModal(false);
      setSelectedEmployee(null);
      setSelectedBranch("");
    } catch (err) {
      console.error("Failed to transfer employee:", err);
      setTransferError(err.message || "Failed to transfer employee");
    } finally {
      setTransferLoading(false);
    }
  };

  // Print functionality
  const handlePrint = () => {
    const columnsToRemove = [1, 6]; // Photo & Action
    const table = document.querySelector(".temp-rwd-table")?.cloneNode(true);

    if (!table) {
      alert("Table not found for printing.");
      return;
    }

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
        <title>Employee Transfer</title>
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
        <h2>Employee Transfer List</h2>
        ${table.outerHTML}
      </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.print();
  };

  // Download functionality
  const handleDownload = () => {
    if (allFilteredEmployees.length === 0) {
      window.alert("No employee records to download!");
      return;
    }

    const data = allFilteredEmployees.map((emp, index) => ({
      "S.No": index + 1,
      "Employee ID": emp.emp_id,
      "Full Name": `${emp.first_name} ${emp.last_name}`,
      "Phone": emp.phone,
      "Designation": emp.designation,
      "Current Branch": emp.branch_name,
      "Status": emp.is_active ? "Active" : "Inactive",
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const range = XLSX.utils.decode_range(ws["!ref"]);
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

    ws["!cols"] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Transfer");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Employee_Transfer.xlsx"
    );
  };

  return (
    <div className="dashboard-container">
      <SideNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Employee Transfer Management</h2>

            <div className="d-flex align-items-center gap-2">
              <Button variant="" size="sm" className="mx-2 print-btn" onClick={handlePrint}>
                <FaPrint /> Print
              </Button>

              <Button variant="" size="sm" className="download-btn" onClick={handleDownload}>
                <FaFileExcel /> Download
              </Button>
            </div>
          </div>

          {loading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          )}

          {error && <Alert variant="danger">Failed to load employees: {error}</Alert>}

          {!loading && !error && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Search Employee</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, ID, or phone..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Filter by Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Employees</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <div className="col-md-12">
                  <table className="temp-rwd-table">
                    <tbody>
                      <tr>
                        <th>S.No</th>
                        <th>Photo</th>
                        <th>Full Name</th>
                        <th>Employee ID</th>
                        <th>Phone</th>
                        <th>Designation</th>
                        <th>Current Branch</th>
                        <th>Action</th>
                      </tr>

                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((emp, index) => (
                          <tr key={emp.id || emp.emp_id}>
                            <td data-th="S.No">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td data-th="Photo">
                              {emp.profile_photo ? (
                                <Image
                                  src={`${baseUrl}${emp.profile_photo}`}
                                  roundedCircle
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div
                                  className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    color: "white",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {emp.first_name?.[0]}
                                  {emp.last_name?.[0]}
                                </div>
                              )}
                            </td>
                            <td data-th="Full Name">
                              {emp.first_name} {emp.last_name}
                            </td>
                            <td data-th="Employee ID">{emp.emp_id}</td>
                            <td data-th="Phone">{emp.phone || "N/A"}</td>
                            <td data-th="Designation">{emp.designation || "N/A"}</td>
                            <td data-th="Current Branch">
                              {emp.branch_name || "N/A"}
                            </td>
                            <td data-th="Action">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleTransferClick(emp)}
                                disabled={transferring[emp.emp_id]}
                              >
                                Transfer
                              </Button>
                              {transferring[emp.emp_id] && (
                                <Spinner animation="border" size="sm" className="ms-2" />
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No employees found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Row>

              {allFilteredEmployees.length > itemsPerPage && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      {/* Transfer Modal */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <div className="mb-4">
                <p>
                  <strong>Employee Name:</strong> {selectedEmployee.first_name}{" "}
                  {selectedEmployee.last_name}
                </p>
                <p>
                  <strong>Employee ID:</strong> {selectedEmployee.emp_id}
                </p>
                <p>
                  <strong>Current Branch:</strong> {selectedEmployee.branch_name || "N/A"}
                </p>
              </div>

              {transferError && (
                <Alert variant="danger" className="mb-3">
                  {transferError}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Select New Branch</Form.Label>
                {branchesLoading ? (
                  <div className="d-flex justify-content-center">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <Form.Select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    disabled={transferLoading}
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id || branch.branch_name} value={branch.branch_name}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTransferModal(false)}
            disabled={transferLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleTransferSubmit}
            disabled={transferLoading || !selectedBranch}
          >
            {transferLoading ? "Transferring..." : "Transfer"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.bg}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default EmployeeTransfer;