import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { PiSignInBold } from "react-icons/pi";
import { ImFacebook } from "react-icons/im";
import "../../assets/css/Header.css";
import { RiUser3Fill } from "react-icons/ri";
import { AuthContext } from "../context/AuthContext";


function Header() {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  const handleLoginClick = (e) => {
    navigate("/Login");
  };

  // If auth is still loading, don't render anything yet
  if (loading) {
    return null;
  }

  // If user is logged in (has user_id), don't show the header
  if (user && user.unique_id) {
    return null;
  }

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
            <li className="">
              <Link to="/KheloJito" className="login-button">
                <span>Khelo aur Jeeto</span>
              </Link>{" "}
            </li>
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
            <li className="">
              <Link to="/KheloJito" className="login-button">
                <span>Khelo aur Jeeto</span>
              </Link>{" "}
            </li>
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
    </div>
  );
}

export default Header;