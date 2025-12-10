import React, { useEffect, useState } from "react";
import { Container, Row, Button, Modal, Form, Alert, Badge, Pagination, Spinner } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const JobApplications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [applications, setApplications] = useState([]);
  const [interviewSchedules, setInterviewSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
 const [isMobile, setIsMobile] = useState(false); 
  const [isTablet, setIsTablet] = useState(false);
  // Form state for viewing/editing application
  const [formData, setFormData] = useState({
    application_id: "",
    full_name: "",
    email: "",
    phone: "",
    status: "applied",
    job_id: "",
  });
  
  // Form state for scheduling interviews
  const [scheduleFormData, setScheduleFormData] = useState({
    application_id: "",
    job_id: "",
    emp_id: "",
    emp_full_name: "", // Add employee full name
    applicant_name: "", // Add applicant name
    interview_type: "online",
    start_date_time: "", // Add start date and time
    end_date_time: "", // Add end date and time
    round: "round:1", // Default to round 1
    result: "pending", // Default result is pending
  });
  
  const [editingApplicationId, setEditingApplicationId] = useState(null);
  const [schedulingForApplication, setSchedulingForApplication] = useState(null);
  const [currentRound, setCurrentRound] = useState("round:1");
  const [employeeConflicts, setEmployeeConflicts] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
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
  // Fetch all job applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      
      // Handle both single object and array responses
      const appData = data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : (Array.isArray(data) ? data : []);
      setApplications(appData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setMessage("Failed to load job applications");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch interview schedules
  const fetchInterviewSchedules = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/interview-schedule/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch interview schedules");
      const data = await response.json();
      
      // Handle both single object and array responses
      const scheduleData = data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : (Array.isArray(data) ? data : []);
      setInterviewSchedules(scheduleData);
    } catch (error) {
      console.error("Error fetching interview schedules:", error);
    }
  };

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
      
      // Log the raw response for debugging
      console.log("Raw Employee API Response:", data);
      
      // Handle both single object and array responses
      let employeeData = [];
      
      // Check if data is an array directly
      if (Array.isArray(data)) {
        employeeData = data;
      } 
      // Check if data has an employees property that is an array
      else if (data.employees && Array.isArray(data.employees)) {
        employeeData = data.employees;
      }
      // Check if data has an employees property that is not an array
      else if (data.employees) {
        employeeData = [data.employees];
      }
      
      // Log the parsed data for debugging
      console.log("Parsed Employee Data:", employeeData);
      console.log("Employee Data Length:", employeeData.length);
      
      setEmployees(employeeData);
      setEmployeesLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setMessage("Failed to load employees list");
      setVariant("danger");
      setShowAlert(true);
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchInterviewSchedules();
    fetchEmployees();
  }, []);

  // Get current interview status for an application
  const getCurrentInterviewStatus = (applicationId) => {
    const interviews = interviewSchedules.filter(schedule => 
      schedule.application_id === applicationId
    );
    
    if (interviews.length === 0) {
      return { scheduled: false, round: null, result: null, interview: null };
    }
    
    // Sort interviews by round to get the latest one
    const sortedInterviews = [...interviews].sort((a, b) => {
      // Extract round number for comparison
      const aRound = parseInt(a.round.split(':')[1]);
      const bRound = parseInt(b.round.split(':')[1]);
      return bRound - aRound; // Sort in descending order
    });
    
    // Find the latest interview that's still in progress (result is pending)
    const currentInterview = sortedInterviews.find(interview => interview.result === "pending");
    
    if (currentInterview) {
      return {
        scheduled: true,
        round: currentInterview.round,
        result: currentInterview.result,
        interview: currentInterview
      };
    }
    
    // If no pending interviews, return the latest interview
    const latestInterview = sortedInterviews[0];
    
    return {
      scheduled: true,
      round: latestInterview.round,
      result: latestInterview.result,
      interview: latestInterview
    };
  };

  // Determine which round button to show
  const getRoundButton = (applicationId, application) => {
    const interviewStatus = getCurrentInterviewStatus(applicationId);
    
    // If no interviews scheduled and applicant is shortlisted, show Round 1 button
    if (!interviewStatus.scheduled && application.status === "shortlisted") {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => openScheduleModal(application, "round:1")}
        >
          Apply for Round 1
        </Button>
      );
    }
    
    // If latest interview is round:1 and result is pass, show Round 2 button
    if (interviewStatus.round === "round:1" && interviewStatus.result === "pass") {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => openScheduleModal(application, "round:2")}
        >
          Apply for Round 2
        </Button>
      );
    }
    
    // If latest interview is round:2 and result is pass, show Final Round button
    if (interviewStatus.round === "round:2" && interviewStatus.result === "pass") {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => openScheduleModal(application, "round:3")}
        >
          Apply for Final Round
        </Button>
      );
    }
    
    // If latest interview is round:3 and result is pass, show Completed badge
    if (interviewStatus.round === "round:3" && interviewStatus.result === "pass") {
      return <Badge bg="success">Completed</Badge>;
    }
    
    // If interview is scheduled but result is pending, show current round info
    if (interviewStatus.scheduled && interviewStatus.result === "pending") {
      return (
        <div>
          <Badge bg="info">{interviewStatus.round} In Progress</Badge>
          <div className="mt-2">
            <Button
              variant="success"
              size="sm"
              className="me-1"
              onClick={() => handleUpdateInterviewResult(interviewStatus.interview.interview_id, interviewStatus.interview.round, "pass")}
            >
              Pass
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleUpdateInterviewResult(interviewStatus.interview.interview_id, interviewStatus.interview.round, "fail")}
            >
              Fail
            </Button>
          </div>
        </div>
      );
    }
    
    // If interview result is fail, show Rejected badge
    if (interviewStatus.scheduled && interviewStatus.result === "fail") {
      return <Badge bg="danger">Rejected</Badge>;
    }
    
    // Default case
    return <span className="text-muted">Not eligible</span>;
  };

  // Handle form input changes for application
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form input changes for interview scheduling
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    
    // If emp_id is changed, also update emp_full_name
    if (name === 'emp_id') {
      const employee = employees.find(emp => emp.emp_id === value);
      setScheduleFormData((prev) => ({
        ...prev,
        [name]: value,
        emp_full_name: employee ? employee.full_name : ""
      }));
    } else if (name === 'start_date_time' || name === 'end_date_time') {
      // If datetime is changed, check for employee conflicts
      setScheduleFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Check for conflicts after state update
      setTimeout(() => {
        const conflicts = checkEmployeeAvailability(
          scheduleFormData.emp_id, 
          scheduleFormData.start_date_time,
          scheduleFormData.end_date_time
        );
        setEmployeeConflicts(conflicts);
      }, 0);
    } else {
      setScheduleFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle status change directly from table
  const handleStatusChange = async (applicationId, application_id, newStatus) => {
    try {
      // Create FormData to send application_id in payload
      const dataToSend = new FormData();
      dataToSend.append('application_id', application_id);
      dataToSend.append('status', newStatus);

      // Use base endpoint for status updates
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "PUT",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      // Update the application in state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      setMessage("Status updated successfully!");
      setVariant("success");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Failed to update status");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Submit application form (PUT)
  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    try {
      // Create FormData to send application_id in payload
      const dataToSend = new FormData();
      dataToSend.append('application_id', formData.application_id);
      dataToSend.append('full_name', formData.full_name);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('status', formData.status);
      dataToSend.append('job_id', formData.job_id);

      // Use base endpoint for updates
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "PUT",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update application");

      setMessage("Application updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowModal(false);
      fetchApplications();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating application:", error);
      setMessage("Failed to update application");
      setVariant("danger");
      setShowAlert(true);
    }
  };

  // Delete application
  const handleDeleteApplication = async (applicationId, application_id) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    try {
      // Create FormData to send application_id in payload
      const dataToSend = new FormData();
      dataToSend.append('application_id', application_id);

      // Use base endpoint for delete
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "DELETE",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to delete application");

      setMessage("Application deleted successfully!");
      setVariant("success");
      setShowAlert(true);
      fetchApplications();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error deleting application:", error);
      setMessage("Failed to delete application");
      setVariant("danger");
      setShowAlert(true);
    }
  };

  // Open schedule interview modal
  const openScheduleModal = (application, round = "round:1") => {
    setSchedulingForApplication(application);
    setCurrentRound(round);
    setScheduleFormData({
      application_id: application.application_id,
      job_id: application.job_id,
      emp_id: "", // Reset employee selection
      emp_full_name: "", // Reset employee full name
      applicant_name: application.full_name, // Set applicant name from application
      interview_type: "online",
      start_date_time: "", // Reset start date and time
      end_date_time: "", // Reset end date and time
      round: round,
      result: "pending", // Always start with pending result
    });
    setEmployeeConflicts([]); // Reset conflicts
    setShowScheduleModal(true);
  };

  // Submit interview schedule form (POST)
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();

    // Check for employee conflicts before submitting
    const conflicts = checkEmployeeAvailability(
      scheduleFormData.emp_id, 
      scheduleFormData.start_date_time,
      scheduleFormData.end_date_time
    );
    
    if (conflicts.length > 0) {
      setMessage(`Employee has conflicts at the selected time. Please choose a different time.`);
      setVariant("danger");
      setShowAlert(true);
      return;
    }

    try {
      // Create FormData to send interview schedule data
      const dataToSend = new FormData();
      dataToSend.append('application_id', scheduleFormData.application_id);
      dataToSend.append('job_id', scheduleFormData.job_id);
      dataToSend.append('emp_id', scheduleFormData.emp_id);
      dataToSend.append('emp_full_name', scheduleFormData.emp_full_name); // Include employee full name
      dataToSend.append('applicant_name', scheduleFormData.applicant_name); // Include applicant name
      dataToSend.append('interview_type', scheduleFormData.interview_type);
      dataToSend.append('start_date_time', scheduleFormData.start_date_time); // Include start date and time
      dataToSend.append('end_date_time', scheduleFormData.end_date_time); // Include end date and time
      dataToSend.append('round', scheduleFormData.round);
      dataToSend.append('result', scheduleFormData.result); // Include result as pending

      // Use interview schedule endpoint for creating new schedule
      const response = await fetch(
        `${API_BASE_URL}/api/interview-schedule/`,
        {
          method: "POST",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to schedule interview");

      setMessage("Interview scheduled successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowScheduleModal(false);
      fetchInterviewSchedules(); // Refresh interview schedules

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      setMessage("Failed to schedule interview");
      setVariant("danger");
      setShowAlert(true);
    }
  };

  // Update interview result using PUT API with interview_id and result only
  const handleUpdateInterviewResult = async (interviewId, currentRound, result) => {
    try {
      // Create FormData to send interview_id and result in payload
      // We're NOT updating round here, only the result
      const dataToSend = new FormData();
      dataToSend.append('interview_id', interviewId);
      dataToSend.append('result', result);

      // Use interview schedule endpoint for updating with PUT
      const response = await fetch(
        `${API_BASE_URL}/api/interview-schedule/`,
        {
          method: "PUT",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update interview result");

      // Find the interview to get application_id
      const interview = interviewSchedules.find(i => i.interview_id === interviewId);
      
      // If this is the final round and result is pass, update application status
      if (interview && currentRound === "round:3" && result === "pass") {
        await handleStatusChange(
          applications.find(app => app.application_id === interview.application_id)?.id,
          interview.application_id,
          "completed"
        );
        
        setMessage("Candidate passed all rounds and application is completed!");
        setVariant("success");
        setShowAlert(true);
      } else if (interview && result === "pass") {
        // If not the final round and result is pass, just show success message
        // The next round button will appear automatically after refresh
        setMessage(`Candidate passed ${currentRound}!`);
        setVariant("success");
        setShowAlert(true);
      } else {
        setMessage("Interview result updated successfully!");
        setVariant("success");
        setShowAlert(true);
      }

      // Refresh interview schedules
      fetchInterviewSchedules();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating interview result:", error);
      setMessage("Failed to update interview result");
      setVariant("danger");
      setShowAlert(true);
    }
  };

  // Check if an employee is available at the selected datetime
  const checkEmployeeAvailability = (empId, startTime, endTime) => {
    if (!empId || !startTime || !endTime) return [];
    
    // Find the employee from the employees list
    const employee = employees.find(emp => emp.emp_id === empId);
    if (!employee) return [];
    
    // Check if the employee has any interviews at the selected datetime
    const conflicts = [];
    
    // Check against existing interviews in the schedule
    interviewSchedules.forEach(interview => {
      if (interview.emp_id === empId) {
        // Parse the datetime strings to Date objects for comparison
        const existingStartDateTime = new Date(interview.start_date_time);
        const existingEndDateTime = new Date(interview.end_date_time);
        const newStartDateTime = new Date(startTime);
        const newEndDateTime = new Date(endTime);
        
        // Check if the new interview time overlaps with the existing interview time
        // An overlap occurs if:
        // 1. New start time is before existing end time AND new end time is after existing start time
        // OR
        // 2. New start time is before existing start time AND new end time is after existing end time
        // OR
        // 3. New start time is between existing start and end time AND new end time is after existing end time
        const hasOverlap = (
          (newStartDateTime < existingEndDateTime && newEndDateTime > existingStartDateTime) ||
          (newStartDateTime < existingStartDateTime && newEndDateTime > existingEndDateTime) ||
          (newStartDateTime > existingStartDateTime && newStartDateTime < existingEndDateTime && newEndDateTime > existingEndDateTime)
        );
        
        if (hasOverlap) {
          conflicts.push({
            round: interview.round,
            datetime: interview.start_date_time,
            interview_id: interview.interview_id
          });
        }
      }
    });
    
    // Check against the employee's own scheduled interviews from the API response
    if (employee.interviews) {
      employee.interviews.forEach(interview => {
        const existingStartDateTime = new Date(interview.start_date_time);
        const existingEndDateTime = new Date(interview.end_date_time);
        const newStartDateTime = new Date(startTime);
        const newEndDateTime = new Date(endTime);
        
        // Check if the new interview time overlaps with the existing interview time
        const hasOverlap = (
          (newStartDateTime < existingEndDateTime && newEndDateTime > existingStartDateTime) ||
          (newStartDateTime < existingStartDateTime && newEndDateTime > existingEndDateTime) ||
          (newStartDateTime > existingStartDateTime && newStartDateTime < existingEndDateTime && newEndDateTime > existingEndDateTime)
        );
        
        if (hasOverlap) {
          conflicts.push({
            round: interview.round,
            datetime: interview.start_date_time,
            interview_id: interview.interview_id
          });
        }
      });
    }
    
    return conflicts;
  };

  const getStatusBadge = (status) => {
    const variants = {
      applied: "info",
      shortlisted: "primary",
      rejected: "danger",
      completed: "success",
    };
    return variants[status] || "secondary";
  };

  // Filter and paginate applications
  const filteredApplications = applications.filter(app =>
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
     <SideNav 
  sidebarOpen={sidebarOpen} 
  setSidebarOpen={setSidebarOpen} 
  isMobile={isMobile}
  isTablet={isTablet}
/>

      {/* Main Content */}
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <h2 className="mb-4">Job Applications</h2>

            {showAlert && (
              <Alert
                variant={variant}
                dismissible
                onClose={() => setShowAlert(false)}
                className="mb-3"
              >
                {message}
              </Alert>
            )}

            <div className="mb-3">
              <Form.Control
                    type="text"
                    placeholder="Search by applicant name, email, or job ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
            </div>

            {loading ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <p className="text-muted">No job applications found.</p>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Application ID</th>
                          <th>Applicant Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Job ID</th>
                          <th>Status</th>
                          <th>Applied Date</th>
                          <th>Resume</th>
                          <th>Interview</th>
                          <th>Actions</th>
                        </tr>

                        {paginatedApplications.map((app, index) => {
                          const interviewStatus = getCurrentInterviewStatus(app.application_id);
                          return (
                            <tr key={app.id}>
                              <td data-th="S.No">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td data-th="Application ID">{app.application_id}</td>
                              <td data-th="Applicant Name">{app.full_name}</td>
                              <td data-th="Email">{app.email}</td>
                              <td data-th="Phone">{app.phone}</td>
                              <td data-th="Job ID">{app.job_id}</td>
                              <td data-th="Status">
                                <Form.Select
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app.id, app.application_id, e.target.value)}
                                  size="sm"
                                  style={{ width: "120px" }}
                                >
                                  <option value="applied">Applied</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="completed">Completed</option>
                                </Form.Select>
                              </td>
                              <td data-th="Applied Date">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </td>
                              <td data-th="Resume">
                                {app.resume ? (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => window.open(`${API_BASE_URL}${app.resume}`, '_blank')}
                                  >
                                    View Resume
                                  </Button>
                                ) : (
                                  <span className="text-muted">No Resume</span>
                                )}
                              </td>
                              <td data-th="Interview">
                                {getRoundButton(app.application_id, app)}
                                
                                {/* Show current interview details if interview is scheduled */}
                                {interviewStatus.scheduled && interviewStatus.result === "pending" && (
                                  <div className="mt-2">
                                    <small className="text-muted">
                                      Scheduled: {new Date(interviewStatus.interview.start_date_time).toLocaleString()}
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td data-th="Actions">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteApplication(app.id, app.application_id)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center mt-4">
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* View/Edit Application Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitApplication}>
            <Form.Group className="mb-3">
              <Form.Label>Application ID</Form.Label>
              <Form.Control
                type="text"
                name="application_id"
                value={formData.application_id}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Job ID</Form.Label>
              <Form.Control
                type="text"
                name="job_id"
                value={formData.job_id}
                disabled
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="me-2">
              Update Application
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview for {currentRound === "round:1" ? "Round 1" : currentRound === "round:2" ? "Round 2" : "Final Round"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {schedulingForApplication && (
            <div className="mb-3">
              <p><strong>Applicant:</strong> {schedulingForApplication.full_name}</p>
              <p><strong>Application ID:</strong> {schedulingForApplication.application_id}</p>
              <p><strong>Job ID:</strong> {schedulingForApplication.job_id}</p>
            </div>
          )}
          <Form onSubmit={handleSubmitSchedule}>
            <Form.Group className="mb-3">
              <Form.Label>Application ID</Form.Label>
              <Form.Control
                type="text"
                name="application_id"
                value={scheduleFormData.application_id}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Job ID</Form.Label>
              <Form.Control
                type="text"
                name="job_id"
                value={scheduleFormData.job_id}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Interviewer</Form.Label>
              {employeesLoading ? (
                <div className="d-flex justify-content-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Form.Select
                  name="emp_id"
                  value={scheduleFormData.emp_id}
                  onChange={handleScheduleChange}
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
                value={scheduleFormData.interview_type}
                onChange={handleScheduleChange}
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
                value={scheduleFormData.start_date_time}
                onChange={handleScheduleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="end_date_time"
                value={scheduleFormData.end_date_time}
                onChange={handleScheduleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Round</Form.Label>
              <Form.Control
                type="text"
                name="round"
                value={scheduleFormData.round}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Result</Form.Label>
              <Form.Control
                type="text"
                name="result"
                value={scheduleFormData.result}
                disabled
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="me-2">
              Schedule Interview
            </Button>
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default JobApplications;