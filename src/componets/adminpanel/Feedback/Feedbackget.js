import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Image, Badge, Button, Pagination, Alert, Modal, Form } from "react-bootstrap";
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
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);
  
  // Selection state for bulk delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'single' or 'bulk'
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
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
        const response = await fetch('https://brainrock.in/brainrock/backend/api/feedback/', {
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
  
  // Filter feedbacks based on search term
  const filteredFeedbacks = searchTerm.trim() === '' 
    ? feedbacks 
    : feedbacks.filter((feedback) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          feedback.email?.toLowerCase().includes(lowerSearch) ||
          feedback.message?.toLowerCase().includes(lowerSearch)
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(currentItems.map(feedback => feedback.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectFeedback = (id, checked) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
    if (!checked) {
      setSelectAll(false);
    } else if (selectedIds.length + 1 === currentItems.length) {
      setSelectAll(true);
    }
  };

  // Reset selection on page change
  useEffect(() => {
    setSelectedIds([]);
    setSelectAll(false);
  }, [currentPage]);

  // Single delete handler
  const handleSingleDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteType('single');
    setShowDeleteModal(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteType('bulk');
    setShowDeleteModal(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  // Execute delete
  const executeDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      const idsToDelete = deleteType === 'single' && feedbackToDelete 
        ? [feedbackToDelete.id] 
        : selectedIds;
      
      const response = await fetch('https://brainrock.in/brainrock/backend/api/feedback/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: idsToDelete }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      setFeedbacks(prev => prev.filter(f => !idsToDelete.includes(f.id)));
      
      setDeleteSuccess(true);
      setShowDeleteModal(false);
      setSelectedIds([]);
      setSelectAll(false);
      setFeedbackToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
      console.error('Error deleting feedback:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteType(null);
    setFeedbackToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(false);
  };
  
  // Format date for display in the requested format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle view feedback details
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };
  
  // Handle reply button click
  const handleReplyClick = () => {
    setShowViewModal(false);
    setShowReplyModal(true);
    setReplyMessage("");
    setReplyError(null);
    setReplySuccess(false);
  };
  
  // Handle send reply
  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setReplyError("Reply message cannot be empty");
      return;
    }
    
    setSendingReply(true);
    setReplyError(null);
    setReplySuccess(false);
    
    try {
      // Log the request details for debugging
      console.log("Sending reply to API:", {
        url: 'https://brainrock.in/brainrock/backend/api/reply-feedback/',
        method: 'PUT',
        body: {
          id: selectedFeedback.id,
          reply: replyMessage,
        }
      });
      
      const response = await fetch('https://brainrock.in/brainrock/backend/api/reply-feedback/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedFeedback.id,
          reply: replyMessage,
        }),
      });
      
      // Log the response status and headers
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      // Try to get the response text for debugging
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      // Parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error('Invalid response from server');
      }
      
      console.log("Parsed response data:", data);
      
      if (response.ok && data.id) {
        setReplySuccess(true);
        
        // Get current timestamp for instant update
        const currentTimestamp = new Date().toISOString();
        
        // Update the feedback in the list to show it has been replied
        setFeedbacks(prevFeedbacks => 
          prevFeedbacks.map(fb => 
            fb.id === selectedFeedback.id 
              ? { ...fb, reply: replyMessage, replied_at: currentTimestamp } 
              : fb
          )
        );
        
        // Update selected feedback for modal display
        setSelectedFeedback(prev => ({
          ...prev,
          reply: replyMessage,
          replied_at: currentTimestamp
        }));
        
        // Close modal after success
        setTimeout(() => {
          setShowReplyModal(false);
          setShowViewModal(false);
        }, 2000);
      } else {
        // Handle different error scenarios
        if (data.message) {
          throw new Error(data.message);
        } else if (data.errors) {
          // Handle validation errors
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(`Failed to send reply: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error("Error in handleSendReply:", err);
      setReplyError(err.message);
    } finally {
      setSendingReply(false);
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
              <h2 className="mb-0">Feedback Management</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by email or message..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
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
                <p className="mt-2">Loading feedback data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                          </th>
                          <th>S.No</th>
                          <th>Email</th>
                          <th>Message</th>
                          <th>Date</th>
                          <th>Replied At</th>
                          <th>Action</th>
                        </tr>
                        
                        {currentItems.length > 0 ? (
                          currentItems.map((feedback, index) => (
                            <tr key={feedback.id}>
                              <td data-th="Select" style={{ width: '40px' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(feedback.id)}
                                  onChange={(e) => handleSelectFeedback(feedback.id, e.target.checked)}
                                />
                              </td>
                              <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td data-th="Email">{feedback.email}</td>
                              <td data-th="Message">
                                <div className="message-preview">
                                  {feedback.message.length > 50 
                                    ? `${feedback.message.substring(0, 50)}...` 
                                    : feedback.message}
                                </div>
                              </td>
                              <td data-th="Date">{formatDate(feedback.created_at)}</td>
                              <td data-th="Replied At">
                                {feedback.replied_at ? formatDate(feedback.replied_at) : 'Not replied'}
                              </td>
                              <td data-th="Action">
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  onClick={() => handleViewFeedback(feedback)}
                                  className="me-1"
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm"
                                  onClick={() => handleSingleDelete(feedback)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
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
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      {selectedIds.length > 0 && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={deleting}
                        >
                          Delete Selected ({selectedIds.length})
                        </Button>
                      )}
                    </div>
                    <div className="d-flex justify-content-center">
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
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
      
      {/* View Feedback Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <Row>
                <Col md={6}>
                  <p><strong>Email:</strong> {selectedFeedback.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Date:</strong> {formatDate(selectedFeedback.created_at)}</p>
                  {selectedFeedback.replied_at && (
                    <p><strong>Replied At:</strong> {formatDate(selectedFeedback.replied_at)}</p>
                  )}
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={12}>
                  <p><strong>Message:</strong></p>
                  <div className="border p-3 bg-light">
                    {selectedFeedback.message}
                  </div>
                </Col>
              </Row>
              {selectedFeedback.reply && (
                <Row className="mt-3">
                  <Col md={12}>
                    <p><strong>Admin Reply:</strong></p>
                    <div className="border p-3 bg-info bg-opacity-10">
                      {selectedFeedback.reply}
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReplyClick}>
            Reply
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reply to Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>To</Form.Label>
                <Form.Control type="text" value={selectedFeedback.email} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Original Message</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={selectedFeedback.message} 
                  readOnly 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Your Reply</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={5} 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                />
              </Form.Group>
              {replyError && <Alert variant="danger">{replyError}</Alert>}
              {replySuccess && <Alert variant="success">Reply sent successfully!</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendReply} 
            disabled={sendingReply}
          >
            {sendingReply ? 'Sending...' : 'Send Reply'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* DELETE CONFIRMATION MODAL */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{deleteType === 'bulk' ? 'Delete Multiple Feedback' : 'Delete Feedback'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteSuccess ? (
            <Alert variant="success">
              {deleteType === 'bulk' 
                ? `Successfully deleted ${selectedIds.length} feedback entries.` 
                : 'Feedback deleted successfully.'}
            </Alert>
          ) : (
            <>
              {deleteError && <Alert variant="danger">{deleteError}</Alert>}
              <p>
                {deleteType === 'bulk' 
                  ? `Are you sure you want to delete ${selectedIds.length} selected feedback ${selectedIds.length > 1 ? 'entries' : 'entry'}? This action cannot be undone.`
                  : `Are you sure you want to delete the feedback from "${feedbackToDelete?.email}"? This action cannot be undone.`}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {deleteSuccess ? (
            <Button variant="primary" onClick={handleCloseDeleteModal}>
              OK
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={deleting}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={executeDelete} 
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Feedbackget;