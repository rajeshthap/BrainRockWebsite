import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "../../../assets/css/Trainingregistration.css";

const TrainingRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const refs = {
    training_name: useRef(null),
    training_description: useRef(null),
    candidate_name: useRef(null),
    candidate_email: useRef(null),
    candidate_phone: useRef(null),
    Date_of_Birth: useRef(null),
    Gender: useRef(null),
    password: useRef(null),
    confirm_password: useRef(null),
    photo: useRef(null),
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    training_name: stateTrainingName,
    training_description: stateTrainingDescription,
  } = location.state || {};

  const [formData, setFormData] = useState({
    training_name: "",
    training_description: "",
    training_date: "",
    training_duration: "6 months",
    candidate_name: "",
    candidate_email: "",
    candidate_phone: "",
    Date_of_Birth: "",
    Gender: "",
    password: "",
    confirm_password: "",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      training_date: today,
      training_name: stateTrainingName || prev.training_name,
      training_description:
        stateTrainingDescription || prev.training_description,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "candidate_phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrorMessages((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, photo: file });
  };

  const validateForm = () => {
    const errors = {};
    const {
      candidate_name,
      candidate_email,
      candidate_phone,
      training_name,
      training_description,
      Date_of_Birth,
      Gender,
      password,
      confirm_password,
      photo,
    } = formData;

    if (!training_name) errors.training_name = "Select training.";
    if (!training_description || training_description.length < 10)
      errors.training_description = "Description min 10 characters.";
    if (!candidate_name || !/^[A-Za-z\s]+$/.test(candidate_name))
      errors.candidate_name = "Name must contain only letters.";
    if (
      !candidate_email ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(candidate_email)
    )
      errors.candidate_email = "Enter a valid email.";
    if (!candidate_phone || candidate_phone.length !== 10)
      errors.candidate_phone = "Phone must be 10 digits.";
    if (!Date_of_Birth) errors.Date_of_Birth = "Date of Birth required.";
    if (!Gender) errors.Gender = "Gender required.";
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!password || !passwordPattern.test(password))
      errors.password =
        "Password must contain uppercase, lowercase, number & special char.";
    if (confirm_password !== password)
      errors.confirm_password = "Passwords do not match.";
    if (!photo) errors.photo = "Photo is required.";

    setErrorMessages(errors);

    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && refs[firstErrorField]?.current) {
      refs[firstErrorField].current.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const generateTrainingId = (trainingName, phone) => {
    if (!trainingName || !phone) return "";
    const prefix = trainingName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 3);
    const uniqueSuffix = phone.slice(-4);
    const randomPart = Math.floor(100 + Math.random() * 900);
    return `${prefix}_${uniqueSuffix}_${randomPart}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validateForm()) return;

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const emailExists = registeredUsers.some(
      (u) =>
        u.candidate_email === formData.candidate_email &&
        u.training_name === formData.training_name
    );
    const phoneExists = registeredUsers.some(
      (u) =>
        u.candidate_phone === formData.candidate_phone &&
        u.training_name === formData.training_name
    );

    if (emailExists) {
      setErrorMessages({
        candidate_email: "This email is already registered for this training!",
      });
      refs.candidate_email.current.focus();
      return;
    }
    if (phoneExists) {
      setErrorMessages({
        candidate_phone: "This phone is already registered for this training!",
      });
      refs.candidate_phone.current.focus();
      return;
    }

    setLoading(true);

    try {
      const currentTrainingId = generateTrainingId(
        formData.training_name,
        formData.candidate_phone
      );

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) payload.append(key, formData[key]);
      });
      payload.append("Training_id", currentTrainingId);

      // --- Now registration API will also handle OTP ---
     const registerResponse = await axios.post("https://your-api-endpoint.com/training", payload);

      if (!registerResponse || registerResponse.error) {
        const ertrain = localStorage.getItem("errortraining");
        if (ertrain) {
          alert("This Email Already Exist. use Diffrent Email ID.");
          navigate("/UserLogin")
        } else {
          alert(
            "Email is already in use. Please try logging in or use a different email."
          );
          navigate("/UserLogin");
        }
        return;
      }

      // Save user locally only on success
      registeredUsers.push({
        candidate_email: formData.candidate_email,
        candidate_phone: formData.candidate_phone,
        training_name: formData.training_name,
        training_id: currentTrainingId,
      });

      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      localStorage.setItem("candidate_phone", formData.candidate_phone);

      alert("Training registration successful! OTP sent.");
      navigate("/TrainingOtpVerify", {
        replace: true,
        state: {
          candidate_phone: formData.candidate_phone,
          training_id: currentTrainingId,
        },
      });
    } catch (error) {
      console.error(error);
      setErrorMsg(error.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="training-registration-container">
      <div className="registration-wrapper">
        <Row className="justify-content-center h-100">
          <Col md={10} lg={8} className="d-flex align-items-center">
            <Card className="registration-card w-100">
              <div className="card-header-custom">
                <h4 className="text-center mb-0">Training Registration</h4>
              </div>
              
              <div className="card-body-custom">
                {successMsg && <Alert variant="success" className="mt-3">{successMsg}</Alert>}
                {errorMsg && <Alert variant="danger" className="mt-3">{errorMsg}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Training Name */}
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Training Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={refs.training_name}
                      name="training_name"
                      value={formData.training_name}
                      onChange={handleChange}
                      isInvalid={!!errorMessages.training_name}
                      required
                      className="br-form-control"
                    >
                      <option value="">-- Select Training --</option>
                      <option value="React Training">React Training</option>
                      <option value="Python Training Program">
                        Python Training
                      </option>
                      <option value="PHP Training">PHP Training</option>
                      <option value="MySQL Training">MySQL Training</option>
                      <option value="HTML, CSS & Bootstrap Training">
                        HTML, CSS & Bootstrap Training
                      </option>
                      <option value="Web Development Training">
                        Web Development Training
                      </option>
                      <option value="UI/UX Designer Training">
                        UI/UX Designer Training
                      </option>
                      <option value="Communication Skills Training">
                        Communication Skills Training
                      </option>
                      <option value="Self-Confidence & Power Dressing Training">
                        Self-Confidence & Power Dressing Training
                      </option>
                      <option value="Interview Skills Training Program Outline">
                        Interview Skills Training Program Outline
                      </option>
                      <option value="Public Speaking Training">
                        Public Speaking Training
                      </option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errorMessages.training_name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Training Description */}
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Training Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="training_description"
                      value={formData.training_description}
                      ref={refs.training_description}
                      onChange={handleChange}
                      isInvalid={!!errorMessages.training_description}
                      required
                      className="br-form-control"
                      placeholder="Provide a brief description of the training..."
                    />
                    <Form.Control.Feedback type="invalid">
                      {errorMessages.training_description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    {/* Training Date */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">
                          Training Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="training_date"
                          value={formData.training_date}
                          onChange={handleChange}
                          disabled
                          className="br-form-control disabled-input"
                        />
                      </Form.Group>
                    </Col>

                    {/* Training Duration */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">
                          Training Duration
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="training_duration"
                          value={formData.training_duration}
                          onChange={handleChange}
                          disabled
                          className="br-form-control disabled-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Candidate Name */}
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Name<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="candidate_name"
                      value={formData.candidate_name}
                      onChange={handleChange}
                      isInvalid={!!errorMessages.candidate_name}
                      required
                      className="br-form-control"
                      placeholder="Enter your full name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errorMessages.candidate_name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    {/* Candidate Email */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">
                          Email<span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          ref={refs.candidate_email}
                          type="email"
                          name="candidate_email"
                          value={formData.candidate_email}
                          onChange={handleChange}
                          isInvalid={!!errorMessages.candidate_email}
                          required
                          className="br-form-control"
                          placeholder="your.email@example.com"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorMessages.candidate_email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Candidate Phone */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">
                          Phone<span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="candidate_phone"
                          ref={refs.candidate_phone}
                          value={formData.candidate_phone}
                          onChange={handleChange}
                          placeholder="10-digit phone"
                          isInvalid={!!errorMessages.candidate_phone}
                          required
                          className="br-form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorMessages.candidate_phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* Date of Birth */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">
                          Date of Birth<span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="Date_of_Birth"
                          value={formData.Date_of_Birth}
                          onChange={handleChange}
                          isInvalid={!!errorMessages.Date_of_Birth}
                          ref={refs.Date_of_Birth}
                          required
                          className="br-form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errorMessages.Date_of_Birth}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Gender */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">
                          Gender<span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex gap-3 mt-2">
                          <Form.Check
                            type="radio"
                            label="Male"
                            name="Gender"
                            value="male"
                            checked={formData.Gender === "male"}
                            onChange={handleChange}
                            required
                            className="custom-radio"
                          />
                          <Form.Check
                            type="radio"
                            label="Female"
                            name="Gender"
                            value="female"
                            checked={formData.Gender === "female"}
                            onChange={handleChange}
                            className="custom-radio"
                          />
                        </div>
                        {errorMessages.Gender && (
                          <div className="text-danger mt-1">{errorMessages.Gender}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* Password */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="br-label">
                          Password<span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errorMessages.password}
                            required
                            ref={refs.password}
                            className="br-form-control"
                            placeholder="Enter password"
                          />
                          <InputGroup.Text
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </InputGroup.Text>
                          <Form.Control.Feedback type="invalid">
                            {errorMessages.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                        {errorMessages.password && (
                          <div className="text-danger mt-1">{errorMessages.password}</div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Confirm Password */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="br-label">
                          Confirm Password<span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirm_password"
                            value={formData.confirm_password}
                            ref={refs.confirm_password}
                            onChange={handleChange}
                            isInvalid={!!errorMessages.confirm_password}
                            required
                            className="br-form-control"
                            placeholder="Confirm password"
                          />
                          <InputGroup.Text
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="password-toggle"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </InputGroup.Text>
                          <Form.Control.Feedback type="invalid">
                            {errorMessages.confirm_password}
                          </Form.Control.Feedback>
                        </InputGroup>
                        {errorMessages.confirm_password && (
                          <div className="text-danger mt-1">
                            {errorMessages.confirm_password}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Photo */}
                  <Form.Group className="mb-4">
                    <Form.Label className="br-label">
                      Upload Photo<span className="text-danger">*</span>
                    </Form.Label>
                    {formData.photo && (
                      <div className="text-center mb-3">
                        <img
                          src={
                            formData.photo instanceof File
                              ? URL.createObjectURL(formData.photo)
                              : formData.photo
                          }
                          alt="Preview"
                          className="photo-preview"
                        />
                      </div>
                    )}
                    <div className="custom-file-upload">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        isInvalid={!!errorMessages.photo}
                        required
                        className="br-form-control"
                        id="photo-upload"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errorMessages.photo}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <div className="text-center mt-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                      className="submit-btn"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" /> Submitting...
                        </>
                      ) : (
                        "Pay Now"
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TrainingRegistration;