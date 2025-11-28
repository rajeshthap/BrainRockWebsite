import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
  Alert,
  Spinner,
  Pagination,
  Form,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,

  FaCog,
  FaSignOutAlt,
  FaSearch,


} from "react-icons/fa";

import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
import axios from "axios";
import { AiFillEdit } from "react-icons/ai";
import "../../../assets/css/attendance.css";
import { Toast, ToastContainer } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";



const EmployeeManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState({});
  
  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });



  const [notifications, setNotifications] = useState([
    { id: 1, text: "New message from John", time: "2 min ago", read: false },
    {
      id: 2,
      text: "Your order has been shipped",
      time: "1 hour ago",
      read: false,
    },
    { id: 3, text: "Weekly report is ready", time: "3 hours ago", read: true },
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  // employee list states (replicates EmpList behaviour)
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editableEmployee, setEditableEmployee] = useState(null);

  // Check if we're on mobile or tablet
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 768) {
        setSidebarOpen(false); // Close sidebar on mobile
      } else if (width >= 768 && width < 1024) {
        setSidebarOpen(false); // Close sidebar on tablet by default
      } else {
        setSidebarOpen(true); // Open sidebar on desktop
      }
    };

    // Initial check
    checkDevice();

    // Add event listener for window resize
    window.addEventListener("resize", checkDevice);

    // Cleanup
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => prev - 1);
  };

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/",
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

  // Derived lists, pagination and filters
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
      emp.first_name?.toLowerCase().includes(lower) ||
      emp.last_name?.toLowerCase().includes(lower) ||
      emp.email?.toLowerCase().includes(lower) ||
      emp.emp_id?.toLowerCase().includes(lower) ||
      emp.phone?.toLowerCase().includes(lower)
    );
  }, [employees, searchTerm, statusFilter]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const paginatedEmployees = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(allFilteredEmployees.length / itemsPerPage);

  const baseUrl = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

  // axios instance that sends cookies (mirrors HrProfile)
  const axiosInstance = axios.create({
    baseURL: `${baseUrl}/api/`,
    withCredentials: true,
  });


  const toCamelLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const handleView = (emp) => {
    // fetch full employee details by emp_id then open detail view
    const fetchDetails = async () => {
      setLoadingDetail(true);
      setSaveError(null);
      try {
        const { data } = await axiosInstance.get(`employee-details/?emp_id=${encodeURIComponent(emp.emp_id)}`);
        // API may return an object or array; normalize to single object
        const detail = Array.isArray(data) ? data[0] : data;
        setSelectedEmployee(detail);
        // Convert any paths to full urls for preview if needed
        const normalized = { ...(detail || {}) };
        setEditableEmployee(normalized ? { ...normalized } : null);
        setShowDetailView(true);
      } catch (err) {
        console.error("Failed to fetch employee details:", err);
        setSaveError(err.message || "Failed to load details");
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetails();
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setShowDetailView(false);
    setEditableEmployee(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  // Save updated editableEmployee using PATCH (employee-details/ accepts emp_id and multipart data)
  const handleSave = async () => {
    if (!editableEmployee || !editableEmployee.emp_id) {
      setSaveError("Missing employee id");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const formData = new FormData();

      // required emp_id for endpoint
      formData.append("emp_id", editableEmployee.emp_id);

      // same list of editable fields used in HrProfile
      const editableFields = [
        "first_name",
        "last_name",
        "emp_id",
        "email",
        "phone",
        "alternate_phone",
        "address",
        "emergency_contact_name",
        "emergency_contact_number",
        "department",
        "designation",
        "joining_date",
        "reporting_manager",
        "work_location",
        "salary",
        "bank_name",
        "account_number",
        "ifsc_code",
        "tax_id",
        "country",
        "state",
        "city",
        "branch_name",
      ];

      editableFields.forEach((field) => {
        const value = editableEmployee[field];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, value);
        }
      });

      // If front-end allowed editing of profile_photo or documents later, handle files here

      const response = await axiosInstance.patch(`employee-details/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // After patch, re-fetch full employee details (server may return partial response)
      try {
        const re = await axiosInstance.get(`employee-details/?emp_id=${encodeURIComponent(editableEmployee.emp_id)}&_t=${Date.now()}`);
        const full = Array.isArray(re.data) ? re.data[0] : re.data;
        if (full) {
          setSelectedEmployee(full);
          setEditableEmployee({ ...full });
          setEmployees((prev) => prev.map((item) => (item.id === full.id ? full : item)));
        } else {
          // fallback: use server patch response
          const updated = response.data;
          setSelectedEmployee(updated);
          setEditableEmployee({ ...updated });
          setEmployees((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }

        setSaveSuccess(true);
      } catch (refetchErr) {
        // If refetch fails, still attempt to use patch response
        console.warn("Refetch after patch failed:", refetchErr);
        const updated = response.data;
        setSelectedEmployee(updated);
        setEditableEmployee({ ...updated });
        setEmployees((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error("Failed to save:", err);
      setSaveError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };


  const updateEmployeeStatus = async (emp, newStatus) => {
    const empId = emp.emp_id;

    setStatusUpdating(prev => ({ ...prev, [empId]: true }));

    try {
      await axiosInstance.patch(
        "change-employee-status/",
        {
          emp_id: empId,
          is_active: newStatus ? 1 : 0,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setEmployees(prev =>
        prev.map(e =>
          e.emp_id === empId ? { ...e, is_active: newStatus ? 1 : 0 } : e
        )
      );

      setToast({
        show: true,
        message: `Employee status updated to ${newStatus ? "Active" : "Inactive"}`,
        bg: "success",
      });

    } catch (err) {
      console.error("Failed to change status:", err);

      setToast({
        show: true,
        message: "Could not update status. Try again.",
        bg: "danger",
      });
    } finally {
      setStatusUpdating(prev => ({ ...prev, [empId]: false }));
    }
  };

  // -------------------- PRINT FUNCTION --------------------
const handlePrint = () => {
  const columnsToRemove = [1, 9]; // Photo & Action column
  const table = document.querySelector(".temp-rwd-table").cloneNode(true);

  // Remove columns
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
        <title>Employee List</title>
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
        <h2>Employee List</h2>
        ${table.outerHTML}
      </body>
      </html>
    `);
  newWindow.document.close();
  newWindow.print();
};

// -------------------- EXCEL DOWNLOAD FUNCTION --------------------
const handleDownload = () => {
  if (allFilteredEmployees.length === 0) {
    window.alert("No employee records to download!");
    return;
  }

  const data = allFilteredEmployees.map((emp, index) => ({
    "S.No": index + 1,
    "Employee ID": emp.emp_id,
    "Employee Name": `${emp.first_name} ${emp.last_name}`,
    "Department": emp.department,
    "Designation": emp.designation,
    "Email": emp.email,
    "Mobile": emp.phone,
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
    { wch: 20 },
    { wch: 20 },
    { wch: 28 },
    { wch: 15 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employee List");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    "Employee_List.xlsx"
  );
};









  return (
    <div className="dashboard-container">
      {/* Sidebar - Hidden on mobile and tablet */}
      <SideNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
       
        <HrHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <Container fluid className="dashboard-body p-4">

          {/* If detail view open show details similar to EmpList's behaviour */}
          {showDetailView && selectedEmployee && loadingDetail && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
              <Spinner animation="border" />
            </div>
          )}

          {showDetailView && selectedEmployee && !loadingDetail && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Employee Details</h2>
                <Button variant="secondary" onClick={handleBackToList}>Back to Employee List</Button>
              </div>

              <Row className="mb-3">
                <Col md={3} className="text-center">
                  {selectedEmployee.profile_photo ? (
                    <Image src={`${baseUrl}${selectedEmployee.profile_photo}`} roundedCircle width={120} height={120} />
                  ) : (
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 120, height: 120, color: 'white', fontSize: '1.2rem' }}>
                      {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                    </div>
                  )}
                </Col>

                <Col md={9}>
                  {/* show error/success */}
                  {saveError && <Alert variant="danger">{saveError}</Alert>}
                  {saveSuccess && <Alert variant="success">Saved successfully.</Alert>}
                  <h4>{selectedEmployee.first_name} {selectedEmployee.last_name}</h4>
                  {/* Editable two-column form - fallback if editableEmployee missing show static */}
                  {editableEmployee ? (
                    <Form>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('emp_id')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.emp_id || ''} name="emp_id" onChange={(e) => setEditableEmployee(prev => ({ ...prev, emp_id: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('first_name')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.first_name || ''} name="first_name" onChange={(e) => setEditableEmployee(prev => ({ ...prev, first_name: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('last_name')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.last_name || ''} name="last_name" onChange={(e) => setEditableEmployee(prev => ({ ...prev, last_name: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('email')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.email || ''} name="email" onChange={(e) => setEditableEmployee(prev => ({ ...prev, email: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('phone')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.phone || ''} name="phone" onChange={(e) => setEditableEmployee(prev => ({ ...prev, phone: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('alternate_phone')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.alternate_phone || ''} name="alternate_phone" onChange={(e) => setEditableEmployee(prev => ({ ...prev, alternate_phone: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('department')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.department || ''} name="department" onChange={(e) => setEditableEmployee(prev => ({ ...prev, department: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('designation')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.designation || ''} name="designation" onChange={(e) => setEditableEmployee(prev => ({ ...prev, designation: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('joining_date')}</Form.Label>
                            <Form.Control className="br-form-control" type="date" value={editableEmployee.joining_date || ''} name="joining_date" onChange={(e) => setEditableEmployee(prev => ({ ...prev, joining_date: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('reporting_manager')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.reporting_manager || ''} name="reporting_manager" onChange={(e) => setEditableEmployee(prev => ({ ...prev, reporting_manager: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('work_location')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.work_location || ''} name="work_location" onChange={(e) => setEditableEmployee(prev => ({ ...prev, work_location: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('salary')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.salary || ''} name="salary" onChange={(e) => setEditableEmployee(prev => ({ ...prev, salary: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('bank_name')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.bank_name || ''} name="bank_name" onChange={(e) => setEditableEmployee(prev => ({ ...prev, bank_name: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('account_number')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.account_number || ''} name="account_number" onChange={(e) => setEditableEmployee(prev => ({ ...prev, account_number: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('ifsc_code')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.ifsc_code || ''} name="ifsc_code" onChange={(e) => setEditableEmployee(prev => ({ ...prev, ifsc_code: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('tax_id')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.tax_id || ''} name="tax_id" onChange={(e) => setEditableEmployee(prev => ({ ...prev, tax_id: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('address')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.address || ''} name="address" onChange={(e) => setEditableEmployee(prev => ({ ...prev, address: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('emergency_contact_name')}</Form.Label>
                            <Form.Select className="br-form-control" value={editableEmployee.emergency_contact_name || ''} name="emergency_contact_name" onChange={(e) => setEditableEmployee(prev => ({ ...prev, emergency_contact_name: e.target.value }))}>
                              <option value="">Select Relationship</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Cousin">Cousin</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('emergency_contact_number')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.emergency_contact_number || ''} name="emergency_contact_number" onChange={(e) => setEditableEmployee(prev => ({ ...prev, emergency_contact_number: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('country')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.country || ''} name="country" onChange={(e) => setEditableEmployee(prev => ({ ...prev, country: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('state')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.state || ''} name="state" onChange={(e) => setEditableEmployee(prev => ({ ...prev, state: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('city')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.city || ''} name="city" onChange={(e) => setEditableEmployee(prev => ({ ...prev, city: e.target.value }))} />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="br-label">{toCamelLabel('branch_name')}</Form.Label>
                            <Form.Control className="br-form-control" value={editableEmployee.branch_name || ''} name="branch_name" onChange={(e) => setEditableEmployee(prev => ({ ...prev, branch_name: e.target.value }))} />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <>
                      <p><strong>Employee ID:</strong> {selectedEmployee.emp_id || 'N/A'}</p>
                      <p><strong>Department:</strong> {selectedEmployee.department || 'N/A'}</p>
                      <p><strong>Designation:</strong> {selectedEmployee.designation || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedEmployee.email || 'N/A'}</p>
                      <p><strong>Mobile:</strong> {selectedEmployee.phone || 'N/A'}</p>
                      <p><strong>Joining Date:</strong> {selectedEmployee.joining_date || 'N/A'}</p>
                      <p><strong>Branch:</strong> {selectedEmployee.branch_name || 'N/A'}</p>
                    </>
                  )}
                </Col>
              </Row>

              {/* additional details grid */}
              <Row>
                <div className="col-md-12">
                  <table className="temp-rwd-table">
                    <tbody>
                      <tr>
                        <th>S.No</th>
                        <th>Document</th>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                      <tr>
                        <td data-th="S.No">1</td>
                        <td data-th="Document">Resume</td>
                        <td data-th="Field">Resume</td>
                        <td data-th="Value">{selectedEmployee.resume_document ? <a href={`${baseUrl}${selectedEmployee.resume_document}`} target="_blank" rel="noreferrer">View</a> : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td data-th="S.No">2</td>
                        <td data-th="Document">PAN</td>
                        <td data-th="Field">PAN Card</td>
                        <td data-th="Value">{selectedEmployee.pan_card_document ? <a href={`${baseUrl}${selectedEmployee.pan_card_document}`} target="_blank" rel="noreferrer">View</a> : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td data-th="S.No">3</td>
                        <td data-th="Document">Offer Letter</td>
                        <td data-th="Field">Offer Letter</td>
                        <td data-th="Value">{selectedEmployee.offer_letter ? <a href={`${baseUrl}${selectedEmployee.offer_letter}`} target="_blank" rel="noreferrer">View</a> : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Row>

              {/* Save / Cancel controls */}
              {editableEmployee && (
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="secondary" className="me-2" onClick={handleBackToList} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {(!showDetailView || !selectedEmployee) && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Employee Management</h2>

                <div className="d-flex align-items-center">
              <div className="mt-2 vmb-2 text-end">
              <Button variant="" size="sm" className="mx-2 print-btn" onClick={handlePrint}>
                <FaPrint /> Print
              </Button>

              <Button variant="" size="sm" className="download-btn" onClick={handleDownload}>
                <FaFileExcel />Download
              </Button>
            </div>


   <Form>
      <Form.Group  controlId="exampleForm.ControlInput1">
        <Form.Label className="emp-lable">Filter by Status:</Form.Label>
          <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select emp-dropdown"
                   
                  >
                    <option value="all">All Employees</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
      </Form.Group>
     
    </Form>


                
               
                </div>
              </div>



              {loading && (
                <div className="d-flex justify-content-center"><Spinner animation="border" /></div>
              )}

              {error && <Alert variant="danger">Failed to load employees: {error}</Alert>}

              {!loading && !error && (
                <>
                  <Row className="mt-3">
                    <div className="col-md-12">
                      <table className="temp-rwd-table">
                        <tbody>
                          <tr>
                            <th>S.No</th>
                            <th>Photo</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>

                          {paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((emp, index) => (
                              <tr key={emp.id}>
                                <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td data-th="Photo">
                                  {emp.profile_photo ? (
                                    <Image src={`${baseUrl}${emp.profile_photo}`} roundedCircle width={40} height={40} />
                                  ) : (
                                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', color: 'white', fontSize: '0.8rem' }}>
                                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                                    </div>
                                  )}
                                </td>
                                <td data-th="Employee ID">{emp.emp_id || "N/A"}</td>
                                <td data-th="Employee Name">{emp.first_name} {emp.last_name}</td>
                                <td data-th="Department">{emp.department || "N/A"}</td>
                                <td data-th="Designation">{emp.designation || "N/A"}</td>
                                <td data-th="Email">{emp.email || "N/A"}</td>
                                <td data-th="Mobile">{emp.phone || "N/A"}</td>
                                <td data-th="Status">
                                  <Form.Check
                                    type="switch"
                                    id={`status-switch-${emp.emp_id}`}
                                    className="big-switch"
                                    checked={emp.is_active === 1 || emp.is_active === true}
                                    disabled={statusUpdating[emp.emp_id]}
                                    onChange={(e) => updateEmployeeStatus(emp, e.target.checked)}
                                    label={emp.is_active ? "Active" : "Inactive"}
                                  />

                                  {statusUpdating[emp.emp_id] && (
                                    <Spinner animation="border" size="sm" className="ms-2" />
                                  )}
                                </td>


                                <td data-th="Action">
                                  <Button variant="primary"
                                    className="big-edit-btn"
                                    onClick={() => handleView(emp)}>
                                    <AiFillEdit /> Edit
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="11" className="text-center">No employees found matching your search.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Row>

                  {allFilteredEmployees.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, index) => (
                          <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </>

          )}

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

        </Container>
      </div>

      {/* Mobile & Tablet Sidebar (Offcanvas) */}
    </div>
  );
};

export default EmployeeManagement;
