import React, { useState, useRef, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../assets/css/LeaveCalendar.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Define valid leave types
const VALID_LEAVE_TYPES = [
  "casual_leave",
  "earned_leave",
  "maternity_leave",
  "paternity_leave",
  "paid_leave",
];

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
  const [userGender, setUserGender] = useState("");
  const [isLeavePending, setIsLeavePending] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);

  const [options, setOptions] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leave_days, setLeave_days] = useState(1);

  const tooltipRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();   // <-- ADDED

  const employee_id = user?.unique_id;
  const role = user?.role;

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  // Set leave_days default
  useEffect(() => {
    if (leaveType === "casual_leave") {
      setLeave_days(1);
    } else if (["earned_leave", "maternity_leave", "paid_leave"].includes(leaveType)) {
      setLeave_days(1);
    }
  }, [leaveType]);

  // Gender + Leave options
  useEffect(() => {
    if (!employee_id) return;

    axios
      .get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-gender-salary/?employee_id=${employee_id}`
      )
      .then((res) => {
        const gender = String(res.data.gender).trim().toLowerCase();
        setUserGender(gender);

        let leaveOptions = [
          { value: "casual_leave", label: "Casual Leave (CL)" },
          { value: "without_pay", label: "Without Pay (WOP)" },
          { value: "earned_leave", label: "Earned Leave (EL)" },
          { value: "paid_leave", label: "Paid Leave (PL)" },
          { value: "paternity_leave", label: "Paternity Leave (PTL)" },
        ];

        if (gender === "female") {
          leaveOptions.push({
            value: "maternity_leave",
            label: "Maternity Leave (ML)",
          });
        }

        setOptions(leaveOptions);
      })
      .catch(() => {
        setOptions([
          { value: "casual_leave", label: "Casual Leave (CL)" },
          { value: "without_pay", label: "Without Pay (WOP)" },
          { value: "earned_leave", label: "Earned Leave (EL)" },
          { value: "paid_leave", label: "Paid Leave (PL)" },
          { value: "paternity_leave", label: "Paternity Leave (PTL)" },
        ]);
      });
  }, [employee_id]);

  // Fetch leave balance
  useEffect(() => {
    if (!employee_id) return;

    axios
      .get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`
      )
      .then((res) => {
        if (res.data.leave_balance) {
          setLeaveBalance(res.data.leave_balance);
        }
      });
  }, [employee_id]);

  // Submit leave
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!selectedDates.length) {
      showNotification("Please select at least one date", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDates = selectedDates.map((date) =>
        typeof date === "string" ? date : date.toISOString().split("T")[0]
      );

      const payload = {
        employee_id,
        role,
        leave_type: leaveType,
        dates: formattedDates,
        reason,
        leave_days: Number(leave_days),
      };

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

      setSelectedDates([]);
      setReason("");
      setLeave_days(1);
      setShowTooltip(false);

      showNotification("Leave Request Submitted!", "success");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      showNotification("Submission failed.", "error");
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

  // Fetch previous leave history
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
            status: item.status,
          }));

          setSubmittedRequests(formatted);
        }
      });
  }, [employee_id]);

  // Close popup when clicking outside
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
        {/* Leave Balance Box */}
        <div>
          <label>Leave Balance</label>
          <div className="leave-balance-box">
            {leaveBalance ? (
              <>
                <strong>CL:</strong> {leaveBalance.casual_leave} |{" "}
                <strong>EL:</strong> {leaveBalance.earned_leave} |{" "}
                <strong>PL:</strong> {leaveBalance.paid_leave} |{" "}
                <strong>ML:</strong> {leaveBalance.maternity_leave} |{" "}
                <strong>PTL:</strong> {leaveBalance.paternity_leave} |{" "}
                <strong>WOP:</strong> {leaveBalance.wop_leave}
              </>
            ) : (
              "No Balance Found"
            )}
          </div>
        </div>

        {/* Leave Calendar */}
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

        {/* Previous Requests Section */}
        <div className="previous-requests">
          <h2>Previous Requests</h2>

          {submittedRequests.length === 0 ? (
            <p>No leave requests submitted yet.</p>
          ) : (
            <>
              <div className="requests-list">
                {submittedRequests.slice(0, 1).map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-header">
                      <span className={`status ${req.status}`}>
                        {req.status}
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
                  </div>
                ))}
              </div>

              {/* Redirect Button */}
              {submittedRequests.length > 1 && (
                <div className="text-end">
                  <button
                    className="see-all-btn"
                    onClick={() => navigate("/LeaveStatus")}
                  >
                    See All ({submittedRequests.length})
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
