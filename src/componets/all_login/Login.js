import React, { useState, useContext, useEffect } from "react";
import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import ModifyAlert from "../alerts/ModifyAlert";
import DevoteeImg from "../../assets/images/women.jpg";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
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
      logout();
    }
  }, []);

  // This effect runs when the 'user' object is set in the context after a successful login
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { state: { unique_id: user.id }, replace: true });
      } else {
        // Use the role from the 'user' object for secure redirection
        switch (user.role?.toLowerCase()) {
          case "admin":
            navigate("/HrDashBoard", { state: { unique_id: user.id }, replace: true });
            break;
          case "hr":
            navigate("/HrDashBoard", { state: { unique_id: user.id }, replace: true });
            break;
          case "employe":
            navigate("/EmployeeDashboard", { state: { unique_id: user.id }, replace: true });
            break;
          case "client":
            navigate("/ClientDashboard", { state: { unique_id: user.id }, replace: true });
            break;
          case "administrator":
            navigate("/AdministratorDashboard", { state: { unique_id: user.id }, replace: true });
            break;
          case "manager":
            navigate("/ManagerDashboard", { state: { unique_id: user.id }, replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }
    }
  }, [user, navigate, location.state]);

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

    const success = await login(formData.email_or_phone, formData.password);

    if (!success) {
      setAlertMessage("Login failed. Please check your credentials.");
      setShowModifyAlert(true);
    }
  };

  return (
    <>
      <Container fluid className="dashboard-body">
        <div className="br-box-container">
          <div className="br-registration-heading">
            <h1>Login</h1>
            <Form onSubmit={handleSubmit}>
              <Row className="mt-3">
                <Col lg={6} md={6} sm={12}>
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

                  {/* Buttons */}
                  <div className="gap-3 d-flex justify-content-between br-btn-submit text-center mt-3">
                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="w-20 br-submit-btn"
                    >
                      {authLoading ? "Logging in..." : "Login"}
                    </Button>
                    <span
                      className="forgot-btn mx-3"
                      type="button"
                      onClick={() => navigate("/ForgotPassword")}
                      disabled={authLoading}
                    >
                      Forgot Password ?
                    </span>
                  </div>
                </Col>

                <Col lg={6} md={6} sm={12} className="d-flex justify-content-center align-items-center">
                  <img src={DevoteeImg} className="img-fluid" alt="Login" />
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Container>

      <ModifyAlert
        message={alertMessage}
        show={showModifyAlert}
        setShow={setShowModifyAlert}
      />
    </>
  );
}