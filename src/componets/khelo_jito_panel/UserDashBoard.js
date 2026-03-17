import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate, FaFileInvoice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import "../../assets/css/websitemanagement.css";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import Test from "../Play_and_Win/Test";
const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const TEST_AMOUNT = 1; // Fixed test amount

const UserDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [coursesData, setCoursesData] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [walletAmount, setWalletAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch wallet amount and check for won amount
  useEffect(() => {
    const fetchWalletAmount = async () => {
      if (user && user.unique_id) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (response.data.status) {
            setWalletAmount(response.data.cashback || 0);
          }
        } catch (error) {
          console.error("Error fetching wallet amount:", error);
          setWalletAmount(0);
        }
      }
    };

    // Check for winning amount in localStorage
    const winningAmount = localStorage.getItem("winningAmount");
    if (winningAmount) {
      // Show success popup
      alert(`Congratulations! You won ₹${parseFloat(winningAmount).toFixed(2)}! The amount has been added to your wallet.`);
      // Remove from localStorage
      localStorage.removeItem("winningAmount");
      // Fetch updated wallet amount
      fetchWalletAmount();
    } else {
      // Fetch initial wallet amount if no winning amount
      fetchWalletAmount();
    }
  }, [user]);

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

  const handleCardClick = (cardType) => {
    setSelectedCardType(cardType);
    setCurrentPage(1);
    setSearchTerm("");
  };

  // Open payment modal
  const handleKheloJeetoClick = () => {
    setShowPaymentModal(true);
    setPaymentMethod(null);
    setPaymentSuccess(false);
  };

  // Select payment method
  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  // Process wallet payment
  const handleWalletPayment = async () => {
    if (walletAmount < TEST_AMOUNT) {
      alert("Insufficient wallet balance");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/test-winner-cashback/`,
        {
          user_id: user.unique_id,
          cashback: walletAmount - TEST_AMOUNT
        },
        { withCredentials: true }
      );

      if (response.data.status) {
        setWalletAmount(response.data.cashback);
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  // Process online payment
  const handleOnlinePayment = async () => {
    try {
      // Send only user_id to register-test API for authenticated users
      const response = await axios.post(
        `${API_BASE_URL}/register-test/`,
        {
          user_id: user.unique_id
        }
      );

      if (response.data.status && response.data.payment_order) {
        // Save user ID to localStorage for Test component
        localStorage.setItem("test_user_id", response.data.user_id || user.unique_id);
        // Redirect to payment gateway URL
        window.location.href = response.data.payment_order.redirectUrl;
      }
    } catch (error) {
      console.error("Error processing online payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  // Start test
  const handleStartTest = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/start-test/`,
        { user_id: user.unique_id },
        { withCredentials: true }
      );

      if (response.data.status) {
        // Save user ID to localStorage for Test component
        localStorage.setItem("test_user_id", user.unique_id);
        // Navigate to test page
        navigate("/test");
      }
    } catch (error) {
      console.error("Error starting test:", error);
      alert("Failed to start test. Please try again.");
    }
  };
 






 


  

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <h1 className="page-title">User DashBoard</h1>
          <div className="br-box-container mt-4">
            <Row className="br-stats-row">
                <Col lg={4} md={6} sm={12} className="mb-3">
                              <div
                                className="br-stat-card card-blue"
                                onClick={handleKheloJeetoClick}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="br-stat-icon">
                                  <FaBook />
                                </div>
                                <div className="br-stat-details">
                                  <h5>Khelo Aur Jeeto</h5>
                                </div>
                              </div>
                            </Col>
      
            </Row>
          </div>

        
        </Container>
      </div>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Register for Test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!paymentSuccess ? (
            <>
              <h5>Select Payment Method</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                <Button
                  variant={paymentMethod === "wallet" ? "primary" : "light"}
                  onClick={() => handleSelectPaymentMethod("wallet")}
                  className="text-left"
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <span>Pay with Wallet</span>
                    <span className="fw-bold">₹{TEST_AMOUNT.toFixed(2)}</span>
                  </div>
                </Button>
                <Button
                  variant={paymentMethod === "online" ? "primary" : "light"}
                  onClick={() => handleSelectPaymentMethod("online")}
                  className="text-left"
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <span>Online Payment</span>
                    <span className="fw-bold">₹{TEST_AMOUNT.toFixed(2)}</span>
                  </div>
                </Button>
              </div>

              {paymentMethod === "wallet" && (
                <div className="border p-4 rounded bg-light">
                  <h6>Wallet Balance: ₹{walletAmount.toFixed(2)}</h6>
                  <p>Test Amount: ₹{TEST_AMOUNT.toFixed(2)}</p>
                  <p>Remaining Balance: ₹{(walletAmount - TEST_AMOUNT).toFixed(2)}</p>
                  <Button
                    variant="primary"
                    onClick={handleWalletPayment}
                    disabled={walletAmount < TEST_AMOUNT}
                  >
                    Pay with Wallet
                  </Button>
                </div>
              )}

              {paymentMethod === "online" && (
                <div className="border p-4 rounded bg-light">
                  <h6>Online Payment</h6>
                  <p>Test Amount: ₹{TEST_AMOUNT.toFixed(2)}</p>
                  <Button variant="primary" onClick={handleOnlinePayment}>
                    Proceed to Payment
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <h5>Payment Successful!</h5>
              <p>Your test registration is complete.</p>
              <Button variant="primary" onClick={handleStartTest} className="mt-3">
                Start Test
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!paymentSuccess && (
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDashBoard;
