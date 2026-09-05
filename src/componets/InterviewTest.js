import React, { useState, useContext, useEffect, useRef } from "react";
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
const API_SUBMIT =
  "https://brainrock.in/brainrock/backend/api/submit-candidate-interview-test/";

const InterviewTest = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [candidateId, setCandidateId] = useState("");
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [documents, setDocuments] = useState({
    identity_docs: null,
    edu_certificate: null,
    experience: null,
  });
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState("");
  const [docSubmitted, setDocSubmitted] = useState(false);
  const [docSuccess, setDocSuccess] = useState("");
  const [existingDocs, setExistingDocs] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Refs for tab/switch detection - using refs to avoid stale closures
  const violationCountRef = useRef(0);
  const isAutoSubmittingRef = useRef(false);
  const lastViolationTimeRef = useRef(0);
  const submitTestRef = useRef(null);
  const answersRef = useRef({});
  const testDataRef = useRef(null);
  const pendingViolationRef = useRef(false);
  const blurTimeRef = useRef(0);
  const warningShownRef = useRef(false);
  const totalQuestionsRef = useRef(0);

  // Auto-fill candidate ID from logged-in user's unique_id
  useEffect(() => {
    if (user?.unique_id) {
      setCandidateId(user.unique_id);
    }
  }, [user]);

  // Fetch existing candidate documents
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!candidateId) return;
      try {
        const res = await api.get(`candidate/details/?candidate_id=${candidateId}`);
        if (res.data?.status && res.data?.data) {
          const docs = {
            identity_docs: res.data.data.identity_docs || null,
            edu_certificate: res.data.data.edu_certificate || null,
            experience: res.data.data.experience || null,
          };
          setExistingDocs(docs);
          const hasAllDocs = docs.identity_docs && docs.edu_certificate && docs.experience;
          if (hasAllDocs) {
            setDocSubmitted(true);
            setDocSuccess("You have submitted documents. Start your test.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch candidate details:", err);
      }
    };

    fetchCandidateDetails();
  }, [candidateId]);

  // Keep refs in sync with state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    testDataRef.current = testData;
    totalQuestionsRef.current = testData?.questions?.length || 0;
  }, [testData]);

  // Derived values
  const questions = testData?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  // ============================================================
  // TAB/WINDOW SWITCH DETECTION - Core Security Logic
  // ============================================================
  useEffect(() => {
    if (!testData) return;

    const DEBOUNCE_MS = 2000; // 2 seconds debounce to prevent rapid false triggers

    /**
     * Process a violation - either show warning or auto-submit
     */
    const processViolation = () => {
      const now = Date.now();
      // Debounce - ignore if last violation was too recent
      if (now - lastViolationTimeRef.current < DEBOUNCE_MS) return;
      lastViolationTimeRef.current = now;

      // Already auto-submitting, don't process again
      if (isAutoSubmittingRef.current) return;

      if (violationCountRef.current === 0) {
        // FIRST VIOLATION - Mark it but don't show warning yet
        // Warning will be shown when user returns to the tab
        violationCountRef.current = 1;
        setViolationCount(1);
        pendingViolationRef.current = true;
      } else {
        // SECOND VIOLATION - Auto submit immediately
        isAutoSubmittingRef.current = true;
        setAutoSubmitted(true);
        submitTestRef.current?.();
      }
    };

    /**
     * Show warning modal if needed (only when user is back on the tab)
     */
    const showWarningIfNeeded = () => {
      // Only show warning if:
      // 1. This is the first violation
      // 2. Not already auto-submitting
      // 3. Warning hasn't been shown for this violation yet
      if (
        violationCountRef.current === 1 &&
        !isAutoSubmittingRef.current &&
        !warningShownRef.current
      ) {
        warningShownRef.current = true;
        setShowSwitchWarning(true);
      }
    };

    /**
     * Handle tab visibility change (switching tabs)
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User switched AWAY from this tab
        processViolation();
      } else if (document.visibilityState === "visible") {
        // User came BACK to this tab
        if (pendingViolationRef.current) {
          pendingViolationRef.current = false;
          showWarningIfNeeded();
        }
      }
    };

    /**
     * Handle browser back/forward button
     */
    const handlePopState = () => {
      // Prevent actual navigation by pushing state back
      window.history.pushState(null, "", window.location.href);
      
      // Process violation
      processViolation();
      
      // Show warning immediately since we prevented navigation
      // (user is still on the page)
      if (pendingViolationRef.current) {
        pendingViolationRef.current = false;
        showWarningIfNeeded();
      }
    };

    /**
     * Handle window blur (opening new browser, switching apps, clicking address bar)
     */
    const handleWindowBlur = () => {
      blurTimeRef.current = Date.now();
    };

    /**
     * Handle window focus (user came back to the window)
     */
    const handleWindowFocus = () => {
      // Only process if:
      // 1. Visibility is still "visible" (not a full tab switch - that's handled by visibilitychange)
      // 2. Blur happened recently (user actually left and came back)
      if (document.visibilityState === "visible" && blurTimeRef.current > 0) {
        const blurDuration = Date.now() - blurTimeRef.current;
        blurTimeRef.current = 0;

        // If user was away for a noticeable time (more than 300ms)
        // This catches: opening new browser window, switching to another app, etc.
        if (blurDuration > 300) {
          processViolation();
          if (pendingViolationRef.current) {
            pendingViolationRef.current = false;
            showWarningIfNeeded();
          }
        }
      }
    };

    /**
     * Handle page unload/close (closing tab, closing browser, navigating away)
     */
    const handleBeforeUnload = (e) => {
      const hasAnswers = Object.keys(answersRef.current).length > 0;
      
      if (violationCountRef.current === 0) {
        // FIRST VIOLATION - Show browser's native warning dialog
        e.preventDefault();
        e.returnValue = "";
        // Mark as first violation
        violationCountRef.current = 1;
        setViolationCount(1);
      } else if (hasAnswers && !isAutoSubmittingRef.current) {
        // SECOND VIOLATION - Try to auto-submit before the page unloads
        isAutoSubmittingRef.current = true;
        setAutoSubmitted(true);
        
        // Use sendBeacon for reliable submission during page unload
        try {
          const formattedAnswers = Object.keys(answersRef.current).map((qid) => ({
            question_id: Number(qid),
            selected: Number(answersRef.current[qid]),
          }));
          const payload = {
            test_id: testDataRef.current?.test_id,
            answers: formattedAnswers,
          };
          const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
          });
          navigator.sendBeacon(API_SUBMIT, blob);
        } catch (err) {
          console.error("Auto-submit on unload failed:", err);
        }
        
        e.preventDefault();
        e.returnValue = "Your test has been auto-submitted.";
      }
    };

    /**
     * Handle mouse leaving the window (additional detection)
     */
    const handleMouseLeave = (e) => {
      // Only trigger if mouse leaves through top of window (common when switching)
      if (e.clientY <= 0 && document.visibilityState === "visible") {
        // Don't process immediately, just note the time
        // Actual processing happens in handleWindowBlur/Focus
      }
    };

    // Initialize history state to prevent back navigation
    window.history.pushState(null, "", window.location.href);

    // Add all event listeners
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup function - remove all listeners
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [testData]); // Only re-run when testData changes (test starts/ends)

  // Reset auto-submitting flag when submitting state changes to false
  useEffect(() => {
    if (!submitting) {
      isAutoSubmittingRef.current = false;
    }
  }, [submitting]);

  // Reset timer to 20s when a new test starts
  useEffect(() => {
    if (testData) {
      setTimeLeft(20);
    }
  }, [testData]);

  // Browser back-button logout confirmation
  useEffect(() => {
    if (!user) return;

    const handlePopState = (event) => {
      const confirmLogout = window.confirm("Are you sure you want to Logout?");
      if (confirmLogout) {
        if (logout) {
          logout({ redirect: true });
        }
      } else {
        event.preventDefault();
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user, logout]);

  // Countdown timer per question — auto-advance when time runs out
  useEffect(() => {
    if (!testData || !currentQuestion || submitting) return;
    if (timeLeft <= 0) {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(20);
      } else {
        setShowSubmitModal(true);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, currentIndex, testData, currentQuestion, totalQuestions, submitting]);

  const MAX_FILE_SIZE = 100 * 1024;

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        setDocError(`${name.replace(/_/g, " ")} must be under 100KB.`);
        return;
      }
      setDocuments((prev) => ({ ...prev, [name]: file }));
      setDocSubmitted(false);
    }
  };

  const handleDocSubmit = async () => {
    if (!documents.identity_docs || !documents.edu_certificate || !documents.experience) {
      setDocError("Please upload all required documents before submitting.");
      return;
    }

    setDocError("");
    setDocSuccess("");
    setDocUploading(true);
    try {
      const formData = new FormData();
      formData.append("candidate_id", candidateId.trim());
      if (documents.identity_docs) formData.append("identity_docs", documents.identity_docs);
      if (documents.edu_certificate) formData.append("edu_certificate", documents.edu_certificate);
      if (documents.experience) formData.append("experience", documents.experience);

      await api.put("candidate/documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocSubmitted(true);
      setDocSuccess("Documents submitted successfully. Start your test.");
      setExistingDocs({ ...existingDocs, identity_docs: true, edu_certificate: true, experience: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 405) {
        setDocError("Document upload is not available at this time. You may proceed to start the test.");
        setDocSubmitted(true);
        setDocSuccess("You may proceed to start your test.");
      } else {
        setDocError(
          err.response?.data?.message ||
            "Failed to upload documents. Please try again."
        );
      }
    } finally {
      setDocUploading(false);
    }
  };

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
        setTimeLeft(20);
        violationCountRef.current = 0;
        lastViolationTimeRef.current = 0;
        warningShownRef.current = false;
        pendingViolationRef.current = false;
        isAutoSubmittingRef.current = false;
        setViolationCount(0);
        setAutoSubmitted(false);
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
    if (submitting) return;
    setAnswers((prev) => ({ ...prev, [qid]: optionIdx }));
  };

  const goToQuestion = (idx) => {
    if (submitting) return;
    if (idx >= 0 && idx < totalQuestions) {
      setCurrentIndex(idx);
      setTimeLeft(20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextClick = () => {
    if (submitting) return;
    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      if (
        window.confirm(
          "You are on the last question. Do you want to submit the test?"
        )
      ) {
        handleSubmitTest();
      }
    }
  };

  const handleSubmitTest = async () => {
    setShowSubmitModal(false);
    setShowSwitchWarning(false);
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
      const res = await api.post(API_SUBMIT, payload);
      if (res.data && (res.data.success || res.data.score !== undefined)) {
        setResultMsg(
          `You scored ${res.data.score ?? 0} out of ${
            res.data.total_marks ?? totalQuestions
          } (${res.data.percentage ?? 0}%).`
        );
      } else {
        setResultMsg(res.data?.message || "Test submitted successfully.");
      }
      setShowResultModal(true);
    } catch (err) {
      setResultMsg(
        err.response?.data?.message ||
          "Test submission failed. Please try again."
      );
      setShowResultModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Keep submitTestRef updated with latest handleSubmitTest
  submitTestRef.current = handleSubmitTest;

  const resetTest = () => {
    setTestData(null);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(20);
    setResultMsg("");
    violationCountRef.current = 0;
    lastViolationTimeRef.current = 0;
    warningShownRef.current = false;
    pendingViolationRef.current = false;
    isAutoSubmittingRef.current = false;
    blurTimeRef.current = 0;
    setViolationCount(0);
    setAutoSubmitted(false);
    setShowSwitchWarning(false);
    setShowResultModal(false);
  };

  const getResultMessage = () => {
    if (!resultMsg) return "Your test has been submitted successfully.";
    const scoreMatch = resultMsg.match(/(\d+(?:\.\d+)?)%/);
    if (scoreMatch) {
      const percentage = parseFloat(scoreMatch[1]);
      if (percentage >= 70) {
        return `Congratulations! You are qualified. Our team will connect with you.`;
      }
    }
    return `You scored below the qualifying mark. Please try again.`;
  };

  const isQualified = () => {
    const scoreMatch = resultMsg.match(/(\d+(?:\.\d+)?)%/);
    if (scoreMatch) {
      return parseFloat(scoreMatch[1]) >= 70;
    }
    return false;
  };

  const hasExistingDocs = existingDocs?.identity_docs && existingDocs?.edu_certificate && existingDocs?.experience;

  return (
    <>
      {/* Banner */}
      <div className="interview-test-banner">
        <div className="p-2 interview-style">
          <h2 className="breadcrumb-title"> Interview Session Technical</h2>
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
                      <h3 className="mt-3 mb-2">Interview Session Technical</h3>
                      <p className="text-muted mb-0">
                        Welcome
                        {user?.full_name ? `, ${user.full_name}` : ""}! Click
                        the button below to start your interview test.
                      </p>
                    </div>

                    <div className="candidate-id-box mb-3">
                      <div className="text-muted small mb-1">Candidate ID</div>
                      <div className="candidate-id-value">
                        {candidateId || "Loading..."}
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="mb-4">
                      <h6 className="mb-3">
                        <i className="bi bi-file-earmark-arrow-up me-2"></i>
                        Upload Documents
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small text-muted">
                            Identity Document <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            name="identity_docs"
                            accept="application/pdf,image/*"
                            onChange={handleFileChange}
                          />
                          <div className={`form-text small ${documents.identity_docs ? "text-success" : "text-danger"}`}>
                            {documents.identity_docs
                              ? "Identity document uploaded successfully."
                              : "Upload a valid ID proof such as Aadhaar, PAN, Passport, or Driving License."}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">
                            Education Certificate <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            name="edu_certificate"
                            accept="application/pdf"
                            onChange={handleFileChange}
                          />
                          <div className={`form-text small ${documents.edu_certificate ? "text-success" : "text-danger"}`}>
                            {documents.edu_certificate
                              ? "Education certificate uploaded successfully."
                              : "Upload one PDF containing your education certificate(s). You may combine 10th, 12th, or any other education certificate into a single PDF."}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">
                            Experience Document <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            name="experience"
                            accept="application/pdf,image/*"
                            onChange={handleFileChange}
                          />
                          <div className={`form-text small ${documents.experience ? "text-success" : "text-danger"}`}>
                            {documents.experience
                              ? "Experience document uploaded successfully."
                              : "Upload one PDF or image containing your experience certificate or relevant work proof."}
                          </div>
                        </div>
                      </div>
                      {docError && (
                        <Alert variant="danger" className="mt-3 small">
                          {docError}
                        </Alert>
                      )}
                      {hasExistingDocs && (
                        <Alert variant="success" className="mt-3 small">
                          You have submitted documents. Start your test.
                        </Alert>
                      )}
                      {docSuccess && !hasExistingDocs && (
                        <Alert variant="success" className="mt-3 small">
                          {docSuccess}
                        </Alert>
                      )}
                    </div>

                    {/* Important Instructions */}
                    <div className="interview-instructions mb-4 p-3 bg-light rounded border">
                      <h6 className="mb-2">
                        <i className="bi bi-exclamation-triangle-fill text-warning me-1"></i>
                        Important Instructions
                      </h6>
                      <ul className="mb-0 small text-muted">
                        <li className="mb-1">
                          <strong>Do NOT</strong> switch tabs during the test.
                        </li>
                        <li className="mb-1">
                          <strong>Do NOT</strong> open new browser windows or
                          tabs.
                        </li>
                        <li className="mb-1">
                          <strong>Do NOT</strong> use the browser's back/forward
                          buttons.
                        </li>
                        <li className="mb-1">
                          <strong>Do NOT</strong> switch to another application
                          while test is running.
                        </li>
                        <li className="mb-1 text-danger">
                          <strong>1st violation:</strong> Warning will be shown.
                        </li>
                        <li className="text-danger">
                          <strong>2nd violation:</strong> Test will be{" "}
                          <strong>auto-submitted</strong> immediately.
                        </li>
                      </ul>
                    </div>

                    <div className="d-grid gap-2">
                      <Button
                        onClick={handleDocSubmit}
                        variant="outline-primary"
                        size="lg"
                        disabled={
                          docUploading ||
                          docSubmitted ||
                          (existingDocs?.identity_docs && existingDocs?.edu_certificate && existingDocs?.experience)
                        }
                      >
                        {docUploading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Uploading Documents...
                          </>
                        ) : docSubmitted ? (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Documents Submitted
                          </>
                        ) : (
                          <>
                            <i className="bi bi-file-earmark-arrow-up me-2"></i>
                            Submit Documents
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleStartTest}
                        variant="primary"
                        size="lg"
                        disabled={loading || !candidateId || (!docSubmitted && !(existingDocs?.identity_docs && existingDocs?.edu_certificate && existingDocs?.experience))}
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
              {/* Violation Warning Banner */}
              {violationCount > 0 && !autoSubmitted && (
                <Alert
                  variant="warning"
                  className="mb-3 d-flex align-items-center"
                >
                  <i
                    className="bi bi-exclamation-triangle-fill me-2"
                    style={{ fontSize: "1.2rem" }}
                  ></i>
                  <div>
                    <strong>Warning:</strong> You have{" "}
                    <strong>{2 - violationCount}</strong>{" "}
                    {2 - violationCount === 1 ? "warning" : "warnings"}{" "}
                    remaining. Next violation will auto-submit your test!
                  </div>
                </Alert>
              )}

              {/* Auto-submit notification */}
              {autoSubmitted && (
                <Alert variant="danger" className="mb-3">
                  <i className="bi bi-x-circle-fill me-2"></i>
                  <strong>Test Auto-Submitted:</strong> You violated the test
                  rules multiple times. Your test has been automatically
                  submitted.
                </Alert>
              )}

              {/* Header / Progress */}
              <div className="interview-test-header mb-3">
                <Row className="align-items-center g-2">
                  <Col xs={12} md={5}>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <Badge bg="primary" pill>
                        {testData.candidate_id}
                      </Badge>
                      {violationCount > 0 && (
                        <Badge bg="warning" text="dark" pill>
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {2 - violationCount}{" "}
                          {2 - violationCount === 1 ? "warning" : "warnings"}{" "}
                          left
                        </Badge>
                      )}
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

                      <div
                        className={`interview-timer ${
                          timeLeft <= 10 ? "danger" : ""
                        }`}
                      >
                        <i className="bi bi-clock me-2"></i>
                        Time Left: <strong>{timeLeft}s</strong>
                      </div>

                      <div className="interview-options">
                        {currentQuestion.options.map((opt, idx) => {
                          const selected = answers[currentQuestion.id] === idx;
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
                                disabled={submitting}
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
                          variant={
                            currentIndex < totalQuestions - 1
                              ? "primary"
                              : "success"
                          }
                          onClick={handleNextClick}
                          disabled={submitting}
                        >
                          {currentIndex < totalQuestions - 1 ? (
                            <>
                              Next <i className="bi bi-chevron-right ms-1"></i>
                            </>
                          ) : (
                            <>
                              Submit{" "}
                              <i className="bi bi-check2-circle ms-1"></i>
                            </>
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
                              onClick={() => goToQuestion(idx)}
                              disabled={submitting}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 small">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="legend-box current"></span>
                          <span>Current</span>
                        </div>
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
        onHide={() => !submitting && setShowSubmitModal(false)}
        centered
        backdrop="static"
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
        onHide={() => {
          setShowResultModal(false);
          navigate("/");
        }}
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
          <h5>{getResultMessage()}</h5>
          {resultMsg && (
            <p className="text-muted mt-2 small">
              {resultMsg}
            </p>
          )}
          {autoSubmitted && (
            <p className="text-muted mt-2 small">
              <i className="bi bi-info-circle me-1"></i>
              This test was auto-submitted due to multiple tab/window switch
              violations.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {isQualified() ? (
            <Button variant="primary" onClick={() => navigate("/")}>
              <i className="bi bi-house me-1"></i>
              Go to Home
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate("/Login")}>
              <i className="bi bi-box-arrow-left me-1"></i>
              Go to Login
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Switch/Leave Warning Modal - First Violation */}
      <Modal
        show={showSwitchWarning}
        onHide={() => setShowSwitchWarning(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-warning text-dark">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Warning - Tab/Window Switch Detected
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <i
              className="bi bi-shield-exclamation"
              style={{ fontSize: "4rem", color: "#ffc107" }}
            ></i>
          </div>
          <div className="alert alert-danger">
            <strong>⚠️ FIRST WARNING!</strong>
          </div>
          <p className="mb-2">
            You have switched away from the test window/tab. This is your{" "}
            <strong>first and only warning</strong>.
          </p>
          <ul className="text-danger small">
            <li>
              Switching to another <strong>tab</strong>
            </li>
            <li>
              Opening a <strong>new browser window</strong>
            </li>
            <li>
              Using the browser's <strong>back/forward button</strong>
            </li>
            <li>
              Switching to <strong>another application</strong>
            </li>
          </ul>
          <p className="mt-3 mb-0">
            <strong className="text-danger">
              If you do ANY of the above again, your test will be AUTOMATICALLY
              SUBMITTED with your current answers!
            </strong>
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="warning"
            size="lg"
            onClick={() => setShowSwitchWarning(false)}
          >
            <i className="bi bi-check-circle me-2"></i>
            I Understand - Continue Test
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InterviewTest;