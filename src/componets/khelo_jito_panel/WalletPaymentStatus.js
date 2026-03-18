import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';

const WalletPaymentStatus = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get order_id from localStorage
        const orderId = localStorage.getItem("wallet_payment_order_id");
        
        if (!orderId) {
          throw new Error("No order ID found in localStorage");
        }

        // Check payment status
        const response = await axios.get(
          `${API_BASE_URL}/wallet/payment-status/?order_id=${orderId}`,
          { withCredentials: true }
        );

        if (response.data.status) {
          setPaymentStatus(response.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch payment status");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setError(err.message || "An error occurred while checking payment status");
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  const handleGoBack = () => {
    // Remove order_id from localStorage
    localStorage.removeItem("wallet_payment_order_id");
    navigate("/UserDashBoard");
  };

  if (loading) {
    return (
      <Container fluid className="payment-status-container">
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card className="text-center p-5">
              <Card.Body>
                <h5 className="card-title">Checking Payment Status...</h5>
                <p>Please wait while we verify your payment.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="payment-status-container">
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card className="text-center p-5">
              <Card.Body>
                <Alert variant="danger" className="mb-4">
                  <h5>Error</h5>
                  <p>{error}</p>
                </Alert>
                <Button variant="primary" onClick={handleGoBack}>
                  Go Back to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const isSuccess = paymentStatus.payment_status === "success";
  const isFailed = paymentStatus.payment_status === "failed";
  const isPending = paymentStatus.payment_status === "pending";

  return (
    <Container fluid className="payment-status-container">
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="text-center p-5">
            <Card.Body>
              <h5 className="card-title mb-4">Payment Status</h5>
              
              <div className="mb-4">
                <p className="text-muted">Order ID</p>
                <p className="font-weight-bold">{paymentStatus.order_id}</p>
              </div>

              {isSuccess && (
                <Alert variant="success" className="mb-4">
                  <h6>✅ Payment Successful!</h6>
                  <p>Your wallet has been updated with the amount.</p>
                  {paymentStatus.transaction_id && (
                    <p className="mt-2">
                      <small>Transaction ID: {paymentStatus.transaction_id}</small>
                    </p>
                  )}
                </Alert>
              )}

              {isFailed && (
                <Alert variant="danger" className="mb-4">
                  <h6>❌ Payment Failed</h6>
                  <p>Your payment was not processed successfully. Please try again.</p>
                  {paymentStatus.transaction_id && (
                    <p className="mt-2">
                      <small>Transaction ID: {paymentStatus.transaction_id}</small>
                    </p>
                  )}
                </Alert>
              )}

              {isPending && (
                <Alert variant="warning" className="mb-4">
                  <h6>⏳ Payment Pending</h6>
                  <p>Your payment is still being processed. Please check back later.</p>
                </Alert>
              )}

              {paymentStatus.phonepe_response && (
                <div className="mb-4">
                  <p className="text-muted">Amount</p>
                  <p className="font-weight-bold">₹{paymentStatus.phonepe_response.amount}</p>
                </div>
              )}

              <Button variant="primary" onClick={handleGoBack}>
                Go Back to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WalletPaymentStatus;
