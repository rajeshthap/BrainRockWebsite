import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Dropdown,
  Image,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaBars,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { FaUser } from "react-icons/fa6";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const MIN_WITHDRAWAL = 9;
const MIN_BALANCE = 8;
const STORAGE_KEY = 'BR_USER_HEADER_DATA';

// Helper to safely get/set localStorage for user header data
const getStoredHeaderData = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (e) {
    console.error("Error reading header data from localStorage:", e);
  }
  return null;
};

const setStoredHeaderData = (headerData) => {
  try {
    if (typeof window !== "undefined") {
      if (headerData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(headerData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error("Error saving header data to localStorage:", e);
  }
};

function UserHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for user details
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_photo: null,
  });

  // State for wallet amount, cashback, and total
  const [walletAmount, setWalletAmount] = useState(0);
  const [cashback, setCashback] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // State for withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  // State for payment details
  const [paymentDetails, setPaymentDetails] = useState({
    upi_id: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: ""
  });
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank'); // 'upi' or 'bank'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [hasUpiDetails, setHasUpiDetails] = useState(false);
  const [isPaymentDetailsEditable, setIsPaymentDetailsEditable] = useState(false);

  // State for add wallet modal
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Debug log for withdrawal button state
  useEffect(() => {
    const isDisabled = !withdrawAmount || parseFloat(withdrawAmount) <= 0;
    const maxAllowed = totalAmount - MIN_BALANCE;
    const exceedsMax = parseFloat(withdrawAmount) > maxAllowed;
    
    console.log("Withdrawal button state:", {
      withdrawAmount,
      totalAmount,
      walletAmount,
      cashback,
      MIN_BALANCE,
      maxAllowed,
      isDisabled,
      exceedsMax,
      condition1: !withdrawAmount,
      condition2: parseFloat(withdrawAmount) <= 0
    });
  }, [withdrawAmount, totalAmount, walletAmount, cashback]);

  // Load stored header data immediately on mount
  useEffect(() => {
    const storedData = getStoredHeaderData();
    if (storedData) {
      setUserDetails(storedData.userDetails || { full_name: "", profile_photo: null });
      setWalletAmount(storedData.walletAmount || 0);
      setCashback(storedData.cashback || 0);
      setTotalAmount(storedData.totalAmount || 0);
    }
  }, []);

  // Fetch wallet amount and user details
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.unique_id) {
        try {
          // Fetch wallet amount and cashback
          const walletResponse = await axios.get(
            `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (walletResponse.data.status) {
            const cashbackAmount = walletResponse.data.cashback || 0;
            const walletBalance = walletResponse.data.wallet_balance || 0;
            const total = cashbackAmount + walletBalance;
            
            setCashback(cashbackAmount);
            setWalletAmount(walletBalance);
            setTotalAmount(total);
          }

          // Fetch user profile details
          const profileResponse = await axios.get(
            `${API_BASE_URL}/test-winners/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );

          if (profileResponse.data.status && profileResponse.data.data.student_profile) {
            const newUserDetails = {
              full_name: profileResponse.data.data.student_profile.full_name || "",
              profile_photo: profileResponse.data.data.student_profile.profile_photo || null,
            };
            setUserDetails(newUserDetails);
            
            // Check if payment details exist
            if (profileResponse.data.data.winner_details) {
              const winnerDetails = profileResponse.data.data.winner_details;
              setPaymentDetails({
                upi_id: winnerDetails.upi_id || "",
                account_holder_name: winnerDetails.account_holder_name || "",
                account_number: winnerDetails.account_number || "",
                ifsc_code: winnerDetails.ifsc_code || ""
              });
              setHasUpiDetails(!!winnerDetails.upi_id);
              setHasBankDetails(!!(winnerDetails.account_holder_name && winnerDetails.account_number && winnerDetails.ifsc_code));
              setIsPaymentDetailsEditable(false);
              // Default to UPI if available, otherwise bank
              if (winnerDetails.upi_id) {
                setWithdrawalMethod('upi');
              }
            }
            
            // Store all header data in localStorage for persistence
            setStoredHeaderData({
              userDetails: newUserDetails,
              walletAmount: walletResponse.data.status ? (walletResponse.data.wallet_balance || 0) : 0,
              cashback: walletResponse.data.status ? (walletResponse.data.cashback || 0) : 0,
              totalAmount: walletResponse.data.status ? ((walletResponse.data.cashback || 0) + (walletResponse.data.wallet_balance || 0)) : 0,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setWalletAmount(0);
        }
      }
    };

    // Check if payment was completed and refresh data
    const checkPaymentCompletion = () => {
      const paymentCompleted = localStorage.getItem("payment_completed");
      if (paymentCompleted) {
        // Refresh wallet amount
        fetchData();
        // Remove the flag
        localStorage.removeItem("payment_completed");
      }
    };

    fetchData();

    // Set up interval to check for payment completion
    const paymentCheckInterval = setInterval(checkPaymentCompletion, 3000);

    return () => clearInterval(paymentCheckInterval);
  }, [user]);

  // Get user display name
  const getDisplayName = () => {
    return userDetails.full_name || "User";
  };

  // Handle add wallet
  const handleAddWallet = async () => {
    setAddError("");
    setAddSuccess("");

    const amount = parseFloat(addAmount);

    // Validation
    if (!amount || amount <= 0) {
      setAddError("Please enter a valid amount");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-wallet/`,
        {
          user_id: user.unique_id,
          amount: amount,
        },
        { withCredentials: true }
      );

      if (response.data.status && response.data.payment_data && response.data.payment_data.redirectUrl) {
        // Save order_id to localStorage for payment tracking
        if (response.data.order_id) {
          localStorage.setItem("wallet_payment_order_id", response.data.order_id);
        }
        // Open payment gateway URL in new tab
        window.open(response.data.payment_data.redirectUrl, '_blank');
      } else {
        setAddError(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error adding wallet amount:", error);
      setAddError("Failed to add amount to wallet. Please try again.");
    }
  };

  // Handle payment details input change
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit payment details to API
  const submitPaymentDetails = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/test-winners/`,
        {
          user_id: user.unique_id,
          upi_id: paymentDetails.upi_id,
          account_holder_name: paymentDetails.account_holder_name,
          account_number: paymentDetails.account_number,
          ifsc_code: paymentDetails.ifsc_code
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Payment details submission response:", response);
      return response.data && response.data.status;
    } catch (error) {
      console.error("Error submitting payment details:", error);
      return false;
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    setWithdrawError("");
    setWithdrawSuccess("");

    const amount = parseFloat(withdrawAmount);

    // Validation
    if (!amount || amount <= 0) {
      setWithdrawError("Please enter a valid amount");
      return;
    }

    if (totalAmount - amount < MIN_BALANCE) {
      setWithdrawError(`You must keep at least ₹${MIN_BALANCE} in your wallet`);
      return;
    }

    // Validate payment details based on selected method
    if (withdrawalMethod === 'upi') {
      if (!paymentDetails.upi_id) {
        setWithdrawError("Please enter your UPI ID");
        return;
      }
    } else {
      if (!paymentDetails.account_holder_name || !paymentDetails.account_number || !paymentDetails.ifsc_code) {
        setWithdrawError("Please fill in all bank details");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Only submit payment details if:
      // 1. No payment details exist yet, OR
      // 2. User is editing existing payment details
      const needsSubmission = withdrawalMethod === 'upi' ? (!hasUpiDetails || isPaymentDetailsEditable) : (!hasBankDetails || isPaymentDetailsEditable);
      if (needsSubmission) {
        console.log("Submitting payment details first for user:", user.unique_id);

        const paymentDetailsSuccess = await submitPaymentDetails();

        if (!paymentDetailsSuccess) {
          setWithdrawError("Failed to save payment details. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Update local state
        if (withdrawalMethod === 'upi') {
          setHasUpiDetails(true);
        } else {
          setHasBankDetails(true);
        }
        setIsPaymentDetailsEditable(false);
      }

      console.log("Submitting withdrawal request for user:", user.unique_id, "Amount:", amount);
      
      const response = await axios.post(
        `${API_BASE_URL}/wallet-withdraw/`,
        {
          user_id: user.unique_id,
          withdraw_amount: amount,
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Withdrawal response:", response);

      if (response.data && response.data.status) {
        setWithdrawSuccess("Withdrawal request submitted successfully!");
        setWithdrawAmount("");
        
        // Fetch updated wallet amount and cashback
        try {
          const walletResponse = await axios.get(
            `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (walletResponse.data.status) {
            const cashbackAmount = walletResponse.data.cashback || 0;
            const walletBalance = walletResponse.data.wallet_balance || 0;
            const total = cashbackAmount + walletBalance;
            
            setCashback(cashbackAmount);
            setWalletAmount(walletBalance);
            setTotalAmount(total);
          }
        } catch (fetchError) {
          console.error("Error fetching updated wallet data:", fetchError);
        }
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowWithdrawModal(false);
          setWithdrawSuccess("");
          setWithdrawAmount("");
          setPaymentDetails({
            upi_id: "",
            account_holder_name: "",
            account_number: "",
            ifsc_code: ""
          });
        }, 2000);
      } else {
        const errorMessage = response.data?.message || "Failed to submit withdrawal request";
        console.error("Withdrawal failed with message:", errorMessage);
        setWithdrawError(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      let errorMessage = "Failed to submit withdrawal request. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        console.error("No response received");
        errorMessage = "No response from server. Please check your internet connection.";
      } else {
        // Error in request setup
        console.error("Request error:", error.message);
        errorMessage = error.message;
      }
      
      setWithdrawError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (userDetails.profile_photo) {
      return `https://brainrock.in/brainrock/backend${userDetails.profile_photo}`;
    }
    // Fallback to a default avatar with dynamic user name
    const displayName = getDisplayName();
    const avatarName = displayName || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=0d6efd&color=fff&size=40`;
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col className="d-flex align-items-center justify-content-end p-2">
            <div className="d-flex align-items-center me-3">
              <div 
                className="wallet-info d-flex align-items-center bg-light px-3 rounded-pill"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <span className="wallet-label me-2 text-muted">Wallet Balance:</span>
                <span className="wallet-amount fw-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                className="ms-2 profile-bg"
                onClick={() => setShowAddWalletModal(true)}
              >
                + Add
              </Button>
            </div>

            <div className="header-actions">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="user-profile-btn">
                  <Image
                    src={getUserPhotoUrl()}
                    roundedCircle
                    className="user-avatar"
                    onError={(e) => {
                      const displayName = getDisplayName();
                      const avatarName = displayName || "User";
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=0d6efd&color=fff&size=40`;
                    }}
                  />
                  <span className="user-name d-none d-md-inline">{getDisplayName()}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate('/UserProfile')}>
      <FaUser className="me-2" /> My Profile
    </Dropdown.Item>
                  <Dropdown.Item onClick={logout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Add Wallet Modal */}
      <Modal
        show={showAddWalletModal}
        onHide={() => setShowAddWalletModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add to Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>Current Balance:</strong> ₹{totalAmount.toFixed(2)}
          </p>
          
          <Form.Group controlId="addAmount">
            <Form.Label>Amount to Add (₹)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount to add"
              min="0.01"
              step="0.01"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
            />
          </Form.Group>

          {addError && (
            <div className="mt-3 text-danger">{addError}</div>
          )}

          {addSuccess && (
            <div className="mt-3 text-success">{addSuccess}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddWalletModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" className="profile-bg"
            onClick={handleAddWallet}
            disabled={!addAmount || parseFloat(addAmount) <= 0}
          >
            Add to Wallet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        show={showWithdrawModal}
        onHide={() => setShowWithdrawModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Withdraw Funds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>Deposit Amount:</strong> ₹{walletAmount.toFixed(2)} <br />
            <strong>Cashback:</strong> ₹{cashback.toFixed(2)} <br />
            <strong>Wallet Balance:</strong> ₹{totalAmount.toFixed(2)}
          </p>
          <p className="mb-3 text-muted">
            Minimum balance after withdrawal: ₹{MIN_BALANCE}
          </p>
          <div className="alert alert-warning mb-3" role="alert">
            <strong>Important Note:</strong> Withdrawal requests may take 2-3 working days to process and reflect in your account.
          </div>

          <Form.Group controlId="withdrawAmount" className="mb-3">
            <Form.Label>Withdrawal Amount (₹)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount to withdraw"
              min="0.01"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Withdrawal Method</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="UPI Transfer"
                name="withdrawalMethod"
                value="upi"
                checked={withdrawalMethod === 'upi'}
                onChange={(e) => setWithdrawalMethod(e.target.value)}
                inline
              />
              <Form.Check
                type="radio"
                label="Bank Transfer"
                name="withdrawalMethod"
                value="bank"
                checked={withdrawalMethod === 'bank'}
                onChange={(e) => setWithdrawalMethod(e.target.value)}
                inline
              />
            </div>
          </Form.Group>

          <div className="mt-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                {withdrawalMethod === 'upi' ? 'UPI Details' : 'Bank Details'}
              </h6>
              {((withdrawalMethod === 'upi' && hasUpiDetails) || (withdrawalMethod === 'bank' && hasBankDetails)) && !isPaymentDetailsEditable && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsPaymentDetailsEditable(true)}
                  className="p-0"
                >
                  Edit Details
                </Button>
              )}
            </div>
            {withdrawalMethod === 'upi' ? (
              <Form.Group controlId="upiId">
                <Form.Label>UPI ID</Form.Label>
                <Form.Control
                  type="text"
                  name="upi_id"
                  placeholder="Enter your UPI ID (e.g., user@upi)"
                  value={paymentDetails.upi_id}
                  onChange={handlePaymentDetailsChange}
                  disabled={hasUpiDetails && !isPaymentDetailsEditable}
                  required
                />
              </Form.Group>
            ) : (
              <>
                <Form.Group controlId="accountHolderName" className="mb-2">
                  <Form.Label>Account Holder Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="account_holder_name"
                    placeholder="Enter account holder name"
                    value={paymentDetails.account_holder_name}
                    onChange={handlePaymentDetailsChange}
                    disabled={hasBankDetails && !isPaymentDetailsEditable}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="accountNumber" className="mb-2">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="account_number"
                    placeholder="Enter account number"
                    value={paymentDetails.account_number}
                    onChange={handlePaymentDetailsChange}
                    disabled={hasBankDetails && !isPaymentDetailsEditable}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="ifscCode">
                  <Form.Label>IFSC Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="ifsc_code"
                    placeholder="Enter IFSC code"
                    value={paymentDetails.ifsc_code}
                    onChange={handlePaymentDetailsChange}
                    disabled={hasBankDetails && !isPaymentDetailsEditable}
                    required
                  />
                </Form.Group>
              </>
            )}
          </div>

          {withdrawError && (
            <div className="mt-3 text-danger">{withdrawError}</div>
          )}

          {withdrawSuccess && (
            <div className="mt-3 text-success">{withdrawSuccess}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}

export default UserHeader;