import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Table, Image, Badge, Button, Pagination, Alert, Modal, Form } from "react-bootstrap";
import { FaTrophy, FaUser, FaEnvelope, FaPhone, FaIdCard, FaBook, FaCalendar, FaMoneyBillWave } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import UserLeftNav from "./UserLeftNav";
import UserHeader from "./UserHeader";
import axios from "axios";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend';

const TestWinner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { user } = useContext(AuthContext);
  
  // Test winner data state
  const [testWinnerData, setTestWinnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Fetch test winner data
  useEffect(() => {
    const fetchTestWinnerData = async () => {
      if (!user || !user.unique_id) {
        console.log("User ID not available yet");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/test-winners/?user_id=${user.unique_id}`,
          { withCredentials: true }
        );

        console.log("Test winner data response:", response.data);

        if (response.data.status) {
          setTestWinnerData(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch test winner data");
        }
      } catch (err) {
        console.error("Error fetching test winner data:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch test winner data");
      } finally {
        setLoading(false);
      }
    };

    fetchTestWinnerData();
  }, [user]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch(status) {
      case 'passed':
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
      default:
        return 'warning';
    }
  };

  // Get score badge variant
  const getScoreVariant = (score) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  // Filter test attempts based on status
  const filteredAttempts = testWinnerData?.attempts?.filter(attempt => {
    if (statusFilter === 'all') return true;
    return attempt.test_status === statusFilter;
  }) || [];

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

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
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                <FaTrophy className="me-2 text-warning" />
                Test Winner Details
              </h2>
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
                <p className="mt-2">Loading test winner data...</p>
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
                <Row className="mt-3">
                  <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="mb-0">
                        <FaBook className="me-2 text-info" />
                        Test Attempts ({filteredAttempts.length})
                      </h3>
                      <div style={{ width: '200px' }}>
                        <Form.Select
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                          className="form-control"
                        >
                          <option value="all">All Status</option>
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                          <option value="pending">Pending</option>
                        </Form.Select>
                      </div>
                    </div>
                    {filteredAttempts.length > 0 ? (
                      <table className="temp-rwd-table">
                        <tbody>
                          <tr>
                            <th>Attempt ID</th>
                            <th>Total Questions</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Started At</th>
                          </tr>
                          {filteredAttempts.map((attempt) => (
                            <tr key={attempt.id}>
                              <td data-th="Attempt ID">{attempt.id}</td>
                              <td data-th="Total Questions">{attempt.total_questions}</td>
                              <td data-th="Score">
                                <Badge bg={getScoreVariant(attempt.score)}>
                                  {attempt.score}%
                                </Badge>
                              </td>
                              <td data-th="Status">
                                <Badge bg={getStatusVariant(attempt.test_status)}>
                                  {attempt.test_status}
                                </Badge>
                              </td>
                              <td data-th="Started At">{formatDate(attempt.started_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-muted">No test attempts found.</p>
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
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>Score</th>
                          <th>Cashback</th>
                          <th>Account Holder Name</th>
                          <th>Phone</th>
                          <th>Account Number</th>
                          <th>IFSC Code</th>
                          <th>Date</th>
                        </tr>
                        <tr>
                          <td data-th="Score">
                            <Badge bg={getScoreVariant(testWinnerData.winner_details?.score || 0)}>
                              {testWinnerData.winner_details?.score || 0}%
                            </Badge>
                          </td>
                          <td data-th="Cashback">₹{testWinnerData.winner_details?.cashback || 0}</td>
                          <td data-th="Account Holder Name">{testWinnerData.winner_details?.account_holder_name || "N/A"}</td>
                          <td data-th="Phone">{testWinnerData.winner_details?.phone || "N/A"}</td>
                          <td data-th="Account Number">{testWinnerData.winner_details?.account_number || "N/A"}</td>
                          <td data-th="IFSC Code">{testWinnerData.winner_details?.ifsc_code || "N/A"}</td>
                          <td data-th="Created At">{formatDate(testWinnerData.winner_details?.created_at)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Row>
              </>
            ) : (
              <Alert variant="warning" className="mb-4">
                <h4>No Test Winner Data Found</h4>
                <p>No test winner data available for this user.</p>
              </Alert>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default TestWinner;