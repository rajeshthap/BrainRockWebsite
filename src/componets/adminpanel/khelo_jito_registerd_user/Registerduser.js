import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Badge, Button, Pagination, Alert, Modal, Form } from "react-bootstrap";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define base URL for your API
const API_BASE_URL = 'https://brainrock.in/brainrock/backend';

const Registerduser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Registered users data state
  const [users, setUsers] = useState([]);
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

  // Fetch registered users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('=== Fetching Khelo Jito users ===');
        const response = await fetch(`${API_BASE_URL}/api/register-test/`, {
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
          setUsers(data);
          console.log('Success - Users data:', data);
        } else if (data.status && Array.isArray(data.data)) {
          // API uses status: true instead of success: true
          setUsers(data.data);
          console.log('Success - Users data:', data.data);
        } else {
          console.error('API returned unexpected data format:', typeof data, data);
          throw new Error(data.message || 'Failed to fetch registered users data');
        }
      } catch (err) {
        console.error('=== Error fetching registered users ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setError(err.message || 'Failed to fetch registered users data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter users based on search term and payment status
  const filteredUsers = users.filter((user) => {
    const lowerSearch = searchTerm.toLowerCase();
    
    const matchesSearch = (
      user.full_name?.toLowerCase().includes(lowerSearch) ||
      user.email?.toLowerCase().includes(lowerSearch) ||
      user.phone?.toLowerCase().includes(lowerSearch) ||
      user.user_id?.toLowerCase().includes(lowerSearch)
    );
    
    const matchesPaymentStatus = paymentStatusFilter === 'all' || user.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesPaymentStatus;
  });
  
  console.log('=== Filtered users ===', filteredUsers);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
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
  
  // Handle select all users on current page
  const handleSelectAll = () => {
    if (selectedUsers.length === currentItems.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentItems.map(user => user.user_id));
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
        body: JSON.stringify({ user_id: selectedUsers }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete users');
      }
      
      const data = await response.json();
      if (data.success) {
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
              <h2 className="mb-0">Khelo Jito Registered Users</h2>
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
                <p className="mt-2">Loading registered users data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
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
                                ✓ Completed: {filteredUsers.filter(u => u.payment_status === 'completed').length} | ₹{parseFloat(filteredUsers.filter(u => u.payment_status === 'completed').reduce((sum, u) => sum + (parseFloat(u.fee) || 0), 0)).toFixed(2)}
                              </div>
                              <div style={{ color: '#e74c3c', fontWeight: '600' }}>
                                ✗ Unsuccessful: {filteredUsers.filter(u => u.payment_status !== 'completed').length} | ₹{parseFloat(filteredUsers.filter(u => u.payment_status !== 'completed').reduce((sum, u) => sum + (parseFloat(u.fee) || 0), 0)).toFixed(2)}
                              </div>
                              <div style={{ marginTop: '8px', borderTop: '1px solid #bdc3c7', paddingTop: '8px', color: '#0066cc', fontWeight: '700' }}>
                                Total: ₹{parseFloat(filteredUsers.reduce((sum, u) => sum + (parseFloat(u.fee) || 0), 0)).toFixed(2)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
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
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
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