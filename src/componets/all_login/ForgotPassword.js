import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("phone");
  const [role, setRole] = useState("hr");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const maskPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 4) return phoneNumber;
    return "xxx" + phoneNumber.slice(-4);
  };

  // Live validation for phone number
  const validatePhone = (value) => {
    const phoneError = !value.trim()
      ? "Phone number is required"
      : !/^\d{10}$/.test(value)
      ? "Phone number must be exactly 10 digits"
      : "";

    setErrors((prev) => ({ ...prev, phone: phoneError }));
    return !phoneError;
  };

  // Live validation for OTP
  const validateOtp = (value) => {
    const otpError = !value.trim()
      ? "OTP is required"
      : !/^\d{6}$/.test(value)
      ? "OTP must be 6 digits"
      : "";

    setErrors((prev) => ({ ...prev, otp: otpError }));
    return !otpError;
  };

  // Live validation for password
  const validatePassword = (value) => {
    const passwordError = !value.trim()
      ? "Password is required"
      : value.length < 6
      ? "Password must be at least 6 characters"
      : "";

    setErrors((prev) => ({ ...prev, password: passwordError }));
    return !passwordError;
  };

  // Live validation for confirm password
  const validateConfirmPassword = (value) => {
    const confirmPasswordError = !value.trim()
      ? "Please confirm your password"
      : value !== newPassword
      ? "Passwords do not match"
      : "";

    setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
    return !confirmPasswordError;
  };

 // Send OTP
const handleSendOtp = async (e) => {
  e.preventDefault();

  if (!validatePhone(phone)) return;

  setIsLoading(true);
  setApiError("");

  try {
    const response = await fetch(
      "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/send-otp-password-change/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          phone,
        }),
      }
    );

    // FIX 1: Parse JSON response before using it
    const data = await response.json();

    // FIX 2: Now you can use data safely
    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    setSuccessMessage("OTP sent successfully!");
    setCurrentStep("otp");
    setOtpSent(true);
    startResendTimer();
  } catch (error) {
    setApiError(error.message || "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!validateOtp(otp)) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/verify-otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      setSuccessMessage("OTP verified successfully!");
      setCurrentStep("password");
    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !validatePassword(newPassword) ||
      !validateConfirmPassword(confirmPassword)
    )
      return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/change-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccessMessage("Password changed successfully!");
      setCurrentStep("success");
    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/send-otp-password-change/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setSuccessMessage("OTP resent successfully!");
      startResendTimer();
    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    validatePhone(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    validateOtp(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);

    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  return (
    <>
      <Container
        fluid
        className="dashboard-body d-flex align-items-center justify-content-center"
      >
        <Row className="w-100 justify-content-center">
          <Col lg={5} md={7} sm={10}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <FaLock className="mb-3" size={48} />
                  <h3>Forgot Password</h3>
                  <p className="text-muted br-label">
                    {currentStep === "phone" &&
                      "Enter your phone number to receive a verification code"}
                    {currentStep === "otp" &&
                      "Enter verification code sent to your phone"}
                    {currentStep === "password" && "Create a new password"}
                    {currentStep === "success" &&
                      "Your password has been changed successfully"}
                  </p>
                </div>

                {/* Error and Success Messages */}
                {apiError && (
                  <Alert className=" alert-danger mb-3">{apiError}</Alert>
                )}

                {successMessage && (
                  <Alert className="alert-success mb-3">{successMessage}</Alert>
                )}

                {/* Step 1: Phone Number */}
                {currentStep === "phone" && (
                  <Form onSubmit={handleSendOtp}>
                    <Form.Group className="mb-3" controlId="role">
                      <Form.Label className="br-label">Select Role</Form.Label>
                      <Form.Select
                        className="br-form-control"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="hr">HR</option>
                        <option value="employee">Employee</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="phone">
                      <Form.Label className="br-label">
                        Phone Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        className="br-form-control"
                        type="tel"
                        placeholder="Enter your 10-digit phone number"
                        value={phone}
                        onChange={handlePhoneChange}
                      />
                      {errors.phone && (
                        <div className="br-alert-feedback mt-2">
                          {errors.phone}
                        </div>
                      )}
                    </Form.Group>
<div className="text-center" >
                    <Button
                      type="submit"
                      className="br-submit-btn m-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="br-submit-btn"
                          />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                    <Button
                      className="br-submit-btn"
                      onClick={() => navigate("/Login")}
                    >
                     
                      Cancel
                    </Button>
                    </div>
                  </Form>
                )}

                {/* Step 2: OTP Verification */}
                {currentStep === "otp" && (
                  <Form onSubmit={handleVerifyOtp}>
                    <Form.Group className="mb-4" controlId="otp">
                      <Form.Label className="br-label">
                        Verification Code <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        className="br-form-control text-center"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                      />
                      {errors.otp && (
                        <div className="br-alert-feedback mt-2">
                          {errors.otp}
                        </div>
                      )}
                      <Form.Text className="text-muted">
                        We've sent a verification code to{" "}
                        {maskPhoneNumber(phone)}
                      </Form.Text>
                    </Form.Group>
<div className="text-center" >
                    <Button
                      type="submit"
                      className="br-submit-btn m-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                    <Button
                      className="br-submit-btn"
                      onClick={() => navigate("/Login")}
                    >
                      
                      Cancel
                    </Button>
</div>
                    <div className="text-center">
                      <Button
                        className="p-0 text-decoration-none"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || isLoading}
                      >
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                      </Button>
                    </div>
                  </Form>
                )}

                {/* Step 3: Change Password */}
                {currentStep === "password" && (
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label className="br-label">
                        New Password <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        className="br-form-control"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                      />
                      {errors.password && (
                        <div className="br-alert-feedback mt-2">
                          {errors.password}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="confirmPassword">
                      <Form.Label className="br-label">
                        Confirm Password <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        className="br-form-control"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                      />
                      {errors.confirmPassword && (
                        <div className="br-alert-feedback mt-2">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </Form.Group>
<div className="text-center">
                    <Button
                      type="submit"
                      className="br-submit-btn m-2"
                      disabled={isLoading} 
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Changing Password...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                    <Button
                      className="br-submit-btn"
                      onClick={() => navigate("/Login")}
                    >
                      Cancel
                    </Button>
                    </div>
                  </Form>
                )}

                {/* Step 4: Success */}
                {currentStep === "success" && (
                  <div className="text-center">
                    <FaCheckCircle className="text-success mb-3" size={30} />
                    <h3 className="mb-3">Password Changed Successfully!</h3>
                    <p className="text-muted mb-4">
                      Your password has been updated. You can now log in with
                      your new password.
                    </p>
                    <Button
                      className="br-submit-btn"
                      onClick={() => navigate("/Login")}
                    >
                      Go to Login
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ForgotPassword;
