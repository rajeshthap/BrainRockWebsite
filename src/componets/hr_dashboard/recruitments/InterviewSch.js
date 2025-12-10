import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../assets/css/LeaveCalendar.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
import { Container, Modal, Button, Card, Row, Col, Spinner, Alert, Badge, Form, ButtonGroup, Pagination } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

function InterviewSch() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allInterviews, setAllInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [applicationData, setApplicationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDateInterviews, setSelectedDateInterviews] = useState([]);
  const [resultFilter, setResultFilter] = useState("pending"); // Filter state (pending, pass, fail)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [isMobile, setIsMobile] = useState(false); 
  const [isTablet, setIsTablet] = useState(false);
  const [editFormData, setEditFormData] = useState({
    interview_id: "", // Added interview_id to form data
    emp_id: "",
    emp_full_name: "",
    start_date_time: "",
    end_date_time: "",
    interview_type: "online",
  });
  const [employeeConflicts, setEmployeeConflicts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [apiError, setApiError] = useState(null); // New state for API errors
  
  // Table view states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTableView, setShowTableView] = useState(false);
   useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Only auto-set sidebar state on desktop (width >= 1024)
      // On mobile/tablet, preserve the user's toggle choice
      if (width >= 1024) {
        setSidebarOpen(true);
      }
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);
  // Get user info from auth context
  const { user } = useContext(AuthContext);
  const userRole = user?.role;
  const employeeId = user?.unique_id; // Get unique_id from login response (this is emp_id)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Set up axios with credentials
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Fetch interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/interview-schedule/`,
          {
            withCredentials: true
          }
        );
        
        // Extract data array from the response
        let interviewsData = [];
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          interviewsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          interviewsData = response.data;
        } else {
          throw new Error("Invalid response format");
        }
        
        setAllInterviews(interviewsData);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError("Failed to fetch interview data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, []);

  // Fetch application data for resume and other details
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/job-application/`,
          {
            withCredentials: true
          }
        );
        
        let appData = [];
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          appData = response.data.data;
        } else if (Array.isArray(response.data)) {
          appData = response.data;
        }
        
        setApplicationData(appData);
      } catch (err) {
        // Silently handle application data errors
      }
    };

    fetchApplicationData();
  }, []);

  // Filter interviews based on user role and result status
  useEffect(() => {
    if (allInterviews.length > 0) {
      let filtered = [];
      
      if (userRole === "admin" || userRole === "hr" || userRole === "HR") {
        // For HR/Admin, filter by result status (pending, pass, fail)
        filtered = allInterviews.filter(interview => {
          const interviewResult = interview.result || "pending";
          return interviewResult === resultFilter;
        });
      } else if (userRole === "employee") {
        // For employees, show interviews where emp_id matches their unique_id, filtered by result status
        if (!employeeId) {
          filtered = [];
        } else {
          const loginUniqueId = String(employeeId).trim();
          
          filtered = allInterviews.filter(interview => {
            const apiEmpId = String(interview.emp_id).trim();
            const interviewResult = interview.result || "pending";
            return apiEmpId === loginUniqueId && interviewResult === resultFilter;
          });
        }
      }
      
      setFilteredInterviews(filtered);
    }
  }, [allInterviews, userRole, employeeId, resultFilter]);

  // Function to get application details by application_id
  const getApplicationDetails = (applicationId) => {
    return applicationData.find(app => app.application_id === applicationId);
  };

  // Function to get interviews for a specific date
  const getInterviewsForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return filteredInterviews.filter(interview => {
      if (!interview.start_date_time && !interview.datetime) return false;
      
      // Handle both start_date_time and datetime field names
      const dateTimeField = interview.start_date_time || interview.datetime;
      const interviewDate = new Date(dateTimeField);
      const interviewYear = interviewDate.getFullYear();
      const interviewMonth = String(interviewDate.getMonth() + 1).padStart(2, '0');
      const interviewDay = String(interviewDate.getDate()).padStart(2, '0');
      const interviewDateStr = `${interviewYear}-${interviewMonth}-${interviewDay}`;
      
      return interviewDateStr === dateStr;
    });
  };

  // Function to handle date click
  const handleDateClick = (date) => {
    const interviews = getInterviewsForDate(date);
    if (interviews.length > 0) {
      setSelectedDateInterviews(interviews);
      setShowModal(true);
    }
  };

  // Function to highlight dates with interviews
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const interviews = getInterviewsForDate(date);
      if (interviews.length > 0) {
        return (
          <div className="interview-indicator">
            <span className="interview-count">{interviews.length}</span>
          </div>
        );
      }
    }
    return null;
  };

  // Function to add class to dates with interviews
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const interviews = getInterviewsForDate(date);
      if (interviews.length > 0) {
        return 'has-interview';
      }
    }
    return null;
  };

  // Function to format date and time
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Not scheduled";
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  // Function to format time only
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Not scheduled";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Count interviews by status for current user
  const countByStatus = (status) => {
    if (userRole === "admin" || userRole === "hr" || userRole === "HR") {
      // For HR/Admin, count all interviews with that status
      return allInterviews.filter(interview => {
        const interviewResult = interview.result || "pending";
        return interviewResult === status;
      }).length;
    } else if (userRole === "employee" && employeeId) {
      // For employees, count only their interviews with that status
      const loginUniqueId = String(employeeId).trim();
      return allInterviews.filter(interview => {
        const apiEmpId = String(interview.emp_id).trim();
        const interviewResult = interview.result || "pending";
        return apiEmpId === loginUniqueId && interviewResult === status;
      }).length;
    }
    return 0;
  };

  // Filter interviews by search term
  const getFilteredData = () => {
    let data = filteredInterviews;

    if (searchTerm.trim() === "") {
      return data;
    }

    const lowerSearch = searchTerm.toLowerCase();

    return data.filter(
      (item) =>
        item.applicant_name?.toLowerCase().includes(lowerSearch) ||
        item.interview_id?.toString().toLowerCase().includes(lowerSearch) ||
        item.application_id?.toString().toLowerCase().includes(lowerSearch) ||
        item.job_id?.toString().toLowerCase().includes(lowerSearch) ||
        item.emp_full_name?.toLowerCase().includes(lowerSearch) ||
        item.round?.toLowerCase().includes(lowerSearch)
    );
  };

  // Render interviews table
  const renderInterviewsTable = (items) => {
    // Show action column only for HR in pending tab, hide for employees and in pass/fail tabs
    const showActionColumn = (userRole === "admin" || userRole === "hr" || userRole === "HR") && resultFilter === "pending";
    const colSpanValue = showActionColumn ? "10" : "9";

    return (
      <table className="temp-rwd-table">
        <tbody>
          <tr>
            <th>S.No</th>
            <th>Interview ID</th>
            <th>Applicant Name</th>
            <th>Round</th>
            <th>Job ID</th>
            <th>Type</th>
            <th>Interviewer</th>
            <th>Scheduled Date</th>
            <th>Status</th>
            {showActionColumn && <th>Action</th>}
          </tr>
          {items.length > 0 ? (
            items.map((interview, index) => {
              const isEditable = (userRole === "admin" || userRole === "hr" || userRole === "HR") && 
                               (!interview.result || interview.result === "pending");
              
              return (
                <tr key={interview.id || interview.interview_id}>
                  <td data-th="S.No">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td data-th="Interview ID">{interview.interview_id || 'N/A'}</td>
                  <td data-th="Applicant Name">{interview.applicant_name || 'N/A'}</td>
                  <td data-th="Round">{interview.round || 'N/A'}</td>
                  <td data-th="Job ID">{interview.job_id || 'N/A'}</td>
                  <td data-th="Type">{interview.interview_type || 'N/A'}</td>
                  <td data-th="Interviewer">{interview.emp_full_name || 'N/A'}</td>
                  <td data-th="Scheduled Date">
                    {formatDateTime(interview.start_date_time || interview.datetime)}
                  </td>
                  <td data-th="Status">
                    <Badge bg={interview.result === 'pass' ? 'success' : interview.result === 'fail' ? 'danger' : 'warning'}>
                      {interview.result || 'Pending'}
                    </Badge>
                  </td>
                  {showActionColumn && (
                    <td data-th="Action">
                      {isEditable ? (
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => handleEditInterview(interview)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={colSpanValue} className="text-center">
                No interviews available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch employees list
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/get-employee-names-list/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      
      let employeeData = [];
      if (Array.isArray(data)) {
        employeeData = data;
      } else if (data.employees && Array.isArray(data.employees)) {
        employeeData = data.employees;
      } else if (data.employees) {
        employeeData = [data.employees];
      }
      
      setEmployees(employeeData);
    } catch (error) {
      setMessage("Failed to load employees list");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Open edit modal for HR users - Only for pending interviews
  const handleEditInterview = (interview) => {
    // Only HR can edit and only if interview status is pending
    if ((userRole !== "admin" && userRole !== "hr" && userRole !== "HR") || 
        (interview.result && interview.result !== "pending")) {
      return;
    }
    
    fetchEmployees(); // Fetch employees when opening edit modal
    
    setEditingInterview(interview);
    setEditFormData({
      interview_id: interview.interview_id, // Include interview_id in form data
      emp_id: interview.emp_id,
      emp_full_name: interview.emp_full_name,
      start_date_time: interview.start_date_time,
      end_date_time: interview.end_date_time,
      interview_type: interview.interview_type,
    });
    setEmployeeConflicts([]);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'emp_id') {
      const employee = employees.find(emp => emp.emp_id === value);
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
        emp_full_name: employee ? employee.full_name : ""
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Check conflicts when employee or time changes
    if (name === 'emp_id' || name === 'start_date_time' || name === 'end_date_time') {
      setTimeout(() => {
        const empId = name === 'emp_id' ? value : editFormData.emp_id;
        const startTime = name === 'start_date_time' ? value : editFormData.start_date_time;
        const endTime = name === 'end_date_time' ? value : editFormData.end_date_time;
        
        if (empId && startTime && endTime) {
          const conflicts = checkEmployeeAvailability(empId, startTime, endTime, editFormData.interview_id);
          setEmployeeConflicts(conflicts);
        }
      }, 0);
    }
  };

  // Check employee availability (excluding current interview)
  const checkEmployeeAvailability = (empId, startTime, endTime, currentInterviewId = null) => {
    if (!empId || !startTime || !endTime) return [];
    
    const conflicts = [];
    const newStartDateTime = new Date(startTime);
    const newEndDateTime = new Date(endTime);
    
    // Check against existing interviews
    allInterviews.forEach(interview => {
      // Skip current interview being edited
      if (currentInterviewId && interview.interview_id === currentInterviewId) {
        return;
      }
      
      if (interview.emp_id === empId) {
        const existingStartDateTime = new Date(interview.start_date_time);
        const existingEndDateTime = new Date(interview.end_date_time);
        
        const hasOverlap = (
          (newStartDateTime < existingEndDateTime && newEndDateTime > existingStartDateTime) ||
          (newStartDateTime < existingStartDateTime && newEndDateTime > existingEndDateTime) ||
          (newStartDateTime > existingStartDateTime && newStartDateTime < existingEndDateTime && newEndDateTime > existingEndDateTime)
        );
        
        if (hasOverlap) {
          conflicts.push({
            applicant: interview.applicant_name,
            round: interview.round,
            datetime: interview.start_date_time,
            interview_id: interview.interview_id
          });
        }
      }
    });
    
    return conflicts;
  };

  // Submit edit interview form with enhanced error handling
  const handleSubmitEditInterview = async (e) => {
    e.preventDefault();
    
    // Check for conflicts
    const conflicts = checkEmployeeAvailability(
      editFormData.emp_id,
      editFormData.start_date_time,
      editFormData.end_date_time,
      editFormData.interview_id
    );
    
    if (conflicts.length > 0) {
      setMessage("Employee has conflicts at the selected time. Please choose a different time.");
      setVariant("danger");
      setShowAlert(true);
      return;
    }
    
    try {
      // Log the data being sent for debugging
      console.log("Sending data to server:", editFormData);
      
      // Try using axios instead of fetch for better error handling
      const response = await axios.put(
        `${API_BASE_URL}/api/interview-schedule/`,
        editFormData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Server response:", response.data);
      
      setMessage("Interview updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      setApiError(null); // Clear any previous API errors
      
      // Refresh interview data
      const fetchInterviewData = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/interview-schedule/`,
            { withCredentials: true }
          );
          if (response.data) {
            let interviewsData = [];
            if (response.data.success && Array.isArray(response.data.data)) {
              interviewsData = response.data.data;
            } else if (Array.isArray(response.data)) {
              interviewsData = response.data;
            }
            setAllInterviews(interviewsData);
          }
        } catch (err) {
          console.error("Error refreshing interviews:", err);
        }
      };
      
      fetchInterviewData();
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating interview:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to update interview";
      
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        if (error.response.status === 500) {
          errorMessage = "Server error: The server encountered an error processing your request.";
          
          // Try to extract more specific error message if available
          if (error.response.data && error.response.data.message) {
            errorMessage = `Server error: ${error.response.data.message}`;
          }
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Store the full error for debugging
        setApiError({
          status: error.response.status,
          data: error.response.data,
          message: error.message
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        errorMessage = "No response from server. Please check your network connection.";
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
    }
  };

  // Calculate pagination data
  const filteredData = getFilteredData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh' }}>
    <SideNav 
  sidebarOpen={sidebarOpen} 
  setSidebarOpen={setSidebarOpen} 
  isMobile={isMobile}
  isTablet={isTablet}
/>

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body" style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <div className="leave-calendar-container mt-3">
            {/* Header */}
            <div className="dot-popup leave-clender-heading">
              <div className="">
                <h6>Interview Schedule Calendar</h6>
                {userRole === "employee" && employeeId && (
                  <p className="text-muted">Showing all your interviews (ID: {employeeId})</p>
                )}
                {userRole === "employee" && !employeeId && (
                  <p className="text-warning">
                    <strong>Unable to load employee ID.</strong> Please log in again or contact support.
                  </p>
                )}
              </div>
            </div>

            {/* Alert for notifications */}
            {showAlert && (
              <Alert variant={variant} className="mb-3" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}

            {/* Debug API Error - Only show in development */}
            {process.env.NODE_ENV === 'development' && apiError && (
              <Alert variant="danger" className="mb-3">
                <strong>API Error Details:</strong>
                <pre className="mt-2">{JSON.stringify(apiError, null, 2)}</pre>
              </Alert>
            )}

            {/* Filter Section - For Both HR/Admin and Employees */}
            {((userRole === "admin" || userRole === "hr" || userRole === "HR") || (userRole === "employee" && employeeId)) && (
              <div className="mb-4">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <strong>Filter by Status:</strong>
                  <ButtonGroup>
                    <Button 
                      variant={resultFilter === "pending" ? "primary" : "outline-primary"}
                      onClick={() => {
                        setResultFilter("pending");
                        setShowTableView(true);
                        setCurrentPage(1);
                        setSearchTerm("");
                      }}
                    >
                      Pending ({countByStatus("pending")})
                    </Button>
                    <Button 
                      variant={resultFilter === "pass" ? "success" : "outline-success"}
                      onClick={() => {
                        setResultFilter("pass");
                        setShowTableView(true);
                        setCurrentPage(1);
                        setSearchTerm("");
                      }}
                    >
                      Pass ({countByStatus("pass")})
                    </Button>
                    <Button 
                      variant={resultFilter === "fail" ? "danger" : "outline-danger"}
                      onClick={() => {
                        setResultFilter("fail");
                        setShowTableView(true);
                        setCurrentPage(1);
                        setSearchTerm("");
                      }}
                    >
                      Fail ({countByStatus("fail")})
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            )}

            {/* Calendar Section */}
            <div className="calendar-section">
              <div className="calendar-container">
                <h2>Interview Dates</h2>
                
                {loading ? (
                  <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : error ? (
                  <Alert variant="danger">
                    {error}
                    {error.includes("Authentication") && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="ms-2"
                        onClick={() => window.location.href = '/login'}
                      >
                        Go to Login
                      </Button>
                    )}
                  </Alert>
                ) : (
                  <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={today}
                    onClickDay={handleDateClick}
                    tileContent={getTileContent}
                    tileClassName={getTileClassName}
                  />
                )}
              </div>
            </div>

            {/* Interview Schedules Table View */}
            {showTableView && (
              <div className="br-box-container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Interview Schedules - {resultFilter.charAt(0).toUpperCase() + resultFilter.slice(1)}</h2>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Search interviews..."
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
                      onClick={() => {
                        setShowTableView(false);
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Close
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading interviews...</p>
                  </div>
                ) : (
                  <>
                    <Row className="mt-3">
                      <div className="col-md-12">
                        {renderInterviewsTable(currentItems)}
                      </div>
                    </Row>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                          <Pagination.Prev
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          />
                          {[...Array(totalPages).keys()].map((page) => (
                            <Pagination.Item
                              key={page + 1}
                              active={page + 1 === currentPage}
                              onClick={() => setCurrentPage(page + 1)}
                            >
                              {page + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Interview Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Interviews on {selectedDate.toLocaleDateString()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDateInterviews.length > 0 ? (
            <div>
              {selectedDateInterviews.map((interview) => {
                const applicationDetails = getApplicationDetails(interview.application_id);
                const isEditable = (userRole === "admin" || userRole === "hr" || userRole === "HR") && 
                                 (!interview.result || interview.result === "pending");
                
                return (
                  <Card key={interview.id || interview.interview_id} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <h5>{interview.applicant_name}</h5>
                          <p><strong>Interview ID:</strong> {interview.interview_id || 'N/A'}</p>
                          <p><strong>Application ID:</strong> {interview.application_id}</p>
                          <p><strong>Job ID:</strong> {interview.job_id}</p>
                          <p><strong>Round:</strong> {interview.round}</p>
                          <p><strong>Type:</strong> {interview.interview_type}</p>
                          <p><strong>Status:</strong> {interview.status}</p>
                          <p><strong>Result:</strong> <Badge bg={interview.result === 'pass' ? 'success' : interview.result === 'fail' ? 'danger' : 'warning'}>{interview.result || 'Pending'}</Badge></p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Start Time:</strong> {formatTime(interview.start_date_time || interview.datetime)}</p>
                          <p><strong>End Time:</strong> {formatTime(interview.end_date_time || interview.datetime)}</p>
                          {userRole === "employee" && applicationDetails && (
                            <div className="mt-3 p-3 bg-light rounded">
                              <h6 className="mb-2"><strong>Applicant Details:</strong></h6>
                              <p className="mb-1"><strong>Full Name:</strong> {applicationDetails.full_name}</p>
                              <p className="mb-1"><strong>Email:</strong> {applicationDetails.email}</p>
                              <p className="mb-1"><strong>Phone:</strong> {applicationDetails.phone}</p>
                              <p className="mb-1"><strong>Status:</strong> {applicationDetails.status}</p>
                              <p className="mb-1"><strong>Applied At:</strong> {new Date(applicationDetails.applied_at).toLocaleString()}</p>
                            </div>
                          )}
                        </Col>
                        {userRole === "employee" && applicationDetails && applicationDetails.resume && (
                          <Col md={12} className="mt-3">
                            <Button 
                              variant="primary" 
                              onClick={() => window.open(`${API_BASE_URL}${applicationDetails.resume}`, '_blank')}
                            >
                              View Candidate Resume
                            </Button>
                          </Col>
                        )}
                        {/* Edit Button for HR/Manager on Pending Interviews */}
                        {isEditable && (
                          <Col md={12} className="mt-3">
                            <Button 
                              variant="warning"
                              onClick={() => {
                                handleEditInterview(interview);
                                setShowModal(false);
                              }}
                            >
                              Edit Interview
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p>No interviews scheduled for this date.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Interview Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Interview - {editingInterview?.applicant_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingInterview && (
            <Form onSubmit={handleSubmitEditInterview}>
              <Form.Group className="mb-3">
                <Form.Label>Interview ID</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.interview_id}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Applicant Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingInterview.applicant_name}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Round</Form.Label>
                <Form.Control
                  type="text"
                  value={editingInterview.round}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Select New Interviewer</Form.Label>
                {employeesLoading ? (
                  <div className="d-flex justify-content-center">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <Form.Select
                    name="emp_id"
                    value={editFormData.emp_id}
                    onChange={handleEditFormChange}
                    required
                  >
                    <option value="">Select an employee</option>
                    {employees.map(employee => (
                      <option key={employee.emp_id} value={employee.emp_id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Interview Type</Form.Label>
                <Form.Select
                  name="interview_type"
                  value={editFormData.interview_type}
                  onChange={handleEditFormChange}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Start Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="start_date_time"
                  value={editFormData.start_date_time}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="end_date_time"
                  value={editFormData.end_date_time}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>

              {employeeConflicts.length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <strong>Conflicts detected:</strong>
                  <ul className="mb-0 mt-2">
                    {employeeConflicts.map((conflict, idx) => (
                      <li key={idx}>{conflict.applicant} - {conflict.round} at {formatDateTime(conflict.datetime)}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Button variant="primary" type="submit" className="me-2" disabled={employeeConflicts.length > 0}>
                Update Interview
              </Button>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default InterviewSch;