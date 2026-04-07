import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Badge, Button, Pagination, Alert, Modal, Form, Nav, NavDropdown } from "react-bootstrap";
import { AiFillEdit } from "react-icons/ai";
import { AiOutlineUser } from 'react-icons/ai';
import { QRCodeCanvas } from 'qrcode.react';
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import "../../../assets/css/attendance.css";

// Define base URLs for your APIs
const REFUND_API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/refund-request/';
const INITIATE_REFUND_API_URL = 'https://brainrock.in/brainrock/backend/api/initiate-refund/';
const WALLET_WITHDRAW_API_URL = 'https://brainrock.in/brainrock/backend/api/wallet-withdraw/';

const ManagePaymentsRefunds = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('refunds');
  
  // Refund data state
  const [refunds, setRefunds] = useState([]);
  // Wallet withdrawal data state
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showWithdrawalViewModal, setShowWithdrawalViewModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingItem, setRefundingItem] = useState(null);
  
  // Selected refunds for bulk actions
  const [selectedRefunds, setSelectedRefunds] = useState([]);
  
  // UPI payment states for wallet withdrawals
  const [upiProcessingWithdrawalId, setUpiProcessingWithdrawalId] = useState(null);
  const [upiLoading, setUpiLoading] = useState(false);
  const [showUpiErrorModal, setShowUpiErrorModal] = useState(false);
  const [upiErrorMessage, setUpiErrorMessage] = useState('');
  const [upiQrCode, setUpiQrCode] = useState(null);
  
  // Payment method selection
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [pendingWithdrawalForPayment, setPendingWithdrawalForPayment] = useState(null);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [selectedWithdrawalForQr, setSelectedWithdrawalForQr] = useState(null);

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

  // Fetch refund data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch refunds
        const refundsResponse = await fetch(REFUND_API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!refundsResponse.ok) {
          throw new Error('Failed to fetch refund data');
        }
        
        const refundsData = await refundsResponse.json();
        if (refundsData.success && Array.isArray(refundsData.data)) {
          setRefunds(refundsData.data);
        } else {
          throw new Error(refundsData.message || 'Failed to fetch refund data');
        }
        
        // Fetch wallet withdrawals
        try {
          const withdrawalsResponse = await fetch(WALLET_WITHDRAW_API_URL, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (!withdrawalsResponse.ok) {
            throw new Error(`HTTP error! status: ${withdrawalsResponse.status}`);
          }
          
          const withdrawalsData = await withdrawalsResponse.json();
          console.log('Wallet withdrawals API response:', withdrawalsData);
          
          if (withdrawalsData.status && Array.isArray(withdrawalsData.data)) {
            setWithdrawals(withdrawalsData.data);
          } else {
            console.error('Invalid wallet withdrawals data format:', withdrawalsData);
            setWithdrawals([]);
          }
        } catch (withdrawalsErr) {
          console.error('Error fetching wallet withdrawals:', withdrawalsErr);
          setWithdrawals([]);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter refunds based on search term and status
  const filteredRefunds = refunds.filter((refund) => {
    const lowerSearch = searchTerm.toLowerCase();
    
    const matchesSearch = (
      refund.full_name?.toLowerCase().includes(lowerSearch) ||
      refund.phone?.toLowerCase().includes(lowerSearch) ||
      refund.transaction_id?.toLowerCase().includes(lowerSearch) ||
      refund.request_id?.toLowerCase().includes(lowerSearch) ||
      refund.applicant_id?.toLowerCase().includes(lowerSearch) ||
      refund.amount?.toString().includes(lowerSearch) ||
      refund.course_id?.toLowerCase().includes(lowerSearch)
    );
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Filter wallet withdrawals based on search term and status
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const lowerSearch = searchTerm.toLowerCase();
    
    const matchesSearch = (
      withdrawal.withdraw_id?.toLowerCase().includes(lowerSearch) ||
      withdrawal.user_id?.toLowerCase().includes(lowerSearch) ||
      withdrawal.account_holder_name?.toLowerCase().includes(lowerSearch) ||
      withdrawal.account_number?.toString().includes(lowerSearch) ||
      withdrawal.ifsc_code?.toLowerCase().includes(lowerSearch) ||
      withdrawal.upi_id?.toLowerCase().includes(lowerSearch) ||
      withdrawal.withdraw_amount?.toString().includes(lowerSearch)
    );
    
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Pagination calculations for refunds
  const indexOfLastRefund = currentPage * itemsPerPage;
  const indexOfFirstRefund = indexOfLastRefund - itemsPerPage;
  const currentRefunds = filteredRefunds.slice(indexOfFirstRefund, indexOfLastRefund);
  const totalRefundPages = Math.ceil(filteredRefunds.length / itemsPerPage);
  
  // Pagination calculations for withdrawals
  const indexOfLastWithdrawal = currentPage * itemsPerPage;
  const indexOfFirstWithdrawal = indexOfLastWithdrawal - itemsPerPage;
  const currentWithdrawals = filteredWithdrawals.slice(indexOfFirstWithdrawal, indexOfFirstWithdrawal + itemsPerPage);
  const totalWithdrawalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle view refund details
  const handleViewRefund = (refund) => {
    setSelectedRefund(refund);
    setShowViewModal(true);
  };
  
  // Handle view withdrawal details
  const handleViewWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawalViewModal(true);
  };
  
  // Handle refund selection
  const handleSelectRefund = (id) => {
    setSelectedRefunds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle select all refunds on current page
  const handleSelectAll = () => {
    if (selectedRefunds.length === currentRefunds.length) {
      setSelectedRefunds([]);
    } else {
      setSelectedRefunds(currentRefunds.map(refund => refund.id));
    }
  };
  
  // Handle initiate refund
  const handleInitiateRefund = async (applicantId) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = { applicant_id: applicantId };
      
      const response = await fetch(INITIATE_REFUND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Failed to process refund: ${response.status} - ${responseText}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response format from server');
      }
      
      if (data.success) {
        setSuccessMessage(`Refund initiated successfully for ${applicantId}`);
        setShowRefundModal(false);
        
        // Update the refund status in the list
        setRefunds(prev => 
          prev.map(refund => 
            refund.id === refundingItem.id 
              ? { ...refund, status: 'processing' } 
              : refund
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to process refund');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Open refund confirmation modal
  const openRefundModal = (refund) => {
    setRefundingItem(refund);
    setShowRefundModal(true);
  };
  
  // Close refund confirmation modal
  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundingItem(null);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'processing':
        return 'info';
      case 'rejected':
      case 'failed':
        return 'danger';
      case 'pending':
      default:
        return 'warning';
    }
  };

  // Validate UPI payment data
  const validateUpiData = (withdrawal) => {
    const errors = [];
    
    if (!withdrawal.upi_id || withdrawal.upi_id.trim() === '') {
      errors.push('UPI ID is missing');
    }
    
    if (!withdrawal.withdraw_amount || withdrawal.withdraw_amount <= 0) {
      errors.push('Invalid withdrawal amount');
    }
    
    if (!withdrawal.account_holder_name || withdrawal.account_holder_name.trim() === '') {
      errors.push('Account holder name is missing');
    }
    
    if (!withdrawal.withdraw_id) {
      errors.push('Withdrawal ID is missing (transaction reference)');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Build UPI deep link
  const buildUpiDeepLink = (withdrawal) => {
    const {
      upi_id,
      withdraw_amount,
      account_holder_name,
      withdraw_id
    } = withdrawal;
    
    // Format merchant name (remove special characters and limit length)
    const merchantName = account_holder_name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .substring(0, 60)
      .trim();
    
    // Build the UPI URL
    const upiUrl = new URL('upi://pay');
    upiUrl.searchParams.append('pa', upi_id); // Payee address (UPI ID)
    upiUrl.searchParams.append('pn', merchantName); // Payee name
    upiUrl.searchParams.append('am', withdraw_amount.toString()); // Amount
    upiUrl.searchParams.append('tr', `WD${withdraw_id}`); // Transaction reference
    upiUrl.searchParams.append('tn', 'Wallet Withdrawal Payment'); // Transaction note
    
    return upiUrl.toString();
  };

  // Handle UPI payment process for wallet withdrawal
  const handleUpiPaymentProcess = async (withdrawal) => {
    try {
      console.log('Starting UPI payment process for withdrawal:', withdrawal);
      setUpiLoading(true);
      setShowUpiErrorModal(false);
      setUpiErrorMessage('');
      setUpiQrCode(null);
      setUpiProcessingWithdrawalId(withdrawal.withdraw_id);
      
      // Validate withdrawal data
      const validation = validateUpiData(withdrawal);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Build UPI deep link
      const upiDeepLink = buildUpiDeepLink(withdrawal);
      console.log('Generated UPI Deep Link:', upiDeepLink);
      
      // Attempt to open UPI app via deep link
      // Set a timeout to handle case where app doesn't open
      const upiAppTimeoutId = setTimeout(() => {
        console.log('UPI app did not open, showing fallback');
        // If app didn't open, show fallback message
        setUpiErrorMessage(
          'UPI app could not be opened. Please ensure you have a UPI app installed (Google Pay, PhonePe, Paytm, etc.).\n\n' +
          `Withdrawal Details:\n` +
          `Amount: ₹${withdrawal.withdraw_amount}\n` +
          `UPI ID: ${withdrawal.upi_id}\n` +
          `Account Holder: ${withdrawal.account_holder_name}\n\n` +
          `If the UPI app did not open, please manually open your preferred UPI app and send the payment to the above UPI ID.`
        );
        setShowUpiErrorModal(true);
        setUpiLoading(false);
      }, 2000);
      
      console.log('Attempting to redirect to UPI app...');
      // Attempt to redirect to UPI app
      window.location.href = upiDeepLink;
      
      // Clear the timeout if navigation succeeded (page will unload)
      setTimeout(() => {
        clearTimeout(upiAppTimeoutId);
      }, 100);
      
    } catch (err) {
      console.error('Error in UPI payment process:', err);
      setUpiLoading(false);
      setUpiErrorMessage(`Error processing UPI payment: ${err.message || 'Unknown error occurred'}`);
      setShowUpiErrorModal(true);
      setUpiProcessingWithdrawalId(null);
    }
  };

  // Open payment method selection modal
  const handleOpenPaymentMethod = (withdrawal) => {
    console.log('Opening payment method modal for withdrawal:', withdrawal);
    setPendingWithdrawalForPayment(withdrawal);
    setShowPaymentMethodModal(true);
  };

  // Generate QR code for wallet withdrawal
  const handleGenerateQr = (withdrawal) => {
    try {
      console.log('Generating QR code for withdrawal:', withdrawal);
      
      if (!withdrawal) {
        throw new Error('Withdrawal data is missing');
      }

      // Validate data
      const validation = validateUpiData(withdrawal);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Build UPI string for QR code
      const upiDeepLink = buildUpiDeepLink(withdrawal);
      console.log('Generated UPI Deep Link:', upiDeepLink);
      
      setSelectedWithdrawalForQr(withdrawal);
      setQrCodeData(upiDeepLink);
      setShowPaymentMethodModal(false);
      setShowQrCodeModal(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setUpiErrorMessage(`Error generating QR code: ${err.message || 'Unknown error occurred'}`);
      setShowUpiErrorModal(true);
    }
  };

  // Download QR code as image
  const handleDownloadQr = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `withdrawal-${selectedWithdrawalForQr?.withdraw_id}-qr.png`;
      link.click();
    }
  };

  // Close payment method modal
  const closePaymentMethodModal = () => {
    setShowPaymentMethodModal(false);
    setPendingWithdrawalForPayment(null);
  };

  // Close QR code modal
  const closeQrCodeModal = () => {
    setShowQrCodeModal(false);
    setQrCodeData(null);
    setSelectedWithdrawalForQr(null);
  };

  // Update withdrawal status to completed
  const handleUpdateWithdrawalStatus = async (withdrawalId) => {
    try {
      setUpiLoading(true);
      console.log('Updating withdrawal status for ID:', withdrawalId);
      
      if (!withdrawalId) {
        throw new Error('Withdrawal ID is missing');
      }

      const payload = {
        withdraw_id: withdrawalId,
        status: 'completed'
      };

      console.log('Sending update request with payload:', payload);

      const response = await fetch(WALLET_WITHDRAW_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const responseText = await response.text();
      console.log('Update response status:', response.status);
      console.log('Update response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to update withdrawal status: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Response might not be JSON
        data = { success: response.ok };
      }

      if (data.success || response.ok) {
        console.log('Withdrawal status updated successfully');
        setSuccessMessage(`Withdrawal payment marked as completed!`);
        
        // Update the withdrawal status in the list
        setWithdrawals(prev => 
          prev.map(withdrawal => 
            withdrawal.withdraw_id === withdrawalId 
              ? { ...withdrawal, status: 'completed' } 
              : withdrawal
          )
        );

        // Close all modals and reset state
        setShowQrCodeModal(false);
        setQrCodeData(null);
        setSelectedWithdrawalForQr(null);
        setShowUpiErrorModal(false);
        setUpiErrorMessage('');
        setUpiProcessingWithdrawalId(null);
        setUpiLoading(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to update withdrawal status');
      }
    } catch (err) {
      console.error('Error updating withdrawal status:', err);
      setUpiLoading(false);
      setUpiErrorMessage(`Error marking payment as complete: ${err.message || 'Unknown error occurred'}`);
      setShowUpiErrorModal(true);
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
              <h2 className="mb-0">Payments & Refunds</h2>
              <div className="d-flex gap-2">
                <div style={{ width: '200px' }}>
                  <Form.Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </div>
                <div style={{ width: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search by name, phone, txn id, amount, course id..."
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
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="success" className="mb-4">
                {successMessage}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </Alert>
            )}
            
            {/* Tab Navigation */}
            <Nav variant="tabs" defaultActiveKey="refunds" activeKey={activeTab} onSelect={(key) => setActiveTab(key)} className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="refunds">Refunds</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="withdrawals">Wallet Withdrawals</Nav.Link>
              </Nav.Item>
            </Nav>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading data...</p>
              </div>
            ) : (
              <>
                {/* Refunds Tab */}
                {activeTab === 'refunds' && (
                  <>
                    <Row className="mt-3">
                      <div className="col-md-12">
                        <table className="temp-rwd-table">
                          <tbody>
                            <tr>
                              <th>
                                <Form.Check 
                                  type="checkbox"
                                  checked={selectedRefunds.length === currentRefunds.length && currentRefunds.length > 0}
                                  onChange={handleSelectAll}
                                  label=""
                                />
                              </th>
                              <th>Request ID</th>
                              <th>Applicant ID</th>
                              <th>Full Name</th>
                              <th>Phone</th>
                              <th>Transaction ID</th>
                              <th>Amount</th>
                              <th>Course ID</th>
                              <th>Reason</th>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Action</th>
                            </tr>
                            
                            {currentRefunds.length > 0 ? (
                              currentRefunds.map((refund, index) => (
                                <tr key={refund.id}>
                                  <td data-th="Select">
                                    <Form.Check 
                                      type="checkbox"
                                      checked={selectedRefunds.includes(refund.id)}
                                      onChange={() => handleSelectRefund(refund.id)}
                                      label=""
                                    />
                                  </td>
                                  <td data-th="Request ID">
                                    <strong>{refund.request_id || 'N/A'}</strong>
                                  </td>
                                  <td data-th="Applicant ID">
                                    <strong className="text-success">{refund.applicant_id || refund.request_id || 'N/A'}</strong>
                                  </td>
                                  <td data-th="Full Name">{refund.full_name || 'N/A'}</td>
                                  <td data-th="Phone">{refund.phone || 'N/A'}</td>
                                  <td data-th="Transaction ID">{refund.transaction_id || 'N/A'}</td>
                                  <td data-th="Amount">{refund.amount ? `₹${refund.amount}` : 'N/A'}</td>
                                  <td data-th="Course ID">{refund.course_id || 'N/A'}</td>
                                  <td data-th="Reason">{refund.reason || 'N/A'}</td>
                                  <td data-th="Status">
                                    <span className={`badge bg-${getStatusVariant(refund.status)}`}>
                                      {refund.status || 'N/A'}
                                    </span>
                                  </td>
                                  <td data-th="Date">{formatDate(refund.created_at)}</td>
                                  <td data-th="Action">
                                    <div className="d-flex gap-2">
                                      <Button 
                                        variant="primary" 
                                        size="sm" 
                                        onClick={() => handleViewRefund(refund)}
                                      >
                                        View
                                      </Button>
                                      {refund.status?.toLowerCase() === 'pending' && (
                                        <Button 
                                          variant="success" 
                                          size="sm" 
                                          onClick={() => openRefundModal(refund)}
                                        >
                                          Process
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="12" className="text-center">
                                  No refund data available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', borderTop: '2px solid #0066cc' }}>
                              <td colSpan="8" className="text-end pe-3" style={{ color: '#333' }}>
                                <strong>Refund Summary:</strong>
                              </td>
                              <td colSpan="4" style={{ paddingLeft: '20px' }}>
                                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                  <div style={{ color: '#e67e22', fontWeight: '600' }}>
                                    ⏳ Pending: {filteredRefunds.filter(r => r.status?.toLowerCase() === 'pending').length}
                                  </div>
                                  <div style={{ color: '#3498db', fontWeight: '600' }}>
                                    ⏸ Processing: {filteredRefunds.filter(r => r.status?.toLowerCase() === 'processing').length}
                                  </div>
                                  <div style={{ color: '#27ae60', fontWeight: '600' }}>
                                    ✓ Approved: {filteredRefunds.filter(r => r.status?.toLowerCase() === 'approved').length}
                                  </div>
                                  <div style={{ color: '#e74c3c', fontWeight: '600' }}>
                                    ✗ Rejected: {filteredRefunds.filter(r => r.status?.toLowerCase() === 'rejected').length}
                                  </div>
                                  <div style={{ marginTop: '8px', borderTop: '1px solid #bdc3c7', paddingTop: '8px', color: '#0066cc', fontWeight: '700' }}>
                                    Total Refund Requests: {filteredRefunds.length}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </Row>
                    
                    {/* Pagination for Refunds */}
                    {totalRefundPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                          <Pagination.Prev 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                          />
                          {[...Array(totalRefundPages).keys()].map(page => (
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
                            disabled={currentPage === totalRefundPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
                
                {/* Wallet Withdrawals Tab */}
                {activeTab === 'withdrawals' && (
                  <>
                    <Row className="mt-3">
                      <div className="col-md-12">
                        <table className="temp-rwd-table">
                          <tbody>
                             <tr>
                               <th>Withdraw ID</th>
                               <th>User ID</th>
                               <th>Account Holder Name</th>

                               <th>Account Number</th>
                               <th>IFSC Code</th>
                               <th>UPI ID</th>
                               <th>Withdraw Amount</th>
                               <th>Status</th>
                               <th>Requested At</th>
                               {/* <th>Processed At</th> */}
                               <th>Action</th>
                             </tr>
                            
                            {currentWithdrawals.length > 0 ? (
                              currentWithdrawals.map((withdrawal, index) => (
                                <tr key={withdrawal.withdraw_id}>
                                  <td data-th="Withdraw ID">
                                    <strong>{withdrawal.withdraw_id || 'N/A'}</strong>
                                  </td>
                                   <td data-th="User ID">{withdrawal.user_id || 'N/A'}</td>
                                   <td data-th="Account Holder Name">{withdrawal.account_holder_name || 'N/A'}</td>
                                   {/* <td data-th="Phone">{withdrawal.phone || 'N/A'}</td> */}
                                   <td data-th="Account Number">{withdrawal.account_number || 'N/A'}</td>
                                   <td data-th="IFSC Code">{withdrawal.ifsc_code || 'N/A'}</td>
                                   <td data-th="UPI ID">{withdrawal.upi_id || 'N/A'}</td>
                                   <td data-th="Withdraw Amount">{withdrawal.withdraw_amount ? `₹${withdrawal.withdraw_amount}` : 'N/A'}</td>
                                  <td data-th="Status">
                                    <span className={`badge bg-${getStatusVariant(withdrawal.status)}`}>
                                      {withdrawal.status || 'N/A'}
                                    </span>
                                  </td>
                                  <td data-th="Requested At">{formatDate(withdrawal.requested_at)}</td>
                                  {/* <td data-th="Processed At">{withdrawal.processed_at ? formatDate(withdrawal.processed_at) : 'N/A'}</td> */}
                                   <td data-th="Action">
                                     <div className="d-flex gap-2">
                                       <Button 
                                         variant="primary" 
                                         size="sm" 
                                         onClick={() => handleViewWithdrawal(withdrawal)}
                                       >
                                         View
                                       </Button>
                                       {withdrawal.status?.toLowerCase() === 'pending' && (
                                         <Button 
                                           variant="success" 
                                           size="sm"
                                           onClick={() => handleOpenPaymentMethod(withdrawal)}
                                           disabled={upiLoading}
                                         >
                                           {upiLoading && upiProcessingWithdrawalId === withdrawal.withdraw_id ? 'Processing...' : 'Process'}
                                         </Button>
                                       )}
                                     </div>
                                   </td>
                                </tr>
                              ))
                             ) : (
                               <tr>
                                 <td colSpan="10" className="text-center">
                                   No wallet withdrawal data available.
                                 </td>
                               </tr>
                             )}
                          </tbody>
                           <tfoot>
                             <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', borderTop: '2px solid #0066cc' }}>
                               <td colSpan="8" className="text-end pe-3" style={{ color: '#333' }}>
                                 <strong>Withdrawal Summary:</strong>
                               </td>
                               <td colSpan="2" style={{ paddingLeft: '20px' }}>
                                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                  <div style={{ color: '#e67e22', fontWeight: '600' }}>
                                    ⏳ Pending: {filteredWithdrawals.filter(w => w.status?.toLowerCase() === 'pending').length}
                                  </div>
                                  <div style={{ color: '#3498db', fontWeight: '600' }}>
                                    ⏸ Processing: {filteredWithdrawals.filter(w => w.status?.toLowerCase() === 'processing').length}
                                  </div>
                                  <div style={{ color: '#27ae60', fontWeight: '600' }}>
                                    ✓ Approved: {filteredWithdrawals.filter(w => w.status?.toLowerCase() === 'approved').length}
                                  </div>
                                  <div style={{ color: '#e74c3c', fontWeight: '600' }}>
                                    ✗ Rejected: {filteredWithdrawals.filter(w => w.status?.toLowerCase() === 'rejected').length}
                                  </div>
                                  <div style={{ marginTop: '8px', borderTop: '1px solid #bdc3c7', paddingTop: '8px', color: '#0066cc', fontWeight: '700' }}>
                                    Total Withdrawals: {filteredWithdrawals.length}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </Row>
                    
                    {/* Pagination for Withdrawals */}
                    {totalWithdrawalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                          <Pagination.Prev 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                          />
                          {[...Array(totalWithdrawalPages).keys()].map(page => (
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
                            disabled={currentPage === totalWithdrawalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
      
      {/* Refund Confirmation Modal */}
      <Modal show={showRefundModal} onHide={closeRefundModal}>
        <Modal.Header closeButton>
          <Modal.Title>Process Refund</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           {refundingItem && (
            <div>
              <p><strong>Request ID:</strong> {refundingItem.request_id}</p>
              <p><strong>Applicant ID:</strong> <span className="text-success">{refundingItem.applicant_id || refundingItem.request_id}</span></p>
              <p><strong>Name:</strong> {refundingItem.full_name}</p>
              <p><strong>Amount:</strong> {refundingItem.amount ? `₹${refundingItem.amount}` : 'N/A'}</p>
              <p><strong>Course ID:</strong> {refundingItem.course_id || 'N/A'}</p>
              <p><strong>Transaction ID:</strong> {refundingItem.transaction_id}</p>
              <p><strong>Reason:</strong> {refundingItem.reason}</p>
              <Alert variant="warning">
                Are you sure you want to process this refund? This action will initiate the refund process.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRefundModal}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleInitiateRefund(refundingItem?.applicant_id || refundingItem?.request_id)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Process Refund'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Refund Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Refund Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRefund && (
            <div>
              <Row>
                <Col md={6} className="mb-3">
                  <p><strong>Request ID:</strong> <span className="text-primary">{selectedRefund.request_id}</span></p>
                  <p><strong>Applicant ID:</strong> <span className="text-success">{selectedRefund.applicant_id || selectedRefund.request_id}</span></p>
                  <p><strong>Full Name:</strong> {selectedRefund.full_name}</p>
                  <p><strong>Email:</strong> {selectedRefund.email}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <p><strong>Phone:</strong> {selectedRefund.phone}</p>
                  <p><strong>Amount:</strong> {selectedRefund.amount ? `₹${selectedRefund.amount}` : 'N/A'}</p>
                  <p><strong>Course ID:</strong> {selectedRefund.course_id || 'N/A'}</p>
                  <p><strong>Status:</strong>
                    <span className={`badge bg-${getStatusVariant(selectedRefund.status)} ms-2`}>
                      {selectedRefund.status}
                    </span>
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <p><strong>Transaction ID:</strong> {selectedRefund.transaction_id}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <p><strong>Request Date:</strong> {formatDate(selectedRefund.created_at)}</p>
                </Col>
              </Row>
              <Row>
                <Col md={12} className="mb-3">
                  <p><strong>Refund Reason:</strong></p>
                  <p className="bg-light p-3 rounded">{selectedRefund.reason}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedRefund && selectedRefund.status?.toLowerCase() === 'pending' && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowViewModal(false);
                openRefundModal(selectedRefund);
              }}
            >
              Process Refund
            </Button>
          )}
        </Modal.Footer>
       </Modal>

       {/* View Withdrawal Details Modal */}
       <Modal show={showWithdrawalViewModal} onHide={() => setShowWithdrawalViewModal(false)} size="lg">
         <Modal.Header closeButton>
           <Modal.Title>Wallet Withdrawal Details</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           {selectedWithdrawal && (
             <div>
               <Row>
                 <Col md={6} className="mb-3">
                   <p><strong>Withdraw ID:</strong> <span className="text-primary">{selectedWithdrawal.withdraw_id}</span></p>
                   <p><strong>User ID:</strong> <span className="text-success">{selectedWithdrawal.user_id}</span></p>
                   <p><strong>Account Holder Name:</strong> {selectedWithdrawal.account_holder_name}</p>
                 </Col>
                  <Col md={6} className="mb-3">
                    <p><strong>Account Number:</strong> {selectedWithdrawal.account_number}</p>
                    <p><strong>IFSC Code:</strong> {selectedWithdrawal.ifsc_code}</p>
                    <p><strong>UPI ID:</strong> {selectedWithdrawal.upi_id || 'N/A'}</p>
                    <p><strong>Withdraw Amount:</strong> {selectedWithdrawal.withdraw_amount ? `₹${selectedWithdrawal.withdraw_amount}` : 'N/A'}</p>
                    <p><strong>Status:</strong>
                      <span className={`badge bg-${getStatusVariant(selectedWithdrawal.status)} ms-2`}>
                        {selectedWithdrawal.status}
                      </span>
                    </p>
                  </Col>
               </Row>
               <Row>
                 <Col md={6} className="mb-3">
                   <p><strong>Requested At:</strong> {formatDate(selectedWithdrawal.requested_at)}</p>
                 </Col>
                 <Col md={6} className="mb-3">
                   <p><strong>Processed At:</strong> {selectedWithdrawal.processed_at ? formatDate(selectedWithdrawal.processed_at) : 'N/A'}</p>
                 </Col>
               </Row>
             </div>
           )}
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowWithdrawalViewModal(false)}>
             Close
           </Button>
         </Modal.Footer>
       </Modal>

       {/* UPI Payment Error/Fallback Modal */}
       <Modal show={showUpiErrorModal} onHide={() => setShowUpiErrorModal(false)} size="lg">
         <Modal.Header closeButton>
           <Modal.Title>UPI Payment - Attention Required</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <Alert variant="warning">
             <strong>Note:</strong> Please complete your withdrawal payment using your UPI app.
           </Alert>
           <div className="bg-light p-4 rounded mb-3">
             <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
               {upiErrorMessage}
             </p>
           </div>
           <div className="mt-3">
             <p className="text-muted small">
               If you were redirected to a UPI app, please complete the payment there. 
               If not, manually open your preferred UPI app (Google Pay, PhonePe, Paytm, etc.) 
               and send the payment to the UPI ID specified above.
             </p>
           </div>
         </Modal.Body>
         <Modal.Footer>
           <Button 
             variant="secondary" 
             onClick={() => {
               setShowUpiErrorModal(false);
               setUpiProcessingWithdrawalId(null);
             }}
           >
             Close
           </Button>
           <Button 
             variant="primary" 
             onClick={() => {
               if (upiProcessingWithdrawalId) {
                 handleUpdateWithdrawalStatus(upiProcessingWithdrawalId);
               } else {
                 setShowUpiErrorModal(false);
               }
             }}
             disabled={upiLoading}
           >
             {upiLoading ? '⟳ Completing...' : 'I\'ve Completed the Payment'}
           </Button>
         </Modal.Footer>
       </Modal>

       {/* Payment Method Selection Modal */}
       <Modal show={showPaymentMethodModal} onHide={closePaymentMethodModal} centered>
         <Modal.Header closeButton>
           <Modal.Title>Select Payment Method</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <div className="text-center mb-4">
             <p className="text-muted mb-2">Withdrawal ID: <strong>{pendingWithdrawalForPayment?.withdraw_id}</strong></p>
             <p className="text-muted mb-4">Amount: <strong className="text-success">₹{pendingWithdrawalForPayment?.withdraw_amount}</strong></p>
             <p>Choose your preferred payment method:</p>
           </div>
           <div className="d-flex flex-column gap-3">
             <Button 
               variant="info" 
               size="lg" 
               className="d-flex align-items-center justify-content-center"
               onClick={() => handleGenerateQr(pendingWithdrawalForPayment)}
               style={{ height: '70px' }}
             >
               <div className="text-center">
                 <div style={{ fontSize: '20px', marginBottom: '5px' }}>📱 Generate QR Code</div>
                 <div style={{ fontSize: '12px' }}>Scan with any UPI app</div>
               </div>
             </Button>
             <Button 
               variant="primary" 
               size="lg"
               className="d-flex align-items-center justify-content-center"
               onClick={() => {
                 handleUpiPaymentProcess(pendingWithdrawalForPayment);
                 closePaymentMethodModal();
               }}
               style={{ height: '70px' }}
             >
               <div className="text-center">
                 <div style={{ fontSize: '20px', marginBottom: '5px' }}>🚀 Open UPI App</div>
                 <div style={{ fontSize: '12px' }}>Direct payment via installed app</div>
               </div>
             </Button>
           </div>
         </Modal.Body>
       </Modal>

       {/* QR Code Display Modal */}
       <Modal show={showQrCodeModal} onHide={closeQrCodeModal} centered size="sm">
         <Modal.Header closeButton>
           <Modal.Title>Scan QR Code for Payment</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <div className="text-center">
             <p className="text-muted mb-3">
               Scan this QR code with your UPI app to complete the payment
             </p>
             
             {qrCodeData ? (
               <div className="d-flex justify-content-center mb-3">
                 <div className="p-3 bg-white rounded border" style={{ display: 'inline-block' }}>
                   <QRCodeCanvas 
                     value={qrCodeData} 
                     size={256}
                     level="H"
                     includeMargin={true}
                   />
                 </div>
               </div>
             ) : (
               <Alert variant="warning" className="mb-3">
                 QR Code generation failed. Please try again.
               </Alert>
             )}
             
             <div className="bg-light p-3 rounded mb-3">
               <p className="mb-2"><strong>Payment Details:</strong></p>
               <p className="mb-1">Amount: <strong>₹{selectedWithdrawalForQr?.withdraw_amount}</strong></p>
               <p className="mb-1">To: <strong>{selectedWithdrawalForQr?.upi_id}</strong></p>
               <p className="mb-0">Ref: <strong>WD{selectedWithdrawalForQr?.withdraw_id}</strong></p>
             </div>

             <Alert variant="info" className="small mb-0">
               <strong>Tip:</strong> If scanning doesn't work, open your UPI app and manually send payment to the UPI ID shown above.
             </Alert>
           </div>
         </Modal.Body>
         <Modal.Footer>
           <Button 
             variant="secondary" 
             onClick={closeQrCodeModal}
           >
             Close
           </Button>
           {qrCodeData && (
             <Button 
               variant="outline-primary" 
               onClick={handleDownloadQr}
             >
               📥 Download QR
             </Button>
           )}
           <Button 
             variant="success" 
             onClick={() => handleUpdateWithdrawalStatus(selectedWithdrawalForQr?.withdraw_id)}
             disabled={upiLoading}
           >
             {upiLoading ? '⟳ Completing...' : '✓ Payment Done'}
           </Button>
         </Modal.Footer>
       </Modal>
     </div>
   );
 };

 export default ManagePaymentsRefunds;
