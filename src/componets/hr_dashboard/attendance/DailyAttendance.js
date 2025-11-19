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

import "react-calendar/dist/Calendar.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { AuthContext } from "../../context/AuthContext";

const DailyAttendance = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [attendanceData, setAttendanceData] = useState([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [todayCheckInTime, setTodayCheckInTime] = useState(null);
  const [weekData, setWeekData] = useState([]); // Will be populated from API

  // Date picker related states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  // *** MODIFIED FUNCTION ***
  // Determine status based on attendance data and current time
  const getStatus = (record) => {
    if (!record.check_in && !record.check_out) {
      const date = new Date(record.date);
      const day = date.getDay();
      if (day === 0 || day === 6) return "Weekend";
      return "Absent";
    }
    
    // Check if check-in exists but check-out doesn't
    if (record.check_in && !record.check_out) {
      const now = new Date();
      const recordDate = new Date(record.date);
      
      // Define the end of the checkout window (9:00 PM)
      const endOfDay = new Date(recordDate);
      endOfDay.setHours(21, 0, 0, 0);

      // If the current time is past the end of the checkout window, it's a missed checkout
      if (now >= endOfDay) {
        return "MissedCheckout";
      }
      
      // Otherwise, the user is still within the working hours window, so it's considered "Present"
      return "Present";
    }
    
    return "Present";
  };

  // Get today's attendance record
  const getTodayAttendance = () => {
    const today = new Date().toDateString();
    return attendanceData.find(record => {
      const recordDate = new Date(record.date).toDateString();
      return recordDate === today;
    });
  };

  // Get date range based on view mode and a given date
  const getDateRange = (date = selectedDate, mode = viewMode) => {
    // Create new date objects to avoid modifying the original
    const start = new Date(date);
    const end = new Date(date);
    
    if (mode === 'day') {
      // For day view, start and end are the same day
      return {
        start: formatDateLocal(start),
        end: formatDateLocal(end)
      };
    } else if (mode === 'week') {
      // For week view, get start of week (Sunday)
      const day = start.getDay();
      const diff = start.getDate() - day;
      const startDate = new Date(start.setDate(diff));
      const endDate = new Date(start);
      endDate.setDate(startDate.getDate() + 6);
      
      return {
        start: formatDateLocal(startDate),
        end: formatDateLocal(endDate)
      };
    } else if (mode === 'month') {
      // For month view, get first and last day of month
      const startDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDate = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      
      return {
        start: formatDateLocal(startDate),
        end: formatDateLocal(endDate)
      };
    }
    
    return { start: null, end: null };
  };

  // Check if a Date is within the selected range
  const isDateInRange = (dateString) => {
    const { start, end } = getDateRange(selectedDate, viewMode);
    const date = new Date(dateString);
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return date >= startDate && date <= endDate;
  };

  // Handle date change from date picker
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAttendanceData(date, viewMode);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    let newDate = new Date(selectedDate);
    
    if (mode === 'week') {
      // Set to start of week (Sunday)
      const day = newDate.getDay();
      newDate.setDate(newDate.getDate() - day);
    } else if (mode === 'month') {
      // Set to first day of month
      newDate.setDate(1);
    }
    
    setSelectedDate(newDate);
    fetchAttendanceData(newDate, mode);
  };

  // Navigate to previous period
  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    
    setSelectedDate(newDate);
    fetchAttendanceData(newDate, viewMode);
  };

  // Navigate to next period
  const handleNext = () => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setSelectedDate(newDate);
    fetchAttendanceData(newDate, viewMode);
  };

  // Get display text for date range
  const getDateRangeDisplay = () => {
    const { start, end } = getDateRange(selectedDate, viewMode);
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (viewMode === 'day') {
      return startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      return `${startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${endDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    } else if (viewMode === 'month') {
      return startDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
    return '';
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
      const checkInTime = new Date().toISOString();
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee/check-in/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: user?.unique_id || '',
          check_in: checkInTime
        })
      });

      if (response.ok) {
        setHasCheckedIn(true);
        setTodayCheckInTime(checkInTime);
        setMessage({
          type: "success",
          text: "Successfully checked in!"
        });

        // Refresh attendance Data
        fetchAttendanceData(selectedDate, viewMode);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to check in";

        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        setMessage({
          type: "danger",
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("Error checking in:", error);
      setMessage({
        type: "danger",
        text: "Network error. Please check your connection and try again."
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
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: user?.unique_id || '',
          check_out: new Date().toISOString()
        })
      });

      if (response.ok) {
        setHasCheckedOut(true);
        setMessage({
          type: "success",
          text: "Successfully checked out!"
        });

        // Refresh attendance Data
        fetchAttendanceData(selectedDate, viewMode);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to check out";

        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        setMessage({
          type: "danger",
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("Error checking out:", error);
      setMessage({
        type: "danger",
        text: "Network error. Please check your connection and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto check-out with null when time window is over
  const autoCheckOut = async () => {
    if (!hasCheckedIn || hasCheckedOut) return;

    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: user?.unique_id || '',
          check_out: null // Send null for auto check-out
        })
      });

      if (response.ok) {
        setHasCheckedOut(true);
        setMessage({
          type: "info",
          text: "Check-out time automatically recorded as missed. Please contact HR to update if needed."
        });

        // Refresh attendance Data
        fetchAttendanceData(selectedDate, viewMode);
      }
    } catch (error) {
      console.error("Error in auto check-out:", error);
    }
  };

  // Fetch attendance Data from API
  const fetchAttendanceData = async (date = selectedDate, mode = viewMode) => {
    if (!user?.unique_id) return;

    setLoading(true);
    try {
      const { start, end } = getDateRange(date, mode);
      let apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${user.unique_id}`;
      
      // Add date range parameters based on view mode
      if (mode === 'day') {
        apiUrl += `&date=${start}`;
      } else if (mode === 'week' || mode === 'month') {
        apiUrl += `&start_date=${start}&end_date=${end}`;
      }
      
      console.log('Fetching data for:', { mode, start, end });
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
        
        // For day view, check if the selected date exists in the API response
        if (mode === 'day') {
          const selectedDateString = formatDateLocal(new Date(date));
          const dateExists = data.some(record => {
            const recordDate = formatDateLocal(new Date(record.date));
            return recordDate === selectedDateString;
          });
          
          if (dateExists) {
            // Find the record for the selected date
            const selectedRecord = data.find(record => {
              const recordDate = formatDateLocal(new Date(record.date));
              return recordDate === selectedDateString;
            });
            
            if (selectedRecord) {
              // Transform backend data to match your original structure
              const transformedData = [{
                day: getDayName(selectedRecord.date),
                date: new Date(selectedRecord.date).getDate().toString(),
                status: getStatus(selectedRecord),
                timeIn: formatTime(selectedRecord.check_in),
                timeOut: formatTime(selectedRecord.check_out),
                hours: formatHours(selectedRecord.total_hours),
              }];
              
              setWeekData(transformedData);
              
              // Update date range display
              setDateRange({
                start: new Date(selectedRecord.date).toLocaleDateString('en-US', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }),
                end: new Date(selectedRecord.date).toLocaleDateString('en-US', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              });
            } else {
              // Clear weekData when no data found for selected date
              setWeekData([]);
              setDateRange({ start: null, end: null });
            }
          } else {
            // Clear weekData when no data found for selected date
            setWeekData([]);
            setDateRange({ start: null, end: null });
          }
        } else {
          // For week and month views, filter data to only include records within the selected date range
          const filteredData = data.filter(record => {
            const recordDate = formatDateLocal(new Date(record.date));
            return recordDate >= start && recordDate <= end;
          });
          
          // Only transform and set weekData if there's data for the selected period
          if (filteredData.length > 0) {
            // Transform backend data to match your original structure
            const transformedData = filteredData.map(record => ({
              day: getDayName(record.date),
              date: new Date(record.date).getDate().toString(),
              status: getStatus(record),
              timeIn: formatTime(record.check_in),
              timeOut: formatTime(record.check_out),
              hours: formatHours(record.total_hours),
            }));
            
            setWeekData(transformedData);
            
            // Update date range display
            const sortedDates = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
            const startDate = new Date(sortedDates[0].date);
            const endDate = new Date(sortedDates[sortedDates.length - 1].date);
            
            setDateRange({
              start: startDate.toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              end: endDate.toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            });
          } else {
            // Clear weekData when no data found for the selected period
            setWeekData([]);
            setDateRange({ start: null, end: null });
          }
        }
        
        // Check if user has already checked in/out today
        const today = formatDateLocal(new Date());
        const todayRecord = data.find(record => formatDateLocal(new Date(record.date)) === today);
        
        if (todayRecord) {
          setHasCheckedIn(!!todayRecord.check_in);
          setHasCheckedOut(!!todayRecord.check_out);
          setTodayCheckInTime(todayRecord.check_in);
        } else {
          setHasCheckedIn(false);
          setHasCheckedOut(false);
          setTodayCheckInTime(null);
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
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setMessage({ 
        type: "danger", 
        text: "Error fetching attendance data. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (user?.unique_id) {
      fetchAttendanceData();
    }
  }, [user]);

  // Auto check-out when time window is over (after 9 PM)
  useEffect(() => {
    const hours = currentTime.getHours();
    // If it's past 9 PM and user has checked in but not checked out
    if (hours >= 21 && hasCheckedIn && !hasCheckedOut) {
      autoCheckOut();
    }
  }, [currentTime, hasCheckedIn, hasCheckedOut]);

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
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
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
      const recordId = attendanceData[index].id;
      const response = await fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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

        // Refresh attendance Data
        fetchAttendanceData(selectedDate, viewMode);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to update attendance";

        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        setMessage({
          type: "danger",
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      setMessage({
        type: "danger",
        text: "Network error. Please check your connection and try again."
      });
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

  const withinTimeWindow = isWithinAllowedTime();

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
                <h5 className="mb-0">Today's Attendance Hello</h5>
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
                  {todayCheckInTime && (
                    <small className="text-success d-block">
                      Check-in Time: {new Date(todayCheckInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </small>
                  )}
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

          <Card className="p-3 shadow-sm br-attendance-card">
            <Row className="mb-3">
              <Col md={12} className="text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
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
                  />
                </div>

                <div className="d-flex justify-content-center align-items-center">
                  <Button variant="outline-secondary" onClick={handlePrevious}>
                    <IoIosArrowBack />
                  </Button>
                  <div className="mx-3">
                    {viewMode === 'day' ? (
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                      />
                    ) : viewMode === 'month' ? (
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
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
                  <Button variant="outline-secondary" onClick={handleNext}>
                    <IoIosArrowForward />
                  </Button>
                </div>
              </Col>
            </Row>

            {weekData.length > 0 ? (
              weekData.map((item, index) => (
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
                            item.status === "Absent" || item.status === "MissedCheckout"
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

                        {item.status === "MissedCheckout" && (
                          <Badge
                            bg="danger"
                            text="white"
                            className="br-status-badge"
                          >
                            Missed Checkout
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
                    </Row>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">No Data Found</h4>
                <p className="text-muted">
                  No attendance records found for the selected period
                </p>
              </div>
            )}
            <Row>
              <Col lg={12} md={12} sm={12} className="text-end br-total-hrs">
                <h2>Total Work Hours: {calculateTotalHours()}</h2>
              </Col>
            </Row>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default DailyAttendance;