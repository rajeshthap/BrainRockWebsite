import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Badge, Button, Pagination, Alert, Form } from "react-bootstrap";
import { AiOutlineUser } from 'react-icons/ai'; // Default icon for students
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

// Define all 13 districts
const ALL_DISTRICTS = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nanital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Usnagar",
  "Uttarkashi"
];

const AllStudentsData = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Student data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Changed to 50 records per page
  
  // Filter state
  const [districtFilter, setDistrictFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2025'); // Default to 2025
  const [statusFilter, setStatusFilter] = useState('all'); // Added status filter
  
  // Status options state (dynamically fetched)
  const [statusOptions, setStatusOptions] = useState([]);
  
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/get-nandapraroop-details-${yearFilter}/`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        
        const data = await response.json();
        if (data.success) {
          // Extract unique status values from data
          const uniqueStatuses = [...new Set(data.data.map(student => student.status || 'pending'))];
          setStatusOptions(uniqueStatuses);
          
          setStudents(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch student data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [yearFilter]); // Re-fetch when year filter changes

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter students based on district and status
  const filteredStudents = students.filter((student) => {
    const matchesDistrict = districtFilter === 'all' || student.district === districtFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesDistrict && matchesStatus;
  });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle district filter change
  const handleDistrictFilterChange = (e) => {
    setDistrictFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle year filter change
  const handleYearFilterChange = (e) => {
    setYearFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when year changes
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show max 5 page numbers at a time
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
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
              <h2 className="mb-0">All Student Details</h2>
              <div className="d-flex gap-2 flex-wrap">
                <div style={{ width: '120px' }}>
                  <Form.Select
                    value={yearFilter}
                    onChange={handleYearFilterChange}
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </Form.Select>
                </div>
                <div style={{ width: '180px' }}>
                  <Form.Select
                    value={districtFilter}
                    onChange={handleDistrictFilterChange}
                  >
                    <option value="all">All Districts</option>
                    {ALL_DISTRICTS.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </Form.Select>
                </div>
                <div style={{ width: '150px' }}>
                  <Form.Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
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
                          <th>Mobile</th>
                          <th>District</th>
                          <th>Status</th>
                        </tr>
                        
                        {currentItems.length > 0 ? (
                          currentItems.map((student, index) => (
                            <tr key={student.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="Name">{student.girl_name}</td>
                              <td data-th="Mobile">{student.mobile_no}</td>
                              <td data-th="District">{student.district}</td>
                              <td data-th="Status">
                                <span className={`badge bg-${getStatusVariant(student.status)} me-2`}>
                                  {student.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No student data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>
                
                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
                    <span className="text-muted">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                    </span>
                    <Pagination>
                      <Pagination.First 
                        onClick={() => handlePageChange(1)} 
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                      />
                      
                      {getPageNumbers().map(page => (
                        <Pagination.Item 
                          key={page} 
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last 
                        onClick={() => handlePageChange(totalPages)} 
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
    </div>
  );
};

export default AllStudentsData;