import React, { useState, useEffect, useContext } from "react";
import "../../assets/css/Test.css";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import FooterPage from "../footer/FooterPage";
import { Container } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Winner from "../../assets/images/result_img.jpg"
import Faild from "../../assets/images/result_img.jpg"

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
  
  // Check for payment success parameters in URL
  const paymentSuccess = searchParams.get("payment_success");
  const paymentMethod = searchParams.get("payment_method");
  
  // Check if this is a first-time payment user
  const isFirstTimePayment = paymentSuccess === "true";
  const hasPaidBefore = localStorage.getItem("test_has_paid") === "true";
  const testAttempts = parseInt(localStorage.getItem("test_attempts") || "0");
  const hasPassed = localStorage.getItem("test_passed") === "true";
  
  // If first-time payment, update localStorage
  if (isFirstTimePayment && userId) {
    localStorage.setItem("test_has_paid", "true");
    localStorage.setItem("test_payment_date", new Date().toISOString());
    console.log("Test component - Payment successful via:", paymentMethod);
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
    phone: localStorage.getItem("test_user_phone") || "",
    password: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
  }); // State for winner form data
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false); // State for wrong answers modal
  const [wrongAnswers, setWrongAnswers] = useState([]); // State to store wrong answers
  const [certificateUrl, setCertificateUrl] = useState(null); // State for certificate URL
  const [showInstructionsModal, setShowInstructionsModal] = useState(true); // State for instructions modal (show on load)
  const [showStartTestButton, setShowStartTestButton] = useState(false); // State for first-time payment users to start test
  const [remainingAttempts, setRemainingAttempts] = useState(3); // Track remaining attempts

  // Start Quiz and fetch questions from API
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
          throw new Error(response.data.message || "Failed to start quiz");
        }
      } catch (err) {
        let errorMessage = "Failed to start quiz";
        let shouldRedirectToKheloJito = false;
        
        console.log("API Error Response:", err);
        
        if (err.response) {
          // Server responded with error status (400, 401, 403, 500, etc.)
          console.log("Error Response Data:", err.response.data);
          console.log("Error Status:", err.response.status);
          
          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
            console.log("Error Message from API:", errorMessage);
            
            // Check if error indicates already attempted test - redirect to KheloJito
            const errorLower = errorMessage.toLowerCase();
            console.log("Error Lower:", errorLower);
            
            if (errorLower.includes('attempt') || 
                errorLower.includes('already') || 
                errorLower.includes('completed') || 
                errorLower.includes('used') ||
                errorLower.includes('expired')) {
              console.log("DETECTED: All attempts used - Will redirect to KheloJito");
              shouldRedirectToKheloJito = true;
            }
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          // Request made but no response
          errorMessage = "No response from server. Please check your connection.";
          console.log("No response from server");
        } else {
          // Error in request setup
          errorMessage = err.message;
          console.log("Request setup error:", errorMessage);
          
          const errorLower = errorMessage.toLowerCase();
          if (errorLower.includes('attempt') || 
              errorLower.includes('already') || 
              errorLower.includes('completed')) {
            console.log("DETECTED: Attempt related error - Will redirect to KheloJito");
            shouldRedirectToKheloJito = true;
          }
        }
        
        // If error indicates user already attempted, redirect to KheloJito
        if (shouldRedirectToKheloJito) {
          console.log("Redirecting to KheloJito...");
          navigate("/KheloJito");
          return;
        }
        
        console.log("Setting error message:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [userId]);

  // Initialize remaining attempts from localStorage
  useEffect(() => {
    // Check if user has already passed the test
    if (hasPassed) {
      console.log("User has already passed the test - redirecting to KheloJito");
      navigate("/KheloJito");
      return;
    }
    
    // Check if user has used all 3 attempts
    if (testAttempts >= 3) {
      console.log("User has used all 3 attempts - redirecting to KheloJito");
      navigate("/KheloJito");
      return;
    }
    
    // For first-time payment users, show the start test button
    if (isFirstTimePayment && userId) {
      setShowStartTestButton(true);
      setRemainingAttempts(3 - testAttempts);
      console.log("First-time payment user - showing start test button");
      console.log("Remaining attempts:", 3 - testAttempts);
    } else if (hasPaidBefore && userId) {
      // For returning payment users, also show the button with remaining attempts
      setShowStartTestButton(true);
      setRemainingAttempts(3 - testAttempts);
      console.log("Returning payment user - showing start test button");
      console.log("Remaining attempts:", 3 - testAttempts);
    }
  }, [userId, isFirstTimePayment, hasPaidBefore, testAttempts, hasPassed, navigate]);

  // Function to start the test (for first-time payment users)
  const handleStartTest = async () => {
    // Increment attempts in localStorage
    const currentAttempts = parseInt(localStorage.getItem("test_attempts") || "0");
    localStorage.setItem("test_attempts", currentAttempts + 1);
    setRemainingAttempts(3 - (currentAttempts + 1));
    console.log("Test started. Attempt number:", currentAttempts + 1);
    
    // Hide the start button and proceed to start the test
    setShowStartTestButton(false);
  };

  // Timer effect
  useEffect(() => {
    if (loading || showResults || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, move to next question
          handleNextQuestion();
          return 15; // Reset timer for next question
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length]);

  // Reset timer only when current question changes
  useEffect(() => {
    setTimeLeft(15);
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
            console.log("Test warning: First tab switch");
          } else if (newCount === 2) {
            // Second time, fail the quiz
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
      // All questions completed, submit quiz
      submitTest(newAnswers);
    }
  };

  // Submit quiz to API
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
      
      // Check if certificate is available
      if (response.data.certificate) {
        const certificatePath = response.data.certificate.startsWith('http') 
          ? response.data.certificate 
          : `https://brainrock.in/brainrock/backend${response.data.certificate}`;
        setCertificateUrl(certificatePath);
      }
      
      // Check if user passed the test (100% score)
      const percentage = Math.round(
        ((response.data.score || score) / questions.length) * 100,
      );
      const isPassed = response.data.status === "passed" || percentage === 100;
      
      if (isPassed) {
        // User passed - mark as passed so they can't take test again
        localStorage.setItem("test_passed", "true");
        console.log("User passed the test - marking as passed in localStorage");
      } else {
        // User failed - check if they have used all attempts
        const currentAttempts = parseInt(localStorage.getItem("test_attempts") || "0");
        console.log("User failed. Current attempts:", currentAttempts);
        
        if (currentAttempts >= 3) {
          // All 3 attempts used - redirect to KheloJito
          console.log("All 3 attempts used - will redirect to KheloJito");
          setTimeout(() => {
            navigate("/KheloJito");
          }, 2000);
        }
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
    const paymentMethod = localStorage.getItem("test_payment_method");
    const testSource = localStorage.getItem("test_source");
    
    // Check if came from user dashboard (using test_source flag)
    if (testSource === "userdashboard" && userId) {
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
      // For unauthenticated users or users from KheloJito page, show winner form to fill details
      setShowWinnerForm(true);
    } else {
      // For users without any identification
      alert("Please register first to claim your prize.");
      navigate("/KheloJito");
    }
  };

  const handleRestart = () => {
    // Get current attempt count
    const currentAttempts = parseInt(localStorage.getItem("test_attempts") || "0");
    const hasPassed = localStorage.getItem("test_passed") === "true";
    
    // If user has passed or used all 3 attempts, redirect to KheloJito
    if (hasPassed || currentAttempts >= 3) {
      // Clear localStorage for fresh start
      localStorage.removeItem("test_user_id");
      localStorage.removeItem("test_user_phone");
      
      // Redirect based on user authorization
      if (user && user.unique_id) {
        navigate("/UserDashBoard");
      } else {
        navigate("/KheloJito");
      }
    } else {
      // User has remaining attempts - show the start test button again
      setShowStartTestButton(true);
      setShowResults(false);
      setCurrentQuestion(0);
      setScore(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setTestResult(null);
      setRemainingAttempts(3 - currentAttempts);
      setQuestions([]); // Clear questions to trigger re-fetch
      setLoading(true); // Set loading to trigger start-test API call
      console.log("Restarting test. Remaining attempts:", 3 - currentAttempts);
      
      // Re-fetch questions for the next attempt
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
            // After getting questions, hide the start button and show instructions
            setShowStartTestButton(false);
          } else {
            throw new Error(response.data.message || "Failed to start quiz");
          }
        } catch (err) {
          console.error("Error restarting test:", err);
          setError(err.message || "Failed to restart test");
        } finally {
          setLoading(false);
        }
      };

      startTest();
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

  // Social sharing functions
  const shareOnWhatsApp = (percent) => {
    const text = `I passed the BrainRock quiz with ${percent}% score! Check out my certificate: ${certificateUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't support direct link sharing of text, but we can open Instagram
    // Alternatively, we can download the certificate and let user share it manually
    alert("To share on Instagram, please download your certificate first and then share it from the Instagram app.");
    // Open Instagram app or website
    window.open('https://www.instagram.com/', '_blank');
  };

  const shareOnLinkedIn = (percent) => {
    const text = `I passed the BrainRock quiz with ${percent}% score! Check out my certificate: ${certificateUrl}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&title=BrainRock Certificate&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
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

  // Show start test button for first-time payment users
  if (showStartTestButton) {
    return (
      <div className="test-container">
        <div className="test-card">
        <div className="payment-success-container">

  {remainingAttempts > 0 ? (
    <>
    
      <div className="attempts-info">
        <p><strong>Remaining Attempts:</strong> {remainingAttempts} out of 3</p>
        <p className="attempts-note">
          You have used all your quiz attempts.
        </p>
      </div>
    </>
  ) : (
    <>
      <p className="payment-message text-danger">
      Better luck next time! Thank You.
      </p>

      <p className="attempts-note">
       Click below when you're ready to start your next attempt.
      </p>
    </>
  )}

  <button
    className="btn btn-secondary btn-lg ms-3"
    onClick={() => navigate("/KheloJito")}
  >
    Go Back
  </button>

</div>
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

  // Show instructions modal before starting the Quiz
  if (showInstructionsModal) {
    return (
      <div className="test-container">
        <div className="test-card">
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

            <div className="text-center mt-4">
              <button 
                className="btn btn-primary px-4 py-2"
                onClick={() => setShowInstructionsModal(false)}
              >
                I Understand - Start Quiz
              </button>
            </div>
          </div>
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
      : percentage === 100;

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

    return (
      <div className="test-container">
        <div className="test-card results-card">
          <div className="results-content">
            {/* Left side - Certificate */}
            {isPassed && certificateUrl ? (
              <div className="results-image">
                <div className="certificate-container">
                  <a 
                    href={certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="certificate-link"
                  >
                    <img 
                      src={certificateUrl} 
                      alt="Certificate" 
                      className="certificate-image"
                      onError={(e) => {
                        console.error("Certificate image failed to load");
                        e.target.style.display = "none";
                      }}
                    />
                  </a>
                </div>
                 <div className="certificate-actions">
                  <a 
                    href={certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-button"
                  >
                    Download Certificate
                  </a>
                  
                  {/* Social Sharing Buttons */}
                  <div className="social-sharing">
                    <div className="sharing-title">Share your certificate:</div>
                    <div className="sharing-buttons">
                      <button 
                        className="share-button whatsapp" 
                        onClick={() => shareOnWhatsApp(percentage)}
                        title="Share on WhatsApp"
                      >
                        WhatsApp
                      </button>
                      <button 
                        className="share-button instagram" 
                        onClick={shareOnInstagram}
                        title="Share on Instagram"
                      >
                        Instagram
                      </button>
                      <button 
                        className="share-button linkedin" 
                        onClick={() => shareOnLinkedIn(percentage)}
                        title="Share on LinkedIn"
                      >
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If no certificate (failed), show appropriate message or leave empty */
              <div className="results-image">
                <div className="no-certificate">
                  <h3>{isPassed ? "Certificate Coming Soon" : "Try Again to Get Certificate"}</h3>
                  <p>{isPassed ? "Your certificate will be available shortly" : "Score 100% to earn a certificate"}</p>
                </div>
              </div>
            )}
            
            {/* Right side - Results */}
            <div className="results-data">
              <div className="results-header">
                <h1 className="results-title">
                  {isPassed ? "Congratulations!" : "Better Luck Next Time"}
                </h1>
                <p className="results-subtitle">
                  {isPassed ? "You have successfully passed the Quiz" : "Keep practicing to improve your score"}
                </p>
              </div>

              <div className="score-section">
                <div className="percentage-circle">
                  <div className="percentage-text">{percentage}%</div>
                  <div className="score-label">Overall Score</div>
                </div>
                
                <div className="score-details">
                  <div className="score-item correct">
                    <div className="score-value">{testResult?.score || score}</div>
                    <div className="score-label">Correct</div>
                  </div>
                  <div className="score-item incorrect">
                    <div className="score-value">{questions.length - (testResult?.score || score)}</div>
                    <div className="score-label">Incorrect</div>
                  </div>
                  <div className="score-item total">
                    <div className="score-value">{questions.length}</div>
                    <div className="score-label">Total</div>
                  </div>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <div className="progress-label">Progress</div>
                  <div className="progress-percentage">{percentage}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="results-actions">
            {isPassed ? (
              <>
                <button className="continue-button" onClick={handleClaimPrize}>
                  Claim reward
                </button>
              </>
            ) : (
              <>
              <div className="d-flex  ">
                <button className="restart-button" onClick={handleRestart}>
                  Retake Quiz
                </button>
                <button className="wrong-answers-button" onClick={handleShowWrongAnswers}>
                  Wrong Answers
                </button>
                </div>
              </>
            )}
              </div>
            </div>
          </div>

          {/* Wrong Answers Modal */}
          {showWrongAnswersModal && (
            <div className="wrong-answers-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Wrong Answers ({wrongAnswers.length})</h2>
                  <button className="close-button" onClick={() => setShowWrongAnswersModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  {wrongAnswers.length === 0 ? (
                    <div className="no-wrong-answers">
                      Congratulations! You answered all questions correctly.
                    </div>
                  ) : (
                    wrongAnswers.map((item, index) => (
                      <div key={index} className="wrong-answer-item">
                        <div className="question-number">Question {item.questionNumber}:</div>
                        <div className="question-text">{item.question}</div>
                        <div className="answer-container">
                          <div className="user-answer">
                            <span className="label">Your Answer:</span>
                            <span className="answer-text">{item.userAnswer}</span>
                          </div>
                          <div className="correct-answer">
                            <span className="label">Correct Answer:</span>
                            <span className="answer-text">{item.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="modal-footer">
                  <button className="close-button" onClick={() => setShowWrongAnswersModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
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
              your Quiz.
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
