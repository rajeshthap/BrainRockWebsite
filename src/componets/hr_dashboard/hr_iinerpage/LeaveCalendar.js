import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../assets/css/LeaveCalendar.css";
import { Card } from "react-bootstrap";

function LeaveCalendar() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [leaveType, setLeaveType] = useState("annual");
  const [reason, setReason] = useState("");
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  // Handle date selection
  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  // Submit leave request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      showNotification("Please select at least one date", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: Date.now(),
        dates: [...selectedDates],
        type: leaveType,
        reason,
        status: "pending",
        submittedAt: new Date(),
      };

      setSubmittedRequests([...submittedRequests, newRequest]);
      setSelectedDates([]);
      setReason("");
      setIsSubmitting(false);
      setShowTooltip(false);
      showNotification("Leave request submitted successfully!", "success");
    }, 1000);
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date range for display
  const formatDateRange = (dates) => {
    if (dates.length === 0) return "No dates selected";

    const sortedDates = [...dates].sort((a, b) => a - b);
    const startDate = sortedDates[0].toLocaleDateString();
    const endDate = sortedDates[sortedDates.length - 1].toLocaleDateString();

    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  };

  // Format date for display in requests list
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="leave-calendar-container">
      <div className="d-flex justify-content-between leave-clender-heading">
        <h1>Leave Request Calendar</h1>
        <div className="tooltip-container" ref={tooltipRef}>
          <button
            className="tooltip-trigger"
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="Submit leave request"
          >
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </button>

          {showTooltip && (
            <div className="tooltip">
              <div className="tooltip-header">
                <h3>Submit Leave Request</h3>
                <button
                  className="close-tooltip"
                  onClick={() => setShowTooltip(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div>
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label htmlFor="leaveType">Leave Type</label>
                  <select
                    id="leaveType"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason (Optional)</label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || selectedDates.length === 0}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
              </div>
            
            </div>
          )}
        </div>
      </div>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="calendar-section">
        <div className="calendar-container">
          <h2>Select Dates</h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDates}
            selectRange={true}
            minDate={new Date()}
            tileClassName={({ date, view }) =>
              view === "month" &&
              selectedDates.some(
                (d) => d.toDateString() === date.toDateString()
              )
                ? "selected-date"
                : null
            }
          />
          <div className="selected-dates">
            <strong>Selected Dates:</strong> {formatDateRange(selectedDates)}
          </div>

       
        </div>
      </div>

      <div className="previous-requests">
        <h2>Previous Requests</h2>
        {submittedRequests.length === 0 ? (
          <p>No leave requests submitted yet.</p>
        ) : (
          <div className="requests-list">
            {submittedRequests.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-header">
                  <span className={`status ${request.status}`}>
                    {request.status}
                  </span>
                  <span className="leave-type">{request.type}</span>
                </div>
                <div className="request-dates">
                  {request.dates.length === 1 ? (
                    <span>{formatDate(request.dates[0])}</span>
                  ) : (
                    <span>
                      {formatDate(request.dates[0])} -{" "}
                      {formatDate(request.dates[request.dates.length - 1])}
                    </span>
                  )}
                  <span className="date-count">
                    ({request.dates.length} day
                    {request.dates.length > 1 ? "s" : ""})
                  </span>
                </div>
                {request.reason && (
                  <div className="request-reason">
                    <strong>Reason:</strong> {request.reason}
                  </div>
                )}
                <div className="request-submitted">
                  Submitted: {request.submittedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveCalendar;
