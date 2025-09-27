import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";


import "font-awesome/css/font-awesome.min.css";
import Logo from "../../assets/images/brainrock_logo.png";
// import Wecdlogo from "../../assets/images/wecdlogo.png";

import { Link } from "react-router-dom";
import "../../assets/css/NavBar.css";
import Header from "../header/Header";

function NavBar() {
  return (
    <>
      <Header />

      <Navbar
        sticky="top"
        expand="lg"
        className="bg-body-tertiary navbar-top awc-main justify-content-between"
      >
        <Container fluid className="container-fluid awc-mob-responsive">
          <Link to="/" className="logo-page">
            <img src={Logo} alt="logo" className="logo-wecd" />
          </Link>

          <div className="awc-title">
            <span className="awc-subtitle">
              <span className="br-span">Brainrock</span> Consulting Services
            </span>
            <p>I.S.O certified 9001:2015</p>
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="toggle-logo" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto justify-content-end flex-grow-1 nd-nav">
              {/* Main Navigation Items */}
              <NavDropdown title="Home" id="Home">
                <NavDropdown.Item as={Link} to="/Overview">Overview</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/WhyChooiceUs">Why Choose Us</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="About Us" id="AboutUs">
                <NavDropdown.Item href="/CompanyProfile">Company Profile</NavDropdown.Item>
                <NavDropdown.Item href="/OurTeam">Our Team</NavDropdown.Item>
                <NavDropdown.Item href="/Careers">Careers</NavDropdown.Item>
                <NavDropdown.Item href="/Partners">Partners</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Services" id="Services">
                <NavDropdown.Item href="/WebDevelopment">Web Development</NavDropdown.Item>
                <NavDropdown.Item href="/MobileAppDevelopment">Mobile App Development</NavDropdown.Item>
                <NavDropdown.Item href="/CloudSolutions">Cloud Solutions</NavDropdown.Item>
                <NavDropdown.Item href="/ITConsulting">IT Consulting</NavDropdown.Item>
                <NavDropdown.Item href="/UIUXDesign">UI/UX Design</NavDropdown.Item>
                <NavDropdown.Item href="/QATesting">QA & Testing</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Solutions" id="Solutions">
                <NavDropdown.Item href="#overview">SaaS Solutions</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">ERP Solutions</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">E-commerce Solutions</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">Custom Software</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Industries" id="Industries">
                <NavDropdown.Item href="#overview">Healthcare</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">Finance</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">Education</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">Retail</NavDropdown.Item>
              </NavDropdown>

              {/* Grouped Dropdown for Less Important Items */}
              <NavDropdown title="More" id="More">
                <NavDropdown.Item href="#courses">Courses</NavDropdown.Item>
                <NavDropdown.Item href="#programming">Programming Languages</NavDropdown.Item>
                <NavDropdown.Item href="#portfolio">Portfolio</NavDropdown.Item>
                <NavDropdown.Item href="#data-science">Data Science & AI</NavDropdown.Item>
                <NavDropdown.Item href="#others">Others</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Contact Us" id="ContactUs">
                <NavDropdown.Item href="#get-in-touch">Get in Touch</NavDropdown.Item>
                <NavDropdown.Item href="#request-quote">Request a Quote</NavDropdown.Item>
                <NavDropdown.Item href="#faqs">FAQs</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
