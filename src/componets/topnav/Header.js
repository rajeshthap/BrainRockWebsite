import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { PiSignInBold } from "react-icons/pi";
import { ImFacebook } from "react-icons/im";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import "../../assets/css/Header.css";
import { RiUser3Fill } from "react-icons/ri";

function Header() {
  const navigate = useNavigate();
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [counselingForm, setCounselingForm] = useState({
    full_name: "",
    email: "",
    mobile_number: "",
    message: "",
  });
  const [counselingLoading, setCounselingLoading] = useState(false);
  const [counselingError, setCounselingError] = useState("");
  const [counselingSuccess, setCounselingSuccess] = useState(false);

  const handleLoginClick = (e) => {
    navigate("/Login");
  };

  const handleCounselingChange = (e) => {
    const { name, value } = e.target;
    setCounselingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCounselingSubmit = async (e) => {
    e.preventDefault();
    setCounselingError("");
    setCounselingSuccess(false);

    if (!counselingForm.full_name.trim()) {
      setCounselingError("Name is required");
      return;
    }
    if (!counselingForm.email.trim()) {
      setCounselingError("Email is required");
      return;
    }
    if (!counselingForm.mobile_number.trim()) {
      setCounselingError("Phone number is required");
      return;
    }
    if (!counselingForm.message.trim()) {
      setCounselingError("Message is required");
      return;
    }

    setCounselingLoading(true);
    try {
      await axios.post(
        "https://brainrock.in/brainrock/backend/api/student-counseling/",
        counselingForm
      );
      setCounselingSuccess(true);
      setCounselingForm({
        full_name: "",
        email: "",
        mobile_number: "",
        message: "",
      });
      setTimeout(() => {
        setShowCounselingModal(false);
        setCounselingSuccess(false);
      }, 2000);
    } catch (err) {
      setCounselingError("Failed to submit. Please try again.");
    } finally {
      setCounselingLoading(false);
    }
  };

  return (
    <div>
      {/* Desktop view */}
      <div className="main-header" style={{ position: "sticky", top: 0 }}>
        <div className="header-container d-flex justify-content-between align-items-center">
          <div className="d-flex br-header">
            <p className="header-title mb-0 me-3">
              <MdOutlineMail className="br-header-icon" />
              admin@brainrock.in
            </p>
            <p className="header-subtitle mb-0">
              <MdOutlinePhoneAndroid className="br-header-icon" />
              +91-8193991148
            </p>
          </div>

          <ul className="d-flex mb-0 list-unstyled br-header">
            {/* <li className="">
              <Link to="/KheloJito" className="login-button">
                <span>Khelo aur Jeeto</span>
              </Link>{" "}
            </li> */}
            <li className="">
              <a
                href="https://brjobsedu.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="login-button"
              >
                <span>Course Login</span>
              </a>
            </li>
            <li className="">
              <button
                type="button"
                onClick={handleLoginClick}
                className="login-button "
              >
                <PiSignInBold className="br-header-icon" />
                <span>Login</span>
              </button>
            </li>
            <li className="">
              <button
                type="button"
                onClick={() => setShowCounselingModal(true)}
                className="login-button"
              >
                <RiUser3Fill className="br-header-icon" />
                <span>Counseling</span>
              </button>
            </li>
            <div className="">
              <Link
                to="https://www.facebook.com/BrainRock.in"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <ImFacebook className="br-m-left br-header-icon" />
              </Link>
              <Link
                to="https://www.instagram.com/accounts/login/?next=%2Fbrain_rockdotin%2F&source=omni_redirect"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <FaInstagram className="br-header-icon" />
              </Link>
              <Link
                to="https://x.com/brainrockdotin"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <FaTwitter className="br-header-icon" />
              </Link>
              <Link
                to="https://www.linkedin.com/in/brain-rock-377a69168/"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <FaLinkedinIn className="br-header-icon" />
              </Link>
            </div>
          </ul>
        </div>
      </div>

      {/* Mobile view */}
      <div className="main-mobile-header">
        <div className="d-flex justify-content-between align-items-center main-header">
          <ul className="d-flex mb-0 list-unstyled br-header">
            {/* <li className="">
              <Link to="/KheloJito" className="login-button">
                <span>Khelo aur Jeeto</span>
              </Link>{" "}
            </li> */}
            <li className="">
              {" "}
              <a
                href="https://brjobsedu.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="login-button"
              >
                <span>Course Login</span>
              </a>
            </li>
            <li className="">
              {" "}
              <button
                type="button"
                onClick={handleLoginClick}
                className="login-button "
              >
                <PiSignInBold className="br-header-icon" />
                <span>Login</span>
              </button>
            </li>
            <li className="">
              {" "}
              <button
                type="button"
                onClick={() => setShowCounselingModal(true)}
                className="login-button"
              >
                <RiUser3Fill className="br-header-icon" />
                <span>Counseling</span>
              </button>
            </li>
            <div className="">
              <Link
                to="https://www.facebook.com/BrainRock.in"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <ImFacebook className="br-m-left br-header-icon" />
              </Link>
              <Link
                to="https://www.instagram.com/accounts/login/?next=%2Fbrain_rockdotin%2F&source=omni_redirect"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <FaInstagram className="br-header-icon" />
              </Link>
              <Link
                to="https://x.com/brainrockdotin"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <FaTwitter className="br-header-icon" />
              </Link>
              <Link
                to="https://www.linkedin.com/in/brain-rock-377a69168/"
                target="_blank"
                rel="noopener noreferrer"
                className="br-social-link"
              >
                <FaLinkedinIn className="br-header-icon" />
              </Link>
            </div>
          </ul>
        </div>
      </div>

      {/* Counseling Modal */}
      <Modal
        show={showCounselingModal}
        onHide={() => {
          setShowCounselingModal(false);
          setCounselingError("");
          setCounselingSuccess(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Student Counseling</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {counselingSuccess ? (
            <Alert variant="success">
              Your counseling request has been submitted successfully!
            </Alert>
          ) : (
            <Form onSubmit={handleCounselingSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={counselingForm.full_name}
                  onChange={handleCounselingChange}
                  placeholder="Enter your full name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={counselingForm.email}
                  onChange={handleCounselingChange}
                  placeholder="Enter your email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile_number"
                  value={counselingForm.mobile_number}
                  onChange={handleCounselingChange}
                  placeholder="Enter your phone number"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="message"
                  value={counselingForm.message}
                  onChange={handleCounselingChange}
                  placeholder="Describe your counseling need"
                />
              </Form.Group>
              {counselingError && (
                <Alert variant="danger">{counselingError}</Alert>
              )}
              <Button
                variant="primary"
                type="submit"
                disabled={counselingLoading}
                className="w-100"
              >
                {counselingLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Header;
