import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { AuthContext } from "../../context/AuthContext";

const DailyAttendance = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  const [viewMode, setViewMode] = useState('all'); // 'all', 'week', 'month', 'day', 'custom'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noDataFound, setNoDataFound] = useState(false);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check if current time is within allowed window (8 AM - 9 PM)
  const isWithinAllowedTime = () => {
    const hours = currentTime.getHours();
    return hours >= 8 && hours < 21;
  };

  // Get today's attendance record
  const getTodayAttendance = () => {
    const today = new Date().toDateString();
    return attendanceData.find(record => {
      const recordDate = new Date(record.date).toDateString();
      return recordDate === today;
    });
  };

  // Format date from backend to display format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time from DateTime to display format
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format hours from decimal to HH:MM format
  const formatHours = (decimalHours) => {
    if (!decimalHours) return "00:00";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get day name from date
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Determine status based on attendance data
  const getStatus = (record) => {
    if (!record.check_in && !record.check_out) {
      const date = new Date(record.date);
      const day = date.getDay();
      if (day === 0 || day === 6) return "Weekend";
      return "Absent";
    }
    return "Present";
  };

  // Check if both check-in and check-out are present
  const hasCompleteAttendance = (record) => {
    return record.check_in && record.check_out;
  };

  // Common function to fetch attendance data
  const fetchAttendanceData = async (date, type) => {
    if (!user?.unique_id) return;
    
    setLoading(true);
    setNoDataFound(false);
    setMessage({ type: "", text: "" });
    
    try {
      let apiUrl;
      
      if (type === 'all') {
        // All data API
        apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${user.unique_id}`;
      } else if (type === 'weekly') {
        // Weekly API
        apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${user.unique_id}&type=weekly`;
      } else if (type === 'monthly') {
        // Monthly API
        apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${user.unique_id}&type=monthly`;
      } else if (type === 'day') {
        // Single day API
        const formattedDate = date ? date.toISOString().split('T')[0] : '';
        apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${user.unique_id}&date=${formattedDate}`;
      } else if (type === 'custom') {
        // Custom date range API
        const formattedStartDate = customDateRange.start ? customDateRange.start.toISOString().split('T')[0] : '';
        const formattedEndDate = customDateRange.end ? customDateRange.end.toISOString().split('T')[0] : '';
        apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${user.unique_id}&start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.length === 0) {
          setNoDataFound(true);
          setAttendanceData([]);
          setWeekData([]);
          setMessage({ 
            type: "info", 
            text: "No attendance data found for the selected period" 
          });
        } else {
          setAttendanceData(data);
          
          // Transform backend data to UI format
          const transformedData = data.map(record => ({
            id: record.id,
            day: getDayName(record.date),
            date: new Date(record.date).getDate().toString(),
            fullDate: record.date,
            status: getStatus(record),
            timeIn: formatTime(record.check_in),
            timeOut: formatTime(record.check_out),
            hours: formatHours(record.total_hours),
            canEdit: !hasCompleteAttendance(record)
          }));
          
          setWeekData(transformedData);
          
          // Update date range display
          if (data.length > 0) {
            const sortedDates = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
            const startDate = new Date(sortedDates[0].date);
            const endDate = new Date(sortedDates[sortedDates.length - 1].date);
            
            setDateRange({
              start: formatDate(startDate),
              end: formatDate(endDate)
            });
          }
          
          setMessage({ 
            type: "success", 
            text: "Attendance data loaded successfully!" 
          });
        }
      } else {
        let errorMessage = "Failed to fetch attendance data";
        try {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (errorText.includes("<!DOCTYPE")) {
            errorMessage = "Server returned an error page. Please check the API endpoint.";
          } else {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          errorMessage = `Server responded with status: ${response.status}`;
        }
        
        setMessage({ 
          type: "danger", 
          text: errorMessage 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data
  const fetchAllData = () => {
    fetchAttendanceData(null, 'all');
  };

  // Fetch week data
  const fetchWeekData = () => {
    fetchAttendanceData(null, 'weekly');
  };

  // Fetch month data
  const fetchMonthData = () => {
    fetchAttendanceData(null, 'monthly');
  };

  // Fetch day data
  const fetchDayData = (date) => {
    fetchAttendanceData(date, 'day');
  };

  // Fetch custom range data
  const fetchCustomRangeData = async () => {
    if (!customDateRange.start || !customDateRange.end) {
      setMessage({ 
        type: "warning", 
        text: "Please select both start and end dates" 
      });
      return;
    }
    fetchAttendanceData(null, 'custom');
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Reset date states to today when changing view mode
    const today = new Date();
    setCurrentDate(today);
    setCurrentMonth(today);
    
    // Fetch data for the new view mode
    if (mode === 'all') {
      fetchAllData();
    } else if (mode === 'week') {
      fetchWeekData();
    } else if (mode === 'month') {
      fetchMonthData();
    } else if (mode === 'day') {
      fetchDayData(today);
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'week') {
      fetchWeekData();
    } else if (viewMode === 'month') {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setCurrentMonth(newMonth);
      fetchMonthData();
    } else if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
      fetchDayData(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      fetchWeekData();
    } else if (viewMode === 'month') {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setCurrentMonth(newMonth);
      fetchMonthData();
    } else if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
      fetchDayData(newDate);
    }
  };

  // Handle date selection - independent of API
  const handleDateSelect = (date) => {
    setCurrentDate(date);
    // Only fetch data if in day view
    if (viewMode === 'day') {
      fetchDayData(date);
    }
  };

  // Handle month change - independent of API
  const handleMonthChange = (date) => {
    setCurrentMonth(date);
    // Only fetch data if in month view
    if (viewMode === 'month') {
      fetchMonthData();
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!isWithinAllowedTime()) {
      setMessage({ 
        type: "warning", 
        text: "Check-in is only allowed between 8:00 AM and 9:00 PM" 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee/check-in/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          employee_id: user?.unique_id || '',
          check_in: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Successfully checked in!" 
        });
        
        // Refresh current view
        if (viewMode === 'all') {
          fetchAllData();
        } else if (viewMode === 'week') {
          fetchWeekData();
        } else if (viewMode === 'month') {
          fetchMonthData();
        } else if (viewMode === 'day') {
          fetchDayData(currentDate);
        }
      } else {
        const error = await response.json();
        setMessage({ 
          type: "danger", 
          text: error.message || "Failed to check in" 
        });
      }
    } catch (error) {
      console.error("Error checking in:", error);
      setMessage({ 
        type: "danger", 
        text: "Error checking in. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (!isWithinAllowedTime()) {
      setMessage({ 
        type: "warning", 
        text: "Check-out is only allowed between 8:00 AM and 9:00 PM" 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee/check-out/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          employee_id: user?.unique_id || '',
          check_out: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Successfully checked out!" 
        });
        
        // Refresh current view
        if (viewMode === 'all') {
          fetchAllData();
        } else if (viewMode === 'week') {
          fetchWeekData();
        } else if (viewMode === 'month') {
          fetchMonthData();
        } else if (viewMode === 'day') {
          fetchDayData(currentDate);
        }
      } else {
        const error = await response.json();
        setMessage({ 
          type: "danger", 
          text: error.message || "Failed to check out" 
        });
      }
    } catch (error) {
      console.error("Error checking out:", error);
      setMessage({ 
        type: "danger", 
        text: "Error checking out. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total work hours
  const calculateTotalHours = () => {
    if (!weekData.length) return "00:00";
    
    let totalMinutes = 0;
    
    weekData.forEach(day => {
      if (day.hours && day.hours !== "00:00") {
        const [hours, minutes] = day.hours.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
      }
    });
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    return `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
  };

  // Fetch data on component mount - load all data by default
  useEffect(() => {
    if (user?.unique_id) {
      fetchAllData();
    }
  }, [user]);

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
  ];

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

  const handleUpdate = async (index) => {
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
    
    try {
      const recordId = updatedData[index].id;
      const response = await fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          employee_id: user?.unique_id || '',
          check_in: updatedData[index].timeIn,
          check_out: updatedData[index].timeOut,
          total_hours: updatedHours
        })
      });
      
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Attendance updated successfully!" 
        });
        
        // Refresh current view
        if (viewMode === 'all') {
          fetchAllData();
        } else if (viewMode === 'week') {
          fetchWeekData();
        } else if (viewMode === 'month') {
          fetchMonthData();
        } else if (viewMode === 'day') {
          fetchDayData(currentDate);
        }
      } else {
        const error = await response.json();
        setMessage({ 
          type: "danger", 
          text: error.message || "Failed to update attendance" 
        });
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      setMessage({ 
        type: "danger", 
        text: "Error updating attendance. Please try again." 
      });
    }
  };

  // Get today's attendance for button states
  const todayAttendance = getTodayAttendance();
  const hasCheckedIn = todayAttendance && todayAttendance.check_in;
  const hasCheckedOut = todayAttendance && todayAttendance.check_out;
  const withinTimeWindow = isWithinAllowedTime();

  // Get display text for date range
  const getDateRangeDisplay = () => {
    if (viewMode === 'all') {
      return dateRange.start && dateRange.end 
        ? `All Records (${dateRange.start} - ${dateRange.end})` 
        : 'All Records';
    } else if (viewMode === 'week') {
      return dateRange.start && dateRange.end 
        ? `${dateRange.start} - ${dateRange.end}` 
        : 'Current Week';
    } else if (viewMode === 'month') {
      return currentMonth.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return '';
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-body">
          {/* Check-in/Check-out buttons section */}
          <Card className="p-3 shadow-sm mb-3">
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-0">Today's Attendance</h5>
                <p className="text-muted mb-0">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <br />
                  <small className="text-info">
                    Current Time: {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </small>
                  {!withinTimeWindow && (
                    <small className="text-warning d-block">
                      Attendance can be marked between 8:00 AM and 9:00 PM
                    </small>
                  )}
                </p>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="success" 
                  className="me-2" 
                  onClick={handleCheckIn}
                  disabled={
                    loading || 
                    hasCheckedIn || 
                    !withinTimeWindow ||
                    hasCheckedOut
                  }
                >
                  {loading ? 'Processing...' : 'Check In'}
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleCheckOut}
                  disabled={
                    loading || 
                    !hasCheckedIn || 
                    hasCheckedOut ||
                    !withinTimeWindow
                  }
                >
                  {loading ? 'Processing...' : 'Check Out'}
                </Button>
              </Col>
            </Row>
            
            {message.text && (
              <Alert 
                variant={message.type} 
                className="mt-3 mb-0"
                onClose={() => setMessage({ type: "", text: "" })}
                dismissible
              >
                {message.text}
              </Alert>
            )}
          </Card>

          {/* Date Range Selector */}
          <Card className="p-3 shadow-sm br-attendance-card">
            <Row className="mb-3">
              <Col md={12} className="text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <Form.Check
                    type="radio"
                    label="All Records"
                    name="viewMode"
                    checked={viewMode === 'all'}
                    onChange={() => handleViewModeChange('all')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    label="Week View"
                    name="viewMode"
                    checked={viewMode === 'week'}
                    onChange={() => handleViewModeChange('week')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    label="Month View"
                    name="viewMode"
                    checked={viewMode === 'month'}
                    onChange={() => handleViewModeChange('month')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    label="Day View"
                    name="viewMode"
                    checked={viewMode === 'day'}
                    onChange={() => handleViewModeChange('day')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    label="Custom Range"
                    name="viewMode"
                    checked={viewMode === 'custom'}
                    onChange={() => handleViewModeChange('custom')}
                  />
                </div>
                
                {viewMode === 'custom' ? (
                  <div className="d-flex justify-content-center align-items-center flex-wrap">
                    <DatePicker
                      selected={customDateRange.start}
                      onChange={(date) => setCustomDateRange(prev => ({ ...prev, start: date }))}
                      selectsStart
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Start Date"
                      className="form-control me-2"
                    />
                    <span className="mx-2">to</span>
                    <DatePicker
                      selected={customDateRange.end}
                      onChange={(date) => setCustomDateRange(prev => ({ ...prev, end: date }))}
                      selectsEnd
                      dateFormat="yyyy-MM-dd"
                      placeholderText="End Date"
                      className="form-control me-2"
                      minDate={customDateRange.start}
                    />
                    <Button 
                      variant="primary" 
                      onClick={fetchCustomRangeData}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Get Attendance'}
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center align-items-center">
                    {viewMode !== 'all' && (
                      <Button variant="outline-secondary" onClick={handlePrevious}>
                        <IoIosArrowBack />
                      </Button>
                    )}
                    <div className="mx-3">
                      {viewMode === 'day' ? (
                        <DatePicker
                          selected={currentDate}
                          onChange={handleDateSelect}
                          dateFormat="yyyy-MM-dd"
                          className="form-control"
                        />
                      ) : viewMode === 'month' ? (
                        <DatePicker
                          selected={currentMonth}
                          onChange={handleMonthChange}
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
                          className="form-control"
                        />
                      ) : (
                        <div className="form-control">
                          {getDateRangeDisplay()}
                        </div>
                      )}
                    </div>
                    {viewMode !== 'all' && (
                      <Button variant="outline-secondary" onClick={handleNext}>
                        <IoIosArrowForward />
                      </Button>
                    )}
                  </div>
                )}
              </Col>
            </Row>
            
            {/* Attendance Table */}
            <Row>
              <Col>
                {noDataFound ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Data Found</h4>
                    <p className="text-muted">
                      No attendance records found for the selected period
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Hours</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekData.length > 0 ? (
                          weekData.map((day, index) => (
                            <tr key={index}>
                              <td>{day.day}</td>
                              <td>{day.date}</td>
                              <td>
                                <Badge 
                                  bg={
                                    day.status === "Present" ? "success" : 
                                    day.status === "Weekend" ? "info" : "danger"
                                  }
                                >
                                  {day.status}
                                </Badge>
                              </td>
                              <td>
                                {editingIndex === index ? (
                                  <Form.Select
                                    value={editData.timeIn}
                                    onChange={(e) => setEditData({...editData, timeIn: e.target.value})}
                                  >
                                    <option value="">Select Time</option>
                                    {timeSlots.map(slot => (
                                      <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  day.timeIn || "-"
                                )}
                              </td>
                              <td>
                                {editingIndex === index ? (
                                  <Form.Select
                                    value={editData.timeOut}
                                    onChange={(e) => setEditData({...editData, timeOut: e.target.value})}
                                  >
                                    <option value="">Select Time</option>
                                    {timeSlots.map(slot => (
                                      <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  day.timeOut || "-"
                                )}
                              </td>
                              <td>{day.hours}</td>
                              <td>
                                {editingIndex === index ? (
                                  <div>
                                    <Button 
                                      size="sm" 
                                      variant="success" 
                                      className="me-1"
                                      onClick={() => handleUpdate(index)}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="secondary"
                                      onClick={() => setEditingIndex(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    disabled={!day.canEdit}
                                    onClick={() => handleEditClick(index)}
                                  >
                                    <AiFillEdit />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
                              {loading ? "Loading attendance data..." : "No attendance data available"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="5" className="text-end fw-bold">Total Hours:</td>
                          <td className="fw-bold">{calculateTotalHours()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default DailyAttendance;