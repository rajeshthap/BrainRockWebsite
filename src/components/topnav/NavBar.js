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
        className="bg-body-tertiary navbar-top awc-main  justify-content-between"
      >
        <Container fluid className="container-fluid awc-mob-responsive">
          <Link to="/" className="logo-page">
            <img src={Logo} alt="logo" className="logo-wecd" />
          </Link>
          {/* <Link to="/" className="logo-page">
            <img src={Logo} alt="logo" className="logo1" />
          </Link> */}

          <div className="awc-title">
            <span className="awc-subtitle">
              <span className="br-span">Brainrock</span> Consulting Services
            </span>
            <p>I.S.O certified 9001:2015</p>
          </div>
          <Link to="../Home" className="logo-page"></Link>
          <Navbar.Brand
            href="#home"
            className="ml-4 navbar-title"
          ></Navbar.Brand>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="toggle-logo"
          />
          <Navbar.Collapse id="basic-navbar-nav ">
            <Nav className="me-auto justify-content-end flex-grow-1 nd-nav">
              {/* <Nav.Link href="/LoginBanner" className="nav-sub-list">
                Nodel Officer/Admin Login
              </Nav.Link> */}

              <NavDropdown title="Home" id="Home">
                <NavDropdown.Item Link to="#">
                  Overview
                </NavDropdown.Item>
                <NavDropdown.Item Link to="#">
                  Why Choose Us
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="About Us" id="AboutUs">
                <NavDropdown.Item href="#overview">
                  Company Profile
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Our Team
                </NavDropdown.Item>

                <NavDropdown.Item href="#why-choose-us">
                  Careers
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Partners
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Services" id="Services">
                <NavDropdown.Item href="#overview">
                  Web Development
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Mobile App Development
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Cloud Solutions
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  IT Consulting
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  UI/UX Design
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  {" "}
                  QA & Testing
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Solutions" id="Solutions">
                <NavDropdown.Item href="#overview">
                  SaaS Solutions
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  ERP Solutions
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  E-commerce Solutions
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Custom Software
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Industries" id="Industries">
                <NavDropdown.Item href="#overview">Healthcare</NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Finance
                </NavDropdown.Item>

                <NavDropdown.Item href="#why-choose-us">
                  Education
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Retail
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Courses" id="Courses">
                <NavDropdown.Item href="Web Development">
                  Web Development
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  –HTML, CSS & JavaScript{" "}
                </NavDropdown.Item>

                <NavDropdown.Item href="#why-choose-us">
                  –Full Stack Development (MERN / MEAN)
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Programming Languages" id="Courses">
                <NavDropdown.Item href="–Python Programming">
                  Programming Languages
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Java Programming{" "}
                </NavDropdown.Item>

                <NavDropdown.Item href="#why-choose-us">
                  C / C++ Programming
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title=" Portfolio" id="Cloud">
                <NavDropdown.Item href="Python Programming">
                  Case Studies
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Client Stories
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Contact Us" id="Cloud">
                <NavDropdown.Item href="Python Programming">
                  Get in Touch
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Request a Quote
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">FAQs </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Data Science & AI" id="Cloud">
                <NavDropdown.Item href="Python Programming">
                  Data Analysis with Python
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Machine Learning
                </NavDropdown.Item>

                <NavDropdown.Item href="#why-choose-us">
                  Artificial Intelligence Basics
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Others" id="Cloud">
                <NavDropdown.Item href="Python Programming">
                  Digital Marketing
                </NavDropdown.Item>
                <NavDropdown.Item href="#why-choose-us">
                  Software Testing (Manual & Automation)
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
