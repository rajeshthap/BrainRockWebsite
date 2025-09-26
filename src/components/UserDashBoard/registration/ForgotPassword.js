import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Row, Col, } from "react-bootstrap";
//import { FaEye, FaEyeSlash } from "react-icons/fa";
 
 
import { Container } from "react-bootstrap";
 
const isPhone = (value) => /^\d{10}$/.test(value);
 
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirm_password: "",
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
 
  // Auto-fill phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem("phone");
    if (savedPhone) {
      setFormData((prev) => ({ ...prev, phone: savedPhone }));
    }
  }, []);
 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    setErrors("");
    setOtpMessage("");
    setOtpError("");
  };

  // Send OTP handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpMessage("");
    setOtpError("");
    if (!formData.phone) {
      setOtpError("Please enter your registered phone number.");
      return;
    }
    if (!isPhone(formData.phone)) {
      setOtpError("Please enter a valid 10-digit phone number.");
      return;
    }
    try {
      setOtpLoading(true);
      const res = await axios.post(
        "https://brjobsedu.com/Attendence_portal/api/Sendotp/",
        { phone: formData.phone }
      );
      setOtpMessage(res.data.message || "OTP sent successfully.");
      setOtpSent(true);
    } catch (error) {
      setOtpError(error.response?.data?.error || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { phone, password, confirm_password } = formData;
 
    if (!phone || !password || !confirm_password) {
      setErrors("All fields are required.");
      return;
    }
 
    if (!isPhone(phone)) {
      setErrors("Please enter a valid 10-digit phone number.");
      return;
    }
 
    if (password !== confirm_password) {
      setErrors("Passwords do not match.");
      return;
    }
 
    const payload = {
      phone: formData.phone,
      password: formData.password,
    };
 
    try {
      setLoading(true);
      const response = await axios.put("https://brjobsedu.com/Attendence_portal/api/Fogerpassword/", payload);
 
      setMessage(response.data.message || "Password reset successful.");
      setFormData({ phone: "", password: "", confirm_password: "" });
 
      setTimeout(() => {
        navigate("/UserLogin");
      }, 2000);
    } catch (error) {
      setErrors(error.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Container className="mt-4">
      <div className="forgot-container">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit} className="forgot-form">
          <Row>
            <Form.Group className="mb-3">
              <Col lg={12}>
                <Form.Control
                  type="number"
                  name="phone"
                  placeholder="Enter Registered Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={otpSent}
                />
              </Col>
            </Form.Group>
            <Col lg={12} className="mb-3">
              <Button
                variant="secondary"
                onClick={handleSendOtp}
                disabled={otpLoading || otpSent}
                style={{ width: "100%" }}
              >
                {otpLoading ? "Sending OTP..." : otpSent ? "OTP Sent" : "Send OTP"}
              </Button>
              {otpMessage && <p className="success">{otpMessage}</p>}
              {otpError && <p className="error">{otpError}</p>}
            </Col>
            {/* OTP input and verify button */}
            {otpSent && !otpVerified && (
              <>
                <Form.Group className="mb-3">
                  <Col lg={12}>
                    <Form.Control
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Form.Group>
                <Col lg={12} className="mb-3">
                  <Button
                    variant="primary"
                    onClick={async (e) => {
                      e.preventDefault();
                      setOtpMessage("");
                      setOtpError("");
                      if (!formData.otp) {
                        setOtpError("Please enter the OTP.");
                        return;
                      }
                      try {
                        setOtpLoading(true);
                        const data = await axios.post(
                          "https://brjobsedu.com/Attendence_portal/api/Verifyotp/",
                          { phone: formData.phone, otp: formData.otp }
                        );
                        setOtpMessage("");
                        setOtpVerified(true);
                        setMessage("OTP verified successfully!");
                      } catch (error) {
                        setOtpError(error.response?.data?.error || "Failed to verify OTP.");
                      } finally {
                        setOtpLoading(false);
                      }
                    }}
                    disabled={otpLoading}
                    style={{ width: "100%" }}
                  >
                    {otpLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  {otpMessage && <p className="success">{otpMessage}</p>}
                  {otpError && <p className="error">{otpError}</p>}
                </Col>
              </>
            )}
            {/* Show password fields and reset button only after OTP is verified */}
            {otpVerified && (
              <>
                <Form.Group className="mb-3">
                  <Col lg={12}>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Col lg={12}>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      placeholder="Confirm Password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Form.Group>
                <Col lg={12}>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                  {message && <p className="success">{message}</p>}
                  {errors && <p className="error">{errors}</p>}
                </Col>
              </>
            )}
          </Row>
        </form>
      </div>
    </Container>
  );
};
 
export default ForgotPassword;
 
 