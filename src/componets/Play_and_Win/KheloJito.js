import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../assets/css/KheloJito.css';
import axios from 'axios';
import FooterPage from '../footer/FooterPage';


function KheloJito() {
  // State to hold the form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    fee: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    validateField(name, value);
  };

  // Validation for form fields
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

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  // Validate entire form before submission
  const validateFormBeforeSubmit = () => {
    let temp = {};
    let isValid = true;

    if (!formData.full_name) {
      temp.full_name = "Full name is required";
      isValid = false;
    }

    if (!formData.email) {
      temp.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      temp.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.phone) {
      temp.phone = "Phone number is required";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      temp.phone = "Phone number must be 10 digits";
      isValid = false;
    }

    setErrors(temp);
    return isValid;
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormBeforeSubmit()) return;

    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      const response = await axios.post(
        'https://brainrock.in/brainrock/backend/api/register-test/',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Registration successful:', response.data);
      console.log('User ID:', response.data.data.user_id);
      
      // Store user_id in localStorage for Test component to retrieve
      localStorage.setItem('test_user_id', response.data.data.user_id);
      
      // Clear form
      setFormData({ full_name: '', email: '', phone: '', fee: 1 });
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect to test page after a short delay
      setTimeout(() => {
        navigate('/test');
      }, 2000);
    } catch (error) {
      console.error('Error during registration:', error);
      
      if (error.response && error.response.data) {
        const apiErrors = {};

        if (error.response.data.email) {
          apiErrors.email = error.response.data.email[0];
        }

        if (error.response.data.phone) {
          apiErrors.phone = error.response.data.phone[0];
        }

        if (Object.keys(apiErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...apiErrors }));
        } else if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
          setShowError(true);
        } else if (typeof error.response.data === 'string') {
          setErrorMessage(error.response.data);
          setShowError(true);
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
    <>
      {/* Banner Section */}
      <div className='KheloJito-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Khelo aur Jito</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li>
              <Link className="breadcrumb-home" to="/">Home</Link>
            </li>
            <li className='px-2'>/</li>
            <li>
              <Link className="breadcrumb-about" to="/">Khelo aur Jito</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className='khelojito-section'>
        <Container className="mt-4 mb-3">
          <div className="khelojito-box text-heading">
            
            {/* Success Alert */}
            {showSuccess && (
              <Card className="mb-4 border-success success-card">
                <Card.Body className="text-center">
                  <Card.Title className="text-success mt-3">Registration Successful!</Card.Title>
                  <Card.Text>
                    Thank you for registering! You will be redirected to the test page shortly.
                  </Card.Text>
                </Card.Body>
              </Card>
            )}

            {/* Error Alert */}
            {showError && (
              <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                {errorMessage}
              </Alert>
            )}

            {/* Registration Form */}
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
                      className={`br-form-control ${errors.full_name ? "is-invalid" : ""}`}
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback">
                        {errors.full_name}
                      </div>
                    )}
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
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Phone Number */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">
                      Phone Number <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      className={`br-form-control ${errors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">
                        {errors.phone}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Fee */}
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label className="br-label">Fee</Form.Label>
                    <Form.Control
                      type="number"
                      className="br-form-control"
                      name="fee"
                      disabled
                      value={formData.fee}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                {/* Submit Button */}
                <Col md={12} className="mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="br-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </div>

 
    </>
  );
}

export default KheloJito;
