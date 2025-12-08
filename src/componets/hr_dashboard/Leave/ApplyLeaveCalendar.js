import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Modal,
  Spinner,
  Tabs,
  Tab,
  Button,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import { AuthContext } from "../../context/AuthContext";
import CreateMeetingModal from "./CreateMeetingModal";
import "../../../assets/css/applayleave.css";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../../assets/css/LeaveCalendar.css";

const localizer = momentLocalizer(moment);

const ApplyLeaveCalendar = () => {
  const { user } = useContext(AuthContext);
  const employee_id = user?.unique_id;
  const userRole = user?.role; // Assuming role is available in user object

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveEvents, setLeaveEvents] = useState([]);
  const [meetingEvents, setMeetingEvents] = useState([]);

  const [filteredLeave, setFilteredLeave] = useState([]);
  const [filteredMeeting, setFilteredMeeting] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentView, setCurrentView] = useState("month");
  const [date, setDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // State for create meeting modal
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // NEW: Filter states for different views
  const [leaveFilter, setLeaveFilter] = useState(userRole === 'employee' ? 'approved' : 'absent');
  const [allEmployeesData, setAllEmployeesData] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ---------------------------------------
      Fetch Leave Data
  ----------------------------------------- */
  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Different API endpoints based on user role
      const apiUrl = userRole === 'employee' 
        ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`
        : 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/'; // For admin/HR, get all employees

      const res = await axios.get(apiUrl);
      
      // Process the response differently based on user role
      let allLeaveHistory = [];
      
      if (userRole === 'employee') {
        // For employees, use their own leave history
        setLeaveBalance(res.data.leave_balance);
        allLeaveHistory = res.data.leave_history || [];
      } else {
        // For admin/HR, collect all employees' leave history
        allLeaveHistory = [];
        setAllEmployeesData(res.data.employees || []);
        res.data.employees.forEach(emp => {
          if (emp.leave_history && emp.leave_history.length > 0) {
            // Add employee name and role to each leave entry
            const leaveHistoryWithEmployee = emp.leave_history.map(leave => ({
              ...leave,
              employee_name: emp.leave_balance.employee_name,
              employee_role: emp.leave_history[0]?.role || 'N/A'
            }));
            allLeaveHistory = [...allLeaveHistory, ...leaveHistoryWithEmployee];
          }
        });
      }

      // Process events based on the current filter
      let filteredHistory = [];
      
      if (userRole === 'employee') {
        // For employees, filter by status
        if (leaveFilter === 'approved') {
          filteredHistory = allLeaveHistory.filter(item => item.status === "approved");
        } else if (leaveFilter === 'pending') {
          filteredHistory = allLeaveHistory.filter(item => item.status === "pending");
        } else {
          filteredHistory = allLeaveHistory; // All leaves
        }
      } else {
        // For HR, show either absent or present
        if (leaveFilter === 'absent') {
          filteredHistory = allLeaveHistory.filter(item => item.status === "approved");
        } else {
          // For present, we need to create events for employees who are NOT on approved leave
          // We'll handle this differently below
          filteredHistory = [];
        }
      }

      // Create events for the filtered history
      let events = filteredHistory
        .map((item) => {
          // Handle multiple dates for a single leave request
          const eventsForDates = item.dates.map(dateStr => {
            const eventDate = new Date(dateStr);
            return {
              id: `${item.id}-${dateStr}`, // Unique ID combining leave ID and date
              title: `${item.employee_name} - ${item.leave_type.toUpperCase()}`,
              start: eventDate,
              end: eventDate,
              allDay: true,
              color: item.status === "approved" ? "#28a745" : item.status === "pending" ? "#ffc107" : "#dc3545", // Different colors for different statuses
              type: "leave",
              data: item,
            };
          });
          
          return eventsForDates;
        })
        .flat(); // Flatten the array of arrays

      // For HR viewing present employees (only for HR, not employees)
      if (userRole !== 'employee' && leaveFilter === 'present') {
        // Get all unique dates in the current view
        const allDates = [];
        const startDate = moment(date).startOf(currentView === 'month' ? 'month' : currentView === 'week' ? 'week' : 'day');
        const endDate = moment(date).endOf(currentView === 'month' ? 'month' : currentView === 'week' ? 'week' : 'day');
        
        // Generate all dates in the current view
        for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
          allDates.push(m.format('YYYY-MM-DD'));
        }
        
        // For each date, find employees who are NOT on approved leave
        allDates.forEach(dateStr => {
          // Get all employees who are on approved leave on this date
          const absentEmployees = new Set();
          allLeaveHistory
            .filter(item => item.status === "approved" && item.dates.includes(dateStr))
            .forEach(item => absentEmployees.add(item.employee_id));
          
          // Find all employees who are NOT absent
          res.data.employees
            .filter(emp => !absentEmployees.has(emp.employee))
            .forEach(emp => {
              events.push({
                id: `present-${emp.employee}-${dateStr}`,
                title: `${emp.leave_balance.employee_name} - Present`,
                start: new Date(dateStr),
                end: new Date(dateStr),
                allDay: true,
                color: "#007bff", // Blue for present
                type: "present",
                data: {
                  employee_name: emp.leave_balance.employee_name,
                  employee_id: emp.employee,
                  status: "present",
                  date: dateStr
                },
              });
            });
        });
      }

      setLeaveEvents(events);
      setFilteredLeave(events);
    } catch (err) {
      setError("Failed to load leave data.");
      console.error("Error fetching leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------
      Fetch Meeting Data
  ----------------------------------------- */
  const fetchMeetingData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/meetings/?employee_id=${employee_id}`
      );

      const events = res.data.meetings.map((m) => ({
        id: m.id,
        title: `Meeting: ${m.title}`,
        start: new Date(m.start_time),
        end: new Date(m.end_time),
        color: "#007bff",
        type: "meeting",
        data: m,
      }));

      setMeetingEvents(events);
      setFilteredMeeting(events);
    } catch (err) {
      setError("Failed to load meeting schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
    fetchMeetingData();
  }, [employee_id, userRole, leaveFilter]);

  /* ===========================================================
         FILTER EVENTS BASED ON CURRENT DATE + VIEW
     =========================================================== */

  const filterEvents = () => {
    let start, end;

    if (currentView === "month") {
      start = moment(date).startOf("month");
      end = moment(date).endOf("month");
    } else if (currentView === "week") {
      start = moment(date).startOf("week");
      end = moment(date).endOf("week");
    } else {
      start = moment(date).startOf("day");
      end = moment(date).endOf("day");
    }

    const filterByRange = (events) =>
      events.filter((ev) =>
        moment(ev.start).isBetween(start, end, undefined, "[]")
      );

    setFilteredLeave(filterByRange(leaveEvents));
    setFilteredMeeting(filterByRange(meetingEvents));
  };

  useEffect(() => {
    filterEvents();
  }, [leaveEvents, meetingEvents, date, currentView]);

  /* ---------------------------------------
      Calendar Event Styling
  ----------------------------------------- */
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: "6px",
      color: "white",
      padding: "4px",
      fontSize: "12px",
      border: "none",
      textAlign: "center",
    },
  });

  /* ---------------------------------------
      User Click (event)
  ----------------------------------------- */
  const handleSelectEvent = (event) => {
    if (event.type === "meeting") {
      setSelectedMeeting(event.data);
      setShowCreateMeetingModal(true);
    } else if (event.type === "present") {
      // For present events, we'll show a simple modal with employee info
      setSelectedData(event.data);
      setShowModal(true);
    } else {
      setSelectedData(event.data);
      setShowModal(true);
    }
  };

  /* ---------------------------------------
      USER NAVIGATE (Next / Back / Today)
  ----------------------------------------- */
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  /* ---------------------------------------
      USER VIEW CHANGE (Month/Week/Day)
  ----------------------------------------- */
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Custom toolbar component with enhanced navigation
  const CustomToolbar = (toolbar) => {
    const goToPrevious = () => {
      const newDate = new Date(date);
      if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (currentView === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      handleNavigate(newDate);
    };

    const goToNext = () => {
      const newDate = new Date(date);
      if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (currentView === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      handleNavigate(newDate);
    };

    const goToToday = () => {
      handleNavigate(new Date());
    };

    const handleMonthChange = (e) => {
      const newDate = new Date(date);
      newDate.setMonth(parseInt(e.target.value));
      handleNavigate(newDate);
    };

    const handleYearChange = (e) => {
      const newDate = new Date(date);
      newDate.setFullYear(parseInt(e.target.value));
      handleNavigate(newDate);
    };

    // Generate month options
    const months = moment.months();
    const currentMonth = date.getMonth();

    // Generate year options (current year ± 5)
    const currentYear = date.getFullYear();
    const years = [];
    for (let i = -5; i <= 5; i++) {
      years.push(currentYear + i);
    }

    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group">
          <button className="rbc-btn" onClick={goToPrevious}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button className="rbc-btn" onClick={goToToday}>
            Today
          </button>
          <button className="rbc-btn" onClick={goToNext}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
       <div className="rbc-selectors">
  {/* 
    Replaced the two <select> dropdowns with a single <span> to display the date.
    It uses the same state variables (currentMonth, currentYear) to show the correct value.
  */}
  <span className="rbc-date-label">
    {months[currentMonth]} {currentYear}
  </span>
</div>
        <div className="rbc-btn-group">
          <button
            className={`rbc-btn ${currentView === "month" ? "rbc-active" : ""}`}
            onClick={() => handleViewChange("month")}
          >
            Month
          </button>
          <button
            className={`rbc-btn ${currentView === "week" ? "rbc-active" : ""}`}
            onClick={() => handleViewChange("week")}
          >
            Week
          </button>
          <button
            className={`rbc-btn ${currentView === "day" ? "rbc-active" : ""}`}
            onClick={() => handleViewChange("day")}
          >
            Day
          </button>
        </div>
        
        {/* Month/Year Selectors */}
       
      </div>
    );
  };

  // Determine default active tab based on user role
  const defaultActiveKey = userRole === 'employee' ? 'meeting' : 'leave';

  return (
    <div className="dashboard-container d-flex">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content w-100">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="py-3 px-2 px-md-4">
          <Tabs defaultActiveKey={defaultActiveKey} className="mb-3 br-tabs">
            {/* ============== LEAVE CALENDAR ============== */}
            {userRole !== 'employee' && (
              <Tab eventKey="leave" title="Employee Attendance">
                <div className="br-box-container">
                  {/* Filter buttons for HR */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                      <Button
                        variant={leaveFilter === 'absent' ? 'primary' : 'outline-primary'}
                        onClick={() => setLeaveFilter('absent')}
                      >
                        Absent
                      </Button>
                      <Button
                        variant={leaveFilter === 'present' ? 'primary' : 'outline-primary'}
                        onClick={() => setLeaveFilter('present')}
                      >
                        Present
                      </Button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="d-flex flex-wrap gap-4 mb-3">
                    {leaveFilter === 'absent' && (
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: "#28a745" }}></span>
                        Absent (Approved Leave)
                      </div>
                    )}
                    {leaveFilter === 'present' && (
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: "#007bff" }}></span>
                        Present
                      </div>
                    )}
                  </div>

                  <div className="calendar-wrapper shadow-sm">
                    {loading ? (
                      <div className="calendar-loading">
                        <Spinner animation="border" />
                      </div>
                    ) : (
                      <Calendar
                        localizer={localizer}
                        events={filteredLeave}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleSelectEvent}
                        views={["month", "week", "day"]}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}
                        eventPropGetter={eventStyleGetter}
                        components={{
                          toolbar: CustomToolbar
                        }}
                        popup
                      />
                    )}
                  </div>
                </div>
              </Tab>
            )}

            {/* ============== EMPLOYEE LEAVE TAB ============== */}
            {userRole === 'employee' && (
              <Tab eventKey="leave" title="My Leaves">
                <div className="br-box-container">
                  {/* Filter buttons for employees - ONLY show Approved, Pending, and All */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                      <Button
                        variant={leaveFilter === 'approved' ? 'primary' : 'outline-primary'}
                        onClick={() => setLeaveFilter('approved')}
                      >
                        Approved
                      </Button>
                      <Button
                        variant={leaveFilter === 'pending' ? 'primary' : 'outline-primary'}
                        onClick={() => setLeaveFilter('pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={leaveFilter === 'all' ? 'primary' : 'outline-primary'}
                        onClick={() => setLeaveFilter('all')}
                      >
                        All
                      </Button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="d-flex flex-wrap gap-4 mb-3">
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: "#28a745" }}></span>
                      Approved
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: "#ffc107" }}></span>
                      Pending
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: "#dc3545" }}></span>
                      Rejected
                    </div>
                  </div>

                  <div className="calendar-wrapper shadow-sm">
                    {loading ? (
                      <div className="calendar-loading">
                        <Spinner animation="border" />
                      </div>
                    ) : (
                      <Calendar
                        localizer={localizer}
                        events={filteredLeave}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleSelectEvent}
                        views={["month", "week", "day"]}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}
                        eventPropGetter={eventStyleGetter}
                        components={{
                          toolbar: CustomToolbar
                        }}
                        popup
                      />
                    )}
                  </div>
                </div>
              </Tab>
            )}

            {/* ============== MEETING CALENDAR ============== */}
            <Tab eventKey="meeting" title="Meeting Schedule">
              <div className="br-box-container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex flex-wrap gap-3">
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: "#007bff" }}></span>
                      Meeting
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setSelectedMeeting(null);
                      setShowCreateMeetingModal(true);
                    }}
                    className="create-meeting-btn"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Meeting
                  </Button>
                </div>

                <div className="calendar-wrapper shadow-sm">
                  {loading ? (
                    <div className="calendar-loading">
                      <Spinner animation="border" />
                    </div>
                  ) : (
                    <Calendar
                      localizer={localizer}
                      events={filteredMeeting}
                      startAccessor="start"
                      endAccessor="end"
                      onSelectEvent={handleSelectEvent}
                      views={["month", "week", "day"]}
                      onNavigate={handleNavigate}
                      onView={handleViewChange}
                      eventPropGetter={eventStyleGetter}
                      components={{
                        toolbar: CustomToolbar
                      }}
                      popup
                    />
                  )}
                </div>
              </div>
            </Tab>
          </Tabs>
        </Container>
      </div>

      {/* -------- Event Details Modal -------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedData?.status === 'present' 
              ? 'Employee Details' 
              : selectedData?.leave_type 
                ? 'Leave Details' 
                : 'Meeting Details'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedData && (
            <>
              {selectedData.status === 'present' && (
                <>
                  <p><b>Employee:</b> {selectedData.employee_name || 'N/A'}</p>
                  <p><b>Status:</b> Present</p>
                  <p><b>Date:</b> {selectedData.date}</p>
                </>
              )}

              {selectedData.leave_type && (
                <>
                  <p><b>Employee:</b> {selectedData.employee_name || 'N/A'}</p>
                  <p><b>Role:</b> {selectedData.employee_role || 'N/A'}</p>
                  <p><b>Leave Type:</b> {selectedData.leave_type}</p>
                  <p><b>Status:</b> {selectedData.status}</p>
                  <p><b>Reason:</b> {selectedData.reason || 'N/A'}</p>
                  <p><b>Dates:</b> {selectedData.dates.join(', ')}</p>
                  <p><b>Leave Days:</b> {selectedData.leave_days}</p>
                </>
              )}

              {selectedData.title && (
                <>
                  <p><b>Meeting Title:</b> {selectedData.title}</p>
                  <p><b>Start:</b> {new Date(selectedData.start_time).toLocaleString()}</p>
                  <p><b>End:</b> {new Date(selectedData.end_time).toLocaleString()}</p>
                </>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* -------- Create/Edit Meeting Modal -------- */}
      <CreateMeetingModal
        show={showCreateMeetingModal}
        onHide={() => setShowCreateMeetingModal(false)}
        user={user}
        onMeetingCreated={fetchMeetingData}
        existingMeeting={selectedMeeting}
      />
    </div>
  );
};

export default ApplyLeaveCalendar;