import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Image, Badge, Button, Pagination, Alert } from "react-bootstrap";
import { AiFillEdit } from "react-icons/ai";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const Feedbackget = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Feedback data state
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
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

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/feedback/', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        
        const data = await response.json();
        if (data.success) {
          setFeedbacks(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch feedback data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = feedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle view feedback details
  const handleViewFeedback = (feedback) => {
    // Implement view feedback functionality
    console.log("View feedback details:", feedback);
    // You could open a modal or navigate to a detail page
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
            <h2 className="mb-4">Feedback Management</h2>
            
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
                <p className="mt-2">Loading feedback data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Message</th>
                          <th>Created At</th>
                    
                        </tr>
                        
                        {currentItems.length > 0 ? (
                          currentItems.map((feedback, index) => (
                            <tr key={feedback.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                             
                              <td data-th="Full Name">{feedback.full_name}</td>
                              <td data-th="Email">{feedback.email}</td>
                              <td data-th="Phone">{feedback.phone}</td>
                              <td data-th="Message">
                                <div className="message-preview">
                                  {feedback.message.length > 50 
                                    ? `${feedback.message.substring(0, 50)}...` 
                                    : feedback.message}
                                </div>
                              </td>
                              <td data-th="Created At">{formatDate(feedback.created_at)}</td>
                             
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No feedback data available.
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
    </div>
  );
};

export default Feedbackget;