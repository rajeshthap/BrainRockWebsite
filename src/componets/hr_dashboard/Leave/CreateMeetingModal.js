import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Badge,
  InputGroup,
  FormControl,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";

const CreateMeetingModal = ({ 
  show, 
  onHide, 
  user, 
  onMeetingCreated,
  existingMeeting = null,
  authToken
}) => {
  const [meetingForm, setMeetingForm] = useState({
    meeting_title: "",
    start_date_time: "",
    end_date_time: "",
    meeting_type: "online",
    meeting_link: "",
    meeting_location: "",
    agenda: "",
    employee_ids: [],
    meeting_recurrence: "none",
    notification_before: "1hour",
    meeting_priority: "medium"
  });
  
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [meetingSuccess, setMeetingSuccess] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [authDebug, setAuthDebug] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setAuthDebug({
        hasToken: !!authToken,
        tokenLength: authToken ? authToken.length : 0,
        tokenStart: authToken ? authToken.substring(0, 20) + "..." : "none"
      });
      
      try {
        // Try multiple authentication approaches
        let response;
        
        // Method 1: Using Bearer token only
        try {
          response = await axios.get(
            "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-names-list/",
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log("Success with Bearer token only");
        } catch (err) {
          console.log("Bearer token failed, trying with credentials");
          
          // Method 2: Using withCredentials only
          try {
            response = await axios.get(
              "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-names-list/",
              {
                withCredentials: true
              }
            );
            console.log("Success with credentials only");
          } catch (err2) {
            console.log("Credentials only failed, trying both");
            
            // Method 3: Using both
            response = await axios.get(
              "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-names-list/",
              {
                withCredentials: true,
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log("Trying with both methods");
          }
        }
        
        console.log("Final API Response:", response.data);
        
        // Handle the specific API response format
        if (response.data && Array.isArray(response.data)) {
          setEmployees(response.data);
          console.log("Employees loaded successfully:", response.data.length);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setEmployees(response.data.data);
          console.log("Employees loaded from data.data:", response.data.data.length);
        } else {
          console.error("Unexpected response format:", response.data);
          setEmployees([]);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        
        // Enhanced error logging
        if (err.response) {
          console.error("Error status:", err.response.status);
          console.error("Error data:", err.response.data);
          console.error("Error headers:", err.response.headers);
          
          if (err.response.status === 401) {
            setMeetingError("Authentication failed. Please check your credentials and try again.");
          } else if (err.response.status === 403) {
            setMeetingError("Access denied. You don't have permission to view employee list.");
          } else if (err.response.status === 500) {
            setMeetingError("Server error. Please try again later.");
          } else {
            setMeetingError(`Failed to load employees: ${err.response.status} error`);
          }
        } else if (err.request) {
          console.error("No response received:", err.request);
          setMeetingError("No response from server. Please check your network connection.");
        } else {
          console.error("Request setup error:", err.message);
          setMeetingError("Failed to load employee list. Please refresh and try again.");
        }
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (show) {
      fetchEmployees();
    }
  }, [show, authToken]);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = employees.filter(employee => 
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredEmployees(filtered);
    setShowSearchResults(true);
  }, [searchTerm, employees]);

  // If editing an existing meeting, populate form
  useEffect(() => {
    if (existingMeeting) {
      setMeetingForm({
        meeting_title: existingMeeting.meeting_title || "",
        start_date_time: existingMeeting.start_date_time 
          ? new Date(existingMeeting.start_date_time).toISOString().slice(0, 16) 
          : "",
        // Fixed: Changed from end_time to end_date_time
        end_date_time: existingMeeting.end_date_time 
          ? new Date(existingMeeting.end_date_time).toISOString().slice(0, 16) 
          : "",
        meeting_type: existingMeeting.meeting_type || "online",
        meeting_link: existingMeeting.meeting_link || "",
        meeting_location: existingMeeting.meeting_location || "",
        agenda: existingMeeting.agenda || "",
        employee_ids: existingMeeting.employee_ids || [],
        meeting_recurrence: existingMeeting.meeting_recurrence || "none",
        notification_before: existingMeeting.notification_before || "1hour",
        meeting_priority: existingMeeting.meeting_priority || "medium"
      });
    } else {
      // Reset form for new meeting
      setMeetingForm({
        meeting_title: "",
        start_date_time: "",
        end_date_time: "",
        meeting_type: "online",
        meeting_link: "",
        meeting_location: "",
        agenda: "",
        employee_ids: [],
        meeting_recurrence: "none",
        notification_before: "1hour",
        meeting_priority: "medium"
      });
    }
  }, [existingMeeting, show]);

  // Handle form input changes
  const handleMeetingFormChange = (e) => {
    const { name, value } = e.target;
    setMeetingForm({
      ...meetingForm,
      [name]: value,
    });
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Always show results when typing (unless empty)
    if (value.trim() !== "") {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Add employee to selection
  const addEmployee = (employee) => {
    // Check if employee is already selected
    if (!meetingForm.employee_ids.includes(employee.emp_id)) {
      setMeetingForm({
        ...meetingForm,
        employee_ids: [...meetingForm.employee_ids, employee.emp_id]
      });
    }
    setSearchTerm("");
    setShowSearchResults(false);
  };

  // Remove employee from selection
  const removeEmployee = (employeeId) => {
    setMeetingForm({
      ...meetingForm,
      employee_ids: meetingForm.employee_ids.filter(id => id !== employeeId)
    });
  };

  // Handle form submission
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSubmittingMeeting(true);
    setMeetingError("");
    setMeetingSuccess("");

    try {
      const meetingData = {
        meeting_title: meetingForm.meeting_title,
        start_date_time: new Date(meetingForm.start_date_time).toISOString(),
        end_date_time: new Date(meetingForm.end_date_time).toISOString(),
        meeting_type: meetingForm.meeting_type,
        agenda: meetingForm.agenda,
        employee_ids: meetingForm.employee_ids,
        meeting_recurrence: meetingForm.meeting_recurrence,
        notification_before: meetingForm.notification_before,
        meeting_priority: meetingForm.meeting_priority
      };

      if (meetingForm.meeting_type === "online") {
        meetingData.meeting_link = meetingForm.meeting_link;
      } else {
        meetingData.meeting_location = meetingForm.meeting_location;
      }

      // Add meeting_id to payload if updating an existing meeting
      if (existingMeeting) {
        meetingData.meeting_id = existingMeeting.meeting_id;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      let response;
      if (existingMeeting) {
        // Update meeting - use the general endpoint and include meeting_id in payload
        response = await axios.put(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/meetings/",
          meetingData,
          config
        );
      } else {
        // Create new meeting
        response = await axios.post(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/meeting-schedule/",
          meetingData,
          config
        );
      }

      setMeetingSuccess(existingMeeting ? "Meeting updated successfully!" : "Meeting created successfully!");
      
      if (onMeetingCreated) {
        onMeetingCreated();
      }
      
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setMeetingError(`Failed to ${existingMeeting ? 'update' : 'create'} meeting. Please try again.`);
      console.error("Error with meeting:", err);
    } finally {
      setSubmittingMeeting(false);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (id) => {
    const employee = employees.find(emp => emp.emp_id === id);
    return employee ? employee.full_name : id;
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      className="create-meeting-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{existingMeeting ? 'Edit Meeting' : 'Create New Meeting'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {meetingError && <Alert variant="danger">{meetingError}</Alert>}
        {meetingSuccess && <Alert variant="success">{meetingSuccess}</Alert>}
        
        <Form onSubmit={handleCreateMeeting}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="meeting_title"
                  value={meetingForm.meeting_title}
                  onChange={handleMeetingFormChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Type *</Form.Label>
                <Form.Select
                  name="meeting_type"
                  value={meetingForm.meeting_type}
                  onChange={handleMeetingFormChange}
                  required
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date & Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="start_date_time"
                  value={meetingForm.start_date_time}
                  onChange={handleMeetingFormChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="end_date_time"
                  value={meetingForm.end_date_time}
                  onChange={handleMeetingFormChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {meetingForm.meeting_type === "online" && (
            <Form.Group className="mb-3">
              <Form.Label>Meeting Link</Form.Label>
              <Form.Control
                type="text"
                name="meeting_link"
                value={meetingForm.meeting_link}
                onChange={handleMeetingFormChange}
                placeholder="https://zoom.com/meet/abc"
              />
            </Form.Group>
          )}

          {meetingForm.meeting_type === "offline" && (
            <Form.Group className="mb-3">
              <Form.Label>Conference Room *</Form.Label>
              <Form.Control
                type="text"
                name="meeting_location"
                value={meetingForm.meeting_location}
                onChange={handleMeetingFormChange}
                placeholder="Conference Room A"
                required={meetingForm.meeting_type === "offline"}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Agenda</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="agenda"
              value={meetingForm.agenda}
              onChange={handleMeetingFormChange}
              placeholder="Discuss sprint backlog"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Participants *</Form.Label>
            {loadingEmployees ? (
              <div className="text-center py-3">
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Loading employees...</span>
              </div>
            ) : (
              <div ref={searchInputRef} className="position-relative">
                <InputGroup className="mb-3">
                  <FormControl
                    placeholder="Search by employee name or ID..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchResults(true)}
                  />
                </InputGroup>
                
                {/* Search Results Dropdown */}
                {showSearchResults && filteredEmployees.length > 0 && (
                  <ListGroup 
                    className="position-absolute w-100" 
                    style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      zIndex: 1050,
                      top: '100%',
                      left: 0,
                      border: '1px solid #dee2e6',
                      borderTop: 'none',
                      borderRadius: '0 0 0.375rem 0.375rem'
                    }}
                  >
                    {filteredEmployees.map((employee) => (
                      <ListGroup.Item 
                        key={employee.emp_id} 
                        action 
                        onClick={() => addEmployee(employee)}
                        style={{ cursor: 'pointer' }}
                      >
                        {employee.emp_id} - {employee.full_name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                
                {/* No results message */}
                {showSearchResults && searchTerm.trim() !== "" && filteredEmployees.length === 0 && (
                  <div 
                    className="position-absolute w-100 p-2 bg-white border"
                    style={{ 
                      zIndex: 1050,
                      top: '100%',
                      left: 0,
                      border: '1px solid #dee2e6',
                      borderTop: 'none',
                      borderRadius: '0 0 0.375rem 0.375rem'
                    }}
                  >
                    No employees found matching "{searchTerm}"
                  </div>
                )}
                
                {/* Display selected employees as badges */}
                {meetingForm.employee_ids.length > 0 && (
                  <div className="mt-3">
                    <Form.Label className="mb-2">Selected Participants:</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {meetingForm.employee_ids.map((id) => (
                        <Badge 
                          key={id} 
                          bg="primary" 
                          className="d-flex align-items-center"
                        >
                          {getEmployeeName(id)}
                          <span 
                            className="ms-2" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeEmployee(id)}
                          >
                            &times;
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Recurrence</Form.Label>
                <Form.Select
                  name="meeting_recurrence"
                  value={meetingForm.meeting_recurrence}
                  onChange={handleMeetingFormChange}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Notification Before</Form.Label>
                <Form.Select
                  name="notification_before"
                  value={meetingForm.notification_before}
                  onChange={handleMeetingFormChange}
                >
                  <option value="15minutes">15 minutes</option>
                  <option value="30minutes">30 minutes</option>
                  <option value="1hour">1 hour</option>
                  <option value="2hours">2 hours</option>
                  <option value="1day">1 day</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="meeting_priority"
                  value={meetingForm.meeting_priority}
                  onChange={handleMeetingFormChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="secondary" 
              onClick={onHide}
              disabled={submittingMeeting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submittingMeeting}
            >
              {submittingMeeting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">
                    {existingMeeting ? 'Updating...' : 'Creating...'}
                  </span>
                </>
              ) : (
                existingMeeting ? 'Update Meeting' : 'Create Meeting'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateMeetingModal;