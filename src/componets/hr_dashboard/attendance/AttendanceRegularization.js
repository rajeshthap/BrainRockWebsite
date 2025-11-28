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
  Spinner,
  Image,
  Pagination,
} from "react-bootstrap";
import "../../../assets/css/Profile.css";
import { AuthContext } from "../../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
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
  
  // New states for employee management (only for admin)
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Initialize showEmployeeList based on user role
  const [showEmployeeList, setShowEmployeeList] = useState(user?.role === 'admin' || user?.role === 'Technical Lead'  ? true : false);
  
  // State for search and pagination (only for admin)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'Technical Lead' ;

  // Fetch employees from API (only for admin)
  const fetchEmployees = async () => {
    if (!isAdmin) return; // Only fetch employees if user is admin
    
    setEmployeesLoading(true);
    try {
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (data && Array.isArray(data.results)) {
          setEmployees(data.results);
        } else {
          setMessage({
            type: "danger",
            text: "Received unexpected data format from server."
          });
        }
      } else {
        const errorText = await response.text();
        console.error("Error fetching employees:", errorText);
        setMessage({
          type: "danger",
          text: "Failed to fetch employee list"
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setMessage({
        type: "danger",
        text: "Error fetching employee list. Please try again."
      });
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch employees on component mount (only for admin)
  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, []);

  // Function to handle viewing regularization for a specific employee (only for admin)
  const handleViewRegularization = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeList(false);
    // Reset attendance data
    setAttendanceData([]);
    setWeekData([]);
    setRegularizationData([]);
    // Fetch attendance data for the selected employee
    fetchAttendanceData(selectedDate, viewMode, employee.emp_id);
  };

  // Function to go back to employee list (only for admin)
  const handleBackToEmployeeList = () => {
    setShowEmployeeList(true);
    setSelectedEmployee(null);
  };

  // Filter employees based on search term and status (only for admin)
  const allFilteredEmployees = React.useMemo(() => {
    let filtered = employees;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => {
        if (statusFilter === 'active') {
          return emp.is_active === true;
        } else if (statusFilter === 'inactive') {
          return emp.is_active === false;
        }
        return true;
      });
    }
    
    // Apply search filter
    if (!searchTerm) {
      return filtered;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return filtered.filter(emp =>
      emp.first_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.last_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.email?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.emp_id?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.phone?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [employees, searchTerm, statusFilter]);

  // Reset page on search or status filter change (only for admin)
  useEffect(() => {
    if (isAdmin) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  // Get current page's employees (only for admin)
  const paginatedEmployees = React.useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredEmployees, currentPage, itemsPerPage]);

  // Calculate total pages (only for admin)
  const totalPages = Math.ceil(allFilteredEmployees.length / itemsPerPage);

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

  // Fetch attendance Data from API
  const fetchAttendanceData = async (date = selectedDate, mode = viewMode, employeeId) => {
    // Use the logged-in user's ID for non-admin users
    const targetEmployeeId = isAdmin ? employeeId : user?.unique_id;
    
    if (!targetEmployeeId) return;

    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const { start, end } = getDateRange(date, mode);
      let apiUrl = `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/attendance/report/?employee_id=${targetEmployeeId}`;
      
      // Add date range parameters based on view mode
      if (mode === 'day') {
        apiUrl += `&date=${start}`;
      } else if (mode === 'week' || mode === 'month') {
        apiUrl += `&start_date=${start}&end_date=${end}`;
      }
      
      console.log('Fetching data for:', { mode, start, end, employeeId: targetEmployeeId });
      
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

  // Fetch data on component mount or when selected employee changes
  useEffect(() => {
    // For non-admin users, fetch their own data immediately
    if (!isAdmin && user?.unique_id) {
      fetchAttendanceData();
    }
    // For admin users, fetch data when an employee is selected
    else if (isAdmin && selectedEmployee?.emp_id) {
      fetchAttendanceData();
    }
  }, [selectedEmployee, user]);

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

  const baseUrl = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

  // Render employee list (only for admin)
  const renderEmployeeList = () => {
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Employee List</h2>
              
              {/* Status Filter Dropdown - Only for active/inactive */}
              <div className="d-flex align-items-center">
                <span className="me-2">Filter by Status:</span>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ width: '150px' }}
                >
                  <option value="all">All Employees</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </div>
            </div>
            
            {message.text && (
              <Alert
                variant={message.type}
                className="mb-3"
                onClose={() => setMessage({ type: "", text: "" })}
                dismissible
              >
                {message.text}
              </Alert>
            )}
            
            {employeesLoading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                {/* Employee Table */}
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Photo</th>
                          <th>Employee ID</th>
                          <th>Employee Name</th>
                          <th>Department</th>
                          <th>Designation</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
 
                        {paginatedEmployees.length > 0 ? (
                          paginatedEmployees.map((emp, index) => (
                            <tr key={emp.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="Photo">
                                {emp.profile_photo ? (
                                  <Image src={`${baseUrl}${emp.profile_photo}`} roundedCircle width={40} height={40} />
                                ) : (
                                  <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', color: 'white', fontSize: '0.8rem'}}>
                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                  </div>
                                )}
                              </td>
                              <td data-th="Employee ID">{emp.emp_id || "N/A"}</td>
                              <td data-th="Employee Name">{emp.first_name} {emp.last_name}</td>
                              <td data-th="Department">{emp.department || "N/A"}</td>
                              <td data-th="Designation">{emp.designation || "N/A"}</td>
                              <td data-th="Email">{emp.email || "N/A"}</td>
                              <td data-th="Mobile">{emp.phone || "N/A"}</td>
                              <td data-th="Status">
                                <Badge bg={emp.is_active ? "success" : "secondary"}>
                                  {emp.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td data-th="Action">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleViewRegularization(emp)}
                                >
                                  <AiFillEdit /> View Regularization
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center">
                              No employees found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>
                
                {/* Pagination Controls */}
                {allFilteredEmployees.length > itemsPerPage && (
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <Pagination>
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                      />
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item 
                          key={index + 1} 
                          active={index + 1 === currentPage}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    );
  };

  // Render regularization view (for both admin and regular users)
  const renderRegularizationView = () => {
    const displayName = isAdmin ? 
      (selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 'Selected Employee') :
      (user ? `${user.first_name} ${user.last_name}` : 'Current User');
    
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body">
            {/* Back button (only for admin) and employee info */}
            {isAdmin && (
              <Card className="p-3 shadow-sm mb-3">
                <Row className="align-items-center">
                  <Col>
                    <Button 
                      variant="outline-secondary" 
                      className="me-3"
                      onClick={handleBackToEmployeeList}
                    >
                      <IoIosArrowBack /> Back to Employee List
                    </Button>
                    <h5 className="d-inline-block mb-0">
                      Regularization for: {displayName}
                    </h5>
                    {selectedEmployee && (
                      <p className="text-muted mb-0 mt-1">
                        Employee ID: {selectedEmployee.emp_id || 'N/A'} | 
                        Department: {selectedEmployee.department || 'N/A'} | 
                        Designation: {selectedEmployee.designation || 'N/A'}
                      </p>
                    )}
                  </Col>
                </Row>
              </Card>
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
          </Container>
        </div>
      </div>
    );
  };

  // Main render logic based on user role
  if (isAdmin) {
    // Admin flow: Show employee list first, then regularization for selected employee
    return showEmployeeList ? renderEmployeeList() : renderRegularizationView();
  } else {
    // Regular user flow: Skip employee list, directly show their regularization
    return renderRegularizationView();
  }
};

export default AttendanceRegularization;