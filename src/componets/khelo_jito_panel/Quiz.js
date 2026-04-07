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
const STORAGE_KEY = 'BR_QUIZ_DATA';

// Helper to safely get/set localStorage for quiz data
const getStoredQuizData = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (e) {
    console.error("Error reading quiz data from localStorage:", e);
  }
  return null;
};

const setStoredQuizData = (quizData) => {
  try {
    if (typeof window !== "undefined") {
      if (quizData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quizData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error("Error saving quiz data to localStorage:", e);
  }
};

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
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Quiz questions state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const { user, loading: authLoading } = useContext(AuthContext);
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

  // Load stored quiz data immediately on mount
  useEffect(() => {
    const storedData = getStoredQuizData();
    if (storedData) {
      setQuizzes(storedData.quizzes || []);
      setParticipationData(storedData.participationData || {});
      setWalletAmount(storedData.walletAmount || 0);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    const fetchQuizzes = async () => {
      try {
        // Only show loading if we don't have stored data
        const storedData = getStoredQuizData();
        if (!storedData) {
          setLoading(true);
        }
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/quiz-items/`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const quizzesData = response.data.data || response.data;
        setQuizzes(quizzesData);
        
        // Store quizzes data in localStorage for persistence
        const currentStoredData = getStoredQuizData() || {};
        setStoredQuizData({
          ...currentStoredData,
          quizzes: quizzesData,
        });
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
                status: item.attempt?.status,
                paymentStatus: item.payment_status
              };
            });
            setParticipationData(participationMap);
            
            // Store participation data in localStorage for persistence
            const currentStoredData = getStoredQuizData() || {};
            setStoredQuizData({
              ...currentStoredData,
              participationData: participationMap,
            });
          }
        } catch (error) {
          console.error("Error fetching participated quizzes:", error);
          setParticipationData({});
        }
      }
    };

    fetchQuizzes();
    fetchParticipatedQuizzes();
  }, [user, authLoading]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

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
            
            // Store wallet amount in localStorage for persistence
            const currentStoredData = getStoredQuizData() || {};
            setStoredQuizData({
              ...currentStoredData,
              walletAmount: total,
            });
          }
        } catch (error) {
          console.error("Error fetching wallet amount:", error);
          setWalletAmount(0);
        }
      }
    };

    fetchWalletAmount();
  }, [user, authLoading]);

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
    setShowPaymentModal(false);
    setShowInstructionsModal(true);
  };

  const handleAcceptInstructions = async () => {
    localStorage.setItem("quiz_user_id", user.unique_id);
    localStorage.setItem("quiz_quiz_id", selectedQuiz.quiz_id);
    setShowInstructionsModal(false);
    
    // Fetch questions from quiz-start API
    setQuizLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz-start/`,
        {
          user_id: user.unique_id,
          quiz_id: selectedQuiz.quiz_id
        },
        { withCredentials: true }
      );
      
      if (response.data.status && response.data.questions) {
        setQuizQuestions(response.data.questions);
        setAttemptId(response.data.attempt_id);
        // Store in localStorage for QuizTest page
        localStorage.setItem("quiz_questions", JSON.stringify(response.data.questions));
        localStorage.setItem("quiz_attempt_id", response.data.attempt_id);
        // Navigate to QuizTest page
        navigate("/QuizTest");
      } else {
        alert("Failed to load quiz questions. Please try again.");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Failed to start quiz. Please try again.");
    } finally {
      setQuizLoading(false);
    }
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
          <h1 className="page-title">Quiz Categories</h1>
          
          <div className="br-box-container mt-2">
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
                        {quiz.title_hindi && (
                          <Card.Title className="quiz-card-title-hindi">{quiz.title_hindi}</Card.Title>
                        )}
                        <Card.Text className="quiz-card-description">
                          {quiz.description}
                        </Card.Text>
                        {quiz.description_hindi && (
                          <Card.Text className="quiz-card-description-hindi">
                            {quiz.description_hindi}
                          </Card.Text>
                        )}
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
                            disabled={!quiz.is_active || (participationData[quiz.quiz_id] && participationData[quiz.quiz_id].paymentStatus?.includes('completed'))}
                          >
                            {!quiz.is_active ? "Quiz Inactive" : 
                             (participationData[quiz.quiz_id] && participationData[quiz.quiz_id].paymentStatus?.includes('completed')) ? "Already Participated" : "Start Quiz"}
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
              <h5 className="text-success">Payment Successful!</h5>
              <p>Your quiz registration is complete.</p>
              <Button variant="success" onClick={handleStartQuiz} className="mt-3">
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

      {/* Quiz Instructions Modal */}
      <Modal
        show={showInstructionsModal}
        onHide={() => {
          setShowInstructionsModal(false);
          setSelectedQuiz(null);
        }}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Quiz Instructions: {selectedQuiz?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="max-h-90 overflow-y-auto">
          <div className="instructions-container">
             <div className="instruction-section">
              <h5>📋 General Rules</h5>
              <ul className="list-unstyled">
                <li className="mb-2">• This quiz contains <strong>{selectedQuiz?.questions?.length || 0} questions</strong></li>
                <li className="mb-2">• Total duration: <strong>{Math.ceil(selectedQuiz?.questions?.length * 1.5)} minutes</strong></li>
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
                <li className="mb-2">• <strong>Second tab switch: Quiz failure</strong> - Your quiz will be immediately submitted with 0 score</li>
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
                <li className="mb-2">• <strong>Prize Amount:</strong> ₹{selectedQuiz?.price || 0}</li>
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
                onClick={() => {
                  setShowInstructionsModal(false);
                }}
                disabled={quizLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAcceptInstructions}
                className="px-4"
                disabled={quizLoading}
              >
                {quizLoading ? "Loading..." : "I Understand - Start Quiz"}
              </Button>
            </Modal.Footer>
      </Modal>

      
    </div>
  );
};

export default Quiz;
