import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Badge, Button, Pagination, Alert, Modal, Form, Nav, NavDropdown } from "react-bootstrap";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define base URL for your API
const API_BASE_URL = 'https://brainrock.in/brainrock/backend';

const Registerduser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' or 'participated'
  
  // Registered users data state
  const [users, setUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected users for deletion
  const [selectedUsers, setSelectedUsers] = useState([]);
  
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

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let url, dataKey, dataSetter;
        
        if (activeTab === 'registered') {
          url = `${API_BASE_URL}/api/register-test/`;
          dataKey = 'users';
          dataSetter = setUsers;
        } else {
          url = `${API_BASE_URL}/api/quiz-participants/`;
          dataKey = 'participants';
          dataSetter = setParticipants;
        }

        console.log(`=== Fetching ${activeTab} data ===`);
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('=== API response data ===', JSON.stringify(data, null, 2));
        
        // Check if response is an array (direct data format)
        if (Array.isArray(data)) {
          dataSetter(data);
          console.log(`Success - ${dataKey} data:`, data);
        } else if (data.status && Array.isArray(data.data)) {
          // API uses status: true instead of success: true
          dataSetter(data.data);
          console.log(`Success - ${dataKey} data:`, data.data);
        } else {
          console.error('API returned unexpected data format:', typeof data, data);
          throw new Error(data.message || `Failed to fetch ${activeTab} data`);
        }
      } catch (err) {
        console.error(`=== Error fetching ${activeTab} data ===`);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setError(err.message || `Failed to fetch ${activeTab} data`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter data based on active tab
  const filteredData = activeTab === 'registered' ? users.filter((user) => {
    const lowerSearch = searchTerm.toLowerCase();
    
    const matchesSearch = (
      user.full_name?.toLowerCase().includes(lowerSearch) ||
      user.email?.toLowerCase().includes(lowerSearch) ||
      user.phone?.toLowerCase().includes(lowerSearch) ||
      user.user_id?.toLowerCase().includes(lowerSearch)
    );
    
    const matchesPaymentStatus = paymentStatusFilter === 'all' || user.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesPaymentStatus;
  }) : participants.filter((participant) => {
    const lowerSearch = searchTerm.toLowerCase();
    
    const matchesSearch = (
      participant.student?.full_name?.toLowerCase().includes(lowerSearch) ||
      participant.student?.email?.toLowerCase().includes(lowerSearch) ||
      participant.student?.phone?.toLowerCase().includes(lowerSearch) ||
      participant.student?.user_id?.toLowerCase().includes(lowerSearch) ||
      participant.quiz?.toLowerCase().includes(lowerSearch)
    );
    
    const matchesPaymentStatus = paymentStatusFilter === 'all' || participant.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesPaymentStatus;
  });
  
  console.log(`=== Filtered ${activeTab} data ===`, filteredData);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  console.log('=== Current items (page', currentPage, ') ===', currentItems);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };
  
  // Handle user selection for deletion
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  // Handle select all items on current page
  const handleSelectAll = () => {
    if (selectedUsers.length === currentItems.length) {
      setSelectedUsers([]);
    } else {
      const ids = currentItems.map(item => activeTab === 'registered' ? item.user_id : item.id);
      setSelectedUsers(ids);
    }
  };
  
  // Handle delete selected users
  const handleDeleteUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/register-test/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_ids: selectedUsers }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete users');
      }
      
      const data = await response.json();
      if (data.status) {
        // Remove deleted users from the state
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.user_id)));
        setSelectedUsers([]);
        setShowDeleteModal(false);
      } else {
        throw new Error(data.message || 'Failed to delete users');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };
  
  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Handle payment status filter change
  const handlePaymentStatusFilterChange = (e) => {
    setPaymentStatusFilter(e.target.value);
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

  // Render table based on active tab
  const renderTable = () => {
    if (activeTab === 'registered') {
      return (
        <>
          <table className="temp-rwd-table">
            <tbody>
              <tr>
                <th>
                  <Form.Check 
                    type="checkbox"
                    checked={selectedUsers.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    label=""
                  />
                </th>
                <th>S.No</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Fee</th>
                <th>Payment Status</th>
                <th>Test Status</th>
                <th>Score</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
              
              {currentItems.length > 0 ? (
                currentItems.map((user, index) => (
                  <tr key={user.user_id}>
                    <td data-th="Select">
                      <Form.Check 
                        type="checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => handleSelectUser(user.user_id)}
                        label=""
                      />
                    </td>
                    <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td data-th="User ID">{user.user_id}</td>
                    <td data-th="Name">{user.full_name}</td>
                    <td data-th="Email">{user.email}</td>
                    <td data-th="Phone">{user.phone}</td>
                    <td data-th="Fee">₹{parseFloat(user.fee).toFixed(2)}</td>
                    <td data-th="Payment Status">
                      <span className={`badge bg-${user.payment_status === 'completed' ? 'success' : 'warning'}`}>
                        {user.payment_status}
                      </span>
                    </td>
                    <td data-th="Test Status">
                      <span className={`badge bg-${user.test_status === 'passed' ? 'success' : user.test_status === 'failed' ? 'danger' : 'warning'}`}>
                        {user.test_status || 'Not Attempted'}
                      </span>
                    </td>
                    <td data-th="Score">{user.score || 'N/A'}</td>
                    <td data-th="Date">{formatDate(user.created_at)}</td>
                    <td data-th="Action">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleViewUser(user)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">
                    No registered users data available.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', borderTop: '2px solid #0066cc' }}>
                <td colSpan="8" className="text-end pe-3" style={{ color: '#333' }}>
                  <strong>Payment Summary:</strong>
                </td>
                <td colSpan="4" style={{ paddingLeft: '20px' }}>
                  <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                    <div style={{ color: '#27ae60', fontWeight: '600' }}>
                      ✓ Completed: {filteredData.filter(u => u.payment_status === 'completed').length} | ₹{parseFloat(filteredData.filter(u => u.payment_status === 'completed').reduce((sum, u) => sum + (parseFloat(u.fee) || 0), 0)).toFixed(2)}
                    </div>
                    <div style={{ color: '#e74c3c', fontWeight: '600' }}>
                      ✗ Unsuccessful: {filteredData.filter(u => u.payment_status !== 'completed').length} | ₹{parseFloat(filteredData.filter(u => u.payment_status !== 'completed').reduce((sum, u) => sum + (parseFloat(u.fee) || 0), 0)).toFixed(2)}
                    </div>
                    <div style={{ marginTop: '8px', borderTop: '1px solid #bdc3c7', paddingTop: '8px', color: '#0066cc', fontWeight: '700' }}>
                      Total: ₹{parseFloat(filteredData.reduce((sum, u) => sum + (parseFloat(u.fee) || 0), 0)).toFixed(2)}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      );
    } else {
      // Participated Quiz tab
      return (
        <>
          <table className="temp-rwd-table">
            <tbody>
              <tr>
                <th>
                  <Form.Check 
                    type="checkbox"
                    checked={selectedUsers.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    label=""
                  />
                </th>
                <th>S.No</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Quiz</th>
                <th>Payment Status</th>
                <th>Attempt Status</th>
                <th>Total Questions</th>
                <th>Score</th>
                <th>Joined At</th>
                <th>Action</th>
              </tr>
              
              {currentItems.length > 0 ? (
                currentItems.map((participant, index) => (
                  <tr key={participant.id}>
                    <td data-th="Select">
                      <Form.Check 
                        type="checkbox"
                        checked={selectedUsers.includes(participant.id)}
                        onChange={() => handleSelectUser(participant.id)}
                        label=""
                      />
                    </td>
                    <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td data-th="User ID">{participant.student?.user_id}</td>
                    <td data-th="Name">{participant.student?.full_name}</td>
                    <td data-th="Email">{participant.student?.email}</td>
                    <td data-th="Phone">{participant.student?.phone}</td>
                    <td data-th="Quiz">{participant.quiz}</td>
                    <td data-th="Payment Status">
                      <span className={`badge bg-${participant.payment_status === 'wallet-completed' || participant.payment_status === 'completed' ? 'success' : 'warning'}`}>
                        {participant.payment_status}
                      </span>
                    </td>
                    <td data-th="Attempt Status">
                      <span className={`badge bg-${participant.attempt?.attempt_status === 'submitted' ? 'success' : participant.attempt?.attempt_status === 'started' ? 'info' : 'warning'}`}>
                        {participant.attempt?.attempt_status || 'Not Attempted'}
                      </span>
                    </td>
                    <td data-th="Total Questions">{participant.attempt?.total_questions || 'N/A'}</td>
                    <td data-th="Score">{participant.attempt?.score || 'N/A'}</td>
                    <td data-th="Joined At">{formatDate(participant.joined_at)}</td>
                    <td data-th="Action">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleViewUser(participant)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center">
                    No quiz participants data available.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', borderTop: '2px solid #0066cc' }}>
                <td colSpan="8" className="text-end pe-3" style={{ color: '#333' }}>
                  <strong>Quiz Participation Summary:</strong>
                </td>
                <td colSpan="5" style={{ paddingLeft: '20px' }}>
                  <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                    <div style={{ color: '#27ae60', fontWeight: '600' }}>
                      ✓ Completed: {filteredData.filter(p => p.attempt?.attempt_status === 'submitted').length}
                    </div>
                    <div style={{ color: '#3498db', fontWeight: '600' }}>
                      ⏳ Started: {filteredData.filter(p => p.attempt?.attempt_status === 'started').length}
                    </div>
                    <div style={{ color: '#f39c12', fontWeight: '600' }}>
                      ⏰ Not Attempted: {filteredData.filter(p => !p.attempt || !p.attempt.attempt_status).length}
                    </div>
                    <div style={{ marginTop: '8px', borderTop: '1px solid #bdc3c7', paddingTop: '8px', color: '#0066cc', fontWeight: '700' }}>
                      Total Participants: {filteredData.length}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      );
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
            {/* Tab Navigation */}
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'registered'} 
                  onClick={() => setActiveTab('registered')}
                >
                  Registered Users
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'participated'} 
                  onClick={() => setActiveTab('participated')}
                >
                  Participated Quiz
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Khelo Jito {activeTab === 'registered' ? 'Registered Users' : 'Participated Quiz'}</h2>
              <div className="d-flex gap-2">
                {selectedUsers.length > 0 && (
                  <Button 
                    className="btn-delete"
                    variant="danger" 
                    onClick={openDeleteModal}
                    disabled={selectedUsers.length === 0}
                  >
                    Delete Selected ({selectedUsers.length})
                  </Button>
                )}
                <div style={{ width: '200px' }}>
                  <Form.Select
                    value={paymentStatusFilter}
                    onChange={handlePaymentStatusFilterChange}
                  >
                    <option value="all">All Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </Form.Select>
                </div>
                <div style={{ width: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or user ID..."
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
                <p className="mt-2">Loading {activeTab === 'registered' ? 'registered users' : 'quiz participants'} data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    {renderTable()}
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
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete {selectedUsers.length} selected user(s)?</p>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUsers}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View User Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{activeTab === 'registered' ? 'User Details' : 'Quiz Participant Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              {activeTab === 'registered' ? (
                // Registered user details
                <>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div>
                        <h5>{selectedUser.full_name}</h5>
                        <p className="text-muted">User ID: {selectedUser.user_id}</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <p><strong>Registration Date:</strong> {formatDate(selectedUser.created_at)}</p>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6} className="mb-3">
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>Phone:</strong> {selectedUser.phone}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <p><strong>Fee:</strong> ₹{parseFloat(selectedUser.fee).toFixed(2)}</p>
                      <p><strong>Payment Status:</strong> 
                        <span className={`badge bg-${selectedUser.payment_status === 'completed' ? 'success' : 'warning'} ms-2`}>
                          {selectedUser.payment_status}
                        </span>
                      </p>
                    </Col>
                  </Row>
                  
                  {selectedUser.payment_status === 'completed' && (
                    <Row>
                      <Col md={6} className="mb-3">
                        <p><strong>PhonePe Order ID:</strong> {selectedUser.phonepe_order_id}</p>
                      </Col>
                      <Col md={6} className="mb-3">
                        <p><strong>Transaction ID:</strong> {selectedUser.transaction_id}</p>
                      </Col>
                    </Row>
                  )}
                  
                  {selectedUser.test_status && (
                    <Row>
                      <Col md={6} className="mb-3">
                        <p><strong>Test Status:</strong> 
                          <span className={`badge bg-${selectedUser.test_status === 'passed' ? 'success' : 'danger'} ms-2`}>
                            {selectedUser.test_status}
                          </span>
                        </p>
                      </Col>
                      {selectedUser.score !== undefined && (
                        <Col md={6} className="mb-3">
                          <p><strong>Score:</strong> {selectedUser.score}</p>
                        </Col>
                      )}
                    </Row>
                  )}
                </>
              ) : (
                // Quiz participant details
                <>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div>
                        <h5>{selectedUser.student?.full_name}</h5>
                        <p className="text-muted">User ID: {selectedUser.student?.user_id}</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <p><strong>Quiz:</strong> {selectedUser.quiz}</p>
                      <p><strong>Joined At:</strong> {formatDate(selectedUser.joined_at)}</p>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6} className="mb-3">
                      <p><strong>Email:</strong> {selectedUser.student?.email}</p>
                      <p><strong>Phone:</strong> {selectedUser.student?.phone}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <p><strong>Payment Status:</strong> 
                        <span className={`badge bg-${selectedUser.payment_status === 'wallet-completed' || selectedUser.payment_status === 'completed' ? 'success' : 'warning'} ms-2`}>
                          {selectedUser.payment_status}
                        </span>
                      </p>
                    </Col>
                  </Row>
                  
                  {selectedUser.attempt && (
                    <Row>
                      <Col md={6} className="mb-3">
                        <p><strong>Attempt Status:</strong> 
                          <span className={`badge bg-${selectedUser.attempt.attempt_status === 'submitted' ? 'success' : selectedUser.attempt.attempt_status === 'started' ? 'info' : 'warning'} ms-2`}>
                            {selectedUser.attempt.attempt_status}
                          </span>
                        </p>
                        <p><strong>Total Questions:</strong> {selectedUser.attempt.total_questions}</p>
                      </Col>
                      <Col md={6} className="mb-3">
                        <p><strong>Score:</strong> {selectedUser.attempt.score}</p>
                        {selectedUser.attempt.started_at && (
                          <p><strong>Started At:</strong> {formatDate(selectedUser.attempt.started_at)}</p>
                        )}
                        {selectedUser.attempt.submitted_at && (
                          <p><strong>Submitted At:</strong> {formatDate(selectedUser.attempt.submitted_at)}</p>
                        )}
                      </Col>
                    </Row>
                  )}
                </>
              )}
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

export default Registerduser;