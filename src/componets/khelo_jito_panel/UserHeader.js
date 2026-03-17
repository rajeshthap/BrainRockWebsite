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

  // State for wallet amount
  const [walletAmount, setWalletAmount] = useState(0);

  // State for withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  // Fetch wallet amount and user details
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.unique_id) {
        try {
          // Fetch wallet amount
          const walletResponse = await axios.get(
            `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (walletResponse.data.status) {
            setWalletAmount(walletResponse.data.cashback || 0);
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

    if (walletAmount - amount < MIN_BALANCE) {
      setWithdrawError(`You must keep at least ₹${MIN_BALANCE} in your wallet`);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet-withdraw/`,
        {
          user_id: user.unique_id,
          withdraw_amount: amount,
        },
        { withCredentials: true }
      );

      if (response.data.status) {
        setWithdrawSuccess("Withdrawal request submitted successfully!");
        setWithdrawAmount("");
        // Fetch updated wallet amount
        const walletResponse = await axios.get(
          `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
          { withCredentials: true }
        );
        
        if (walletResponse.data.status) {
          setWalletAmount(walletResponse.data.cashback || 0);
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowWithdrawModal(false);
          setWithdrawSuccess("");
        }, 2000);
      } else {
        setWithdrawError(response.data.message || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      setWithdrawError("Failed to submit withdrawal request. Please try again.");
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
            <div 
              className="wallet-info d-flex align-items-center bg-light px-3 py-2 rounded-pill me-3"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowWithdrawModal(true)}
            >
              <span className="wallet-label me-2 text-muted">Wallet:</span>
              <span className="wallet-amount fw-bold text-primary">₹{walletAmount.toFixed(2)}</span>
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
            <strong>Current Balance:</strong> ₹{walletAmount.toFixed(2)}
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
              max={walletAmount - MIN_BALANCE}
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
            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || (walletAmount - parseFloat(withdrawAmount)) < MIN_BALANCE}
          >
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}

export default UserHeader;