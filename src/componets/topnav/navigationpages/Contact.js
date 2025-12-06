import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import "../../../assets/css/ContactForm.css";
import FooterPage from "../../footer/FooterPage";
import { Link } from "react-router-dom";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // State for company details
  const [companyDetails, setCompanyDetails] = useState({
    address: "",
    email: "",
    phone: ""
  });
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  // Fetch company details on component mount
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/company-details/');

        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }

        const result = await response.json();

        // Handle the actual API response format
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the data array
          const companyInfo = result.data[0];

          setCompanyDetails({
            address: companyInfo.address,
            email: companyInfo.email,
            phone: companyInfo.phone
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        setDetailsError(error.message);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  // live validation
  const validateField = (name, value) => {
    let error = "";

    if (!value.trim()) {
      error = "* This field is required";
    } else {
      if (name === "email" && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        error = "* Invalid email format";
      }
      if (name === "phone" && !/^[0-9]{10}$/.test(value.replace(/[^0-9]/g, ''))) {
        error = "* Enter valid 10 digit mobile no";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    validateField(name, value); // LIVE validation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowAlert(false);

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "* This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const apiData = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone.startsWith('+') ? formData.phone : `+91-${formData.phone}`,
        subject: formData.subject,
        message: formData.message
      };

      // Send data to API
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/contact-us/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();

      // Show success message
      setApiResponse({
        success: true,
        message: "Your message has been sent successfully!"
      });
      setShowAlert(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setApiResponse({
        success: false,
        message: "Failed to send your message. Please try again later."
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='contact'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Get In Touch For Any Query</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li>
              <Link className="breadcrumb-home" to="/">Home</Link>
            </li>

            <li className='px-2'>/</li>

            <li>
              <Link className="breadcrumb-about" to="/">FeedBack</Link>
            </li>
          </ul>

        </div>
      </div>
      <div className="ourteam-section">
        <Container>
          <div className="ourteam-box mt-4 mb-3">
            <div className="contact-container text-heading text-center">


              {/* Alert for API response */}
              {showAlert && apiResponse && (
                <Alert
                  variant={apiResponse.success ? "success" : "danger"}
                  className="mb-4"
                  onClose={() => setShowAlert(false)}
                  dismissible
                >
                  {apiResponse.message}
                </Alert>
              )}

              <div className="contact-wrapper">
                {/* LEFT INFO SECTION */}
                <div className="contact-left">
                  {detailsLoading ? (
                    <div className="info-box">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : detailsError ? (
                    <div className="info-box">
                      <div className="icon">⚠️</div>
                      <h4>Error</h4>
                      <p>{detailsError}</p>
                    </div>
                  ) : (
                    <>
                      <div className="info-box">
                        <div className="icon">📍</div>
                        <h4>Our Head Office</h4>
                        <p>{companyDetails.address}</p>
                      </div>

                      <div className="info-box">
                        <div className="icon">📞</div>
                        <h4>Call for Help</h4>
                        <p>{companyDetails.phone}</p>
                      </div>

                      <div className="info-box">
                        <div className="icon">📧</div>
                        <h4>Email for Information</h4>
                        <p>{companyDetails.email}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* RIGHT FORM SECTION */}
                <div className="contact-right">
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "error-input" : ""}
                      disabled={loading}
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}

                    <input
                      type="text"
                      name="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error-input" : ""}
                      disabled={loading}
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter Mobile No"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error-input" : ""}
                      disabled={loading}
                    />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}

                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? "error-input" : ""}
                      disabled={loading}
                    />
                    {errors.subject && <p className="error-text">{errors.subject}</p>}

                    <textarea
                      name="message"
                      placeholder="Message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? "error-input" : ""}
                      disabled={loading}
                    ></textarea>
                    {errors.message && <p className="error-text">{errors.message}</p>}

                    <button className="send-btn" type="submit" disabled={loading}>
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Container>
        <Container fluid className="br-footer-box">

          <FooterPage />
        </Container>
      </div>
    </>
  );
}

export default Contact;