import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import LeftNavManagement from "./LeftNavManagement";
import AdminHeader from "./AdminHeader";
import "../../assets/css/websitemanagement.css";

const WebsiteManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // API Data states
  const [coursesData, setCoursesData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState({
    courses: false,
    employees: false,
    projects: false,
  });

  const [errors, setErrors] = useState({
    courses: null,
    employees: null,
    projects: null,
  });

  // Table view states
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Detail view modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch Courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading((prev) => ({ ...prev, courses: true }));
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-items/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        if (data.success) {
          setCoursesData(data.data);
          setErrors((prev) => ({ ...prev, courses: null }));
        } else {
          throw new Error(data.message || "Failed to fetch courses");
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, courses: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, courses: false }));
      }
    };

    fetchCourses();
  }, []);

  // Fetch Employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading((prev) => ({ ...prev, employees: true }));
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();
        // Handle both array format and success/data wrapper format
        if (Array.isArray(data)) {
          setEmployeesData(data);
          setErrors((prev) => ({ ...prev, employees: null }));
        } else if (data.success && data.data) {
          setEmployeesData(data.data);
          setErrors((prev) => ({ ...prev, employees: null }));
        } else if (data.success && Array.isArray(data.data)) {
          setEmployeesData(data.data);
          setErrors((prev) => ({ ...prev, employees: null }));
        } else {
          throw new Error(data.message || "Failed to fetch employees");
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, employees: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, employees: false }));
      }
    };

    fetchEmployees();
  }, []);

  // Fetch Projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading((prev) => ({ ...prev, projects: true }));
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/project-list/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        if (data.success) {
          setProjectsData(data.data);
          setErrors((prev) => ({ ...prev, projects: null }));
        } else {
          throw new Error(data.message || "Failed to fetch projects");
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, projects: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleCardClick = (cardType) => {
    setSelectedCardType(cardType);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleCloseTable = () => {
    setSelectedCardType(null);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const getModalData = () => {
    switch (selectedCardType) {
      case "courses":
        return coursesData;
      case "employees":
        return employeesData;
      case "projects":
        return projectsData;
      default:
        return [];
    }
  };

  const getModalTitle = () => {
    switch (selectedCardType) {
      case "courses":
        return "Courses";
      case "employees":
        return "Employees";
      case "projects":
        return "Projects";
      default:
        return "";
    }
  };

  const getFilteredData = () => {
    let data = getModalData();

    if (searchTerm.trim() === "") {
      return data;
    }

    const lowerSearch = searchTerm.toLowerCase();

    if (selectedCardType === "courses") {
      return data.filter(
        (item) =>
          item.course_id?.toLowerCase().includes(lowerSearch) ||
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.description?.toLowerCase().includes(lowerSearch)
      );
    } else if (selectedCardType === "employees") {
      return data.filter(
        (item) =>
          item.emp_id?.toLowerCase().includes(lowerSearch) ||
          item.first_name?.toLowerCase().includes(lowerSearch) ||
          item.last_name?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch) ||
          item.phone?.toLowerCase().includes(lowerSearch) ||
          item.department?.toLowerCase().includes(lowerSearch)
      );
    } else if (selectedCardType === "projects") {
      return data.filter(
        (item) =>
          item.project_id?.toLowerCase().includes(lowerSearch) ||
          item.project_name?.toLowerCase().includes(lowerSearch) ||
          item.status?.toLowerCase().includes(lowerSearch)
      );
    }

    return data;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const renderCoursesTable = (items) => {
    return (
      <table className="temp-rwd-table">
        <tbody>
          <tr>
            <th>S.No</th>
            <th>Course ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Duration</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
          {items.length > 0 ? (
            items.map((course, index) => (
              <tr key={course.id}>
                <td data-th="S.No">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td data-th="Course ID">{course.course_id}</td>
                <td data-th="Title">{course.title}</td>
                <td data-th="Price">₹{course.price}</td>
                <td data-th="Duration">{course.duration}</td>
                <td data-th="Created At">{formatDate(course.created_at)}</td>
                <td data-th="Action">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewItem(course)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No courses available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderEmployeesTable = (items) => {
    return (
      <table className="temp-rwd-table">
        <tbody>
          <tr>
            <th>S.No</th>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
          {items.length > 0 ? (
            items.map((employee, index) => (
              <tr key={employee.id}>
                <td data-th="S.No">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td data-th="Emp ID">{employee.emp_id}</td>
                <td data-th="Name">
                  {employee.first_name} {employee.last_name}
                </td>
                <td data-th="Email">{employee.email}</td>
                <td data-th="Phone">{employee.phone}</td>
                <td data-th="Department">{employee.department || "N/A"}</td>
                <td data-th="Action">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewItem(employee)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No employees available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderProjectsTable = (items) => {
    return (
      <table className="temp-rwd-table">
        <tbody>
          <tr>
            <th>S.No</th>
            <th>Project ID</th>
            <th>Project Name</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Created At</th>
          </tr>
          {items.length > 0 ? (
            items.map((project, index) => (
              <tr key={project.id}>
                <td data-th="S.No">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td data-th="Project ID">{project.project_id}</td>
                <td data-th="Project Name">{project.project_name}</td>
                <td data-th="Status">
                  <span
                    className={`badge ${
                      project.status === "completed"
                        ? "bg-success"
                        : project.status === "pending"
                        ? "bg-warning"
                        : "bg-info"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td data-th="Start Date">{formatDate(project.start_date)}</td>
                <td data-th="End Date">{formatDate(project.end_date)}</td>
                <td data-th="Created At">{formatDate(project.created_at)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No projects available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderTable = (items) => {
    switch (selectedCardType) {
      case "courses":
        return renderCoursesTable(items);
      case "employees":
        return renderEmployeesTable(items);
      case "projects":
        return renderProjectsTable(items);
      default:
        return null;
    }
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    if (selectedCardType === "courses") {
      return (
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Course Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="detail-view">
              <div className="mb-3">
                <h5>Course ID</h5>
                <p>{selectedItem.course_id}</p>
              </div>
              <div className="mb-3">
                <h5>Title</h5>
                <p>{selectedItem.title}</p>
              </div>
              <div className="mb-3">
                <h5>Description</h5>
                <p>{selectedItem.description}</p>
              </div>
              <div className="mb-3">
                <h5>Price</h5>
                <p>₹{selectedItem.price}</p>
              </div>
              <div className="mb-3">
                <h5>Duration</h5>
                <p>{selectedItem.duration}</p>
              </div>
              <div className="mb-3">
                <h5>Modules</h5>
                {selectedItem.modules && selectedItem.modules.length > 0 ? (
                  <ul>
                    {selectedItem.modules.map((module, idx) => (
                      <li key={idx}>
                        <strong>{module[0]}</strong>
                        <p>{module[1]}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No modules available</p>
                )}
              </div>
              <div className="mb-3">
                <h5>Created At</h5>
                <p>{formatDate(selectedItem.created_at)}</p>
              </div>
              <div className="mb-3">
                <h5>Updated At</h5>
                <p>{formatDate(selectedItem.updated_at)}</p>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      );
    } else if (selectedCardType === "employees") {
      return (
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Employee Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="detail-view">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Employee ID</h5>
                  <p>{selectedItem.emp_id}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Name</h5>
                  <p>{selectedItem.first_name} {selectedItem.last_name}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Email</h5>
                  <p>{selectedItem.email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Phone</h5>
                  <p>{selectedItem.phone}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Alternate Phone</h5>
                  <p>{selectedItem.alternate_phone || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Gender</h5>
                  <p>{selectedItem.gender || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Date of Birth</h5>
                  <p>{formatDate(selectedItem.date_of_birth)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Department</h5>
                  <p>{selectedItem.department || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Designation</h5>
                  <p>{selectedItem.designation || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Work Location</h5>
                  <p>{selectedItem.work_location || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Joining Date</h5>
                  <p>{formatDate(selectedItem.joining_date)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Experience</h5>
                  <p>{selectedItem.experience || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Reporting Manager</h5>
                  <p>{selectedItem.reporting_manager || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Address</h5>
                  <p>{selectedItem.address || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>City</h5>
                  <p>{selectedItem.city || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>State</h5>
                  <p>{selectedItem.state || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Country</h5>
                  <p>{selectedItem.country || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Salary</h5>
                  <p>₹{selectedItem.salary || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Bank Name</h5>
                  <p>{selectedItem.bank_name || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Account Number</h5>
                  <p>{selectedItem.account_number || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>IFSC Code</h5>
                  <p>{selectedItem.ifsc_code || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Emergency Contact</h5>
                  <p>{selectedItem.emergency_contact_name || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Emergency Contact Number</h5>
                  <p>{selectedItem.emergency_contact_number || "N/A"}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Skills</h5>
                  <p>
                    {selectedItem.skills_set && selectedItem.skills_set.length > 0
                      ? selectedItem.skills_set.join(", ")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>Status</h5>
                  <p>
                    <span className={`badge ${selectedItem.is_active ? "bg-success" : "bg-danger"}`}>
                      {selectedItem.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Verified</h5>
                  <p>
                    <span className={`badge ${selectedItem.is_verified ? "bg-success" : "bg-danger"}`}>
                      {selectedItem.is_verified ? "Verified" : "Not Verified"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <h5>Created At</h5>
                <p>{formatDate(selectedItem.created_at)}</p>
              </div>
              <div className="mb-3">
                <h5>Updated At</h5>
                <p>{formatDate(selectedItem.updated_at)}</p>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      );
    }
  };

  const filteredData = getFilteredData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dashboard-container">
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <h1 className="page-title">Dashboard</h1>
          <div className="br-box-container mt-4">
            <Row className="br-stats-row">
              {/* Courses Card */}
              <Col lg={4} md={6} sm={12} className="mb-3">
                <div
                  className="br-stat-card card-blue"
                  onClick={() => handleCardClick("courses")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaBook />
                  </div>
                  <div className="br-stat-details">
                    <h5>Total Courses</h5>
                    <h2>{coursesData.length}</h2>
                  </div>
                </div>
              </Col>

              {/* Employees Card */}
              <Col lg={4} md={6} sm={12} className="mb-3">
                <div
                  className="br-stat-card card-green"
                  onClick={() => handleCardClick("employees")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaUsers />
                  </div>
                  <div className="br-stat-details">
                    <h5>Total Employees</h5>
                    <h2>{employeesData.length}</h2>
                  </div>
                </div>
              </Col>

              {/* Projects Card */}
              <Col lg={4} md={6} sm={12} className="mb-3">
                <div
                  className="br-stat-card card-orange"
                  onClick={() => handleCardClick("projects")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="br-stat-details">
                    <h5>Total Projects</h5>
                    <h2>{projectsData.length}</h2>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          {selectedCardType && (
            <div className="br-box-container mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">{getModalTitle()} List</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={`Search ${getModalTitle().toLowerCase()}...`}
                    className="form-control"
                    style={{ width: "300px" }}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleCloseTable}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Close
                  </Button>
                </div>
              </div>

              {errors[selectedCardType] && (
                <Alert variant="danger" className="mb-4">
                  Error: {errors[selectedCardType]}
                </Alert>
              )}

              {loading[selectedCardType] ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">
                    Loading {getModalTitle().toLowerCase()}...
                  </p>
                </div>
              ) : (
                <>
                  <Row className="mt-3">
                    <div className="col-md-12">
                      {renderTable(currentItems)}
                    </div>
                  </Row>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {[...Array(totalPages).keys()].map((page) => (
                          <Pagination.Item
                            key={page + 1}
                            active={page + 1 === currentPage}
                            onClick={() => handlePageChange(page + 1)}
                          >
                            {page + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Detail View Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default WebsiteManagement;
