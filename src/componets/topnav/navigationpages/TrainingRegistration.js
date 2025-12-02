import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/Trainingregistration.css";

function TrainingRegistration() {
  const [courseData, setCourseData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxDate, setMaxDate] = useState(""); // For DOB max date (today)

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

  // Set max date for DOB to today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMaxDate(today);
  }, []);

  // FETCH COURSES
  useEffect(() => {
    axios
      .get("https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-list/")
      .then((res) => {
        if (res.data && Array.isArray(res.data.courses)) {
          setCourseData(res.data.courses);
        }
      })
      .catch((err) => console.error("Course list error:", err));
  }, []);

  // LIVE VALIDATION
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
  };

  // INPUT CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setFormData({ ...formData, [name]: newValue });
    validateField(name, newValue);
  };

  // CATEGORY CHANGE
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);

    setFormData({
      ...formData,
      application_for_course: "",
    });

    // Clear both category and application_for_course errors
    setErrors((prev) => ({ 
      ...prev, 
      application_for_course: "",
      category: "" 
    }));
  };

  // FINAL VALIDATION BEFORE SUBMIT
  const validateFormBeforeSubmit = () => {
    let temp = {};

    if (!selectedCategory) temp.category = "Please select category";
    if (!formData.application_for_course)
      temp.application_for_course = "Please select course";

    if (!formData.candidate_name)
      temp.candidate_name = "Candidate name is required";

    if (!formData.email) temp.email = "Email is required";

    if (!formData.mobile_no) temp.mobile_no = "Mobile is required";

    if (!formData.password) temp.password = "Password required";

    if (formData.confirm_password !== formData.password)
      temp.confirm_password = "Passwords do not match";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormBeforeSubmit()) return;

    const payload = new FormData();
    for (const key in formData) {
      payload.append(key, formData[key]);
    }
    payload.append("category", selectedCategory);

    try {
      const response = await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(" Registration Successful!");

      // RESET FORM
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
    } catch (error) {
      console.error("Registration Error:", error);
      
      // Handle API errors for duplicate email/phone
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = {};
        
        // Check for email already exists error
        if (error.response.data.errors.email && Array.isArray(error.response.data.errors.email)) {
          apiErrors.email = "Email already exists. Please use a different email.";
        }
        
        // Check for phone already exists error
        if (error.response.data.errors.mobile_no && Array.isArray(error.response.data.errors.mobile_no)) {
          apiErrors.mobile_no = "Mobile number already exists. Please use a different number.";
        }
        
        // Update errors state with API errors
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
          <h3 className="text-center mb-3">Training Registration</h3>

          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>

              {/* CATEGORY */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="br-label">Select training<span className="br-span-star">*</span></Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="br-form-control"
                  >
                    <option value="">-- Select training --</option>
                    {courseData.map((item) => (
                      <option key={item.id} value={item.category}>
                        {item.category}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="br-alert">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* COURSE */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="br-label">Select Course <span className="br-span-star">*</span></Form.Label>
                  <Form.Select
                    className="br-form-control"
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
                   <Form.Control.Feedback type="br-alert">
                    {errors.application_for_course}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Candidate Name */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">Candidate Name <span className="br-span-star">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    className="br-form-control"
                    name="candidate_name"
                    value={formData.candidate_name} placeholder="Enter your name"
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.candidate_name}
                  </Form.Control.Feedback>
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
                    onChange={handleChange} placeholder="Enter your guardian name "
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
                    onChange={handleChange} placeholder="Enter your Address"
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
                    max={maxDate} // Prevent future dates
                  />
                </Form.Group>
              </Col>

              {/* Email */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">Email <span className="br-span-star">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    className="br-form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange} placeholder="Enter Your Email"
                  
                  />
                   <Form.Control.Feedback type="br-alert">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Password */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">Password <span className="br-span-star">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    className="br-form-control"
                    name="password"
                    value={formData.password} placeholder="enter your Password"
                    onChange={handleChange}
                
                  />
                   <Form.Control.Feedback type="br-alert">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Confirm Password */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">Confirm Password <span className="br-span-star">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm_password"
                    className="br-form-control"
                    value={formData.confirm_password}
                    onChange={handleChange} placeholder="Enter your confirm Password"
                    isInvalid={!!errors.confirm_password}
                  />
                   <Form.Control.Feedback type="br-alert">
                    {errors.confirm_password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Mobile */}
              <Col md={6} className="mt-3">
                <Form.Group>
                  <Form.Label className="br-label">Mobile Number <span className="br-span-star">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    className="br-form-control"
                    name="mobile_no"
                    value={formData.mobile_no} placeholder="Enter your phone number"
                    onChange={handleChange}
                  
                  />
                   <Form.Control.Feedback type="br-alert">
                    {errors.mobile_no}
                  </Form.Control.Feedback>
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
                    onChange={handleChange} placeholder="Enter your collage name"
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
                    name="highest_education" placeholder="Enter your highest education"
                    value={formData.highest_education}
                    onChange={handleChange}
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
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center">
              <Button type="submit" className="mt-4" variant="primary">
                Register Now
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default TrainingRegistration;