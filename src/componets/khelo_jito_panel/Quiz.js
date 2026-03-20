import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from "react-bootstrap";
import "../../assets/css/websitemanagement.css";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import "../../assets/css/quiz.css";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';

const Quiz = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [walletAmount, setWalletAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participationData, setParticipationData] = useState({});
  
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/quiz-items/`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const quizzesData = response.data.data || response.data;
        setQuizzes(quizzesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchParticipatedQuizzes = async () => {
      if (user && user.unique_id) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/quiz-participants/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (response.data.status && response.data.data) {
            const participationMap = {};
            response.data.data.forEach(item => {
              participationMap[item.quiz] = {
                score: item.attempt?.score,
                totalQuestions: item.attempt?.total_questions,
                status: item.attempt?.attempt_status
              };
            });
            setParticipationData(participationMap);
          }
        } catch (error) {
          console.error("Error fetching participated quizzes:", error);
          setParticipationData({});
        }
      }
    };

    fetchQuizzes();
    fetchParticipatedQuizzes();
  }, [user]);

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

    fetchWalletAmount();
  }, [user]);

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPaymentModal(true);
    setPaymentMethod(null);
    setPaymentSuccess(false);
  };

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  const handleWalletPayment = async () => {
    if (walletAmount < parseFloat(selectedQuiz.entry_fee)) {
      alert("Insufficient wallet balance");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/wallet-register/`,
        {
          user_id: user.unique_id,
          quiz_id: selectedQuiz.quiz_id
        },
        { withCredentials: true }
      );

      if (response.data.status) {
        setWalletAmount(walletAmount - parseFloat(selectedQuiz.entry_fee));
        setPaymentSuccess(true);
        localStorage.setItem("quiz_payment_method", "wallet");
        localStorage.setItem("quiz_source", "quizpage");
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz-participants/`,
        {
          user_id: user.unique_id,
          quiz_id: selectedQuiz.quiz_id
        },
        { withCredentials: true }
      );

      if (response.data.status && response.data.payment_order) {
        localStorage.setItem("quiz_user_id", user.unique_id);
        localStorage.setItem("quiz_payment_method", "online");
        localStorage.setItem("quiz_source", "quizpage");
        
        if (response.data.payment_order.redirectUrl) {
          window.open(response.data.payment_order.redirectUrl, '_blank');
        } else {
          setPaymentSuccess(true);
        }
      }
    } catch (error) {
      console.error("Error processing online payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const handleAddWallet = async () => {
    setAddError("");
    setAddSuccess("");

    const amount = parseFloat(addAmount);

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
        if (response.data.order_id) {
          localStorage.setItem("wallet_payment_order_id", response.data.order_id);
        }
        window.open(response.data.payment_data.redirectUrl, '_blank');
      } else {
        setAddError(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error adding wallet amount:", error);
      setAddError("Failed to add amount to wallet. Please try again.");
    }
  };

  const handleStartQuiz = () => {
    localStorage.setItem("quiz_user_id", user.unique_id);
    localStorage.setItem("quiz_quiz_id", selectedQuiz.quiz_id);
    setShowPaymentModal(false);
    // Navigate to QuizTest page to start the quiz
    navigate("/QuizTest");
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedQuiz(null);
    setPaymentMethod(null);
    setPaymentSuccess(false);
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
          <h1 className="page-title">Quiz</h1>
          
          <div className="br-box-container mt-4">
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <Alert variant="danger" className="my-5">
                Error loading quizzes: {error}
              </Alert>
            ) : quizzes.length === 0 ? (
              <div className="text-center my-5">
                <h4>No quizzes available</h4>
                <p>Please check back later for new quizzes</p>
              </div>
            ) : (
              <Row className="br-stats-row">
                {quizzes.map((quiz) => (
                  <Col xs={12} md={6} lg={4} key={quiz.quiz_id} className="mb-4">
                    <Card className="quiz-card">
                      <Card.Body>
                        <Card.Title className="quiz-card-title">{quiz.title}</Card.Title>
                        <Card.Text className="quiz-card-description">
                          {quiz.description}
                        </Card.Text>
                        <div className="quiz-card-details">
                          <div className="quiz-detail-item">
                            <span className="detail-label">Questions:</span>
                            <span className="detail-value">{quiz.questions?.length || 0}</span>
                          </div>
                          <div className="quiz-detail-item">
                            <span className="detail-label">Entry Fee:</span>
                            <span className="detail-value">₹{quiz.entry_fee}</span>
                          </div>
                          <div className="quiz-detail-item">
                            <span className="detail-label">Price:</span>
                            <span className="detail-value">₹{quiz.price}</span>
                          </div>
                          <div className="quiz-detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{Math.ceil(quiz.questions?.length * 1.2)} minutes</span>
                          </div>
                          {participationData[quiz.quiz_id] && (
                            <div className="quiz-detail-item">
                              <span className="detail-label">Your Score:</span>
                              <span className="detail-value">
                                {participationData[quiz.quiz_id].score}/{participationData[quiz.quiz_id].totalQuestions}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="quiz-controls mt-4">
                          <Button
                            variant="primary"
                            onClick={() => handleQuizSelect(quiz)}
                            className="start-btn"
                            disabled={!quiz.is_active || participationData[quiz.quiz_id]}
                          >
                            {!quiz.is_active ? "Quiz Inactive" : 
                             participationData[quiz.quiz_id] ? "Already Participated" : "Start Quiz"}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Container>
      </div>

      <Modal
        show={showPaymentModal}
        onHide={handleClosePaymentModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Register for Quiz: {selectedQuiz?.title}</Modal.Title>
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
                    <span className="fw-bold">₹{parseFloat(selectedQuiz?.entry_fee || 0).toFixed(2)}</span>
                  </div>
                </Button>
                <Button
                  variant={paymentMethod === "online" ? "primary" : "light"}
                  onClick={() => handleSelectPaymentMethod("online")}
                  className="text-left"
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <span>Online Payment</span>
                    <span className="fw-bold">₹{parseFloat(selectedQuiz?.entry_fee || 0).toFixed(2)}</span>
                  </div>
                </Button>
              </div>

              {paymentMethod === "wallet" && (
                <div className="border p-4 rounded bg-light">
                  <h6>Wallet Balance: ₹{walletAmount.toFixed(2)}</h6>
                  <p>Quiz Entry Fee: ₹{parseFloat(selectedQuiz?.entry_fee || 0).toFixed(2)}</p>
                  <p>Remaining Balance: ₹{(walletAmount - parseFloat(selectedQuiz?.entry_fee || 0)).toFixed(2)}</p>
                  
                  {walletAmount < parseFloat(selectedQuiz?.entry_fee || 0) && (
                    <div className="mb-3">
                      <p className="text-danger">Your wallet balance is insufficient to pay for the quiz.</p>
                      <Button
                        variant="success"
                        onClick={() => {
                          const remainingAmount = parseFloat(selectedQuiz.entry_fee) - walletAmount;
                          setAddAmount(remainingAmount.toFixed(2));
                          setShowAddWalletModal(true);
                        }}
                        className="mb-2"
                      >
                        Add ₹{(parseFloat(selectedQuiz.entry_fee) - walletAmount).toFixed(2)} to Wallet
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
                    disabled={walletAmount < parseFloat(selectedQuiz?.entry_fee || 0)}
                  >
                    Pay with Wallet
                  </Button>
                </div>
              )}

              {paymentMethod === "online" && (
                <div className="border p-4 rounded bg-light">
                  <h6>Online Payment</h6>
                  <p>Quiz Entry Fee: ₹{parseFloat(selectedQuiz?.entry_fee || 0).toFixed(2)}</p>
                  <Button variant="primary" onClick={handleOnlinePayment}>
                    Proceed to Payment
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <h5>Payment Successful!</h5>
              <p>Your quiz registration is complete.</p>
              <Button variant="primary" onClick={handleStartQuiz} className="mt-3">
                Start Quiz
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!paymentSuccess && (
            <Button variant="secondary" onClick={handleClosePaymentModal}>
              Cancel
            </Button>
          )}
        </Modal.Footer>
      </Modal>

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
          <Button variant="primary" onClick={handleAddWallet}>
            Add Amount
          </Button>
        </Modal.Footer>
      </Modal>

     
    </div>
  );
};

export default Quiz;
