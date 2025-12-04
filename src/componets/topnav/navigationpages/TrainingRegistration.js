import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "../../../assets/css/Trainingregistration.css";
import FooterPage from "../../footer/FooterPage";

function TrainingRegistration({ courseTitle, courseDuration }) {
  const location = useLocation();
  const [courseData, setCourseData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxDate, setMaxDate] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const isFromTrainingPage = (location.state && 
    (location.state.training_name || location.state.courseTitle)) || 
    courseTitle; 

  const [formData, setFormData] = useState({
    application_for_course: "",
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
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMaxDate(today);
  }, []);

  useEffect(() => {
    const courseName = location.state?.training_name || 
                      location.state?.courseTitle || 
                      courseTitle; 
    if (courseName) {
      setFormData(prev => ({
        ...prev,
        application_for_course: courseName
      }));
      
      if (courseData.length > 0) {
        const matchingCategory = courseData.find(cat => 
          cat.courses.includes(courseName)
        );
        if (matchingCategory) {
          setSelectedCategory(matchingCategory.category);
        }
      }
    }
  }, [location.state, courseData, courseTitle]); 
  useEffect(() => {
    axios
      .get("https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-list/")
      .then((res) => {
        if (res.data && Array.isArray(res.data.courses)) {
          setCourseData(res.data.courses);
          
          const courseName = location.state?.training_name || 
                            location.state?.courseTitle || 
                            courseTitle;
          if (courseName) {
            const matchingCategory = res.data.courses.find(cat => 
              cat.courses.includes(courseName)
            );
            if (matchingCategory) {
              setSelectedCategory(matchingCategory.category);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Course list error:", err);
        setErrorMessage("Failed to load course data. Please refresh the page.");
        setShowError(true);
      });
  }, [location.state, courseTitle]);

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

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setFormData({ ...formData, [name]: newValue });
    validateField(name, newValue);
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);

    setFormData({
      ...formData,
      application_for_course: "",
    });

    setErrors((prev) => ({ 
      ...prev, 
      application_for_course: "",
      category: "" 
    }));
  };

  const validateFormBeforeSubmit = () => {
    let temp = {};
    let isValid = true;

    if (!selectedCategory) {
      temp.category = "Please select category";
      isValid = false;
    }
    
    if (!formData.application_for_course) {
      temp.application_for_course = "Please select course";
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

    setErrors(temp);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormBeforeSubmit()) return;

    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);

    const payload = new FormData();
    for (const key in formData) {
      payload.append(key, formData[key]);
    }
    payload.append("category", selectedCategory);

    console.log("Submitting form data:");
    for (let [key, value] of payload.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccessMsg("Registration Successful!");
      setShowSuccess(true);
      
      setFormData({
        application_for_course: "",
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
      });

      setSelectedCategory("");
      setErrors({});
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Registration Error:", error);
      
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        console.log("Error response headers:", error.response.headers);
      }
      
      if (error.response && error.response.data) {
        const apiErrors = {};
        
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
        } else {
          // Unknown structure
          setErrorMessage("Registration failed. Please try again.");
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

  return (
    <div className={`ourteam-section ${isFromTrainingPage ? 'no-footer' : ''}`}>
      <Container className="mt-4">
        <div className="ourteam-box text-heading">
          <h3 className="text-center mb-3">Training Registration</h3>

          {showSuccess && (
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
              {successMsg}
            </Alert>
          )}

          {showError && (
            <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
              {errorMessage}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* CATEGORY */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="br-label">
                    Select training<span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className={`br-form-control ${errors.category ? "is-invalid" : ""}`}
                  >
                    <option value="">-- Select training --</option>
                    {courseData.map((item) => (
                      <option key={item.id} value={item.category}>
                        {item.category}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.category && (
                    <div className="invalid-feedback d-block">
                      {errors.category}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* COURSE */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="br-label">
                    Select Course <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Select
                    className={`br-form-control ${errors.application_for_course ? "is-invalid" : ""}`}
                    name="application_for_course"
                    value={formData.application_for_course}
                    onChange={handleChange}
                    disabled={!selectedCategory}
                  >
                    <option value="">-- Select Course --</option>

                    {selectedCategory &&
                      courseData
                        .find((c) => c.category === selectedCategory)
                        ?.courses.map((course, index) => (
                          <option key={index} value={course}>
                            {course}
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
                  <Form.Control
                    type="password"
                    className={`br-form-control ${errors.password ? "is-invalid" : ""}`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
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
                  <Form.Control
                    type="password"
                    name="confirm_password"
                    className={`br-form-control ${errors.confirm_password ? "is-invalid" : ""}`}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  {errors.confirm_password && (
                    <div className="invalid-feedback">
                      {errors.confirm_password}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Mobile */}
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

              {/* School */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">
                    School / College Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="br-form-control"
                    name="school_college_name"
                    value={formData.school_college_name}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                  />
                </Form.Group>
              </Col>

              {/* Education */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">Highest Education</Form.Label>
                  <Form.Control
                    type="text"
                    className="br-form-control"
                    name="highest_education"
                    value={formData.highest_education}
                    onChange={handleChange}
                    placeholder="Enter your highest education"
                  />
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
  );
}

export default TrainingRegistration;