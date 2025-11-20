import React, { useState, useRef, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../assets/css/LeaveCalendar.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

// Define valid leave types as provided
const VALID_LEAVE_TYPES = ['casual_leave', 'earned_leave', 'maternity_leave', 'paternity_leave', 'paid_leave'];

function LeaveCalendar() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [leaveType, setLeaveType] = useState("casual_leave");
  const [reason, setReason] = useState("");
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [gender, setGender] = useState("");
  const [options, setOptions] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  
  // Initialize leave_days as a NUMBER
  const [leave_days, setLeave_days] = useState(1);

  const tooltipRef = useRef(null);
  const { user } = useContext(AuthContext);

  const employee_id = user?.unique_id;
  const role = user?.role;

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Set leave_days based on selected leave type
  useEffect(() => {
    if (leaveType === "casual_leave") {
      setLeave_days(1); // Default for Casual Leave
    } else if (["earned_leave", "maternity_leave", "paid_leave"].includes(leaveType)) {
      setLeave_days(1); // Default for other full-day leaves
    }
  }, [leaveType]);

  // Fetch user data including gender and set options
  useEffect(() => {
    if (!employee_id) return;
    
    axios.get(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-gender-salary/?employee_id=${employee_id}`)
      .then((res) => {
        console.log("Gender API Response:", res.data);
        const userGender = res.data.gender;
        setGender(userGender);

        // Base leave options using VALID_LEAVE_TYPES
        let leaveOptions = [
          { value: "casual_leave", label: "Casual Leave (CL)" },
          { value: "without_pay", label: "Without Pay (WOP)" },
          { value: "earned_leave", label: "Earned Leave (EL)" },
          { value: "paid_leave", label: "Paid Leave (PL)" },
        ];

        // Add maternity option only for female users
        if (userGender === "Female") {
          leaveOptions.push({ value: "maternity_leave", label: "Maternity Leave (ML)" });
        }

        setOptions(leaveOptions);
      })
      .catch((err) => {
        console.error("Error fetching gender/options:", err);
        // Even if API fails, we'll set default options after a timeout
        setTimeout(() => {
          let defaultOptions = [
            { value: "casual_leave", label: "Casual Leave (CL)" },
             { value: "without_pay", label: "Without Pay (WOP)" },
              { value: "earned_leave", label: "Earned Leave (EL)" },
              { value: "paid_leave", label: "Paid Leave (PL)" },
            { value: "short_leave", label: "Short Leave (SL)" },
           
          ];
          setOptions(defaultOptions);
        }, 1000);
      });
  }, [employee_id]);

  // Fetch leave balance data
  useEffect(() => {
    if (!employee_id) return;
    
    axios.get(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`)
      .then((res) => {
        console.log("Leave Balance Response:", res.data);
        if (res.data.leave_balance) {
          setLeaveBalance(res.data.leave_balance);
        }
      })
      .catch((err) => {
        console.error("Error fetching leave balance:", err);
      });
  }, [employee_id]);

  // Submit leave request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!selectedDates.length) {
      showNotification("Please select at least one date", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDates = selectedDates.map(date =>
        typeof date === 'string' ? date : date.toISOString().split("T")[0]
      );

      const payload = {
        employee_id,
        role,
        leave_type: leaveType,
        dates: formattedDates,
        reason,
        leave_days: Number(leave_days),
      };

      console.log("Payload being sent (stringified):", JSON.stringify(payload));

      const response = await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leaves-apply/",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const newReq = {
        id: response.data.id || Date.now(),
        employee_id,
        role,
        leave_type: leaveType,
        dates: formattedDates,
        reason,
        status: "pending",
        submittedAt: new Date(),
      };

      setSubmittedRequests([...submittedRequests, newReq]);

      // Reset form
      setSelectedDates([]);
      setReason("");
      setLeave_days(1);
      setShowTooltip(false);

      showNotification("Leave Request Submitted!", "success");
      
      // Refresh leave balance after successful submission
      axios.get(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`)
        .then((res) => {
          if (res.data.leave_balance) {
            setLeaveBalance(res.data.leave_balance);
          }
        })
        .catch((err) => {
          console.error("Error refreshing leave balance:", err);
        });
    } catch (err) {
      console.error("SUBMIT ERROR ===>", err.response || err);

      if (err.response && err.response.data) {
        const errorData = err.response.data;
        let errorMessage = "Submission failed: ";
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(field => {
            errorMessage += `${field}: ${errorData[field].join(", ")} `;
          });
        } else {
          errorMessage = errorData.detail || "An unknown error occurred.";
        }
        showNotification(errorMessage, "error");
      } else {
        showNotification("Submission failed. Please check console.", "error");
      }
    }

    setIsSubmitting(false);
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateStatus = (id, status) => {
    setSubmittedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  // Fetch leave history
  useEffect(() => {
    if (!employee_id) return;

    axios
      .get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`,
        { withCredentials: true }
      )
      .then((res) => {
        const historyArray = res.data?.leave_history;

        if (Array.isArray(historyArray)) {
          const formatted = historyArray.map((item) => ({
            id: item.id,
            employee_id: item.employee_id,
            role: item.role,
            leave_type: item.leave_type,
            dates: Array.isArray(item.dates) ? item.dates : [],
            reason: item.reason,
            submittedAt: new Date(item.created_at),
          }));

          setSubmittedRequests(formatted);
        }
      })
      .catch((err) => console.log("GET Error:", err));
  }, [employee_id]);

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
    <>
    <div className="leave-calendar-container mt-3">
      {/* Leave Balance Card */}
   <div>
  <label>Leave Balance</label>
  <div className="leave-balance-box">
    {leaveBalance ? (
      <>
        <strong className="leave-item leave-cl">CL:</strong>
        <span className="leave-value leave-cl">{leaveBalance.casual_leave ?? 0}</span>
        |&nbsp;

        <strong className="leave-item leave-el">EL:</strong>
        <span className="leave-value leave-el">{leaveBalance.earned_leave ?? 0}</span>
        |&nbsp;

        <strong className="leave-item leave-pl">PL:</strong>
        <span className="leave-value leave-pl">{leaveBalance.paid_leave ?? 0}</span>
        |&nbsp;

        <strong className="leave-item leave-ml">ML:</strong>
        <span className="leave-value leave-ml">{leaveBalance.maternity_leave ?? 0}</span>
        |&nbsp;

        <strong className="leave-item leave-ptl">PTL:</strong>
        <span className="leave-value leave-ptl">{leaveBalance.paternity_leave ?? 0}</span>
        |&nbsp;

        <strong className="leave-item leave-wop">WOP:</strong>
        <span className="leave-value leave-wop">{leaveBalance.wop_leave ?? 0}</span>
      </>
    ) : (
      "No Balance Found"
    )}
  </div>
