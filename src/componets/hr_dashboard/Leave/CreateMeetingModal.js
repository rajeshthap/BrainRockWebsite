import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Badge,
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

  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await axios.get(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-names-list/",
          {
            withCredentials: true
          }
        );
        
        setEmployees(response.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setMeetingError("Failed to load employee list. Please refresh and try again.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (show && authToken) {
      fetchEmployees();
    }
  }, [show, authToken]);

  // If editing an existing meeting, populate form
  useEffect(() => {
    if (existingMeeting) {
      setMeetingForm({
        meeting_title: existingMeeting.meeting_title || "",
        start_date_time: existingMeeting.start_date_time 
          ? new Date(existingMeeting.start_date_time).toISOString().slice(0, 16) 
          : "",
        end_date_time: existingMeeting.end_time 
          ? new Date(existingMeeting.end_time).toISOString().slice(0, 16) 
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

  // Handle multi-select for employees
  const handleEmployeeSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setMeetingForm({
      ...meetingForm,
      employee_ids: selectedOptions
    });
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

      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      let response;
      if (existingMeeting) {
        response = await axios.put(
          `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/meetings/${existingMeeting.id}/`,
          meetingData,
          config
        );
      } else {
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
              <>
                <Form.Select
                  multiple
                  value={meetingForm.employee_ids}
                  onChange={handleEmployeeSelection}
                  style={{ height: '120px' }}
                  required
                >
                  {employees.map((employee) => (
                    <option key={employee.emp_id} value={employee.emp_id}>
                      {employee.emp_id} - {employee.full_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Hold Ctrl (or Cmd on Mac) to select multiple employees
                </Form.Text>
              </>
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