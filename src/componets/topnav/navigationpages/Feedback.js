import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/Trainingregistration.css";
import FooterPage from "../../footer/FooterPage";

function Feedback() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // LIVE VALIDATION
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
  };

  // FINAL VALIDATION BEFORE SUBMIT
  const validateFormBeforeSubmit = () => {
    let temp = {};

    if (!formData.full_name) temp.full_name = "Full name is required";
    if (!formData.email) temp.email = "Email is required";
    if (!formData.phone) temp.phone = "Phone number is required";
    if (!formData.message) temp.message = "Message is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormBeforeSubmit()) return;

    try {
      const response = await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/feedback/",
        formData
      );

      setSuccessMsg("Feedback submitted successfully!");

      // RESET FORM
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Feedback submission error:", error);
      
      // Handle API errors for duplicate email/phone
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = {};
        
        if (error.response.data.errors.email && Array.isArray(error.response.data.errors.email)) {
          apiErrors.email = "Email already exists. Please use a different email.";
        }
        
        if (error.response.data.errors.phone && Array.isArray(error.response.data.errors.phone)) {
          apiErrors.phone = "Phone number already exists. Please use a different number.";
        }
        
        if (Object.keys(apiErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...apiErrors }));
        }
      }
    }
  };

  return (
    <div className="ourteam-section">
      <Container className="mt-4">
        <div className="ourteam-box text-heading">
          <h3 className="text-center mb-3">Feedback Form</h3>

          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Full Name */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">
                    Full Name <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="br-form-control"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.full_name}
                  </Form.Control.Feedback>
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
                    className="br-form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Phone */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">
                    Phone Number <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="br-form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.phone}
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
                    rows={4}
                    className="br-form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message"
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center">
              <Button type="submit" className="mt-4" variant="primary">
                Submit Feedback
              </Button>
            </div>
          </Form>
        </div>
      </Container>
       <Container fluid className="br-footer-box">
        
          <FooterPage />
      </Container>
    </div>
  );
}

export default Feedback;