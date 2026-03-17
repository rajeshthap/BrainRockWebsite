import React, { useState, useEffect, useContext } from "react";
import "../../assets/css/Test.css";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import FooterPage from "../footer/FooterPage";
import { Container } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

// Define the base URL for your API
const API_BASE_URL = "https://brainrock.in/brainrock/backend";

function Test() {
  // Get user_id from URL search parameters or localStorage
  const [searchParams] = useSearchParams();
  const urlUserId = searchParams.get("user_id");
  const storageUserId = localStorage.getItem("test_user_id");
  const userId = urlUserId || storageUserId;
  const navigate = useNavigate();
  console.log("Test component - User ID from URL:", urlUserId);
  console.log("Test component - User ID from localStorage:", storageUserId);

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
    phone: "",
    password: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
  }); // State for winner form data

  // Start test and fetch questions from API
  useEffect(() => {
    const startTest = async () => {
      try {
        if (!userId) {
          throw new Error("User ID not found. Please register first.");
        }

        const response = await axios.post(
          "https://brainrock.in/brainrock/backend/api/start-test/",
          { user_id: userId },
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
          throw new Error(response.data.message || "Failed to start test");
        }
      } catch (err) {
        let errorMessage = "Failed to start test";
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

    startTest();
  }, [userId]);

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

  // Reset timer when current question or selected option changes
  useEffect(() => {
    setTimeLeft(10);
  }, [currentQuestion, selectedOption]);

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
            console.log("Test warning: First tab switch");
          } else if (newCount === 2) {
            // Second time, fail the test
            setShowResults(true);
            setScore(0);
            console.log("Test failed: Second tab switch");
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
      submitTest(newAnswers);
    }
  };

  // Submit test to API
  const submitTest = async (answers) => {
    try {
      const response = await axios.post(
        "https://brainrock.in/brainrock/backend/api/submit-test/",
        {
          user_id: userId,
          answers: answers,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Test submission successful:", response.data);
      // Save API response data for display
      setTestResult(response.data);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting test:", err);
      setError(err.message);
    }
  };

  const { user } = useContext(AuthContext);

  // Handle claim prize
  const handleClaimPrize = async () => {
    // Use user from AuthContext if available, otherwise use test user ID
    const claimUserId = (user && user.unique_id) || userId;
    
    if (claimUserId) {
      try {
        // Call add-cashback API to add won amount to wallet
        const response = await axios.put(
          "https://brainrock.in/brainrock/backend/api/add-cashback/",
          { user_id: claimUserId },
          { withCredentials: true }
        );

        if (response.data.status) {
          // Store winning amount (amount_added) in localStorage for display in dashboard
          localStorage.setItem("winningAmount", response.data.amount_added || 0);
          
          // If user_id is available (authenticated), redirect to user dashboard without showing form
          navigate("/UserDashBoard");
        }
      } catch (error) {
        console.error("Error adding cashback:", error);
        alert("Failed to claim prize. Please try again.");
      }
    } else {
      // For unauthorized users without test user ID, show winner form
      setShowWinnerForm(true);
    }
  };

  const handleRestart = () => {
    // Clear localStorage
    localStorage.removeItem("test_user_id");
    
    // Redirect based on user authorization
    if (user && user.unique_id) {
      // Authorized user - redirect to user dashboard
      navigate("/UserDashBoard");
    } else {
      // Unauthorized user - redirect to KheloJito for re-registration
      navigate("/KheloJito");
    }
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
        "https://brainrock.in/brainrock/backend/api/test-winners/",
        {
          user_id: userId,
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
      localStorage.removeItem("test_user_id");
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
    // Check if test was failed due to tab switch
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
                  onChange={handleWinnerFormChange}
                  placeholder="Enter your phone number"
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

    return (
      <div className="test-container">
        <div className="test-card results-card">
          <div className="results-header">
            <h1 className="results-title">Test Results</h1>
          </div>

          <div className="circular-progress-container">
            <div
              className={`circular-progress ${animateScore ? "animate" : ""}`}
            >
              <svg className="progress-ring" width="200" height="200">
                <circle
                  className="progress-ring-circle-bg"
                  cx="100"
                  cy="100"
                  r="90"
                />
                <circle
                  className={`progress-ring-circle ${isPassed ? "pass" : "fail"}`}
                  cx="100"
                  cy="100"
                  r="90"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - percentage / 100)}`}
                />
              </svg>
              <div className="progress-text">
                <div className="score-display">
                  {testResult?.score || score}/{questions.length}
                </div>
                <div className="percentage-display">{percentage}%</div>
              </div>
            </div>
          </div>

          <div className={`result-message ${isPassed ? "passed" : "failed"}`}>
            {isTabSwitchFailed
              ? "Test Failed: You switched tabs during the test"
              : isPassed
                ? "Test Passed: Congratulations!"
                : "Test Failed: Better luck next time"}
          </div>

          <div className="results-actions">
            {isPassed && (
              <button className="claim-button" onClick={handleClaimPrize}>
                Claim Your Prize
              </button>
            )}
            <button className="restart-button" onClick={handleRestart}>
              Retake Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="test-container">
        <div className="test-card">
          {/* Tab switch warning */}
          {tabSwitchWarning && (
            <div className="warning-message">
              Warning: You have switched tabs once. Switching again will end
              your test.
            </div>
          )}

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="question-number">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="timer">Time Left: {timeLeft} seconds</div>
          <h2 className="question">
            {questions[currentQuestion].question_text}
          </h2>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className={`option ${selectedOption === index ? "selected" : ""}`}
                onClick={() => handleOptionSelect(index)}
              >
                {option}
              </div>
            ))}
          </div>
          <button
            className="next-button"
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
          >
            {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </>
  );
}

export default Test;
