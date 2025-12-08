import React, { useState, useContext, useEffect } from "react";
import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import ModifyAlert from "../alerts/ModifyAlert";
import DevoteeImg from "../../assets/images/login.svg";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const trainingRoles = [
    "Professional Corporate Training",
    "Industrial Training Program",
    "Full-Stack Web Development Training",
    "Advanced Internship Program",
    "On-Job Training (OJT)",
    "JAVA/ Python",
    "Fundamentals of Graphic Design",
    "Advanced Creative Designing",
    "UI/UX & Web Graphics",
    "Video Editing & Motion Graphics",
    "Digital Marketing Certification",
    "Programming with Java",
    "Programming with Python",
    "WordPress Development",
    "Core PHP Development",
    "Advanced PHP & MVC Frameworks",
    "C Programming",
    "C++ Programming",
    "Basic Computer Essentials (3 Months)",
    "Advanced Computer Operations (6 Months)",
    "Professional Computer Certification (1 Year)",
  ];

  const { login, loading: authLoading, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email_or_phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModifyAlert, setShowModifyAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Function to clear all cookies
  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  };

  // This effect runs when the component mounts to clear cookies
  useEffect(() => {
    clearAllCookies();

    // If there's a logout function in AuthContext, call it
    if (logout) {
      // When mounting the Login page, clear auth without navigating.
      logout({ redirect: false });
    }

    // Clear any location state to prevent redirects to previous pages
    window.history.replaceState({}, document.title);
  }, []);

  // Combined useEffect for handling redirection based on user role
  useEffect(() => {
    if (user) {
      // First check for admin role (highest priority)
      if (user.role === "admin") {
        navigate("/ManageOurTeam", {
          state: { unique_id: user.id },
          replace: true,
        });
        return;
      }

      // Then check for training roles
      if (trainingRoles.includes(user.role)) {
        navigate("/TrainingDashBoard", {
          state: { unique_id: user.unique_id },
          replace: true,
        });
        return;
      }

      // Default redirect to HR Dashboard for all other roles
      navigate("/HrDashBoard", {
        state: { unique_id: user.id },
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage("");

    if (!formData.email_or_phone || !formData.password) {
      setAlertMessage("Please fill in all fields");
      setShowModifyAlert(true);
      return;
    }

    const result = await login(formData.email_or_phone, formData.password);

    if (!result || !result.success) {
      setAlertMessage(result?.error?.message || "Login failed. Please check your credentials.");
      setShowModifyAlert(true);
    }
  };

  return (
    <>
      <div className="login-box">
        <Container className="dashboard-body">
          <div className="br-box-container">
            <div className="br-registration-heading">

              <Form onSubmit={handleSubmit}>
                <Row className="mt-3">
                  <Col lg={6} md={6} sm={12} className="d-flex justify-content-center align-items-center">
                    <img src={DevoteeImg} className="img-fluid" alt="Login" />
                  </Col>
                  <Col lg={6} md={6} sm={12} className="p-4">

                    <div> <h1>Login</h1></div>
                    {/* Email / Mobile */}
                    <Form.Group className="mb-3">
                      <Form.Label className="br-label">
                        Email or Mobile Number{" "}
                        <span className="br-span-star">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="email_or_phone"
                        value={formData.email_or_phone}
                        onChange={handleChange}
                        placeholder="Registered Mobile No. / Email"
                        className="br-form-control"
                        disabled={authLoading}
                      />
                    </Form.Group>

                    {/* Password */}
                    <Form.Group className="mb-3">
                      <Form.Label className="br-label">
                        Password <span className="br-span-star">*</span>
                      </Form.Label>
                      <div className="password-wrapper" style={{ position: "relative" }}>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Your Password"
                          className="br-form-control"
                          disabled={authLoading}
                        />
                        <i
                          className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                          onClick={() => !authLoading && setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: authLoading ? "not-allowed" : "pointer",
                          }}
                        ></i>
                      </div>
                    </Form.Group>
                    <div> <span
                      className="forgot-btn mx-1"
                      type="button"
                      onClick={() => navigate("/ForgotPassword")}
                      disabled={authLoading}
                    >
                      Forgot Password ?
                    </span></div>
                    {/* Buttons */}
                    <div className="br-btn-submit text-center mt-3">
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className=" btn-login"
                      >
                        {authLoading ? "Logging in..." : "Login"}
                      </Button>

                    </div>
                  </Col>


                </Row>
              </Form>
            </div>
          </div>
        </Container>
      </div>
      <ModifyAlert
        message={alertMessage}
        show={showModifyAlert}
        setShow={setShowModifyAlert}
      />
    </>
  );
}