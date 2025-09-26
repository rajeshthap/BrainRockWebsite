import React, { useState } from "react";
import { Form, Button, Row, Col, InputGroup, Container } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
 
// import "../Login/assets/Style.css";
 
const UserRegistration = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
   confirmPassword: "",
    phone_number: "",
    Designation: "",
    photo: null,
  });
 
 
  const [errorReason_querys, setErrorReason_querys] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
 
   const navigate = useNavigate();
 
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    let newValue = type === "file" ? files[0] : value;
 
    if (name === "phone_number") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) newValue = digitsOnly;
      else return;
    }
 
    setFormData({ ...formData, [name]: newValue });
    setErrorReason_querys((prev) => ({ ...prev, [name]: "" })); // clear only that field error
  };
 
  const validateForm = () => {
    let errors = {};
 
    if (!formData.first_name) errors.first_name = "First name is required.";
    if (!formData.last_name) errors.last_name = "Last name is required.";
    if (!formData.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
      errors.email = "Enter a valid email address.";
    if (
      !formData.password ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/.test(formData.password)
    )
      errors.password = "Password must be 8+ chars with uppercase, lowercase, number & symbol.";
    if (formData.confirmPassword !== formData.password)
      errors.confirmPassword = "Passwords do not match.";
    if (!/^\d{10}$/.test(formData.phone_number))
      errors.phone_number = "Phone number must be 10 digits.";
    if (!formData.Designation) errors.Designation = "Select a designation.";
    if (!formData.photo) errors.photo = "Please upload a photo.";
 
    setErrorReason_querys(errors);
    return Object.keys(errors).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
 
    setLoading(true);
    try {
      const submission = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submission.append(key, value);
      });
 
      const response = await axios.post(
        "https://brjobsedu.com/Attendence_portal/api/register/", //
        submission,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
 
      console.log(" API response:", response.data);
 
         // Extract userId from response
      const userId = response.data?.id || response.data?.user?.id;
      if (!userId) throw new Error("User ID not returned by API");
 
          // Save locally
     localStorage.setItem(
      "userRegistrationData",
      JSON.stringify({ ...formData, id: userId })
       );
       localStorage.setItem("autoId", userId);
 
       //  Send OTP
      const res=await axios.post(
      "https://brjobsedu.com/Attendence_portal/api/Sendotp/",
      { phone: formData.phone_number }
     );
 
     localStorage.setItem('phone',response.data.phone_number)
     localStorage.setItem('otp',res.data.otp)
 
       alert(" Registered successfully! OTP sent to your phone.");
 
       //   Navigate to OTP Verification page
     navigate("/UserVerifyOtp", {
      state: { phone: formData.phone_number, userId },
      });
     
 
      // reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone_number: "",
        Designation: "",
        photo: null,
      });
      setErrorReason_querys({});
 
   
 
    } catch (error) {
  if (error.response) {
    console.error(" API Error:", error.response.data);
 
    // Show backend error (email already exists, etc.)
    alert(JSON.stringify(error.response.data));
  } else {
    console.error(" Network Error:", error.Reason_query);
    alert("Network error. Please try again later.");
  }
 }finally {
      setLoading(false);
    }
  };
 
  return (
   <Container className="register-box">
      <Form onSubmit={handleSubmit}>
        <Row>
          <h4 className="fw-bold">Registration</h4>
            <p className="text-muted mb-4">Please fill in the details below.</p>
        </Row>
 
 
        <Row>
         <Col md={6} lg={6} sm={12}>  <Form.Group className="mb-3">
              <Form.Label>First Name<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              {errorReason_querys.first_name && <div className="text-danger">{errorReason_querys.first_name}</div>}
            </Form.Group></Col>
 
          <Col md={6} lg={6} sm={12}> <Form.Group className="mb-3">
              <Form.Label>Last Name<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
              {errorReason_querys.last_name && <div className="text-danger">{errorReason_querys.last_name}</div>}
            </Form.Group></Col>
 
          <Col md={6} lg={6} sm={12}>
          <Form.Group className="mb-3">
              <Form.Label>Email<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}/>
              {errorReason_querys.email && <div className="text-danger">{errorReason_querys.email}</div>}
            </Form.Group>
                 </Col>
 
 
          <Col md={6} lg={6} sm={12}>
              <Form.Group className="mb-3">
              <Form.Label>Password<span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {errorReason_querys.password && <div className="text-danger">{errorReason_querys.password}</div>}
            </Form.Group>
            </Col>
 
 
          <Col md={6} lg={6} sm={12}>
          <Form.Group className="mb-3">
              <Form.Label>Confirm Password<span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <InputGroup.Text onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {errorReason_querys.confirmPassword && <div className="text-danger">{errorReason_querys.confirmPassword}</div>}
            </Form.Group>
            </Col>
 
 
          <Col md={6} lg={6} sm={12}>
          <Form.Group className="mb-3">
              <Form.Label>Phone Number<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                maxLength={10}
              />
              {errorReason_querys.phone_number && <div className="text-danger">{errorReason_querys.phone_number}</div>}
            </Form.Group>
                  </Col>
 
          <Col md={6} lg={6} sm={12}>
          <Form.Group className="mb-3">
              <Form.Label>Designation<span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="Designation"
                value={formData.Designation}
                onChange={handleInputChange}
              >
                <option value="">Select designation</option>
                <option value="">Project Manager</option>
                <option value="">UI/UX Designer</option>
                <option value="">Software Developer/Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="">Backend Developer</option>
                <option value="">Full Stack Developer</option>
                <option value="">Quality Assurance (QA)Engineer</option>
              </Form.Select>
              {errorReason_querys.Designation && <div className="text-danger">{errorReason_querys.Designation}</div>}
            </Form.Group>
            </Col>
 
          <Col md={6} lg={6} sm={12}>
          <Form.Group className="mb-3">
              <Form.Label>Upload Photo<span className="text-danger">*</span></Form.Label>
              {formData.photo && (
                <img
                  src={URL.createObjectURL(formData.photo)}
                  alt="Preview"
                  width={100}
                  className="rounded-circle mb-2"
                />
              )}
              <Form.Control type="file" accept="image/*" name="photo" onChange={handleInputChange} />
              {errorReason_querys.photo && <div className="text-danger">{errorReason_querys.photo}</div>}
            </Form.Group>
            </Col>
 
          <Col md={6} lg={6} sm={12}>
           <Button
              type="submit"
              variant="primary"
              className="w-100 mt-3 d-flex justify-content-center align-items-center btn-register"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registering...
                </>
              ) : (
                "Register Now"
                  )}
            </Button>
          </Col>
 
        </Row>
        <Row className="">
          <Col md={12}>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};
 
export default UserRegistration;
 
 