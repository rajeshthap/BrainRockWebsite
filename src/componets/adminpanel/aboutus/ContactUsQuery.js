import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Table, Button, Alert, Spinner, Modal, Form, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ContactUsQuery = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [contactQueries, setContactQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 entries per page
  
  // State for selected contact
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

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

  // Fetch contact queries on component mount
  useEffect(() => {
    const fetchContactQueries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact-us/`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch contact queries');
        }
        const result = await response.json();
        
        // The API returns data directly as an array
        if (Array.isArray(result)) {
          // Use the result directly as it's already an array
          setContactQueries(result);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching contact queries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactQueries();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Format date for better readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to handle viewing contact details
  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };
  
  // Function to close modal
  const handleCloseModal = () => {
    setShowContactModal(false);
  };

  // Filter contacts based on search term (email and phone)
  const filteredContacts = useMemo(() => {
    if (!searchTerm) {
      return contactQueries;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return contactQueries.filter(contact =>
      contact.full_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      contact.email?.toLowerCase().includes(lowercasedSearchTerm) ||
      contact.phone?.toLowerCase().includes(lowercasedSearchTerm) ||
      contact.subject?.toLowerCase().includes(lowercasedSearchTerm) ||
      contact.message?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [contactQueries, searchTerm]);

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get current page's contacts
  const paginatedContacts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredContacts, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dashboard-container">
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Contact Us Queries</h2>
              
              {/* Search functionality */}
              <div className="d-flex align-items-center">
                <span className="me-2">Search:</span>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control me-3"
                  style={{ width: '300px' }}
                />
              </div>
            </div>
            
            {loading && <div className="d-flex justify-content-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">Failed to load contact queries: {error}</Alert>}

            {!loading && !error && (
              <>
                {/* --- TABLE STRUCTURE --- */}
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                        
                        {paginatedContacts.length > 0 ? (
                          paginatedContacts.map((query, index) => (
                            <tr key={query.id}>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="Name">{query.full_name}</td>
                              <td data-th="Email">{query.email}</td>
                              <td data-th="Phone">{query.phone}</td>
                              <td data-th="Subject">{query.subject}</td>
                              <td data-th="Message" className="message-cell">
                                {query.message.length > 50 
                                  ? `${query.message.substring(0, 50)}...` 
                                  : query.message}
                              </td>
                              <td data-th="Date">{formatDate(query.created_at)}</td>
                              <td data-th="Action">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleViewContact(query)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No contact queries found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>
              
                {/* --- PAGINATION CONTROLS --- */}
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
      
      {/* CONTACT DETAILS MODAL */}
      <Modal show={showContactModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Contact Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContact && (
            <Row>
              <Col md={6} className="mb-3">
                <h5>Name</h5>
                <p>{selectedContact.full_name}</p>
              </Col>
              <Col md={6} className="mb-3">
                <h5>Email</h5>
                <p>{selectedContact.email}</p>
              </Col>
              <Col md={6} className="mb-3">
                <h5>Phone</h5>
                <p>{selectedContact.phone}</p>
              </Col>
              <Col md={6} className="mb-3">
                <h5>Subject</h5>
                <p>{selectedContact.subject}</p>
              </Col>
              <Col md={12} className="mb-3">
                <h5>Message</h5>
                <p>{selectedContact.message}</p>
              </Col>
              <Col md={6} className="mb-3">
                <h5>Date</h5>
                <p>{formatDate(selectedContact.created_at)}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContactUsQuery;