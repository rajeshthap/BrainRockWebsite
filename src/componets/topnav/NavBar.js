import React from "react";
import { Container, Nav, Navbar, NavDropdown, NavLink } from "react-bootstrap";
import Logo from "../../assets/images/brainrock_logo.png";
// import Wecdlogo from "../../assets/images/wecdlogo.png";

import { Link } from "react-router-dom";
import "../../assets/css/NavBar.css";
import Header from "./Header";

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
            <p className="sub-awc-title">I.S.O certified 9001:2015</p>
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="toggle-logo" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto justify-content-end flex-grow-1 nd-nav">
              {/* Main Navigation Items */}
                 <Nav.Link href="Home">Home</Nav.Link>
                <NavDropdown title="About Us" id="AboutUs">
                <NavDropdown.Item as={Link} to="/CompanyProfile">Company Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/OurTeam">Our Team</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Careers">Careers</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Partners">Partners</NavDropdown.Item>
              </NavDropdown>
             <Nav.Link href="Services">Services</Nav.Link>
             <Nav.Link href="Courses">Courses</Nav.Link>
             <Nav.Link href="Gallery">Gallery</Nav.Link>
             <Nav.Link href="Feedback">Feedback</Nav.Link>
             <Nav.Link href="TrainingRegistration">Registration</Nav.Link>
             <Nav.Link href="Training">Training </Nav.Link>
           
 <Nav.Link href="/Contact">Contact Us</Nav.Link>
             
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
