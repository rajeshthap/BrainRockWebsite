import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate, FaFileInvoice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LeftNavManagement from "./LeftNavManagement";
import AdminHeader from "./AdminHeader";
import "../../assets/css/websitemanagement.css";
const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const WebsiteManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // API Data states
  const [coursesData, setCoursesData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [brainrockBillsCount, setBrainrockBillsCount] = useState(0);
  const [zeeBillsCount, setZeeBillsCount] = useState(0);
  const [kheloJitoUsersCount, setKheloJitoUsersCount] = useState(0);
  const [quizParticipantsCount, setQuizParticipantsCount] = useState(0);

  // Loading and error states
  const [loading, setLoading] = useState({
    courses: false,
    employees: false,
    projects: false,
    brainrockBills: false,
    zeeBills: false,
    kheloJitoUsers: false,
    quizParticipants: false,
  });

  const [errors, setErrors] = useState({
    courses: null,
    employees: null,
    projects: null,
    brainrockBills: null,
    zeeBills: null,
    kheloJitoUsers: null,
    quizParticipants: null,
  });

  // Table view states
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]); // To store the list of students
    const [studentCount, setStudentCount] = useState(0); // To store the total number of students
  
    const [error, setError] = useState(null); // To store any error messages
  // Detail view modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
