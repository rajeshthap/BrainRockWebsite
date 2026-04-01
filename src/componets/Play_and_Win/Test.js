import React, { useState, useEffect, useContext, useRef } from "react";
import "../../assets/css/Test.css";
import axios from "axios";
import { useSearchParams, useNavigate,useLocation  } from "react-router-dom";
import FooterPage from "../footer/FooterPage";
import { Container } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Winner from "../../assets/images/result_img.jpg"
import Faild from "../../assets/images/result_img.jpg"

// Define the base URL for your API
const API_BASE_URL = "https://brainrock.in/brainrock/backend";

function Test() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlUserId = searchParams.get("user_id");
  const storageUserId = localStorage.getItem("test_user_id");
  const userId = urlUserId || storageUserId;
  const navigate = useNavigate();
  
  // Always prioritize URL user_id as the "latest" and sync to storage
  useEffect(() => {
    if (urlUserId && urlUserId !== storageUserId) {
      console.log("New User ID detected from URL, resetting test state");
      clearTestState();
      localStorage.setItem("test_user_id", urlUserId);
    }
  }, [urlUserId, storageUserId]);

  // Check if this is a fresh login (user just logged in)
  const isFreshLogin = localStorage.getItem("fresh_login") === "true";
  
  // Clear test state if it's a fresh login
  useEffect(() => {
    if (isFreshLogin) {
      console.log("Fresh login detected - clearing test state");
      // Clear all test-related state from localStorage
      localStorage.removeItem("test_currentQuestion");
      localStorage.removeItem("test_score");
      localStorage.removeItem("test_showResults");
      localStorage.removeItem("test_userAnswers");
      localStorage.removeItem("test_timeLeft");
      localStorage.removeItem("test_testResult");
      localStorage.removeItem("test_tabSwitchWarning");
      localStorage.removeItem("test_tabSwitchCount");
      localStorage.removeItem("test_showWinnerForm");
      localStorage.removeItem("test_showWrongAnswersModal");
      localStorage.removeItem("test_wrongAnswers");
      localStorage.removeItem("test_certificateUrl");
      localStorage.removeItem("test_showInstructionsModal");
      
      // Clear the fresh login flag
      localStorage.removeItem("fresh_login");
    }
  }, [isFreshLogin]);
  
  console.log("Test component - User ID from URL:", urlUserId);
  console.log("Test component - User ID from localStorage:", storageUserId);
  console.log("Test component - Fresh login:", isFreshLogin);
  
  // Check for payment success parameters in URL
  const paymentSuccess = searchParams.get("payment_success");
  const paymentMethod = searchParams.get("payment_method");
  
  // Check if user came from payment - restore session if needed
  useEffect(() => {
    if (paymentSuccess === "true") {
      // User returned from payment - ensure test session is restored
      const testUserId = localStorage.getItem("test_user_id") || urlUserId;
      const testSource = localStorage.getItem("test_source");
      const testUserPhone = localStorage.getItem("test_user_phone");
      
      // If we have test data, always set the session marker for new users
      if (testUserId) {
        // Mark that user is in a payment-completed test session
        localStorage.setItem("BR_IN_TEST_SESSION", "1");
        console.log("Test session restored from payment redirect");
      }
      
      console.log("Payment success detected, test user ID:", testUserId);
      console.log("Test source:", testSource);
    }
  }, [paymentSuccess, urlUserId]);
  
  // If payment was successful and we have user_id, proceed
  if (paymentSuccess === "true" && userId) {
    console.log("Test component - Payment successful via:", paymentMethod);
  }

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return 0;
    const saved = localStorage.getItem("test_currentQuestion");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [score, setScore] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return 0;
    const saved = localStorage.getItem("test_score");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showResults, setShowResults] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return false;
    const saved = localStorage.getItem("test_showResults");
    return saved === "true";
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return [];
    const saved = localStorage.getItem("test_userAnswers");
    return saved ? JSON.parse(saved) : [];
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return 15;
    const saved = localStorage.getItem("test_timeLeft");
    return saved ? parseInt(saved, 10) : 15;
  });
  const [testResult, setTestResult] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return null;
    const saved = localStorage.getItem("test_testResult");
    return saved ? JSON.parse(saved) : null;
  });
  const [tabSwitchWarning, setTabSwitchWarning] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return false;
    const saved = localStorage.getItem("test_tabSwitchWarning");
    return saved === "true";
  });
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return 0;
    const saved = localStorage.getItem("test_tabSwitchCount");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [animateScore, setAnimateScore] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return false;
    const saved = localStorage.getItem("test_showWinnerForm");
    return saved === "true";
  });
  const [winnerFormData, setWinnerFormData] = useState({
    phone: localStorage.getItem("test_user_phone") || "",
    password: "",
  });
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return false;
    const saved = localStorage.getItem("test_showWrongAnswersModal");
    return saved === "true";
  });
  const [wrongAnswers, setWrongAnswers] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return [];
    const saved = localStorage.getItem("test_wrongAnswers");
    return saved ? JSON.parse(saved) : [];
  });
  const [certificateUrl, setCertificateUrl] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return null;
    const saved = localStorage.getItem("test_certificateUrl");
    return saved || null;
  });
  const [showInstructionsModal, setShowInstructionsModal] = useState(() => {
    // Don't restore state if it's a fresh login
    if (isFreshLogin) return true;
    const saved = localStorage.getItem("test_showInstructionsModal");
    return saved === "true" || saved === null;
  });

  // State for tracking remaining attempts for KheloJito users
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [isRetakeMode, setIsRetakeMode] = useState(false);

  useEffect(() => {
    // Disable back button by preventing default behavior
    const preventBack = (e) => {
      // Always prevent default and push state to stay on current page
      e.preventDefault();
      // Push a new state to prevent going back
      window.history.pushState(null, window.location.href);
    };
    // Push current state first to ensure we have a state to go back to
    window.history.pushState(null, window.location.href);

    // Handle popstate event (when back button is clicked)
    window.addEventListener('popstate', preventBack);
    // Also prevent hash changes
    const preventHashChange = (e) => {
      e.preventDefault();
      window.history.pushState(null, window.location.href);
    };
    window.addEventListener('hashchange', preventHashChange);

    return () => {
      window.removeEventListener('popstate', preventBack);
      window.removeEventListener('hashchange', preventHashChange);
    };
  }, []);

  // Initialize remaining attempts from localStorage on component mount
  useEffect(() => {
    const testSource = localStorage.getItem("test_source");
    let storedAttempts = localStorage.getItem("khelojito_remaining_attempts");
    
    // Only KheloJito users get retake attempts (not UserDashBoard users)
    if (testSource === "khelojito") {
      // If this is the first time coming from KheloJito after payment,
      // set remaining attempts to 2 (allowing 3 total attempts)
      if (!storedAttempts) {
        localStorage.setItem("khelojito_remaining_attempts", "2");
        storedAttempts = "2";
        console.log("First time from KheloJito - set remaining attempts to 2");
      }
      const attempts = parseInt(storedAttempts, 10);
      setRemainingAttempts(attempts);
      console.log("KheloJito user detected. Remaining attempts:", attempts);
    }
  }, []);

  // Save state to localStorage whenever it changes (only if not fresh login)
  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_currentQuestion", currentQuestion.toString());
    }
  }, [currentQuestion, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_score", score.toString());
    }
  }, [score, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_showResults", showResults.toString());
    }
  }, [showResults, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_userAnswers", JSON.stringify(userAnswers));
    }
  }, [userAnswers, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_timeLeft", timeLeft.toString());
    }
  }, [timeLeft, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_testResult", JSON.stringify(testResult));
    }
  }, [testResult, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_tabSwitchWarning", tabSwitchWarning.toString());
    }
  }, [tabSwitchWarning, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_tabSwitchCount", tabSwitchCount.toString());
    }
  }, [tabSwitchCount, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_showWinnerForm", showWinnerForm.toString());
    }
  }, [showWinnerForm, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_showWrongAnswersModal", showWrongAnswersModal.toString());
    }
  }, [showWrongAnswersModal, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_wrongAnswers", JSON.stringify(wrongAnswers));
    }
  }, [wrongAnswers, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin && certificateUrl) {
      localStorage.setItem("test_certificateUrl", certificateUrl);
    }
  }, [certificateUrl, isFreshLogin]);

  useEffect(() => {
    if (!isFreshLogin) {
      localStorage.setItem("test_showInstructionsModal", showInstructionsModal.toString());
    }
  }, [showInstructionsModal, isFreshLogin]);

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
          return 15; // Reset timer for next question
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length]);

  // Reset timer only when current question changes (not on initial load)
  const prevQuestionRef = useRef(currentQuestion);
  useEffect(() => {
    // Only reset timer if question actually changed (not on initial load)
    if (prevQuestionRef.current !== currentQuestion) {
      setTimeLeft(15);
      prevQuestionRef.current = currentQuestion;
    }
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
          
          // Clear test state from localStorage
          clearTestState();
          
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

  // Function to clear test state from localStorage
  const clearTestState = () => {
    localStorage.removeItem("test_currentQuestion");
    localStorage.removeItem("test_score");
    localStorage.removeItem("test_showResults");
    localStorage.removeItem("test_userAnswers");
    localStorage.removeItem("test_timeLeft");
    localStorage.removeItem("test_testResult");
    localStorage.removeItem("test_tabSwitchWarning");
    localStorage.removeItem("test_tabSwitchCount");
    localStorage.removeItem("test_showWinnerForm");
    localStorage.removeItem("test_showWrongAnswersModal");
    localStorage.removeItem("test_wrongAnswers");
    localStorage.removeItem("test_certificateUrl");
    localStorage.removeItem("test_showInstructionsModal");
  };

  // Function to fetch new questions for retake attempts
  const fetchNewQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        // Reset all test state for new attempt
        setQuestions(response.data.questions);
        setAttemptId(response.data.attempt_id);
        setCurrentQuestion(0);
        setUserAnswers([]);
        setTimeLeft(15); 
        setShowResults(false);
        setScore(0);
        setRemainingAttempts((prev) => prev - 1);
        
        console.log("New questions fetched successfully. Attempt ID:", response.data.attempt_id);
      } else {
        throw new Error(response.data.message || "Failed to fetch new questions");
      }
    } catch (err) {
      let errorMessage = "Failed to start new attempt";
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    // Get test source from localStorage
    const testSource = localStorage.getItem("test_source");
    const currentAttempts = parseInt(localStorage.getItem("khelojito_remaining_attempts") || "0", 10);
    
    // For KheloJito users only, check if they have remaining attempts
    // (UserDashBoard users get only 1 attempt)
    if (testSource === "khelojito" && currentAttempts > 0) {
      // Decrease remaining attempts in localStorage
      const newAttempts = currentAttempts - 1;
      localStorage.setItem("khelojito_remaining_attempts", newAttempts.toString());
      
      console.log("Retaking test. Remaining attempts:", newAttempts);
      
      // Clear test state from localStorage for new attempt
      clearTestState();
      
      // Fetch new questions without reloading the page
      await fetchNewQuestions();
    } else {
      // Clear localStorage
      localStorage.removeItem("test_user_id");
      localStorage.removeItem("khelojito_remaining_attempts");
      
      // Clear test state from localStorage
      clearTestState();
      
      // Redirect based on user authorization
      if (user && user.unique_id) {
        // Authorized user - redirect to user dashboard
        navigate("/UserDashBoard");
      } else {
        // Unauthorized user - redirect to KheloJito for re-registration
        navigate("/KheloJito");
      }
    }
  };

  // Function to find and display wrong answers
  const handleShowWrongAnswers = () => {
    const wrong = [];
    userAnswers.forEach((answer, index) => {
      if (answer.selected_option !== questions[index].correct_answer) {
        wrong.push({
          question: questions[index].question_text,
          question_hindi_text: questions[index].question_hindi_text || "",
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
      
      // Clear test state from localStorage
      clearTestState();
      
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

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Submit Details
                </button>
                <button type="button" className="cancel-button" onClick={() => {
                  setShowWinnerForm(false);
                  
                  // Clear test state from localStorage
                  clearTestState();
                  
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
                    <div className="d-flex flex-column align-items-center">
                      {/* Show remaining attempts info for KheloJito users */}
                      {remainingAttempts > 0 ? (
                        <div className="remaining-attempts-info mb-2">
                          <span className="badge bg-info">
                            You have {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                          </span>
                        </div>
                      ) : (
                        localStorage.getItem("test_source") === "khelojito" && (
                          <div className="remaining-attempts-info mb-2">
                            <span className="badge bg-warning">
                              No attempts remaining. Register again to try more.
                            </span>
                          </div>
                        )
                      )}
                      <div className="d-flex-file">
                        <button className="restart-button" onClick={handleRestart}>
                          {remainingAttempts > 0 
                            ? `Retake Quiz (${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} left)` 
                            : "Retake Quiz"}
                        </button>
                        <button className="wrong-answers-button" onClick={handleShowWrongAnswers}>
                          Wrong Answers
                        </button>
                      </div>
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
                        {item.question_hindi_text && (
                          <div className="hindi-question mt-1">
                            <small className="text-muted">{item.question_hindi_text}</small>
                          </div>
                        )}
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
            {questions[currentQuestion].question_hindi_text && (
              <div className="hindi-question mt-2">
                <small className="text-muted">
                  {questions[currentQuestion].question_hindi_text}
                </small>
              </div>
            )}
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