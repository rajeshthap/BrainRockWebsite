import React, { useState, useContext, useEffect } from "react";
import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import ModifyAlert from "../alerts/ModifyAlert";
import DevoteeImg from "../../assets/images/login.svg";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, loading: authLoading, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email_or_phone: "",
    password: "",
    role: "candidate",
  });
  
  const isAdminRoute =
    typeof location !== "undefined" &&
    location.pathname.toLowerCase().includes("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setFormData((prev) => ({ ...prev, role: "admin" }));
    }
  }, [isAdminRoute]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showModifyAlert, setShowModifyAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [showCandidateWarning, setShowCandidateWarning] = useState(false);

  // Function to clear all cookies
  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie =
        name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  };

  // This effect runs when the component mounts to clear cookies
  useEffect(() => {
    clearAllCookies();
    if (logout) {
      logout({ redirect: false });
    }
    window.history.replaceState({}, document.title);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Combined useEffect for handling redirection based on user role
  useEffect(() => {
    if (user) {
      if (showCandidateWarning && showModifyAlert) {
        return;
      }

      if (user.role === "admin") {
        navigate("/WebsiteManagement", {
          state: { unique_id: user.id },
          replace: true,
        });
        return;
      }

      if (user.role === "candidate") {
        navigate("/InterviewTest", {
          state: { unique_id: user.unique_id },
          replace: true,
        });
        return;
      }

      if (user.role === "training") {
        navigate("/TrainingDashBoard", {
          state: { unique_id: user.unique_id },
          replace: true,
        });
        return;
      }

      if (user.role === "khelo-aur-jeeto") {
        navigate("/UserDashBoard", {
          state: { unique_id: user.id },
          replace: true,
        });
        return;
      }

      const matchingCourse = courses.find(
        (course) =>
          course.course_name.toLowerCase() === user.role.toLowerCase()
      );

      if (matchingCourse) {
        navigate("/TrainingDashBoard", {
          state: { unique_id: user.unique_id },
          replace: true,
        });
        return;
      }

      navigate("/", {
        state: { unique_id: user.id },
        replace: true,
      });
    }
  }, [user, navigate, courses, showCandidateWarning, showModifyAlert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAlertClose = () => {
    setShowModifyAlert(false);
    setShowCandidateWarning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage("");
    setShowModifyAlert(false);

    if (
      !formData.email_or_phone ||
      !formData.password ||
      !formData.role ||
      formData.role === "Select Role"
    ) {
      setAlertMessage("Please fill in all fields");
      setShowModifyAlert(true);
      return;
    }

    try {
      const result = await login(
        formData.email_or_phone,
        formData.password,
        formData.role
      );

      if (!result || !result.success) {
        let errorMessage = "Login failed. Please check your credentials.";
        
        // Strictly extract ONLY the text message from the API error
        if (result?.error) {
          if (typeof result.error === "string") {
            errorMessage = result.error;
          } else if (typeof result.error === "object" && result.error !== null) {
            if (typeof result.error.message === "string") {
              errorMessage = result.error.message;
            } else if (typeof result.error.detail === "string") {
              errorMessage = result.error.detail;
            } else if (Array.isArray(result.error.non_field_errors)) {
              errorMessage = result.error.non_field_errors.join(" ");
            } else if (Array.isArray(result.error)) {
              errorMessage = result.error.join(" ");
            } else {
              // Fallback if it's an unknown object structure
              const firstVal = Object.values(result.error).find(
                (v) => typeof v === "string" || Array.isArray(v)
              );
              if (typeof firstVal === "string") errorMessage = firstVal;
              else if (Array.isArray(firstVal)) errorMessage = firstVal.join(" ");
            }
          }
        } else if (result?.message && typeof result.message === "string") {
          errorMessage = result.message;
        } else if (result?.detail && typeof result.detail === "string") {
          errorMessage = result.detail;
        }

        // Show ONLY the exact error text message
        setAlertMessage(errorMessage);
        setShowModifyAlert(true);
      } else {
        // Login was successful
        if (formData.role === "candidate") {
          setAlertMessage("Login successfully. Candidate login will expire after 24 hours.");
          setShowModifyAlert(true);
          setShowCandidateWarning(true);
        }
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Catch block to handle network/axios errors and show exact text only
      if (error?.response?.data) {
        const errData = error.response.data;
        if (typeof errData === "string") {
          errorMessage = errData;
        } else if (typeof errData === "object" && errData !== null) {
          if (typeof errData.detail === "string") errorMessage = errData.detail;
          else if (typeof errData.message === "string") errorMessage = errData.message;
          else if (Array.isArray(errData.non_field_errors)) errorMessage = errData.non_field_errors.join(" ");
          else {
            const firstVal = Object.values(errData).find(
              (v) => typeof v === "string" || Array.isArray(v)
            );
            if (typeof firstVal === "string") errorMessage = firstVal;
            else if (Array.isArray(firstVal)) errorMessage = firstVal.join(" ");
          }
        }
      } else if (error?.message && typeof error.message === "string") {
        errorMessage = error.message;
      }

      setAlertMessage(errorMessage);
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
                  <Col
                    lg={6}
                    md={6}
                    sm={12}
                    className="d-flex justify-content-center align-items-center login-img"
                  >
                    <img src={DevoteeImg} className="img-fluid" alt="Login" />
                  </Col>
                  <Col lg={6} md={6} sm={12} className="p-4">
                    <div>
                      <h1>Login</h1>
                    </div>

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
                      <div
                        className="password-wrapper"
                        style={{ position: "relative" }}
                      >
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
                          className={`fa ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          } toggle-password`}
                          onClick={() =>
                            !authLoading && setShowPassword(!showPassword)
                          }
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

                    {/* Role */}
                    <Form.Group className="mb-3">
                      <Form.Label className="br-label">
                        Role <span className="br-span-star">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="br-form-control"
                        readOnly
                      />
                    </Form.Group>

                    {/* Buttons */}
                    <div className="br-btn-submit text-center mt-3">
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="btn-login"
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
      
      {/* Modify Alert Box */}
      <ModifyAlert
        message={alertMessage}
        show={showModifyAlert}
        setShow={handleAlertClose}
      />
    </>
  );
}