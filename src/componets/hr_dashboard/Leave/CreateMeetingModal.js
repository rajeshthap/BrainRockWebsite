// CreateMeetingModal.js
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
    meeting_date_and_time: "",
    end_time: "",
    meeting_type: "Online",
    meeting_location: "",
    meeting_link: "",
    agenda: "",
    organized_by: user?.name || "",
    participants: "",
    meeting_recurrence: "None",
    notification: "1 hour",
    meeting_URL: "",
    meeting_priority: "Medium",
    meeting_status: "Scheduled",
  });
  
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [meetingSuccess, setMeetingSuccess] = useState("");

  // If editing an existing meeting, populate the form
  useEffect(() => {
    if (existingMeeting) {
      setMeetingForm({
        meeting_title: existingMeeting.title || "",
        meeting_date_and_time: existingMeeting.start_time 
          ? new Date(existingMeeting.start_time).toISOString().slice(0, 16) 
          : "",
        end_time: existingMeeting.end_time 
          ? new Date(existingMeeting.end_time).toISOString().slice(0, 16) 
          : "",
        meeting_type: existingMeeting.meeting_type || "Online",
        meeting_location: existingMeeting.meeting_location || "",
        meeting_link: existingMeeting.meeting_link || "",
        agenda: existingMeeting.agenda || "",
        organized_by: existingMeeting.organized_by || user?.name || "",
        participants: existingMeeting.participants || "",
        meeting_recurrence: existingMeeting.meeting_recurrence || "None",
        notification: existingMeeting.notification || "1 hour",
        meeting_URL: existingMeeting.meeting_URL || "",
        meeting_priority: existingMeeting.meeting_priority || "Medium",
        meeting_status: existingMeeting.meeting_status || "Scheduled",
      });
    } else {
      // Reset form for new meeting
      setMeetingForm({
        meeting_title: "",
        meeting_date_and_time: "",
        end_time: "",
        meeting_type: "Online",
        meeting_location: "",
        meeting_link: "",
        agenda: "",
        organized_by: user?.name || "",
        participants: "",
        meeting_recurrence: "None",
        notification: "1 hour",
        meeting_URL: "",
        meeting_priority: "Medium",
        meeting_status: "Scheduled",
      });
    }
  }, [existingMeeting, show, user]);

  // Handle form input changes
  const handleMeetingFormChange = (e) => {
    const { name, value } = e.target;
    setMeetingForm({
      ...meetingForm,
      [name]: value,
    });
  };

  // Handle form submission
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSubmittingMeeting(true);
    setMeetingError("");
    setMeetingSuccess("");

    try {
      // Prepare the meeting data for API
      const meetingData = {
        ...meetingForm,
        employee_id: user?.unique_id,
        // Convert date strings to proper format if needed
        meeting_date_and_time: new Date(meetingForm.meeting_date_and_time).toISOString(),
        end_time: new Date(meetingForm.end_time).toISOString(),
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
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
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
                  name="meeting_date_and_time"
                  value={meetingForm.meeting_date_and_time}
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
                  name="end_time"
                  value={meetingForm.end_time}
                  onChange={handleMeetingFormChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {meetingForm.meeting_type === "Offline" && (
            <Form.Group className="mb-3">
              <Form.Label>Meeting Location *</Form.Label>
              <Form.Control
                type="text"
                name="meeting_location"
                value={meetingForm.meeting_location}
                onChange={handleMeetingFormChange}
                required={meetingForm.meeting_type === "Offline"}
              />
            </Form.Group>
          )}

          {meetingForm.meeting_type === "Online" && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Meeting Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="meeting_link"
                      value={meetingForm.meeting_link}
                      onChange={handleMeetingFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Meeting URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="meeting_URL"
                      value={meetingForm.meeting_URL}
                      onChange={handleMeetingFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
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

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Organized By</Form.Label>
                <Form.Control
                  type="text"
                  name="organized_by"
                  value={meetingForm.organized_by}
                  onChange={handleMeetingFormChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Participants</Form.Label>
                <Form.Control
                  type="text"
                  name="participants"
                  value={meetingForm.participants}
                  onChange={handleMeetingFormChange}
                  placeholder="Enter participant names separated by commas"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Recurrence</Form.Label>
                <Form.Select
                  name="meeting_recurrence"
                  value={meetingForm.meeting_recurrence}
                  onChange={handleMeetingFormChange}
                >
                  <option value="None">None</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Notification</Form.Label>
                <Form.Select
                  name="notification"
                  value={meetingForm.notification}
                  onChange={handleMeetingFormChange}
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="1 day">1 day</option>
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
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Meeting Status</Form.Label>
            <Form.Select
              name="meeting_status"
              value={meetingForm.meeting_status}
              onChange={handleMeetingFormChange}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>

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