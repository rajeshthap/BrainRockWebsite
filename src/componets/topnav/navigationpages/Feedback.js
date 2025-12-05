import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import "../../../assets/css/Trainingregistration.css";
import FooterPage from "../../footer/FooterPage";
import { Link } from "react-router-dom";

function Feedback() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // Added error message state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LIVE VALIDATION
  const validateField = (name, value) => {
    let msg = "";

    switch (name) {
      case "email":
        if (!value.trim()) msg = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) msg = "Invalid email format";
        break;

      case "message":
        if (!value.trim()) msg = "Message is required";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  // INPUT CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    
    // Clear error messages when user starts typing
    if (errorMsg) setErrorMsg("");
  };

  // FINAL VALIDATION BEFORE SUBMIT
  const validateFormBeforeSubmit = () => {
    let temp = {};

    if (!formData.email) temp.email = "Email is required";
    if (!formData.message) temp.message = "Message is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormBeforeSubmit()) return;

    setIsSubmitting(true);
    setErrorMsg(""); // Clear previous error message

    try {
      const response = await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/feedback/",
        formData
      );

      setSuccessMsg("Feedback submitted successfully!");

      // RESET FORM
      setFormData({
        email: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Feedback submission error:", error);
      
      // Handle API errors for duplicate email
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = {};
        
        if (error.response.data.errors.email && Array.isArray(error.response.data.errors.email)) {
          apiErrors.email = "Email already exists. Please use a different email.";
        }
        
        if (Object.keys(apiErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...apiErrors }));
        }
      } else if (error.response) {
        // Server responded with error status
        setErrorMsg(error.response.data.message || "Server error occurred. Please try again.");
      } else if (error.request) {
        // Request was made but no response received
        setErrorMsg("Network error. Please check your internet connection and try again.");
      } else {
        // Something else happened
        setErrorMsg("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear alerts function
  const clearAlerts = () => {
    setSuccessMsg("");
    setErrorMsg("");
  };

  return (
    <>
     <div className='feedback-banner'>
                      <div className='site-breadcrumb-wpr'>
                        <h2 className='breadcrumb-title'>Our Feedback</h2>
                     <ul className='breadcrumb-menu clearfix'>
                <li>
                  <Link className="breadcrumb-home" to="/">Home</Link>
                </li>
              
                <li className='px-2'>/</li>
              
                <li>
                  <Link className="breadcrumb-about" to="/">FeedBack</Link>
                </li>
              </ul>
              
                      </div>
                    </div>
    <div className="ourteam-section">
      <Container className="">
        <div className="ourteam-box text-heading">
          {/* Success Alert */}
          {successMsg && (
            <Alert variant="success" dismissible onClose={() => setSuccessMsg("")}>
              {successMsg}
            </Alert>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <Alert variant="danger" dismissible onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Email */}
              <Col md={12} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">
                    Email <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    className="br-form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    isInvalid={!!errors.email} // Show invalid state when there's an error
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Message */}
              <Col md={12} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">
                    Message <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    className="br-form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message"
                    disabled={isSubmitting}
                    isInvalid={!!errors.message} // Show invalid state when there's an error
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center">
              <Button 
                type="submit" 
                className="mt-4" 
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </Form>
        </div>
      </Container>
       <Container fluid className="br-footer-box">
        
          <FooterPage />
      </Container>
    </div>
    </>
  );
}

export default Feedback;