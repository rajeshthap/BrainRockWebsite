import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert, Spinner, InputGroup, Card } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaPercentage } from "react-icons/fa";
import "../../../assets/css/Trainingregistration.css";
import FooterPage from "../../footer/FooterPage";

function TrainingRegistration({ courseTitle, courseDuration, onCourseChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState([]);
  const [maxDate, setMaxDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
const [acceptTerms, setAcceptTerms] = useState(false);
const [termsError, setTermsError] = useState("");
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const [pricingInfo, setPricingInfo] = useState({
    basePrice: 0,
    discountAmount: 0,
    finalPrice: 0
  });

  const isFromTrainingPage = (location.state &&
    (location.state.training_name || location.state.courseTitle)) ||
    courseTitle;

  const [formData, setFormData] = useState({
    application_for_course: "",
    application_for_course_id: "",
    course_fee: "", // Added course_fee field
    candidate_name: "",
    guardian_name: "",
    address: "",
    date_of_birth: "",
    email: "",
    password: "",
    confirm_password: "",
    mobile_no: "",
    school_college_name: "",
    highest_education: "",
    profile_photo: null,
    course_mode: "", // Added course_mode field
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [registrationDetails, setRegistrationDetails] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMaxDate(today);
  }, []);

  useEffect(() => {
    const courseName = location.state?.training_name ||
      location.state?.courseTitle ||
      courseTitle;
    if (courseName && courseData.length > 0) {
      const matchingCourse = courseData.find(course =>
        course.course_name === courseName
      );
      if (matchingCourse) {
        setFormData(prev => ({
          ...prev,
          application_for_course: courseName,
          application_for_course_id: matchingCourse.course_id
        }));
      }
    }
  }, [location.state, courseData, courseTitle]);

  useEffect(() => {
    axios
      .get("https://brainrock.in/brainrock/backend/api/course-list/")
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.courses)) {
          setCourseData(res.data.courses);

          const courseName = location.state?.training_name ||
            location.state?.courseTitle ||
            courseTitle;
          if (courseName) {
            const matchingCourse = res.data.courses.find(course =>
              course.course_name === courseName
            );
            if (matchingCourse) {
              setFormData(prev => ({
                ...prev,
                application_for_course: courseName,
                application_for_course_id: matchingCourse.course_id,
                course_fee: (matchingCourse.offer_price || "0").toString()
              }));
              setPricingInfo({
                basePrice: parseFloat(matchingCourse.offer_price || "0"),
                discountAmount: 0,
                finalPrice: parseFloat(matchingCourse.offer_price || "0")
              });
            }
          }
        }
      })
      .catch((err) => {
        setErrorMessage("Failed to load course data. Please refresh page.");
        setShowError(true);
      });
  }, [location.state, courseTitle]);

  const checkDiscountEligibility = async (phone, selectedCourseId) => {
    if (!phone || phone.length !== 10 || !selectedCourseId) {
      setDiscountApplied(false);
      setPricingInfo({ basePrice: 0, discountAmount: 0, finalPrice: 0 });
      return;
    }

    try {
      const response = await axios.get("https://brainrock.in/brainrock/backend/api/student-payment-score/");

      const studentScores = Array.isArray(response.data) ? response.data : (response.data.data || []);

      // Match logic: phone, course_id, and score strictly equals 10
      const match = studentScores.find(item => 
        String(item.phone) === String(phone) && 
        String(item.course_id) === String(selectedCourseId) && 
        Number(item.score) === 10
      );

      const selectedCourse = courseData.find(c => String(c.course_id) === String(selectedCourseId));
      if (!selectedCourse) return;

      const basePrice = parseFloat(selectedCourse.offer_price) || 0;

      if (match) {
        // Apply 20% discount on the offer price
        const discountAmount = basePrice * 0.2;
        const finalPrice = basePrice - discountAmount;

        setPricingInfo({
          basePrice,
          discountAmount,
          finalPrice
        });

        setDiscountApplied(true);
        setDiscountMessage("Offer applied successfully!");

        setFormData(prev => ({
          ...prev,
          candidate_name: match.full_name || prev.candidate_name,
          course_fee: finalPrice.toFixed(2).toString()
        }));
      } else {
        setDiscountApplied(false);
        setDiscountMessage("");
        setPricingInfo({
          // Reset to current course's base price if no discount applies
          basePrice: basePrice,
          // No discount applied
          discountAmount: 0,
          finalPrice: basePrice
        });
        // Reset fee to original if eligibility check fails
        setFormData(prev => ({ ...prev, course_fee: basePrice.toString() }));
      }
    } catch (err) {
      console.error("Error fetching student score API:", err);
      setDiscountApplied(false);
    }
  };

  const validateField = (name, value) => {
    let msg = "";

    switch (name) {
      case "candidate_name":
        if (!value.trim()) msg = "Candidate name is required";
        break;

      case "email":
        if (!value.trim()) msg = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) msg = "Invalid email format";
        break;

      case "mobile_no":
        if (!value.trim()) msg = "Mobile number is required";
        else if (!/^[0-9]{10}$/.test(value))
          msg = "Mobile number must be 10 digits";
        break;

      case "password":
        if (!value.trim()) msg = "Password is required";
        else if (value.length < 6)
          msg = "Password must be at least 6 characters long";
        break;

      case "confirm_password":
        if (!value.trim()) msg = "Confirm password is required";
        else if (value !== formData.password)
          msg = "Passwords do not match";
        break;

      case "application_for_course":
        if (!value.trim()) msg = "Please select a course";
        break;

       case "course_mode": // Added validation for course_mode
         if (!value.trim()) msg = "Please select course mode";
         break;

      case "highest_education":
        if (formData.school_college_name.trim() && !value.trim()) {
          msg = "Please select highest education";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

   const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Handle course selection differently
    if (name === "application_for_course") {
      const selectedCourse = courseData.find(course => course.course_name === value);
      const courseId = selectedCourse ? selectedCourse.course_id : "";
      const basePrice = selectedCourse ? (selectedCourse.offer_price || "0") : "";

      setFormData(prev => ({
        ...prev,
        application_for_course: value,
        application_for_course_id: courseId,
        course_fee: basePrice.toString()
      }));
      validateField(name, value);

      // Always update pricingInfo when course changes, reset discount
      setDiscountApplied(false);
      setPricingInfo({
        basePrice: parseFloat(basePrice),
        discountAmount: 0,
        finalPrice: parseFloat(basePrice)
      });
      
      if (formData.mobile_no.length === 10) {
        checkDiscountEligibility(formData.mobile_no, courseId);
      } else {
        // If mobile number is not 10 digits, ensure no discount is shown
      }

      if (onCourseChange) {
        onCourseChange(selectedCourse);
      }
    } else if (name === "mobile_no") {
      setFormData({ ...formData, [name]: value });
      validateField(name, value);
      if (value.length === 10 && formData.application_for_course_id) {
        checkDiscountEligibility(value, formData.application_for_course_id);
      } else if (discountApplied) {
        // Reset discount state if mobile number becomes invalid
        setDiscountApplied(false);
        setPricingInfo({ basePrice: 0, discountAmount: 0, finalPrice: 0 });
        // Re-evaluate base price from selected course
        const selectedCourse = courseData.find(c => String(c.course_id) === String(formData.application_for_course_id));

        if (selectedCourse) {
          const standardPrice = selectedCourse.offer_price || "0";
          setFormData(prev => ({ ...prev, course_fee: standardPrice.toString() }));
        }
      }
    } else {
      const newValue = files ? files[0] : value;
      setFormData({ ...formData, [name]: newValue });
      validateField(name, newValue);
    }
  };

  const validateFormBeforeSubmit = () => {
    let temp = {};
    let isValid = true;

    if (!formData.application_for_course) {
      temp.application_for_course = "Please select course";
      isValid = false;
    }

     if (!formData.course_mode) { // Added validation for course_mode
      temp.course_mode = "Please select course mode";
      isValid = false;
    }

    if (formData.school_college_name.trim() && !formData.highest_education) {
      temp.highest_education = "Please select highest education";
      isValid = false;
    }

    if (!formData.candidate_name) {
      temp.candidate_name = "Candidate name is required";
      isValid = false;
    }

    if (!formData.email) {
      temp.email = "Email is required";
      isValid = false;
    }

    if (!formData.mobile_no) {
      temp.mobile_no = "Mobile is required";
      isValid = false;
    }

    if (!formData.password) {
      temp.password = "Password required";
      isValid = false;
    }

    if (formData.confirm_password !== formData.password) {
      temp.confirm_password = "Passwords do not match";
      isValid = false;
    }

    if (!acceptTerms) {
      setTermsError("Please accept the terms and conditions");
      isValid = false;
    }

    setErrors(temp);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      setTermsError("Please accept the terms and conditions");
      return;
    }

    if (!validateFormBeforeSubmit()) return;

    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);

    // Create FormData for file upload
    const payload = new FormData();
    
     // Add all form fields as strings
    payload.append("candidate_name", formData.candidate_name);
    payload.append("guardian_name", formData.guardian_name);
    payload.append("address", formData.address);
    payload.append("date_of_birth", formData.date_of_birth);
    payload.append("email", formData.email);
    payload.append("password", formData.password);
    payload.append("mobile_no", formData.mobile_no);
    payload.append("school_college_name", formData.school_college_name);
    payload.append("highest_education", formData.highest_education);
    payload.append("course_status", "pending");
    payload.append("course_mode", formData.course_mode); // Added course_mode to payload
    payload.append("course_fee", formData.course_fee); // Added course_fee to payload
    
    // Add course fields as arrays
    payload.append("application_for_course", JSON.stringify([formData.application_for_course]));
    payload.append("application_for_course_id", JSON.stringify([formData.application_for_course_id]));
    
    // Add profile photo if it exists
    if (formData.profile_photo) {
      payload.append("profile_photo", formData.profile_photo);
    }

    
    try {
      const response = await axios.post(
        "https://brainrock.in/brainrock/backend/api/course-registration/",
        payload,
        { 
          headers: { 
            // Don't set Content-Type header when using FormData
            // Let browser set it automatically with boundary
          } 
        }
      );

      // Debug: Log entire response to check payment order data
      console.log("API Response:", response);
      
      // Check if payment URL is present in response
      if (response.data.payment_order && response.data.payment_order.redirectUrl) {
        // Debug: Log payment URL
        console.log("Payment URL:", response.data.payment_order.redirectUrl);
        // Redirect to payment URL on the same tab
        window.location.href = response.data.payment_order.redirectUrl;
      } else {
        // Debug: Log if payment order or redirect URL is missing
        console.warn("Payment order or redirect URL not found in response");
        console.log("Response data:", response.data);
        // Debug: Log which course was registered
        console.log("Registered Course:", formData.application_for_course);
        console.log("Course ID:", formData.application_for_course_id);
        console.log("Course Fee:", formData.course_fee);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const apiErrors = {};

        // Handle field-specific errors like email and mobile_no
        if (error.response.data.email) {
          apiErrors.email = error.response.data.email[0];
        }

        if (error.response.data.mobile_no) {
          apiErrors.mobile_no = error.response.data.mobile_no[0];
        }

        // Handle other possible error structures
        if (error.response.data.errors) {
          Object.keys(error.response.data.errors).forEach(field => {
            if (Array.isArray(error.response.data.errors[field]) && error.response.data.errors[field].length > 0) {
              apiErrors[field] = error.response.data.errors[field][0];
            }
          });
        } else if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
          setShowError(true);
        } else if (typeof error.response.data === 'string') {
          setErrorMessage(error.response.data);
          setShowError(true);
        }

        // Update errors state with API errors
        if (Object.keys(apiErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...apiErrors }));
        }
      } else {
        setErrorMessage("Registration failed. Please check your connection and try again.");
        setShowError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setShowSuccess(false);
    // Optionally redirect to another page
    // window.location.href = "/courses";
  };

  return (
    <>
      {!isFromTrainingPage && (
        <div className='TrainingRegistration-banner'>
          <div className='site-breadcrumb-wpr'>
            <h2 className='breadcrumb-title'>Our Training Registration</h2>
            <ul className='breadcrumb-menu clearfix'>
              <li>
                <Link className="breadcrumb-home" to="/">Home</Link>
              </li>

              <li className='px-2'>/</li>

              <li>
                <Link className="breadcrumb-about" to="/">Registration</Link>
              </li>
            </ul>

          </div>
        </div>
      )}
      <div className={`ourteam-section ${isFromTrainingPage ? 'no-footer' : ''}`}>
        <Container className="mt-4 mb-3">
          <div className="ourteam-box text-heading">

            {/* Loyalty Offer Header Section */}
            <div className="mb-4">
              <Button
                variant="success"
                className="br-button w-100 d-flex align-items-center justify-content-center shadow-sm mb-2"
                onClick={() => {
                  const currentCourse = courseData.find(c => c.course_name === formData.application_for_course);
                  if (currentCourse) {
                    navigate("/RegisFee", {
                      state: {
                        courseId: currentCourse.course_id || currentCourse.id,
                        courseData: {
                          id: currentCourse.id,
                          course_id: currentCourse.course_id,
                          title: currentCourse.course_name,
                          description: currentCourse.description,
                          duration: currentCourse.duration,
                          price: currentCourse.price,
                          offer_price: currentCourse.offer_price,
                          category: currentCourse.category,
                          sub_category: currentCourse.sub_category,
                        },
                      },
                    });
                  }
                }}
              >
                <FaPercentage className="me-2" /> Register & Claim 20% Loyalty Offer
              </Button>
              <div className="text-danger fw-bold text-center" style={{ fontSize: '0.85rem' }}>
                * 20% additional discount on offer price available for returning students with qualifying scores. To claim offer fill registration form with registered mobile number.
              </div>
            </div>

            <hr className="my-4" />

            {/* Enhanced Success Alert */}
            {showSuccess && (
              <Card className="mb-4 border-success success-card">
                <Card.Body className="text-center">
                  <FaCheckCircle className="text-success success-icon" />
                  <Card.Title className="text-success mt-3">Registration Successful!</Card.Title>
                  <Card.Text>
                    {registrationDetails && (
                      <div className="registration-details">
                        <p>Thank you, <strong>{registrationDetails.candidateName}</strong>!</p>
                        <p>Your registration for <strong>{registrationDetails.courseName}</strong> has been received.</p>
                        <p>We've sent a confirmation to <strong>{registrationDetails.email}</strong></p>
                        <p>Our team will contact you soon at <strong>{registrationDetails.mobile}</strong></p>
                      </div>
                    )}
                  </Card.Text>
                  <Button variant="success" onClick={handleContinue} className="mt-2">
                    Continue
                  </Button>
                </Card.Body>
              </Card>
            )}

            {showError && (
              <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                {errorMessage}
              </Alert>
            )}

            {discountApplied && (
              <Alert variant="success" className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <FaCheckCircle className="me-2" size={20} />
                  <strong style={{ fontSize: "1.1rem" }}>{discountMessage}</strong>
                </div>
                <div className="pricing-breakdown p-2 rounded bg-white bg-opacity-25" style={{ fontSize: "0.95rem" }}>
                  <Row className="mb-1">
                    <Col xs={7}>Course Price:</Col>
                    <Col xs={5} className="text-end">₹{pricingInfo.basePrice.toFixed(2)}</Col>
                  </Row>
                  <Row className="mb-1 text-success fw-bold">
                    <Col xs={7}>Loyalty Discount (20% off):</Col>
                    <Col xs={5} className="text-end">- ₹{pricingInfo.discountAmount.toFixed(2)}</Col>
                  </Row>
                  <hr className="my-2" />
                  <Row className="fw-bold" style={{ fontSize: "1.05rem" }}>
                    <Col xs={7}>Total Amount to Pay:</Col>
                    <Col xs={5} className="text-end">₹{pricingInfo.finalPrice.toFixed(2)}</Col>
                  </Row>
                </div>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                {/* COURSE */}
                <Col md={6} className="mt-3">
                  <Form.Group className="">
                    <Form.Label className="br-label">
                      Select Course <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Select
                      className={`br-form-control ${errors.application_for_course ? "is-invalid" : ""}`}
                      name="application_for_course"
                      value={formData.application_for_course}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Course --</option>
                      {courseData.map((course) => (
                        <option key={course.id} value={course.course_name}>
                          {course.course_name} ({course.duration})
                        </option>
                      ))}
                    </Form.Select>
                    {errors.application_for_course && (
                      <div className="invalid-feedback d-block">
                        {errors.application_for_course}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Mobile Number - Moved to 2nd position */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Mobile Number <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className={`br-form-control ${errors.mobile_no ? "is-invalid" : ""}`}
                      name="mobile_no"
                      value={formData.mobile_no}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                    {errors.mobile_no && (
                      <div className="invalid-feedback">
                        {errors.mobile_no}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* COURSE MODE - New field */}
                <Col md={6} className="mt-3">
                  <Form.Group className="">
                    <Form.Label className="br-label">
                      Course Mode <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Select
                      className={`br-form-control ${errors.course_mode ? "is-invalid" : ""}`}
                      name="course_mode"
                      value={formData.course_mode}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Mode --</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </Form.Select>
                    {errors.course_mode && (
                      <div className="invalid-feedback d-block">
                        {errors.course_mode}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Candidate Name */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Candidate Name <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className={`br-form-control ${errors.candidate_name ? "is-invalid" : ""}`}
                      name="candidate_name"
                      value={formData.candidate_name}
                      disabled={discountApplied}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                    {errors.candidate_name && (
                      <div className="invalid-feedback">
                        {errors.candidate_name}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Guardian Name */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Guardian Name</Form.Label>
                    <Form.Control
                      type="text"
                      className="br-form-control"
                      name="guardian_name"
                      value={formData.guardian_name}
                      onChange={handleChange}
                      placeholder="Enter your guardian name"
                    />
                  </Form.Group>
                </Col>

                {/* Address */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Address</Form.Label>
                    <Form.Control
                      type="text"
                      className="br-form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your Address"
                    />
                  </Form.Group>
                </Col>

                {/* DOB */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      className="br-form-control"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      max={maxDate}
                    />
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
                      onChange={handleChange}
                      placeholder="Enter Your Email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Password */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Password <span className="br-span-star">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        className={`br-form-control ${errors.password ? "is-invalid" : ""}`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        {errors.password}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Confirm Password */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Confirm Password <span className="br-span-star">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        className={`br-form-control ${errors.confirm_password ? "is-invalid" : ""}`}
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle-btn"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    {errors.confirm_password && (
                      <div className="invalid-feedback d-block">
                        {errors.confirm_password}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* School */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Institution/School Name (IF ANY)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="br-form-control"
                      name="school_college_name"
                      value={formData.school_college_name}
                      onChange={handleChange}
                      placeholder="Enter your Institution/School Name"
                    />
                  </Form.Group>
                </Col>

                {/* Education */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Highest Education</Form.Label>
                    <Form.Select
                      className={`br-form-control ${errors.highest_education ? "is-invalid" : ""}`}
                      name="highest_education"
                      value={formData.highest_education}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Highest Education --</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Post Graduation">Post Graduation</option>
                      <option value="Diploma">Diploma</option>
                    </Form.Select>
                    {errors.highest_education && (
                      <div className="invalid-feedback d-block">
                        {errors.highest_education}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Photo */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Upload Profile Photo</Form.Label>
                    <Form.Control
                      type="file"
                      className="br-form-control"
                      name="profile_photo"
                      onChange={handleChange}
                      accept="image/*"
                    />
                    <Form.Text className="text-muted">
                      Accepted formats: jpg, jpeg, png (Max size: 2MB)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
<Form.Group className="mt-3">
  <Form.Check
    type="checkbox"
    id="terms"
    label={
      <>
       I accept the {" "}
        <Link
          to="/Terms"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          terms and conditions
        </Link>
      </>
    }
    checked={acceptTerms}
    onChange={(e) => {
      setAcceptTerms(e.target.checked);
      setTermsError("");
    }}
  />
  {termsError && (
    <div className="text-danger mt-1">{termsError}</div>
  )}
</Form.Group>
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="px-5"
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      {" "}Registering...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </Container>

        {!isFromTrainingPage && (
          <Container fluid className="br-footer-box">
            <FooterPage />
          </Container>
        )}
      </div>

      {/* Add custom styles for the success card */}
      <style jsx>{`
        .success-card {
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
        }
        .success-icon {
          font-size: 3rem;
        }
        .registration-details {
          margin: 15px 0;
          text-align: left;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .registration-details p {
          margin-bottom: 8px;
        }
      `}</style>
    </>
  );
}

export default TrainingRegistration;