useEffect(() => {
  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(`https://brainrock.in/brainrock/backend/api/course-registration/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }

      const data = await response.json();

      if (data.success) {
        const processedStudents = data.data.map(student => ({
          ...student,
          profile_photo: student.profile_photo
            ? `${API_BASE_URL}${student.profile_photo}?t=${Date.now()}`
            : null,
        }));

        setStudents(processedStudents);

        //  SET TOTAL REGISTERED STUDENTS COUNT
        setStudentCount(data.data.length);
      } else {
        throw new Error(data.message || 'Failed to fetch student data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, []);

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
          "https://brainrock.in/brainrock/backend/api/course-items/",
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
const goToNextComponent = () => {
  navigate("/ManageStudent");   // ← change URL as per your route
};

const goToBrainrockBills = () => {
  navigate("/ManageBills", { state: { billType: "ukssovm" } });
};

const goToZeeBills = () => {
  navigate("/ManageBills", { state: { billType: "zee" } });
};

const goToKheloJitoUsers = () => {
  navigate("/Registerduser");
};

const goToQuizParticipants = () => {
  navigate("/Registerduser", { state: { activeTab: "quiz-participants" } });
};

  // Fetch Quiz Participants count
  useEffect(() => {
    const fetchQuizParticipants = async () => {
      try {
        setLoading((prev) => ({ ...prev, quizParticipants: true }));
        console.log('=== Fetching quiz participants ===');
        const response = await fetch(
          "https://brainrock.in/brainrock/backend/api/quiz-participants/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('=== API response data ===', JSON.stringify(data, null, 2));

        if (data.status && Array.isArray(data.data)) {
          setQuizParticipantsCount(data.data.length);
          setErrors((prev) => ({ ...prev, quizParticipants: null }));
          console.log('Success - Quiz participants count:', data.data.length);
        } else {
          console.error('Unexpected data format:', typeof data, data);
          throw new Error(data.message || "Failed to fetch quiz participants - unexpected data format");
        }
      } catch (err) {
        console.error('=== Error fetching quiz participants ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setErrors((prev) => ({ ...prev, quizParticipants: err.message }));
        setQuizParticipantsCount(0);
      } finally {
        setLoading((prev) => ({ ...prev, quizParticipants: false }));
      }
    };

    fetchQuizParticipants();
  }, []);
  // Fetch Employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading((prev) => ({ ...prev, employees: true }));
        const response = await fetch(
          "https://brainrock.in/brainrock/backend/api/employee-list/",
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
          "https://brainrock.in/brainrock/backend/api/project-list/",
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

  // Fetch BrainRock Bills count
  useEffect(() => {
    const fetchBrainrockBills = async () => {
      try {
        setLoading((prev) => ({ ...prev, brainrockBills: true }));
        const response = await fetch(
          "https://brainrock.in/brainrock/backend/api/bill-brainrock/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch BrainRock bills");
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setBrainrockBillsCount(data.data.length);
          setErrors((prev) => ({ ...prev, brainrockBills: null }));
        } else if (Array.isArray(data)) {
          setBrainrockBillsCount(data.length);
          setErrors((prev) => ({ ...prev, brainrockBills: null }));
        } else {
          throw new Error(data.message || "Failed to fetch BrainRock bills");
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, brainrockBills: err.message }));
        setBrainrockBillsCount(0);
      } finally {
        setLoading((prev) => ({ ...prev, brainrockBills: false }));
      }
    };

    fetchBrainrockBills();
  }, []);

  // Fetch Zee Bills count
  useEffect(() => {
    const fetchZeeBills = async () => {
      try {
        setLoading((prev) => ({ ...prev, zeeBills: true }));
        const response = await fetch(
          "https://brainrock.in/brainrock/backend/api/bill-zee/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Zee bills");
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setZeeBillsCount(data.data.length);
          setErrors((prev) => ({ ...prev, zeeBills: null }));
        } else if (Array.isArray(data)) {
          setZeeBillsCount(data.length);
          setErrors((prev) => ({ ...prev, zeeBills: null }));
        } else {
          throw new Error(data.message || "Failed to fetch Zee bills");
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, zeeBills: err.message }));
        setZeeBillsCount(0);
      } finally {
        setLoading((prev) => ({ ...prev, zeeBills: false }));
      }
    };

    fetchZeeBills();
  }, []);

  // Fetch Khelo Jito Users count
  useEffect(() => {
    const fetchKheloJitoUsers = async () => {
      try {
        setLoading((prev) => ({ ...prev, kheloJitoUsers: true }));
        console.log('=== Fetching Khelo Jito users ===');
        const response = await fetch(
          "https://brainrock.in/brainrock/backend/api/register-test/",
          {
            method: "GET",
            credentials: "include",
          }
        );

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('=== API response data ===', JSON.stringify(data, null, 2));

        // Check if response is an array (direct data format)
        if (Array.isArray(data)) {
          setKheloJitoUsersCount(data.length);
          setErrors((prev) => ({ ...prev, kheloJitoUsers: null }));
          console.log('Success - Users count:', data.length);
        } else if (data.status && Array.isArray(data.data)) {
          // API uses status: true instead of success: true
          setKheloJitoUsersCount(data.data.length);
          setErrors((prev) => ({ ...prev, kheloJitoUsers: null }));
          console.log('Success (wrapped format) - Users count:', data.data.length);
        } else {
          console.error('Unexpected data format:', typeof data, data);
          throw new Error(data.message || "Failed to fetch Khelo Jito users - unexpected data format");
        }
      } catch (err) {
        console.error('=== Error fetching Khelo Jito users ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setErrors((prev) => ({ ...prev, kheloJitoUsers: err.message }));
        setKheloJitoUsersCount(0);
      } finally {
        setLoading((prev) => ({ ...prev, kheloJitoUsers: false }));
      }
    };

    fetchKheloJitoUsers();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleCardClick = (cardType) => {
    setSelectedCardType(cardType);
    setCurrentPage(1);
    setSearchTerm("");
    setTimeout(() => {
      const tableSection = document.getElementById("table-section");
      if (tableSection) {
        tableSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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
          <h1 className="page-title"> Admin Dashboard</h1>
          <div className="br-box-container mt-4">
            <Row className="br-stats-row">
              {/* Courses Card */}
              <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-courses"
                  onClick={() => handleCardClick("courses")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaBook />
                  </div>
                  <div className="br-stat-details">
                    <h5>Courses</h5>
                    <h2>{coursesData.length}</h2>
                  </div>
                </div>
              </Col>

              {/* Employees Card - COMMENTED */}
              {/* <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-employees"
                  onClick={() => handleCardClick("employees")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaUsers />
                  </div>
                  <div className="br-stat-details">
                    <h5>Employees</h5>
                    <h2>{employeesData.length}</h2>
                  </div>
                </div>
              </Col> */}

              {/* Projects Card - COMMENTED */}
              {/* <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-projects"
                  onClick={() => handleCardClick("projects")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="br-stat-details">
                    <h5>Projects</h5>
                    <h2>{projectsData.length}</h2>
                  </div>
                </div>
              </Col> */}
               
               {/* Total Registr student */}
              <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
  <div
    className="br-stat-card card-students"
      onClick={goToNextComponent}
    style={{ cursor: "pointer" }}
  >
    <div className="br-stat-icon">
      <FaUserGraduate />
    </div>
    <div className="br-stat-details">
      <h5>Students</h5>
      <h2>{studentCount}</h2>
    </div>
  </div>
</Col>

              {/* BrainRock Bills Card */}
              <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-bills"
                  onClick={goToBrainrockBills}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaFileInvoice />
                  </div>
                  <div className="br-stat-details">
                    <h5>BrainRock Bills</h5>
                    <h2>{brainrockBillsCount}</h2>
                  </div>
                </div>
              </Col>

              {/* Zee Bills Card */}
              <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-zee"
                  onClick={goToZeeBills}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaFileInvoice />
                  </div>
                  <div className="br-stat-details">
                    <h5>Zee Bills</h5>
                    <h2>{zeeBillsCount}</h2>
                  </div>
                </div>
              </Col>

               {/* Khelo Jito Users Card */}
              <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-khelo"
                  onClick={goToKheloJitoUsers}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="br-stat-details">
                    <h5>Khelo Jito Users</h5>
                    <h2>{kheloJitoUsersCount}</h2>
                  </div>
                </div>
              </Col>

              {/* Quiz Participants Card */}
              <Col lg={3} md={4} sm={6} xs={12} className="mb-3">
                <div
                  className="br-stat-card card-quiz"
                  onClick={goToQuizParticipants}
                  style={{ cursor: "pointer" }}
                >
                  <div className="br-stat-icon">
                    <FaUsers />
                  </div>
                  <div className="br-stat-details">
                    <h5>Quiz Participants</h5>
                    <h2>{quizParticipantsCount}</h2>
                  </div>
                </div>
              </Col>

            </Row>
          </div>

          {/* Table Section */}
          {selectedCardType && (
            <div id="table-section" className="br-box-container mt-5">
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
