import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Image, Badge, Button, Pagination, Alert, Modal, Form } from "react-bootstrap";
import { AiFillEdit } from "react-icons/ai";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const ViewCertified = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Certificate data state
  const [certificates, setCertificates] = useState([]);
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

  // Fetch certificate data
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/certificate/', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch certificate data');
        }
        
        const data = await response.json();
        if (data.success) {
          setCertificates(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch certificate data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = certificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            <h2 className="mb-4">Certificate Management</h2>
            
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
                <p className="mt-2">Loading certificate data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Certificate Number</th>
                          <th>Certificate ID</th>
                          <th>Full Name</th>
                          <th>Father Name</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Program</th>
                          <th>Created At</th>
                        </tr>
                        
                        {currentItems.length > 0 ? (
                          currentItems.map((certificate, index) => (
                            <tr key={certificate.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="Certificate Number">{certificate.certificate_number}</td>
                              <td data-th="Certificate ID">{certificate.certificate_id}</td>
                              <td data-th="Full Name">{certificate.full_name}</td>
                              <td data-th="Father Name">{certificate.father_name}</td>
                              <td data-th="Start Date">{formatDate(certificate.from_date)}</td>
                              <td data-th="End Date">{formatDate(certificate.to_date)}</td>
                              <td data-th="Program">{certificate.program}</td>
                              <td data-th="Created At">{formatDate(certificate.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center">
                              No certificate data available.
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

export default ViewCertified;