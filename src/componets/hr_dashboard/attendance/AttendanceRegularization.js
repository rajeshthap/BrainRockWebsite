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
  Tabs,
  Tab,
} from "react-bootstrap";
import "../../../assets/css/Profile.css";
import { AuthContext } from "../../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";

const AttendanceRegularization = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [attendanceData, setAttendanceData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [regularizationData, setRegularizationData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [activeTab, setActiveTab] = useState('regularization');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date string from API for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    // Use the status from API if available
    if (record.status) {
      return record.status === "present" ? "Present" : 
             record.status === "absent" ? "Absent" : 
             record.status === "weekend" ? "Weekend" : 
             record.status;
    }
    
    // Fallback to original logic if status is not provided
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

  // Get date range based on view mode and a given date
  const getDateRange = (date = selectedDate, mode = viewMode) => {
    const start = new Date(date);
    const end = new Date(date);
    
    if (mode === 'day') {
      return {
        start: formatDateLocal(start),
        end: formatDateLocal(end)
      };
    } else if (mode === 'week') {
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
      const startDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDate = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      
      return {
        start: formatDateLocal(startDate),
        end: formatDateLocal(endDate)
      };
    }
    
    return { start: null, end: null };
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
      const day = newDate.getDay();
      newDate.setDate(newDate.getDate() - day);
    } else if (mode === 'month') {
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

  // Fetch attendance Data from API - using the same approach as DailyAttendance
  const fetchAttendanceData = async (date = selectedDate, mode = viewMode) => {
    if (!user?.unique_id) return;

    setLoading(true);
    setMessage({ type: "", text: "" });
    
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
        console.log('Received data:', data);
        setAllAttendanceData(data);
        setAttendanceData(data);
        
        // Process data for week/month view (same as DailyAttendance)
        if (mode === 'day') {
          const selectedDateString = formatDateLocal(new Date(date));
          const dateExists = data.some(record => {
            const recordDate = formatDateLocal(new Date(record.date));
            return recordDate === selectedDateString;
          });
          
          if (dateExists) {
            const selectedRecord = data.find(record => {
              const recordDate = formatDateLocal(new Date(record.date));
              return recordDate === selectedDateString;
            });
            
            if (selectedRecord) {
              const transformedData = [{
                id: selectedRecord.id,
                date: selectedRecord.date, // Keep the original date string
                day: getDayName(selectedRecord.date),
                status: getStatus(selectedRecord),
                timeIn: formatTime(selectedRecord.check_in),
                timeOut: formatTime(selectedRecord.check_out),
                hours: formatHours(selectedRecord.total_hours),
                regularizationType: !selectedRecord.check_in && !selectedRecord.check_out ? "Full Day Absent" :
                                 !selectedRecord.check_in ? "Missed Check-in" :
                                 !selectedRecord.check_out ? "Missed Check-out" : "Other"
              }];
              
              setWeekData(transformedData);
              setDateRange({
                start: formatDateForDisplay(selectedRecord.date),
                end: formatDateForDisplay(selectedRecord.date)
              });
            } else {
              setWeekData([]);
              setDateRange({ start: null, end: null });
            }
          } else {
            setWeekData([]);
            setDateRange({ start: null, end: null });
          }
        } else {
          const filteredData = data.filter(record => {
            const recordDate = formatDateLocal(new Date(record.date));
            return recordDate >= start && recordDate <= end;
          });
          
          if (filteredData.length > 0) {
            const transformedData = filteredData.map(record => ({
              id: record.id,
              date: record.date, // Keep the original date string
              day: getDayName(record.date),
              status: getStatus(record),
              timeIn: formatTime(record.check_in),
              timeOut: formatTime(record.check_out),
              hours: formatHours(record.total_hours),
              regularizationType: !record.check_in && !record.check_out ? "Full Day Absent" :
                               !record.check_in ? "Missed Check-in" :
                               !record.check_out ? "Missed Check-out" : "Other"
            }));
            
            setWeekData(transformedData);
            
            const sortedDates = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
            const startDate = sortedDates[0].date;
            const endDate = sortedDates[sortedDates.length - 1].date;
            
            setDateRange({
              start: formatDateForDisplay(startDate),
              end: formatDateForDisplay(endDate)
            });
          } else {
            setWeekData([]);
            setDateRange({ start: null, end: null });
          }
        }
        
        // Filter data for regularization needs
        const needsRegularization = weekData.filter(record => {
          return !record.timeIn || !record.timeOut || 
                 record.status === "Absent" || 
                 record.status === "MissedCheckout";
        });
        
        console.log('Records needing regularization:', needsRegularization);
        setRegularizationData(needsRegularization);
        
        if (needsRegularization.length === 0) {
          setMessage({
            type: "info",
            text: "No attendance records require regularization for the selected period."
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

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'MissedCheckout': return 'warning';
      case 'Absent': return 'danger';
      case 'Weekend': return 'info';
      case 'Present': return 'success';
      default: return 'secondary';
    }
  };

  // Get regularization type badge variant
  const getRegularizationVariant = (type) => {
    switch (type) {
      case 'Full Day Absent': return 'danger';
      case 'Missed Check-in': return 'warning';
      case 'Missed Check-out': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <h2>Attendance Regularization</h2>
            
            {message.text && (
              <Alert
                variant={message.type}
                className="mt-3 mb-3"
                onClose={() => setMessage({ type: "", text: "" })}
                dismissible
              >
                {message.text}
              </Alert>
            )}

            <Card className="p-3 shadow-sm mb-4">
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

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="regularization" title={`Needs Regularization (${regularizationData.length})`}>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : regularizationData.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                            <th>Regularization Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regularizationData.map((record) => (
                            <tr key={record.id}>
                              <td>{formatDateForDisplay(record.date)}</td>
                              <td>{record.day}</td>
                              <td>{record.timeIn || "-"}</td>
                              <td>{record.timeOut || "-"}</td>
                              <td>{record.hours}</td>
                              <td>
                                <Badge bg={getStatusVariant(record.status)}>
                                  {record.status}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={getRegularizationVariant(record.regularizationType)}>
                                  {record.regularizationType}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-check-circle display-1 text-success"></i>
                      <h4 className="mt-3 text-muted">No Regularization Required</h4>
                      <p className="text-muted">
                        All attendance records for the selected period are complete
                      </p>
                    </div>
                  )}
                </Tab>
                <Tab eventKey="all" title={`All Records (${weekData.length})`}>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : weekData.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekData.map((record) => (
                            <tr key={record.id}>
                              <td>{formatDateForDisplay(record.date)}</td>
                              <td>{record.day}</td>
                              <td>{record.timeIn || "-"}</td>
                              <td>{record.timeOut || "-"}</td>
                              <td>{record.hours}</td>
                              <td>
                                <Badge bg={getStatusVariant(record.status)}>
                                  {record.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-calendar-x display-1 text-muted"></i>
                      <h4 className="mt-3 text-muted">No Attendance Records Found</h4>
                      <p className="text-muted">
                        No attendance records found for the selected period
                      </p>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AttendanceRegularization;