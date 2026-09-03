import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  ProgressBar,
  Modal,
  Card,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { Link } from "react-router-dom";
import "../assets/css/InterviewTest.css";

const api = axios.create({
  baseURL: "https://brainrock.in/brainrock/backend/api/",
  withCredentials: true,
});

const API_START =
  "https://brainrock.in/brainrock/backend/api/start-candidate-interview-test/";

const InterviewTest = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [candidateId, setCandidateId] = useState("");
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  // Auto-fill candidate ID from logged-in user's unique_id
  useEffect(() => {
    if (user?.unique_id) {
      setCandidateId(user.unique_id);
    }
  }, [user]);

  // Derived values
  const questions = testData?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  // Warn when user tries to leave the page/tab while test is active
  useEffect(() => {
    if (!testData) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [testData]);

  // Countdown timer per question — auto-advance when time runs out
  useEffect(() => {
    if (!testData || !currentQuestion) return;
    if (timeLeft <= 0) {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(30);
      } else {
        setShowSubmitModal(true);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, currentIndex, testData, currentQuestion, totalQuestions]);

  const handleStartTest = async () => {
    if (!candidateId.trim()) {
      setErrorMsg("Candidate ID not found. Please log in again.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setResultMsg("");
    try {
      const res = await api.post(API_START, { candidate_id: candidateId.trim() });
      if (res.data && res.data.success) {
        setTestData(res.data);
        setCurrentIndex(0);
        setAnswers({});
        setTimeLeft(30);
      } else {
        setErrorMsg(res.data?.message || "Failed to start test");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Failed to start the test. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qid, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIdx }));
  };

  const goToQuestion = (idx) => {
    if (idx >= 0 && idx < totalQuestions) {
      setCurrentIndex(idx);
      setTimeLeft(30);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextClick = () => {
    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      if (window.confirm("You are on the last question. Do you want to submit the test?")) {
        handleSubmitTest();
      }
    }
  };

  const handleSubmitTest = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    setResultMsg("");
    try {
      const formattedAnswers = Object.keys(answers).map((qid) => ({
        question_id: Number(qid),
        selected: Number(answers[qid]),
      }));
      const payload = {
        test_id: testData?.test_id,
        answers: formattedAnswers,
      };
      const res = await api.post(
        "https://brainrock.in/brainrock/backend/api/submit-candidate-interview-test/",
        payload
      );
      if (res.data && (res.data.success || res.data.score !== undefined)) {
        setResultMsg(
          `You scored ${res.data.score ?? 0} out of ${
            res.data.total_marks ?? totalQuestions
          } (${res.data.percentage ?? 0}%).`
        );
        setShowResultModal(true);
      } else {
        setResultMsg(res.data?.message || "Test submitted.");
        setShowResultModal(true);
      }
    } catch (err) {
      setResultMsg(
        err.response?.data?.message || "Test submission failed. Please try again."
      );
      setShowResultModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetTest = () => {
    setTestData(null);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(30);
    setResultMsg("");
  };

  return (
    <>
      {/* Banner */}
      <div className="interview-test-banner">
        <div className="p-2 interview-style">
          <h2 className="breadcrumb-title">Candidate Interview Test</h2>
        
        </div>
      </div>

      <div className="interview-test-section">
        <Container>
          {errorMsg && (
            <Alert variant="danger" dismissible onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          )}

          {/* ===== START SCREEN ===== */}
          {!testData && (
            <Row className="justify-content-center">
              <Col xs={12} md={8} lg={6}>
                <Card className="interview-start-card shadow-sm">
                  <Card.Body className="p-4 p-md-5">
                    <div className="text-center mb-4">
                      <div className="interview-icon-wrap">
                        <i className="bi bi-person-badge"></i>
                      </div>
                      <h3 className="mt-3 mb-2">Candidate Interview Test</h3>
                      <p className="text-muted mb-0">
                        Welcome{user?.full_name ? `, ${user.full_name}` : ""}!
                        Click the button below to start your interview test.
                      </p>
                    </div>

                    <div className="candidate-id-box mb-3">
                      <div className="text-muted small mb-1">Candidate ID</div>
                      <div className="candidate-id-value">
                        {candidateId || "Loading..."}
                      </div>
                    </div>

                    <div className="d-grid">
                      <Button
                        onClick={handleStartTest}
                        variant="primary"
                        size="lg"
                        disabled={loading || !candidateId}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Starting Test...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-play-circle me-2"></i>
                            Start Test
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-4 text-center text-muted small">
                      <i className="bi bi-shield-check me-1"></i>
                      Your responses are private and securely submitted.
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* ===== QUIZ SCREEN ===== */}
          {testData && currentQuestion && (
            <>
              {/* Header / Progress */}
              <div className="interview-test-header mb-3">
                <Row className="align-items-center g-2">
                  <Col xs={12} md={5}>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <Badge bg="primary" pill>
                        {testData.candidate_id}
                      </Badge>
                      
                    </div>
                    <div className="mt-1 small text-muted">
                      Question {currentIndex + 1} of {totalQuestions}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="interview-progress-wrap">
                      <ProgressBar
                        now={progress}
                        label={`${progress}%`}
                        variant={progress === 100 ? "success" : "info"}
                      />
                      <div className="small text-muted mt-1">
                        Answered {answeredCount} / {totalQuestions}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="text-md-end">
                    <Button
                      variant="success"
                      onClick={() => setShowSubmitModal(true)}
                      disabled={submitting || answeredCount === 0}
                      className="w-100 w-md-auto"
                    >
                      <i className="bi bi-check2-circle me-1"></i>
                      Submit Test
                    </Button>
                  </Col>
                </Row>
              </div>

              <Row>
                {/* Question Panel */}
                <Col xs={12} lg={8}>
                  <Card className="interview-question-card shadow-sm">
                    <Card.Body className="p-3 p-md-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg="info" pill>
                          {currentQuestion.category}
                        </Badge>
                        <Badge bg="secondary" pill>
                          {currentQuestion.marks} mark
                          {currentQuestion.marks > 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <h5 className="interview-question-text mb-4">
                        Q{currentIndex + 1}. {currentQuestion.question_text}
                      </h5>

                      <div className="interview-timer danger">
                        <i className="bi bi-clock me-2"></i>
                        Time Left: <strong>{timeLeft}s</strong>
                      </div>

                      <div className="interview-options">
                        {currentQuestion.options.map((opt, idx) => {
                          const selected =
                            answers[currentQuestion.id] === idx;
                          return (
                            <label
                              key={idx}
                              className={`interview-option ${
                                selected ? "selected" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${currentQuestion.id}`}
                                checked={selected}
                                onChange={() =>
                                  handleOptionSelect(currentQuestion.id, idx)
                                }
                              />
                              <span className="option-letter">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="option-text">{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <Button
                          variant={currentIndex < totalQuestions - 1 ? "primary" : "success"}
                          onClick={handleNextClick}
                        >
                          {currentIndex < totalQuestions - 1 ? (
                            <>Next <i className="bi bi-chevron-right ms-1"></i></>
                          ) : (
                            <>Submit <i className="bi bi-check2-circle ms-1"></i></>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Navigator Panel */}
                <Col xs={12} lg={4}>
                  <Card className="interview-nav-card shadow-sm">
                    <Card.Body className="p-3 p-md-4">
                      <h6 className="mb-3">Question Navigator</h6>
                      <div className="interview-nav-grid">
                        {questions.map((q, idx) => {
                          const answered = answers[q.id] !== undefined;
                          const active = idx === currentIndex;
                          return (
                            <button
                              type="button"
                              key={q.id}
                              className={`interview-nav-btn ${
                                active ? "active" : ""
                              } ${answered ? "answered" : ""}`}
                              onClick={answered ? undefined : () => goToQuestion(idx)}
                              disabled={answered}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 small">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="legend-box answered"></span>
                          <span>Answered</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="legend-box"></span>
                          <span>Not answered</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>

      {/* Submit Confirm Modal */}
      <Modal
        show={showSubmitModal}
        onHide={() => setShowSubmitModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Test?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You have answered <strong>{answeredCount}</strong> out of{" "}
          <strong>{totalQuestions}</strong> questions. Are you sure you want to
          submit?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSubmitModal(false)}
            disabled={submitting}
          >
            Continue Test
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitTest}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Submitting...
              </>
            ) : (
              "Yes, Submit"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Result Modal */}
      <Modal
        show={showResultModal}
        onHide={() => setShowResultModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Test Completed</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="result-icon mb-3">
            <i className="bi bi-trophy"></i>
          </div>
          <h5>{resultMsg || "Your test has been submitted successfully."}</h5>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InterviewTest;