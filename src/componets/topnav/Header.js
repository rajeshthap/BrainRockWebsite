import React from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { FaInstagram, FaTwitter } from "react-icons/fa";
import { PiSignInBold } from "react-icons/pi";
import { ImFacebook } from "react-icons/im";
import "../../assets/css/Header.css";
import { RiUser3Fill } from "react-icons/ri";

function Header() {
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    // Just navigate to the Login route. Avoid preventing default or stopping propagation
    // which can interfere with navigation in some layouts.
    navigate("/Login");
  };

  return (
    <div>
      {/* Desktop view */}
      <div className="main-header" style={{ position: 'sticky', top: 0 }}>
        <div className="header-container d-flex justify-content-between align-items-center">
          <div className="d-flex br-header">
            <p className="header-title mb-0 me-3">
              <MdOutlineMail className="br-header-icon" />
              info@gmail.com
            </p>
            <p className="header-subtitle mb-0">
              <MdOutlinePhoneAndroid className="br-header-icon" />
              +91 987654321
            </p>
          </div>

          <ul className="d-flex mb-0 list-unstyled br-header">
            <li className="header-item me-3">
              <RiUser3Fill className="br-header-icon" />
              Register
            </li>

            <li className="header-item">
              <button
                type="button"
                onClick={handleLoginClick}
                className="login-button d-flex align-items-center"

              >
                <PiSignInBold className="br-header-icon" />
                <span>Login</span>
              </button>
            </li>

            <ImFacebook className="br-m-left br-header-icon" />
            <FaInstagram className="br-header-icon" />
            <FaTwitter className="br-header-icon" />
          </ul>
        </div>
      </div>

      {/* Mobile view */}
      <div className="main-mobile-header">
        <div className="d-flex justify-content-between align-items-center main-header">
          <ul className="d-flex mb-0 list-unstyled br-header">
            <li className="header-item me-3">
              <RiUser3Fill className="br-header-icon" />
              Register
            </li>

            <li className="header-item">
              <button
                type="button"
                onClick={handleLoginClick}
                className="login-button d-flex align-items-center"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <PiSignInBold className="br-header-icon" />
                <span>Signin</span>
              </button>
            </li>

            <ImFacebook className="br-m-left br-header-icon" />
            <FaInstagram className="br-header-icon" />
            <FaTwitter className="br-header-icon" />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Header;