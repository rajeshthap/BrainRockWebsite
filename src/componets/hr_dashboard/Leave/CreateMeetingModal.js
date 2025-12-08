import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";

const CreateMeetingModal = ({ 
  show, 
  onHide, 
  user, 
  onMeetingCreated,
  existingMeeting = null 
}) => {
  const [meetingForm, setMeetingForm] = useState({
    meeting_title: "",
    start_date_time: "",
    end_date_time: "",
    meeting_type: "online",
    meeting_link: "",
    agenda: "",
    employee_ids: [],
    meeting_recurrence: "none",
    notification_before: "1hour",
    meeting_priority: "medium"
  });
  
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [meetingSuccess, setMeetingSuccess] = useState("");
  const [participantInput, setParticipantInput] = useState(""); // For UI input of participants

  // If editing an existing meeting, populate form
  useEffect(() => {
    if (existingMeeting) {
      setMeetingForm({
        meeting_title: existingMeeting.title || "",
        start_date_time: existingMeeting.start_time 
          ? new Date(existingMeeting.start_time).toISOString().slice(0, 16) 
          : "",
        end_date_time: existingMeeting.end_time 
          ? new Date(existingMeeting.end_time).toISOString().slice(0, 16) 
          : "",
        meeting_type: existingMeeting.meeting_type || "online",
        meeting_link: existingMeeting.meeting_link || "",
        agenda: existingMeeting.agenda || "",
        employee_ids: existingMeeting.employee_ids || [],
        meeting_recurrence: existingMeeting.meeting_recurrence || "none",
        notification_before: existingMeeting.notification_before || "1hour",
        meeting_priority: existingMeeting.meeting_priority || "medium"
      });
      
      // Set participant input for display
      setParticipantInput(existingMeeting.employee_ids ? existingMeeting.employee_ids.join(", ") : "");
    } else {
      // Reset form for new meeting
      setMeetingForm({
        meeting_title: "",
        start_date_time: "",
        end_date_time: "",
        meeting_type: "online",
        meeting_link: "",
        agenda: "",
        employee_ids: [],
        meeting_recurrence: "none",
        notification_before: "1hour",
        meeting_priority: "medium"
      });
      setParticipantInput("");
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

  // Handle participants input change
  const handleParticipantsChange = (e) => {
    setParticipantInput(e.target.value);
    
    // Parse the comma-separated input into an array
    const participants = e.target.value
      .split(",")
      .map(p => p.trim())
      .filter(p => p !== "");
    
    setMeetingForm({
      ...meetingForm,
      employee_ids: participants
    });
  };

  // Handle form submission
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSubmittingMeeting(true);
    setMeetingError("");
    setMeetingSuccess("");

    try {
      // Prepare meeting data for API
      const meetingData = {
        ...meetingForm,
        // Convert date strings to proper format
        start_date_time: new Date(meetingForm.start_date_time).toISOString(),
        end_date_time: new Date(meetingForm.end_date_time).toISOString(),
      };

      let response;
      if (existingMeeting) {
        // Update existing meeting
        response = await axios.put(
          `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/meetings/${existingMeeting.id}/`,
          meetingData
        );
      } else {
        // Create new meeting
        response = await axios.post(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/meetings/",
          meetingData
        );
      }

      setMeetingSuccess(existingMeeting ? "Meeting updated successfully!" : "Meeting created successfully!");
      
      // Call the callback to refresh meeting data in parent component
      if (onMeetingCreated) {
        onMeetingCreated();
      }
      
      // Close modal after a short delay to show success message
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

          {meetingForm.meeting_type === "offline" && (
            <Form.Group className="mb-3">
              <Form.Label>Meeting Location *</Form.Label>
              <Form.Control
                type="text"
                name="meeting_location"
                value={meetingForm.meeting_location || ""}
                onChange={handleMeetingFormChange}
                required={meetingForm.meeting_type === "offline"}
              />
            </Form.Group>
          )}

          {meetingForm.meeting_type === "online" && (
            <Form.Group className="mb-3">
              <Form.Label>Meeting Link</Form.Label>
              <Form.Control
                type="text"
                name="meeting_link"
                value={meetingForm.meeting_link}
                onChange={handleMeetingFormChange}
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
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Participants (Employee IDs)</Form.Label>
            <Form.Control
              type="text"
              value={participantInput}
              onChange={handleParticipantsChange}
              placeholder="Enter employee IDs separated by commas (e.g., EMP/2025/001, EMP/2025/002)"
            />
            <Form.Text className="text-muted">
              Enter employee IDs separated by commas
            </Form.Text>
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