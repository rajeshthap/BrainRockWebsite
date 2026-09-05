import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Pagination,
  Alert,
  Modal,
  Card,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AuthContext } from "../../context/AuthContext";

const API_URL =
  "https://brainrock.in/brainrock/backend/api/admin/candidate-interview-test-scores/";

const api = axios.create({
  baseURL: "https://brainrock.in/brainrock/backend/api/",
  withCredentials: true,
});

const MEDIA_BASE_URL = "https://brainrock.in/brainrock/backend";

const CandidateInterviewTestScores = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null);

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

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_URL);
      if (response.data && Array.isArray(response.data.data)) {
        setScores(response.data.data);
        setError(null);
      } else if (Array.isArray(response.data)) {
        setScores(response.data);
        setError(null);
      } else {
        setScores([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch test scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredScores =
    searchTerm.trim() === ""
      ? scores
      : scores.filter((s) => {
          const lower = searchTerm.toLowerCase();
          return (
            s.candidate?.candidate_id?.toLowerCase().includes(lower) ||
            s.candidate?.email?.toLowerCase().includes(lower) ||
            s.candidate?.full_name?.toLowerCase().includes(lower)
          );
        });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredScores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredScores.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (s) => {
    setSelectedScore(s);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-container">
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h2 className="mb-0">Candidate Interview Test Scores</h2>
              <div style={{ width: "300px" }}>
                <input
                  type="text"
                  placeholder="Search by candidate ID, name or email..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                Error: {error}
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading test scores...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Test ID</th>
                          <th>Candidate ID</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Score</th>
                          <th>Total Q</th>
                          <th>Correct</th>
                          <th>Wrong</th>
                          <th>Status</th>
                          <th>Started At</th>
                          <th>Submitted At</th>
                          <th className="text-center">Action</th>
                        </tr>

                        {currentItems.length > 0 ? (
                          currentItems.map((s, index) => (
                            <tr key={s.test_id}>
                              <td data-th="S.No">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td data-th="Test ID">#{s.test_id}</td>
                              <td data-th="Candidate ID">
                                {s.candidate?.candidate_id}
                              </td>
                              <td data-th="Full Name">
                                {s.candidate?.full_name || "N/A"}
                              </td>
                              <td data-th="Email">{s.candidate?.email}</td>
                              <td data-th="Phone">
                                {s.candidate?.phone || "N/A"}
                              </td>
                              <td data-th="Score">
                                <strong>
                                  {s.score} / {s.total_questions}
                                </strong>
                              </td>
                              <td data-th="Total Q">{s.total_questions}</td>
                              <td data-th="Correct">
                                <Badge bg="success">{s.correct_answers}</Badge>
                              </td>
                              <td data-th="Wrong">
                                <Badge bg="danger">{s.wrong_answers}</Badge>
                              </td>
                              <td data-th="Status">
                                <Badge
                                  bg={
                                    s.status === "submitted"
                                      ? "success"
                                      : "warning"
                                  }
                                >
                                  {s.status}
                                </Badge>
                              </td>
                              <td data-th="Started At">
                                {formatDate(s.started_at)}
                              </td>
                              <td data-th="Submitted At">
                                {formatDate(s.submitted_at)}
                              </td>
                              <td data-th="Action" className="text-center">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleViewDetails(s)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="14" className="text-center">
                              No test scores available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages).keys()].map((page) => (
                        <Pagination.Item
                          key={page + 1}
                          active={page + 1 === currentPage}
                          onClick={() => handlePageChange(page + 1)}
                        >
                          {page + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Test Details — {selectedScore?.candidate?.candidate_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedScore && (
            <>
              <Row className="mb-3">
                <Col md={3}>
                  <strong>Test ID:</strong> {selectedScore.test_id}
                </Col>
                <Col md={3}>
                  <strong>Candidate ID:</strong>{" "}
                  {selectedScore.candidate?.candidate_id}
                </Col>
                <Col md={3}>
                  <strong>Full Name:</strong>{" "}
                  {selectedScore.candidate?.full_name || "N/A"}
                </Col>
                <Col md={3}>
                  <strong>Email:</strong> {selectedScore.candidate?.email}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}>
                  <strong>Phone:</strong> {selectedScore.candidate?.phone || "N/A"}
                </Col>
                <Col md={3}>
                  <strong>Status:</strong>{" "}
                  <Badge bg={selectedScore.status === "submitted" ? "success" : "warning"}>
                    {selectedScore.status}
                  </Badge>
                </Col>
                <Col md={3}>
                  <strong>Score:</strong> {selectedScore.score}/{selectedScore.total_questions}
                </Col>
                <Col md={3}>
                  <strong>Correct:</strong>{" "}
                  <Badge bg="success">{selectedScore.correct_answers}</Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}>
                  <strong>Wrong:</strong>{" "}
                  <Badge bg="danger">{selectedScore.wrong_answers}</Badge>
                </Col>
                <Col md={3}>
                  <strong>Started At:</strong> {formatDate(selectedScore.started_at)}
                </Col>
                <Col md={3}>
                  <strong>Submitted At:</strong> {formatDate(selectedScore.submitted_at)}
                </Col>
                <Col md={3}>
                  <strong>Identity Docs:</strong>{" "}
                  {selectedScore.candidate?.identity_docs ? (
                    <a href={`${MEDIA_BASE_URL}${selectedScore.candidate.identity_docs}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary py-0">View</a>
                  ) : (
                    "N/A"
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}>
                  <strong>Edu Certificate:</strong>{" "}
                  {selectedScore.candidate?.edu_certificate ? (
                    <a href={`${MEDIA_BASE_URL}${selectedScore.candidate.edu_certificate}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary py-0">View</a>
                  ) : (
                    "N/A"
                  )}
                </Col>
                <Col md={3}>
                  <strong>Experience:</strong>{" "}
                  {selectedScore.candidate?.experience ? (
                    <a href={`${MEDIA_BASE_URL}${selectedScore.candidate.experience}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary py-0">View</a>
                  ) : (
                    "N/A"
                  )}
                </Col>
              </Row>

              <h6 className="mt-4 text-success">
                <i className="bi bi-check-circle me-2"></i>
                Correct Questions ({selectedScore.correct_questions?.length || 0})
              </h6>
              {selectedScore.correct_questions?.length > 0 ? (
                <table className="temp-rwd-table mb-4">
                  <tbody>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Options</th>
                      <th>Correct Answer</th>
                      <th>Marks</th>
                      <th>Category</th>
                    </tr>
                    {selectedScore.correct_questions.map((q, idx) => (
                      <tr key={q.question_id}>
                        <td data-th="#">{idx + 1}</td>
                        <td data-th="Question">{q.question}</td>
                        <td data-th="Options">
                          <ul className="list-unstyled mb-0 small">
                            {q.options?.map((opt, optIdx) => (
                              <li key={optIdx} className="mb-1">
                                <span className="badge bg-success me-2">{String.fromCharCode(65 + optIdx)}</span>
                                {opt}
                                {optIdx === q.correct_answer_index && <span className="text-success ms-1">✓</span>}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td data-th="Correct Answer">
                          <Badge bg="success">{q.correct_answer}</Badge>
                        </td>
                        <td data-th="Marks">{q.marks}</td>
                        <td data-th="Category">{q.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No correct answers.</p>
              )}

              <h6 className="mt-4 text-danger">
                <i className="bi bi-x-circle me-2"></i>
                Wrong Questions ({selectedScore.wrong_questions?.length || 0})
              </h6>
              {selectedScore.wrong_questions?.length > 0 ? (
                <table className="temp-rwd-table">
                  <tbody>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Options</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Marks</th>
                      <th>Category</th>
                    </tr>
                    {selectedScore.wrong_questions.map((q, idx) => (
                      <tr key={q.question_id}>
                        <td data-th="#">{idx + 1}</td>
                        <td data-th="Question">{q.question}</td>
                        <td data-th="Options">
                          <ul className="list-unstyled mb-0 small">
                            {q.options?.map((opt, optIdx) => (
                              <li key={optIdx} className="mb-1">
                                <span className={`badge me-2 ${optIdx === q.correct_answer_index ? 'bg-success' : optIdx === q.your_answer_index ? 'bg-danger' : 'bg-secondary'}`}>{String.fromCharCode(65 + optIdx)}</span>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td data-th="Your Answer">
                          <Badge bg="danger">{q.your_answer}</Badge>
                        </td>
                        <td data-th="Correct Answer">
                          <Badge bg="success">{q.correct_answer}</Badge>
                        </td>
                        <td data-th="Marks">{q.marks}</td>
                        <td data-th="Category">{q.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No wrong answers.</p>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CandidateInterviewTestScores;