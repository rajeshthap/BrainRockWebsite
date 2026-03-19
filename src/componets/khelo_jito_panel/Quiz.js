import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from "react-bootstrap";
import "../../assets/css/websitemanagement.css";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import "../../assets/css/quiz.css";

const Quiz = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(50);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  // Sample quizzes data
  const quizzes = [
    {
      id: 1,
      title: "General Knowledge Quiz",
      description: "Test your knowledge with this 5-question general knowledge quiz",
      questions: [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1
        },
        {
          question: "What is the largest ocean on Earth?",
          options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
          correctAnswer: 3
        },
        {
          question: "Which country invented paper?",
          options: ["India", "Egypt", "China", "Greece"],
          correctAnswer: 2
        },
        {
          question: "What is the smallest prime number?",
          options: ["0", "1", "2", "3"],
          correctAnswer: 2
        }
      ],
      entryFee: 10,
      prize: 50,
      duration: "5 minutes"
    },
    {
      id: 2,
      title: "Science Quiz",
      description: "Challenge yourself with this 4-question science quiz",
      questions: [
        {
          question: "What is the chemical symbol for water?",
          options: ["H2O", "CO2", "O2", "H2"],
          correctAnswer: 0
        },
        {
          question: "Which gas do plants absorb from the atmosphere?",
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
          correctAnswer: 1
        },
        {
          question: "What is the speed of light?",
          options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "200,000 km/s"],
          correctAnswer: 0
        },
        {
          question: "What is the hardest natural substance on Earth?",
          options: ["Gold", "Iron", "Diamond", "Platinum"],
          correctAnswer: 2
        }
      ],
      entryFee: 15,
      prize: 75,
      duration: "4 minutes"
    },
    {
      id: 3,
      title: "Technology Quiz",
      description: "Test your tech knowledge with this 3-question quiz",
      questions: [
        {
          question: "Who founded Microsoft?",
          options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"],
          correctAnswer: 1
        },
        {
          question: "What does CPU stand for?",
          options: ["Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Computer Processing Unit"],
          correctAnswer: 0
        },
        {
          question: "Which company owns YouTube?",
          options: ["Microsoft", "Amazon", "Google", "Facebook"],
          correctAnswer: 2
        }
      ],
      entryFee: 5,
      prize: 25,
      duration: "3 minutes"
    }
  ];

  // Handle quiz selection
  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPaymentModal(true);
  };

  // Handle payment submission
  const handlePaymentSubmit = () => {
    if (paymentMethod === "wallet") {
      if (walletBalance >= selectedQuiz.entryFee) {
        // Deduct entry fee from wallet
        setWalletBalance(walletBalance - selectedQuiz.entryFee);
        setPaymentSuccess(true);
        // Hide modal after 2 seconds and start quiz
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
          // Start the quiz
          setCurrentQuestion(0);
          setScore(0);
          setShowResults(false);
          setSelectedAnswer(null);
          setAnswered(false);
        }, 2000);
      }
    } else {
      // Online payment processing (simulated)
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        // Start the quiz
        setCurrentQuestion(0);
        setScore(0);
        setShowResults(false);
        setSelectedAnswer(null);
        setAnswered(false);
      }, 2000);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setAnswered(true);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (selectedAnswer === selectedQuiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setAnswered(false);

    // Check if we've reached the end of the quiz
    if (currentQuestion + 1 === selectedQuiz.questions.length) {
      setShowResults(true);
    }
  };

  // Restart quiz
  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setSelectedQuiz(null);
  };

  // Close payment modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedQuiz(null);
    setPaymentMethod("wallet");
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
          
          {/* Quiz Selection View */}
          {!selectedQuiz && !showResults ? (
            <div className="br-box-container mt-4">
              <Row className="br-stats-row">
                {quizzes.map((quiz) => (
                  <Col xs={12} md={6} lg={4} key={quiz.id} className="mb-4">
                    <Card className="quiz-card">
                      <Card.Body>
                        <Card.Title className="quiz-card-title">{quiz.title}</Card.Title>
                        <Card.Text className="quiz-card-description">
                          {quiz.description}
                        </Card.Text>
                        <div className="quiz-card-details">
                          <div className="quiz-detail-item">
                            <span className="detail-label">Questions:</span>
                            <span className="detail-value">{quiz.questions.length}</span>
                          </div>
                          <div className="quiz-detail-item">
                            <span className="detail-label">Entry Fee:</span>
                            <span className="detail-value">₹{quiz.entryFee}</span>
                          </div>
                          <div className="quiz-detail-item">
                            <span className="detail-label">Prize:</span>
                            <span className="detail-value">₹{quiz.prize}</span>
                          </div>
                          <div className="quiz-detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{quiz.duration}</span>
                          </div>
                        </div>
                        <div className="quiz-controls mt-4">
                          <Button
                            variant="primary"
                            onClick={() => handleQuizSelect(quiz)}
                            className="start-btn"
                          >
                            Start Quiz
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : !showResults ? (
            /* Quiz Question View */
            <div className="br-box-container mt-4">
              <Row className="br-stats-row">
                <Col xs={12}>
                  <Card className="quiz-card">
                    <Card.Body>
                      <div className="quiz-header">
                        <div className="question-number">
                          Question {currentQuestion + 1} of {selectedQuiz.questions.length}
                        </div>
                        <div className="score">
                          Score: {score}/{selectedQuiz.questions.length}
                        </div>
                      </div>
                      
                      <Card.Title className="question-text mt-4">
                        {selectedQuiz.questions[currentQuestion].question}
                      </Card.Title>
                      
                      <div className="quiz-options mt-4">
                        {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                          <div
                            key={index}
                            className={`quiz-option ${
                              selectedAnswer === index ? "selected" : ""
                            } ${
                              answered && index === selectedQuiz.questions[currentQuestion].correctAnswer
                                ? "correct"
                                : ""
                            } ${
                              answered && selectedAnswer === index && index !== selectedQuiz.questions[currentQuestion].correctAnswer
                                ? "incorrect"
                                : ""
                            }`}
                            onClick={() => !answered && handleAnswerSelect(index)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      <div className="quiz-controls mt-4">
                        <Button
                          variant="primary"
                          onClick={handleNextQuestion}
                          disabled={!answered}
                        >
                          {currentQuestion === selectedQuiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            /* Quiz Results View */
            <div className="br-box-container mt-4">
              <Row className="br-stats-row">
                <Col xs={12}>
                  <Card className="quiz-results-card">
                    <Card.Body>
                      <Card.Title className="results-title">Quiz Complete!</Card.Title>
                      <div className="results-score">
                        Your Score: {score}/{selectedQuiz.questions.length}
                      </div>
                      <div className="results-percentage">
                        {Math.round((score / selectedQuiz.questions.length) * 100)}%
                      </div>
                      <div className="results-message mt-4">
                        {score === selectedQuiz.questions.length ? (
                          <div className="message-excellent">
                            <h4>Excellent!</h4>
                            <p>You got all the questions right!</p>
                          </div>
                        ) : score >= selectedQuiz.questions.length / 2 ? (
                          <div className="message-good">
                            <h4>Good Job!</h4>
                            <p>You passed the quiz!</p>
                          </div>
                        ) : (
                          <div className="message-poor">
                            <h4>Keep Trying!</h4>
                            <p>You can do better next time.</p>
                          </div>
                        )}
                      </div>
                      <div className="quiz-controls mt-4">
                        <Button variant="primary" onClick={handleRestartQuiz}>
                          Back to Quizzes
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Container>
      </div>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={handleClosePaymentModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="term-nd-condi">
          <Modal.Title className="term-title">Payment for {selectedQuiz?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentSuccess ? (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h4>Payment Successful!</h4>
              <p>Your quiz will start shortly...</p>
            </div>
          ) : (
            <>
              <div className="payment-info">
                <div className="payment-details">
                  <h5>Quiz Details</h5>
                  <p><strong>Entry Fee:</strong> ₹{selectedQuiz?.entryFee}</p>
                  <p><strong>Prize:</strong> ₹{selectedQuiz?.prize}</p>
                </div>
                
                <div className="wallet-info">
                  <h5>Wallet Balance</h5>
                  <p>Available: ₹{walletBalance}</p>
                  {paymentMethod === "wallet" && walletBalance < selectedQuiz?.entryFee && (
                    <Alert variant="danger">
                      Insufficient wallet balance. Please use other payment method.
                    </Alert>
                  )}
                </div>

                <div className="payment-methods">
                  <h5>Select Payment Method</h5>
                  <Form.Check
                    type="radio"
                    label="Wallet"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={walletBalance < selectedQuiz?.entryFee}
                  />
                  <Form.Check
                    type="radio"
                    label="Online Payment (Credit Card/Debit Card/UPI)"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        {!paymentSuccess && (
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePaymentModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePaymentSubmit}
              disabled={paymentMethod === "wallet" && walletBalance < selectedQuiz?.entryFee}
            >
              Pay Now
            </Button>
          </Modal.Footer>
        )}
      </Modal>

     
    </div>
  );
};

export default Quiz;