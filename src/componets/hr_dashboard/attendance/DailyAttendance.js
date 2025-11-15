import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";

import "react-calendar/dist/Calendar.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";


const DailyAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [weekData, setWeekData] = useState([
    {
      day: "Sun",
      date: "14",
      status: "Weekend",
      timeIn: "",
      timeOut: "",
      hours: "00:00",
    },
    {
      day: "Mon",
      date: "15",
      status: "Present",
      timeIn: "09:00 AM",
      timeOut: "06:00 PM",
      hours: "09:00",
    },
    {
      day: "Tue",
      date: "16",
      status: "Present",
      timeIn: "09:15 AM",
      timeOut: "06:10 PM",
      hours: "08:55",
    },
    {
      day: "Wed",
      date: "17",
      status: "Absent",
      timeIn: "",
      timeOut: "",
      hours: "00:00",
    },
    {
      day: "Thu",
      date: "18",
      status: "Present",
      timeIn: "09:10 AM",
      timeOut: "06:05 PM",
      hours: "08:55",
    },
    {
      day: "Fri",
      date: "19",
      status: "Present",
      timeIn: "09:20 AM",
      timeOut: "06:00 PM",
      hours: "08:40",
    },
  ]);

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];
  const CustomDatePickerInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <div className="input-group">
        <span className="input-group-text" onClick={onClick}>
          <i className="bi bi-calendar3"></i>
        </span>
      </div>
    )
  );
  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "00:00";
    const start = new Date(`1970-01-01 ${timeIn}`);
    const end = new Date(`1970-01-01 ${timeOut}`);
    const diff = (end - start) / 1000 / 60;
    if (diff < 0) return "00:00";
    const hrs = String(Math.floor(diff / 60)).padStart(2, "0");
    const mins = String(diff % 60).padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({ timeIn: "", timeOut: "" });

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditData({
      timeIn: weekData[index].timeIn,
      timeOut: weekData[index].timeOut,
    });
  };

  const handleUpdate = (index) => {
    const updatedHours = calculateHours(editData.timeIn, editData.timeOut);

    const updatedData = [...weekData];
    updatedData[index] = {
      ...updatedData[index],
      timeIn: editData.timeIn,
      timeOut: editData.timeOut,
      hours: updatedHours,
    };

    setWeekData(updatedData);
    setEditingIndex(null);
  };

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <Card className="p-3 shadow-sm br-attendance-card">
            <div className="d-flex  justify-content-center date-select text-center">
              <IoIosArrowBack />{" "}
              <DatePicker
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Date of Birth"
                customInput={
                  <CustomDatePickerInput placeholder="Select Date of Birth" />
                }
                maxDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                }
                showYearDropdown
                scrollableYearDropdown
                className="br-att-date-p"
                yearDropdownItemNumber={100}
              />{" "}
              <IoIosArrowForward />
              <div className="d-flex  justify-content-center calendar-input-icon">
                <p>10-May-2025 to 17-May-2025</p>
              </div>
            </div>

            {weekData.map((item, index) => (
              <div key={index}>
                {/* ================= MAIN ROW ================= */}
                <Row className="align-items-center br-att-row mt-3 mb-3">
                  <Col xs={6} sm={6} md={4} lg={1} className="br-day-col">
                    <div className="br-day-text">{item.day}</div>
                    <div className="br-date-text">{item.date}</div>
                  </Col>

                  {/* TIME-IN */}
                  <Col xs={6} sm={6} md={2} lg={2}>
                    <div className="br-time-label">{item.timeIn || "-"}</div>
                  </Col>

                  {/* TIMELINE */}
                  <Col xs={12} sm={12} md={6} lg={3}>
                    <div className="br-timeline">
                      <span className="dot start"></span>
                      <div
                        className={`line ${
                          item.status === "Absent"
                            ? "line-red"
                            : item.status === "Weekend"
                            ? "line-yellow"
                            : "line-green"
                        }`}
                      ></div>
                      <span className="dot end"></span>

                      {item.status === "Weekend" && (
                        <Badge
                          bg="warning"
                          text="dark"
                          className="br-status-badge"
                        >
                          Weekend
                        </Badge>
                      )}

                      {item.status === "Absent" && (
                        <Badge
                          bg="light"
                          text="danger"
                          className="br-status-badge border border-danger"
                        >
                          Absent
                        </Badge>
                      )}
                    </div>
                  </Col>

                  {/* TIME-OUT */}
                  <Col xs={12} sm={12} md={3} lg={2}>
                    <div className="br-time-label">{item.timeOut || "-"}</div>
                  </Col>

                  {/* HOURS WORKED */}
                  <Col xs={6} sm={6} md={4} lg={2}>
                    <div className="br-hours-text">{item.hours}</div>
                    <small className="text-muted br-att-hrs">Hrs worked</small>
                  </Col>

                  {/* EDIT BUTTON */}
                  <Col xs={6} sm={6} md={2} lg={2}>
                    <div
                      className="text-primary br-edit-btn"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditClick(index)}
                    >
                     <AiFillEdit />Edit
                    </div>
                  </Col>
                </Row>

                {/* =============== EDIT ROW BELOW =============== */}
                {editingIndex === index && (
                  <Row className="p-3 br-edit-row bg-light rounded mb-3">
                    <Col md={3} lg={3} sm={12}>
                      <Form.Label className="att-label">Time In</Form.Label>
                      <Form.Select
                        className="att-time-set"
                        value={editData.timeIn}
                        onChange={(e) =>
                          setEditData({ ...editData, timeIn: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        {timeSlots.map((t, i) => (
                          <option key={i}>{t}</option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col md={6} lg={3} sm={12} xs={12} className="att-mob-out">
                      <Form.Label className="att-label att-mt-mob">
                        Time Out
                      </Form.Label>
                      <Form.Select
                        className="att-time-set"
                        value={editData.timeOut}
                        onChange={(e) =>
                          setEditData({ ...editData, timeOut: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        {timeSlots.map((t, i) => (
                          <option key={i}>{t}</option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col
                      md={3}
                      lg={2}
                      sm={6}
                      xs={6}
                      className="d-flex align-items-end"
                    >
                      <Button
                        variant="success"
                        className="att-upt-btn"
                        onClick={() => handleUpdate(index)}
                      >
                        Update
                      </Button>
                       <Button
                        variant="secondary"
                        className="att-cancle mx-3"
                        onClick={() => setEditingIndex(null)}
                      >
                        Cancel
                      </Button>
                    </Col>

                    {/* <Col
                      md={3}
                      lg={2}
                      sm={6}
                      xs={6}
                      className="d-flex align-items-end"
                    >
                      <Button
                        variant="secondary"
                        className="att-cancle"
                        onClick={() => setEditingIndex(null)}
                      >
                        Cancel
                      </Button>
                    </Col> */}
                  </Row>
                )}
              </div>
            ))}
            <Row>
              <Col lg={12} md={12} sm={12} className="text-end br-total-hrs">
                <h2>Total Work Hours</h2>
              </Col>
            </Row>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default DailyAttendance;
