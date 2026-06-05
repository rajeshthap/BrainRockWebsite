import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Alert, Spinner, Card, ProgressBar } from "react-bootstrap";
import "../../assets/css/Test.css";
import FooterPage from "../footer/FooterPage";
import axios from "axios";

const API_BASE_URL = "https://brainrock.in/brainrock/backend";

function CoursesTest() {
  const location = useLocation();
  const navigate = useNavigate();

  const courseData = location?.state?.courseData || null;
  const isCourseRegistration = !!location?.state?.courseData;

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isCourseRegistration || !courseData) {
      navigate("/Courses");
      return;
    }
    startTest();
  }, [courseData, isCourseRegistration]);

  const startTest = async () => {
    try {
      const userId = localStorage.getItem("test_user_id");
      if (!userId) {
        setError("User ID not found. Please register first.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/start-test/`,
        {
          user_id: userId,
          course_id: courseData.id,
        }
      );

      if (response.data.status) {
        setTestData(response.data);
        setUserAnswers(new Array(response.data.total_questions).fill(null));
      } else {
        setError(response.data.message || "Failed to start test");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start test. Please try again.");
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
      const correctCount = finalizedAnswers.reduce((count, answer, index) => {
        if (answer === null) return count;
        return testData.questions[index].correct_answer === answer ? count + 1 : count;
      }, 0);

      const totalMarks = testData.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      const obtainedMarks = finalizedAnswers.reduce((sum, answer, index) => {
        if (answer === null) return sum;
        return testData.questions[index].correct_answer === answer ? sum + (testData.questions[index].marks || 1) : sum;
      }, 0);

      const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

      setResult({
        score: obtainedMarks,
        total: totalMarks,
        percentage,
        correct: correctCount,
        totalQuestions: testData.total_questions,
        courseName: courseData.title,
      });
      setShowSubmitConfirm(false);
    } catch (err) {
      setError("Failed to submit test. Please try again.");
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
    const passed = result.percentage >= 80;

    return (
      <Container className="my-5">
        <Card className="result-card">
          <Card.Body className="text-center">
            <Card.Title className={passed ? "text-success" : "text-danger"}>
              {passed ? "Congratulations!" : "Test Completed"}
            </Card.Title>

            <div className="result-icon">
              {passed ? (
                <span style={{ fontSize: "4rem" }}>🎉</span>
              ) : (
                <span style={{ fontSize: "4rem" }}>📝</span>
              )}
            </div>

            <h3>{result.courseName}</h3>

            <div className="result-details">
              <Row className="mt-4">
                <Col md={4}>
                  <div className="result-item">
                    <h4>{result.score}</h4>
                    <p>Score</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="result-item">
                    <h4>{result.correct}/{result.totalQuestions}</h4>
                    <p>Correct</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="result-item">
                    <h4>{result.percentage}%</h4>
                    <p>Result</p>
                  </div>
                </Col>
              </Row>
            </div>

            {passed && (
              <Alert variant="success" className="mt-4">
                <strong>You passed!</strong> You scored above 80%. You can proceed with the course.
              </Alert>
            )}

            {!passed && (
              <Alert variant="warning" className="mt-4">
                <strong>Please try again!</strong> You need 80% to pass the test.
              </Alert>
            )}

            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate("/Courses")}
            >
              Back to Courses
            </Button>
          </Card.Body>
        </Card>
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
                You have {unanswered} unanswered question(s). They will be marked as incorrect.
              </Alert>
            )}
            <p>Are you sure you want to submit your test?</p>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
            <Button variant="secondary" className="ms-2" onClick={() => setShowSubmitConfirm(false)}>
              Review Answers
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentQuestion = testData?.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return <Container className="my-5">No questions available.</Container>;
  }

  const progress = ((currentQuestionIndex + 1) / testData.total_questions) * 100;

  return (
    <Container className="test-container">
      <div className="test-header">
        <h2>{courseData?.title || "Course Test"}</h2>
        <p className="text-muted">
          Question {currentQuestionIndex + 1} of {testData.total_questions}
        </p>
        <ProgressBar now={progress} className="test-progress" label={`${Math.round(progress)}%`} />
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
              <Button variant="primary" onClick={handleNext} disabled={selectedAnswer === null}>
                Next
              </Button>
            ) : (
              <Button variant="success" onClick={() => setShowSubmitConfirm(true)} disabled={selectedAnswer === null}>
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