</div>



      {/* Popup Button */}
      <div className="dot-popup leave-clender-heading">
        <div className="tooltip-container" ref={tooltipRef}>
          <button
            className="tooltip-trigger"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
          </button>

          {showTooltip && (
            <div className="tooltip">
              <div className="tooltip-header">
                <h3>Submit Leave Request</h3>
                <button className="close-tooltip" onClick={() => setShowTooltip(false)}>×</button>
              </div>

              <form onSubmit={handleSubmitRequest}>
                {/* Leave Type */}
                <div>
                  <label>Leave Type</label>
                  <select 
                    value={leaveType} 
                    onChange={(e) => setLeaveType(e.target.value)} 
                    className="form-control"
                  >
                    {options.map((opt, idx) => (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration - ONLY FOR CASUAL LEAVE */}
                {leaveType === "casual_leave" && (
                  <div className="form-group">
                    <label>Duration</label>
                    <select
                      value={leave_days}
                      onChange={(e) => setLeave_days(Number(e.target.value))}
                      className="form-control"
                    >
                      <option value={1}>Full Day</option>
                      <option value={0.5}>Half Day (HD)</option>
                      <option value={0.25}>Short Leave (SL)</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="form-control"
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
    
<div className="">
      <h6>Leave Request Calendar</h6>
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
            value={null}
            selectRange={false}
            minDate={new Date()}
            onClickDay={(date) => {
              const d = date.toISOString().split("T")[0];
              if (selectedDates.includes(d)) {
                setSelectedDates(selectedDates.filter((x) => x !== d));
              } else {
                setSelectedDates([...selectedDates, d]);
              }
            }}
            tileClassName={({ date }) => {
              const d = date.toISOString().split("T")[0];
              return selectedDates.includes(d) ? "selected-date" : "";
            }}
          />
        </div>
      </div>

      <div className="previous-requests">
        <h2>Previous Requests</h2>

        {submittedRequests.length === 0 ? (
          <p>No leave requests submitted yet.</p>
        ) : (
          <>
            <div className={`requests-list ${showAllRequests ? "show-all" : ""}`}>
              {submittedRequests
                .slice(0, showAllRequests ? submittedRequests.length : 1)
                .map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-header">
                      <span className={`status ${req.status || "pending"}`}>
                        {req.status || "pending"}
                      </span>
                      <span className="leave-type">{req.leave_type}</span>
                    </div>

                    <div className="request-dates">
                      {req.dates.length === 1
                        ? formatDate(req.dates[0])
                        : `${formatDate(req.dates[0])} — ${formatDate(
                            req.dates[req.dates.length - 1]
                          )}`}
                    </div>

                    {req.reason && (
                      <div className="request-reason">
                        <strong>Reason:</strong> {req.reason}
                      </div>
                    )}

                    <div className="request-submitted">
                      Submitted: {req.submittedAt.toLocaleDateString()}
                    </div>

                    <div className="request-actions">
                      <Button onClick={() => updateStatus(req.id, "accepted")} className="accept-btn">
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
                  </div>
                ))}
            </div>

            {submittedRequests.length > 1 && (
              <div className="text-end">
                <button
                  className="see-all-btn"
                  onClick={() => setShowAllRequests(!showAllRequests)}
                >
                  {showAllRequests
                    ? "Show Less"
                    : `See All (${submittedRequests.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
 

  </div>


 </>
  );
}

export default LeaveCalendar;