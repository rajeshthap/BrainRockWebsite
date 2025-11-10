import React from "react";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { FaInstagram, FaTwitter } from "react-icons/fa";
import { PiSignInBold } from "react-icons/pi";
import { ImFacebook } from "react-icons/im";
import "../../assets/css/Header.css";
import { RiUser3Fill } from "react-icons/ri";
import { Link } from "react-router-dom";


function Header() {
  return (
    <div>
      {/* //desktop view */}
      <div className="main-header " sticky="top">
        <div className="header-container d-flex justify-content-between align-items-center">
          <div className="d-flex br-header ">
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
             <Link to="/HrDashBoard">  <PiSignInBold className="br-header-icon" />
            Login</Link> 
            </li>
            <ImFacebook className="br-m-left br-header-icon" />
            <FaInstagram className="br-header-icon" />
            <FaTwitter className="br-header-icon" />
            {/* //mobile view */}
          </ul>
        </div>
      </div>

      {/* //mobile view */}
      <div className="main-mobile-header">
        {/* <div className="d-flex justify-content-between align-items-center main-header ">
          <p className="header-title mb-0 me-3">
            <MdOutlineMail className="br-header-icon" />
            info@gmail.com
          </p>
          <p className="header-subtitle mb-0">
            <MdOutlinePhoneAndroid className="br-header-icon" />
            +91 987654321
          </p>
        </div> */}
        <div className="d-flex justify-content-between align-items-center main-header">
          <ul className="d-flex mb-0 list-unstyled br-header  ">
            <li className="header-item me-3">
              <RiUser3Fill className="br-header-icon" />
              Register
            </li>
            <li className="header-item">
              <PiSignInBold className="br-header-icon" />
              Signin
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
