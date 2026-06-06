import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import "../../assets/css/Test.css";
import FooterPage from "../footer/FooterPage";
import axios from "axios";

const API_BASE_URL = "https://brainrock.in/brainrock/backend";

function CoursesTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseData = location?.state?.courseData || null;
  const courseIdRef = useRef(location?.state?.courseId || null);
  const courseDataRef = useRef(courseData);
  const urlUserId = searchParams.get("user_id");
  const urlCourseId = searchParams.get("course_id");

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = localStorage.getItem("test_currentQuestion");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem("test_score");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showResults, setShowResults] = useState(() => {
    const saved = localStorage.getItem("test_showResults");
    return saved === "true";
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState(() => {
    const saved = localStorage.getItem("test_userAnswers");
    return saved ? JSON.parse(saved) : [];
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("test_timeLeft");
    return saved ? parseInt(saved, 10) : 15;
  });
  const [testResult, setTestResult] = useState(() => {
    const saved = localStorage.getItem("test_testResult");
    return saved ? JSON.parse(saved) : null;
  });
  const [tabSwitchWarning, setTabSwitchWarning] = useState(() => {
    const saved = localStorage.getItem("test_tabSwitchWarning");
    return saved === "true";
  });
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    const saved = localStorage.getItem("test_tabSwitchCount");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(() => {
    const saved = localStorage.getItem("test_showWrongAnswersModal");
    return saved === "true";
  });
  const [wrongAnswers, setWrongAnswers] = useState(() => {
    const saved = localStorage.getItem("test_wrongAnswers");
    return saved ? JSON.parse(saved) : [];
  });
  const [certificateUrl, setCertificateUrl] = useState(() => {
    const saved = localStorage.getItem("test_certificateUrl");
    return saved || null;
  });

  const prevQuestionRef = useRef(currentQuestion);

  useEffect(() => {
    const storedCourseData = localStorage.getItem("test_courseData");
    const storedCourseId = localStorage.getItem("test_courseId");
    const storedUserId = localStorage.getItem("test_user_id");

    if (storedCourseData && !courseData) {
      try {
        const parsed = JSON.parse(storedCourseData);
        courseDataRef.current = parsed;
      } catch (e) {
        console.error("Failed to parse stored courseData");
      }
    }

    if (storedCourseId && !location?.state?.courseId) {
      courseIdRef.current = storedCourseId;
    }

    if (urlCourseId && !courseIdRef.current) {
      courseIdRef.current = urlCourseId;
    }

    if (urlUserId && !storedUserId) {
      localStorage.setItem("test_user_id", urlUserId);
    }

    if (!courseIdRef.current) {
      navigate("/Courses");
      return;
    }
    startTest();
  }, [location?.state, navigate, urlUserId, urlCourseId]);

  useEffect(() => {
    if (prevQuestionRef.current !== currentQuestion) {
      setTimeLeft(15);
      prevQuestionRef.current = currentQuestion;
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (loading || showResults || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleNextQuestion();
          return 15;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !loading && !showResults) {
        setTabSwitchCount((prevCount) => {
          const newCount = prevCount + 1;
          if (newCount === 1) {
            setTabSwitchWarning(true);
          } else if (newCount === 2) {
            setShowResults(true);
            setScore(0);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loading, showResults]);

  useEffect(() => {
    if (!showResults) {
      localStorage.setItem("test_currentQuestion", currentQuestion.toString());
      localStorage.setItem("test_score", score.toString());
      localStorage.setItem("test_showResults", showResults.toString());
      localStorage.setItem("test_userAnswers", JSON.stringify(userAnswers));
      localStorage.setItem("test_timeLeft", timeLeft.toString());
      localStorage.setItem(
        "test_tabSwitchWarning",
        tabSwitchWarning.toString(),
      );
      localStorage.setItem("test_tabSwitchCount", tabSwitchCount.toString());
      localStorage.setItem(
        "test_showWrongAnswersModal",
        showWrongAnswersModal.toString(),
      );
      localStorage.setItem("test_wrongAnswers", JSON.stringify(wrongAnswers));
      if (certificateUrl)
        localStorage.setItem("test_certificateUrl", certificateUrl);
      if (testResult)
        localStorage.setItem("test_testResult", JSON.stringify(testResult));
    }
  }, [
    currentQuestion,
    score,
    showResults,
    userAnswers,
    timeLeft,
    tabSwitchWarning,
    tabSwitchCount,
    showWrongAnswersModal,
    wrongAnswers,
    certificateUrl,
    testResult,
  ]);

  const startTest = async () => {
    try {
      const userId =
        localStorage.getItem("test_user_id") || searchParams.get("user_id");
      if (!userId) {
        setError("User ID not found. Please register first.");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/start-test/`, {
        user_id: userId,
        course_id: courseIdRef.current,
      });

      if (
        response.data.status &&
        response.data.questions &&
        Array.isArray(response.data.questions)
      ) {
        setQuestions(response.data.questions);
        setAttemptId(response.data.attempt_id);
      } else {
        setError(
          response.data.message ||
            "Failed to start test - Invalid response format",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to start test. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    const newAnswers = [
      ...userAnswers,
      {
        question_id: questions[currentQuestion].id,
        selected_option: selectedOption,
      },
    ];
    setUserAnswers(newAnswers);

    if (selectedOption === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
    } else {
      submitTest(newAnswers);
    }
  };

  const submitTest = async (answers) => {
    try {
      const userId =
        localStorage.getItem("test_user_id") || searchParams.get("user_id");
      const response = await axios.post(`${API_BASE_URL}/api/submit-test/`, {
        user_id: userId,
        answers: answers,
      });

      console.log("Test submission successful:", response.data);
      setTestResult(response.data);

      if (response.data.certificate) {
        const certificatePath = response.data.certificate.startsWith("http")
          ? response.data.certificate
          : `${API_BASE_URL}${response.data.certificate}`;
        setCertificateUrl(certificatePath);
      }

      setShowResults(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message);
    }
  };

  const handleShowWrongAnswers = () => {
    const wrong = [];
    userAnswers.forEach((answer, index) => {
      if (answer.selected_option !== questions[index].correct_answer) {
        wrong.push({
          question: questions[index].question_text,
          question_hindi_text: questions[index].question_hindi_text || "",
          userAnswer: questions[index].options[answer.selected_option],
          correctAnswer:
            questions[index].options[questions[index].correct_answer],
          questionNumber: index + 1,
        });
      }
    });
    setWrongAnswers(wrong);
    setShowWrongAnswersModal(true);
  };

  const shareOnWhatsApp = (percent) => {
    const text = `I passed the BrainRock quiz with ${percent}% score! Check out my certificate: ${certificateUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnLinkedIn = (percent) => {
    const text = `I passed the BrainRock quiz with ${percent}% score! Check out my certificate: ${certificateUrl}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&title=BrainRock Certificate&summary=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

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
    localStorage.removeItem("test_courseData");
    localStorage.removeItem("test_courseId");
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
          <div className="error"> {error}</div>
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
    const percentage = Math.round(
      ((testResult?.score || score) / questions.length) * 100,
    );
    const isPassed = testResult
      ? testResult.status === "passed"
      : percentage === 100;

    return (
      <>
        <div className="test-container">
          <div className="test-card results-card">
            <div className="results-content">
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

                    <div className="social-sharing">
                      <div className="sharing-title">
                        Share your certificate:
                      </div>
                      <div className="sharing-buttons">
                        <button
                          className="share-button whatsapp"
                          onClick={() => shareOnWhatsApp(percentage)}
                          title="Share on WhatsApp"
                        >
                          WhatsApp
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
                <div className="results-image">
                  <div className="no-certificate">
                    <h3>
                      {isPassed
                        ? "Certificate Coming Soon"
                        : "Try Again to Get Certificate"}
                    </h3>
                    <p>
                      {isPassed
                        ? "Your certificate will be available shortly"
                        : "Score 80% to earn a certificate"}
                    </p>
                  </div>
                </div>
              )}

              <div className="results-data">
                <div className="results-header">
                  <h1 className="results-title">
                    {isPassed ? "Congratulations!" : "Better Luck Next Time"}
                  </h1>
                  <p className="results-subtitle">
                    {isPassed
                      ? "You have successfully passed the Quiz"
                      : "Keep practicing to improve your score"}
                  </p>
                </div>

                <div className="score-section">
                  <div className="percentage-circle">
                    <div className="percentage-text">{percentage}%</div>
                    <div className="score-label">Overall Score</div>
                  </div>

                  <div className="score-details">
                    <div className="score-item correct">
                      <div className="score-value">
                        {testResult?.score || score}
                      </div>
                      <div className="score-label">Correct</div>
                    </div>
                    <div className="score-item incorrect">
                      <div className="score-value">
                        {questions.length - (testResult?.score || score)}
                      </div>
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
                    <button
                      className="continue-button"
                      onClick={() => navigate("/Courses")}
                    >
                      Back to Courses
                    </button>
                  ) : (
                    <div className="d-flex flex-column align-items-center">
                      <div className="d-flex-file">
<button
                           className="restart-button"
                           onClick={() => {
                             clearTestState();
                             navigate("/RegisFee", { state: { courseId: courseIdRef.current } } );
                           }}
                         >
                          Retake Quiz
                         </button>
                        <button
                          className="wrong-answers-button"
                          onClick={handleShowWrongAnswers}
                        >
                          Wrong Answers
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showWrongAnswersModal && (
              <div className="wrong-answers-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Wrong Answers ({wrongAnswers.length})</h2>
                    <button
                      className="close-button"
                      onClick={() => setShowWrongAnswersModal(false)}
                    >
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
                          <div className="question-number">
                            Question {item.questionNumber}:
                          </div>
                          <div className="question-text">{item.question}</div>
                          {item.question_hindi_text && (
                            <div className="hindi-question mt-1">
                              <small className="text-muted">
                                {item.question_hindi_text}
                              </small>
                            </div>
                          )}
                          <div className="answer-container">
                            <div className="user-answer">
                              <span className="label">Your Answer:</span>
                              <span className="answer-text">
                                {item.userAnswer}
                              </span>
                            </div>
                            <div className="correct-answer">
                              <span className="label">Correct Answer:</span>
                              <span className="answer-text">
                                {item.correctAnswer}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="close-button"
                      onClick={() => setShowWrongAnswersModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="test-container">
      <div className="test-card">
        {tabSwitchWarning && (
          <div className="warning-message">
            Warning: You have switched tabs once. Switching again will end your
            Quiz.
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

        <div className="question-number d-flex justify-content-between align-items-center">
          Question {currentQuestion + 1} of {questions.length}
          <div className="timer">Time Left: {timeLeft} seconds</div>
        </div>

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
              {questions[currentQuestion].options_hindi &&
                questions[currentQuestion].options_hindi[index] && (
                  <div
                    className="text-muted"
                    style={{ fontSize: "0.85em", marginTop: "2px" }}
                  >
                    {questions[currentQuestion].options_hindi[index]}
                  </div>
                )}
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
  );
}

export default CoursesTest;
