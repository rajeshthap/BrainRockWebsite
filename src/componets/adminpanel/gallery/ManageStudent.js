import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Image, Badge, Button, Pagination, Alert, Modal, Form } from "react-bootstrap";
import { AiFillEdit } from "react-icons/ai";
import { AiOutlineUser } from 'react-icons/ai'; // Default icon for students
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageStudent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Student data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // New state for status filter
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch student data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/course-registration/`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        
        const data = await response.json();
        if (data.success) {
          // Process data to construct full image URLs
          const processedStudents = data.data.map(student => {
            const processedStudent = { ...student };
            
            // Format image URL
            if (student.profile_photo) {
              processedStudent.profile_photo = `${API_BASE_URL}${student.profile_photo}?t=${Date.now()}`;
            }
            
            return processedStudent;
          });
          
          setStudents(processedStudents);
        } else {
          throw new Error(data.message || 'Failed to fetch student data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Function to format the application_for_course field
  const formatCourseList = (courses) => {
    if (!courses) return 'N/A';
    
    // If it's already a string, return it
    if (typeof courses === 'string') {
      return courses;
    }
    
    // If it's an array of objects with a name property
    if (Array.isArray(courses)) {
      if (courses.length > 0) {
        // Check if each item is an object with a name property
        if (typeof courses[0] === 'object' && courses[0] !== null) {
          // Extract the name from each object
          const courseNames = courses.map(course => 
            course.name || course.course_name || course.title || JSON.stringify(course)
          );
          return courseNames.join(', ');
        } else {
          // If it's an array of strings, join them
          return courses.join(', ');
        }
      } else {
        return 'N/A';
      }
    }
    
    // If it's an object, try to extract a meaningful property
    if (typeof courses === 'object' && courses !== null) {
      return courses.name || courses.course_name || courses.title || JSON.stringify(courses);
    }
    
    // Fallback
    return String(courses);
  };
  
  // Filter students based on search term and status
  const filteredStudents = students.filter((student) => {
    const lowerSearch = searchTerm.toLowerCase();
    const courseString = formatCourseList(student.application_for_course).toLowerCase();
    
    const matchesSearch = (
      student.candidate_name?.toLowerCase().includes(lowerSearch) ||
      student.email?.toLowerCase().includes(lowerSearch) ||
      student.mobile_no?.toLowerCase().includes(lowerSearch) ||
      courseString.includes(lowerSearch)
    );
    
    const matchesStatus = statusFilter === 'all' || student.course_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle view student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch(status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
      default:
        return 'warning';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Manage Students</h2>
              <div className="d-flex gap-2">
                <div style={{ width: '200px' }}>
                  <Form.Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </div>
                <div style={{ width: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or course..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
            
            {error && (
              <Alert variant="danger" className="mb-4">
                Error: {error}
              </Alert>
            )}
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading student data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Course</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                        
                        {currentItems.length > 0 ? (
                          currentItems.map((student, index) => (
                            <tr key={student.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="Name">{student.candidate_name}</td>
                              <td data-th="Email">{student.email}</td>
                              <td data-th="Phone">{student.mobile_no}</td>
                              <td data-th="Course">{formatCourseList(student.application_for_course)}</td>
                              <td data-th="Status">
                                <span className={`badge bg-${getStatusVariant(student.course_status)} me-2`}>
                                  {student.course_status}
                                </span>
                              </td>
                              <td data-th="Date">{formatDate(student.created_at)}</td>
                              <td data-th="Action">
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  onClick={() => handleViewStudent(student)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No student data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages).keys()].map(page => (
                        <Pagination.Item 
                          key={page + 1} 
                          active={page + 1 === currentPage}
                          onClick={() => handlePageChange(page + 1)}
                        >
                          {page + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
      
      {/* View Student Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <div>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    {/* Display profile photo or a default icon */}
                    {selectedStudent.profile_photo ? (
                      <img 
                        src={selectedStudent.profile_photo} 
                        alt={selectedStudent.candidate_name} 
                        style={{ width: '120px', height: '120px', marginRight: '20px', objectFit: 'cover', borderRadius: '10px' }} 
                      />
                    ) : (
                      <AiOutlineUser size={120} style={{ marginRight: '20px' }} />
                    )}
                    <div>
                      <h5>{selectedStudent.candidate_name}</h5>
                      <p className="text-muted">ID: {selectedStudent.applicant_id}</p>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <p><strong>Application Date:</strong> {formatDate(selectedStudent.created_at)}</p>
                  <p><strong>Course Status:</strong> 
                    <span className={`badge bg-${getStatusVariant(selectedStudent.course_status)} ms-2`}>
                      {selectedStudent.course_status}
                    </span>
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Mobile:</strong> {selectedStudent.mobile_no}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <p><strong>Date of Birth:</strong> {selectedStudent.date_of_birth}</p>
                  <p><strong>Highest Education:</strong> {selectedStudent.highest_education}</p>
                </Col>
              </Row>
              <Row>
                <Col md={12} className="mb-3">
                  <p><strong>Applied Course:</strong> {formatCourseList(selectedStudent.application_for_course)}</p>
                </Col>
              </Row>
              <Row>
                <Col md={12} className="mb-3">
                  <p><strong>School/College:</strong> {selectedStudent.school_college_name}</p>
                </Col>
              </Row>
              <Row>
                <Col md={12} className="mb-3">
                  <p><strong>Address:</strong> {selectedStudent.address}</p>
                </Col>
              </Row>
              <Row>
                <Col md={12} className="mb-3">
                  <p><strong>Guardian Name:</strong> {selectedStudent.guardian_name}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageStudent;