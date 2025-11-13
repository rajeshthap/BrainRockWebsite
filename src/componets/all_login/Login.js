import React, { useState } from "react";
import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ModifyAlert from "../alerts/ModifyAlert";
import DevoteeImg from "../../assets/images/women.jpg"; // Reused for Employee
import PanditImg from "../../assets/images/women.jpg"; // Reused for HR
import TempleImg from "../../assets/images/women.jpg"; // Reused for Client
import AdminImg from "../../assets/images/women.jpg"; // Reused for Admin/Administrator
import DefaultImg from "../../assets/images/women.jpg"; // Reused for Manager
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({
    role: "admin",
    email_or_phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModifyAlert, setShowModifyAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  const roleImages = {
    admin: AdminImg,
    hr: PanditImg,
    employe: DevoteeImg,
    client: TempleImg,
    administrator: AdminImg,
    manager: DefaultImg,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email_or_phone || !formData.password) {
      setAlertMessage("Please fill in all fields");
      setShowModifyAlert(true);
      return;
    }

    setLoading(true);
    try {
      // NOTE: Ensure your backend API endpoint can handle these new roles.
      const res = await axios.post(`api/login/`, formData);
      const { unique_id } = res.data;

      // Redirect based on the selected role
      switch (formData.role.toLowerCase()) {
        case "admin":
          navigate("/AdminDashBoard", { state: { unique_id } });
          break;
        case "hr":
          navigate("/HRDashboard", { state: { unique_id } });
          break;
        case "employe":
          navigate("/EmployeeDashboard", { state: { unique_id } });
          break;
        case "client":
          navigate("/ClientDashboard", { state: { unique_id } });
          break;
        case "administrator":
          navigate("/AdministratorDashboard", { state: { unique_id } });
          break;
        case "manager":
          navigate("/ManagerDashboard", { state: { unique_id } });
          break;
        default:
          navigate("/", { state: { unique_id } });
      }

      setAlertMessage("Login successful!");
      setShowModifyAlert(true);
    } catch (err) {
      setAlertMessage(err.response?.data?.detail || "Invalid username or password");
      setShowModifyAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const roleHeading = formData.role
    ? `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Login`
    : "Login";

  const roleImage = roleImages[formData.role] || DefaultImg;

  return (
    <div className="temp-donate">
      <Container className="temp-container">
        <div className="temple-registration-heading">
          <h1>{roleHeading}</h1>
          <Form onSubmit={handleSubmit}>
            <Row className="mt-3">
              <Col lg={6} md={6}>
                {/* Role Selection */}
                <Form.Group className="mb-3">
                  <Form.Label className="temp-label ">
                    Login As <span className="temp-span-star">*</span>
                  </Form.Label>
                  <Form.Select
                    name="role"
                    className="temp-form-control-option-bg"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value.toLowerCase(),
                      })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="hr">HR</option>
                    <option value="employe">Employee</option>
                    <option value="client">Client</option>
                    <option value="administrator">Administrator</option>
                    <option value="manager">Manager</option>
                  </Form.Select>
                </Form.Group>

                {/* Email / Mobile */}
                <Form.Group className="mb-3">
                  <Form.Label className="temp-label">
                    Email or Mobile Number{" "}
                    <span className="temp-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="email_or_phone"
                    value={formData.email_or_phone}
                    onChange={handleChange}
                    placeholder="Registered Mobile No. / Email"
                    className="temp-form-control-bg"
                  />
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="temp-label">
                    Password <span className="temp-span-star">*</span>
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
                      className="temp-form-control-bg"
                    />
                    <i
                      className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"
                        } toggle-password`}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    ></i>
                  </div>
                </Form.Group>

                {/* Buttons */}
                <div className="d-grid gap-3 text-center mt-3">
                  <Button
                    variant="danger"
                    type="submit"
                    disabled={loading}
                    className="temp-submit-btn"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                  <Button
                    variant="danger"
                    className="temp-submit-btn-login"
                    type="button"
                    onClick={() => navigate("/ForgotPassword")}
                  >
                    Forgot Password ?
                  </Button>
                </div>
              </Col>

              <Col
                lg={6}
                md={6}
                sm={12}
                className="d-flex justify-content-center align-items-center"
              >
                <img
                  src={roleImage}
                  className="img-fluid"
                  alt={`${formData.role} Login`}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </Container>

      {/* Alert */}
      <ModifyAlert
        message={alertMessage}
        show={showModifyAlert}
        setShow={setShowModifyAlert}
      />
    </div>
  );
}