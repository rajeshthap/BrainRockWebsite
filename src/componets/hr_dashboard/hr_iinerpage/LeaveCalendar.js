import React, { useState, useRef, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../assets/css/LeaveCalendar.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

function LeaveCalendar() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [leaveType, setLeaveType] = useState("CL");
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

  // -----------------------------
  //  Get user info from context
  // -----------------------------
  const { user } = useContext(AuthContext);
  const employee_id = user?.unique_id;
  const role = user?.role;

  // --------------------------------------------------
  //  Select Dates
  // --------------------------------------------------
  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  // --------------------------------------------------
  //  Alerts
  // --------------------------------------------------
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // --------------------------------------------------
  //  Submit Leave POST API
  // --------------------------------------------------
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!selectedDates || selectedDates.length === 0) {
      showNotification("Please select at least one date", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDates = selectedDates.map((d) =>
        d.toISOString().split("T")[0]
      );

      const payload = {
        employee_id: employee_id,
        role: role,
        leave_type: leaveType,
        dates: formattedDates,
        reason: reason,
      };

      console.log("Sending Payload:", payload);

      await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leaves-apply/",
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Add to UI list
      const newRequest = {
        id: Date.now(), // local temp ID
        employee_id,
        role,
        leave_type: leaveType,
        dates: formattedDates,
        reason,
        status: "pending",
        submittedAt: new Date(),
      };

      setSubmittedRequests([...submittedRequests, newRequest]);

      // Reset Fields
      setSelectedDates([]);
      setReason("");
      setShowTooltip(false);
      setIsSubmitting(false);

      showNotification("Leave Request Submitted!", "success");
    } catch (err) {
      console.error("Submit Error:", err);
      setIsSubmitting(false);
      showNotification("Failed to submit", "error");
    }
  };

  // --------------------------------------------------
  //  Format date
  // --------------------------------------------------
  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --------------------------------------------------
  //  Accept / Reject / Cancel (Local only)
  // --------------------------------------------------
  const updateStatus = (id, status) => {
    setSubmittedRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: status } : req
      )
    );
  };
useEffect(() => {
  if (!employee_id) return;

  axios
    .get(
      `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leaves-apply/?employee_id=${employee_id}`,
      { withCredentials: true }
    )
    .then((res) => {
      console.log("Previous Leave Requests:", res.data);

      let dataArray = Array.isArray(res.data) ? res.data : [res.data];

      const formattedRequests = dataArray.map((item) => ({
        id: item.id,
        employee_id: item.employee_id,
        role: item.role,

        // FIX: Convert string dates → DATE OBJECTS
        dates: (item.dates || []).map(d => new Date(d)),

        leave_type: item.leave_type,
        reason: item.reason || "",
        status: item.status || "pending",

        submittedAt: item.created_at ? new Date(item.created_at) : new Date(),
      }));

      setSubmittedRequests(formattedRequests);
    })
    .catch((err) => console.log("Previous Request GET Error:", err));
}, [employee_id]);





  // --------------------------------------------------
  //  Close tooltip on outside click
  // --------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="leave-calendar-container mt-3">
      {/* Popup Button */}
      <div className="dot-popup leave-clender-heading">
        <div className="tooltip-container" ref={tooltipRef}>
          <button
            className="tooltip-trigger"
            onClick={() => setShowTooltip(!showTooltip)}
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
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="CL">Casual Leave (CL)</option>
                    <option value="EL">Earned Leave (EL)</option>
                    <option value="PL">Paid Leave (PL)</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="halfday">Half-Day Leave</option>
                    <option value="SL">Short Leave (SL)</option>
                    <option value="WOP">Without Pay (WOP)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
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
          )}
        </div>

        <h1>Leave Request Calendar</h1>
      </div>

      {/* Alerts */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Calendar */}
      <div className="calendar-section">
        <div className="calendar-container">
          <h2>Select Dates</h2>

          <Calendar
            onChange={handleDateChange}
            value={selectedDates}
            selectRange={true}
            minDate={new Date()}
            tileClassName={({ date }) =>
              selectedDates.some(
                (d) => new Date(d).toDateString() === date.toDateString()
              )
                ? "selected-date"
                : null
            }
          />
        </div>
      </div>

      {/* Requests List */}
   <div className="previous-requests">
  <h2>Previous Requests</h2>

  {submittedRequests.length === 0 ? (
    <p>No leave requests submitted yet.</p>
  ) : (
    <div className="requests-list">
      {submittedRequests.map((req) => (
        <div key={req.id} className="request-item">

          {/* Header */}
          <div className="request-header">
            <span className={`status ${req.status || "pending"}`}>
              {req.status || "pending"}
            </span>

            <span className="leave-type">
              {req.leave_type || req.type}
            </span>
          </div>

          {/* Dates */}
          <div className="request-dates">
            {req.dates.length === 1 ? (
              <span>{formatDate(req.dates[0])}</span>
            ) : (
              <span>
                {formatDate(req.dates[0])} —{" "}
                {formatDate(req.dates[req.dates.length - 1])}
              </span>
            )}
          </div>

          {/* Reason */}
          {req.reason && (
            <div className="request-reason">
              <strong>Reason:</strong> {req.reason}
            </div>
          )}

          {/* Submitted At */}
          <div className="request-submitted">
            Submitted: {req.submittedAt.toLocaleDateString()}
          </div>

          {/* ACTION BUTTONS — SHOW ONLY IF DATA EXISTS */}
          {req.id && (
            <div className="request-actions">
              <Button
                onClick={() => updateStatus(req.id, "accepted")}
                className="accept-btn"
              >
                Accept
              </Button>

              <Button
                onClick={() => updateStatus(req.id, "rejected")}
                className="reject-btn mx-3"
              >
                Reject
              </Button>

              <Button
                onClick={() => updateStatus(req.id, "cancelled")}
                className="cancel-btn"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>

    </div>
  );
}

export default LeaveCalendar;
