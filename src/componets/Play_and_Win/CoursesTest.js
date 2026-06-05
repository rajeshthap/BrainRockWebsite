import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Card,
  ProgressBar,
} from "react-bootstrap";
import "../../assets/css/Test.css";
import FooterPage from "../footer/FooterPage";
import axios from "axios";

const API_BASE_URL = "https://brainrock.in/brainrock/backend";

function CoursesTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseData = location?.state?.courseData || null;
  const isCourseRegistration = !!location?.state?.courseData;
  const courseIdRef = useRef(location?.state?.courseId || null);
  const courseDataRef = useRef(courseData);
  const urlUserId = searchParams.get("user_id");
  const urlCourseId = searchParams.get("course_id");

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);

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
        course_id: courseIdRef.current || courseData?.id,
      });

      if (
        response.data.status &&
        response.data.questions &&
        Array.isArray(response.data.questions)
      ) {
        setTestData(response.data);
        setUserAnswers(new Array(response.data.total_questions).fill(null));
        console.log(
          "Test data loaded successfully with",
          response.data.total_questions,
          "questions",
        );
      } else {
        const errorMsg =
          response.data.message ||
          "Failed to start test - Invalid response format";
        console.error("Test start failed:", errorMsg, response.data);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to start test. Please try again.";
      console.error("Test API Error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNext = () => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(updatedAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex < testData.total_questions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevAnswer = userAnswers[currentQuestionIndex - 1];
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(prevAnswer);
    }
  };

  const handleSubmit = async () => {
    const finalizedAnswers = [...userAnswers];
    finalizedAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(finalizedAnswers);

    setSubmitting(true);
    try {
      const userId = localStorage.getItem("test_user_id");

      const answersPayload = finalizedAnswers
        .map((answer, index) => {
          if (answer !== null && testData?.questions?.[index]) {
            return {
              question_id: testData.questions[index].id,
              selected_option: answer,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      console.log("Submitting answers:", answersPayload);

      const submitResponse = await axios.post(
        `${API_BASE_URL}/api/submit-test/`,
        {
          user_id: userId,
          answers: answersPayload,
        },
      );

      const apiResult = submitResponse.data;
      console.log("Submit Response:", apiResult);

      const totalMarks = testData.questions.reduce(
        (sum, q) => sum + (q.marks || 1),
        0,
      );

      // Calculate wrong answers
      const wrongAnswers = testData.questions
        .map((question, index) => {
          const userAnswer = finalizedAnswers[index];
          const isCorrect = userAnswer === question.correct_answer;
          return {
            questionId: question.id,
            questionText: question.question_text,
            userAnswer:
              userAnswer !== null
                ? question.options[userAnswer]
                : "Not answered",
            correctAnswer: question.options[question.correct_answer],
            isCorrect,
          };
        })
        .filter((item) => !item.isCorrect);

      const correctCount = testData.questions.length - wrongAnswers.length;

      setResult({
        score: apiResult.score || 0,
        total: totalMarks,
        percentage:
          totalMarks > 0
            ? Math.round(((apiResult.score || 0) / totalMarks) * 100)
            : 0,
        status: apiResult.status || "failed",
        certificate: apiResult.certificate || null,
        courseName:
          courseDataRef.current?.title || courseData?.title || "Course Test",
        correct: correctCount,
        totalQuestions: testData.total_questions,
        wrongAnswers: wrongAnswers,
      });
      setShowSubmitConfirm(false);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit test. Please try again.";
      console.error("Submit Test Error:", err);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading test questions...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate("/Courses")}>
          Back to Courses
        </Button>
      </Container>
    );
  }

  if (result) {
    const passed = result.status === "passed" || result.percentage >= 80;

    return (
      <Container fluid className="test-result-container">
        <Container className="my-5">
          {/* Header Section */}
          <Row className="mb-5">
            <Col md={12}>
              <div className="text-center mb-4">
                <h1
                  className="test-result-title"
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {result.courseName}
                </h1>
                <p
                  className="test-result-subtitle"
                  style={{ fontSize: "1.1rem", color: "#666" }}
                >
                  Test Results
                </p>
              </div>
            </Col>
          </Row>

          {/* Result Card */}
          <Row className="mb-4">
            <Col md={12}>
              <Card
                className={`result-card shadow-lg ${passed ? "border-success" : "border-warning"}`}
                style={{ borderWidth: "3px" }}
              >
                <Card.Body className="text-center py-5">
                  <div className="result-icon mb-4">
                    {passed ? (
                      <span style={{ fontSize: "5rem" }}>🎉</span>
                    ) : (
                      <span style={{ fontSize: "5rem" }}>📝</span>
                    )}
                  </div>

                  <Card.Title
                    className={`mb-4 ${passed ? "text-success" : "text-warning"}`}
                    style={{ fontSize: "2rem", fontWeight: "bold" }}
                  >
                    {passed ? "Congratulations!" : "Test Completed"}
                  </Card.Title>

                  {/* Result Details Grid */}
                  <Row className="mt-5 mb-5">
                    <Col md={3} className="mb-3">
                      <div
                        className="result-stat"
                        style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                          border: "2px solid #007bff",
                        }}
                      >
                        <h5
                          style={{
                            color: "#007bff",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Score
                        </h5>
                        <h2
                          style={{
                            color: "#007bff",
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            margin: "10px 0",
                          }}
                        >
                          {result.score}
                        </h2>
                        <p style={{ color: "#666", margin: "0" }}>
                          out of {result.total}
                        </p>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <div
                        className="result-stat"
                        style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                          border: "2px solid #28a745",
                        }}
                      >
                        <h5
                          style={{
                            color: "#28a745",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Correct
                        </h5>
                        <h2
                          style={{
                            color: "#28a745",
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            margin: "10px 0",
                          }}
                        >
                          {result.correct}
                        </h2>
                        <p style={{ color: "#666", margin: "0" }}>
                          out of {result.totalQuestions}
                        </p>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <div
                        className="result-stat"
                        style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                          border: "2px solid #dc3545",
                        }}
                      >
                        <h5
                          style={{
                            color: "#dc3545",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Wrong
                        </h5>
                        <h2
                          style={{
                            color: "#dc3545",
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            margin: "10px 0",
                          }}
                        >
                          {result.totalQuestions - result.correct}
                        </h2>
                        <p style={{ color: "#666", margin: "0" }}>
                          answered incorrectly
                        </p>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <div
                        className="result-stat"
                        style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                          border: `2px solid ${result.percentage >= 80 ? "#28a745" : "#ffc107"}`,
                        }}
                      >
                        <h5
                          style={{
                            color:
                              result.percentage >= 80 ? "#28a745" : "#ffc107",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Percentage
                        </h5>
                        <h2
                          style={{
                            color:
                              result.percentage >= 80 ? "#28a745" : "#ffc107",
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            margin: "10px 0",
                          }}
                        >
                          {result.percentage}%
                        </h2>
                        <p style={{ color: "#666", margin: "0" }}>
                          performance
                        </p>
                      </div>
                    </Col>
                  </Row>

                  {/* Progress Bar */}
                  <div className="mt-4 mb-4">
                    <ProgressBar
                      now={result.percentage}
                      variant={passed ? "success" : "warning"}
                      style={{
                        height: "30px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                      label={`${result.percentage}% Complete`}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    <span
                      style={{
                        padding: "10px 20px",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        borderRadius: "20px",
                        backgroundColor: passed ? "#d4edda" : "#fff3cd",
                        color: passed ? "#155724" : "#856404",
                        textTransform: "capitalize",
                      }}
                    >
                      Status: {result.status}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Certificate Alert */}
          {passed && (
            <Row className="mb-4">
              <Col md={12}>
                <Alert
                  variant="success"
                  className="shadow"
                  style={{ borderRadius: "10px", padding: "20px" }}
                >
                  <Alert.Heading
                    style={{ fontSize: "1.3rem", fontWeight: "bold" }}
                  >
                    ✓ Test Passed Successfully!
                  </Alert.Heading>
                  <p style={{ fontSize: "1rem", marginBottom: "10px" }}>
                    Congratulations! You have successfully passed the test with{" "}
                    <strong>{result.percentage}%</strong> score. You can now
                    proceed with the course.
                  </p>
                  {result.certificate && (
                    <div className="mt-3">
                      <a
                        href={`${API_BASE_URL}${result.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-lg"
                        style={{ marginRight: "10px" }}
                      >
                        📜 Download Certificate
                      </a>
                    </div>
                  )}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Failure Alert */}
          {!passed && (
            <Row className="mb-4">
              <Col md={12}>
                <Alert
                  variant="warning"
                  className="shadow"
                  style={{ borderRadius: "10px", padding: "20px" }}
                >
                  <Alert.Heading
                    style={{ fontSize: "1.3rem", fontWeight: "bold" }}
                  >
                    ⚠ Please Try Again
                  </Alert.Heading>
                  <p style={{ fontSize: "1rem", marginBottom: "10px" }}>
                    You scored <strong>{result.percentage}%</strong>. You need{" "}
                    <strong>80%</strong> or more to pass the test. Please review
                    the incorrect answers below and try again.
                  </p>
                </Alert>
              </Col>
            </Row>
          )}

          {/* Wrong Answers Section */}
          {result.wrongAnswers && result.wrongAnswers.length > 0 && (
            <Row className="mb-4">
              <Col md={12}>
                <Card className="shadow-sm">
                  <Card.Header
                    className="bg-danger text-white"
                    style={{ padding: "15px" }}
                  >
                    <h5
                      style={{
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      ❌ Wrong Answers ({result.wrongAnswers.length})
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {result.wrongAnswers.map((wrongAnswer, index) => (
                      <div
                        key={index}
                        className="wrong-answer-item mb-4 p-3"
                        style={{
                          backgroundColor: "#fff5f5",
                          borderLeft: "4px solid #dc3545",
                          borderRadius: "5px",
                        }}
                      >
                        <h6
                          style={{
                            color: "#dc3545",
                            fontWeight: "bold",
                            marginBottom: "10px",
                          }}
                        >
                          Question {index + 1}: {wrongAnswer.questionText}
                        </h6>
                        <div
                          style={{ marginLeft: "20px", marginBottom: "10px" }}
                        >
                          <p style={{ color: "#dc3545", margin: "5px 0" }}>
                            <strong>Your Answer:</strong>{" "}
                            {wrongAnswer.userAnswer}
                          </p>
                          <p style={{ color: "#28a745", margin: "5px 0" }}>
                            <strong>Correct Answer:</strong>{" "}
                            {wrongAnswer.correctAnswer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Action Buttons */}
          <Row className="mt-5">
            <Col md={12} className="text-center">
              <Button
                variant={passed ? "primary" : "warning"}
                size="lg"
                onClick={() => navigate("/Courses")}
                style={{
                  padding: "12px 30px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                ← Back to Courses
              </Button>
            </Col>
          </Row>
        </Container>
        <FooterPage />
      </Container>
    );
  }

  if (showSubmitConfirm) {
    const unanswered = userAnswers.filter((a) => a === null).length;

    return (
      <Container className="my-5">
        <Card>
          <Card.Body className="text-center">
            <Card.Title>Submit Test?</Card.Title>
            {unanswered > 0 && (
              <Alert variant="warning">
                You have {unanswered} unanswered question(s). They will be
                marked as incorrect.
              </Alert>
            )}
            <p>Are you sure you want to submit your test?</p>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => setShowSubmitConfirm(false)}
            >
              Review Answers
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentQuestion = testData?.questions?.[currentQuestionIndex];

  if (!testData) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Test data not loaded. Please refresh the page.
        </Alert>
      </Container>
    );
  }

  if (!currentQuestion) {
    console.error("Current question not found:", {
      currentQuestionIndex,
      totalQuestions: testData?.total_questions,
      hasQuestions: !!testData?.questions,
      questionsLength: testData?.questions?.length,
    });
    return <Container className="my-5">No questions available.</Container>;
  }

  const progress =
    ((currentQuestionIndex + 1) / testData.total_questions) * 100;

  return (
    <Container className="test-container">
      <div className="test-header">
        <h2>
          {courseDataRef.current?.title || courseData?.title || "Course Test"}
        </h2>
        <p className="text-muted">
          Question {currentQuestionIndex + 1} of {testData.total_questions}
        </p>
        <ProgressBar
          now={progress}
          className="test-progress"
          label={`${Math.round(progress)}%`}
        />
      </div>

      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card className="question-card">
            <Card.Body>
              <Card.Title className="question-text">
                {currentQuestion.question_text}
              </Card.Title>
              {currentQuestion.question_hindi_text && (
                <p className="text-muted fst-italic">
                  {currentQuestion.question_hindi_text}
                </p>
              )}

              <div className="options-list mt-4">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`option-item ${selectedAnswer === index ? "selected" : ""}`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <span className="option-radio">
                      {selectedAnswer === index ? "●" : "○"}
                    </span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <div className="test-navigation mt-4">
            <Button
              variant="outline-secondary"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            {currentQuestionIndex < testData.total_questions - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={selectedAnswer === null}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={selectedAnswer === null}
              >
                Submit Test
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default CoursesTest;
