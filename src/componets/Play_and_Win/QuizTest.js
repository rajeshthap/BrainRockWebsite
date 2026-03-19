import React, { useState, useEffect, useContext } from "react";
import "../../assets/css/Test.css";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import FooterPage from "../footer/FooterPage";
import { Container } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

// Define the base URL for your API
const API_BASE_URL = "https://brainrock.in/brainrock/backend";

function QuizTest() {
  // Get user_id and quiz_id from URL search parameters or localStorage
  const [searchParams] = useSearchParams();
  const urlUserId = searchParams.get("user_id");
  const urlQuizId = searchParams.get("quiz_id");
  const storageUserId = localStorage.getItem("quiz_user_id");
  const storageQuizId = localStorage.getItem("quiz_quiz_id");
  const userId = urlUserId || storageUserId;
  const quizId = urlQuizId || storageQuizId;
  const navigate = useNavigate();
  
  // Check for payment success parameters in URL
  const paymentSuccess = searchParams.get("payment_success");
  const paymentMethod = searchParams.get("payment_method");
  
  // If payment was successful and we have user_id and quiz_id, proceed
  if (paymentSuccess === "true" && userId && quizId) {
    console.log("QuizTest component - Payment successful via:", paymentMethod);
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [testResult, setTestResult] = useState(null);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false); // New state for tab switch warning
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // New state for tab switch count
  const [animateScore, setAnimateScore] = useState(false); // For score animation
  const [showWinnerForm, setShowWinnerForm] = useState(false); // State for winner form visibility
  const [winnerFormData, setWinnerFormData] = useState({
    phone: localStorage.getItem("quiz_user_phone") || "",
    password: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
  }); // State for winner form data
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false); // State for wrong answers modal
  const [wrongAnswers, setWrongAnswers] = useState([]); // State to store wrong answers
  const [certificateUrl, setCertificateUrl] = useState(null); // State for certificate URL

  // Start quiz and fetch questions from API
  useEffect(() => {
    const startQuiz = async () => {
      try {
        if (!userId || !quizId) {
          throw new Error("User ID or Quiz ID not found. Please register first.");
        }

        const response = await axios.post(
          "https://brainrock.in/brainrock/backend/api/start-quiz/",
          { user_id: userId, quiz_id: quizId },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.status) {
          setQuestions(response.data.questions);
          setAttemptId(response.data.attempt_id);
        } else {
          throw new Error(response.data.message || "Failed to start quiz");
        }
      } catch (err) {
        let errorMessage = "Failed to start quiz";
        if (err.response) {
          // Server responded with error status (400, 401, 403, 500, etc.)
          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          // Request made but no response
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          // Error in request setup
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    startQuiz();
  }, [userId, quizId]);

  // Timer effect
  useEffect(() => {
    if (loading || showResults || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, move to next question
          handleNextQuestion();
          return 10; // Reset timer for next question
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length]);

  // Reset timer only when current question changes
  useEffect(() => {
    setTimeLeft(10);
  }, [currentQuestion]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !loading && !showResults) {
        // User switched tabs
        setTabSwitchCount((prevCount) => {
          const newCount = prevCount + 1;

          if (newCount === 1) {
            // First warning
            setTabSwitchWarning(true);
            console.log("Quiz warning: First tab switch");
          } else if (newCount === 2) {
            // Second time, fail the quiz
            setShowResults(true);
            setScore(0);
            console.log("Quiz failed: Second tab switch");
          }

          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, showResults]);

  // Trigger score animation when results are shown
  useEffect(() => {
    if (showResults) {
      setTimeout(() => setAnimateScore(true), 100);
    }
  }, [showResults]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    // Save user's answer for current question (even if no answer selected)
    const newAnswers = [
      ...userAnswers,
      {
        question_id: questions[currentQuestion].id,
        selected_option: selectedOption,
      },
    ];
    setUserAnswers(newAnswers);

    // Check if answer is correct and update score
    if (selectedOption === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
    } else {
      // All questions completed, submit test
      submitQuiz(newAnswers);
    }
  };

  // Submit quiz to API
  const submitQuiz = async (answers) => {
    try {
      const response = await axios.post(
        "https://brainrock.in/brainrock/backend/api/submit-quiz/",
        {
          user_id: userId,
          quiz_id: quizId,
          answers: answers,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Quiz submission successful:", response.data);
      // Save API response data for display
      setTestResult(response.data);
      
      // Check if certificate is available
      if (response.data.certificate) {
        const certificatePath = response.data.certificate.startsWith('http') 
          ? response.data.certificate 
          : `https://brainrock.in/brainrock/backend${response.data.certificate}`;
        setCertificateUrl(certificatePath);
      }
      
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message);
    }
  };

  const { user } = useContext(AuthContext);

  // Handle claim prize
  const handleClaimPrize = async () => {
    // Get payment method and source from localStorage
    const paymentMethod = localStorage.getItem("quiz_payment_method");
    const quizSource = localStorage.getItem("quiz_source");
    
    // Check if came from user dashboard (using quiz_source flag)
    if (quizSource === "userdashboard" && userId) {
      try {
        // Call add-cashback API to add won amount to wallet (for users from user dashboard)
        const response = await axios.post(
          "https://brainrock.in/brainrock/backend/api/add-cashback/",
          { user_id: userId },
          { withCredentials: true }
        );

        if (response.data.status) {
          // Store winning amount (amount_added) in localStorage for display in dashboard
          localStorage.setItem("winningAmount", response.data.amount_added || 0);
          
          // Redirect based on payment method
          if (paymentMethod === "online") {
            // For online payment, redirect to login page
            navigate("/login");
          } else {
            // For wallet payment, redirect to user dashboard (keep existing behavior)
            navigate("/UserDashBoard");
          }
        }
      } catch (error) {
        console.error("Error adding cashback:", error);
        alert("Failed to claim prize. Please try again.");
      }
    } else if (userId) {
      // For unauthenticated users or users from Quiz page, show winner form to fill details
      setShowWinnerForm(true);
    } else {
      // For users without any identification
      alert("Please register first to claim your prize.");
      navigate("/KheloJito");
    }
  };

  const handleRestart = () => {
    // Clear localStorage
    localStorage.removeItem("quiz_user_id");
    localStorage.removeItem("quiz_quiz_id");
    
    // Redirect based on user authorization
    if (user && user.unique_id) {
      // Authorized user - redirect to user dashboard
      navigate("/UserDashBoard");
    } else {
      // Unauthorized user - redirect to KheloJito for re-registration
      navigate("/KheloJito");
    }
  };

  // Function to find and display wrong answers
  const handleShowWrongAnswers = () => {
    const wrong = [];
    userAnswers.forEach((answer, index) => {
      if (answer.selected_option !== questions[index].correct_answer) {
        wrong.push({
          question: questions[index].question_text,
          userAnswer: questions[index].options[answer.selected_option],
          correctAnswer: questions[index].options[questions[index].correct_answer],
          questionNumber: index + 1
        });
      }
    });
    setWrongAnswers(wrong);
    setShowWrongAnswersModal(true);
  };

  // Handle winner form input changes
  const handleWinnerFormChange = (e) => {
    const { name, value } = e.target;
    setWinnerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit winner form to API
  const submitWinnerForm = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://brainrock.in/brainrock/backend/api/quiz-winners/",
        {
          user_id: userId,
          quiz_id: quizId,
          score: testResult?.score || score,
          ...winnerFormData
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ); 

      console.log("Winner form submission successful:", response.data);
      // Show success message and redirect to login page
      alert("Congratulations! Your details have been submitted successfully. You will receive your winning amount soon.");
      localStorage.removeItem("quiz_user_id");
      localStorage.removeItem("quiz_quiz_id");
      navigate("/login");
    } catch (err) {
      console.error("Error submitting winner form:", err);
      alert("Failed to submit details. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="loading">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="no-questions">
            No questions available. Please check back later.
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Check if quiz was failed due to tab switch
    const isTabSwitchFailed =
      score === 0 && userAnswers.length < questions.length;
    // Calculate percentage
    const percentage = Math.round(
      ((testResult?.score || score) / questions.length) * 100,
    );
    // Determine if passed based on API response or score
    const isPassed = testResult
      ? testResult.status === "passed"
      : percentage >= 60;

    // If user passed and showWinnerForm is true, display the winner form
    if (isPassed && showWinnerForm) {
      return (
        <div className="test-container">
          <div className="test-card results-card">
            <div className="results-header">
              <h1 className="results-title">Congratulations! You Won!</h1>
              <p className="results-subtitle">Please fill in your details to receive your winning amount</p>
            </div>

            <form className="winner-form" onSubmit={submitWinnerForm}>
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  name="user_id"
                  value={userId}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Quiz ID</label>
                <input
                  type="text"
                  name="quiz_id"
                  value={quizId}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Score</label>
                <input
                  type="text"
                  name="score"
                  value={testResult?.score || score}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={winnerFormData.phone}
                  disabled
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={winnerFormData.password}
                  onChange={handleWinnerFormChange}
                  placeholder="Enter password"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  value={winnerFormData.account_holder_name}
                  onChange={handleWinnerFormChange}
                  placeholder="Enter account holder name"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={winnerFormData.account_number}
                  onChange={handleWinnerFormChange}
                  placeholder="Enter account number"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={winnerFormData.ifsc_code}
                  onChange={handleWinnerFormChange}
                  placeholder="Enter IFSC code"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Submit Details
                </button>
                <button type="button" className="cancel-button" onClick={() => {
                  setShowWinnerForm(false);
                  // Redirect based on user authorization
                  if (user && user.unique_id) {
                    navigate("/UserDashBoard");
                  } else {
                    navigate("/KheloJito");
                  }
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Otherwise, show results page
    return (
      <div className="test-container">
        <div className="test-card results-card">
          <div className="results-header">
            <h1 className="results-title">Quiz Complete!</h1>
          </div>

          <div className="score-container">
            <div className="score">{testResult?.score || score}</div>
            <div className="score-label">
              {isPassed ? "You Passed!" : "You Failed"}
            </div>
            <div className="percentage">
              {percentage}%
            </div>
          </div>

          {isPassed ? (
            <div className="success-message">
              <p>Congratulations! You have passed the quiz.</p>
              {certificateUrl && (
                <div className="certificate-section">
                  <h3>Your Certificate</h3>
                  <p>Click the link below to view and download your certificate:</p>
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="certificate-link"
                  >
                    View Certificate
                  </a>
                </div>
              )}
              <button className="claim-prize-button" onClick={handleClaimPrize}>
                Claim Prize
              </button>
            </div>
          ) : (
            <div className="failure-message">
              <p>Sorry, you did not pass the quiz this time.</p>
              <button className="restart-button" onClick={handleRestart}>
                Try Again
              </button>
            </div>
          )}

          {userAnswers.length === questions.length && (
            <div className="wrong-answers-section">
              <button className="wrong-answers-button" onClick={handleShowWrongAnswers}>
                View Wrong Answers
              </button>
            </div>
          )}

          {isTabSwitchFailed && (
            <div className="tab-switch-failure">
              <h3>Test Failed Due to Tab Switching</h3>
              <p>Your quiz was terminated because you switched tabs multiple times.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Display quiz questions
  return (
    <div className="test-container">
      <div className="test-card">
        <div className="question-header">
          <div className="question-number">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="timer">
            Time Left: <span className="timer-value">{timeLeft}s</span>
          </div>
        </div>

        <div className="question-container">
          <div className="question-text">{questions[currentQuestion].question_text}</div>
          <div className="options-container">
            {questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className={`option ${
                  selectedOption === index ? "selected" : ""
                }`}
                onClick={() => handleOptionSelect(index)}
              >
                <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                <div className="option-text">{option}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="navigation-container">
          <button
            className="next-button"
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
          >
            {currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next Question"}
          </button>
        </div>

        {tabSwitchWarning && (
          <div className="tab-switch-warning">
            <p>⚠️ Warning: Do not switch tabs during the quiz. This is your first warning.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizTest;
