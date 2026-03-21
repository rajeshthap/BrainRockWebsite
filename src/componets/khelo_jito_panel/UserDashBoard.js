import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Modal, Pagination, Alert, Button, Form } from "react-bootstrap";
import { FaUsers, FaBook, FaUserGraduate, FaFileInvoice, FaCertificate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import "../../assets/css/userdashboardui.css";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import Test from "../Play_and_Win/Test";
const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';
const TEST_AMOUNT = 8; // Fixed test amount

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
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch wallet amount and certificates count
  useEffect(() => {
    const fetchWalletAmount = async () => {
      if (user && user.unique_id) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (response.data.status) {
            const cashbackAmount = response.data.cashback || 0;
            const walletBalance = response.data.wallet_balance || 0;
            const total = cashbackAmount + walletBalance;
            setWalletAmount(total);
          }
        } catch (error) {
          console.error("Error fetching wallet amount:", error);
          setWalletAmount(0);
        }
      }
    };

    const fetchCertificatesCount = async () => {
      if (user && user.unique_id) {
        try {
          console.log("Fetching certificates count for user:", user.unique_id);
          const response = await axios.get(
            `${API_BASE_URL}/test-winners/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          console.log("Test winners API response:", response.data);
          
          // Check if response has expected structure
          if (response.data.status && response.data.data) {
            console.log("Response data structure:", Object.keys(response.data.data));
            
            if (response.data.data.attempts) {
              console.log("All attempts:", response.data.data.attempts);
              
              // Check all test_status values present
              const allStatuses = [...new Set(response.data.data.attempts.map(attempt => attempt.test_status))];
              console.log("All unique quiz statuses:", allStatuses);
              
              // Check which attempts have certificates
              const attemptsWithCertificates = response.data.data.attempts.filter(
                attempt => attempt.certificate
              );
              console.log("Attempts with certificates:", attemptsWithCertificates);
              
               // Count only passed attempts with certificates
              const attemptsWithCertificate = response.data.data.attempts.filter(
                attempt => attempt.test_status === "passed" && attempt.certificate
              );
              console.log("Attempts with certificate count:", attemptsWithCertificate.length);
              setCertificatesCount(attemptsWithCertificate.length);
            } else {
              console.log("No attempts data found in response");
              setCertificatesCount(0);
            }
          } else {
            console.log("Response does not have expected structure");
            setCertificatesCount(0);
          }
        } catch (error) {
          console.error("Error fetching certificates count:", error);
          setCertificatesCount(0);
        }
      } else {
        console.log("User or user.unique_id not available");
        setCertificatesCount(0);
      }
    };

    const checkWinningAmount = () => {
      // Check for winning amount in localStorage
      const winningAmount = localStorage.getItem("winningAmount");
      if (winningAmount) {
        // Show success popup
        alert(`Congratulations! You won ₹${parseFloat(winningAmount).toFixed(2)}! The amount has been added to your wallet.`);
        // Remove from localStorage
        localStorage.removeItem("winningAmount");
      }
    };

    // Check if payment was completed and refresh data
    const checkPaymentCompletion = () => {
      const paymentCompleted = localStorage.getItem("payment_completed");
      if (paymentCompleted) {
        // Refresh wallet amount
        fetchWalletAmount();
        // Remove the flag
        localStorage.removeItem("payment_completed");
      }
    };

    // First fetch wallet amount and certificates count, then check for winning amount
    Promise.all([
      fetchWalletAmount(),
      fetchCertificatesCount()
    ]).then(() => {
      checkWinningAmount();
    });

    // Set up interval to check for payment completion
    const paymentCheckInterval = setInterval(checkPaymentCompletion, 3000);

    return () => clearInterval(paymentCheckInterval);
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

   // Open payment modal directly
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
          cashback: TEST_AMOUNT // Send only the entry fee amount
        },
        { withCredentials: true }
      );

      if (response.data.status) {
        // Calculate the remaining balance locally
        setWalletAmount(walletAmount - TEST_AMOUNT);
        setPaymentSuccess(true);
        // Save payment method and source to localStorage for Test component
        localStorage.setItem("test_payment_method", "wallet");
        localStorage.setItem("test_source", "userdashboard");
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
        },
        { withCredentials: true }
      );

      if (response.data.status && response.data.payment_order) {
        // Save user ID, payment method, and source to localStorage for Test component
        localStorage.setItem("test_user_id", user.unique_id);
        localStorage.setItem("test_payment_method", "online");
        localStorage.setItem("test_source", "userdashboard");
        
        // Check if payment gateway provides a success callback URL
        // If not, we'll handle it by checking for payment success in the Test component
        if (response.data.payment_order.redirectUrl) {
           window.open(response.data.payment_order.redirectUrl, '_blank');
         } else {
          // If no redirect URL, consider payment successful and show start test button
          setPaymentSuccess(true);
        }
      }
    } catch (error) {
      console.error("Error processing online payment:", error);
      alert("Failed to process payment. Please try again.");
    }
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

  // Show instructions modal before starting test
  const handleStartTest = () => {
    setShowInstructionsModal(true);
  };

  // Start test after accepting instructions
  const handleAcceptInstructions = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/start-test/`,
        { user_id: user.unique_id },
        { withCredentials: true }
      );

      if (response.data.status) {
        // Save user ID to localStorage for Test component (payment method and source already saved)
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
          <h1 className="page-title">Khelo Aur Jeeto </h1>
          
           <div className="br-box-container mt-4">
             <div className="row">
               {/* Khelo Aur Jeeto Card */}
               <div className="col-md-4 mb-4">
                 <div
                   className="br-stat-card card-gradient-primary"
                   onClick={handleKheloJeetoClick}
                   style={{ cursor: "pointer" }}
                 >
                   <div className="br-stat-icon">
                     <FaBook />
                   </div>
                   <div className="br-stat-details">
                     <h5>Khelo Aur Jeeto</h5>
                     <p className="card-description">Start Quiz</p>
                     <button className="play-button">Play Now</button>
                   </div>
                 </div>
               </div>

               {/* Certificates Card */}
               <div className="col-md-4 mb-4">
                 <div
                   className="br-stat-card card-gradient-success"
                   style={{ cursor: "pointer" }}
                   onClick={() => navigate("/TestWinner")}
                 >
                   <div className="br-stat-icon">
                     <FaCertificate />
                   </div>
                   <div className="br-stat-details">
                     <h5>Passed Certificates</h5>
                     <h2>{certificatesCount}</h2>
                     <p className="card-description">Earned Certificates</p>
                   </div>
                 </div>
               </div>

               {/* Wallet Balance Card */}
               <div className="col-md-4 mb-4">
                 <div className="br-stat-card card-gradient-warning">
                   <div className="br-stat-icon">
                     <FaFileInvoice />
                   </div>
                   <div className="br-stat-details">
                     <h5>Wallet Balance</h5>
                     <h2>₹{walletAmount.toFixed(2)}</h2>
                     <p className="card-description">Available to Play</p>
                     <button 
                       className="add-money-button"
                       onClick={() => setShowAddWalletModal(true)}
                     >
                       Add Money
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>

          {/* Feature Highlights */}
          <div className="feature-highlights mt-5">
            <h2 className="section-title">Why Play With Us?</h2>
            <Row>
              <Col xs={12} sm={6} lg={4} className="mb-4">
                <div className="feature-card">
                  <div className="feature-icon">🏆</div>
                  <h3>Win Cash Prizes</h3>
                  <p>Compete and win real cash prizes by taking quizzes</p>
                </div>
              </Col>
              <Col xs={12} sm={6} lg={4} className="mb-4">
                <div className="feature-card">
                  <div className="feature-icon">📚</div>
                  <h3>Learn & Grow</h3>
                  <p>Enhance your knowledge with interactive quizzes</p>
                </div>
              </Col>
              <Col xs={12} sm={6} lg={4} className="mb-4">
                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <h3>Certificates</h3>
                  <p>Get certified for each quiz you pass</p>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      {/* Quiz Instructions Modal */}
      <Modal
        show={showInstructionsModal}
        onHide={() => setShowInstructionsModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Quiz Instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body className="max-h-90 overflow-y-auto">
          <div className="instructions-container">
             <div className="instruction-section">
              <h5>📋 General Rules</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• This quiz contains <strong>10 questions</strong></li>
                <li className="mb-2">• Total duration: <strong>2.5 minutes</strong></li>
                <li className="mb-2">• Each question carries equal weightage</li>
                <li className="mb-2">• You must score <strong>100% to pass</strong> and be eligible for the prize</li>
              </ul>
            </div>

            <div className="instruction-section">
              <h5>⏱️ Timing & Navigation</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• Each question has a <strong>15 second timer</strong></li>
                <li className="mb-2">• Timer starts immediately when the question is displayed</li>
                <li className="mb-2">• If time runs out, the question will be marked as unanswered</li>
                <li className="mb-2">• You can navigate between questions using the Next button</li>
              </ul>
            </div>

            <div className="instruction-section">
              <h5>👁️ Proctoring</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• Switching tabs or minimizing the browser window is monitored</li>
                <li className="mb-2">• <strong>First tab switch: Warning</strong> - You will see a caution message</li>
                <li className="mb-2">• <strong>Second tab switch: Test failure</strong> - Your quiz will be immediately submitted with 0 score</li>
                <li className="mb-2">• Do not attempt to cheat as it will result in disqualification</li>
              </ul>
            </div>

            <div className="instruction-section">
              <h5>💡 Tips for Success</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• Read each question carefully before answering</li>
                <li className="mb-2">• Manage your time wisely - don't spend too long on a single question</li>
                <li className="mb-2">• Answer all questions - there's no negative marking</li>
                <li className="mb-2">• Stay focused and avoid distractions</li>
              </ul>
            </div>

            <div className="instruction-section">
              <h5>🏆 Prize Information</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• <strong>Prize Amount:</strong> ₹10</li>
                <li className="mb-2">• To claim your prize, you must score 100%</li>
                <li className="mb-2">• Winners will receive their prize within 7-10 working days</li>
                <li className="mb-2">• The prize will be transferred to your registered bank account</li>
              </ul>
            </div>

            <div className="instruction-section">
              <h5>🔒 Terms & Conditions</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• Entry fee is non-refundable once paid</li>
                <li className="mb-2">• BrainRock reserves the right to disqualify any participant for cheating</li>
                <li className="mb-2">• All decisions made by BrainRock are final and binding</li>
                <li className="mb-2">• The quiz must be completed in a single session</li>
              </ul>
            </div>
          </div>
        </Modal.Body>
         <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowInstructionsModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAcceptInstructions}
            className="px-4"
          >
            I Understand - Start Quiz
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Register for Quiz</Modal.Title>
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
                  <p>Quiz Amount: ₹{TEST_AMOUNT.toFixed(2)}</p>
                  <p>Remaining Balance: ₹{(walletAmount - TEST_AMOUNT).toFixed(2)}</p>
                  
                  {walletAmount < TEST_AMOUNT && (
                    <div className="mb-3">
                      <p className="text-danger">Your wallet balance is insufficient to pay for the test.</p>
                      <Button
                        variant="success"
                        onClick={() => {
                          const remainingAmount = TEST_AMOUNT - walletAmount;
                          setAddAmount(remainingAmount.toFixed(2));
                          setShowAddWalletModal(true);
                        }}
                        className="mb-2"
                      >
                        Add ₹{(TEST_AMOUNT - walletAmount).toFixed(2)} to Wallet
                      </Button>
                      <Button
                        variant="outline-success"
                        onClick={() => setShowAddWalletModal(true)}
                        className="ms-2"
                      >
                        Add Custom Amount
                      </Button>
                    </div>
                  )}
                  
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
              <h5 className="text-success">Payment Successful!</h5>
              <p>Your test registration is complete.</p>
              <Button variant="success" onClick={handleStartTest} className="mt-3">
                Start Quiz
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
            <strong>Current Balance:</strong> ₹{walletAmount.toFixed(2)}
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
    </div>
  );
};

export default UserDashBoard;
