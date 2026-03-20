import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../assets/css/KheloJito.css";
import axios from "axios";
import FooterPage from "../footer/FooterPage";
import kheloImage from "../../assets/images/khelo-img-banner.png";

function KheloJito() {
  // State to hold the form data
  const [formData, setFormData] = useState({
    phone: "",
    full_name: "",
    email: "",
    fee: 8,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [phoneValidation, setPhoneValidation] = useState({
    isChecking: false,
    isRegistered: false,
    isValid: false,
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate();

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    validateField(name, value);
    
    // Real-time phone number validation
    if (name === "phone") {
      const isValidPhone = /^[0-9]{10}$/.test(value);
      setPhoneValidation(prev => ({
        ...prev,
        isValid: isValidPhone,
      }));
      
      if (isValidPhone) {
        checkPhoneNumber(value);
      } else {
        setPhoneValidation(prev => ({
          ...prev,
          isChecking: false,
          isRegistered: false,
        }));
      }
    }
  };

  // Check if phone number exists in registered users API
  const checkPhoneNumber = async (phone) => {
    setPhoneValidation(prev => ({ ...prev, isChecking: true }));
    try {
      const response = await axios.get(
        "https://brainrock.in/brainrock/backend/api/test/winner-phones/",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const isRegistered = response.data.phones.includes(phone);
      setPhoneValidation(prev => ({
        ...prev,
        isChecking: false,
        isRegistered: isRegistered,
      }));
    } catch (error) {
      console.error("Error checking phone number:", error);
      setPhoneValidation(prev => ({
        ...prev,
        isChecking: false,
        isRegistered: false,
      }));
    }
  };

  // Validation for form fields
  const validateField = (name, value) => {
    let msg = "";

    switch (name) {
      case "full_name":
        if (!value.trim()) msg = "Full name is required";
        break;

      case "email":
        if (!value.trim()) msg = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) msg = "Invalid email format";
        break;

      case "phone":
        if (!value.trim()) msg = "Phone number is required";
        else if (!/^[0-9]{10}$/.test(value))
          msg = "Phone number must be 10 digits";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  // Validate entire form before submission
  const validateFormBeforeSubmit = () => {
    let temp = {};
    let isValid = true;

    if (!formData.full_name) {
      temp.full_name = "Full name is required";
      isValid = false;
    }

    if (!formData.email) {
      temp.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      temp.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.phone) {
      temp.phone = "Phone number is required";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      temp.phone = "Phone number must be 10 digits";
      isValid = false;
    }

    setErrors(temp);
    return isValid;
  };

  // Actual form submission logic
  const handleActualSubmit = async () => {
    if (!validateFormBeforeSubmit()) return;

    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      const response = await axios.post(
        "https://brainrock.in/brainrock/backend/api/register-test/",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Registration successful:", response.data);
      console.log("User ID:", response.data.user_id);

      // Store user_id, phone number, and source in localStorage for Test component to retrieve
      localStorage.setItem("test_user_id", response.data.user_id);
      localStorage.setItem("test_user_phone", formData.phone);
      localStorage.setItem("test_source", "khelojito");

      // Clear form
      setFormData({ full_name: "", email: "", phone: "", fee: 1 });

      // Redirect directly to payment URL without showing success message
      if (
        response.data.payment_order &&
        response.data.payment_order.redirectUrl
      ) {
        window.location.href = response.data.payment_order.redirectUrl;
      } else {
        // If no payment required, redirect directly to test page
        navigate("/test");
      }
    } catch (error) {
      console.error("Error during registration:", error);

      if (error.response && error.response.data) {
        const apiErrors = {};

        if (error.response.data.email) {
          apiErrors.email = error.response.data.email[0];
        }

        if (error.response.data.phone) {
          apiErrors.phone = error.response.data.phone[0];
        }

        if (Object.keys(apiErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...apiErrors }));
        } else if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
          setShowError(true);
        } else if (typeof error.response.data === "string") {
          setErrorMessage(error.response.data);
          setShowError(true);
        }
      } else {
        setErrorMessage(
          "Registration failed. Please check your connection and try again.",
        );
        setShowError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleActualSubmit();
  };

  return (
    <>
      {/* Banner Section */}
      <div className="KheloJito-banner">
        
      </div>

        <div className="khelojito-section">
         <Container className="mt-4 mb-3">
           <Row className="align-items-center">
             {/* Left Side - Image */}
             <Col md={6} className="mb-4 mb-md-0">
               <div className="khelo-image-container">
                 <img 
                   src={kheloImage} 
                   alt="Khelo aur Jeeto" 
                   className="khelo-image"
                 />
               </div>
             </Col>
             
             {/* Right Side - Form */}
             <Col md={6}>
               <div className="khelojito-box text-heading">
            {/* Success Alert */}
            {showSuccess && (
              <Card className="mb-4 border-success success-card">
                <Card.Body className="text-center">
                  <Card.Title className="text-success mt-3">
                    Registration Successful!
                  </Card.Title>
                  <Card.Text>
                    Thank you for registering! You will be redirected to the
                    test page shortly.
                  </Card.Text>
                </Card.Body>
              </Card>
            )}

            {/* Error Alert */}
            {showError && (
              <Alert
                variant="danger"
                onClose={() => setShowError(false)}
                dismissible
              >
                {errorMessage}
              </Alert>
            )}

            {/* Terms and Conditions Checkbox */}
           

            {/* Registration Form */}
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Phone Number */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Phone Number <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      className={`br-form-control ${errors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* Full Name */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Full Name <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className={`br-form-control ${errors.full_name ? "is-invalid" : ""}`}
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      disabled={phoneValidation.isRegistered}
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback">{errors.full_name}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* Email */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Email <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      className={`br-form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      disabled={phoneValidation.isRegistered}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* Fee */}
                {/* <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Fee</Form.Label>
                    <Form.Control
                      type="number"
                      className="br-form-control"
                      name="fee"
                      disabled
                      value={formData.fee}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col> */}

                {/* Phone Validation Message */}
                {phoneValidation.isChecking && (
                  <Col md={12} className="mt-3">
                    <Alert variant="info">Checking phone number...</Alert>
                  </Col>
                )}

                {phoneValidation.isRegistered && (
                  <Col md={12} className="mt-3">
                    <Alert variant="danger">
                      This number is already registered, please use a different number or login with this mobile number.
                    </Alert>
                    <Button
                      variant="warning"
                      className="br-button"
                      onClick={() => navigate("/login")}
                    >
                          Go to Login
                    </Button>
                  </Col>
                )}

                {/* Login Button for New Users */}
               
  <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label={
                  <>
                    I agree to the <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}>Terms and Conditions</a>
                  </>
                }
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="br-checkbox"
              />
            </Form.Group>
                {/* Submit Button */}
                {!phoneValidation.isRegistered && (
                  <Col md={12} className="mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      className="br-button"
                      disabled={isLoading || !termsAccepted}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                  </Col>
                )}
              </Row>
            </Form>
              </div>
            </Col>
          </Row>

          {/* Terms and Conditions Modal */}
          <Modal 
            show={showTermsModal} 
            onHide={() => setShowTermsModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton className="term-nd-condi">
              <Modal.Title className="term-title">Terms and Conditions – Online Quiz Game</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="terms-content">
                <p><strong>Last Updated: March 2026</strong></p>
                <p>Welcome to our Online Quiz Platform. By accessing or using this website and participating in the quiz game, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before participating.</p>
                
                <h4>1. Acceptance of Terms</h4>
                <p>By registering on this platform and participating in the quiz game, the user agrees to follow all rules, policies, and conditions mentioned in these Terms and Conditions. If you do not agree with these terms, you should not use this platform.</p>
                
                <h4>2. Eligibility</h4>
                <ul>
                  <li>The quiz platform is open to users who are 13 years of age or older.</li>
                  <li>Users below 18 years of age must have permission from a parent or legal guardian to participate.</li>
                  <li>By registering, the user confirms that the information provided is accurate and that they meet the eligibility requirements.</li>
                  <li>The platform reserves the right to request age verification or parental consent if required.</li>
                </ul>
                
                <h4>3. Registration Fee</h4>
                <ul>
                  <li>To participate in the quiz game, users are required to pay a registration fee of ₹8.</li>
                  <li>This registration fee is non-refundable once the quiz attempt has started.</li>
                  <li>Payment of the registration fee allows the user to participate in one quiz session unless stated otherwise.</li>
                </ul>
                
                <h4>4. Quiz Format</h4>
                <ul>
                  <li>The quiz consists of multiple-choice questions (MCQs).</li>
                  <li>Each question will have a set of options from which the participant must select the correct answer.</li>
                  <li>Participants must complete the quiz within the specified time limit.</li>
                  <li>Once an answer is submitted, it cannot be changed.</li>
                </ul>
                
                <h4>5. Reward System</h4>
                <ul>
                  <li>If a participant answers all questions correctly, 80 points will be credited to the user's game wallet.</li>
                  <li>Points represent the value within the platform wallet system.</li>
                  <li>Rewards are credited automatically after successful completion and verification of the quiz attempt.</li>
                </ul>
                
                <h4>6. Wallet System</h4>
                <ul>
                  <li>Each registered user will have a wallet within the platform.</li>
                  <li>Rewards earned through quizzes will be credited to this wallet.</li>
                  <li>Wallet balances are maintained digitally and can be viewed in the user dashboard.</li>
                  <li>The platform reserves the right to correct any technical errors in wallet balances.</li>
                </ul>
                
                <h4>7. Withdrawal Policy</h4>
                <ul>
                  <li>Users can request withdrawal only when the wallet balance reaches a minimum of ₹200.</li>
                  <li>Withdrawal requests will be processed through the payment methods supported by the platform.</li>
                  <li>The platform may require identity verification before processing withdrawals.</li>
                  <li>Withdrawal processing time may vary depending on payment provider processing.</li>
                </ul>
                
                <h4>8. Fair Play Policy</h4>
                <p>Users must participate fairly and must not:</p>
                <ul>
                  <li>Use bots, automated software, scripts, or external tools</li>
                  <li>Attempt to manipulate quiz results</li>
                  <li>Use unfair methods to gain advantage</li>
                  <li>Share answers with other participants during active quizzes</li>
                </ul>
                <p>Violation of fair play rules may result in account suspension, cancellation of winnings, or permanent ban.</p>
                
                <h4>9. Multiple Accounts Restriction</h4>
                <ul>
                  <li>Users are allowed to maintain only one account per person.</li>
                  <li>Creating multiple accounts to gain additional rewards or unfair advantage is strictly prohibited.</li>
                  <li>If duplicate accounts are detected, the platform reserves the right to suspend or terminate all associated accounts.</li>
                </ul>
                
                <h4>10. Fraud Prevention</h4>
                <p>The platform reserves the right to investigate any suspicious activity including:</p>
                <ul>
                  <li>unusual gameplay patterns</li>
                  <li>multiple accounts from the same device or IP</li>
                  <li>attempts to exploit system errors</li>
                </ul>
                <p>Accounts involved in fraudulent activities may be blocked and winnings may be cancelled.</p>
                
                <h4>11. Skill-Based Game Disclaimer</h4>
                <p>This quiz platform is designed as a knowledge and skill-based educational game. Winning depends on the participant’s ability to answer questions correctly and is not based on luck or chance.</p>
                
                <h4>12. Payment and Refund Policy</h4>
                <ul>
                  <li>The ₹8 entry fee is non-refundable once a quiz session begins.</li>
                  <li>Refunds may only be considered if a technical error prevents the user from accessing the quiz after payment.</li>
                </ul>
                
                <h4>13. Technical Issues</h4>
                <p>The platform is not responsible for issues arising from:</p>
                <ul>
                  <li>internet connectivity problems</li>
                  <li>device compatibility issues</li>
                  <li>temporary server downtime</li>
                </ul>
                <p>However, the platform will make reasonable efforts to ensure smooth service.</p>
                
                <h4>14. Account Responsibility</h4>
                <p>Users are responsible for maintaining the confidentiality of their login credentials. Any activity occurring through the user’s account will be considered the responsibility of the account holder.</p>
                
                <h4>15. Intellectual Property</h4>
                <p>All quiz questions, content, designs, logos, and materials on this website are the property of the platform and may not be copied, reproduced, or distributed without permission.</p>
                
                <h4>16. Modification of Terms</h4>
                <p>The platform reserves the right to update or modify these Terms and Conditions at any time. Continued use of the platform after such changes implies acceptance of the updated terms.</p>
                
                <h4>17. Account Suspension or Termination</h4>
                <p>The platform reserves the right to suspend or permanently terminate any user account that violates these Terms and Conditions or engages in suspicious or illegal activities.</p>
                
                <h4>18. Limitation of Liability</h4>
                <p>The platform shall not be liable for any losses, damages, or claims arising from the use of this website or participation in the quiz game.</p>
                
                <h4>19. Governing Law</h4>
                <p>These Terms and Conditions shall be governed by the laws of India. Any disputes arising shall fall under the jurisdiction of the competent courts in India.</p>

                <div className="mt-4">
                  <Form.Check
                    type="checkbox"
                    label="I agree to the Terms and Conditions"
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mb-3"
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" className="agree-btn"
                onClick={() => {
                  setShowTermsModal(false);
                  setTermsAccepted(false);
                }}
              >
                Decline
              </Button>
              <Button 
                variant="primary" className="agree-btn"
                onClick={() => {
                  setShowTermsModal(false);
                  setTermsAccepted(true);
                }}
              >
                I Agree
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </>
  );
}

export default KheloJito;
