import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Modal,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import { AuthContext } from "../../context/AuthContext";
import "../../../assets/css/applayleave.css";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../../assets/css/LeaveCalendar.css";

const localizer = momentLocalizer(moment);

const ApplyLeaveCalendar = () => {
  const { user } = useContext(AuthContext);
  const employee_id = user?.unique_id;

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ---------------------------------------
      Fetch Leave Data
  ----------------------------------------- */
  const fetchLeaveData = async () => {
    if (!employee_id) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/leave-balance/?employee_id=${employee_id}`
      );

      setLeaveBalance(res.data.leave_balance);

      const events = res.data.leave_history.map((item) => {
        const eventDate = new Date(item.dates[0]);

        let color = "#ffc107";
        if (item.status === "approved") color = "#28a745";
        if (item.status === "rejected") color = "#dc3545";

        return {
          id: item.id,
          title: `${item.leave_type.toUpperCase()} (${item.status})`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          color,
          type: "leave",
          data: item,
        };
      });

      setLeaveEvents(events);
      setFilteredLeave(events);
    } catch (err) {
      setError("Failed to load leave data.");
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
  }, [employee_id]);

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
    setSelectedData(event.data);
    setShowModal(true);
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

  return (
    <div className="dashboard-container d-flex">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content w-100">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="py-3 px-2 px-md-4">
          <Tabs defaultActiveKey="leave" className="mb-3 br-tabs">
            {/* ============== LEAVE CALENDAR ============== */}
            <Tab eventKey="leave" title="Leave Calendar">
              <div className="br-box-container">

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
                      popup
                    />
                  )}
                </div>
              </div>
            </Tab>

            {/* ============== MEETING CALENDAR ============== */}
            <Tab eventKey="meeting" title="Meeting Schedule">
              <div className="br-box-container">
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: "#007bff" }}></span>
                    Meeting
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
                      events={filteredMeeting}
                      startAccessor="start"
                      endAccessor="end"
                      onSelectEvent={handleSelectEvent}
                      views={["month", "week", "day"]}
                      onNavigate={handleNavigate}
                      onView={handleViewChange}
                      eventPropGetter={eventStyleGetter}
                      popup
                    />
                  )}
                </div>
              </div>
            </Tab>
          </Tabs>
        </Container>
      </div>

      {/* -------- Modal -------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedData && (
            <>
              {selectedData.leave_type && (
                <>
                  <p><b>Leave Type:</b> {selectedData.leave_type}</p>
                  <p><b>Status:</b> {selectedData.status}</p>
                  <p><b>Reason:</b> {selectedData.reason}</p>
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
    </div>
  );
};

export default ApplyLeaveCalendar;
