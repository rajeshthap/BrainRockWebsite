import React, { useState } from "react";
import { Container } from "react-bootstrap";
import "../../../assets/css/ContactForm.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  // live validation
  const validateField = (name, value) => {
    let error = "";

    if (!value.trim()) {
      error = "* This field is required";
    } else {
      if (name === "email" && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        error = "* Invalid email format";
      }
      if (name === "phone" && !/^[0-9]{10}$/.test(value)) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "* This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert("Form Submitted Successfully!");
  };

  return (
    <div className="ourteam-section">
      <Container>
        <div className="ourteam-box">
          <div className="contact-container text-heading text-center">

       <h3>Get In Touch For Any Query</h3>

            <div className="contact-wrapper">

              {/* LEFT INFO SECTION */}
              <div className="contact-left">
                <div className="info-box">
                  <div className="icon">📍</div>
                  <h4>Our Head Office</h4>
                  <p>32, New Park Road Gandhi Gram, Kanwali Road Dehradun</p>
                </div>

                <div className="info-box">
                  <div className="icon">📞</div>
                  <h4>Call for Help</h4>
                  <p>+091-8193991148</p>
                </div>

                <div className="info-box">
                  <div className="icon">📧</div>
                  <h4>Email for Information</h4>
                  <p>info.brainrock@gmail.com</p>
                </div>
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
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}

                  <input
                    type="text"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error-input" : ""}
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}

                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter Mobile No"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error-input" : ""}
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}

                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? "error-input" : ""}
                  />
                  {errors.subject && <p className="error-text">{errors.subject}</p>}

                  <textarea
                    name="message"
                    placeholder="Message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? "error-input" : ""}
                  ></textarea>
                  {errors.message && <p className="error-text">{errors.message}</p>}

                  <button className="send-btn" type="submit">
                    Send Message
                  </button>

                </form>
              </div>

            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Contact;
