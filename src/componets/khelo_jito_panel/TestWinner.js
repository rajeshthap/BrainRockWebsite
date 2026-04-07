import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Image,
  Badge,
  Button,
  Pagination,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaTrophy,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBook,
  FaCalendar,
  FaMoneyBillWave,
  FaDownload,
  FaCertificate,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import UserLeftNav from "./UserLeftNav";
import UserHeader from "./UserHeader";
import "../../assets/css/attendance.css";
import axios from "axios";

const API_BASE_URL = "https://brainrock.in/brainrock/backend";
const STORAGE_KEY = "BR_TEST_WINNER_DATA";

// Helper to safely get/set localStorage for test winner data
const getStoredTestWinnerData = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (e) {
    console.error("Error reading test winner data from localStorage:", e);
  }
  return null;
};

const setStoredTestWinnerData = (testWinnerData) => {
  try {
    if (typeof window !== "undefined") {
      if (testWinnerData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(testWinnerData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error("Error saving test winner data to localStorage:", e);
  }
};

const TestWinner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext);

  // Tab state
  const [activeTab, setActiveTab] = useState("khelo-jito");

  // Test winner data state (Khelo Jito)
  const [testWinnerData, setTestWinnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz participants data state
  const [quizParticipants, setQuizParticipants] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);

  // Wallet data state
  const [walletAmount, setWalletAmount] = useState(0);
  const [cashback, setCashback] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [quizStatusFilter, setQuizStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [quizCurrentPage, setQuizCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Responsive check
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

  // Load stored test winner data immediately on mount
  useEffect(() => {
    const storedData = getStoredTestWinnerData();
    if (storedData) {
      setTestWinnerData(storedData.testWinnerData || null);
      setWalletAmount(storedData.walletAmount || 0);
      setCashback(storedData.cashback || 0);
      setTotalAmount(storedData.totalAmount || 0);
      setLoading(false);
    }
  }, []);

  // Fetch test winner data
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    const fetchTestWinnerData = async () => {
      if (!user || !user.unique_id) {
        console.log("User ID not available yet");
        setLoading(false);
        return;
      }

      try {
        // Only show loading if we don't have stored data
        const storedData = getStoredTestWinnerData();
        if (!storedData) {
          setLoading(true);
        }
        setError(null);

        const response = await axios.get(
          `${API_BASE_URL}/api/test-winners/?user_id=${user.unique_id}`,
          { withCredentials: true },
        );

        console.log("Test winner data response:", response.data);

        if (response.data.status) {
          const testData = response.data.data;
          setTestWinnerData(testData);

          // Extract wallet data from the main response
          const cashbackAmount = testData.winner_details?.cashback || 0;
          const walletBalance = testData.winner_details?.wallet_balance || 0;
          const total = cashbackAmount + walletBalance;

          setCashback(cashbackAmount);
          setWalletAmount(walletBalance);
          setTotalAmount(total);

          // Store all test winner data in localStorage for persistence
          setStoredTestWinnerData({
            testWinnerData: testData,
            walletAmount: walletBalance,
            cashback: cashbackAmount,
            totalAmount: total,
          });
        } else {
          throw new Error(
            response.data.message || "Failed to fetch test winner data",
          );
        }
      } catch (err) {
        console.error("Error fetching test winner data:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch test winner data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTestWinnerData();
  }, [user, authLoading]);

  // Fetch quiz participants data
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    const fetchQuizParticipants = async () => {
      if (!user || !user.unique_id) {
        console.log("User ID not available yet");
        return;
      }

      try {
        setQuizLoading(true);
        setQuizError(null);

        const response = await axios.get(
          `${API_BASE_URL}/api/quiz-participants/?user_id=${user.unique_id}`,
          { withCredentials: true },
        );

        console.log("Quiz participants data response:", response.data);

        if (response.data.status && Array.isArray(response.data.data)) {
          setQuizParticipants(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch quiz participants data",
          );
        }
      } catch (err) {
        console.error("Error fetching quiz participants:", err);
        setQuizError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch quiz participants",
        );
      } finally {
        setQuizLoading(false);
      }
    };

    fetchQuizParticipants();
  }, [user, authLoading]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "passed":
        return "success";
      case "failed":
        return "danger";
      case "started":
        return "info";
      case "not_attempted":
        return "secondary";
      case "pending":
      default:
        return "warning";
    }
  };

  // Get score badge variant - scores are 0-5, so convert to percentage for logic
  const getScoreVariant = (score, totalQuestions = 5) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "danger";
  };

  // Get certificate URL from attempt
  const getCertificateUrl = (certificatePath) => {
    if (!certificatePath) return null;
    return certificatePath.startsWith("http")
      ? certificatePath
      : `https://brainrock.in/brainrock/backend${certificatePath}`;
  };

  // Handle certificate download
  const handleDownloadCertificate = (certificatePath) => {
    const certificateUrl = getCertificateUrl(certificatePath);
    if (certificateUrl) {
      window.open(certificateUrl, "_blank");
    }
  };

  // Filter test attempts based on status
  const filteredAttempts =
    testWinnerData?.attempts?.filter((attempt) => {
      if (statusFilter === "all") return true;
      return attempt.test_status === statusFilter;
    }) || [];

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle quiz status filter change
  const handleQuizStatusFilterChange = (e) => {
    setQuizStatusFilter(e.target.value);
    setQuizCurrentPage(1);
  };

  // Filter quiz participants based on status
  const filteredQuizParticipants = quizParticipants.filter((quiz) => {
    if (quizStatusFilter === "all") return true;
    return quiz.attempt?.status === quizStatusFilter;
  });

  // Pagination calculations for Khelo Jito
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAttempts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);

  // Pagination calculations for Quizes
  const quizIndexOfLastItem = quizCurrentPage * itemsPerPage;
  const quizIndexOfFirstItem = quizIndexOfLastItem - itemsPerPage;
  const currentQuizItems = filteredQuizParticipants.slice(
    quizIndexOfFirstItem,
    quizIndexOfLastItem,
  );
  const quizTotalPages = Math.ceil(
    filteredQuizParticipants.length / itemsPerPage,
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleQuizPageChange = (pageNumber) => setQuizCurrentPage(pageNumber);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content">
        {/* Header */}
        <UserHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body mt-2">
          <div className="br-box-container">
            {/* Tab Navigation */}
            <div className="mb-4">
              <div
                className="nav nav-tabs"
                role="tablist"
                style={{ borderBottom: "2px solid #e9ecef" }}
              >
                <button
                  className={`nav-link ${activeTab === "khelo-jito" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("khelo-jito");
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    background: "none",
                    borderBottom:
                      activeTab === "khelo-jito" ? "3px solid #007bff" : "none",
                    cursor: "pointer",
                    fontWeight: activeTab === "khelo-jito" ? "600" : "500",
                    color: activeTab === "khelo-jito" ? "#007bff" : "#666",
                    transition: "all 0.3s ease",
                  }}
                >
                  <FaBook className="me-2" />
                  Khelo Jito
                </button>
                <button
                  className={`nav-link ${activeTab === "quizes" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("quizes");
                    setQuizCurrentPage(1);
                  }}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    background: "none",
                    borderBottom:
                      activeTab === "quizes" ? "3px solid #007bff" : "none",
                    cursor: "pointer",
                    fontWeight: activeTab === "quizes" ? "600" : "500",
                    color: activeTab === "quizes" ? "#007bff" : "#666",
                    transition: "all 0.3s ease",
                  }}
                >
                  <FaTrophy className="me-2" />
                  Quizes
                </button>
              </div>
            </div>

            {/* Khelo Jito Tab */}
            {activeTab === "khelo-jito" && (
              <>
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
                    <p className="mt-2">Loading Khelo Jito data...</p>
                  </div>
                ) : testWinnerData ? (
                  <>
                    {/* Student Profile Table */}
                    {/* <Row className="mt-3">
                  <div className="col-md-12">
                    <h3 className="mb-3">
                      <FaUser className="me-2 text-primary" />
                      Student Profile
                    </h3>
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>User ID</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Payment Status</th>
                          <th>Created At</th>
                        </tr>
                        <tr>
                          <td data-th="User ID">{testWinnerData.student_profile?.user_id || "N/A"}</td>
                          <td data-th="Full Name">{testWinnerData.student_profile?.full_name || "N/A"}</td>
                          <td data-th="Email">{testWinnerData.student_profile?.email || "N/A"}</td>
                          <td data-th="Phone">{testWinnerData.student_profile?.phone || "N/A"}</td>
                          <td data-th="Payment Status">
                            <Badge bg={testWinnerData.student_profile?.payment_status === 'completed' ? 'success' : 'warning'}>
                              {testWinnerData.student_profile?.payment_status || "N/A"}
                            </Badge>
                          </td>
                          <td data-th="Created At">{formatDate(testWinnerData.student_profile?.created_at)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Row> */}

                    {/* Test Attempts Table */}
                    <Row className="">
                      <div className="col-md-12">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h3 className="mb-0">
                            <FaBook className="me-2 text-info" />
                            Quiz Attempts ({filteredAttempts.length})
                          </h3>
                          <div style={{ width: "200px" }}>
                            <Form.Select
                              value={statusFilter}
                              onChange={handleStatusFilterChange}
                              className="form-control"
                            >
                              <option value="all">All Status</option>
                              <option value="passed">Passed</option>
                              <option value="failed">Failed</option>
                              <option value="started">Started</option>
                              <option value="not_attempted">
                                Not Attempted
                              </option>
                              <option value="pending">Pending</option>
                            </Form.Select>
                          </div>
                        </div>
                        {currentItems.length > 0 ? (
                          <table className="temp-rwd-table temp-rwd-table-style">
                            <tbody>
                              <tr>
                                <th>Attempt ID</th>
                                <th>Total Questions</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Started At</th>
                                <th>Certificate</th>
                              </tr>
                              {currentItems.map((attempt, index) => (
                                <tr key={attempt.id}>
                                  <td data-th="Attempt ID">{attempt.id}</td>
                                  <td data-th="Total Questions">
                                    {attempt.total_questions}
                                  </td>
                                  <td data-th="Score">
                                    <Badge
                                      bg={getScoreVariant(
                                        attempt.score,
                                        attempt.total_questions,
                                      )}
                                    >
                                      {attempt.score}/{attempt.total_questions}
                                    </Badge>
                                  </td>
                                  <td data-th="Status">
                                    <Badge
                                      bg={getStatusVariant(attempt.test_status)}
                                    >
                                      {attempt.test_status}
                                    </Badge>
                                  </td>
                                  <td data-th="Started At">
                                    {formatDate(attempt.started_at)}
                                  </td>
                                  <td data-th="Certificate">
                                    {attempt.certificate ? (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                          handleDownloadCertificate(
                                            attempt.certificate,
                                          )
                                        }
                                        className="certificate-button"
                                      >
                                        <FaDownload className="me-1" />
                                        Download
                                      </Button>
                                    ) : (
                                      <span className="text-muted">
                                        {attempt.test_status === "passed"
                                          ? "Certificate not available"
                                          : "N/A"}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-3">
                            <p className="text-muted">
                              No test attempts found.
                            </p>
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="pagination-container">
                            <ul className="pagination">
                              <li
                                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                              >
                                <a
                                  className="page-link"
                                  href="#!"
                                  onClick={() =>
                                    handlePageChange(currentPage - 1)
                                  }
                                >
                                  &laquo;
                                </a>
                              </li>
                              <li className="page-item active">
                                <a className="page-link" href="#!">
                                  {currentPage} of {totalPages}
                                </a>
                              </li>
                              <li
                                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                              >
                                <a
                                  className="page-link"
                                  href="#!"
                                  onClick={() =>
                                    handlePageChange(currentPage + 1)
                                  }
                                >
                                  &raquo;
                                </a>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </Row>

                    {/* Winner Details Table */}
                    <Row className="mt-3">
                      <div className="col-md-12">
                        <h3 className="mb-3">
                          <FaTrophy className="me-2 text-success" />
                          Winner Details
                        </h3>
                        <table className="temp-rwd-table temp-rwd-table-style">
                          <tbody>
                            <tr>
                              <th>Score</th>
                              <th>Cashback</th>
                              <th>Wallet Balance</th>
                              <th>Total Balance</th>
                              <th>Account Holder Name</th>
                              <th>Phone</th>
                              <th>Account Number</th>
                              <th>IFSC Code</th>
                              <th>Date</th>
                            </tr>
                            <tr>
                              <td data-th="Score">
                                <Badge
                                  bg={getScoreVariant(
                                    testWinnerData.winner_details?.score || 0,
                                    10,
                                  )}
                                >
                                  {testWinnerData.winner_details?.score || 0}/10
                                </Badge>
                              </td>
                              <td data-th="Cashback">
                                ₹{testWinnerData.winner_details?.cashback || 0}
                              </td>
                              <td data-th="Wallet Balance">
                                ₹{walletAmount.toFixed(2)}
                              </td>
                              <td data-th="Total Balance">
                                ₹{totalAmount.toFixed(2)}
                              </td>
                              <td data-th="Account Holder Name">
                                {testWinnerData.winner_details
                                  ?.account_holder_name || "N/A"}
                              </td>
                              <td data-th="Phone">
                                {testWinnerData.winner_details?.phone || "N/A"}
                              </td>
                              <td data-th="Account Number">
                                {testWinnerData.winner_details
                                  ?.account_number || "N/A"}
                              </td>
                              <td data-th="IFSC Code">
                                {testWinnerData.winner_details?.ifsc_code ||
                                  "N/A"}
                              </td>
                              <td data-th="Created At">
                                {formatDate(
                                  testWinnerData.winner_details?.created_at,
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Row>
                  </>
                ) : (
                  <Alert variant="warning" className="mb-4">
                    <h4>No Khelo Jito Data Found</h4>
                    <p>No Khelo Jito data available for this user.</p>
                  </Alert>
                )}
              </>
            )}

            {/* Quizes Tab */}
            {activeTab === "quizes" && (
              <>
                {quizError && (
                  <Alert variant="danger" className="mb-4">
                    Error: {quizError}
                  </Alert>
                )}

                {quizLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading Quiz data...</p>
                  </div>
                ) : quizParticipants.length > 0 ? (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="mb-0">
                        <FaTrophy className="me-2 text-warning" />
                        Quiz Attempts ({filteredQuizParticipants.length})
                      </h3>
                      <div style={{ width: "200px" }}>
                        <Form.Select
                          value={quizStatusFilter}
                          onChange={handleQuizStatusFilterChange}
                          className="form-control"
                        >
                          <option value="all">All Status</option>
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                        </Form.Select>
                      </div>
                    </div>
                    {currentQuizItems.length > 0 ? (
                      <table className="temp-rwd-table temp-rwd-table-style">
                        <tbody>
                          <tr>
                            <th>Quiz ID</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Payment Status</th>
                            <th>Joined At</th>
                            <th>Submitted At</th>
                          </tr>
                          {currentQuizItems.map((quiz, index) => (
                            <tr key={quiz.id}>
                              <td data-th="Quiz ID">{quiz.quiz}</td>
                              <td data-th="Score">
                                <Badge
                                  bg={getScoreVariant(
                                    quiz.attempt?.score,
                                    quiz.attempt?.total_questions,
                                  )}
                                >
                                  {quiz.attempt?.score}/
                                  {quiz.attempt?.total_questions}
                                </Badge>
                              </td>
                              <td data-th="Status">
                                <Badge
                                  bg={getStatusVariant(quiz.attempt?.status)}
                                >
                                  {quiz.attempt?.status}
                                </Badge>
                              </td>
                              <td data-th="Payment Status">
                                <Badge
                                  bg={
                                    quiz.payment_status === "wallet-completed"
                                      ? "success"
                                      : "warning"
                                  }
                                >
                                  {quiz.payment_status}
                                </Badge>
                              </td>
                              <td data-th="Joined At">
                                {formatDate(quiz.joined_at)}
                              </td>
                              <td data-th="Submitted At">
                                {formatDate(quiz.attempt?.submitted_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-muted">No quiz attempts found.</p>
                      </div>
                    )}

                    {/* Pagination for Quizes */}
                    {quizTotalPages > 1 && (
                      <div className="pagination-container">
                        <ul className="pagination">
                          <li
                            className={`page-item ${quizCurrentPage === 1 ? "disabled" : ""}`}
                          >
                            <a
                              className="page-link"
                              href="#!"
                              onClick={() =>
                                handleQuizPageChange(quizCurrentPage - 1)
                              }
                            >
                              &laquo;
                            </a>
                          </li>
                          <li className="page-item active">
                            <a className="page-link" href="#!">
                              {quizCurrentPage} of {quizTotalPages}
                            </a>
                          </li>
                          <li
                            className={`page-item ${quizCurrentPage === quizTotalPages ? "disabled" : ""}`}
                          >
                            <a
                              className="page-link"
                              href="#!"
                              onClick={() =>
                                handleQuizPageChange(quizCurrentPage + 1)
                              }
                            >
                              &raquo;
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert variant="warning" className="mb-4">
                    <h4>No Quiz Data Found</h4>
                    <p>No quiz participation data available for this user.</p>
                  </Alert>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default TestWinner;
