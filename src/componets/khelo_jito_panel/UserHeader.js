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
            setUserDetails({
              full_name: profileResponse.data.data.student_profile.full_name || "",
              profile_photo: profileResponse.data.data.student_profile.profile_photo || null,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setWalletAmount(0);
        }
      }
    };

    fetchData();
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

    try {
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
    }
  };

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (userDetails.profile_photo) {
      return `https://brainrock.in/brainrock/backend${userDetails.profile_photo}`;
    }
    // Fallback to a default avatar
    return `https://ui-avatars.com/api/?name=ADMIN&background=0d6efd&color=fff&size=40`;
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

          <Col className="d-flex align-items-center justify-content-end">
            <div className="d-flex align-items-center me-3">
              <div 
                className="wallet-info d-flex align-items-center bg-light px-3 py-2 rounded-pill"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <span className="wallet-label me-2 text-muted">Wallet Balance:</span>
                <span className="wallet-amount fw-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                className="ms-2"
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
                      e.target.src = `https://ui-avatars.com/api/?name=ADMIN&background=0d6efd&color=fff&size=40`;
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
            variant="primary" 
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
            <strong>Important Note:</strong> Withdrawal requests may take 2-3 working days to process and reflect in your bank account.
          </div>
          
          <Form.Group controlId="withdrawAmount">
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
            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
          >
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}

export default UserHeader;